-- Vex verdict-first beta: ideas, anonymous runs, sharing, assumptions,
-- rate limits, price-intent test, analytics and admin role.

-- 1. Accept any valid email at signup (drops the gmail/yahoo/outlook rule).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_checkin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_checkin_sent_at timestamptz;

-- 2. Admin role (assigned manually in the database, never from the client).
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 3. Ideas. Anonymous runs have user_id NULL and are only reachable through
-- edge functions using a claim token; nothing is publicly readable by table.
CREATE TABLE IF NOT EXISTS public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  idea text NOT NULL CHECK (char_length(idea) BETWEEN 1 AND 1500),
  audience text CHECK (audience IS NULL OR char_length(audience) <= 200),
  input_hash text NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('PROCEED', 'PIVOT', 'KILL')),
  overall_score numeric(3,1) NOT NULL CHECK (overall_score BETWEEN 0 AND 10),
  result jsonb NOT NULL,
  full_report jsonb,
  full_report_at timestamptz,
  technical_founder boolean,
  claim_token_hash text,
  claim_email text,
  share_id text UNIQUE,
  shared_at timestamptz,
  share_image_url text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ideas_user_idx ON public.ideas (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ideas_claim_email_idx ON public.ideas (claim_email) WHERE user_id IS NULL;

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their ideas" ON public.ideas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners delete their ideas" ON public.ideas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Inserts and updates go through edge functions (service role) so scores,
-- sharing and report generation cannot be forged from the browser.

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public share summary: only the fields on the share card.
CREATE OR REPLACE FUNCTION public.get_public_verdict(_share_id text)
RETURNS TABLE (idea_short text, verdict text, overall_score numeric, one_liner text, confidence text, image_url text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    CASE WHEN char_length(i.idea) > 80 THEN left(i.idea, 77) || '...' ELSE i.idea END,
    i.verdict, i.overall_score, i.result->>'one_liner', i.result->>'confidence',
    i.share_image_url, i.shared_at
  FROM public.ideas i
  WHERE i.share_id = _share_id AND i.share_id IS NOT NULL
$$;
GRANT EXECUTE ON FUNCTION public.get_public_verdict(text) TO anon, authenticated;

-- Sample report: the single idea an admin marked as the sample.
CREATE OR REPLACE FUNCTION public.get_sample_report()
RETURNS TABLE (id uuid, idea text, audience text, result jsonb, full_report jsonb, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT i.id, i.idea, i.audience, i.result, i.full_report, i.created_at
  FROM public.ideas i WHERE i.is_sample ORDER BY i.updated_at DESC LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.get_sample_report() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_sample_idea(_idea_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  UPDATE public.ideas SET is_sample = false WHERE is_sample;
  UPDATE public.ideas SET is_sample = true WHERE id = _idea_id AND user_id = auth.uid();
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_sample_idea(uuid) TO authenticated;

-- 4. Assumptions checklist per idea.
CREATE TABLE IF NOT EXISTS public.assumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 300),
  source text NOT NULL DEFAULT 'custom' CHECK (source IN ('risk', 'custom')),
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assumptions_idea_idx ON public.assumptions (idea_id, created_at);
ALTER TABLE public.assumptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read assumptions" ON public.assumptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners add assumptions" ON public.assumptions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.ideas i WHERE i.id = idea_id AND i.user_id = auth.uid())
  );
CREATE POLICY "Owners update assumptions" ON public.assumptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete assumptions" ON public.assumptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Server-side rate limits and the 24h result cache (service role only).
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, day)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomically increments every key and returns false (without counting) if
-- any key is already at its limit.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(_keys text[], _limits integer[])
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'utc')::date;
  i integer;
  current_count integer;
BEGIN
  FOR i IN 1 .. array_length(_keys, 1) LOOP
    INSERT INTO public.rate_limits (key, day, count) VALUES (_keys[i], today, 0)
    ON CONFLICT (key, day) DO NOTHING;
    SELECT count INTO current_count FROM public.rate_limits
      WHERE key = _keys[i] AND day = today FOR UPDATE;
    IF current_count >= _limits[i] THEN
      RETURN false;
    END IF;
  END LOOP;
  UPDATE public.rate_limits SET count = count + 1 WHERE key = ANY(_keys) AND day = today;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text[], integer[]) FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.verdict_cache (
  input_hash text PRIMARY KEY,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verdict_cache ENABLE ROW LEVEL SECURITY;

-- 6. Fake-door pricing answers. Insert-only from the browser.
CREATE TABLE IF NOT EXISTS public.price_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer text NOT NULL CHECK (answer IN ('yes', 'maybe', 'no')),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 500),
  visitor_id text NOT NULL CHECK (char_length(visitor_id) BETWEEN 8 AND 64),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.price_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a price answer" ON public.price_intents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 7. Anonymous product analytics. Insert-only, fixed event names, no payload.
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event text NOT NULL CHECK (event IN (
    'page_view', 'idea_submitted', 'verdict_shown', 'share_card_downloaded',
    'share_link_copied', 'email_submitted', 'full_report_requested',
    'full_report_viewed', 'price_intent_yes', 'price_intent_maybe',
    'price_intent_no', 'idea_tracker_created', 'return_visit_7d'
  )),
  visitor_id text NOT NULL CHECK (char_length(visitor_id) BETWEEN 8 AND 64),
  path text CHECK (path IS NULL OR char_length(path) <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON public.analytics_events (event, created_at);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record an event" ON public.analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admin funnel: event counts (total and unique visitors) plus price comments.
CREATE OR REPLACE FUNCTION public.admin_event_counts(_since timestamptz DEFAULT now() - interval '30 days')
RETURNS TABLE (event text, total bigint, visitors bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN QUERY
    SELECT e.event, count(*)::bigint, count(DISTINCT e.visitor_id)::bigint
    FROM public.analytics_events e
    WHERE e.created_at >= _since
    GROUP BY e.event;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_event_counts(timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_price_comments(_since timestamptz DEFAULT now() - interval '30 days')
RETURNS TABLE (answer text, comment text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN QUERY
    SELECT p.answer, p.comment, p.created_at FROM public.price_intents p
    WHERE p.created_at >= _since AND p.comment IS NOT NULL
    ORDER BY p.created_at DESC LIMIT 200;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_price_comments(timestamptz) TO authenticated;

-- Gives back one unit when a run fails after the limit was taken.
CREATE OR REPLACE FUNCTION public.refund_rate_limit(_keys text[])
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.rate_limits SET count = greatest(count - 1, 0)
  WHERE key = ANY(_keys) AND day = (now() AT TIME ZONE 'utc')::date
$$;
REVOKE EXECUTE ON FUNCTION public.refund_rate_limit(text[]) FROM PUBLIC, anon, authenticated;

-- 8. Public bucket for opt-in share preview images (written by edge functions only).
-- Created separately via storage configuration (bucket rows are not allowed in migrations):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('share-images', 'share-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- 9. Daily cleanup, called by the weekly-checkin job: unclaimed free runs
-- after 30 days, expired cache rows and old rate-limit counters.
CREATE OR REPLACE FUNCTION public.cleanup_stale_data()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  DELETE FROM public.ideas WHERE user_id IS NULL AND NOT is_sample AND created_at < now() - interval '30 days';
  DELETE FROM public.verdict_cache WHERE created_at < now() - interval '24 hours';
  DELETE FROM public.rate_limits WHERE day < (now() AT TIME ZONE 'utc')::date - 7;
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_data() FROM PUBLIC, anon, authenticated;

-- 10. Explicit grants (row-level security still decides which rows).
REVOKE ALL ON public.ideas, public.assumptions, public.rate_limits, public.verdict_cache,
  public.price_intents, public.analytics_events, public.user_roles FROM anon, authenticated;
GRANT SELECT, DELETE ON public.ideas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assumptions TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT ON public.price_intents, public.analytics_events TO anon, authenticated;
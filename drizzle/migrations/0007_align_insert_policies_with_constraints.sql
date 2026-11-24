-- Align the new insert policy predicates with the existing table CHECK
-- constraints (visitor_id 8-64 chars, path <= 100 chars).

DROP POLICY IF EXISTS "Anyone can record a valid event" ON public.analytics_events;
CREATE POLICY "Anyone can record a valid event"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event IN (
    'page_view',
    'idea_submitted',
    'verdict_shown',
    'share_card_downloaded',
    'share_link_copied',
    'email_submitted',
    'full_report_requested',
    'full_report_viewed',
    'price_intent_yes',
    'price_intent_maybe',
    'price_intent_no',
    'idea_tracker_created',
    'return_visit_7d'
  )
  AND length(visitor_id) BETWEEN 8 AND 64
  AND (path IS NULL OR length(path) <= 100)
);

DROP POLICY IF EXISTS "Anyone can record a valid price answer" ON public.price_intents;
CREATE POLICY "Anyone can record a valid price answer"
ON public.price_intents
FOR INSERT
TO anon, authenticated
WITH CHECK (
  answer IN ('yes', 'maybe', 'no')
  AND length(visitor_id) BETWEEN 8 AND 64
  AND (comment IS NULL OR length(comment) <= 500)
);
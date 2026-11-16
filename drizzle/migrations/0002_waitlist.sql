-- Waitlist signups, rate limiting and anonymous page events. Events use their own
-- table (waitlist_events) so they never clash with the app's analytics_events.
-- Every table has RLS on and no policies, so the browser (anon / authenticated roles)
-- can neither read nor write them. Only the `waitlist` edge function, using the
-- service role, touches these tables.

create extension if not exists pgcrypto;

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 254),
  idea_note text check (char_length(idea_note) <= 500),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  ref text check (char_length(ref) <= 100),
  followup_token_hash text,
  created_at timestamptz not null default now()
);

create unique index waitlist_email_lower_key on public.waitlist (lower(email));
create index waitlist_followup_token_idx on public.waitlist (followup_token_hash);

create table public.waitlist_rate_limit (
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index waitlist_rate_limit_lookup_idx on public.waitlist_rate_limit (ip_hash, created_at);

create table public.waitlist_events (
  id bigint generated always as identity primary key,
  name text not null check (name in (
    'waitlist_view',
    'waitlist_submitted',
    'waitlist_duplicate',
    'waitlist_followup_sent',
    'waitlist_example_next'
  )),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  ref text check (char_length(ref) <= 100),
  created_at timestamptz not null default now()
);

create index waitlist_events_name_idx on public.waitlist_events (name, created_at);

alter table public.waitlist enable row level security;
alter table public.waitlist_rate_limit enable row level security;
alter table public.waitlist_events enable row level security;

revoke all on public.waitlist from anon, authenticated;
revoke all on public.waitlist_rate_limit from anon, authenticated;
revoke all on public.waitlist_events from anon, authenticated;

-- For an admin view. Not exposed to the browser.
create view public.waitlist_stats
with (security_invoker = true) as
select
  coalesce(utm_source, '(direct)') as utm_source,
  count(*) filter (where name = 'waitlist_view') as views,
  count(*) filter (where name = 'waitlist_submitted') as signups,
  round(
    100.0 * count(*) filter (where name = 'waitlist_submitted')
      / nullif(count(*) filter (where name = 'waitlist_view'), 0),
    2
  ) as conversion_pct
from public.waitlist_events
group by 1;

revoke all on public.waitlist_stats from anon, authenticated;


-- Admin page: per-source funnel and totals. Admins only (has_role comes from the
-- verdict-beta migration).
create or replace function public.admin_waitlist_stats(_since timestamptz default now() - interval '30 days')
returns table (utm_source text, views bigint, signups bigint, duplicates bigint, notes bigint)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  return query
    select coalesce(e.utm_source, '(direct)'),
      count(*) filter (where e.name = 'waitlist_view'),
      count(*) filter (where e.name = 'waitlist_submitted'),
      count(*) filter (where e.name = 'waitlist_duplicate'),
      count(*) filter (where e.name = 'waitlist_followup_sent')
    from public.waitlist_events e
    where e.created_at >= _since
    group by 1
    order by 3 desc;
end;
$$;
grant execute on function public.admin_waitlist_stats(timestamptz) to authenticated;

create or replace function public.admin_waitlist_total()
returns bigint
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  return (select count(*) from public.waitlist);
end;
$$;
grant execute on function public.admin_waitlist_total() to authenticated;
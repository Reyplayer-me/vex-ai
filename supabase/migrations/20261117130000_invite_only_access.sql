-- Invite-only beta: only admins and people whose waitlist email an admin has
-- approved can run Vex. Access needs a verified email on the account, so nobody
-- can claim an approved address by signing up with it first.

alter table public.waitlist add column if not exists approved_at timestamptz;

-- Used by edge functions (service role) before any AI work.
create or replace function public.has_app_access(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.has_role(_user_id, 'admin') or exists (
    select 1
    from auth.users u
    join public.waitlist w on lower(w.email) = lower(u.email)
    where u.id = _user_id
      and u.email_confirmed_at is not null
      and w.approved_at is not null
  );
$$;
revoke execute on function public.has_app_access(uuid) from public, anon, authenticated;

-- Lets the signed-in browser ask about itself only.
create or replace function public.my_app_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and public.has_app_access(auth.uid());
$$;
revoke execute on function public.my_app_access() from public, anon;
grant execute on function public.my_app_access() to authenticated;

-- Admin page: waitlist entries with their approval state.
create or replace function public.admin_waitlist_entries(_status text default 'pending', _search text default '')
returns table (email text, created_at timestamptz, utm_source text, idea_note text, approved_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  return query
    select w.email, w.created_at, w.utm_source, w.idea_note, w.approved_at
    from public.waitlist w
    where (_status = 'all'
        or (_status = 'pending' and w.approved_at is null)
        or (_status = 'approved' and w.approved_at is not null))
      and (coalesce(_search, '') = '' or w.email ilike '%' || _search || '%')
    order by w.created_at desc
    limit 200;
end;
$$;
grant execute on function public.admin_waitlist_entries(text, text) to authenticated;

-- Approve or remove access for an email. Approving an address that isn't on the
-- waitlist adds it, so admins can let people in directly.
create or replace function public.admin_set_access(_email text, _approved boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  clean text := lower(trim(_email));
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  if clean !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or char_length(clean) > 254 then
    raise exception 'invalid email';
  end if;
  if _approved then
    insert into public.waitlist (email, approved_at, utm_source)
    values (clean, now(), 'admin')
    on conflict ((lower(email))) do update set approved_at = coalesce(public.waitlist.approved_at, now());
  else
    update public.waitlist set approved_at = null where lower(email) = clean;
  end if;
end;
$$;
grant execute on function public.admin_set_access(text, boolean) to authenticated;

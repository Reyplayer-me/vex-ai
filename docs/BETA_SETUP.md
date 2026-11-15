# Vex verdict-first beta: setup checklist

The code on branch `vex-verdict-beta` needs these steps in Lovable before it works end to end.
Nothing here needs code changes.

## 1. Apply the database migration
`supabase/migrations/20261115120000_vex_verdict_beta.sql` creates `ideas`, `assumptions`,
`rate_limits`, `verdict_cache`, `price_intents`, `analytics_events`, `user_roles`, the
`share-images` storage bucket and the RPC functions. It also removes the Gmail/Yahoo/Outlook-only
signup rule. In Lovable, ask: "Apply the migration in supabase/migrations/20261115120000_vex_verdict_beta.sql".
Afterwards Lovable regenerates `src/integrations/supabase/types.ts`.

Then apply `supabase/migrations/20261115130000_waitlist.sql` for the waitlist at `/waitlist`. It
must run after the migration above, because its admin stats use the admin role.

## 2. Add secrets (Lovable → Cloud → Secrets)
| Secret | Needed for | Notes |
|---|---|---|
| `TAVILY_API_KEY` | Competitor, pricing and regulatory search | From tavily.com. Without it every result says "competitors unverified" with low confidence. |
| `IP_HASH_SALT` | Rate limiting | Any long random string. Keeps hashed IPs unlinkable. |
| `CRON_SECRET` | Daily job | Any long random string. |
| `RESEND_API_KEY`, `CHECKIN_FROM_EMAIL` | Weekly check-in emails | Optional. Needs a domain you own verified in Resend. Until set, the job only runs the cleanup. |
| `SITE_URL` | Links in emails | Defaults to https://vex-ai.lovable.app |
| `WAITLIST_IP_SALT` | Waitlist spam limit (5 signups per hour per IP) | Any long random string. |
| `WAITLIST_ALLOWED_ORIGIN` | Waitlist CORS | `https://vex-ai.lovable.app`. Defaults to any origin. |

`LOVABLE_API_KEY` already exists.

## 3. Auth settings
- Add these to the allowed redirect URLs: `https://vex-ai.lovable.app/idea/*`, `https://vex-ai.lovable.app/auth*` (and your custom domain if you add one).
- Email sign-in links (magic links) must be enabled. They are on by default.

## 4. Make yourself an admin
After signing in once, run in the SQL editor (replace the email):
```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR_EMAIL' on conflict do nothing;
```
Then open `/admin` for the funnel and the waitlist stats (total signups, and views → signups by
`utm_source`). Use links like `https://vex-ai.lovable.app/waitlist?utm_source=tiktok` so each
channel shows up separately. Waitlist emails and counts are never shown publicly.

## 5. Generate the sample report
On `/admin`, use "Generate and publish sample" with a made-up idea. It runs the real pipeline and
publishes the result at `/sample`. Until you do, `/sample` tells visitors to run their own idea.

## 6. Schedule the daily job
In the SQL editor (needs `pg_cron` and `pg_net`, both available on Lovable Cloud):
```sql
select cron.schedule('vex-daily', '0 9 * * *', $$
  select net.http_post(
    url := 'https://hztnebliunorgyshravd.supabase.co/functions/v1/weekly-checkin',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'YOUR_CRON_SECRET'),
    body := '{}'::jsonb);
$$);
```
It deletes unclaimed free runs after 30 days (as the privacy page promises) and sends weekly
check-ins to people who opted in.

## 7. Optional
- **Contact email:** set in `src/lib/contact.ts`. Visitors see "support@vex"; the link opens an email
  to the inbox address there.
- **Waitlist mock:** for local development only, `VITE_WAITLIST_MOCK=true` in `.env.development.local`
  fakes the waitlist backend. An email ending in `@fail.test` then shows the server-error state.
- **"Edit with Lovable" badge:** Project settings → hide badge (paid plans only). It's not in the code.
- **Default link preview image:** `index.html` still uses Lovable's default `og:image`. Replace it
  with a 1200×630 Vex image in `public/`.

## Known limits
- **Per-result link previews.** `/r/:id` sets Open Graph tags with JavaScript. Crawlers that don't
  run JavaScript (iMessage, WhatsApp, TikTok, Slack) see the site-wide tags from `index.html`.
  Per-result previews need server rendering, for example a Cloudflare Worker in front of the site
  that injects tags for `/r/*` using `get_public_verdict`. The 1200×630 image is already generated
  and stored for each shared result, ready for that.
- **Rate limits.** Anonymous: 3 runs per day per hashed IP + browser id, and 15 per day per hashed IP
  (so clearing the browser doesn't reset it, while people behind one mobile-carrier IP still get
  room). Signed in: 10 runs and 3 full reports per day. All in UTC.
- **Old flow.** The old dashboard, onboarding, validate, boardroom, build-plan and launch-strategy
  pages now redirect to My ideas. Their edge functions and the `validation_sessions` and
  `boardroom_messages` tables are untouched and can be removed later.

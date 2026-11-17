# Message to paste into Lovable

Paste everything below the line into the Lovable chat for this project.

---

The frontend calls backend functions and tables that aren't deployed yet, so every idea run fails. Please set up the backend from the code already in the repo, without changing any app code:

1. Run these SQL migrations against the database, in this order, exactly as written in the files:
   - `supabase/migrations/20261115120000_vex_verdict_beta.sql`
   - `supabase/migrations/20261115130000_waitlist.sql`
   - `supabase/migrations/20261115140000_owner_admin.sql`
2. Deploy these edge functions from `supabase/functions` (they use the shared code in `supabase/functions/_shared`), with JWT verification off as set in `supabase/config.toml`: `quick-verdict`, `full-report`, `idea-actions`, `weekly-checkin`, `waitlist`.
3. Ask me to add these secrets: `TAVILY_API_KEY`, `IP_HASH_SALT`, `CRON_SECRET`, `WAITLIST_IP_SALT`, `WAITLIST_ALLOWED_ORIGIN` (value: `https://vex-ai.lovable.app`).
4. Then regenerate the Supabase types.

When it's done, confirm that each function answers at `/functions/v1/<name>` and that the tables `ideas`, `analytics_events`, `price_intents` and `waitlist` exist.

---

## Update: sample rotation (17 Nov 2026)

Paste this into Lovable:

Please run the new SQL migration `supabase/migrations/20261117120000_sample_rotation.sql` against the database exactly as written, then regenerate the Supabase types. Don't change any app code. It lets several sample reports be published at once: `set_sample_idea` gets an optional `_on` argument and no longer unpublishes the others, and `get_sample_report` returns every published sample.

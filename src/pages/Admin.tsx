import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { db, requestFullReport, runQuickVerdict, VexApiError } from "@/lib/vex-api";
import type { VexEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const FUNNEL: VexEvent[] = [
  "page_view",
  "idea_submitted",
  "verdict_shown",
  "share_card_downloaded",
  "share_link_copied",
  "email_submitted",
  "full_report_requested",
  "full_report_viewed",
  "idea_tracker_created",
  "price_intent_yes",
  "price_intent_maybe",
  "price_intent_no",
  "return_visit_7d",
];

const RANGES = [
  { days: 1, label: "24h" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

type Counts = Record<string, { total: number; visitors: number }>;

const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "–");

interface WaitlistRow {
  utm_source: string;
  views: number;
  signups: number;
  duplicates: number;
  notes: number;
}

const WaitlistStats = ({ days }: { days: number }) => {
  const [rows, setRows] = useState<WaitlistRow[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const since = new Date(Date.now() - days * 24 * 3600_000).toISOString();
    Promise.all([db.rpc("admin_waitlist_stats", { _since: since }), db.rpc("admin_waitlist_total")]).then(([stats, count]) => {
      if (stats.error || count.error) {
        setError(true);
        return;
      }
      setError(false);
      setRows(stats.data ?? []);
      setTotal(Number(count.data));
    });
  }, [days]);

  const sum = (key: keyof Omit<WaitlistRow, "utm_source">) => (rows ?? []).reduce((n, r) => n + Number(r[key]), 0);

  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">Waitlist</h2>
      {error && <p className="text-sm text-muted-foreground">Waitlist stats aren't available. Has the waitlist migration been applied?</p>}
      {!error && rows && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <p className="text-sm text-muted-foreground">People on the waitlist (all time)</p>
              <p className="font-orbitron text-3xl font-bold text-foreground">{total}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <p className="text-sm text-muted-foreground">Page view → signup</p>
              <p className="font-orbitron text-3xl font-bold text-foreground">{pct(sum("signups"), sum("views"))}</p>
              <p className="text-xs text-muted-foreground">
                {sum("signups")} signups from {sum("views")} views
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-left text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Source</th>
                  <th className="p-3 text-right font-medium">Views</th>
                  <th className="p-3 text-right font-medium">Signups</th>
                  <th className="p-3 text-right font-medium">Rate</th>
                  <th className="p-3 text-right font-medium">Ideas left</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr className="border-t border-border">
                    <td colSpan={5} className="p-3 text-muted-foreground">No waitlist activity in this range.</td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.utm_source} className="border-t border-border">
                    <td className="p-3 font-mono text-xs text-foreground sm:text-sm">{r.utm_source}</td>
                    <td className="p-3 text-right tabular-nums text-foreground">{r.views}</td>
                    <td className="p-3 text-right tabular-nums text-foreground">{r.signups}</td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">{pct(Number(r.signups), Number(r.views))}</td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Source comes from utm_source on the link (for example ?utm_source=tiktok). Duplicate signups aren't counted as signups.
          </p>
        </>
      )}
    </section>
  );
};

interface AccessRow {
  email: string;
  created_at: string;
  utm_source: string | null;
  idea_note: string | null;
  approved_at: string | null;
}

const ACCESS_FILTERS = [
  { id: "pending", label: "Waiting" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All" },
] as const;

// Invite-only beta: approve waitlist emails. An approved person signs in with that
// email (once it's verified) and can use Vex.
const WaitlistAccess = () => {
  const [filter, setFilter] = useState<(typeof ACCESS_FILTERS)[number]["id"]>("pending");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AccessRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [log, setLog] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db.rpc("admin_waitlist_entries", { _status: filter, _search: search.trim() });
    if (error) {
      setLog("Couldn't load the waitlist. Has the invite-only migration been applied?");
      setRows([]);
      return;
    }
    setRows(data ?? []);
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setAccess = async (email: string, approved: boolean) => {
    setBusy(email);
    setLog(null);
    const { error } = await db.rpc("admin_set_access", { _email: email, _approved: approved });
    setBusy(null);
    if (error) {
      setLog(error.message.includes("invalid email") ? "That email doesn't look right." : "That didn't work. Please try again.");
      return false;
    }
    setLog(approved ? `${email} can now use Vex once they sign in with that email.` : `${email} no longer has access.`);
    load();
    return true;
  };

  const addEmail = async (e: FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (await setAccess(email, true)) setNewEmail("");
  };

  return (
    <section className="mt-10">
      <h2 className="mb-1 font-sans text-lg font-semibold text-foreground">Who can use Vex</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Vex is invite-only. Approve an email and that person can run ideas after signing in with it. Approving doesn't
        send an email, so let them know yourself.
      </p>

      <form onSubmit={addEmail} className="mb-5 flex flex-wrap gap-2">
        <label htmlFor="approve-email" className="sr-only">Email to approve</label>
        <Input
          id="approve-email"
          type="email"
          inputMode="email"
          autoComplete="off"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Approve any email directly"
          className="h-11 min-w-0 flex-1 basis-56 text-base"
        />
        <Button type="submit" variant="cta" className="h-11" disabled={!newEmail.trim() || busy !== null}>
          Approve
        </Button>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
          {ACCESS_FILTERS.map((f) => (
            <Button
              key={f.id}
              variant="outline"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn("h-11", filter === f.id && "border-purple bg-purple/20")}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <label htmlFor="access-search" className="sr-only">Search emails</label>
        <Input
          id="access-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emails"
          className="h-11 min-w-0 flex-1 basis-48 text-base"
        />
      </div>

      {log && <p className="mb-3 text-sm text-foreground" role="status">{log}</p>}

      {rows === null && <Loader2 className="h-5 w-5 animate-spin text-purple" aria-label="Loading" />}
      {rows && rows.length === 0 && <p className="text-sm text-muted-foreground">No one here yet.</p>}
      {rows && rows.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {rows.map((r) => (
            <li key={r.email} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1 basis-56">
                <p className="break-all text-sm font-medium text-foreground">{r.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(r.created_at).toLocaleDateString()}
                  {r.utm_source ? ` · ${r.utm_source}` : ""}
                  {r.approved_at ? ` · approved ${new Date(r.approved_at).toLocaleDateString()}` : ""}
                </p>
                {r.idea_note && <p className="mt-1 text-sm text-muted-foreground">“{r.idea_note}”</p>}
              </div>
              <Button
                size="sm"
                variant={r.approved_at ? "outline" : "cta"}
                onClick={() => setAccess(r.email, !r.approved_at)}
                disabled={busy === r.email}
                className="h-10 shrink-0"
              >
                {busy === r.email && <Loader2 className="animate-spin" aria-hidden />}
                {r.approved_at ? "Remove access" : "Approve"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

interface SampleRow {
  id: string;
  idea: string;
  verdict: string;
  overall_score: number;
  is_sample: boolean;
}

const SampleGenerator = () => {
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [log, setLog] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<SampleRow[] | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // The admin's own ideas that have a full report: the ones that can be samples.
  const loadRows = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await db
      .from("ideas")
      .select("id, idea, verdict, overall_score, is_sample")
      .eq("user_id", auth.user.id)
      .not("full_report", "is", null)
      .order("created_at", { ascending: false })
      .limit(30);
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const toggle = async (row: SampleRow) => {
    setToggling(row.id);
    const { error } = await db.rpc("set_sample_idea", { _idea_id: row.id, _on: !row.is_sample });
    setToggling(null);
    if (error) {
      setLog("Couldn't change that sample. Has the sample rotation migration been applied?");
      return;
    }
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, is_sample: !r.is_sample } : r)) ?? null);
  };

  const run = async () => {
    setBusy(true);
    try {
      setLog("Running the free verdict...");
      const r = await runQuickVerdict(idea.trim(), audience.trim(), (s) => setLog(`Running the free verdict: ${s}...`));
      setLog("Writing the full report...");
      await requestFullReport(r.id, false);
      const { error } = await db.rpc("set_sample_idea", { _idea_id: r.id });
      if (error) throw new Error("set_sample_idea failed");
      setLog("Done. It's now in the /sample rotation.");
      loadRows();
    } catch (err) {
      setLog(err instanceof VexApiError ? err.message : "That didn't work. Check the function logs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 rounded-xl border border-border bg-card/60 p-5">
      <h2 className="mb-1 font-sans text-lg font-semibold text-foreground">Sample report</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Runs the real pipeline on a sample idea (counts against your daily limits) and adds it to the rotation at{" "}
        <Link to="/sample" className="underline">/sample</Link>. Choose an idea that isn't yours to keep private.
      </p>
      <Textarea value={idea} onChange={(e) => setIdea(e.target.value.slice(0, 1500))} rows={3} placeholder="Sample idea" className="mb-2 text-base" />
      <Input value={audience} onChange={(e) => setAudience(e.target.value.slice(0, 200))} placeholder="Who it's for (optional)" className="mb-3 h-11 text-base" />
      <Button variant="cta" onClick={run} disabled={busy || idea.trim().length < 15} className="h-11">
        {busy && <Loader2 className="animate-spin" aria-hidden />} Generate and publish sample
      </Button>
      {log && <p className="mt-3 text-sm text-foreground" role="status">{log}</p>}

      {rows && rows.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Your reports</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Published ones rotate on /sample: each visit shows the next. {rows.filter((r) => r.is_sample).length} published.
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{r.idea}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.verdict} · {Number(r.overall_score).toFixed(1)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={r.is_sample ? "secondary" : "outline"}
                  onClick={() => toggle(r)}
                  disabled={toggling === r.id}
                  aria-pressed={r.is_sample}
                  className="h-10 shrink-0"
                >
                  {toggling === r.id && <Loader2 className="animate-spin" aria-hidden />}
                  {r.is_sample ? "Published" : "Publish"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [days, setDays] = useState(7);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [comments, setComments] = useState<{ answer: string; comment: string; created_at: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/auth?mode=login&next=/admin", { replace: true });
        return;
      }
      // Display gate only; the database functions enforce the admin role.
      const { data: roles } = await db.from("user_roles").select("role").eq("role", "admin");
      setAllowed(!!roles?.length);
    });
  }, [navigate]);

  const load = useCallback(async () => {
    setError(null);
    const since = new Date(Date.now() - days * 24 * 3600_000).toISOString();
    const [events, notes] = await Promise.all([
      db.rpc("admin_event_counts", { _since: since }),
      db.rpc("admin_price_comments", { _since: since }),
    ]);
    if (events.error) {
      setError("Couldn't load events.");
      return;
    }
    const next: Counts = {};
    for (const row of events.data ?? []) next[row.event] = { total: Number(row.total), visitors: Number(row.visitors) };
    setCounts(next);
    setComments(notes.data ?? []);
  }, [days]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  const c = (e: VexEvent) => counts?.[e] ?? { total: 0, visitors: 0 };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Funnel</h1>
        {allowed === null && <Loader2 className="h-6 w-6 animate-spin text-purple" aria-label="Loading" />}
        {allowed === false && <p className="text-muted-foreground">This page is for Vex admins only.</p>}
        {allowed && (
          <>
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <Button key={r.days} variant="outline" aria-pressed={days === r.days} onClick={() => setDays(r.days)} className={cn("h-11", days === r.days && "border-purple bg-purple/20")}>
                  {r.label}
                </Button>
              ))}
            </div>
            {error && <p role="alert" className="mb-4 text-sm text-verdict-kill">{error}</p>}

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cta/40 bg-card/60 p-5">
                <p className="text-sm text-muted-foreground">Idea submitted → email submitted (visitors)</p>
                <p className="font-orbitron text-3xl font-bold text-foreground">{pct(c("email_submitted").visitors, c("idea_submitted").visitors)}</p>
                <p className="text-xs text-muted-foreground">
                  {c("email_submitted").visitors} of {c("idea_submitted").visitors} visitors
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <p className="text-sm text-muted-foreground">Same, by event count</p>
                <p className="font-orbitron text-3xl font-bold text-foreground">{pct(c("email_submitted").total, c("idea_submitted").total)}</p>
                <p className="text-xs text-muted-foreground">
                  {c("email_submitted").total} of {c("idea_submitted").total} events
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card text-left text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Event</th>
                    <th className="p-3 text-right font-medium">Count</th>
                    <th className="p-3 text-right font-medium">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {FUNNEL.map((e) => (
                    <tr key={e} className="border-t border-border">
                      <td className="p-3 font-mono text-xs text-foreground sm:text-sm">{e}</td>
                      <td className="p-3 text-right tabular-nums text-foreground">{c(e).total}</td>
                      <td className="p-3 text-right tabular-nums text-muted-foreground">{c(e).visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Visitors are random browser ids. People who declined cookies get a new id each session, so visitor counts run slightly high.
            </p>

            <section className="mt-10">
              <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">Price comments</h2>
              {comments.length === 0 && <p className="text-sm text-muted-foreground">None in this range.</p>}
              <ul className="space-y-2">
                {comments.map((n, i) => (
                  <li key={i} className="rounded-lg border border-border bg-card/40 p-3 text-sm">
                    <span className="mr-2 font-semibold uppercase text-foreground">{n.answer}</span>
                    <span className="text-foreground">{n.comment}</span>
                  </li>
                ))}
              </ul>
            </section>

            <WaitlistAccess />

            <WaitlistStats days={days} />

            <SampleGenerator />
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;

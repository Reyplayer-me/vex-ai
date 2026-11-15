import { useCallback, useEffect, useState } from "react";
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

const SampleGenerator = () => {
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [log, setLog] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      setLog("Running the free verdict...");
      const r = await runQuickVerdict(idea.trim(), audience.trim(), (s) => setLog(`Running the free verdict: ${s}...`));
      setLog("Writing the full report...");
      await requestFullReport(r.id, false);
      const { error } = await db.rpc("set_sample_idea", { _idea_id: r.id });
      if (error) throw new Error("set_sample_idea failed");
      setLog("Done. /sample now shows this report.");
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
        Runs the real pipeline on a sample idea (counts against your daily limits) and publishes it at{" "}
        <Link to="/sample" className="underline">/sample</Link>. Choose an idea that isn't yours to keep private.
      </p>
      <Textarea value={idea} onChange={(e) => setIdea(e.target.value.slice(0, 1500))} rows={3} placeholder="Sample idea" className="mb-2 text-base" />
      <Input value={audience} onChange={(e) => setAudience(e.target.value.slice(0, 200))} placeholder="Who it's for (optional)" className="mb-3 h-11 text-base" />
      <Button variant="cta" onClick={run} disabled={busy || idea.trim().length < 15} className="h-11">
        {busy && <Loader2 className="animate-spin" aria-hidden />} Generate and publish sample
      </Button>
      {log && <p className="mt-3 text-sm text-foreground" role="status">{log}</p>}
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

            <SampleGenerator />
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;

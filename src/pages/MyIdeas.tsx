import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ChevronRight, Loader2, LogOut, Plus, Shield } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VerdictStamp } from "@/components/verdict/VerdictResult";
import { supabase } from "@/integrations/supabase/client";
import { claimIdeas, db, deleteMyData, VexApiError } from "@/lib/vex-api";
import type { Verdict } from "@/types/verdict";

interface Row {
  id: string;
  idea: string;
  verdict: Verdict;
  overall_score: number;
  created_at: string;
  full_report_at: string | null;
}

const MyIdeas = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekly, setWeekly] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/auth?mode=login&next=/ideas", { replace: true });
      return;
    }
    setUserId(data.session.user.id);
    try {
      await claimIdeas();
    } catch {
      /* claiming is best-effort; saved ideas still load */
    }
    const [ideas, profile, roles] = await Promise.all([
      db.from("ideas").select("id, idea, verdict, overall_score, created_at, full_report_at").order("created_at", { ascending: false }),
      db.from("profiles").select("weekly_checkin").eq("user_id", data.session.user.id).maybeSingle(),
      db.from("user_roles").select("role").eq("role", "admin"),
    ]);
    // Shows the link only; the admin data itself is protected in the database.
    setIsAdmin(!!roles.data?.length);
    if (ideas.error) setError("We couldn't load your ideas. Please refresh.");
    else setRows(ideas.data);
    setWeekly(!!profile.data?.weekly_checkin);
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleWeekly = async (on: boolean) => {
    setWeekly(on);
    setWeeklyError(null);
    const { error: e } = await db.from("profiles").update({ weekly_checkin: on }).eq("user_id", userId);
    if (e) {
      setWeekly(!on);
      setWeeklyError("That didn't save. Please try again.");
    }
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyData();
      try {
        localStorage.removeItem("vex-runs");
      } catch {
        /* ignore */
      }
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof VexApiError ? err.message : "We couldn't delete your data. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">My ideas</h1>
          <Button asChild variant="cta" className="h-11 font-semibold">
            <Link to="/#test">
              <Plus aria-hidden /> New idea
            </Link>
          </Button>
        </div>

        {rows === null && !error && (
          <div className="flex justify-center py-16" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-purple" aria-label="Loading" />
          </div>
        )}
        {error && <p role="alert" className="text-sm text-verdict-kill">{error}</p>}
        {rows?.length === 0 && (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
            <p className="mb-4 text-muted-foreground">No ideas yet. Run your first one. It takes about a minute.</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/#test">Test my idea</Link>
            </Button>
          </div>
        )}
        <ul className="space-y-3">
          {rows?.map((r) => (
            <li key={r.id}>
              <Link to={`/idea/${r.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-purple/50">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-foreground">{r.idea}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <VerdictStamp verdict={r.verdict} size="sm" />
                    <span className="tabular-nums">{Number(r.overall_score).toFixed(1)}/10</span>
                    <span>· {format(new Date(r.created_at), "d MMM yyyy")}</span>
                    {r.full_report_at && <span>· Full report</span>}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <section id="settings" className="mt-12 space-y-6 rounded-xl border border-border bg-card/40 p-5">
          <h2 className="font-sans text-lg font-semibold text-foreground">Settings</h2>
          <div className="flex items-start justify-between gap-4">
            <label htmlFor="weekly" className="text-sm">
              <span className="block font-medium text-foreground">Weekly check-in email</span>
              <span className="text-muted-foreground">One email a week: "Did you test your top assumption this week?" Turn it off any time.</span>
            </label>
            <Switch id="weekly" checked={weekly} onCheckedChange={toggleWeekly} disabled={!userId} />
          </div>
          {weeklyError && <p role="alert" className="text-sm text-verdict-kill">{weeklyError}</p>}

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            {isAdmin && (
              <Button asChild variant="outline" className="h-11">
                <Link to="/admin">
                  <Shield aria-hidden /> Admin dashboard
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="h-11"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut aria-hidden /> Sign out
            </Button>
            <AlertDialog onOpenChange={() => setConfirmText("")}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11">Delete my data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account and all your data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes your account, every idea and report, your checklists and any public share links. It can't be undone. Type DELETE to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="h-11" aria-label="Type DELETE to confirm" />
                {deleteError && <p role="alert" className="text-sm text-verdict-kill">{deleteError}</p>}
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
                  <Button variant="destructive" className="h-11" disabled={confirmText !== "DELETE" || deleting} onClick={remove}>
                    {deleting ? "Deleting..." : "Delete everything"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyIdeas;

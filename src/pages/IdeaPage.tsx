import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { VerdictResult } from "@/components/verdict/VerdictResult";
import { ShareVerdict } from "@/components/verdict/ShareVerdict";
import { recallTechnical, UnlockReport } from "@/components/verdict/UnlockReport";
import { FullReportView } from "@/components/verdict/FullReportView";
import { AssumptionsChecklist } from "@/components/verdict/AssumptionsChecklist";
import { supabase } from "@/integrations/supabase/client";
import { claimIdeas, fetchIdea, loadLocalRuns, requestFullReport, VexApiError, type LocalRun } from "@/lib/vex-api";
import { track } from "@/lib/analytics";
import type { FullReport, QuickVerdict } from "@/types/verdict";

interface View {
  id: string;
  idea: string;
  result: QuickVerdict;
  claimToken: string | null;
  shareId: string | null;
  report: FullReport | null;
}

const fromRun = (run: LocalRun): View => ({
  id: run.id,
  idea: run.idea,
  result: run.result,
  claimToken: run.claimToken,
  shareId: null,
  report: null,
});

const IdeaPage = () => {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const shownRef = useRef<string | null>(null);
  const autoRef = useRef(false);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const signedIn = data.session?.user ?? null;
    setUser(signedIn);
    const local = (location.state as { run?: LocalRun } | null)?.run ?? loadLocalRuns()[id];

    if (signedIn) {
      try {
        if (local?.claimToken || params.get("unlock")) await claimIdeas();
        const row = await fetchIdea(id);
        if (row) {
          setView({ id: row.id, idea: row.idea, result: row.result, claimToken: null, shareId: row.share_id, report: row.full_report });
          setStatus("ready");
          return;
        }
      } catch {
        if (!local) {
          setStatus("error");
          return;
        }
      }
    }
    if (local) {
      setView(fromRun(local));
      setStatus("ready");
    } else {
      setStatus("missing");
    }
  }, [id, location.state, params]);

  useEffect(() => {
    load();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") load();
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  useEffect(() => {
    if (view && shownRef.current !== view.id) {
      shownRef.current = view.id;
      track("verdict_shown");
      if (view.report) track("full_report_viewed");
    }
  }, [view]);

  const generate = useCallback(
    async (technical: boolean) => {
      setGenerating(true);
      setReportError(null);
      track("full_report_requested");
      try {
        const { report, reused } = await requestFullReport(id, technical);
        setView((v) => (v ? { ...v, report } : v));
        if (!reused) track("idea_tracker_created");
        track("full_report_viewed");
      } catch (err) {
        setReportError(err instanceof VexApiError ? err.message : "We couldn't write the report. Please try again.");
      } finally {
        setGenerating(false);
      }
    },
    [id],
  );

  // Coming back from the email link or Google: start the report straight away.
  useEffect(() => {
    if (autoRef.current || !user || !view || view.report || view.claimToken || !params.get("unlock")) return;
    const technical = recallTechnical(id);
    autoRef.current = true;
    params.delete("unlock");
    setParams(params, { replace: true });
    if (technical !== null) generate(technical);
  }, [user, view, params, setParams, id, generate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:px-6">
        <Link to={user ? "/ideas" : "/"} className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {user ? "My ideas" : "Home"}
        </Link>

        {status === "loading" && (
          <div className="flex justify-center py-24" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-purple" aria-label="Loading" />
          </div>
        )}

        {(status === "missing" || status === "error") && (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              {status === "missing" ? "We can't find this idea" : "We couldn't load this idea"}
            </h1>
            <p className="mb-5 text-sm text-muted-foreground">
              {status === "missing"
                ? "Results from free runs are saved on the device you ran them on. Sign in to see ideas saved to your account."
                : "Please refresh the page in a moment."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="cta" size="lg">
                <Link to="/#test">Test an idea</Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg">
                  <Link to={`/auth?mode=login&next=/idea/${id}`}>Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {status === "ready" && view && (
          <div className="space-y-6">
            <h1 className="sr-only">The board's verdict</h1>
            <VerdictResult idea={view.idea} result={view.result} />
            <ShareVerdict
              ideaId={view.id}
              idea={view.idea}
              result={view.result}
              claimToken={view.claimToken}
              shareId={view.shareId}
              onShareChange={(shareId) => setView((v) => (v ? { ...v, shareId } : v))}
            />

            {view.report ? (
              <>
                <h2 className="pt-4 text-2xl font-semibold text-foreground">Full report</h2>
                <FullReportView report={view.report} />
                {user && <AssumptionsChecklist ideaId={view.id} userId={user.id} />}
              </>
            ) : (
              <UnlockReport
                ideaId={view.id}
                claimToken={view.claimToken}
                signedIn={!!user && !view.claimToken}
                generating={generating}
                error={reportError}
                onGenerate={generate}
              />
            )}

            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/#test")}>
              <RotateCcw aria-hidden /> Test another idea
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Vex gives structured opinions, not guarantees. It's not financial or legal advice.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default IdeaPage;

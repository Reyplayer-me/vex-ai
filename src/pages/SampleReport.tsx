import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { VerdictResult } from "@/components/verdict/VerdictResult";
import { FullReportView } from "@/components/verdict/FullReportView";
import { db } from "@/lib/vex-api";
import { quickVerdictSchema, type FullReport, type QuickVerdict } from "@/types/verdict";

interface Sample {
  id: string;
  idea: string;
  audience: string | null;
  result: QuickVerdict;
  full_report: FullReport | null;
  created_at: string;
}

const ROTATION_KEY = "vex_sample_turn";

// Each visit shows the next sample, so returning visitors see a different one.
function nextTurn(count: number) {
  try {
    const turn = Number(localStorage.getItem(ROTATION_KEY)) || 0;
    localStorage.setItem(ROTATION_KEY, String(turn + 1));
    return turn % count;
  } catch {
    return Math.floor(Math.random() * count);
  }
}

const SampleReport = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const sample = samples[index] ?? null;

  useEffect(() => {
    db.rpc("get_sample_report").then(({ data, error }: { data: Sample[] | null; error: unknown }) => {
      const rows = error ? [] : (data ?? []).filter((r) => quickVerdictSchema.safeParse(r.result).success);
      if (!rows.length) {
        setStatus("missing");
        return;
      }
      setSamples(rows);
      setIndex(nextTurn(rows.length));
      setStatus("ready");
    });
  }, []);

  const showNext = () => {
    setIndex((i) => (i + 1) % samples.length);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:px-6">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Sample report</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This is unedited output from the same pipeline you'll use: live web search, then the board's verdict and full report.
          {sample && ` Generated ${new Date(sample.created_at).toLocaleDateString()}.`}
        </p>

        {status === "loading" && (
          <div className="flex justify-center py-24" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-purple" aria-label="Loading" />
          </div>
        )}
        {status === "missing" && (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
            <p className="mb-5 text-muted-foreground">The sample report is being prepared. The quickest way to see what Vex does is to run your own idea. It's free and takes about a minute.</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/#test">Test my idea</Link>
            </Button>
          </div>
        )}
        {status === "ready" && sample && (
          <div key={sample.id} className="space-y-6">
            {sample.audience && <p className="text-sm text-muted-foreground">For: {sample.audience}</p>}
            <VerdictResult idea={sample.idea} result={sample.result} />
            {sample.full_report && (
              <>
                <h2 className="pt-4 text-2xl font-semibold text-foreground">Full report</h2>
                <FullReportView report={sample.full_report} />
              </>
            )}
            {samples.length > 1 && (
              <Button variant="outline" onClick={showNext} className="h-11 w-full">
                See another sample ({index + 1} of {samples.length})
              </Button>
            )}
            <div className="rounded-xl border border-cta/40 bg-card/60 p-5 text-center">
              <p className="mb-4 text-foreground">Your turn.</p>
              <Button asChild variant="cta" size="xl" className="w-full font-semibold">
                <Link to="/#test">
                  Test my idea (free, no signup) <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SampleReport;

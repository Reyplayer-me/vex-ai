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
  idea: string;
  audience: string | null;
  result: QuickVerdict;
  full_report: FullReport | null;
  created_at: string;
}

const SampleReport = () => {
  const [sample, setSample] = useState<Sample | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    db.rpc("get_sample_report").then(({ data, error }: { data: Sample[] | null; error: unknown }) => {
      const row = !error && data?.[0];
      if (!row || !quickVerdictSchema.safeParse(row.result).success) {
        setStatus("missing");
        return;
      }
      setSample(row);
      setStatus("ready");
    });
  }, []);

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
          <div className="space-y-6">
            {sample.audience && <p className="text-sm text-muted-foreground">For: {sample.audience}</p>}
            <VerdictResult idea={sample.idea} result={sample.result} />
            {sample.full_report && (
              <>
                <h2 className="pt-4 text-2xl font-semibold text-foreground">Full report</h2>
                <FullReportView report={sample.full_report} />
              </>
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

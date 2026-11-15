import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge, VERDICT_STYLE, VerdictStamp } from "@/components/verdict/VerdictResult";
import { db } from "@/lib/vex-api";
import { cn } from "@/lib/utils";
import type { QuickVerdict, Verdict } from "@/types/verdict";

interface Summary {
  idea_short: string;
  verdict: Verdict;
  overall_score: number;
  one_liner: string;
  confidence: QuickVerdict["confidence"];
  image_url: string | null;
}

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(property.startsWith("og:") ? "property" : "name", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

const PublicVerdict = () => {
  const { id = "" } = useParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    db.rpc("get_public_verdict", { _share_id: id }).then(({ data, error }: { data: Summary[] | null; error: unknown }) => {
      const row = !error && data?.[0];
      if (!row) {
        setStatus("missing");
        return;
      }
      setSummary(row);
      setStatus("ready");
      // Helps crawlers that run JavaScript; see README for static-host limits.
      const title = `${row.verdict} · ${Number(row.overall_score).toFixed(1)}/10 · Vex`;
      document.title = title;
      setMeta("og:title", title);
      setMeta("og:description", row.one_liner);
      setMeta("og:url", window.location.href);
      setMeta("twitter:title", title);
      setMeta("twitter:description", row.one_liner);
      if (row.image_url) {
        setMeta("og:image", row.image_url);
        setMeta("twitter:image", row.image_url);
      }
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-24 sm:px-6">
        {status === "loading" && (
          <div className="flex justify-center py-24" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-purple" aria-label="Loading" />
          </div>
        )}
        {status === "missing" && (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
            <h1 className="mb-2 text-xl font-semibold text-foreground">This link isn't active</h1>
            <p className="mb-5 text-sm text-muted-foreground">The owner may have stopped sharing it.</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/#test">Test your own idea</Link>
            </Button>
          </div>
        )}
        {status === "ready" && summary && (
          <>
            <article className={cn("rounded-2xl border p-6 text-center", VERDICT_STYLE[summary.verdict].border, VERDICT_STYLE[summary.verdict].bg)}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-glow">The board's verdict on</p>
              <h1 className="mb-6 font-sans text-lg font-medium text-foreground">“{summary.idea_short}”</h1>
              <VerdictStamp verdict={summary.verdict} />
              <p className="mt-5 font-orbitron text-5xl font-extrabold text-foreground tabular-nums">
                {Number(summary.overall_score).toFixed(1)}
                <span className="text-2xl text-muted-foreground">/10</span>
              </p>
              <p className="mx-auto mt-4 max-w-sm text-lg italic text-foreground">{summary.one_liner}</p>
              <div className="mt-4">
                <ConfidenceBadge confidence={summary.confidence} />
              </div>
            </article>
            <div className="mt-6 rounded-xl border border-border bg-card/60 p-5 text-center">
              <p className="mb-4 text-foreground">Would your idea survive the board?</p>
              <Button asChild variant="cta" size="xl" className="w-full font-semibold">
                <Link to="/#test">
                  Test my idea (free, no signup) <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicVerdict;

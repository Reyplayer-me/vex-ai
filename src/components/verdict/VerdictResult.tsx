import { AlertTriangle, ExternalLink, HelpCircle, Scale, ShieldAlert, Info } from "lucide-react";
import type { QuickVerdict, Verdict } from "@/types/verdict";
import { cn } from "@/lib/utils";

export const VERDICT_STYLE: Record<Verdict, { text: string; border: string; bg: string; label: string }> = {
  PROCEED: { text: "text-verdict-proceed", border: "border-verdict-proceed", bg: "bg-verdict-proceed/10", label: "Build it" },
  PIVOT: { text: "text-verdict-pivot", border: "border-verdict-pivot", bg: "bg-verdict-pivot/10", label: "Change it first" },
  KILL: { text: "text-verdict-kill", border: "border-verdict-kill", bg: "bg-verdict-kill/10", label: "Don't build this" },
};

export const VerdictStamp = ({ verdict, size = "lg" }: { verdict: Verdict; size?: "sm" | "lg" }) => {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      className={cn(
        "inline-block -rotate-3 rounded-md border-[3px] font-orbitron font-black tracking-wider",
        s.text,
        s.border,
        size === "lg" ? "px-5 py-2 text-4xl sm:text-5xl" : "px-2 py-0.5 text-sm border-2",
      )}
    >
      {verdict}
    </span>
  );
};

const CONFIDENCE_COPY = {
  high: "Strong evidence: relevant competitors and pricing were found.",
  medium: "Some evidence: the search found part of the picture.",
  low: "Thin evidence: treat this as a first opinion, not a conclusion.",
};

export const ConfidenceBadge = ({ confidence }: { confidence: QuickVerdict["confidence"] }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
    title={CONFIDENCE_COPY[confidence]}
  >
    <Info className="h-3.5 w-3.5" aria-hidden />
    Confidence: <span className="font-semibold capitalize text-foreground">{confidence}</span>
  </span>
);

const SUBSCORES: { key: keyof QuickVerdict["scores"]; label: string; hint?: string }[] = [
  { key: "problem_clarity", label: "Problem clarity" },
  { key: "market_demand", label: "Market demand" },
  { key: "execution_difficulty", label: "Execution difficulty", hint: "higher = harder" },
  { key: "differentiation", label: "Differentiation" },
];

const ScoreRow = ({ label, hint, value, inverted }: { label: string; hint?: string; value: number; inverted?: boolean }) => {
  const good = inverted ? 10 - value : value;
  const color = good >= 6.5 ? "bg-verdict-proceed" : good >= 4 ? "bg-verdict-pivot" : "bg-verdict-kill";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-foreground">
          {label} {hint && <span className="text-xs text-muted-foreground">({hint})</span>}
        </span>
        <span className="font-semibold tabular-nums text-foreground">{value}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="presentation">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={cn("rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm", className)}>{children}</section>
);

const CardTitle = ({ icon: Icon, children }: { icon: typeof Info; children: React.ReactNode }) => (
  <h3 className="mb-3 flex items-center gap-2 font-sans text-base font-semibold text-foreground">
    <Icon className="h-4 w-4 text-purple" aria-hidden />
    {children}
  </h3>
);

export const VerdictResult = ({ idea, result }: { idea: string; result: QuickVerdict }) => {
  const style = VERDICT_STYLE[result.verdict];
  return (
    <div className="space-y-4">
      <Card className={cn("text-center", style.bg, style.border, "border")}>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">“{idea}”</p>
        <VerdictStamp verdict={result.verdict} />
        <p className={cn("mt-3 text-sm font-semibold uppercase tracking-wide", style.text)}>{style.label}</p>
        <p className="mt-4 font-orbitron text-5xl font-extrabold text-foreground tabular-nums">
          {result.overall_score.toFixed(1)}
          <span className="text-2xl text-muted-foreground">/10</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-lg italic text-foreground">{result.one_liner}</p>
        <div className="mt-4">
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          {SUBSCORES.map((s) => (
            <ScoreRow key={s.key} label={s.label} hint={s.hint} value={result.scores[s.key]} inverted={s.key === "execution_difficulty"} />
          ))}
        </div>
      </Card>

      <Card className="border-advisor-risk/40">
        <CardTitle icon={HelpCircle}>The question you must answer before you build</CardTitle>
        <p className="text-lg font-medium text-foreground">{result.killer_question}</p>
        <p className="mt-2 text-xs text-muted-foreground">From the Risk Analyst</p>
      </Card>

      <Card>
        <CardTitle icon={ShieldAlert}>Top risks</CardTitle>
        <ol className="space-y-3">
          {result.top_risks.map((risk, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-advisor-risk/15 text-xs font-bold text-advisor-risk">
                {i + 1}
              </span>
              {risk}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardTitle icon={Scale}>Competitors we found</CardTitle>
        {result.competitors_status === "unverified" && (
          <p className="flex gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-advisor-risk" aria-hidden />
            Competitors unverified: the web search didn't work for this run, so we haven't listed any and confidence is lowered.
          </p>
        )}
        {result.competitors_status === "none_found" && (
          <p className="text-sm text-muted-foreground">
            The search didn't turn up a product that clearly does this. That can mean an opening, or that the problem isn't one people pay to solve. Search for it yourself before you assume you're first.
          </p>
        )}
        <ul className="space-y-3">
          {result.competitors.map((c) => (
            <li key={c.url} className="rounded-lg border border-border bg-background/40 p-4">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:text-purple hover:underline"
              >
                {c.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">(opens source in a new tab)</span>
              </a>
              <p className="text-sm text-muted-foreground">
                {c.pricing_url ? (
                  <a href={c.pricing_url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                    {c.pricing}
                  </a>
                ) : (
                  c.pricing
                )}
              </p>
              {c.difference && <p className="mt-2 text-sm text-foreground">{c.difference}</p>}
            </li>
          ))}
        </ul>
      </Card>

      {result.regulatory_flags.length > 0 && (
        <Card>
          <CardTitle icon={AlertTriangle}>Regulatory flags</CardTitle>
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
            {result.regulatory_flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Not legal advice. Check with a professional where it matters.</p>
        </Card>
      )}

      {result.what_would_change_my_mind && (
        <Card>
          <CardTitle icon={Info}>What would change the board's mind</CardTitle>
          <p className="text-sm text-foreground">{result.what_would_change_my_mind}</p>
        </Card>
      )}
    </div>
  );
};

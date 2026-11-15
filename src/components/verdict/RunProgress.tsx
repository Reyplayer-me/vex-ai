import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { RunStage } from "@/lib/vex-api";
import { cn } from "@/lib/utils";

const STEPS: { stage: RunStage; label: string }[] = [
  { stage: "screening", label: "Reading your idea..." },
  { stage: "searching", label: "Searching the web for competitors, prices and regulations..." },
  { stage: "board", label: "The board is scoring it..." },
  { stage: "checking", label: "Checking every competitor against its source..." },
];

const BOARD_LINES = [
  "Risk Analyst is reading your idea...",
  "Industry Expert is comparing it with what's out there...",
  "Psychologist is looking for founder bias...",
  "Execution Officer is sizing the smallest version...",
  "CEO is asking whether this is a business...",
];

export const RunProgress = ({ stage }: { stage: RunStage }) => {
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (stage !== "board") return;
    const t = setInterval(() => setLine((l) => (l + 1) % BOARD_LINES.length), 2800);
    return () => clearInterval(t);
  }, [stage]);

  const current = stage === "cached" ? STEPS.length : STEPS.findIndex((s) => s.stage === stage);

  return (
    <div className="rounded-xl border border-purple/40 bg-card/80 p-5 text-left backdrop-blur-sm" role="status" aria-live="polite">
      <p className="mb-4 text-sm text-muted-foreground">Usually 30–60 seconds. Keep this tab open.</p>
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li key={s.stage} className={cn("flex items-start gap-3 text-sm", i > current ? "text-muted-foreground/60" : "text-foreground")}>
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              {i < current ? (
                <Check className="h-4 w-4 text-cta" aria-hidden />
              ) : i === current ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple" aria-hidden />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              )}
            </span>
            <span>
              {s.label}
              {s.stage === "board" && i === current && <span className="mt-1 block text-purple-glow">{BOARD_LINES[line]}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

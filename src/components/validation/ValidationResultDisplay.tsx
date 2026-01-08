import { ValidationResult, ScoreItem } from "@/types/validation";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface ValidationResultDisplayProps {
  result: ValidationResult;
  className?: string;
}

const ScoreBar = ({ score, label }: { score: number; label: string }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-emerald-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", getScoreColor(score))}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
};

const ScoreCard = ({ 
  label, 
  data,
  icon: Icon 
}: { 
  label: string; 
  data: ScoreItem;
  icon: React.ElementType;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "border-emerald-500/30 bg-emerald-500/5";
    if (score >= 4) return "border-amber-500/30 bg-amber-500/5";
    return "border-red-500/30 bg-red-500/5";
  };

  const getTextColor = (score: number) => {
    if (score >= 7) return "text-emerald-500";
    if (score >= 4) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className={cn("rounded-xl border p-4 transition-all", getScoreColor(data.score))}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", getTextColor(data.score))} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={cn("text-2xl font-bold", getTextColor(data.score))}>
          {data.score}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{data.justification}</p>
      <div className="flex items-start gap-2 text-xs">
        <ArrowRight className="h-3 w-3 text-purple mt-0.5 shrink-0" />
        <span className="text-purple">{data.improvement}</span>
      </div>
    </div>
  );
};

const VerdictBadge = ({ verdict }: { verdict: ValidationResult["verdict"] }) => {
  const config = {
    PROCEED: {
      icon: CheckCircle,
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-500",
      label: "PROCEED",
    },
    PIVOT: {
      icon: AlertTriangle,
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-500",
      label: "PIVOT",
    },
    KILL: {
      icon: XCircle,
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-500",
      label: "KILL",
    },
  };

  const { icon: Icon, bg, text, label } = config[verdict];

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2", bg)}>
      <Icon className={cn("h-5 w-5", text)} />
      <span className={cn("font-bold text-lg", text)}>{label}</span>
    </div>
  );
};

export const ValidationResultDisplay = ({ result, className }: ValidationResultDisplayProps) => {
  const scores = result.scores;
  const avgScore = (
    scores.problem_clarity.score +
    scores.market_realism.score +
    scores.execution_difficulty.score +
    scores.differentiation.score
  ) / 4;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Verdict Section */}
      <div className="text-center space-y-4">
        <VerdictBadge verdict={result.verdict} />
        <p className="text-muted-foreground max-w-xl mx-auto">
          {result.verdict_reasoning}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Average Score:</span>
          <span className="font-semibold text-foreground">{avgScore.toFixed(1)}/10</span>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreCard 
          label="Problem Clarity" 
          data={scores.problem_clarity}
          icon={TrendingUp}
        />
        <ScoreCard 
          label="Market Realism" 
          data={scores.market_realism}
          icon={TrendingUp}
        />
        <ScoreCard 
          label="Execution Difficulty" 
          data={scores.execution_difficulty}
          icon={TrendingDown}
        />
        <ScoreCard 
          label="Differentiation" 
          data={scores.differentiation}
          icon={TrendingUp}
        />
      </div>

      {/* Critical Risks */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Critical Risks
        </h3>
        <ul className="space-y-2">
          {result.critical_risks.map((risk, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-red-500 mt-1">•</span>
              {risk}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="rounded-xl border border-purple/20 bg-purple/5 p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-purple" />
          Next Steps
        </h3>
        <ul className="space-y-2">
          {result.next_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-purple font-semibold">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

import { RoadmapResult } from "@/types/roadmap";
import { cn } from "@/lib/utils";
import { 
  Target, 
  Package, 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  Wrench,
  Clock,
  Lightbulb,
  AlertTriangle
} from "lucide-react";

interface RoadmapDisplayProps {
  roadmap: RoadmapResult;
  className?: string;
}

const PhaseCard = ({ 
  phase, 
  icon: Icon, 
  color 
}: { 
  phase: { name: string; duration: string; objectives: string[]; deliverables: string[]; avoid: string[]; skills_tools: string[] };
  icon: React.ElementType;
  color: string;
}) => (
  <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{phase.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {phase.duration}
        </div>
      </div>
    </div>

    {/* Objectives */}
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-purple" />
        Objectives
      </h4>
      <ul className="space-y-1">
        {phase.objectives.map((obj, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-purple mt-0.5">•</span>
            {obj}
          </li>
        ))}
      </ul>
    </div>

    {/* Deliverables */}
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        Deliverables
      </h4>
      <ul className="space-y-1">
        {phase.deliverables.map((del, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            {del}
          </li>
        ))}
      </ul>
    </div>

    {/* Avoid */}
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-500" />
        Avoid
      </h4>
      <ul className="space-y-1">
        {phase.avoid.map((item, i) => (
          <li key={i} className="text-sm text-red-400/80 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>

    {/* Skills & Tools */}
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        Skills & Tools
      </h4>
      <div className="flex flex-wrap gap-2">
        {phase.skills_tools.map((skill, i) => (
          <span 
            key={i} 
            className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export const RoadmapDisplay = ({ roadmap, className }: RoadmapDisplayProps) => {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Your Execution Roadmap
        </h2>
        <p className="text-muted-foreground">
          A minimal, realistic plan to validate and launch
        </p>
      </div>

      {/* Phases */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PhaseCard 
          phase={roadmap.phases.foundations} 
          icon={Target} 
          color="bg-blue-500/20 text-blue-400" 
        />
        <PhaseCard 
          phase={roadmap.phases.product} 
          icon={Package} 
          color="bg-purple/20 text-purple" 
        />
        <PhaseCard 
          phase={roadmap.phases.launch} 
          icon={Rocket} 
          color="bg-green-500/20 text-green-400" 
        />
      </div>

      {/* Tech Stack */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommended Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {roadmap.tech_stack.recommended.map((tech, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 rounded-lg bg-purple/20 text-purple text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {roadmap.tech_stack.reasoning}
        </p>
      </div>

      {/* First Traction Metric */}
      <div className="rounded-xl border border-purple/30 bg-purple/5 p-6">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple" />
          First Traction Metric
        </h3>
        <p className="text-lg text-foreground">
          {roadmap.first_traction_metric}
        </p>
      </div>

      {/* Critical Assumptions */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Critical Assumptions to Test
        </h3>
        <ul className="space-y-2">
          {roadmap.critical_assumptions.map((assumption, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-amber-500 font-bold">{i + 1}.</span>
              {assumption}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

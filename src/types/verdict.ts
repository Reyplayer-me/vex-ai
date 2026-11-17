import { z } from "zod";

const score = z.number().min(0).max(10);

export const quickVerdictSchema = z.object({
  verdict: z.enum(["PROCEED", "PIVOT", "KILL"]),
  overall_score: score,
  scores: z.object({
    problem_clarity: score,
    market_demand: score,
    execution_difficulty: score,
    differentiation: score,
  }),
  one_liner: z.string().min(1),
  top_risks: z.array(z.string()).min(1).max(3),
  killer_question: z.string().min(1),
  fatal_flaw: z.string().nullable().optional(),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        pricing: z.string(),
        pricing_url: z.string().url().nullable().optional(),
        difference: z.string(),
      }),
    )
    .max(3),
  competitors_status: z.enum(["verified", "none_found", "unverified"]),
  regulatory_flags: z.array(z.string()),
  what_would_change_my_mind: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  sources: z.array(z.object({ id: z.string(), title: z.string(), url: z.string() })).optional(),
});

export type QuickVerdict = z.infer<typeof quickVerdictSchema>;
export type Verdict = QuickVerdict["verdict"];

export type Stance = Verdict;
export type FocusKey = "speed" | "cost" | "learning" | "scale";
export type AdvisorRole = "CEO" | "Execution Officer" | "Risk Analyst" | "Psychologist" | "Industry Expert";

export interface RoadmapPhase {
  goal: string;
  duration: string;
  tasks: string[];
  done_when: string;
}

export interface FullReport {
  debate: {
    advisors: { role: AdvisorRole; stance: Stance; view: string; biggest_concern: string }[];
    disagreements: { between: string[]; topic: string; summary: string }[];
    board_decision: { verdict: Verdict; reasoning: string; conditions: string[] };
  };
  roadmap: {
    phases: { foundations: RoadmapPhase; mvp: RoadmapPhase; launch: RoadmapPhase; iterate: RoadmapPhase };
    focus: Record<FocusKey, { headline: string; changes: string[] }>;
  };
  build_plan: {
    founder_type: "technical" | "non-technical";
    tech_stack: { layer: string; choice: string; why: string }[];
    feature_priority: { must_have: string[]; later: string[]; cut: string[] };
    first_weekend: { goal: string; saturday: string[]; sunday: string[] };
  };
  launch_plan: {
    first_user_persona: { who: string; pain: string; where_to_find_them: string[] };
    growth_channel: { channel: string; why: string; first_steps: string[] };
    week_1_target: string;
    month_1_target: string;
    metric_to_watch: string;
  };
  generated_at: string;
}

export interface IdeaRecord {
  id: string;
  idea: string;
  audience: string | null;
  result: QuickVerdict;
  full_report: FullReport | null;
  technical_founder: boolean | null;
  share_id: string | null;
  created_at: string;
}

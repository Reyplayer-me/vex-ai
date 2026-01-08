export interface RoadmapPhase {
  name: string;
  duration: string;
  objectives: string[];
  deliverables: string[];
  avoid: string[];
  skills_tools: string[];
}

export interface RoadmapResult {
  phases: {
    foundations: RoadmapPhase;
    product: RoadmapPhase;
    launch: RoadmapPhase;
  };
  tech_stack: {
    recommended: string[];
    reasoning: string;
  };
  first_traction_metric: string;
  critical_assumptions: string[];
}

export interface RoadmapInput {
  idea: string;
  targetUser: string;
  industry: string;
  goal: string;
  verdict: string;
  verdict_reasoning: string;
}

export interface ScoreItem {
  score: number;
  justification: string;
  improvement: string;
}

export interface ValidationScores {
  problem_clarity: ScoreItem;
  market_realism: ScoreItem;
  execution_difficulty: ScoreItem;
  differentiation: ScoreItem;
}

export interface ValidationResult {
  scores: ValidationScores;
  verdict: "PROCEED" | "PIVOT" | "KILL";
  verdict_reasoning: string;
  critical_risks: string[];
  next_steps: string[];
}

export interface IdeaInput {
  idea: string;
  targetUser: string;
  industry: string;
  goal: string;
}

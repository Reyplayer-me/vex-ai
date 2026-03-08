export interface BuildPlanTechStack {
  frontend: string[];
  backend: string[];
  tools: string[];
  reasoning: string;
}

export interface BuildPlanArchitecture {
  overview: string;
  components: string[];
  data_model: string;
}

export interface BuildPlanFeaturePriority {
  must_have: string[];
  nice_to_have: string[];
  cut_for_mvp: string[];
}

export interface BuildPlanProjectStructure {
  description: string;
  key_files: string[];
  starter_guidance: string;
}

export interface BuildPlanWeekend {
  saturday: string[];
  sunday: string[];
  goal: string;
}

export interface BuildPlan {
  tech_stack: BuildPlanTechStack;
  architecture: BuildPlanArchitecture;
  feature_priority: BuildPlanFeaturePriority;
  project_structure: BuildPlanProjectStructure;
  first_weekend_plan: BuildPlanWeekend;
}

export interface LaunchPersona {
  description: string;
  where_they_hang_out: string[];
  pain_level: string;
  how_to_reach_them: string;
}

export interface LaunchGrowthChannel {
  primary: string;
  why: string;
  how_to_start: string[];
  expected_timeline: string;
}

export interface LaunchChecklist {
  pre_launch: string[];
  launch_day: string[];
  first_week: string[];
  first_month: string[];
}

export interface LaunchTractionMetrics {
  primary_metric: string;
  target_week_1: string;
  target_month_1: string;
  how_to_measure: string;
}

export interface LaunchStrategy {
  first_user_persona: LaunchPersona;
  growth_channel: LaunchGrowthChannel;
  launch_checklist: LaunchChecklist;
  traction_metrics: LaunchTractionMetrics;
  anti_patterns: string[];
}

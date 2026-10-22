export const planAvailability = {
  starter: { name: "Starter", monthly: "Free", annually: "Free", comingSoon: false },
  professional: { name: "Professional", monthly: "$29", annually: "$24", comingSoon: true },
  enterprise: { name: "Enterprise", monthly: "$39", annually: "$32", comingSoon: true },
} as const;

export type PlanId = keyof typeof planAvailability;

export function planDestination(plan: PlanId): string {
  return planAvailability[plan].comingSoon ? `/plans/${plan}` : "/auth?mode=signup";
}
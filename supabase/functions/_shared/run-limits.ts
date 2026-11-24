// Daily idea-run caps, in one place so they're easy to change.
// Anonymous visitors are counted by visitor id (with an IP backstop);
// signed-in users by user id. Admins skip the cap entirely.

export const RUN_LIMITS = { anon: 10, user: 30 };
export const ANON_IP_DAILY = 15; // stops resetting the browser id; shared networks still get room

export interface RunLimitPlan {
  keys: string[];
  limits: number[];
}

/**
 * Returns the rate-limit keys and limits for a run, or null when the run
 * should not be capped (admins).
 */
export function runLimitPlan(
  userId: string | null,
  admin: boolean,
  visitorKey: string,
  ipKey: string,
): RunLimitPlan | null {
  if (userId && admin) return null;
  if (userId) return { keys: [`u:${userId}`], limits: [RUN_LIMITS.user] };
  return { keys: [`v:${visitorKey}`, `ip:${ipKey}`], limits: [RUN_LIMITS.anon, ANON_IP_DAILY] };
}

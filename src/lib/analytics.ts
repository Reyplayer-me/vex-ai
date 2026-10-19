// Plausible custom events. No-op until the Plausible script in index.html is enabled.
type EventName = "signup" | "first_generation" | "roadmap_completed" | "feedback_sent";

export const track = (event: EventName, props?: Record<string, string | number>) => {
  const w = window as unknown as { plausible?: (e: string, o?: { props?: Record<string, string | number> }) => void };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* analytics must never break the app */
  }
};

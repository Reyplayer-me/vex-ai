import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/vex-api";
import { getVisitorId, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Answer = "yes" | "maybe" | "no";
const ANSWERS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

const BetaPricingSection = () => {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const submit = async () => {
    if (!answer) return;
    setState("saving");
    const { error } = await db
      .from("price_intents")
      .insert({ answer, comment: comment.trim() ? comment.trim().slice(0, 500) : null, visitor_id: getVisitorId() });
    if (error) {
      setState("error");
      return;
    }
    track(`price_intent_${answer}`);
    setState("done");
  };

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-xl rounded-2xl border border-cta/30 bg-card/60 p-6 text-center sm:p-8">
        <span className="mb-4 inline-block rounded-full bg-cta px-3 py-1 text-xs font-semibold text-cta-foreground">Free during beta</span>
        <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">Vex is free during beta.</h2>
        <p className="mb-6 text-muted-foreground">After beta, full reports are planned at $9 each. The free verdict stays free.</p>

        {state === "done" ? (
          <p className="flex items-center justify-center gap-2 text-foreground" role="status">
            <Check className="h-5 w-5 text-cta" aria-hidden /> Thanks. That helps us decide.
          </p>
        ) : (
          <fieldset className="space-y-4">
            <legend className="mb-3 w-full text-lg font-medium text-foreground">Would you pay this?</legend>
            <div className="grid grid-cols-3 gap-2">
              {ANSWERS.map((a) => (
                <Button
                  key={a.value}
                  type="button"
                  variant="outline"
                  aria-pressed={answer === a.value}
                  onClick={() => setAnswer(a.value)}
                  className={cn("h-12 text-base", answer === a.value && "border-cta bg-cta/10 text-foreground")}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            <div className="text-left">
              <Label htmlFor="price-comment" className="mb-2 block text-sm text-muted-foreground">
                Anything to add? (optional)
              </Label>
              <Textarea
                id="price-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={2}
                placeholder="What would make it worth $9 to you?"
                className="bg-background/60 text-base"
              />
            </div>
            {state === "error" && (
              <p role="alert" className="text-sm text-verdict-kill">
                That didn't save. Please try again.
              </p>
            )}
            <Button type="button" variant="cta" size="lg" className="w-full font-semibold" disabled={!answer || state === "saving"} onClick={submit}>
              {state === "saving" ? "Saving..." : "Send answer"}
            </Button>
            <p className="text-xs text-muted-foreground">No payment details. We're only asking.</p>
          </fieldset>
        )}
      </div>
    </section>
  );
};

export default BetaPricingSection;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RunProgress } from "./RunProgress";
import { runQuickVerdict, saveLocalRun, VexApiError, type RunStage } from "@/lib/vex-api";
import { track } from "@/lib/analytics";

const MAX_IDEA = 1500;
const MAX_AUDIENCE = 200;

export const IdeaForm = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [stage, setStage] = useState<RunStage | null>(null);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = idea.trim();
    if (trimmed.length < 15) {
      setError({ code: "invalid_input", message: "Give us a bit more: what you want to build and who it's for." });
      return;
    }
    setError(null);
    setStage("screening");
    track("idea_submitted");
    try {
      const run = await runQuickVerdict(trimmed, audience.trim(), setStage);
      if (run.claimToken) saveLocalRun({ ...run, idea: trimmed, audience: audience.trim() });
      navigate(`/idea/${run.id}`, { state: { run: { ...run, idea: trimmed, audience: audience.trim() } } });
    } catch (err) {
      const e = err instanceof VexApiError ? err : new VexApiError("internal", "Something went wrong on our side. Please try again.");
      setError({ code: e.code, message: e.message });
      setStage(null);
    }
  };

  if (stage) return <RunProgress stage={stage} />;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card/70 p-4 text-left backdrop-blur-sm sm:p-5">
      <div>
        <Label htmlFor="idea" className="mb-2 block text-sm text-foreground">
          Your startup idea
        </Label>
        <Textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value.slice(0, MAX_IDEA))}
          placeholder="e.g. An app that matches dog owners in the same building so they can share walks and sitting."
          rows={4}
          maxLength={MAX_IDEA}
          className="min-h-[120px] resize-y bg-background/60 text-base"
          aria-describedby="idea-count"
          required
        />
        <p id="idea-count" className="mt-1 text-right text-xs text-muted-foreground">
          {idea.length}/{MAX_IDEA}
        </p>
      </div>
      <div>
        <Label htmlFor="audience" className="mb-2 block text-sm text-foreground">
          Who is it for? <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value.slice(0, MAX_AUDIENCE))}
          placeholder="e.g. busy renters in big cities"
          maxLength={MAX_AUDIENCE}
          className="h-12 bg-background/60 text-base"
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-verdict-kill/40 bg-verdict-kill/10 p-3 text-sm text-foreground">
          {error.message}
          {error.code === "rate_limited" && (
            <Link to="/auth?mode=signup" className="mt-2 block font-semibold text-cta underline underline-offset-4">
              Sign up free for more runs
            </Link>
          )}
        </div>
      )}

      <Button type="submit" variant="cta" size="xl" className="w-full whitespace-normal px-4 text-base font-semibold">
        Test my idea (free, no signup)
        <ArrowRight aria-hidden />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Private by default. Ideas are only shared if you choose to share them.
      </p>
    </form>
  );
};

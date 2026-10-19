import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Sample = { verdict: "PROCEED" | "PIVOT" | "KILL"; score: number; challenge: string; next: string };

// Pre-written sample output for signed-out visitors. Real analysis runs after signup.
const sampleFor = (idea: string): Sample => {
  const t = idea.toLowerCase();
  if (/(social|network|app for everyone|uber for|marketplace)/.test(t))
    return {
      verdict: "PIVOT", score: 48,
      challenge: "Marketplaces die from the cold-start problem. Which side do you get first, and why would they show up when the other side is empty?",
      next: "Pick one city and one supply type. Sign up 15 suppliers by hand before you write code.",
    };
  if (/(crypto|nft|metaverse)/.test(t))
    return {
      verdict: "KILL", score: 29,
      challenge: "You described a technology, not a problem. Who loses money or time today without this?",
      next: "Write down three people you know who would pay for this. If you can't name them, start over.",
    };
  return {
    verdict: "PROCEED", score: 71,
    challenge: "What does your user do today instead, and why is that bad enough that they'd switch?",
    next: "Talk to 10 people in your target group this week. Ask about their last time hitting this problem, not about your idea.",
  };
};

const verdictClass: Record<Sample["verdict"], string> = {
  PROCEED: "text-purple-glow",
  PIVOT: "text-foreground",
  KILL: "text-destructive",
};

const HeroSection = () => {
  const [idea, setIdea] = useState("A study planner for university students that turns syllabi into weekly tasks");
  const [result, setResult] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (idea.trim().length < 10) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(sampleFor(idea));
      setLoading(false);
    }, 900);
  };

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="pt-4">
          <p className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">Early access · free</p>
          <h1 className="mb-6 text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Find out if your startup idea is worth building before you spend six months on it.
          </h1>
          <p className="mb-8 max-w-lg text-lg text-muted-foreground">
            Describe your idea. Five AI advisors score it, argue about it, and give you a verdict. If it survives, you get a three-phase roadmap and a first-weekend build plan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth?mode=signup">
              <Button className="h-11 bg-purple px-6 text-accent-foreground hover:bg-purple/90">Sign up free</Button>
            </Link>
            <a href="#how">
              <Button variant="outline" className="h-11 px-6">How it works</Button>
            </a>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <label htmlFor="demo-idea" className="mb-2 block text-sm text-muted-foreground">Try it. Describe an idea in one sentence:</label>
          <Textarea id="demo-idea" rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={300} />
          <Button onClick={run} disabled={loading || idea.trim().length < 10} className="mt-3 h-11 w-full bg-purple text-accent-foreground hover:bg-purple/90">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />The board is reading…</> : "Get a quick verdict"}
          </Button>

          <div className="mt-6 min-h-[180px] border-t border-border pt-6">
            {!result && !loading && <p className="text-sm text-muted-foreground">Your verdict shows up here.</p>}
            {result && (
              <div className="space-y-4 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className={`text-xl font-semibold ${verdictClass[result.verdict]}`}>{result.verdict}</span>
                  <span className="text-muted-foreground">Score {result.score}/100</span>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Devil's Advocate asks</p>
                  <p className="text-foreground">{result.challenge}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Do this next</p>
                  <p className="text-foreground">{result.next}</p>
                </div>
                <p className="text-xs text-muted-foreground">This is a sample answer. Sign up and the board analyses your actual idea, target user and goal.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

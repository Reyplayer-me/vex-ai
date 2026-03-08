import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, Code, Wrench, ListChecks, Calendar, RotateCcw } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { useBuildPlanGeneration } from "@/hooks/useBuildPlanGeneration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BuildPlan } from "@/types/buildplan";

const BuildPlanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const { isGenerating, streamingText, buildPlan, generateBuildPlan, reset } = useBuildPlanGeneration();

  useEffect(() => {
    const loadContext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: profile } = await supabase.from("profiles")
        .select("goal, target_user, industry, stage, skill_level")
        .eq("user_id", session.user.id).maybeSingle();

      const { data: sessions } = await supabase.from("validation_sessions")
        .select("validation_result").eq("user_id", session.user.id)
        .order("created_at", { ascending: false }).limit(1);

      const verdict = (sessions?.[0]?.validation_result as any)?.verdict;

      if (profile?.goal) {
        setContext({
          idea: profile.goal,
          targetUser: profile.target_user || "",
          industry: profile.industry || "",
          goal: profile.goal,
          skillLevel: (profile as any).skill_level || "",
          verdict: verdict || "",
        });
      }
      setLoading(false);
    };
    loadContext();
  }, [navigate]);

  const handleGenerate = () => {
    if (!context) { toast.error("Please complete onboarding first"); return; }
    generateBuildPlan(context);
  };

  useEffect(() => {
    if (context && !buildPlan && !isGenerating) handleGenerate();
  }, [context]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-purple" /></div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/dashboard"><img src={vexWordmark} alt="Vex" className="h-6" /></Link>
          <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">Product Build Foundations</h1>
            <p className="text-muted-foreground">Your concrete build plan — tech stack, architecture, and what to build first</p>
          </div>

          {isGenerating && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-purple">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Generating your build plan...</span>
              </div>
              {streamingText && (
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">{streamingText}</pre>
                </div>
              )}
            </div>
          )}

          {buildPlan && !isGenerating && <BuildPlanDisplay plan={buildPlan} />}

          {buildPlan && !isGenerating && (
            <div className="flex gap-4 justify-center mt-8">
              <Button variant="outline" onClick={() => { reset(); handleGenerate(); }}>
                <RotateCcw className="mr-2 h-4 w-4" />Regenerate
              </Button>
              <Button variant="hero" onClick={() => navigate("/launch-strategy")}>
                <Sparkles className="mr-2 h-4 w-4" />Launch Strategy
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function BuildPlanDisplay({ plan }: { plan: BuildPlan }) {
  return (
    <div className="space-y-6">
      {/* Tech Stack */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <Code className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Tech Stack</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Frontend</h3>
            <div className="flex flex-wrap gap-2">{plan.tech_stack.frontend.map((t, i) => (
              <span key={i} className="rounded-full bg-purple/10 border border-purple/20 px-3 py-1 text-sm text-foreground">{t}</span>
            ))}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Backend</h3>
            <div className="flex flex-wrap gap-2">{plan.tech_stack.backend.map((t, i) => (
              <span key={i} className="rounded-full bg-purple/10 border border-purple/20 px-3 py-1 text-sm text-foreground">{t}</span>
            ))}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tools</h3>
            <div className="flex flex-wrap gap-2">{plan.tech_stack.tools.map((t, i) => (
              <span key={i} className="rounded-full bg-purple/10 border border-purple/20 px-3 py-1 text-sm text-foreground">{t}</span>
            ))}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{plan.tech_stack.reasoning}</p>
      </div>

      {/* Architecture */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <Wrench className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Architecture</h2>
        </div>
        <p className="text-foreground mb-4">{plan.architecture.overview}</p>
        <div className="space-y-2 mb-4">
          {plan.architecture.components.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple shrink-0" />
              <span className="text-sm text-foreground">{c}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground"><strong>Data Model:</strong> {plan.architecture.data_model}</p>
      </div>

      {/* Feature Priority */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <ListChecks className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Feature Priority</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-green-400 mb-2">✅ Must Have</h3>
            <ul className="space-y-1">{plan.feature_priority.must_have.map((f, i) => (
              <li key={i} className="text-sm text-foreground">{f}</li>
            ))}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-400 mb-2">⚡ Nice to Have</h3>
            <ul className="space-y-1">{plan.feature_priority.nice_to_have.map((f, i) => (
              <li key={i} className="text-sm text-muted-foreground">{f}</li>
            ))}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-400 mb-2">✂️ Cut for MVP</h3>
            <ul className="space-y-1">{plan.feature_priority.cut_for_mvp.map((f, i) => (
              <li key={i} className="text-sm text-muted-foreground line-through">{f}</li>
            ))}</ul>
          </div>
        </div>
      </div>

      {/* Project Structure */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">Project Structure</h2>
        <p className="text-foreground mb-4">{plan.project_structure.description}</p>
        <div className="space-y-2 mb-4">
          {plan.project_structure.key_files.map((f, i) => (
            <div key={i} className="rounded bg-muted/50 px-3 py-2 text-sm text-foreground font-mono">{f}</div>
          ))}
        </div>
        <div className="rounded-lg border border-purple/20 bg-purple/5 p-4">
          <p className="text-sm text-foreground">{plan.project_structure.starter_guidance}</p>
        </div>
      </div>

      {/* First Weekend Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <Calendar className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">First Weekend Plan</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Saturday</h3>
            <ol className="space-y-1 list-decimal list-inside">{plan.first_weekend_plan.saturday.map((t, i) => (
              <li key={i} className="text-sm text-foreground">{t}</li>
            ))}</ol>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sunday</h3>
            <ol className="space-y-1 list-decimal list-inside">{plan.first_weekend_plan.sunday.map((t, i) => (
              <li key={i} className="text-sm text-foreground">{t}</li>
            ))}</ol>
          </div>
        </div>
        <div className="rounded-lg border border-purple/20 bg-purple/5 p-3">
          <p className="text-sm text-foreground"><strong>Goal by Sunday night:</strong> {plan.first_weekend_plan.goal}</p>
        </div>
      </div>
    </div>
  );
}

export default BuildPlanPage;

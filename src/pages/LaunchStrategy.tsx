import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, Target, Megaphone, CheckSquare, BarChart3, AlertTriangle, RotateCcw } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { useLaunchStrategyGeneration } from "@/hooks/useLaunchStrategyGeneration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LaunchStrategy } from "@/types/buildplan";

const LaunchStrategyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { isGenerating, streamingText, strategy, generateStrategy, reset, setStrategy } = useLaunchStrategyGeneration();

  useEffect(() => {
    const loadContext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: profile } = await supabase.from("profiles")
        .select("goal, target_user, industry, stage, skill_level")
        .eq("user_id", session.user.id).maybeSingle();

      const { data: sessions } = await supabase.from("validation_sessions")
        .select("id, validation_result, launch_strategy_result")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }).limit(1);

      const latestSession = sessions?.[0];
      const verdict = (latestSession?.validation_result as any)?.verdict;

      if (latestSession?.id) setSessionId(latestSession.id);

      // If we already have a saved launch strategy, load it
      if (latestSession?.launch_strategy_result) {
        setStrategy(latestSession.launch_strategy_result as unknown as LaunchStrategy);
      }

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

  const handleGenerate = async () => {
    if (!context) { toast.error("Please complete onboarding first"); return; }
    const result = await generateStrategy(context);
    // Save to DB
    if (result && sessionId) {
      await supabase.from("validation_sessions")
        .update({ launch_strategy_result: result as any })
        .eq("id", sessionId);
    }
  };

  // Only auto-generate if no saved strategy exists
  useEffect(() => {
    if (context && !strategy && !isGenerating) handleGenerate();
  }, [context]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-purple" /></div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-glow/5 blur-3xl" />
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
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">Launch Strategy</h1>
            <p className="text-muted-foreground">Your plan to get the first 10-20 users — no marketing fluff</p>
          </div>

          {isGenerating && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-purple">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Generating your launch strategy...</span>
              </div>
              {streamingText && (
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">{streamingText}</pre>
                </div>
              )}
            </div>
          )}

          {strategy && !isGenerating && <LaunchStrategyDisplay strategy={strategy} />}

          {strategy && !isGenerating && (
            <div className="flex gap-4 justify-center mt-8">
              <Button variant="outline" onClick={() => { reset(); handleGenerate(); }}>
                <RotateCcw className="mr-2 h-4 w-4" />Regenerate
              </Button>
              <Button variant="hero" onClick={() => navigate("/boardroom")}>
                <Sparkles className="mr-2 h-4 w-4" />Discuss in Boardroom
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function LaunchStrategyDisplay({ strategy }: { strategy: LaunchStrategy }) {
  return (
    <div className="space-y-6">
      {/* First User Persona */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <Target className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">First User Persona</h2>
        </div>
        <p className="text-foreground mb-4">{strategy.first_user_persona.description}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Where They Hang Out</h3>
            <div className="flex flex-wrap gap-2">{strategy.first_user_persona.where_they_hang_out.map((p, i) => (
              <span key={i} className="rounded-full bg-purple/10 border border-purple/20 px-3 py-1 text-sm text-foreground">{p}</span>
            ))}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pain Level</h3>
            <p className="text-sm text-foreground">{strategy.first_user_persona.pain_level}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-purple/20 bg-purple/5 p-4">
          <h3 className="text-sm font-medium text-foreground mb-1">How to Reach Them</h3>
          <p className="text-sm text-muted-foreground">{strategy.first_user_persona.how_to_reach_them}</p>
        </div>
      </div>

      {/* Growth Channel */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <Megaphone className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Primary Growth Channel</h2>
        </div>
        <div className="rounded-lg bg-purple/10 border border-purple/20 p-4 mb-4">
          <p className="text-lg font-semibold text-foreground">{strategy.growth_channel.primary}</p>
          <p className="text-sm text-muted-foreground mt-1">{strategy.growth_channel.why}</p>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">How to Start</h3>
        <ol className="space-y-2 list-decimal list-inside mb-4">{strategy.growth_channel.how_to_start.map((s, i) => (
          <li key={i} className="text-sm text-foreground">{s}</li>
        ))}</ol>
        <p className="text-sm text-muted-foreground"><strong>Expected timeline:</strong> {strategy.growth_channel.expected_timeline}</p>
      </div>

      {/* Launch Checklist */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <CheckSquare className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Launch Checklist</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["pre_launch", "launch_day", "first_week", "first_month"] as const).map((phase) => (
            <div key={phase}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">{phase.replace("_", " ")}</h3>
              <ul className="space-y-1">{strategy.launch_checklist[phase].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple shrink-0" />{t}
                </li>
              ))}</ul>
            </div>
          ))}
        </div>
      </div>

      {/* Traction Metrics */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
            <BarChart3 className="h-5 w-5 text-purple" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Traction Metrics</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-purple/10 border border-purple/20 p-4">
            <p className="text-sm text-muted-foreground">Primary Metric</p>
            <p className="text-lg font-semibold text-foreground">{strategy.traction_metrics.primary_metric}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-foreground"><strong>Week 1 target:</strong> {strategy.traction_metrics.target_week_1}</p>
            <p className="text-sm text-foreground"><strong>Month 1 target:</strong> {strategy.traction_metrics.target_month_1}</p>
            <p className="text-sm text-muted-foreground">{strategy.traction_metrics.how_to_measure}</p>
          </div>
        </div>
      </div>

      {/* Anti-Patterns */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h2 className="text-xl font-semibold text-foreground">Common Mistakes to Avoid</h2>
        </div>
        <ul className="space-y-2">{strategy.anti_patterns.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-red-400 shrink-0">✕</span>{p}
          </li>
        ))}</ul>
      </div>
    </div>
  );
}

export default LaunchStrategyPage;

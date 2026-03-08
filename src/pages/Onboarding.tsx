import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingData {
  name: string;
  idea: string;
  targetUser: string;
  skillLevel: string;
  stage: string;
  industry: string;
  useCase: string;
}

const stages = [
  { id: "idea", label: "Idea", description: "I'm still exploring" },
  { id: "early-build", label: "Early build", description: "I've started building" },
  { id: "launched", label: "Already launched", description: "I have users" },
];

const industries = [
  { id: "business", label: "Business" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "technology", label: "Technology" },
  { id: "other", label: "Other" },
];

const useCases = [
  { id: "strategy", label: "Strategy", description: "Help me plan" },
  { id: "execution", label: "Execution", description: "Help me build" },
  { id: "clarity", label: "Clarity", description: "Help me think" },
  { id: "accountability", label: "Accountability", description: "Keep me on track" },
];

const skillLevels = [
  { id: "technical", label: "Technical", description: "I can code and build products" },
  { id: "non-technical", label: "Non-technical", description: "I need tools and platforms to build" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    idea: "",
    targetUser: "",
    skillLevel: "",
    stage: "",
    industry: "",
    useCase: "",
  });

  const totalSteps = 7;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, name, goal, target_user, stage, industry, use_case, skill_level")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
        return;
      }

      if (profile) {
        setData({
          name: profile.name || "",
          idea: profile.goal || "",
          targetUser: profile.target_user || "",
          skillLevel: (profile as any).skill_level || "",
          stage: profile.stage || "",
          industry: profile.industry || "",
          useCase: profile.use_case || "",
        });
      }

      setLoading(false);
    };

    checkOnboardingStatus();
  }, [navigate]);

  const canProceed = () => {
    switch (step) {
      case 1: return data.name.trim().length > 0;
      case 2: return data.idea.trim().length > 0;
      case 3: return data.targetUser.trim().length > 0;
      case 4: return data.skillLevel.length > 0;
      case 5: return data.stage.length > 0;
      case 6: return data.industry.length > 0;
      case 7: return data.useCase.length > 0;
      default: return false;
    }
  };

  const saveOnboarding = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("You must be logged in");
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        goal: data.idea,
        target_user: data.targetUser,
        skill_level: data.skillLevel,
        stage: data.stage,
        industry: data.industry,
        use_case: data.useCase,
        onboarding_completed: true,
      } as any)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error saving onboarding:", error);
      toast.error("Failed to save your preferences");
      setSaving(false);
      return;
    }

    toast.success("Welcome to VEX!");
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      saveOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What should we call you?</h1>
              <p className="text-muted-foreground">We'll use this to personalize your experience.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" type="text" placeholder="Enter your name" value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="text-center transition-all duration-300 focus:border-purple focus:ring-purple" autoFocus />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What are you trying to build?</h1>
              <p className="text-muted-foreground">Tell us about your idea or project.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea">Your idea</Label>
              <Input id="idea" type="text" placeholder="e.g., A marketplace for local artisans" value={data.idea}
                onChange={(e) => setData({ ...data, idea: e.target.value })}
                className="transition-all duration-300 focus:border-purple focus:ring-purple" autoFocus />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
                This is what your roadmap and AI advisors will focus on
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">Who is this for?</h1>
              <p className="text-muted-foreground">Describe your target user or customer.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUser">Target user</Label>
              <Input id="targetUser" type="text" placeholder="e.g., Small business owners who sell handmade goods"
                value={data.targetUser} onChange={(e) => setData({ ...data, targetUser: e.target.value })}
                className="transition-all duration-300 focus:border-purple focus:ring-purple" autoFocus />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
                Helps AI advisors give you targeted advice
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What's your skill level?</h1>
              <p className="text-muted-foreground">This helps us tailor recommendations for you.</p>
            </div>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
              Affects tech stack and build recommendations
            </p>
            <div className="space-y-3">
              {skillLevels.map((level) => (
                <button key={level.id} onClick={() => setData({ ...data, skillLevel: level.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-300 ${
                    data.skillLevel === level.id ? "border-purple bg-purple/10 glow-purple-sm" : "border-border hover:border-purple/50"
                  }`}>
                  <div>
                    <div className="font-medium text-foreground">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </div>
                  {data.skillLevel === level.id && <Check className="h-5 w-5 text-purple" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What stage are you at?</h1>
              <p className="text-muted-foreground">This helps us tailor our guidance.</p>
            </div>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
              This affects which AI advisors you get
            </p>
            <div className="space-y-3">
              {stages.map((stage) => (
                <button key={stage.id} onClick={() => setData({ ...data, stage: stage.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-300 ${
                    data.stage === stage.id ? "border-purple bg-purple/10 glow-purple-sm" : "border-border hover:border-purple/50"
                  }`}>
                  <div>
                    <div className="font-medium text-foreground">{stage.label}</div>
                    <div className="text-sm text-muted-foreground">{stage.description}</div>
                  </div>
                  {data.stage === stage.id && <Check className="h-5 w-5 text-purple" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What industry are you in?</h1>
              <p className="text-muted-foreground">We'll customize insights for your space.</p>
            </div>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
              This shapes your market analysis
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {industries.map((industry) => (
                <button key={industry.id} onClick={() => setData({ ...data, industry: industry.id })}
                  className={`flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-all duration-300 ${
                    data.industry === industry.id
                      ? "border-purple bg-purple/10 text-foreground glow-purple-sm"
                      : "border-border text-muted-foreground hover:border-purple/50 hover:text-foreground"
                  }`}>
                  {industry.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">What do you need most?</h1>
              <p className="text-muted-foreground">We'll prioritize what matters to you.</p>
            </div>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple" />
              This determines your primary AI advisor focus
            </p>
            <div className="space-y-3">
              {useCases.map((useCase) => (
                <button key={useCase.id} onClick={() => setData({ ...data, useCase: useCase.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-300 ${
                    data.useCase === useCase.id ? "border-purple bg-purple/10 glow-purple-sm" : "border-border hover:border-purple/50"
                  }`}>
                  <div>
                    <div className="font-medium text-foreground">{useCase.label}</div>
                    <div className="text-sm text-muted-foreground">{useCase.description}</div>
                  </div>
                  {data.useCase === useCase.id && <Check className="h-5 w-5 text-purple" />}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={vexWordmark} alt="VEX" className="h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>
          <div className="text-sm text-muted-foreground">Step {step} of {totalSteps}</div>
        </div>
      </header>

      <div className="relative z-10 h-1 bg-muted">
        <div className="h-full bg-gradient-to-r from-purple to-purple-glow transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" key={step}>{renderStep()}</div>
      </main>

      <footer className="relative z-10 border-t border-border/50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || saving}
            className={`transition-all duration-300 ${step === 1 ? "invisible" : ""}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed() || saving}
            className="bg-purple hover:bg-purple/90 text-accent-foreground transition-all duration-300 disabled:opacity-50">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <>{step === totalSteps ? "Finish" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;

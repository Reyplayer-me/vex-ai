import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";

interface OnboardingData {
  name: string;
  goal: string;
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

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    goal: "",
    stage: "",
    industry: "",
    useCase: "",
  });

  const totalSteps = 5;

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name.trim().length > 0;
      case 2:
        return data.goal.trim().length > 0;
      case 3:
        return data.stage.length > 0;
      case 4:
        return data.industry.length > 0;
      case 5:
        return data.useCase.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                What should we call you?
              </h1>
              <p className="text-muted-foreground">
                We'll use this to personalize your experience.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="text-center transition-all duration-300 focus:border-purple focus:ring-purple"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                What are you trying to build?
              </h1>
              <p className="text-muted-foreground">
                Tell us about your idea or project.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Your goal</Label>
              <Input
                id="goal"
                type="text"
                placeholder="e.g., A marketplace for local artisans"
                value={data.goal}
                onChange={(e) => setData({ ...data, goal: e.target.value })}
                className="transition-all duration-300 focus:border-purple focus:ring-purple"
                autoFocus
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                What stage are you at?
              </h1>
              <p className="text-muted-foreground">
                This helps us tailor our guidance.
              </p>
            </div>
            <div className="space-y-3">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setData({ ...data, stage: stage.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-300 ${
                    data.stage === stage.id
                      ? "border-purple bg-purple/10 glow-purple-sm"
                      : "border-border hover:border-purple/50"
                  }`}
                >
                  <div>
                    <div className="font-medium text-foreground">{stage.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {stage.description}
                    </div>
                  </div>
                  {data.stage === stage.id && (
                    <Check className="h-5 w-5 text-purple" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                What industry are you in?
              </h1>
              <p className="text-muted-foreground">
                We'll customize insights for your space.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setData({ ...data, industry: industry.id })}
                  className={`flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-all duration-300 ${
                    data.industry === industry.id
                      ? "border-purple bg-purple/10 text-foreground glow-purple-sm"
                      : "border-border text-muted-foreground hover:border-purple/50 hover:text-foreground"
                  }`}
                >
                  {industry.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 opacity-0 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                What do you need most?
              </h1>
              <p className="text-muted-foreground">
                We'll prioritize what matters to you.
              </p>
            </div>
            <div className="space-y-3">
              {useCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => setData({ ...data, useCase: useCase.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-300 ${
                    data.useCase === useCase.id
                      ? "border-purple bg-purple/10 glow-purple-sm"
                      : "border-border hover:border-purple/50"
                  }`}
                >
                  <div>
                    <div className="font-medium text-foreground">{useCase.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {useCase.description}
                    </div>
                  </div>
                  {data.useCase === useCase.id && (
                    <Check className="h-5 w-5 text-purple" />
                  )}
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
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={vexWordmark} 
              alt="VEX" 
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-purple to-purple-glow transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" key={step}>{renderStep()}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={`transition-all duration-300 ${step === 1 ? "invisible" : ""}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!canProceed()}
            className="bg-purple hover:bg-purple/90 text-accent-foreground transition-all duration-300 disabled:opacity-50"
          >
            {step === totalSteps ? "Finish" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;

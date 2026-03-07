import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Sparkles, RotateCcw, Map } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { useIdeaValidation } from "@/hooks/useIdeaValidation";
import { useRoadmapGeneration } from "@/hooks/useRoadmapGeneration";
import { useValidationSession } from "@/hooks/useValidationSession";
import { ValidationResultDisplay } from "@/components/validation/ValidationResultDisplay";
import { RoadmapDisplay } from "@/components/roadmap/RoadmapDisplay";

const ValidateIdea = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState("");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  
  const { isValidating, streamingText, result, validateIdea, reset, setResult } = useIdeaValidation();
  const { 
    isGenerating, 
    streamingText: roadmapStreamingText, 
    roadmap, 
    generateRoadmap, 
    reset: resetRoadmap,
    setRoadmap 
  } = useRoadmapGeneration();
  const { session, isLoading: isLoadingSession, saveSession, clearSession } = useValidationSession();

  // Load previous session data
  useEffect(() => {
    if (!isLoadingSession && session && !sessionLoaded) {
      setIdea(session.idea);
      setTargetUser(session.target_user || "");
      setIndustry(session.industry || "");
      setGoal(session.goal || "");
      if (session.validation_result) {
        setResult(session.validation_result);
      }
      if (session.roadmap_result) {
        setRoadmap(session.roadmap_result);
      }
      setSessionLoaded(true);
    }
  }, [isLoadingSession, session, sessionLoaded, setResult, setRoadmap]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || !targetUser.trim()) return;
    
    const validationResult = await validateIdea({
      idea: idea.trim(),
      targetUser: targetUser.trim(),
      industry: industry.trim() || "General",
      goal: goal.trim() || "Build a successful business",
    });

    // Save session after validation
    if (validationResult) {
      saveSession(
        idea.trim(),
        targetUser.trim(),
        industry.trim() || "General",
        goal.trim() || "Build a successful business",
        validationResult,
        null
      );
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!result) return;
    
    const roadmapResult = await generateRoadmap({
      idea: idea.trim(),
      targetUser: targetUser.trim(),
      industry: industry.trim() || "General",
      goal: goal.trim() || "Build a successful business",
      verdict: result.verdict,
      verdict_reasoning: result.verdict_reasoning,
    });

    // Save session with roadmap
    if (roadmapResult) {
      saveSession(
        idea.trim(),
        targetUser.trim(),
        industry.trim() || "General",
        goal.trim() || "Build a successful business",
        result,
        roadmapResult
      );
    }
  };

  const handleReset = () => {
    reset();
    resetRoadmap();
    setIdea("");
    setTargetUser("");
    setIndustry("");
    setGoal("");
    clearSession();
    setSessionLoaded(false);
  };

  const isFormValid = idea.trim() && targetUser.trim();
  const canGenerateRoadmap = result && result.verdict !== "KILL" && !roadmap;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-glow/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/dashboard">
            <img src={vexWordmark} alt="Vex" className="h-6" />
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
              {roadmap ? "Execution Roadmap" : "Validate Your Idea"}
            </h1>
            <p className="text-muted-foreground">
              {roadmap 
                ? "Your personalized 3-phase plan to validate and launch"
                : "Get brutally honest analysis with structured scores and a clear verdict"
              }
            </p>
          </div>

          {!result && !isValidating && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Idea Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Describe your idea <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="e.g., An AI-powered platform that helps students find personalized scholarship opportunities based on their profile and goals..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isValidating}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific. The more detail you provide, the better the analysis.
                </p>
              </div>

              {/* Target User */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Who is this for? <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., College students applying for financial aid"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  disabled={isValidating}
                />
              </div>

              {/* Industry & Goal */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Industry</label>
                  <Input
                    placeholder="e.g., EdTech, FinTech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isValidating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Goal</label>
                  <Input
                    placeholder="e.g., Build a profitable SaaS"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isValidating}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!isFormValid || isValidating}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Validate Idea
              </Button>
            </form>
          )}

          {/* Validation Streaming State */}
          {isValidating && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-purple">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Analyzing your idea...</span>
              </div>
              
              {streamingText && (
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
                    {streamingText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Streaming State */}
          {isGenerating && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-purple">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Generating your roadmap...</span>
              </div>
              
              {roadmapStreamingText && (
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
                    {roadmapStreamingText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Display */}
          {roadmap && !isGenerating && (
            <div className="space-y-8">
              <RoadmapDisplay roadmap={roadmap} />
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                <Button variant="hero">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continue to Boardroom
                </Button>
              </div>
            </div>
          )}

          {/* Validation Result Display (no roadmap yet) */}
          {result && !isValidating && !roadmap && !isGenerating && (
            <div className="space-y-8">
              <ValidationResultDisplay result={result} />
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Validate Another Idea
                </Button>
                
                {canGenerateRoadmap && (
                  <Button variant="hero" onClick={handleGenerateRoadmap}>
                    <Map className="mr-2 h-4 w-4" />
                    Generate Roadmap
                  </Button>
                )}
                
                {result.verdict === "KILL" && (
                  <p className="w-full text-center text-sm text-muted-foreground mt-2">
                    Roadmap generation is only available for PROCEED or PIVOT verdicts.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ValidateIdea;

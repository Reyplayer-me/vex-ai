import { useState } from "react";
import { Sparkles, CheckCircle, ArrowRight, Shield, Code, Rocket } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const generatedRoadmap = [
  { phase: "Minute 1-2", title: "Idea Validated", description: "Scored on problem clarity, market demand, execution difficulty — verdict: Proceed", icon: Shield },
  { phase: "Minute 3-5", title: "Boardroom Complete", description: "5 AI advisors debated your idea, challenged assumptions, delivered a unified decision", icon: Sparkles },
  { phase: "Minute 5-7", title: "Build Plan Ready", description: "Tech stack, architecture, feature priorities, and a First Weekend Plan — all personalized", icon: Code },
  { phase: "Minute 7-10", title: "Launch Strategy Set", description: "Target persona, growth channel, launch checklist, and traction metrics to get your first 20 users", icon: Rocket },
];

const aiFollowUps = [
  "Who exactly is the target user — students, working professionals, or career changers?",
  "What's the one thing your tool does better than ChatGPT or YouTube tutorials?",
  "Is your goal to build a business or learn by building?",
];

const DemoSection = () => {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <section className="relative px-6 py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block rounded-full border border-purple/30 bg-purple/10 px-4 py-1.5 text-sm text-purple mb-6">
            Live Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            What Vex Actually Does When You Join
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            See how your idea transforms into a validated plan with tech stack, roadmap, and launch strategy.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-8 relative overflow-hidden">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent" />
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* User Input Side */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="h-2 w-2 rounded-full bg-purple animate-pulse" />
                  Your Input
                </div>

                {/* Chat input mock */}
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple to-purple-glow flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-foreground">Y</span>
                    </div>
                    <div className="flex-1 rounded-lg border border-purple/30 bg-purple/5 p-3">
                      <p className="text-foreground">"I want to build an AI learning platform for students"</p>
                    </div>
                  </div>
                </div>

                {/* AI Follow-ups */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-purple" />
                    Boardroom challenges your assumptions
                  </div>
                  {aiFollowUps.map((question, index) => (
                    <div 
                      key={index}
                      className="rounded-lg border border-border/50 bg-card/50 p-3 flex items-start gap-3 transition-all duration-300 hover:border-purple/30 hover:bg-purple/5"
                    >
                      <ArrowRight className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Output Side */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CheckCircle className="h-4 w-4 text-purple" />
                  What You Get
                </div>

                <div className="space-y-3">
                  {generatedRoadmap.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePhase(index)}
                      className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                        activePhase === index
                          ? "border-purple bg-purple/10"
                          : "border-border/50 bg-card/50 hover:border-purple/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <item.icon className={`h-4 w-4 ${activePhase === index ? "text-purple" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            activePhase === index 
                              ? "bg-purple text-accent-foreground" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {item.phase}
                          </span>
                        </div>
                        {activePhase === index && (
                          <CheckCircle className="h-4 w-4 text-purple" />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </button>
                  ))}
                </div>

                {/* Clear Next Steps */}
                <div className="rounded-lg border border-purple/30 bg-gradient-to-r from-purple/5 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple" />
                    <span className="text-sm font-medium text-foreground">Everything persisted</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Come back anytime — your validation, roadmap, build plan, and launch strategy are saved and waiting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DemoSection;

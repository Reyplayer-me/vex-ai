import { useState } from "react";
import { Send, Sparkles, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const demoSteps = [
  { text: "I want to build an AI startup for students", delay: 0 },
];

const generatedRoadmap = [
  { phase: "Week 1-2", title: "Validate the Problem", description: "Interview 20 students about their biggest pain points with learning" },
  { phase: "Week 3-4", title: "Build MVP", description: "Create a simple AI tutor prototype using GPT API" },
  { phase: "Week 5-6", title: "Early Users", description: "Get 50 beta testers from university Discord servers" },
  { phase: "Week 7-8", title: "Iterate & Scale", description: "Refine based on feedback, prep for launch" },
];

const aiFollowUps = [
  "What specific subject or skill will your AI help students learn?",
  "Are you targeting high school, college, or graduate students?",
  "Will this be a B2C product or sold to institutions?",
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
            See how your idea transforms into a structured action plan in minutes.
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
                      <p className="text-foreground">"I want to build an AI startup for students"</p>
                    </div>
                  </div>
                </div>

                {/* AI Follow-ups */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-purple" />
                    AI asks smart follow-ups
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
                  Generated Roadmap
                </div>

                <div className="space-y-3">
                  {generatedRoadmap.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePhase(index)}
                      className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                        activePhase === index
                          ? "border-purple bg-purple/10 glow-purple-sm"
                          : "border-border/50 bg-card/50 hover:border-purple/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          activePhase === index 
                            ? "bg-purple text-accent-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.phase}
                        </span>
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
                    <span className="text-sm font-medium text-foreground">Your Next Step</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start by identifying 5 potential student communities where you can conduct interviews this week.
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

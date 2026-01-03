import { Globe, Palette, Monitor, BarChart3, ArrowUp, Check } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    step: "Step 1",
    title: "Tell Us Your Idea",
    description: "Start with just a concept — we'll guide you through refining it into a business.",
    preview: (
      <div className="rounded-xl border border-border bg-background/50 p-6 flex flex-col items-center justify-center h-48">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-purple-600/30 to-transparent blur-lg animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-purple-500/30 blur-md" />
        </div>
        <span className="text-sm text-muted-foreground">Processing Your Idea.</span>
      </div>
    ),
  },
  {
    step: "Step 2",
    title: "Customize Your Build",
    description: "Choose your features, style, and vibe. Core handles code, design, and setup.",
    preview: (
      <div className="rounded-xl border border-border bg-background/50 p-4 h-48">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span>← →</span>
          <div className="flex-1 h-2 rounded bg-muted" />
          <span>□ - ×</span>
        </div>
        <div className="flex gap-2 h-32">
          <div className="w-8 flex flex-col gap-2 py-2">
            <div className="w-4 h-4 rounded border border-border" />
            <div className="w-4 h-4 rounded border border-border" />
            <div className="w-4 h-4 rounded border border-border" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-2">Colour picker</div>
            <div className="grid grid-cols-3 gap-1 h-20">
              <div className="rounded bg-purple-400 transition-transform duration-300 hover:scale-110" />
              <div className="rounded bg-purple-500 transition-transform duration-300 hover:scale-110" />
              <div className="rounded bg-purple-600 transition-transform duration-300 hover:scale-110" />
              <div className="rounded bg-purple-300 transition-transform duration-300 hover:scale-110" />
              <div className="rounded bg-purple-400 transition-transform duration-300 hover:scale-110" />
              <div className="rounded bg-purple-500 transition-transform duration-300 hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "Step 3",
    title: "Let Core Launch It",
    description: "We generate your full startup — website, branding, content, and more — auto-magically.",
    preview: (
      <div className="rounded-xl border border-border bg-background/50 p-6 h-48 flex items-center justify-center gap-8">
        <div className="relative animate-float">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/30 blur-sm animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-purple-500/30" />
        </div>
        <div className="flex items-center">
          <div className="w-16 h-0.5 bg-purple-500" />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        </div>
        <Globe className="h-10 w-10 text-purple animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
    ),
  },
  {
    step: "Step 4",
    title: "Grow With Ease",
    description: "Track startup progress, streamline your strategy, and scale smarter using integrated AI systems and founder tools.",
    preview: (
      <div className="rounded-xl border border-border bg-background/50 p-4 h-48 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 transition-all duration-300 hover:bg-card/50">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-foreground">Idea Tracker</div>
              <div className="text-xs text-muted-foreground">Up to Date</div>
            </div>
          </div>
          <div className="h-4 w-4 rounded-full border-2 border-purple" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 transition-all duration-300 hover:bg-card/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-foreground">Roadmap Builder</div>
              <div className="text-xs text-muted-foreground">74% Completed</div>
            </div>
          </div>
          <ArrowUp className="h-4 w-4 text-purple" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 transition-all duration-300 hover:bg-card/50">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-foreground">MentorSync System</div>
              <div className="text-xs text-muted-foreground">1 Match Pending Approval</div>
            </div>
          </div>
          <Check className="h-4 w-4 text-purple" />
        </div>
      </div>
    ),
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Our Process
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Our Simple, Smart,
            <br />
            and Scalable Process
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            We design, develop, and implement automation tools that help you work
            smarter, not harder
          </p>
        </AnimatedSection>

        {/* Steps Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((item, index) => (
            <AnimatedSection key={item.step} delay={index * 150}>
              <div className="rounded-2xl border border-border bg-card/30 p-6 transition-all duration-500 hover:border-purple/30 hover:shadow-lg hover:shadow-purple/5 h-full">
                <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {item.description}
                </p>
                {item.preview}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

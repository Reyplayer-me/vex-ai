import { Lightbulb, Target, Calendar, MessageSquare, Brain } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Idea Validation",
    description: "Break down your idea, identify risks and assumptions, and get suggestions for improvement.",
  },
  {
    icon: Target,
    title: "Strategy Builder",
    description: "Define positioning, identify target users, and outline a clear go-to-market plan.",
  },
  {
    icon: Calendar,
    title: "Weekly Action Plan",
    description: "Know exactly what to do this week. Focused, realistic tasks that move you forward.",
  },
  {
    icon: MessageSquare,
    title: "Decision Support",
    description: "Ask a question, get a structured recommendation with clear tradeoffs — not vague advice.",
  },
  {
    icon: Brain,
    title: "Memory & Continuity",
    description: "The system remembers past decisions and adapts future guidance to your context.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Core Features
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
            Everything you need to build.
          </h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30"
            >
              <feature.icon className="mb-4 h-5 w-5 text-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

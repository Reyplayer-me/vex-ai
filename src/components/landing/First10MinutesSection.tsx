import { Clock, Sparkles, Users, Compass, CheckCircle } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const timelineSteps = [
  {
    minute: "1",
    title: "Describe your idea",
    description: "Tell us what you're building in your own words",
    icon: Sparkles,
  },
  {
    minute: "3",
    title: "AI boardroom created",
    description: "Your personalized team of AI advisors is assembled",
    icon: Users,
  },
  {
    minute: "5",
    title: "Roadmap generated",
    description: "Get a clear, week-by-week action plan",
    icon: Compass,
  },
  {
    minute: "10",
    title: "You know exactly what to do next",
    description: "No more guessing—just execution",
    icon: CheckCircle,
  },
];

const First10MinutesSection = () => {
  return (
    <section className="relative px-6 py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-4 py-1.5 text-sm text-purple mb-6">
            <Clock className="h-4 w-4" />
            Quick Start
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Your First 10 Minutes on Vex
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            From idea to action plan in less time than it takes to make coffee.
          </p>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple via-purple/50 to-transparent hidden md:block" />

          <div className="space-y-8">
            {timelineSteps.map((step, index) => (
              <AnimatedSection key={step.minute} delay={index * 150}>
                <div className="flex gap-6 items-start">
                  {/* Minute badge */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple/30 bg-purple/10 transition-all duration-300 hover:bg-purple/20 hover:scale-105">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-purple">{step.minute}</span>
                        <span className="block text-xs text-muted-foreground">min</span>
                      </div>
                    </div>
                    {/* Connector dot */}
                    <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 -translate-x-[calc(2rem-2px)] h-2 w-2 rounded-full bg-purple hidden md:block" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-xl border border-border bg-card/30 p-6 transition-all duration-300 hover:border-purple/30 hover:bg-card/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 rounded-lg bg-muted p-2">
                        <step.icon className="h-5 w-5 text-purple" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default First10MinutesSection;

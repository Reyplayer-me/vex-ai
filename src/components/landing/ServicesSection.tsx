import { Shield, Users, Map, Code, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";

const features = [
  {
    icon: Shield,
    tag: "Validation",
    title: "Idea Validation Engine",
    description:
      "Get a brutal, honest verdict on your idea. Scored on problem clarity, market demand, execution difficulty, and differentiation.",
    highlights: ["Problem clarity score", "Market realism check", "Proceed / Pivot / Kill verdict"],
    accent: false,
  },
  {
    icon: Users,
    tag: "AI Boardroom",
    title: "5-Agent AI Boardroom",
    description:
      "Not one AI — five. A CEO, Execution Officer, Risk Analyst, Psychologist, and Industry Expert debate your idea like a real board meeting.",
    highlights: ["Multi-agent debate", "Founder bias detection", "Unified board decision"],
    accent: true,
  },
  {
    icon: Map,
    tag: "Roadmap",
    title: "Execution Roadmap",
    description:
      "A phased, practical roadmap — not generic advice. Foundations → MVP → Launch → Iterate, with skills, tools, and deliverables for each phase.",
    highlights: ["Phase-by-phase plan", "Skills & tools per phase", "Critical assumptions listed"],
    accent: false,
  },
  {
    icon: Code,
    tag: "Build Plan",
    title: "Product Build Foundations",
    description:
      "Tech stack, architecture, feature priority, project structure — tailored to your skill level. Technical founders get code, non-technical get platforms.",
    highlights: ["Recommended tech stack", "Feature priority matrix", "First Weekend Plan"],
    accent: false,
  },
  {
    icon: Rocket,
    tag: "Launch",
    title: "Launch Strategy",
    description:
      "Your plan to get the first 10-20 users. Target persona, growth channel, launch checklist, and traction metrics — no marketing fluff.",
    highlights: ["First user persona", "Growth channel playbook", "Week 1 & Month 1 targets"],
    accent: false,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            The Full Stack
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            From Raw Idea to First Users
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Five integrated tools that take you through the entire early-stage journey.
            No fluff, no generic advice — just structured execution.
          </p>
        </AnimatedSection>

        {/* Feature Cards - Top Row (2 cols) */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {features.slice(0, 2).map((feature, index) => (
            <AnimatedSection key={feature.tag} delay={index * 150}>
              <div
                className={`relative rounded-2xl border p-8 h-full transition-all duration-500 hover:-translate-y-1 ${
                  feature.accent
                    ? "border-purple/40 bg-gradient-to-br from-purple/5 to-transparent hover:shadow-xl hover:shadow-purple/10"
                    : "border-border bg-card/30 hover:border-purple/30 hover:shadow-lg hover:shadow-purple/5"
                }`}
              >
                <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
                  {feature.tag}
                </span>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
                    <feature.icon className="h-5 w-5 text-purple" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-all duration-300 hover:bg-purple/10 hover:border-purple/30"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Feature Cards - Bottom Row (3 cols) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {features.slice(2).map((feature, index) => (
            <AnimatedSection key={feature.tag} delay={(index + 2) * 150}>
              <div className="relative rounded-2xl border border-border bg-card/30 p-6 h-full transition-all duration-500 hover:border-purple/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple/5">
                <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
                  {feature.tag}
                </span>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
                    <feature.icon className="h-4 w-4 text-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-all duration-300 hover:bg-purple/10 hover:border-purple/30"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={800} className="text-center mt-12">
          <Link to="/auth?mode=signup">
            <button className="inline-flex items-center gap-2 rounded-full bg-purple px-6 py-3 text-sm font-medium text-accent-foreground transition-all duration-300 hover:bg-purple/90 hover:shadow-lg hover:shadow-purple/20">
              Start Validating Your Idea
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ServicesSection;

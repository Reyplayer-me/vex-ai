import { Compass, Boxes, Megaphone, Wallet } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const advisors = [
  {
    icon: Compass,
    title: "Strategy Advisor",
    oneLiner: "Tells you what matters and what's a waste of time.",
    color: "from-purple to-purple-glow",
  },
  {
    icon: Boxes,
    title: "Product Advisor",
    oneLiner: "Turns ideas into buildable MVPs.",
    color: "from-cyan-500 to-cyan-400",
  },
  {
    icon: Megaphone,
    title: "Marketing Advisor",
    oneLiner: "Makes people care about what you're building.",
    color: "from-amber-500 to-amber-400",
  },
  {
    icon: Wallet,
    title: "Finance Advisor",
    oneLiner: "Keeps you funded and not broke.",
    color: "from-emerald-500 to-emerald-400",
  },
];

const BoardroomSection = () => {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            The AI Boardroom
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Your Personal Board of Advisors
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Each advisor brings specialized expertise to help you make better decisions faster.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {advisors.map((advisor, index) => (
            <AnimatedSection key={advisor.title} delay={index * 100}>
              <div className="group relative rounded-2xl border border-border bg-card/30 p-6 transition-all duration-500 hover:border-purple/30 hover:shadow-lg hover:shadow-purple/5 h-full">
                {/* Icon */}
                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${advisor.color} transition-transform duration-300 group-hover:scale-110`}>
                  <advisor.icon className="h-6 w-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {advisor.title}
                </h3>

                {/* One-liner */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{advisor.oneLiner}"
                </p>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardroomSection;

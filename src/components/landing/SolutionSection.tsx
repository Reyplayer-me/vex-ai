import { Users, FileText, Zap } from "lucide-react";

const solutions = [
  {
    icon: Users,
    title: "Advisors you don't have",
    description: "Strategic guidance without the network or cost.",
  },
  {
    icon: FileText,
    title: "Strategy docs you never finish",
    description: "Clear, actionable plans generated for you.",
  },
  {
    icon: Zap,
    title: "Motivation you lose",
    description: "Consistent accountability that adapts to you.",
  },
];

const SolutionSection = () => {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-purple">
            The solution
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
            Vex.ai replaces what you're missing.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            It guides you step-by-step with clarity — not generic advice, but structured decisions tailored to your context.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-3">
          {solutions.map((solution, index) => (
            <div 
              key={solution.title} 
              className="group text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple/10 border border-purple/20 transition-all duration-300 group-hover:bg-purple/20 group-hover:scale-110 group-hover:glow-purple-sm">
                <solution.icon className="h-6 w-6 text-purple" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {solution.title}
              </h3>
              <p className="text-muted-foreground">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;

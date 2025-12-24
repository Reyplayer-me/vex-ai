import { AlertCircle, Compass, RefreshCcw, Layers } from "lucide-react";

const problems = [
  {
    icon: AlertCircle,
    title: "Overwhelmed",
    description: "Too many decisions, no structure to make them clearly.",
  },
  {
    icon: Compass,
    title: "No roadmap",
    description: "No clear path from idea to execution.",
  },
  {
    icon: RefreshCcw,
    title: "No feedback loop",
    description: "Building in the dark without validation.",
  },
  {
    icon: Layers,
    title: "No accountability",
    description: "Easy to lose momentum without guidance.",
  },
];

const ProblemSection = () => {
  return (
    <section className="border-t border-border bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            The problem
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Founders are drowning.
          </h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-muted-foreground/30"
            >
              <problem.icon className="mb-4 h-5 w-5 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {problem.title}
              </h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;

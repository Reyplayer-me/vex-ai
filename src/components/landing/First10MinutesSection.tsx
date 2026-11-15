import AnimatedSection from "./AnimatedSection";

const steps = [
  { time: "1 min", title: "Type your idea", description: "No signup. One or two sentences is enough." },
  { time: "~1 min", title: "Get the verdict", description: "PROCEED, PIVOT or KILL, four scores, the top three risks and real competitors with links." },
  { time: "~3 min", title: "Unlock the full report", description: "Free with an email during beta: the five-advisor debate and the board's decision." },
  { time: "~5 min", title: "Get the plan", description: "A four-phase roadmap, a build plan for your skill level and a launch plan for your first users." },
];

const First10MinutesSection = () => {
  return (
    <section id="what-you-get" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-semibold text-foreground md:text-4xl">What you get in 10 minutes</h2>
          <p className="text-muted-foreground">Times are typical, not promises.</p>
        </AnimatedSection>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 100}>
              <li className="flex gap-4 rounded-xl border border-border bg-card/30 p-5">
                <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border border-purple/30 bg-purple/10 text-center text-sm font-bold text-purple-glow">
                  {step.time}
                </span>
                <div>
                  <h3 className="mb-1 font-sans text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </li>
            </AnimatedSection>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default First10MinutesSection;

const steps = [
  {
    number: "01",
    title: "Onboard",
    description: "Define your goal, industry, and stage.",
  },
  {
    number: "02",
    title: "Get strategy",
    description: "Receive a clear plan tailored to you.",
  },
  {
    number: "03",
    title: "Take action",
    description: "Turn strategy into weekly tasks.",
  },
  {
    number: "04",
    title: "Review",
    description: "Track progress and learn from results.",
  },
  {
    number: "05",
    title: "Adapt",
    description: "Evolve based on what's working.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="border-t border-border bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            How it works
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            From idea to execution.
          </h2>
        </div>
        
        <div className="relative">
          <div className="absolute left-[23px] top-0 hidden h-full w-px bg-border sm:block" />
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-6">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground">
                  {step.number}
                </div>
                <div className="pt-2">
                  <h3 className="mb-1 text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

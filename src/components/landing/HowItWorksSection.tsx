const steps = [
  {
    n: "1",
    title: "Tell us the idea and who it's for",
    body: "Six short questions during signup: the idea, the target user, the industry, your stage, your goal. You answer once and every tool uses it.",
    mock: (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">Who is this for?</p>
        <div className="rounded border border-border px-3 py-2 text-foreground">Second-year engineering students who fall behind by week 4</div>
        <p className="pt-2 text-muted-foreground">Your goal</p>
        <div className="flex gap-2">
          <span className="rounded border border-purple px-3 py-1 text-foreground">Build a company</span>
          <span className="rounded border border-border px-3 py-1 text-muted-foreground">Learn</span>
        </div>
      </div>
    ),
  },
  {
    n: "2",
    title: "The board argues about it",
    body: "A strategist, a product lead, a growth lead, a technical advisor and a devil's advocate each respond in turn. You can push back and ask follow-ups.",
    mock: (
      <div className="space-y-3 text-sm">
        <p><span className="font-semibold text-purple-glow">Growth:</span> <span className="text-foreground">Students won't pay. Universities might. Who signs the cheque?</span></p>
        <p><span className="font-semibold text-purple-glow">Devil's Advocate:</span> <span className="text-foreground">Notion templates already do this for free.</span></p>
        <p><span className="font-semibold text-purple-glow">Product:</span> <span className="text-foreground">Then the wedge is syllabus import. Nobody else parses PDFs.</span></p>
      </div>
    ),
  },
  {
    n: "3",
    title: "You leave with a plan you can start tonight",
    body: "A scored verdict, a three-phase roadmap, a suggested tech stack with a first-weekend plan, and a launch plan aimed at your first 20 users. All saved.",
    mock: (
      <div className="space-y-2 text-sm">
        {["Foundations · weeks 1–2", "Product · weeks 3–6", "Launch · weeks 7–8"].map((p, i) => (
          <div key={p} className="flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-foreground">{p}</span>
            <span className="text-muted-foreground">{[4, 6, 5][i]} tasks</span>
          </div>
        ))}
      </div>
    ),
  },
];

const HowItWorksSection = () => (
  <section id="how" className="px-6 py-24">
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-16 max-w-xl text-3xl font-semibold text-foreground md:text-4xl">How it works</h2>
      <div className="space-y-16">
        {steps.map((s, i) => (
          <div key={s.n} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <span className="mb-4 block text-5xl font-semibold text-purple">{s.n}</span>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="max-w-md text-muted-foreground">{s.body}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-6">{s.mock}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

const rows = [
  ["Remembers your idea", "You re-explain it every chat", "Saved once, used by every tool"],
  ["Tells you the idea is bad", "Rarely. It's trained to be agreeable", "A devil's advocate is built into every session"],
  ["Gives a clear answer", "Long lists of 'it depends'", "PROCEED, PIVOT or KILL, with a score"],
  ["Output you can act on", "Advice in paragraphs", "Week-by-week roadmap and a first-weekend build plan"],
  ["Picks up where you left off", "Scroll back and hope", "Verdict, roadmap and plans stay on your dashboard"],
];

const ComparisonSection = () => (
  <section className="px-6 py-24">
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">Vex vs. asking a general chatbot</h2>
      <p className="mb-10 max-w-xl text-muted-foreground">You can absolutely ask ChatGPT about your idea. Here's what changes when the tool is built for this one job.</p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-border bg-card">
            <tr>
              <th className="p-4 font-medium text-muted-foreground"></th>
              <th className="p-4 font-medium text-muted-foreground">General chatbot</th>
              <th className="p-4 font-medium text-purple-glow">Vex</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, a, b]) => (
              <tr key={k} className="border-b border-border last:border-0">
                <td className="p-4 font-medium text-foreground">{k}</td>
                <td className="p-4 text-muted-foreground">{a}</td>
                <td className="p-4 text-foreground">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default ComparisonSection;

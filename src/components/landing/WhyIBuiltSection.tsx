// Edit FOUNDER_NAME to your real name.
const FOUNDER_NAME = "[Your name]";

const WhyIBuiltSection = () => (
  <section className="px-6 py-24">
    <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[200px_1fr]">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Why I built this</h2>
      <div className="max-w-2xl space-y-4 text-lg text-foreground">
        <p>I've started more projects than I've finished. Most of them died for reasons I could have spotted in the first week, if someone had asked me the right questions.</p>
        <p>Friends were too nice. Generic AI chats agreed with everything. What I wanted was a room full of people who'd poke holes in the idea, then help me plan the next step if it held up.</p>
        <p>So I built that. It's early, it's free right now, and I'd genuinely like to hear where it falls short.</p>
        <p className="text-muted-foreground">— {FOUNDER_NAME}, founder of Vex</p>
      </div>
    </div>
  </section>
);

export default WhyIBuiltSection;

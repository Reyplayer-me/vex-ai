import FeedbackForm from "@/components/FeedbackForm";

const EarlyAccessSection = () => (
  <section id="feedback" className="px-6 py-24">
    <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-2">
      <div>
        <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">Early access: free while we're growing</h2>
        <p className="mb-4 text-muted-foreground">There are no testimonials here yet because Vex is new. We'd rather show you nothing than make something up.</p>
        <p className="mb-4 text-muted-foreground">If you try it, tell us what worked and what didn't. Early feedback shapes what we build next.</p>
        <p className="text-sm text-muted-foreground">
          About your data: your idea and AI results are stored in your account so you can come back to them. They're sent to our AI provider only to generate your answers, never sold, and you can ask us to delete them at any time.
        </p>
      </div>
      <div className="rounded-md border border-border bg-card p-6">
        <FeedbackForm submitLabel="Send feedback" />
      </div>
    </div>
  </section>
);

export default EarlyAccessSection;

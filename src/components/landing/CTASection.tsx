import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="px-6 py-24">
    <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-6 border-t border-border pt-16 md:flex-row md:items-end">
      <div>
        <h2 className="mb-3 text-3xl font-semibold text-foreground md:text-4xl">Got an idea you keep thinking about?</h2>
        <p className="max-w-lg text-muted-foreground">Ten minutes from now you'll know whether to build it. Built for people who want to build real things.</p>
      </div>
      <Link to="/auth?mode=signup">
        <Button className="h-11 bg-purple px-8 text-accent-foreground hover:bg-purple/90">Sign up free</Button>
      </Link>
    </div>
  </section>
);

export default CTASection;

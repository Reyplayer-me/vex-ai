import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="border-t border-border px-6 py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
          Stop guessing.
          <br />
          <span className="text-muted-foreground">Start building.</span>
        </h2>
        
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Join founders who are building with clarity, structure, and an AI that actually understands their context.
        </p>
        
        <Link to="/auth?mode=signup">
          <Button variant="hero" size="xl" className="group">
            Create Your Account
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;

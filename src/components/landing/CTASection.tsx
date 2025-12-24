import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative border-t border-border px-6 py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple/10 blur-3xl" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
          Stop guessing.
          <br />
          <span className="text-gradient">Start building.</span>
        </h2>
        
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Join founders who are building with clarity, structure, and an AI that actually understands their context.
        </p>
        
        <Link to="/auth?mode=signup">
          <Button variant="hero" size="xl" className="group glow-purple hover:scale-105 transition-all duration-300">
            Create Your Account
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;

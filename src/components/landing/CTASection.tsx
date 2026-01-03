import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        {/* CTA Card with gradient */}
        <div className="relative overflow-hidden rounded-3xl border border-purple/20 bg-gradient-to-br from-purple/10 via-purple/5 to-transparent p-12 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-full bg-gradient-to-b from-purple/20 via-purple/10 to-transparent blur-2xl" />
          </div>

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl md:text-5xl font-semibold text-foreground">
              Let AI do the Work so
              <br />
              you can Scale Faster
            </h2>
            
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Get Started Today and Start Automating
            </p>
            
            <Link to="/auth?mode=signup">
              <Button className="bg-purple hover:bg-purple/90 text-foreground font-medium rounded-lg px-6 py-3 h-auto transition-all duration-200 group">
                Join Waitlist
                <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

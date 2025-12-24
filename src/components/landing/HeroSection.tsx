import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          Now in private beta
        </div>
        
        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Build your company with
          <br />
          <span className="text-muted-foreground">an AI co-founder.</span>
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Vex.ai helps you think clearly, decide faster, and execute better — from idea to scale.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="xl" className="group">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/auth?mode=login">
            <Button variant="heroOutline" size="xl">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

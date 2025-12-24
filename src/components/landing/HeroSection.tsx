import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple/20 blur-3xl animate-pulse-glow" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-purple-glow/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div 
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/5 px-4 py-1.5 text-sm text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple animate-pulse-glow" />
          Now in private beta
        </div>
        
        <h1 
          className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl opacity-0 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Build your company with
          <br />
          <span className="text-gradient">an AI co-founder.</span>
        </h1>
        
        <p 
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl opacity-0 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          Vex.ai helps you think clearly, decide faster, and execute better — from idea to scale.
        </p>
        
        <div 
          className="flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="xl" className="group glow-purple-sm hover:glow-purple transition-all duration-300">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/auth?mode=login">
            <Button variant="heroOutline" size="xl" className="hover:border-purple/50 transition-all duration-300">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

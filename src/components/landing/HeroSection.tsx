import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      {/* Purple orb glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-[600px] h-[600px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/40 via-purple-500/30 to-transparent blur-3xl animate-pulse" />
          <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-purple-700/50 via-purple-400/20 to-transparent blur-2xl" />
          <div className="absolute inset-24 rounded-full bg-purple-500/20 blur-xl" />
        </div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div 
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-1 py-1 pr-4 opacity-0 animate-fade-in"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-medium text-background">
            New
          </span>
          <span className="text-sm text-muted-foreground">
            Automated Business Assistant
          </span>
        </div>
        
        <h1 
          className="mb-6 text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl opacity-0 animate-fade-in"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          Smart Startup Tools for
          <br />
          <span className="text-foreground">Ambitious Minds.</span>
        </h1>
        
        <p 
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          Vex.ai fuels your ideas with AI-powered execution, strategy & scale.
        </p>
        
        <div 
          className="flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0 animate-fade-in"
          style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
        >
          <Link to="/auth?mode=signup">
            <Button className="bg-purple hover:bg-purple/90 text-foreground font-medium rounded-lg px-6 py-3 h-auto transition-all duration-200 group">
              Join Waitlist
              <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple transition-all duration-300 group-hover:glow-purple-sm">
            <span className="text-sm font-bold text-accent-foreground">V</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Vex.ai</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost" size="sm" className="hover:text-purple transition-colors duration-300">
              Log In
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="default" size="sm" className="bg-purple hover:bg-purple/90 text-accent-foreground transition-all duration-300 hover:glow-purple-sm">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

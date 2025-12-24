import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
            <span className="text-sm font-bold text-background">V</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Vex.ai</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

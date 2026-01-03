import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import vexLogo from "@/assets/vex-logo.png";

const Header = () => {
  const navItems = ["Services", "Process", "Benefits", "Pricing", "FAQs"];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={vexLogo} 
            alt="VEX Logo" 
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-card/50 backdrop-blur-md px-2 py-1.5">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-full hover:bg-muted/50"
            >
              {item}
            </button>
          ))}
        </nav>

        <Link to="/auth?mode=signup">
          <Button className="bg-lime-400 hover:bg-lime-300 text-background font-medium rounded-full px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-lime-400/20">
            Join Waitlist
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;

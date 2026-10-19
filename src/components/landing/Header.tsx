import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import vexWordmark from "@/assets/vex-wordmark.png";

const navItems = [
  { id: "how", label: "How it works" },
  { id: "services", label: "Tools" },
  { id: "pricing", label: "Pricing" },
  { id: "faqs", label: "FAQ" },
];

const Header = () => (
  <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background px-6 py-3">
    <div className="mx-auto flex max-w-[1100px] items-center justify-between">
      <Link to="/" className="flex items-center">
        <img src={vexWordmark} alt="VEX" className="h-7 w-auto" />
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="text-sm text-muted-foreground hover:text-foreground">{item.label}</a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/auth" className="hidden px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:block">Log in</Link>
        <Link to="/auth?mode=signup">
          <Button className="h-11 bg-purple px-5 text-accent-foreground hover:bg-purple/90">Sign up</Button>
        </Link>
      </div>
    </div>
  </header>
);

export default Header;

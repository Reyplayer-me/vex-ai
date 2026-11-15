import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import vexWordmark from "@/assets/vex-wordmark.png";

const navItems = [
  { label: "Sample", href: "/sample" },
  { label: "The board", href: "/#board" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const Header = () => {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link to="/" className="flex min-h-[44px] items-center" aria-label="Vex home">
          <img src={vexWordmark} alt="Vex" className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild variant="outline" className="h-11 rounded-full px-5">
              <Link to="/ideas">My ideas</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-11 rounded-full px-4 text-muted-foreground">
              <Link to="/auth?mode=login">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="cta" className="hidden h-11 rounded-full px-5 font-semibold sm:inline-flex">
            <a href="/#test">Test my idea</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative px-6 py-16">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent" />
      
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-border bg-card/30 p-8 md:p-12">
          <div className="flex flex-col gap-8">
            {/* Logo and description */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-purple uppercase tracking-wider">VENTURE</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple/20 flex items-center justify-center">
                  <span className="text-2xl font-bold italic text-purple">V</span>
                </div>
                <span className="text-3xl font-bold italic text-purple tracking-tight">VEX</span>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground mt-2">
                Minimal. Intentional. Relentless. VEX empowers creators
                to launch with precision and scale without compromise.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Bottom row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} VEX. All rights reserved
              </p>
              
              <nav className="flex items-center gap-6">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                  Home
                </Link>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

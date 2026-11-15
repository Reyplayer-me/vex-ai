import { Link } from "react-router-dom";
import vexWordmark from "@/assets/vex-wordmark.png";

// Set VITE_CONTACT_EMAIL to publish a contact address; until then Contact opens the privacy page section.
export const CONTACT_EMAIL: string | undefined = import.meta.env.VITE_CONTACT_EMAIL;

const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <img src={vexWordmark} alt="Vex" className="mx-auto h-6 w-auto sm:mx-0" />
          <p className="mt-2 text-sm text-muted-foreground">The AI board that tells you whether to build your idea or kill it.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-2 gap-y-1" aria-label="Footer">
          <Link to="/privacy" className="inline-flex min-h-[44px] items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="inline-flex min-h-[44px] items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Terms
          </Link>
          <a href={CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : "/privacy#contact"} className="inline-flex min-h-[44px] items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Contact
          </a>
        </nav>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Vex. Structured opinions, not guarantees.</p>
    </footer>
  );
};

export default Footer;

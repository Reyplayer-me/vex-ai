import { Link } from "react-router-dom";
import vexWordmark from "@/assets/vex-wordmark.png";

const links = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

const Footer = () => (
  <footer className="border-t border-border px-6 py-12">
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <img src={vexWordmark} alt="VEX" className="mb-3 h-7 w-auto" />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vex.ai</p>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="py-2 text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default Footer;

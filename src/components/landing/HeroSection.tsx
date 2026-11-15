import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { IdeaForm } from "@/components/verdict/IdeaForm";

const HeroSection = () => {
  return (
    <section id="test" className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden" aria-hidden>
        <div className="h-[520px] w-[520px] rounded-full bg-gradient-to-br from-purple-600/35 via-purple-500/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-balance text-3xl font-bold leading-tight text-foreground sm:text-5xl">
          Tell us your startup idea. We'll tell you whether to build it or kill it.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
          Five AI advisors check the web for real competitors, score your idea and tell you what could sink it.
        </p>

        <IdeaForm />

        <Link
          to="/sample"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-purple-glow underline-offset-4 hover:underline"
        >
          <FileText className="h-4 w-4" aria-hidden />
          See a sample report first
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;

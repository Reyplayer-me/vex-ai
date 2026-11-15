import { advisors } from "@/lib/advisors";
import AnimatedSection from "./AnimatedSection";


const BoardroomSection = () => {
  return (
    <section id="board" className="relative px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            The AI Boardroom
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Meet the board
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
             Five perspectives. One decision worth questioning.
          </p>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {advisors.map((advisor, index) => (
            <AnimatedSection key={advisor.name} delay={index * 100}>
              <div className="group relative rounded-lg border border-border bg-card/30 p-5 h-full">
                {/* Icon */}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${advisor.color}`}>
                  <advisor.icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {advisor.name}
                </h3>

                {/* One-liner */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {advisor.line}
                </p>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardroomSection;

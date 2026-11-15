import { advisors } from "@/lib/advisors";
import AnimatedSection from "./AnimatedSection";


const BoardroomSection = () => {
  return (
    <section id="board" className="relative px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">
            Meet the board
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
             Five advisors who look at your idea from different angles, and often disagree.
          </p>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {advisors.map((advisor, index) => (
            <AnimatedSection key={advisor.name} delay={index * 100}>
              <div className={`group relative h-full rounded-lg border ${advisor.border} bg-card/30 p-5`}>
                {/* Icon */}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg ${advisor.bg} ${advisor.color}`}>
                  <advisor.icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className={`mb-2 font-sans text-xl font-semibold ${advisor.color}`}>
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

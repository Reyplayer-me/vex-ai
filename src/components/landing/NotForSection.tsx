import { X, Check } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const notFor = [
  "People looking for motivation quotes",
  "People who won't execute",
  "People who want vague advice",
];

const forPeople = [
  "Builders who want clarity",
  "Thinkers who want structure",
  "Founders who want leverage",
];

const NotForSection = () => {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Who This Is For
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            We're not for everyone. And that's the point.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Not For */}
          <AnimatedSection delay={100}>
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" />
                Vex.ai is not for
              </h3>
              <ul className="space-y-4">
                {notFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive/70 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* For */}
          <AnimatedSection delay={200}>
            <div className="rounded-2xl border border-purple/20 bg-purple/5 p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Check className="h-5 w-5 text-purple" />
                It is for
              </h3>
              <ul className="space-y-4">
                {forPeople.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-purple mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        {/* Brand authority line */}
        <AnimatedSection delay={400} className="mt-16">
          <div className="text-center">
            <p className="text-xl text-muted-foreground italic">
              "Built for people who want to build real things."
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default NotForSection;

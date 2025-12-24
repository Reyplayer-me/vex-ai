import { GraduationCap, Rocket, User, Palette } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Turn class projects into real ventures.",
  },
  {
    icon: Rocket,
    title: "First-time founders",
    description: "Navigate the unknown with confidence.",
  },
  {
    icon: User,
    title: "Solo builders",
    description: "Move faster without a team.",
  },
  {
    icon: Palette,
    title: "Creators",
    description: "Transform ideas into sustainable businesses.",
  },
];

const AudienceSection = () => {
  return (
    <section className="border-t border-border bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-purple">
            Who it's for
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Built for builders.
          </h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience, index) => (
            <div
              key={audience.title}
              className="group rounded-lg border border-border bg-background p-6 text-center transition-all duration-300 hover:border-purple/50 hover:-translate-y-1 hover:glow-purple-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple/10 border border-purple/20 transition-all duration-300 group-hover:bg-purple/20 group-hover:scale-110">
                <audience.icon className="h-6 w-6 text-purple" />
              </div>
              <h3 className="mb-2 font-medium text-foreground">
                {audience.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;

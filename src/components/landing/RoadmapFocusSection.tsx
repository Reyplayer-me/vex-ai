import { useState } from "react";
import { Zap, DollarSign, GraduationCap, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const focusOptions = [
  { id: "speed", label: "Speed", icon: Zap, description: "Get to market fastest" },
  { id: "cost", label: "Cost", icon: DollarSign, description: "Minimize expenses" },
  { id: "learning", label: "Learning", icon: GraduationCap, description: "Build your skills" },
  { id: "scale", label: "Scale", icon: TrendingUp, description: "Plan for growth" },
];

const roadmapVariants = {
  speed: [
    { week: "Week 1", task: "Ship MVP with core feature only" },
    { week: "Week 2", task: "Get 10 paying customers" },
    { week: "Week 3", task: "Iterate based on feedback" },
  ],
  cost: [
    { week: "Week 1", task: "Build with free tools and open-source" },
    { week: "Week 2", task: "Validate with landing page + waitlist" },
    { week: "Week 3", task: "Bootstrap first sales before spending" },
  ],
  learning: [
    { week: "Week 1", task: "Study competitor products deeply" },
    { week: "Week 2", task: "Build prototype to learn the tech stack" },
    { week: "Week 3", task: "Interview users to understand the market" },
  ],
  scale: [
    { week: "Week 1", task: "Design architecture for 10k users" },
    { week: "Week 2", task: "Set up analytics and monitoring" },
    { week: "Week 3", task: "Build automated onboarding flow" },
  ],
};

const RoadmapFocusSection = () => {
  const [selectedFocus, setSelectedFocus] = useState<keyof typeof roadmapVariants>("speed");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = (focus: keyof typeof roadmapVariants) => {
    setIsRegenerating(true);
    setTimeout(() => {
      setSelectedFocus(focus);
      setIsRegenerating(false);
    }, 500);
  };

  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <RefreshCw className="h-4 w-4" />
            Customizable Roadmaps
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Your Roadmap, Your Focus
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Regenerate your roadmap with a different priority. The strategy adapts to what matters most to you.
          </p>
        </AnimatedSection>

        {/* Focus selector */}
        <AnimatedSection delay={200} className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {focusOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedFocus === option.id ? "default" : "outline"}
                className={`gap-2 transition-all duration-300 ${
                  selectedFocus === option.id 
                    ? "bg-purple hover:bg-purple/90 text-accent-foreground" 
                    : "hover:border-purple/50"
                }`}
                onClick={() => handleRegenerate(option.id as keyof typeof roadmapVariants)}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </AnimatedSection>

        {/* Generated roadmap preview */}
        <AnimatedSection delay={300}>
          <div className={`rounded-2xl border border-border bg-card/30 p-8 transition-all duration-500 ${isRegenerating ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {focusOptions.find(f => f.id === selectedFocus) && (
                  <>
                    {(() => {
                      const FocusIcon = focusOptions.find(f => f.id === selectedFocus)!.icon;
                      return <FocusIcon className="h-5 w-5 text-purple" />;
                    })()}
                    <span className="font-medium text-foreground">
                      {focusOptions.find(f => f.id === selectedFocus)?.description}
                    </span>
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
                Focus: {focusOptions.find(f => f.id === selectedFocus)?.label}
              </span>
            </div>

            <div className="space-y-4">
              {roadmapVariants[selectedFocus].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-background/50 transition-all duration-300 hover:border-purple/30"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex-shrink-0 text-sm font-medium text-purple px-3 py-1 rounded-full bg-purple/10">
                    {item.week}
                  </span>
                  <span className="text-foreground">{item.task}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Click any focus above to see how your roadmap adapts
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default RoadmapFocusSection;

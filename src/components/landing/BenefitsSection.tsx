import { Zap, Users, Clock, DollarSign, BarChart3, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Increased Productivity",
    description: "Gain actionable insights with AI-driven analytics to improve decision-making and strategy.",
  },
  {
    icon: Users,
    title: "Better Customer Experience",
    description: "Personalized AI interactions improve response times, customer engagement, and overall satisfaction.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "AI-powered systems operate around the clock, ensuring seamless support and execution 90% of the time.",
  },
  {
    icon: DollarSign,
    title: "Cost Reduction",
    description: "AI automation minimizes manual work, cuts operational costs, and optimizes resource distribution for better profitability.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Leverage AI to analyze vast data sets, identify trends, and make smarter, faster, and more accurate business decisions.",
  },
  {
    icon: TrendingUp,
    title: "Scalability & Growth",
    description: "AI adapts to your business needs, allowing you to scale efficiently without increasing workload or costs.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Benefits
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            The Key Benefits of AI for
            <br />
            Your Business Growth
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover how AI automation enhances efficiency, reduces costs, and drives
            business growth with smarter, faster processes.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-border bg-card/30 p-6 transition-all duration-300 hover:border-purple/30"
            >
              <benefit.icon className="h-6 w-6 text-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

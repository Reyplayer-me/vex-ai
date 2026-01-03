import { useState } from "react";
import { Check, Zap, Rocket, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    icon: Rocket,
    price: { monthly: "Free", annually: "Free" },
    description: "For starters who just want to explore, tinker, or validate one idea",
    features: [
      "Basic workflow automation",
      "AI-powered personal assistant",
      "Standard analytics & reporting",
      "Email & chat support",
      "Up to 3 AI integrations",
    ],
    popular: false,
  },
  {
    name: "Professional",
    icon: Zap,
    price: { monthly: "$29", annually: "$24" },
    description: "Committed solo founders or small teams ready to build + grow",
    features: [
      "Advanced workflow automation",
      "AI-driven sales & marketing tools",
      "Enhanced data analytics & insights",
      "Priority customer support",
      "Up to 10 AI integrations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: { monthly: "$39", annually: "$32" },
    description: "Perfect for large businesses ready to rule",
    features: [
      "Fully customizable AI automation",
      "Dedicated AI business consultant",
      "Enterprise-grade compliance",
      "24/7 VIP support",
      "Unlimited AI integrations",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            The Best AI Automation,
            <br />
            at the Right Price
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            Choose a plan that fits your business needs and start automating with AI
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAnnual ? "bg-purple" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${
                  isAnnual ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annually
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                plan.popular
                  ? "border-purple/50 bg-gradient-to-b from-purple/5 to-transparent"
                  : "border-border bg-card/30"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 rounded-full bg-purple/20 border border-purple/30 px-3 py-1 text-xs text-purple font-medium">
                  Popular
                </span>
              )}

              <div className="flex items-center gap-2 mb-4">
                <plan.icon className="h-5 w-5 text-purple" />
                <span className="text-lg font-medium text-foreground">{plan.name}</span>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-semibold text-foreground">
                  {isAnnual ? plan.price.annually : plan.price.monthly}
                </span>
                {plan.price.monthly !== "Free" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <Link to="/auth?mode=signup">
                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? "bg-purple hover:bg-purple/90"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Choose this plan
                </Button>
              </Link>

              <div>
                <p className="text-sm text-muted-foreground mb-4">What's Included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

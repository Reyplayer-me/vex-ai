import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { planAvailability } from "@/lib/plans";
import vexWordmark from "@/assets/vex-wordmark.png";
import NotFound from "./NotFound";

export default function PlanComingSoon() {
  const { plan: id } = useParams();
  if (id !== "professional" && id !== "enterprise") return <NotFound />;
  const plan = planAvailability[id];

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" aria-label="Vex.ai home"><img src={vexWordmark} alt="Vex.ai" className="h-8" /></Link>
        <div className="py-24 sm:py-32 text-center">
          <LockKeyhole className="mx-auto mb-8 h-12 w-12 text-purple" aria-hidden="true" />
          <p className="mb-4 text-sm text-purple">{plan.name} · Paid plan</p>
          <h1 className="mb-6 text-4xl sm:text-5xl font-semibold">Coming soon</h1>
          <p className="mx-auto max-w-lg mb-4 text-muted-foreground">{plan.name} is not available yet. Access will open when this paid plan launches.</p>
          <p className="mb-10 text-muted-foreground">{plan.monthly}/mo monthly · {plan.annually}/mo billed annually</p>
          <Button asChild variant="outline"><Link to="/#pricing"><ArrowLeft className="mr-2 h-4 w-4" />Back to plans</Link></Button>
        </div>
      </div>
    </main>
  );
}
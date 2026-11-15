import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SampleReportSection = () => (
  <section className="px-4 pb-8 sm:px-6">
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-purple/30 bg-purple/5 p-6 text-center sm:flex-row sm:text-left">
      <div className="flex-1">
        <h2 className="font-sans text-lg font-semibold text-foreground">Not ready to share your idea?</h2>
        <p className="text-sm text-muted-foreground">Read a full report the board produced for a sample idea. It's real output, not a mock-up.</p>
      </div>
      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
        <Link to="/sample">
          See a sample report <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  </section>
);

export default SampleReportSection;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, MessageSquare, Calendar, LogOut } from "lucide-react";

const actions = [
  {
    icon: Lightbulb,
    title: "Validate an Idea",
    description: "Break down risks and assumptions",
  },
  {
    icon: Target,
    title: "Build a Strategy",
    description: "Define positioning and go-to-market",
  },
  {
    icon: MessageSquare,
    title: "Ask a Question",
    description: "Get structured recommendations",
  },
  {
    icon: Calendar,
    title: "View Weekly Plan",
    description: "See your tasks for this week",
  },
];

const Dashboard = () => {
  // In a real app, this would come from auth context
  const userName = "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
              <span className="text-sm font-bold text-background">V</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Vex.ai</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Welcome */}
          <div className="mb-12">
            <h1 className="mb-2 text-3xl font-semibold text-foreground">
              Welcome back, {userName}.
            </h1>
            <p className="text-lg text-muted-foreground">
              Your workspace is ready. What would you like to work on today?
            </p>
          </div>

          {/* Focus prompt */}
          <div className="mb-12 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-2 text-lg font-medium text-foreground">
              What should I work on today?
            </h2>
            <p className="text-muted-foreground">
              Start by choosing an action below, or ask me anything about your project.
            </p>
          </div>

          {/* Action cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action.title}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 text-left transition-colors hover:border-muted-foreground/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <action.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-foreground group-hover:text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

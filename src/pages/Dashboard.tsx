import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, MessageSquare, Calendar, LogOut } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";

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
  const userName = "there";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-glow/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <img src={vexWordmark} alt="Vex" className="h-6" />
          <Link to="/">
            <Button variant="ghost" size="sm" className="hover:text-purple transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Welcome */}
          <div className="mb-12 opacity-0 animate-fade-in">
            <h1 className="mb-2 text-3xl font-semibold text-foreground">
              Welcome back, <span className="text-gradient">{userName}</span>.
            </h1>
            <p className="text-lg text-muted-foreground">
              Your workspace is ready. What would you like to work on today?
            </p>
          </div>

          {/* Focus prompt */}
          <div 
            className="mb-12 rounded-lg border border-purple/30 bg-purple/5 p-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <h2 className="mb-2 text-lg font-medium text-foreground">
              What should I work on today?
            </h2>
            <p className="text-muted-foreground">
              Start by choosing an action below, or ask me anything about your project.
            </p>
          </div>

          {/* Action cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {actions.map((action, index) => (
              <button
                key={action.title}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 text-left transition-all duration-300 hover:border-purple/50 hover:-translate-y-1 hover:glow-purple-sm opacity-0 animate-fade-in"
                style={{ animationDelay: `${(index + 2) * 0.1}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple/10 border border-purple/20 transition-all duration-300 group-hover:bg-purple/20 group-hover:scale-110">
                  <action.icon className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-foreground group-hover:text-purple transition-colors">
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

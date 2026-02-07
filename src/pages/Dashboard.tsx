import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Map, Users, Loader2, Lightbulb, Pencil, Settings, LogOut } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { supabase } from "@/integrations/supabase/client";
import { EditIdeaDialog } from "@/components/dashboard/EditIdeaDialog";

interface UserProfile {
  name: string | null;
  goal: string | null;
  target_user: string | null;
  industry: string | null;
  stage: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("name, goal, target_user, industry, stage")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
    }

    setProfile(data);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  const actions = [
    {
      icon: Map,
      title: "Generate Roadmap",
      description: "Get a strategic plan for your idea",
      href: "/validate",
    },
    {
      icon: Users,
      title: "AI Boardroom",
      description: "Discuss decisions with AI advisors",
      href: "/boardroom",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-glow/5 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <img src={vexWordmark} alt="Vex" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Welcome */}
          <div className="mb-8 opacity-0 animate-fade-in">
            <h1 className="mb-2 text-3xl font-semibold text-foreground">
              Welcome back, <span className="text-gradient">{profile?.name || "there"}</span>.
            </h1>
            <p className="text-lg text-muted-foreground">
              Your workspace is ready. Let's build something great.
            </p>
          </div>

          {/* Idea Context Card */}
          {profile?.goal && (
            <div 
              className="mb-8 rounded-lg border border-purple/30 bg-purple/5 p-6 opacity-0 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
                  <Lightbulb className="h-5 w-5 text-purple" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="mb-1 text-lg font-medium text-foreground">
                      Your Idea
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-purple"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="ml-1 text-sm">Edit</span>
                    </Button>
                  </div>
                  <p className="text-foreground/90 mb-2">
                    {profile.goal}
                  </p>
                  {profile.target_user && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Target:</span> {profile.target_user}
                    </p>
                  )}
                  {profile.industry && (
                    <p className="text-sm text-muted-foreground capitalize">
                      <span className="font-medium">Industry:</span> {profile.industry}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Idea Dialog */}
          {profile && (
            <EditIdeaDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              profile={profile}
              onSaved={loadProfile}
            />
          )}

          {/* Action cards */}
          <div 
            className="grid gap-4 sm:grid-cols-2 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {actions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.href)}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 text-left transition-all duration-300 hover:border-purple/50 hover:-translate-y-1 hover:glow-purple-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple/10 border border-purple/20 transition-all duration-300 group-hover:bg-purple/20 group-hover:scale-110">
                  <action.icon className="h-6 w-6 text-purple" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-foreground group-hover:text-purple transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Help text */}
          <p 
            className="mt-8 text-center text-sm text-muted-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Your AI advisors already know about your idea and can help you make decisions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

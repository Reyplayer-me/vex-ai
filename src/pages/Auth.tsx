import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const mode = searchParams.get("mode") || "signup";
  const isLogin = mode === "login";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (isLogin) {
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Account created!",
        description: "Let's set up your workspace...",
      });
      navigate("/onboarding");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple transition-all duration-300 group-hover:glow-purple-sm">
              <span className="text-sm font-bold text-accent-foreground">V</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Vex.ai</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm opacity-0 animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to continue to Vex.ai"
                : "Start building with an AI co-founder"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:border-purple focus:ring-purple"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 transition-all duration-300 focus:border-purple focus:ring-purple"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple hover:bg-purple/90 text-accent-foreground glow-purple-sm hover:glow-purple transition-all duration-300"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={`/auth?mode=${isLogin ? "signup" : "login"}`}
              className="font-medium text-purple underline-offset-4 hover:underline transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";
import vexWordmark from "@/assets/vex-wordmark.png";

const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com"];

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .refine(
      (email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        return ALLOWED_DOMAINS.includes(domain);
      },
      { message: "Only Gmail, Yahoo, and Outlook emails are allowed" }
    ),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

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
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/onboarding");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/onboarding");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not verified",
              description: "Please check your inbox and verify your email before logging in.",
              variant: "destructive",
            });
          } else if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "The email or password you entered is incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Welcome back!",
          description: "Redirecting to your workspace...",
        });
      } else {
        const redirectUrl = `${window.location.origin}/onboarding`;

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try logging in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        // Check if user already exists (Supabase returns user with empty identities array)
        if (data?.user?.identities?.length === 0) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Try logging in instead.",
            variant: "destructive",
          });
          return;
        }

        setVerificationSent(true);
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox and click the verification link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/10 blur-3xl" />
        </div>

        <header className="relative z-10 border-b border-border/50">
          <div className="container mx-auto flex h-16 items-center px-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={vexWordmark}
                alt="VEX"
                className="h-6 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center opacity-0 animate-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
              Check your email
            </h1>
            <p className="mb-6 text-muted-foreground">
              We've sent a verification link to <span className="font-medium text-foreground">{email}</span>. 
              Click the link to verify your account and get started.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setVerificationSent(false)}
              >
                Use a different email
              </Button>
              <Link to="/auth?mode=login">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={vexWordmark}
              alt="VEX"
              className="h-6 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm opacity-0 animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to continue to VEX"
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
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:border-purple focus:ring-purple"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only Gmail, Yahoo, and Outlook emails are accepted
              </p>
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

import { useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLogo } from "@/components/GoogleLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { rememberEmail, VexApiError } from "@/lib/vex-api";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TECH_KEY = (id: string) => `vex-technical-${id}`;

export const rememberTechnical = (id: string, technical: boolean) => {
  try {
    localStorage.setItem(TECH_KEY(id), technical ? "1" : "0");
  } catch {
    /* ignore */
  }
};
export const recallTechnical = (id: string): boolean | null => {
  try {
    const v = localStorage.getItem(TECH_KEY(id));
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
};

const INCLUDES = [
  "The full five-advisor boardroom debate and the board's decision",
  "A roadmap: Foundations → MVP → Launch → Iterate, with Speed / Cost / Learning / Scale focus",
  "A build plan and First Weekend Plan for your skill level",
  "A launch plan: first user, growth channel, week-1 and month-1 targets",
  "An assumptions checklist so you can track what you've tested",
];

interface Props {
  ideaId: string;
  claimToken: string | null;
  signedIn: boolean;
  generating: boolean;
  error: string | null;
  onGenerate: (technical: boolean) => void;
}

export const UnlockReport = ({ ideaId, claimToken, signedIn, generating, error, onGenerate }: Props) => {
  const [technical, setTechnical] = useState<boolean | null>(recallTechnical(ideaId));
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const redirect = `${window.location.origin}/idea/${ideaId}?unlock=1`;

  const chooseTechnical = (v: boolean) => {
    setTechnical(v);
    rememberTechnical(ideaId, v);
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setFormError("Enter a valid email address.");
      return;
    }
    setFormError(null);
    setState("sending");
    try {
      if (claimToken) await rememberEmail(ideaId, claimToken, trimmed);
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: trimmed, options: { emailRedirectTo: redirect } });
      if (otpError) throw otpError;
      track("email_submitted");
      setState("sent");
    } catch (err) {
      setFormError(
        err instanceof VexApiError
          ? err.message
          : /rate|seconds/i.test((err as Error)?.message ?? "")
            ? "We just sent a link. Wait a minute before asking for another."
            : "We couldn't send the email. Please try again.",
      );
      setState("idle");
    }
  };

  const google = async () => {
    setFormError(null);
    track("email_submitted");
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirect });
      if (result.error) setFormError("Google sign-in didn't finish. Try again or use your email.");
    } catch {
      setFormError("Google sign-in didn't finish. Try again or use your email.");
    }
  };

  return (
    <section className="rounded-xl border border-cta/40 bg-card/70 p-5" aria-labelledby="unlock-heading">
      <h2 id="unlock-heading" className="mb-1 font-sans text-lg font-semibold text-foreground">
        <Lock className="mr-2 inline h-4 w-4 align-[-2px] text-cta" aria-hidden />
        Get the full report <span className="whitespace-nowrap text-sm font-normal text-muted-foreground">(free during beta)</span>
      </h2>
      <ul className="mb-5 mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {INCLUDES.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-foreground">Do you write code?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: true, label: "Yes, I code" },
            { v: false, label: "No, I don't" },
          ].map((o) => (
            <Button
              key={o.label}
              type="button"
              variant="outline"
              aria-pressed={technical === o.v}
              onClick={() => chooseTechnical(o.v)}
              className={cn("h-12", technical === o.v && "border-cta bg-cta/10")}
            >
              {o.label}
            </Button>
          ))}
        </div>
      </fieldset>

      {signedIn ? (
        <Button
          variant="cta"
          size="xl"
          className="w-full font-semibold"
          disabled={technical === null || generating}
          onClick={() => technical !== null && onGenerate(technical)}
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" aria-hidden /> The board is writing your report (about a minute)...
            </>
          ) : (
            "Unlock my full report"
          )}
        </Button>
      ) : state === "sent" ? (
        <p className="rounded-lg bg-muted p-4 text-sm text-foreground" role="status">
          Check your inbox for a sign-in link from Vex. Open it and your full report will start generating. If you open it on another device, it still works.
        </p>
      ) : (
        <div className="space-y-3">
          <Button variant="google" size="lg" className="w-full" onClick={google} disabled={technical === null}>
            <GoogleLogo />
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={sendLink} className="space-y-2">
            <Label htmlFor="unlock-email" className="sr-only">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="unlock-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button type="submit" variant="cta" size="lg" className="w-full font-semibold" disabled={technical === null || state === "sending"}>
              {state === "sending" ? "Sending..." : "Email me a sign-in link"}
            </Button>
          </form>
          {technical === null && <p className="text-xs text-muted-foreground">Answer the coding question first so the build plan fits you.</p>}
          <p className="text-xs text-muted-foreground">We use your email to save your report and sign you in. No spam.</p>
        </div>
      )}

      {(formError || error) && (
        <p role="alert" className="mt-3 text-sm text-verdict-kill">
          {formError ?? error}
        </p>
      )}
    </section>
  );
};

import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const schema = z.object({
  name: z.string().trim().max(100, "Name is too long").optional(),
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right").max(255)]),
  message: z.string().trim().min(5, "Tell us a bit more (at least 5 characters)").max(2000, "Keep it under 2000 characters"),
});

interface Props {
  kind?: "feedback" | "contact";
  showName?: boolean;
  submitLabel?: string;
  onDone?: () => void;
}

const FeedbackForm = ({ kind = "feedback", showName = false, submitLabel = "Send", onDone }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name: showName ? name : undefined, email, message });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((er) => (errs[String(er.path[0])] = er.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback_submissions").insert({
      kind,
      name: parsed.data.name || null,
      email: parsed.data.email || user?.email || null,
      message: parsed.data.message,
      page: window.location.pathname,
      user_id: user?.id ?? null,
    });
    if (error) {
      setStatus("error");
      return;
    }
    track("feedback_sent", { kind });
    setStatus("sent");
    onDone?.();
  };

  if (status === "sent") {
    return (
      <div className="rounded-md border border-purple/40 p-6">
        <p className="font-medium text-foreground">Got it. Thank you.</p>
        <p className="mt-1 text-sm text-muted-foreground">We read every message. If you left an email, expect a reply within a few days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {showName && (
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground" htmlFor={`${kind}-name`}>Name (optional)</label>
          <Input id={`${kind}-name`} value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground" htmlFor={`${kind}-email`}>Email (optional, if you want a reply)</label>
        <Input id={`${kind}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground" htmlFor={`${kind}-msg`}>Message</label>
        <Textarea id={`${kind}-msg`} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's confusing, missing, or broken?" />
        {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
      </div>
      {status === "error" && <p className="text-sm text-destructive">That didn't go through. Check your connection and try again.</p>}
      <Button type="submit" disabled={status === "sending"} className="h-11 bg-purple text-accent-foreground hover:bg-purple/90">
        {status === "sending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
};

export default FeedbackForm;

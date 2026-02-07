import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    goal: string | null;
    target_user: string | null;
    industry: string | null;
    stage: string | null;
  };
  onSaved: () => void;
}

const industries = [
  { value: "business", label: "Business & Finance" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
];

const stages = [
  { value: "idea", label: "Just an idea" },
  { value: "early", label: "Early build stage" },
  { value: "launched", label: "Already launched" },
];

export function EditIdeaDialog({ open, onOpenChange, profile, onSaved }: EditIdeaDialogProps) {
  const [goal, setGoal] = useState(profile.goal || "");
  const [targetUser, setTargetUser] = useState(profile.target_user || "");
  const [industry, setIndustry] = useState(profile.industry || "");
  const [stage, setStage] = useState(profile.stage || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!goal.trim()) {
      toast.error("Please describe your idea");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          goal: goal.trim(),
          target_user: targetUser.trim() || null,
          industry: industry || null,
          stage: stage || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast.success("Idea updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update idea");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Your Idea</DialogTitle>
          <DialogDescription>
            Update your startup idea and context. Your AI advisors will use this information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Your Idea</Label>
            <Textarea
              id="goal"
              placeholder="Describe your startup idea..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetUser">Target Audience</Label>
            <Input
              id="targetUser"
              placeholder="Who is this for?"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

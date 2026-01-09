import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ValidationResult } from "@/types/validation";
import { RoadmapResult } from "@/types/roadmap";
import { useToast } from "@/hooks/use-toast";

export interface ValidationSession {
  id: string;
  idea: string;
  target_user: string | null;
  industry: string | null;
  goal: string | null;
  validation_result: ValidationResult | null;
  roadmap_result: RoadmapResult | null;
  updated_at: string;
}

export const useValidationSession = () => {
  const [session, setSession] = useState<ValidationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load the most recent session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("validation_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSession({
            id: data.id,
            idea: data.idea,
            target_user: data.target_user,
            industry: data.industry,
            goal: data.goal,
            validation_result: data.validation_result as unknown as ValidationResult | null,
            roadmap_result: data.roadmap_result as unknown as RoadmapResult | null,
            updated_at: data.updated_at,
          });
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const saveSession = useCallback(async (
    idea: string,
    targetUser: string,
    industry: string,
    goal: string,
    validationResult: ValidationResult | null,
    roadmapResult: RoadmapResult | null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sessionData = {
        user_id: user.id,
        idea,
        target_user: targetUser,
        industry,
        goal,
        validation_result: validationResult ? JSON.parse(JSON.stringify(validationResult)) : null,
        roadmap_result: roadmapResult ? JSON.parse(JSON.stringify(roadmapResult)) : null,
      };

      if (session?.id) {
        // Update existing session
        const { error } = await supabase
          .from("validation_sessions")
          .update(sessionData)
          .eq("id", session.id);

        if (error) throw error;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from("validation_sessions")
          .insert(sessionData)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setSession({
            id: data.id,
            idea: data.idea,
            target_user: data.target_user,
            industry: data.industry,
            goal: data.goal,
            validation_result: data.validation_result as unknown as ValidationResult | null,
            roadmap_result: data.roadmap_result as unknown as RoadmapResult | null,
            updated_at: data.updated_at,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your session",
        variant: "destructive",
      });
    }
  }, [session?.id, toast]);

  const clearSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !session?.id) {
        setSession(null);
        return;
      }

      await supabase
        .from("validation_sessions")
        .delete()
        .eq("id", session.id);

      setSession(null);
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }, [session?.id]);

  return {
    session,
    isLoading,
    saveSession,
    clearSession,
  };
};

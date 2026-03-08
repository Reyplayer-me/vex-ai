import { useState, useCallback } from "react";
import { toast } from "sonner";
import { BuildPlan } from "@/types/buildplan";
import { supabase } from "@/integrations/supabase/client";

export function useBuildPlanGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [buildPlan, setBuildPlan] = useState<BuildPlan | null>(null);

  const generateBuildPlan = useCallback(async (params: {
    idea: string; targetUser: string; industry: string; goal: string; skillLevel?: string; verdict?: string;
  }) => {
    setIsGenerating(true);
    setStreamingText("");
    setBuildPlan(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("You must be logged in to generate a build plan.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-build-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch {}
        }
      }

      // Strip markdown code fences if present
      let cleaned = fullText.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not find JSON in response");

      let parsed: BuildPlan;
      try {
        parsed = JSON.parse(jsonMatch[0]) as BuildPlan;
      } catch {
        // Attempt to repair truncated JSON
        let raw = jsonMatch[0];
        const openBraces = (raw.match(/\{/g) || []).length;
        const closeBraces = (raw.match(/\}/g) || []).length;
        const openBrackets = (raw.match(/\[/g) || []).length;
        const closeBrackets = (raw.match(/\]/g) || []).length;
        raw = raw.replace(/,\s*$/, "");
        raw = raw.replace(/:\s*"[^"]*$/, ': ""');
        for (let i = 0; i < openBrackets - closeBrackets; i++) raw += "]";
        for (let i = 0; i < openBraces - closeBraces; i++) raw += "}";
        parsed = JSON.parse(raw) as BuildPlan;
        console.warn("Recovered truncated build plan JSON");
      }
      setBuildPlan(parsed);
      setIsGenerating(false);
      return parsed;
    } catch (error) {
      console.error("Build plan error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate build plan");
      setIsGenerating(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setStreamingText("");
    setBuildPlan(null);
  }, []);

  return { isGenerating, streamingText, buildPlan, generateBuildPlan, reset, setBuildPlan };
}

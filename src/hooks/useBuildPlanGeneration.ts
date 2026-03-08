import { useState, useCallback } from "react";
import { toast } from "sonner";
import { BuildPlan } from "@/types/buildplan";

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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-build-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

      // Parse JSON from response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as BuildPlan;
        setBuildPlan(parsed);
        setIsGenerating(false);
        return parsed;
      } else {
        throw new Error("Could not parse build plan");
      }
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

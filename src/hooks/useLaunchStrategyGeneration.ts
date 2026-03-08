import { useState, useCallback } from "react";
import { toast } from "sonner";
import { LaunchStrategy } from "@/types/buildplan";
import { supabase } from "@/integrations/supabase/client";

export function useLaunchStrategyGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [strategy, setStrategy] = useState<LaunchStrategy | null>(null);

  const generateStrategy = useCallback(async (params: {
    idea: string; targetUser: string; industry: string; goal: string; skillLevel?: string; verdict?: string;
  }) => {
    setIsGenerating(true);
    setStreamingText("");
    setStrategy(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-launch-strategy`,
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

      // Strip markdown code fences if present
      let cleaned = fullText.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not find JSON in response");

      let parsed: LaunchStrategy;
      try {
        parsed = JSON.parse(jsonMatch[0]) as LaunchStrategy;
      } catch {
        // Attempt to repair truncated JSON
        let raw = jsonMatch[0];
        // Balance braces/brackets
        const openBraces = (raw.match(/\{/g) || []).length;
        const closeBraces = (raw.match(/\}/g) || []).length;
        const openBrackets = (raw.match(/\[/g) || []).length;
        const closeBrackets = (raw.match(/\]/g) || []).length;
        // Trim trailing incomplete values (after last comma or colon)
        raw = raw.replace(/,\s*$/, "");
        raw = raw.replace(/:\s*"[^"]*$/, ': ""');
        for (let i = 0; i < openBrackets - closeBrackets; i++) raw += "]";
        for (let i = 0; i < openBraces - closeBraces; i++) raw += "}";
        parsed = JSON.parse(raw) as LaunchStrategy;
        console.warn("Recovered truncated launch strategy JSON");
      }
      setStrategy(parsed);
      setIsGenerating(false);
      return parsed;
    } catch (error) {
      console.error("Launch strategy error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate launch strategy");
      setIsGenerating(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setStreamingText("");
    setStrategy(null);
  }, []);

  return { isGenerating, streamingText, strategy, generateStrategy, reset, setStrategy };
}

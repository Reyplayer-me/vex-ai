import { useState, useCallback } from "react";
import { toast } from "sonner";
import { RoadmapResult, RoadmapInput } from "@/types/roadmap";

function repairAndParse(json: string): unknown {
  let braces = 0, brackets = 0;
  for (const char of json) {
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }
  let repaired = json;
  while (brackets > 0) { repaired += ']'; brackets--; }
  while (braces > 0) { repaired += '}'; braces--; }
  return JSON.parse(repaired);
}

function extractJsonFromText(content: string): unknown {
  // Try direct parse
  try { return JSON.parse(content); } catch { /* continue */ }

  // Try extracting from markdown code fences
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* continue */ }
  }

  // Strip code fences and try to find JSON object
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*"[^"]+"\s*:[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {
      // Try repairing truncated JSON
      try { return repairAndParse(jsonMatch[0]); } catch { /* continue */ }
    }
  }

  throw new Error("Could not extract valid JSON from response");
}

export const useRoadmapGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);

  const generateRoadmap = useCallback(async (input: RoadmapInput) => {
    setIsGenerating(true);
    setStreamingText("");
    setRoadmap(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setStreamingText(fullText);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Robustly extract JSON from mixed LLM response
      try {
        const parsedRoadmap = extractJsonFromText(fullText) as RoadmapResult;
        setRoadmap(parsedRoadmap);
        return parsedRoadmap;
      } catch (e) {
        console.error("Failed to parse roadmap JSON:", e, "Raw text:", fullText.substring(0, 500));
        toast.error("Failed to parse roadmap. Please try again.");
      }
      return null;
    } catch (error) {
      console.error("Roadmap generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate roadmap");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setStreamingText("");
    setRoadmap(null);
  }, []);

  return {
    isGenerating,
    streamingText,
    roadmap,
    generateRoadmap,
    reset,
    setRoadmap,
  };
};

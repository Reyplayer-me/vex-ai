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

  // Try extracting from markdown code fences (greedy to get full block)
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].trim();
    try { return JSON.parse(inner); } catch {
      try { return repairAndParse(inner); } catch { /* continue */ }
    }
  }

  // Strip all code fences
  const cleaned = content.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();

  // Try parsing cleaned content directly
  try { return JSON.parse(cleaned); } catch { /* continue */ }

  // Find the outermost JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
    try { return JSON.parse(jsonStr); } catch {
      try { return repairAndParse(jsonStr); } catch { /* continue */ }
    }
  }

  // Last resort: wrap content that starts with a key like "phases":
  if (cleaned.startsWith('"')) {
    const wrapped = "{" + cleaned + "}";
    try { return JSON.parse(wrapped); } catch {
      try { return repairAndParse(wrapped); } catch { /* continue */ }
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
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });

        // Process complete lines only
        let newlineIndex: number;
        while ((newlineIndex = lineBuffer.indexOf("\n")) !== -1) {
          let line = lineBuffer.slice(0, newlineIndex);
          lineBuffer = lineBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch {
            // Put incomplete JSON line back into buffer and wait for more data
            lineBuffer = line + "\n" + lineBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (lineBuffer.trim()) {
        for (let raw of lineBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const data = raw.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch { /* ignore */ }
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

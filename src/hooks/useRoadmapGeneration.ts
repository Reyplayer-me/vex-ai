import { useState, useCallback } from "react";
import { toast } from "sonner";
import { RoadmapResult, RoadmapInput } from "@/types/roadmap";

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

      // Parse the final JSON result
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedRoadmap = JSON.parse(jsonMatch[0]) as RoadmapResult;
          setRoadmap(parsedRoadmap);
        } catch (e) {
          console.error("Failed to parse roadmap JSON:", e);
          toast.error("Failed to parse roadmap. Please try again.");
        }
      } else {
        toast.error("Invalid roadmap format. Please try again.");
      }
    } catch (error) {
      console.error("Roadmap generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate roadmap");
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
  };
};

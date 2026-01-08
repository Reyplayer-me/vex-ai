import { useState, useCallback } from "react";
import { IdeaInput, ValidationResult } from "@/types/validation";
import { useToast } from "@/hooks/use-toast";

const VALIDATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-idea`;

export const useIdeaValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const validateIdea = useCallback(async (input: IdeaInput) => {
    setIsValidating(true);
    setStreamingText("");
    setResult(null);

    try {
      const response = await fetch(VALIDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Validation failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse the final JSON result
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]) as ValidationResult;
          setResult(parsedResult);
        } catch (parseError) {
          console.error("Failed to parse validation result:", parseError);
          toast({
            title: "Parse Error",
            description: "Failed to parse the validation result. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setStreamingText("");
    setResult(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    streamingText,
    result,
    validateIdea,
    reset,
  };
};

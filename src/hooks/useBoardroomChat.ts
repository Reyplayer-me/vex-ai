import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface IdeaContext {
  idea: string;
  targetUser: string;
  industry: string;
  goal: string;
  skillLevel?: string;
  verdict?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/boardroom-chat`;

export const useBoardroomChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoadingHistory(false);
        return;
      }

      const { data, error } = await supabase
        .from("boardroom_messages")
        .select("id, role, content")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading chat history:", error);
      } else if (data && data.length > 0) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })));
      }

      setIsLoadingHistory(false);
    };

    loadHistory();
  }, []);

  const saveMessage = async (role: "user" | "assistant", content: string): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from("boardroom_messages")
      .insert({
        user_id: session.user.id,
        role,
        content,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }

    return data?.id || null;
  };

  const updateMessage = async (id: string, content: string) => {
    const { error } = await supabase
      .from("boardroom_messages")
      .update({ content })
      .eq("id", id);

    if (error) {
      console.error("Error updating message:", error);
    }
  };

  const sendMessage = useCallback(async (userMessage: string, ideaContext?: IdeaContext) => {
    const userMsg: ChatMessage = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Save user message
    const userMsgId = await saveMessage("user", userMessage);
    if (userMsgId) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], id: userMsgId };
        return updated;
      });
    }

    let assistantContent = "";
    let assistantMsgId: string | null = null;

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          ideaContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message to be filled
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message after streaming is complete
      if (assistantContent) {
        assistantMsgId = await saveMessage("assistant", assistantContent);
        if (assistantMsgId) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], id: assistantMsgId! };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      // Remove the failed assistant message if empty
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1]?.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearChat = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessages([]);
      return;
    }

    const { error } = await supabase
      .from("boardroom_messages")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error clearing chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    } else {
      setMessages([]);
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    clearChat,
  };
};

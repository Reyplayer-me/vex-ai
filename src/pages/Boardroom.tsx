import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2, Users, Trash2 } from "lucide-react";
import vexWordmark from "@/assets/vex-wordmark.png";
import { useBoardroomChat, IdeaContext } from "@/hooks/useBoardroomChat";
import { supabase } from "@/integrations/supabase/client";

const Boardroom = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [ideaContext, setIdeaContext] = useState<IdeaContext | undefined>();
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isLoading, isLoadingHistory, sendMessage, clearChat } = useBoardroomChat();

  // Load user profile for idea context
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("goal, target_user, industry, stage, skill_level")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data?.goal) {
        setIdeaContext({
          idea: data.goal,
          targetUser: data.target_user || "",
          industry: data.industry || "",
          goal: data.goal,
          skillLevel: (data as any).skill_level || "",
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    await sendMessage(message, ideaContext);
  };

  const handleSuggestion = async (suggestion: string) => {
    if (isLoading) return;
    await sendMessage(suggestion, ideaContext);
  };

  const suggestions = ideaContext ? [
    "What's the biggest risk with this idea?",
    "How should I prioritize my first features?",
    "What's my go-to-market strategy?",
  ] : [
    "I'm building an AI-powered tool for...",
    "Help me evaluate my startup idea",
    "What makes a strong MVP?",
  ];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/dashboard">
            <img src={vexWordmark} alt="Vex" className="h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">AI Boardroom</span>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="container mx-auto max-w-3xl px-6 py-8">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 rounded-full bg-purple/10 p-4">
                  <Users className="h-8 w-8 text-purple" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  Welcome to the AI Boardroom
                </h2>
                <p className="mb-8 max-w-md text-muted-foreground">
                  {ideaContext 
                    ? `Your advisors are ready to discuss "${ideaContext.idea.slice(0, 50)}${ideaContext.idea.length > 50 ? '...' : ''}"`
                    : "Get strategic advice from your panel of AI advisors. Describe your idea to get started."}
                </p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestion(suggestion)}
                      disabled={isLoading}
                      className="text-sm text-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <div className={`text-sm whitespace-pre-wrap ${
                        message.role === "assistant" ? "text-foreground prose prose-sm dark:prose-invert max-w-none" : ""
                      }`}>
                        {message.content || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Advisors are thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-3xl px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              ref={inputRef}
              placeholder="Ask your advisors anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Boardroom;

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiInput } from "./AiInput";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  file?: {
    name: string;
    type: string;
  };
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = ce.detail as
        | { message?: string; file?: File; isEli5?: boolean }
        | undefined;
      if (!detail || !detail.message) return;
      handleSubmit(detail.message, detail.file, detail.isEli5);
    };

    window.addEventListener("ai-message", handler as EventListener);
    return () => window.removeEventListener("ai-message", handler as EventListener);
  }, []);

  const handleSubmit = async (message: string, file?: File, isEli5?: boolean) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      file: file ? { name: file.name, type: file.type } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // ✅ Build FormData to support both text + file upload
      const formData = new FormData();
      formData.append("message", message);
      if (file) formData.append("file", file);
      if (isEli5) formData.append("isEli5", String(isEli5));

      // ✅ POST to your backend AI endpoint
      const response = await fetch("https://YOUR_BACKEND_API_URL_HERE/api/ai-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      // ✅ Expect JSON: { reply: "..." }
      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          data.reply ||
          "Sorry, I couldn't generate a response. Please try again later.",
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "⚠️ Sorry, something went wrong while connecting to the server. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[600px]">
      <ScrollArea className="h-[550px] pr-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              👋 Hi! I'm your medical AI assistant. Feel free to ask any
              health-related questions or upload medical documents for review.
            </div>
          )}
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`p-4 ${
                message.type === "assistant" ? "bg-primary/5" : "bg-background"
              }`}
            >
              {message.file && (
                <div className="text-sm text-muted-foreground mb-2">
                  📎 Attached: {message.file.name}
                </div>
              )}
              <div className="text-sm whitespace-pre-line">{message.content}</div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0">
        <AiInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

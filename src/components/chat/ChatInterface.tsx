import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

interface ChatInterfaceProps {
  chatId: string | null;
  usageCount: number;
  subscriptionStatus: "free" | "premium";
  onSendMessage: () => void;
  onChatCreated: (chatId: string) => void;
}

function generateChatTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 50) return trimmed;
  return trimmed.slice(0, 47) + "...";
}

export function ChatInterface({
  chatId,
  usageCount,
  subscriptionStatus,
  onSendMessage,
  onChatCreated,
}: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId]);

  // When starting a brand new chat (no chatId), clear local messages/input
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setInputMessage("");
    }
  }, [chatId]);

  const loadMessages = async (cid: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", cid)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Gagal memuat pesan");
      return;
    }

    setMessages((data as Message[]) || []);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ inputMessage, chatId });
    if (!inputMessage.trim()) return;

    // Check usage limit for free users
    if (subscriptionStatus === "free" && usageCount >= 5) {
      setShowUpgradeModal(true);
      return;
    }
    console.log("show");
    setIsLoading(true);

    // Ensure chat exists (create on first message)
    let cid = chatId;
    if (!cid) {
      const title = generateChatTitle(inputMessage);
      const { data: newChat, error: newChatError } = await supabase
        .from("chats")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title,
        })
        .select()
        .single();
      if (newChatError) {
        toast.error("Gagal membuat chat");
        setIsLoading(false);
        return;
      }
      cid = newChat.id;
      onChatCreated(cid);
    }

    // Save user message
    const { data: userMsg, error: userError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: cid,
        role: "user",
        message: inputMessage,
      })
      .select()
      .single();

    if (userError) {
      toast.error("Gagal mengirim pesan");
      setIsLoading(false);
      return;
    }

    setMessages([...messages, userMsg as Message]);
    const userMessage = inputMessage;
    setInputMessage("");

    // Get all messages for context
    const conversationHistory = [...messages, userMsg as Message].map(
      (msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.message,
      })
    );

    // Call OpenAI via edge function
    try {
      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("chat-ai", {
          body: { messages: conversationHistory },
        });

      if (functionError) {
        throw functionError;
      }

      const aiResponse = functionData.message;

      const { data: aiMsg, error: aiError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: cid,
          role: "assistant",
          message: aiResponse,
        })
        .select()
        .single();

      if (!aiError && aiMsg) {
        setMessages((prev) => [...prev, aiMsg as Message]);
        onSendMessage();
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error calling AI:", error);
      toast.error("Gagal mendapatkan respons AI");
      setIsLoading(false);
    }
  };

  const remainingQuestions = Math.max(0, 5 - usageCount);

  return (
    <main className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Patriot Desa Assistant</h2>
          {subscriptionStatus === "free" && (
            <p className="text-sm text-muted-foreground">
              Sisa pertanyaan hari ini: {remainingQuestions}/5
            </p>
          )}
        </div>
        {subscriptionStatus === "free" && (
          <Button
            onClick={() => navigate("/subscription")}
            variant="outline"
            className="border-primary text-primary hover:bg-primary-light/50"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Premium
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg mb-2">Mulai percakapan baru</p>
              <p className="text-sm">
                Tanyakan apa saja tentang pengelolaan desa
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <Card
                key={msg.id}
                className={`p-4 ${
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground max-w-[80%]"
                    : "mr-auto bg-card max-w-[80%]"
                }`}
              >
                {/* <p className="text-sm whitespace-pre-wrap">{msg.message}</p> */}
                {/* <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  {msg.message}
                </ReactMarkdown> */}
                {/* <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{}}
                  children={msg.message}
                /> */}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed">{children}</p>
                        ),
                      }}
                    >
                      {msg.message.replace(/\n/g, "  \n")}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                )}
              </Card>
            ))
          )}
          {isLoading && (
            <Card className="p-4 mr-auto bg-card max-w-[80%]">
              <p className="text-sm text-muted-foreground">Mengetik...</p>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan Anda..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-primary hover:bg-primary-dark"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kuota Harian Habis</DialogTitle>
            <DialogDescription>
              Anda telah mencapai batas 5 pertanyaan gratis per hari. Upgrade ke
              Premium untuk akses unlimited!
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
            >
              Nanti
            </Button>
            <Button
              onClick={() => navigate("/subscription")}
              className="bg-primary"
            >
              Upgrade Sekarang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

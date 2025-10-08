import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { Crown, EllipsisVertical, Menu, Send } from "lucide-react";
import remarkGfm from "remark-gfm";

import { useDeviceType } from "@/hooks/useDeviceType";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  openSidebar: () => void;
  closeSidebar: () => void;
  isSidebarOpen: boolean;
  onRenameChat?: (chatId: string, newTitle: string) => void;
  onDeleteChat?: (chatId: string) => void;
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
  openSidebar,
  isSidebarOpen,
  onRenameChat,
  onDeleteChat,
  closeSidebar,
}: ChatInterfaceProps) {
  const device = useDeviceType();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // State for rename and delete dialogs
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

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

    // Call OpenAI via edge function with streaming
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ messages: conversationHistory }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let aiResponse = "";

      // Create a temporary message for streaming
      const tempMessageId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempMessageId,
          role: "assistant",
          message: "",
          created_at: new Date().toISOString(),
        },
      ]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          aiResponse += chunk;

          // Update the temporary message with the new content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessageId ? { ...msg, message: aiResponse } : msg
            )
          );
        }
      } finally {
        reader.releaseLock();
      }

      // Save the complete response to database
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
        // Replace the temporary message with the real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  ...aiMsg,
                  id: aiMsg.id,
                  role: aiMsg.role as "user" | "assistant",
                }
              : msg
          )
        );
        onSendMessage();
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error calling AI:", error);
      toast.error("Gagal mendapatkan respons AI");
      setIsLoading(false);
    }
  };

  // Handler functions for rename and delete
  const openRename = () => {
    if (!chatId) return;
    // Get current chat title from messages or use a default
    const currentTitle = messages.length > 0 ? "Chat" : "New Chat";
    setRenameValue(currentTitle);
    setRenameOpen(true);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !onRenameChat) return;
    const newTitle = renameValue.trim();
    if (!newTitle) return;
    onRenameChat(chatId, newTitle);
    setRenameOpen(false);
  };

  const askDelete = () => {
    if (!chatId) return;
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!chatId || !onDeleteChat) return;
    onDeleteChat(chatId);
    setConfirmOpen(false);
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-background relative">
      {!isSidebarOpen || device !== "mobile" ? null : (
        <div
          onClick={closeSidebar}
          className="h-full absolute bg-gray-600/50 top-0 left-0 right-0 z-[999999]"
        ></div>
      )}

      {/* Header */}
      {device !== "mobile" && (
        <div className="w-full p-4 flex justify-end">
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
      )}
      <div className="border-b border-border bg-card p-4 flex md:hidden items-center justify-between">
        <div className="flex items-center w-full">
          {isSidebarOpen ? null : (
            <div className="ml-[-15px] md:hidden z-10">
              <Button variant="ghost" size="icon" onClick={openSidebar}>
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          )}
          <div
            className={cn(
              "flex items-center justify-between w-full",
              device === "mobile" ? "flex-row" : "flex-col"
            )}
          >
            <h2 className="text-lg font-semibold">Patriot Desa</h2>
            {subscriptionStatus === "free" && (
              <p className="text-sm text-muted-foreground">
                Terpakai: {usageCount}/5
              </p>
            )}
          </div>
        </div>
        {/* Dropdown menu for chat actions */}
        {chatId && (onRenameChat || onDeleteChat) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRenameChat && (
                <DropdownMenuItem onClick={openRename}>
                  Rename Chat
                </DropdownMenuItem>
              )}
              {onDeleteChat && (
                <DropdownMenuItem className="text-red-600" onClick={askDelete}>
                  Delete Chat
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <div
                key={msg.id}
                className={`p-4 ${
                  msg.role === "user"
                    ? "ml-auto bg-accent/5 text-accent max-w-[80%] rounded-lg"
                    : "mr-auto bg-white w-full"
                }`}
              >
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
              </div>
            ))
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">Mengetik...</p>
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

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRename} className="mt-2">
            <input
              className="w-full border rounded-md p-2 bg-background"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

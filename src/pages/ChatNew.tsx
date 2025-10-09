import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { chatKeys, useUserChats } from "@/hooks/queries/chat";
import { useSubscriptionStatus } from "@/hooks/queries/subscription";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePlanStore } from "@/store/plan";

import { ChatSidebarNew } from "@/components/chat/ChatSidebarNew";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

function generateChatTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 50) return trimmed;
  return trimmed.slice(0, 47) + "...";
}

const ChatNew = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deviceType = useDeviceType();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  
  const { setUserId: setPlanUserId, setServerStatus, currentPlan } = usePlanStore();
  
  const { data: subscriptionData, isLoading: isCheckingSubscription } = useSubscriptionStatus(userId);
  const { data: chats = [], isLoading: isLoadingChats } = useUserChats(userId);
  
  const subscriptionStatus = currentPlan || "free";
  const isPremium = subscriptionStatus === "premium" && !subscriptionData?.expired;

  // Auto-open sidebar on desktop
  useEffect(() => {
    if (deviceType !== "mobile") {
      setIsSidebarOpen(true);
    }
  }, [deviceType]);

  // Sync server status
  useEffect(() => {
    if (subscriptionData) {
      setServerStatus({
        plan: (subscriptionData.status as "free" | "premium") || "free",
        expired: !!subscriptionData.expired,
        expiry: subscriptionData.expiry || null,
      });
    }
  }, [subscriptionData, setServerStatus]);

  // Check auth and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      setUserId(session.user.id);
      setPlanUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("usage_count, daily_usage_reset_at")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const now = new Date();
        const resetAt = new Date(profile.daily_usage_reset_at);
        if (now > resetAt) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);

          await supabase
            .from("profiles")
            .update({
              usage_count: 0,
              daily_usage_reset_at: tomorrow.toISOString(),
            })
            .eq("id", session.user.id);

          setUsageCount(0);
        } else {
          setUsageCount(profile.usage_count || 0);
        }
      }
    };

    checkAuth();
  }, [navigate, setPlanUserId]);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
      setInputMessage("");
    }
  }, [currentChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage]);

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

  const handleSendMessage = async (e: React.FormEvent, fileUrls: string[] = []) => {
    e.preventDefault();
    
    // Must have either text or file URLs
    if (!inputMessage.trim() && fileUrls.length === 0) return;
    if (isLoading || !userId) return;

    // Check usage limit for free users
    if (subscriptionStatus === "free" && usageCount >= 5) {
      setShowUpgradeModal(true);
      return;
    }

    let userMessageContent = inputMessage.trim();
    
    // Append file URLs to message if any
    if (fileUrls.length > 0) {
      const fileLinks = fileUrls.map(url => {
        const fileName = url.split('/').pop();
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        return isImage ? `![${fileName}](${url})` : `[${fileName}](${url})`;
      }).join('\n');
      
      userMessageContent = userMessageContent 
        ? `${userMessageContent}\n\n${fileLinks}` 
        : fileLinks;
    }
    
    // Must have content (text or files) to send
    if (!userMessageContent) return;
    
    setInputMessage("");
    setIsLoading(true);
    setIsStreaming(true);

    try {
      let chatIdToUse = currentChatId;

      // Create new chat if none selected
      if (!chatIdToUse) {
        const { data: newChat, error: chatError } = await supabase
          .from("chats")
          .insert({
            user_id: userId,
            title: generateChatTitle(userMessageContent),
          })
          .select()
          .single();

        if (chatError) throw chatError;
        chatIdToUse = newChat.id;
        setCurrentChatId(newChat.id);
        queryClient.invalidateQueries({ queryKey: chatKeys.chats(userId) });
      }

      // Save user message with file links
      const { data: savedUserMessage, error: userMsgError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chatIdToUse,
          role: "user",
          message: userMessageContent,
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Add user message to UI
      setMessages((prev) => [...prev, savedUserMessage as Message]);

      // Get previous messages for context
      const { data: previousMessages } = await supabase
        .from("chat_messages")
        .select("role, message")
        .eq("chat_id", chatIdToUse)
        .order("created_at", { ascending: true });

      const contextMessages = previousMessages?.map((msg) => ({
        role: msg.role,
        content: msg.message,
      })) || [];

      // Call AI function with streaming
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: contextMessages }),
        }
      );

      if (!response.ok) throw new Error("AI response failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantResponse += chunk;
          setStreamingMessage(assistantResponse);
        }
      }

      setStreamingMessage("");
      setIsStreaming(false);

      // Save assistant message
      const { data: savedAssistantMessage, error: assistantMsgError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chatIdToUse,
          role: "assistant",
          message: assistantResponse,
        })
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages((prev) => [...prev, savedAssistantMessage as Message]);

      // Update usage count
      const { error: usageError } = await supabase
        .from("profiles")
        .update({ usage_count: usageCount + 1 })
        .eq("id", userId);

      if (!usageError) {
        setUsageCount((prev) => prev + 1);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setStreamingMessage("");
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]): Promise<string[]> => {
    if (!userId) {
      toast.error("Anda harus login untuk mengunggah file");
      return [];
    }

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('chat-files')
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Gagal mengunggah ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-files')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} file berhasil diunggah`);
        return uploadedUrls;
      }

      return [];
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Terjadi kesalahan saat mengunggah file");
      return [];
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentChatId || !userId) return;

    try {
      // Update the message in database
      const { error } = await supabase
        .from("chat_messages")
        .update({ message: newContent })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, message: newContent } : msg
      ));

      toast.success("Pesan berhasil diubah");
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Gagal mengubah pesan");
    }
  };

  const handleResendMessage = async (messageId: string, content: string) => {
    if (!currentChatId || !userId) return;

    setIsLoading(true);
    setIsStreaming(true);

    try {
      // Find the message index
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      // Delete all messages after this one (including AI responses)
      const messagesToDelete = messages.slice(messageIndex + 1);
      for (const msg of messagesToDelete) {
        await supabase.from("chat_messages").delete().eq("id", msg.id);
      }

      // Update the user message with new content
      await supabase
        .from("chat_messages")
        .update({ message: content })
        .eq("id", messageId);

      // Update local state to show only messages up to and including edited one
      const updatedMessages = messages.slice(0, messageIndex).concat({
        ...messages[messageIndex],
        message: content
      });
      setMessages(updatedMessages);

      // Get conversation history for AI context
      const contextMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.message,
      }));

      // Call AI with updated context
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: contextMessages }),
        }
      );

      if (!response.ok) throw new Error("AI response failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantResponse += chunk;
          setStreamingMessage(assistantResponse);
        }
      }

      setStreamingMessage("");
      setIsStreaming(false);

      // Save new assistant response
      const { data: savedAssistantMessage, error: assistantMsgError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: currentChatId,
          role: "assistant",
          message: assistantResponse,
        })
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages((prev) => [...prev, savedAssistantMessage as Message]);
      toast.success("Pesan berhasil dikirim ulang");

    } catch (error) {
      console.error("Error resending message:", error);
      toast.error("Gagal mengirim ulang pesan");
      setStreamingMessage("");
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebarNew
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={() => {
          setCurrentChatId(null);
          if (deviceType === "mobile") {
            setIsSidebarOpen(false);
          }
        }}
        onSelectChat={(chatId) => {
          setCurrentChatId(chatId);
          if (deviceType === "mobile") {
            setIsSidebarOpen(false);
          }
        }}
        onLogout={async () => {
          await supabase.auth.signOut();
          navigate("/login");
        }}
        onRenameChat={async (chatId, newTitle) => {
          await supabase.from("chats").update({ title: newTitle }).eq("id", chatId);
          queryClient.invalidateQueries({ queryKey: chatKeys.chats(userId as string) });
          toast.success("Judul percakapan berhasil diperbarui!");
        }}
        onDeleteChat={async (chatId) => {
          await supabase.from("chats").delete().eq("id", chatId);
          if (currentChatId === chatId) setCurrentChatId(null);
          queryClient.invalidateQueries({ queryKey: chatKeys.chats(userId as string) });
          toast.success("Percakapan berhasil dihapus!");
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  PD
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Selamat Datang di Patriot Desa
                </h2>
                <p className="text-muted-foreground">
                  Mulai percakapan baru dengan mengirim pesan di bawah ini
                </p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  role={message.role}
                  content={message.message}
                  onEdit={handleEditMessage}
                  onResend={handleResendMessage}
                />
              ))}
              {streamingMessage && (
                <ChatMessage
                  id="streaming"
                  role="assistant"
                  content={streamingMessage}
                  isStreaming={true}
                />
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSubmit={handleSendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading || isStreaming}
          disabled={isLoading || isStreaming}
          placeholder={
            subscriptionStatus === "free" && usageCount >= 5
              ? "Batas penggunaan harian tercapai"
              : "Tulis pesan Anda..."
          }
        />
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Tingkatkan ke Premium
            </DialogTitle>
            <DialogDescription>
              Anda telah mencapai batas penggunaan gratis harian (5 pesan).
              Tingkatkan ke Premium untuk akses tanpa batas!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Keuntungan Premium:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Akses tanpa batas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Prioritas dukungan
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Fitur-fitur eksklusif
                </li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/subscription");
                }}
                className="flex-1"
              >
                Tingkatkan Sekarang
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Nanti
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatNew;

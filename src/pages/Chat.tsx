import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/queries/subscription";
import { useUserChats, chatKeys } from "@/hooks/queries/chat";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import { usePlanStore } from "@/store/plan";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const isSidebarOpen = useGlobalStore((s) => s.isSidebarOpen);
  const openSidebar = useGlobalStore((s) => s.openSidebar);
  const closeSidebar = useGlobalStore((s) => s.closeSidebar);
  const { setUserId: setPlanUserId, setServerStatus } = usePlanStore();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: subscriptionData, isLoading: isCheckingSubscription } =
    useSubscriptionStatus(userId);
  const { setUpdatePlan, currentPlan } = usePlanStore();
  const { data: chats = [], isLoading: isLoadingChats } = useUserChats(userId);

  console.log({ subscriptionData });
  console.log({ currentPlan });
  const subscriptionStatus = currentPlan || "free";
  const isPremium =
    subscriptionStatus === "premium" && !subscriptionData?.expired;

  useEffect(() => {
    if (currentPlan === "free" && subscriptionData?.status === "premium") {
      setUpdatePlan("premium");
    }
  }, [subscriptionData]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      setUserId(session.user.id);
      setPlanUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, usage_count, subscription_status, daily_usage_reset_at")
        .eq("id", session.user.id)
        .single();

      if (!profile?.role || profile?.role === "umum") {
        navigate("/onboarding");
        return;
      }

      // Check if need to reset daily usage
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
    };

    checkAuth();
  }, [navigate]);

  // Sync server status into plan store
  useEffect(() => {
    if (subscriptionData) {
      setServerStatus({
        plan: (subscriptionData.status as "free" | "premium") || "free",
        expired: !!subscriptionData.expired,
        expiry: subscriptionData.expiry || null,
      });
    }
  }, [subscriptionData, setServerStatus]);

  // Handlers for sidebar actions
  const handleNewChat = async () => {
    // Open empty chat view; persist on first message
    setCurrentChatId(null);
    closeSidebar();
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    closeSidebar();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    await supabase.from("chats").update({ title: newTitle }).eq("id", chatId);
    try {
      queryClient.setQueryData(chatKeys.chats(userId as string), (old: any) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.map((c: any) =>
          c.id === chatId ? { ...c, title: newTitle } : c
        );
      });
      // Fallback ensure fresh
      queryClient.invalidateQueries({
        queryKey: chatKeys.chats(userId as string),
      });
    } catch {}
    toast.success("Judul chat berhasil diperbarui!");
  };

  const handleDeleteChat = async (chatId: string) => {
    await supabase.from("chats").delete().eq("id", chatId);
    try {
      queryClient.setQueryData(chatKeys.chats(userId as string), (old: any) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.filter((c: any) => c.id !== chatId);
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.chats(userId as string),
      });
    } catch {}
    if (currentChatId === chatId) setCurrentChatId(null);
    toast.success("Chat berhasil dihapus!");
  };

  const handleSendMessage = async (message: string) => {
    if (!userId) return;

    // Check usage limit for free users
    if (!isPremium && usageCount >= 5) {
      toast.error(
        "Anda telah mencapai batas penggunaan harian. Upgrade ke Premium untuk akses unlimited!"
      );
      return;
    }

    try {
      // If no current chat, create a new one
      let chatId = currentChatId;
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from("chats")
          .insert({
            user_id: userId,
            title:
              message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          })
          .select()
          .single();

        if (chatError) {
          toast.error("Gagal membuat chat baru");
          return;
        }

        chatId = newChat.id;
        setCurrentChatId(chatId);
        // Update chat list cache immediately
        try {
          queryClient.setQueryData(chatKeys.chats(userId), (old: any) => {
            const arr = Array.isArray(old) ? old : [];
            return [newChat, ...arr];
          });
        } catch {}
      }

      // Add user message to chat
      await supabase.from("chat_messages").insert({
        chat_id: chatId,
        role: "user",
        message: message,
      });

      // Update usage count for free users
      if (!isPremium) {
        const newUsageCount = usageCount + 1;
        setUsageCount(newUsageCount);

        await supabase
          .from("profiles")
          .update({ usage_count: newUsageCount })
          .eq("id", userId);
      }

      // Call AI function
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: {
          chat_id: chatId,
          message: message,
        },
      });

      if (error) {
        toast.error("Gagal mengirim pesan");
        return;
      }

      // Add AI response to chat
      await supabase.from("chat_messages").insert({
        chat_id: chatId,
        role: "assistant",
        message: data.response,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Terjadi kesalahan saat mengirim pesan");
    }
  };

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-gradient-to-b from-background to-primary-light/20 overflow-hidden">
        {/* Mobile hamburger to open sidebar */}
        <div className="absolute top-3 left-3 md:hidden z-10">
          <Button variant="ghost" size="icon" onClick={openSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            chatId={currentChatId}
            usageCount={usageCount}
            subscriptionStatus={subscriptionStatus}
            onSendMessage={() => {}}
            onChatCreated={(newId: string) => {
              setCurrentChatId(newId);
              if (userId) {
                queryClient.invalidateQueries({
                  queryKey: chatKeys.chats(userId as string),
                });
              }
            }}
          />
        </div>
        {/* Mobile Sidebar Drawer */}
        <Dialog
          open={isSidebarOpen}
          onOpenChange={(val) => (val ? openSidebar() : closeSidebar())}
        >
          <DialogContent className="p-0 w-72 sm:max-w-[18rem] md:hidden">
            <ChatSidebar
              chats={chats}
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onLogout={handleLogout}
              onRenameChat={handleRenameChat}
              onDeleteChat={handleDeleteChat}
            />
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default Chat;

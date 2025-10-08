import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";

import { chatKeys, useUserChats } from "@/hooks/queries/chat";
import { useSubscriptionStatus } from "@/hooks/queries/subscription";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useGlobalStore } from "@/store/global";
import { usePlanStore } from "@/store/plan";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";

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

  const deviceType = useDeviceType();
  useEffect(() => {
    if (deviceType !== "mobile") {
      openSidebar();
    }
  }, [deviceType, openSidebar]);

  // React Query hooks
  const { data: subscriptionData, isLoading: isCheckingSubscription } =
    useSubscriptionStatus(userId);
  const { setUpdatePlan, currentPlan } = usePlanStore();
  const { data: chats = [], isLoading: isLoadingChats } = useUserChats(userId);

  const subscriptionStatus = currentPlan || "free";
  const isPremium =
    subscriptionStatus === "premium" && !subscriptionData?.expired;

  useEffect(() => {
    if (currentPlan === "free" && subscriptionData?.status === "premium") {
      setUpdatePlan("premium");
    }
  }, [subscriptionData, currentPlan, setUpdatePlan]);

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

      // No redirect based on role; allow access regardless of role value (including null or "umum")

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
  }, [navigate, setPlanUserId]);

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
    if (deviceType === "mobile") {
      closeSidebar();
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (deviceType === "mobile") {
      closeSidebar();
    }
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
    } catch {
      console.log("catch err");
    }
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
    } catch {
      console.log("catch");
    }
    if (currentChatId === chatId) setCurrentChatId(null);
    toast.success("Chat berhasil dihapus!");
  };

  const handleSendMessage = async () => {
    if (!userId) return;

    // Update usage count in the database
    const { error } = await supabase
      .from("profiles")
      .update({
        usage_count: usageCount + 1,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating usage count:", error);
      return;
    }

    // Update local state
    setUsageCount((prev) => prev + 1);
  };

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        {isSidebarOpen ? (
          <ChatSidebar
            closeSidebar={closeSidebar}
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onLogout={handleLogout}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
          />
        ) : null}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            closeSidebar={closeSidebar}
            isSidebarOpen={isSidebarOpen}
            openSidebar={openSidebar}
            chatId={currentChatId}
            usageCount={usageCount}
            subscriptionStatus={subscriptionStatus}
            onSendMessage={handleSendMessage}
            onChatCreated={(newId: string) => {
              setCurrentChatId(newId);
              if (userId) {
                queryClient.invalidateQueries({
                  queryKey: chatKeys.chats(userId as string),
                });
              }
            }}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { toast } from "sonner";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "free" | "premium"
  >("free");

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
        await supabase
          .from("profiles")
          .update({
            usage_count: 0,
            daily_usage_reset_at: new Date(
              now.getTime() + 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .eq("id", session.user.id);
        setUsageCount(0);
      } else {
        setUsageCount(profile.usage_count || 0);
      }

      setSubscriptionStatus(profile.subscription_status as "free" | "premium");

      loadChats(session.user.id);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadChats = async (uid: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select("id, title, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat riwayat chat");
      return;
    }

    setChats(data || []);
    if (data && data.length > 0 && !currentChatId) {
      setCurrentChatId(data[0].id);
    }
  };

  const handleNewChat = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: userId, title: "Chat Baru" })
      .select()
      .single();

    if (error) {
      toast.error("Gagal membuat chat baru");
      return;
    }

    setChats([data, ...chats]);
    setCurrentChatId(data.id);
    toast.success("Chat baru dibuat");
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const incrementUsage = async () => {
    if (!userId) return;

    const newCount = usageCount + 1;
    setUsageCount(newCount);

    await supabase
      .from("profiles")
      .update({ usage_count: newCount })
      .eq("id", userId);
  };
  console.log({ chats });
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
        />
        <ChatInterface
          chatId={currentChatId}
          usageCount={usageCount}
          subscriptionStatus={subscriptionStatus}
          onSendMessage={incrementUsage}
        />
      </div>
    </SidebarProvider>
  );
};

export default Chat;

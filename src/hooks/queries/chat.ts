import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner-api";

import { apiService, supabaseApi } from "@/lib/api";

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  messages: (chatId: string) => [...chatKeys.all, "messages", chatId] as const,
  chats: (userId: string) => [...chatKeys.all, "chats", userId] as const,
};

// Send message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { chat_id: string; message: string }) => {
      const response = await apiService.sendMessage(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate chat messages to refetch
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.chat_id),
      });
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
    },
  });
};

// Get chat messages
export const useChatMessages = (chatId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messages(chatId || ""),
    queryFn: async () => {
      if (!chatId) throw new Error("Chat ID is required");
      const { data, error } = await supabaseApi.getChatMessages(chatId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get user chats
export const useUserChats = (userId: string | null) => {
  return useQuery({
    queryKey: chatKeys.chats(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const { data, error } = await supabaseApi.getChats(userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create new chat
export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user_id: string; title: string }) => {
      const { data: chat, error } = await supabaseApi.createChat(data);
      if (error) throw error;
      return chat;
    },
    onSuccess: (data, variables) => {
      // Invalidate user chats to refetch
      queryClient.invalidateQueries({
        queryKey: chatKeys.chats(variables.user_id),
      });
    },
    onError: (error: any) => {
      console.error("Create chat error:", error);
      toast.error("Failed to create chat");
    },
  });
};

// Add message to chat
export const useAddMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      chat_id: string;
      role: string;
      message: string;
      category?: string;
    }) => {
      const { error } = await supabaseApi.addMessage(data);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate chat messages to refetch
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(data.chat_id),
      });
    },
    onError: (error: any) => {
      console.error("Add message error:", error);
      toast.error("Failed to add message");
    },
  });
};

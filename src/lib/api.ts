import axios from "axios";

import { supabase } from "@/integrations/supabase/client";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL + "/functions/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth headers
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    config.headers.apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Subscription APIs
  createSubscription: (data: {
    user_id: string;
    customer_name: string;
    customer_email: string;
  }) => api.post("/create-subscription", data),

  checkSubscription: (data: { user_id: string }) =>
    api.post("/check-subscription", data),

  // Chat APIs
  sendMessage: (data: { chat_id: string; message: string }) =>
    api.post("/chat-ai", data),

  // User profile APIs
  updateProfile: (data: { user_id: string; name?: string; role?: string }) =>
    api.post("/update-profile", data),

  // Midtrans APIs (if you still need them)
  getMidtransToken: (data: {
    order_id: string;
    gross_amount: string;
    customer_name: string;
    customer_email: string;
    user_id: string;
  }) => api.post("/midtrans-token", data),

  createMidtransSubscription: (data: {
    user_id: string;
    customer_name: string;
    customer_email: string;
    card_token?: string;
  }) => api.post("/midtrans-subscription", data),

  // Admin APIs
  getDashboardStats: () => api.post("/admin-dashboard-stats", {}),
  
  getAdminUsers: () => api.post("/admin-users", {}),
  
  resetUserQuota: (data: { user_id: string }) => 
    api.post("/admin-reset-quota", data),
  
  deleteUser: (data: { user_id: string }) => 
    api.post("/admin-delete-user", data),
  
  getActivityLogs: (data: { limit?: number }) => 
    api.post("/admin-activity-logs", data),
  
  getAdminSettings: () => api.post("/admin-settings", {}),
  
  updateAdminSettings: (data: any) => api.put("/admin-settings", data),
  
  getUserGrowthData: () => api.post("/admin-user-growth", {}),
  
  getQueryDistribution: () => api.post("/admin-query-distribution", {}),
};

// Direct Supabase API calls (for database operations)
export const supabaseApi = {
  // Profile operations
  getProfile: (userId: string) =>
    supabase.from("profiles").select("*").eq("id", userId).single(),

  updateProfile: (userId: string, data: any) =>
    supabase.from("profiles").update(data).eq("id", userId),

  // Chat operations
  getChats: (userId: string) =>
    supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

  createChat: (data: { user_id: string; title: string }) =>
    supabase.from("chats").insert(data).select().single(),

  getChatMessages: (chatId: string) =>
    supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true }),

  addMessage: (data: { chat_id: string; role: string; message: string }) =>
    supabase.from("chat_messages").insert(data),

  // Subscription operations
  getSubscription: (userId: string) =>
    supabase.from("subscriptions").select("*").eq("user_id", userId).single(),

  updateSubscription: (userId: string, data: any) =>
    supabase.from("subscriptions").update(data).eq("user_id", userId),

  createOrUpdateSubscription: (data: {
    user_id: string;
    plan: string;
    end_date: string;
    amount_paid?: number;
  }) => supabase.from("subscriptions").upsert(data, { onConflict: "user_id" }),
};

export default api;

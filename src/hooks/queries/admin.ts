// React Query hooks for admin dashboard
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner-api";

import { apiService } from "@/lib/api";

// Query Keys
export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  logs: () => [...adminKeys.all, "logs"] as const,
  settings: () => [...adminKeys.all, "settings"] as const,
  chartUserGrowth: () => [...adminKeys.all, "chart", "user-growth"] as const,
  chartQueryDist: () =>
    [...adminKeys.all, "chart", "query-distribution"] as const,
};

// Dashboard Stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const response = await apiService.getDashboardStats();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Users
export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      const response = await apiService.getAdminUsers();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useResetUserQuota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiService.resetUserQuota({ user_id: userId });
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      // Update the users cache
      queryClient.setQueryData(adminKeys.users(), (old: any[] | undefined) => {
        if (!old) return [updatedUser];
        return old.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (error: any) => {
      console.error("Reset quota error:", error);
      toast.error(error.response?.data?.error || "Failed to reset quota");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiService.deleteUser({ user_id: userId });
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.setQueryData(adminKeys.users(), (old: any[] | undefined) => {
        if (!old) return [];
        return old.filter((u) => u.id !== userId);
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (error: any) => {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.error || "Failed to delete user");
    },
  });
};

// Activity Logs
export const useActivityLogs = (limit?: number) => {
  return useQuery({
    queryKey: [...adminKeys.logs(), limit],
    queryFn: async () => {
      const response = await apiService.getActivityLogs({ limit });
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

// Settings
export const useAdminSettings = () => {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: async () => {
      const response = await apiService.getAdminSettings();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiService.updateAdminSettings(updates);
      return response.data.data;
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(adminKeys.settings(), updatedSettings);
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      console.error("Update settings error:", error);
      toast.error(error.response?.data?.error || "Failed to update settings");
    },
  });
};

// Chart Data
export const useUserGrowthData = () => {
  return useQuery({
    queryKey: adminKeys.chartUserGrowth(),
    queryFn: async () => {
      const response = await apiService.getUserGrowthData();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useQueryDistribution = () => {
  return useQuery({
    queryKey: adminKeys.chartQueryDist(),
    queryFn: async () => {
      const response = await apiService.getQueryDistribution();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

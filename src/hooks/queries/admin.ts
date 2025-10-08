// React Query hooks for admin dashboard
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import type { MockUser, MockSettings } from '@/lib/mockApi';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  logs: () => [...adminKeys.all, 'logs'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  chartUserGrowth: () => [...adminKeys.all, 'chart', 'user-growth'] as const,
  chartQueryDist: () => [...adminKeys.all, 'chart', 'query-distribution'] as const,
};

// Dashboard Stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: mockApi.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Users
export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: mockApi.getUsers,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useResetUserQuota = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => mockApi.resetUserQuota(userId),
    onSuccess: (updatedUser) => {
      // Update the users cache
      queryClient.setQueryData(adminKeys.users(), (old: MockUser[] | undefined) => {
        if (!old) return [updatedUser];
        return old.map(u => u.id === updatedUser.id ? updatedUser : u);
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => mockApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(adminKeys.users(), (old: MockUser[] | undefined) => {
        if (!old) return [];
        return old.filter(u => u.id !== userId);
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

// Activity Logs
export const useActivityLogs = (limit?: number) => {
  return useQuery({
    queryKey: [...adminKeys.logs(), limit],
    queryFn: () => mockApi.getActivityLogs(limit),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Settings
export const useAdminSettings = () => {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: mockApi.getSettings,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<MockSettings>) => mockApi.updateSettings(updates),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(adminKeys.settings(), updatedSettings);
    },
  });
};

// Chart Data
export const useUserGrowthData = () => {
  return useQuery({
    queryKey: adminKeys.chartUserGrowth(),
    queryFn: mockApi.getUserGrowthData,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useQueryDistribution = () => {
  return useQuery({
    queryKey: adminKeys.chartQueryDist(),
    queryFn: mockApi.getQueryDistribution,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

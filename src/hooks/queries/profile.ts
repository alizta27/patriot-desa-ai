import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner-api";

import { subscriptionKeys } from "./subscription";

import { supabaseApi } from "@/lib/api";

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => [...profileKeys.all, "detail", userId] as const,
};

// Get user profile
export const useProfile = (userId: string | null) => {
  return useQuery({
    queryKey: profileKeys.detail(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const { data, error } = await supabaseApi.getProfile(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const { error } = await supabaseApi.updateProfile(userId, data);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update the cache with new data
      queryClient.setQueryData(
        profileKeys.detail(variables.userId),
        (old: any) => ({
          ...old,
          ...data,
        })
      );

      // Invalidate to refetch
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.status(variables.userId),
      });

      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    },
  });
};

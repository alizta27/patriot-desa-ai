import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner-api";

import { apiService } from "@/lib/api";

// Query keys
export const subscriptionKeys = {
  all: ["subscription"] as const,
  status: (userId: string) =>
    [...subscriptionKeys.all, "status", userId] as const,
};

// Check subscription status
export const useSubscriptionStatus = (userId: string | null) => {
  return useQuery({
    queryKey: subscriptionKeys.status(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await apiService.checkSubscription({ user_id: userId });
      return response.data;
    },
    enabled: !!userId,
  });
};

// Create subscription mutation
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      customer_name: string;
      customer_email: string;
    }) => {
      const response = await apiService.createSubscription(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate subscription status queries
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      toast.success("Payment token created successfully");
    },
    onError: (error: any) => {
      console.error("Create subscription error:", error);
      toast.error(
        error.response?.data?.error || "Failed to create subscription"
      );
    },
  });
};

// Manual subscription check (for refresh)
export const useCheckSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiService.checkSubscription({ user_id: userId });
      return response.data;
    },
    onSuccess: (data, userId) => {
      // Update the cache with new data
      queryClient.setQueryData(subscriptionKeys.status(userId), data);

      if (data.expired) {
        toast.info(
          "Subscription Anda telah berakhir dan telah diturunkan ke paket gratis"
        );
      }
    },
    onError: (error: any) => {
      console.error("Check subscription error:", error);
      toast.error("Failed to check subscription status");
    },
  });
};

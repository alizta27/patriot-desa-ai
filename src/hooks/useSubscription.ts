import { useCheckSubscription,useSubscriptionStatus } from '@/hooks/queries/subscription';

interface SubscriptionStatus {
  status: "free" | "premium";
  expiry: string | null;
  expired: boolean;
}

export const useSubscription = (userId: string | null) => {
  const { data: subscriptionData, isLoading, error } = useSubscriptionStatus(userId);
  const checkSubscriptionMutation = useCheckSubscription();

  const subscriptionStatus: SubscriptionStatus = {
    status: subscriptionData?.status || "free",
    expiry: subscriptionData?.expiry || null,
    expired: subscriptionData?.expired || false,
  };

  const isPremium = subscriptionStatus.status === "premium" && !subscriptionStatus.expired;
  const isExpired = subscriptionStatus.expired;

  const checkSubscription = async () => {
    if (userId) {
      await checkSubscriptionMutation.mutateAsync(userId);
    }
  };

  return {
    subscriptionStatus,
    isPremium,
    isExpired,
    isLoading,
    checkSubscription,
    error,
  };
};

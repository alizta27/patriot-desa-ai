import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

import {
  useCreateSubscription,
  useSubscriptionStatus,
} from "@/hooks/queries/subscription";
import { usePlanStore } from "@/store/plan";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";
import { supabaseApi } from "@/lib/api";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    snap: any;
  }
}

// Load Midtrans Snap script
const loadMidtransScript = () => {
  if (document.getElementById("midtrans-script")) return;
  const script = document.createElement("script");
  script.id = "midtrans-script";
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute(
    "data-client-key",
    import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  );
  document.body.appendChild(script);
};

const Subscription = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    setUserId: setPlanUserId,
    setServerStatus,
    setUpdatePlan,
    beginUpgrade,
    endUpgrade,
  } = usePlanStore();

  // React Query hooks
  const { data: subscriptionData, isLoading: isCheckingSubscription } =
    useSubscriptionStatus(userId);
  const createSubscriptionMutation = useCreateSubscription();

  const currentPlan = subscriptionData?.status || "free";
  const subscriptionExpiry = subscriptionData?.expiry || null;
  const isExpired = subscriptionData?.expired || false;

  useEffect(() => {
    loadMidtransScript();

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
    };
    checkAuth();
  }, [navigate, setPlanUserId]);

  // Sync server status into plan store for cross-page availability
  useEffect(() => {
    if (subscriptionData) {
      setServerStatus({
        plan: (subscriptionData.status as "free" | "premium") || "free",
        expired: !!subscriptionData.expired,
        expiry: subscriptionData.expiry || null,
      });
    }
  }, [subscriptionData, setServerStatus]);

  // Handle upgrade with React Query
  const handleUpgrade = async () => {
    if (!userId) return;
    setIsLoading(true);
    beginUpgrade();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const customerName =
        user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
      const customerEmail = user?.email || "";

      // Use React Query mutation
      const data = await createSubscriptionMutation.mutateAsync({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
      });

      if (!data?.snap_token) {
        toast.error("Gagal mendapatkan token pembayaran");
        setIsLoading(false);
        endUpgrade();
        return;
      }

      // Open Snap for payment
      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: async function (result: any) {
            console.log("Payment success:", result);
            toast.success("Pembayaran berhasil! Mengaktifkan Premium...");

            try {
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              // Update profile
              await supabaseApi.updateProfile(userId, {
                subscription_status: "premium",
                subscription_expiry: endDate.toISOString(),
                last_payment_id: result?.order_id || null,
              });

              // Upsert subscriptions
              await supabaseApi.createOrUpdateSubscription({
                user_id: userId,
                plan: "premium",
                end_date: endDate.toISOString(),
                amount_paid: Number(result?.gross_amount) || 99000,
              });

              // Update store immediately
              setServerStatus({
                plan: "premium",
                expired: false,
                expiry: endDate.toISOString(),
              });
              setUpdatePlan("premium");

              navigate("/chat");
            } catch (e) {
              console.error("Activate premium failed:", e);
              toast.error(
                "Aktivasi gagal disimpan. Coba buka Chat atau refresh."
              );
            } finally {
              setIsLoading(false);
              endUpgrade();
            }
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
            toast.info("Pembayaran sedang diproses.");
            setIsLoading(false);
            endUpgrade();
          },
          onError: function (result: any) {
            console.error("Payment error:", result);
            toast.error("Pembayaran gagal.");
            setIsLoading(false);
            endUpgrade();
          },
          onClose: function () {
            console.log("Payment popup closed");
            toast.info("Popup ditutup.");
            setIsLoading(false);
            endUpgrade();
          },
        });
      } else {
        toast.error("Midtrans Snap belum siap.");
        setIsLoading(false);
        endUpgrade();
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Terjadi kesalahan saat membuat subscription");
      setIsLoading(false);
      endUpgrade();
    }
  };

  // Format expiry date for display
  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading subscription status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/chat")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pilih Paket Anda</h1>
          <p className="text-muted-foreground">
            Upgrade ke Premium untuk akses unlimited
          </p>
          {currentPlan === "premium" && subscriptionExpiry && !isExpired && (
            <p className="text-sm text-green-600 mt-2">
              Premium aktif hingga: {formatExpiryDate(subscriptionExpiry)}
            </p>
          )}
          {isExpired && (
            <p className="text-sm text-red-600 mt-2">
              Subscription Anda telah berakhir
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card
            className={cn(
              currentPlan === "free" ? "border-primary" : "",
              "flex flex-col justify-between"
            )}
          >
            <CardHeader>
              <CardTitle>Gratis</CardTitle>
              <CardDescription>Untuk mencoba</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Rp 0</span>
                <span className="text-muted-foreground">/bulan</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>5 pertanyaan per hari</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Akses fitur dasar AI</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Riwayat chat terbatas</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentPlan === "free" && (
                <Button disabled className="w-full">
                  Paket Aktif
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card
            className={`${
              currentPlan === "premium" ? "border-primary" : "border-primary/50"
            } relative overflow-hidden flex flex-col justify-between`}
          >
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
              Populer
            </div>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Untuk pengguna aktif</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Rp 99.000</span>
                <span className="text-muted-foreground">/30 hari</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">Pertanyaan unlimited</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Akses semua fitur AI</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Riwayat chat unlimited</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Konsultasi dengan ahli</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Support prioritas</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentPlan === "premium" && !isExpired ? (
                <Button disabled className="w-full">
                  Paket Aktif
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading || createSubscriptionMutation.isPending}
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  {isLoading || createSubscriptionMutation.isPending
                    ? "Memproses..."
                    : "Upgrade Sekarang"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

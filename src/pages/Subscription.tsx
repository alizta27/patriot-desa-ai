import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    snap: any;
  }
}

// Tambahkan script Snap Midtrans
const loadMidtransScript = () => {
  console.log(
    "VITE_MIDTRANS_CLIENT_KEY",
    import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  );
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
  const [currentPlan, setCurrentPlan] = useState<"free" | "premium">("free");
  const [isLoading, setIsLoading] = useState(false);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setCurrentPlan(profile.subscription_status as "free" | "premium");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleUpgradeInDb = async (tokenData: any) => {
    if (!userId) return;
    console.log({ tokenData });
    // setIsLoading(true);

    // // Mock upgrade - in production this would integrate with payment gateway
    // const { error: profileError } = await supabase
    //   .from("profiles")
    //   .update({ subscription_status: "premium" })
    //   .eq("id", userId);

    // if (profileError) {
    //   toast.error("Gagal upgrade ke Premium");
    //   setIsLoading(false);
    //   return;
    // }

    // const endDate = new Date();
    // endDate.setMonth(endDate.getMonth() + 1);

    // const { error: subError } = await supabase
    //   .from("subscriptions")
    //   .update({
    //     plan: "premium",
    //     end_date: endDate.toISOString(),
    //     amount_paid: 99000,
    //   })
    //   .eq("user_id", userId);

    // if (subError) {
    //   toast.error("Gagal menyimpan data subscription");
    //   setIsLoading(false);
    //   return;
    // }

    toast.success("Berhasil upgrade ke Premium!");
    setCurrentPlan("premium");
    // setIsLoading(false);
    navigate("/chat");
  };

  // Fungsi untuk handle upgrade dengan Midtrans
  const handleUpgrade = async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      const customerName = user?.user_metadata?.name || user?.email?.split('@')[0] || "User";
      const customerEmail = user?.email || "";
      
      // Step 1: Get Snap token for card registration
      const { data: snapData, error: snapError } = await supabase.functions.invoke(
        "midtrans-subscription",
        {
          body: {
            user_id: userId,
            customer_name: customerName,
            customer_email: customerEmail,
            amount: 99000,
          },
        }
      );

      if (snapError || !snapData?.snap_token) {
        toast.error("Gagal mendapatkan token pembayaran");
        setIsLoading(false);
        return;
      }

      // Step 2: Open Snap for card registration
      if (window.snap) {
        window.snap.pay(snapData.snap_token, {
          onSuccess: async function (result: any) {
            console.log("Card registration success:", result);
            
            // Get saved card token from result
            const savedTokenId = result.saved_token_id || result.token_id;
            
            if (!savedTokenId) {
              toast.error("Token kartu tidak ditemukan");
              setIsLoading(false);
              return;
            }

            toast.info("Membuat subscription...");

            // Step 3: Create subscription with card token
            const { data: subData, error: subError } = await supabase.functions.invoke(
              "midtrans-subscription",
              {
                body: {
                  user_id: userId,
                  customer_name: customerName,
                  customer_email: customerEmail,
                  amount: 99000,
                  card_token: savedTokenId,
                },
              }
            );

            if (subError || !subData?.success) {
              toast.error("Gagal membuat subscription");
              setIsLoading(false);
              return;
            }

            toast.success("Subscription berhasil dibuat! Selamat datang Premium Member!");
            setCurrentPlan("premium");
            setTimeout(() => navigate("/chat"), 1500);
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
            toast.info("Pembayaran sedang diproses.");
            setIsLoading(false);
          },
          onError: function (result: any) {
            console.error("Payment error:", result);
            toast.error("Pembayaran gagal.");
            setIsLoading(false);
          },
          onClose: function () {
            toast.info("Popup ditutup.");
            setIsLoading(false);
          },
        });
      } else {
        toast.error("Midtrans Snap belum siap.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Terjadi kesalahan saat proses subscription.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light/20">
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
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className={currentPlan === "free" ? "border-primary" : ""}>
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
              {currentPlan === "free" && (
                <Button disabled className="w-full">
                  Paket Aktif
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card
            className={`${
              currentPlan === "premium" ? "border-primary" : "border-primary/50"
            } relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
              Populer
            </div>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Untuk pengguna aktif</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Rp 99.000</span>
                <span className="text-muted-foreground">/bulan</span>
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
              {currentPlan === "premium" ? (
                <Button disabled className="w-full">
                  Paket Aktif
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  {isLoading ? "Memproses..." : "Upgrade Sekarang"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

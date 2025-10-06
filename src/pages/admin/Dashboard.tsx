import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    aparatur: 0,
    pendamping: 0,
    bumdes: 0,
    umum: 0,
    totalQuestions: 0,
    premiumUsers: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (!hasAdminRole) {
        toast.error(
          "Akses ditolak. Hanya admin yang dapat mengakses halaman ini."
        );
        navigate("/chat");
        return;
      }

      loadStats();
    };
    checkAdmin();
  }, [navigate]);

  const loadStats = async () => {
    setIsLoading(true);

    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Users by role
    const { data: roleStats } = await supabase.from("profiles").select("role");

    const aparatur =
      roleStats?.filter((r) => r.role === "aparatur").length || 0;
    const pendamping =
      roleStats?.filter((r) => r.role === "pendamping").length || 0;
    const bumdes = roleStats?.filter((r) => r.role === "bumdes").length || 0;
    const umum = roleStats?.filter((r) => r.role === "umum").length || 0;

    // Total questions (messages)
    const { count: totalQuestions } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");

    // Premium users
    const { count: premiumUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "premium");

    // Total revenue
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("amount_paid");

    const totalRevenue =
      subscriptions?.reduce(
        (sum, sub) => sum + (Number(sub.amount_paid) || 0),
        0
      ) || 0;

    setStats({
      totalUsers: totalUsers || 0,
      aparatur,
      pendamping,
      bumdes,
      umum,
      totalQuestions: totalQuestions || 0,
      premiumUsers: premiumUsers || 0,
      totalRevenue,
    });

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Statistik dan analitik platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/users")}>
              Kelola Pengguna
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pengguna
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pengguna terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pertanyaan
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pertanyaan diajukan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pengguna Premium
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Subscriber aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pendapatan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pendapatan kumulatif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pengguna per Role</CardTitle>
            <CardDescription>
              Jumlah pengguna berdasarkan peran mereka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Aparatur Desa
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.aparatur}
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Pendamping Desa
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.pendamping}
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  BUMDes/Kopdes
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.bumdes}
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Pengguna Umum
                </p>
                <p className="text-2xl font-bold text-primary">{stats.umum}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

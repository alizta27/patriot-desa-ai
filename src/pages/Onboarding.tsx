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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Building2, Store, User } from "lucide-react";

const roles = [
  {
    value: "aparatur",
    label: "Aparatur Desa",
    description: "Perangkat desa dan pejabat desa",
    icon: Users,
  },
  {
    value: "pendamping",
    label: "Pendamping Desa",
    description: "Pendamping dan fasilitator desa",
    icon: Building2,
  },
  {
    value: "bumdes",
    label: "BUMDes/Kopdes",
    description: "Pengelola BUMDes atau Koperasi Desa",
    icon: Store,
  },
  // {
  //   value: "umum",
  //   label: "Pengguna Umum",
  //   description: "Masyarakat umum",
  //   icon: User,
  // },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
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
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role && profile.role !== "umum") {
        navigate("/chat");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Pilih role terlebih dahulu");
      return;
    }

    if (!userId) {
      toast.error("Session tidak valid");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ role: selectedRole as any })
      .eq("id", userId);

    if (error) {
      toast.error("Gagal menyimpan role");
      setIsLoading(false);
      return;
    }

    toast.success("Role berhasil disimpan!");
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Selamat Datang di Patriot Desa!
          </CardTitle>
          <CardDescription className="text-center">
            Pilih role Anda untuk pengalaman yang lebih personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="grid gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div key={role.value} className="relative">
                      <RadioGroupItem
                        value={role.value}
                        id={role.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={role.value}
                        className="flex items-start space-x-3 rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent/5 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{role.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? "Menyimpan..." : "Lanjutkan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

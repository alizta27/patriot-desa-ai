import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Store, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";

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
  {
    value: "umum",
    label: "Pengguna Umum",
    description: "Masyarakat umum",
    icon: User,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");

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
        .select("role, phone_number")
        .eq("id", session.user.id)
        .single();
      // Pre-fill state if any
      if (profile?.role) setSelectedRole(profile.role as string);
      if (profile?.phone_number) setPhoneNumber(profile.phone_number);
    };
    checkAuth();
  }, [navigate]);

  const validatePhone = (value: string) => {
    // Simple validation: starts with + and 7-15 digits, or local digits 8-15
    const intl = /^\+[0-9]{7,15}$/;
    const local = /^[0-9]{8,15}$/;
    return intl.test(value) || local.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Session tidak valid");
      return;
    }

    if (step === 1) {
      if (!selectedRole) {
        toast.error("Silakan pilih role terlebih dahulu");
        return;
      }
      setStep(2);
      return;
    }

    // Step 2 submit
    if (!validatePhone(phoneNumber)) {
      toast.error("Nomor HP tidak valid. Gunakan format +628xxxx atau 08xxxx");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        role: (selectedRole as any) || null,
        phone_number: phoneNumber,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Gagal menyimpan data onboarding");
      setIsLoading(false);
      return;
    }

    toast.success("Onboarding selesai!");
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1
              ? "Selamat Datang di Patriot Desa!"
              : "Lengkapi Nomor HP"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? "Pilih role Anda untuk pengalaman yang lebih personal"
              : "Masukkan nomor HP Anda agar kami bisa menghubungi bila diperlukan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <RadioGroup
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {"Lanjutkan"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor HP</Label>
                  <Input
                    id="phone"
                    placeholder="Contoh: +628123456789 atau 08123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    inputMode="tel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Kembali
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Menyimpan..." : "Selesai"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

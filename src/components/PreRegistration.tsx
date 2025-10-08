import { useState } from "react";
import { AlertCircle, CheckCircle, Gift, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner-api";

import { supabase } from "@/integrations/supabase/client";

const PreRegistration = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email tidak boleh kosong", {
        position: "top-center",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Format email tidak valid", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("pre_registrations")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast.error("Email sudah terdaftar sebelumnya", {
            position: "top-center",
          });
        } else {
          toast.error("Terjadi kesalahan. Silakan coba lagi.", {
            position: "top-center",
          });
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("Terima kasih! Kamu sudah terdaftar untuk promo awal.", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error submitting pre-registration:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Terima Kasih!
              </h3>
              <p className="text-green-700 text-lg mb-6">
                Kamu sudah terdaftar untuk promo awal Patriot Desa.
              </p>
              <p className="text-green-600">
                Kami akan mengirimkan informasi promo khusus ke email{" "}
                <strong>{email}</strong> saat Patriot Desa resmi diluncurkan.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl text-foreground">
              Daftar Sekarang untuk Dapatkan Promo!
            </CardTitle>
            <CardDescription className="text-lg text-foreground/80">
              Dapatkan{" "}
              <strong>diskon khusus untuk 100 pendaftar pertama</strong> saat
              Patriot Desa resmi diluncurkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Dengan mendaftar, Anda setuju untuk menerima informasi promo dan
                update dari Patriot Desa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PreRegistration;

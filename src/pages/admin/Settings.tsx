import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminSettings, useUpdateSettings } from "@/hooks/queries/admin";

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
import { toast } from "@/components/ui/sonner-api";

interface Settings {
  site_name: string;
  maintenance_mode: boolean;
  max_free_queries: number;
  subscription_price: number;
  email_notifications: boolean;
  auto_backup: boolean;
}

export default function Settings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [formData, setFormData] = useState<Settings>({
    site_name: "Patriot Desa",
    maintenance_mode: false,
    max_free_queries: 5,
    subscription_price: 99000,
    email_notifications: true,
    auto_backup: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengaturan sistem dan konfigurasi aplikasi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription>Konfigurasi dasar aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nama Situs</Label>
              <Input
                id="siteName"
                value={formData.site_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, site_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQueries">Maksimal Query Gratis per Hari</Label>
              <Input
                id="maxQueries"
                type="number"
                value={formData.max_free_queries || 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_free_queries: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subPrice">Harga Berlangganan (Rp)</Label>
              <Input
                id="subPrice"
                type="number"
                value={formData.subscription_price || 99000}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subscription_price: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Do not do for now! We will decide on when to do this later after publishing the App */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Fitur</CardTitle>
            <CardDescription>
              Aktifkan atau nonaktifkan fitur tertentu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">Mode Maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Nonaktifkan akses pengguna sementara
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={formData.maintenance_mode || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, maintenance_mode: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotif">Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Kirim notifikasi via email
                </p>
              </div>
              <Switch
                id="emailNotif"
                checked={formData.email_notifications || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, email_notifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">Backup Otomatis</Label>
                <p className="text-sm text-muted-foreground">
                  Backup database secara otomatis
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={formData.auto_backup || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_backup: checked })
                }
              />
            </div>
          </CardContent>
        </Card> */}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}

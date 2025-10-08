import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Eye,Settings, Shield } from "lucide-react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CookiesPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Kebijakan Cookie
            </h1>
            <p className="text-lg text-foreground/80">
              Informasi tentang penggunaan cookie di website Patriot Desa
            </p>
          </div>

          <div className="space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Apa itu Cookie?
              </h2>
              <p className="leading-relaxed">
                Cookie adalah file teks kecil yang disimpan di perangkat Anda
                ketika Anda mengunjungi website kami. Cookie membantu kami
                memberikan pengalaman yang lebih baik dan memahami bagaimana
                Anda menggunakan website Patriot Desa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Mengapa Kami Menggunakan Cookie?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      Analisis Penggunaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80">
                      Kami menggunakan cookie untuk menganalisis bagaimana
                      pengguna berinteraksi dengan website kami, membantu kami
                      meningkatkan fungsionalitas dan konten.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <Settings className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      Sesi Login
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80">
                      Cookie memungkinkan kami untuk menjaga sesi login Anda
                      tetap aktif, sehingga Anda tidak perlu login berulang kali
                      saat menggunakan layanan kami.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Data yang Kami Kumpulkan
              </h2>
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="leading-relaxed mb-4">
                  Melalui penggunaan cookie, kami dapat mengumpulkan informasi
                  berikut:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>
                    <strong>Data Analitik:</strong> Halaman yang dikunjungi,
                    waktu yang dihabiskan, dan pola navigasi
                  </li>
                  <li>
                    <strong>Informasi Sesi:</strong> Status login, preferensi
                    pengguna, dan pengaturan akun
                  </li>
                  <li>
                    <strong>Data Teknis:</strong> Jenis browser, sistem operasi,
                    dan alamat IP (anonim)
                  </li>
                  <li>
                    <strong>Preferensi:</strong> Pengaturan bahasa, tema, dan
                    konfigurasi lainnya
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Jenis Cookie yang Kami Gunakan
              </h2>
              <div className="space-y-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Cookie Esensial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">
                      Cookie yang diperlukan untuk fungsi dasar website, seperti
                      autentikasi pengguna dan keamanan. Cookie ini tidak dapat
                      dinonaktifkan.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Cookie Fungsional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">
                      Cookie yang meningkatkan fungsionalitas website, seperti
                      mengingat preferensi pengguna dan pengaturan
                      personalisasi.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Cookie Analitik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">
                      Cookie yang membantu kami memahami bagaimana pengguna
                      berinteraksi dengan website melalui data statistik dan
                      analisis penggunaan.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Mengelola Cookie Anda
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Kontrol Penuh di Tangan Anda
                    </h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">
                      Anda dapat mengelola atau menonaktifkan cookie melalui
                      pengaturan browser Anda. Namun, perlu diingat bahwa
                      menonaktifkan cookie tertentu dapat mempengaruhi
                      fungsionalitas website.
                    </p>
                    <div className="space-y-2 text-sm text-foreground/80">
                      <p>
                        <strong>Chrome:</strong> Pengaturan → Privasi dan
                        Keamanan → Cookie dan data situs lainnya
                      </p>
                      <p>
                        <strong>Firefox:</strong> Pengaturan → Privasi &
                        Keamanan → Cookie dan Data Situs
                      </p>
                      <p>
                        <strong>Safari:</strong> Preferensi → Privasi → Kelola
                        Data Website
                      </p>
                      <p>
                        <strong>Edge:</strong> Pengaturan → Cookie dan izin
                        situs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Persetujuan Penggunaan Cookie
              </h2>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Penggunaan Berkelanjutan
                    </h3>
                    <p className="text-foreground/80 leading-relaxed">
                      Dengan terus menggunakan website Patriot Desa, Anda
                      menyetujui penggunaan cookie sesuai dengan kebijakan ini.
                      Jika Anda tidak setuju dengan penggunaan cookie, silakan
                      hentikan penggunaan website kami atau sesuaikan pengaturan
                      browser Anda.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Privasi dan Keamanan
              </h2>
              <p className="leading-relaxed">
                Kami berkomitmen untuk melindungi privasi Anda. Data yang
                dikumpulkan melalui cookie digunakan semata-mata untuk
                meningkatkan pengalaman pengguna dan tidak akan dibagikan kepada
                pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh
                hukum.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Perubahan Kebijakan Cookie
              </h2>
              <p className="leading-relaxed">
                Kami dapat memperbarui kebijakan cookie ini dari waktu ke waktu
                untuk mencerminkan perubahan dalam praktik kami atau karena
                alasan hukum dan regulasi. Perubahan penting akan diberitahukan
                melalui pemberitahuan di website atau email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Kontak Kami
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan tentang kebijakan cookie ini atau
                ingin mengetahui lebih lanjut tentang penggunaan cookie di
                website Patriot Desa, silakan hubungi kami:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground/80">
                  Email:{" "}
                  <a
                    href="mailto:contact@patriotdesa.id"
                    className="text-primary hover:underline"
                  >
                    contact@patriotdesa.id
                  </a>
                  <br />
                  Website:{" "}
                  <a
                    href="https://www.patriotdesa.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    www.patriotdesa.id
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui:{" "}
              {new Date().toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;

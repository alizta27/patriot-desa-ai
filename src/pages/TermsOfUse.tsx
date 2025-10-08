import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Mail,
  Shield,
  Users,
} from "lucide-react";

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

const TermsOfUse = () => {
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Syarat Penggunaan
            </h1>
            <p className="text-lg text-foreground/80">
              Ketentuan penggunaan layanan Patriot Desa
            </p>
          </div>

          <div className="space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Penerimaan Syarat
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Persetujuan Otomatis
                    </h3>
                    <p className="leading-relaxed">
                      Dengan mengakses atau menggunakan website Patriot Desa
                      atau layanan AI kami, Anda secara otomatis menyetujui dan
                      terikat oleh syarat-syarat penggunaan ini. Jika Anda tidak
                      setuju dengan syarat-syarat ini, silakan hentikan
                      penggunaan layanan kami.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Penggunaan Layanan
              </h2>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Akses dan Tanggung Jawab
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed mb-4">
                    Anda dapat mengakses konsultasi AI gratis dan fitur premium
                    opsional dengan syarat:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li>
                      Menggunakan layanan secara bertanggung jawab dan sesuai
                      dengan batasan hukum yang berlaku
                    </li>
                    <li>
                      Tidak menyalahgunakan sistem atau melakukan aktivitas yang
                      merugikan pengguna lain
                    </li>
                    <li>
                      Memberikan informasi yang akurat dan terkini saat
                      menggunakan layanan
                    </li>
                    <li>
                      Menghormati hak kekayaan intelektual dan privasi pengguna
                      lain
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Kekayaan Intelektual
              </h2>
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Hak Milik Patriot Desa
                    </h3>
                    <p className="leading-relaxed">
                      Semua materi, desain, konten, logo, dan kekayaan
                      intelektual lainnya yang terdapat dalam website Patriot
                      Desa adalah milik Patriot Desa dan dilindungi oleh hukum
                      hak cipta. Anda tidak diperkenankan untuk menyalin,
                      mendistribusikan, atau menggunakan materi tersebut tanpa
                      izin tertulis dari Patriot Desa.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Tanggung Jawab Pengguna
              </h2>
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Kewajiban dan Larangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed mb-4">
                    Sebagai pengguna layanan Patriot Desa, Anda berkewajiban
                    untuk:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 mb-4">
                    <li>Tidak menyalahgunakan website atau layanan kami</li>
                    <li>
                      Tidak mengirimkan spam, konten berbahaya, atau informasi
                      palsu
                    </li>
                    <li>
                      Tidak melakukan aktivitas ilegal atau melanggar hukum
                    </li>
                    <li>Tidak mencoba meretas atau merusak sistem keamanan</li>
                    <li>
                      Tidak menggunakan layanan untuk tujuan komersial tanpa
                      izin
                    </li>
                  </ul>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">
                        Pelanggaran terhadap ketentuan ini dapat mengakibatkan
                        penghentian akses ke layanan kami.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Pembatasan Tanggung Jawab
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Disclaimer
                    </h3>
                    <p className="leading-relaxed mb-4">
                      Patriot Desa tidak bertanggung jawab atas kerugian tidak
                      langsung, insidental, atau konsekuensial yang timbul dari
                      penggunaan website atau layanan kami, termasuk namun tidak
                      terbatas pada:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                      <li>Kehilangan data atau informasi</li>
                      <li>Kerugian bisnis atau kehilangan keuntungan</li>
                      <li>Gangguan operasional atau downtime</li>
                      <li>
                        Kerugian akibat keputusan yang diambil berdasarkan
                        informasi dari layanan kami
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Modifikasi Syarat
              </h2>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Perubahan Ketentuan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">
                    Patriot Desa berhak untuk memodifikasi syarat penggunaan ini
                    kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan
                    berlaku efektif segera setelah dipublikasikan di website.
                    Pengguna disarankan untuk meninjau syarat penggunaan secara
                    berkala untuk memastikan pemahaman yang terkini.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Penyelesaian Sengketa
              </h2>
              <p className="leading-relaxed">
                Setiap sengketa yang timbul dari penggunaan layanan Patriot Desa
                akan diselesaikan melalui jalur hukum yang berlaku di Indonesia.
                Pengguna setuju untuk tunduk pada yurisdiksi pengadilan
                Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Informasi Kontak
              </h2>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Hubungi Kami
                    </h3>
                    <p className="leading-relaxed mb-4">
                      Jika Anda memiliki pertanyaan tentang syarat penggunaan
                      ini atau memerlukan dukungan terkait layanan Patriot Desa,
                      silakan hubungi kami:
                    </p>
                    <div className="space-y-2 text-foreground/80">
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:contact@patriotdesa.id"
                          className="text-primary hover:underline"
                        >
                          contact@patriotdesa.id
                        </a>
                      </p>
                      <p>
                        <strong>Website:</strong>{" "}
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
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Ketentuan Tambahan
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Ketersediaan Layanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">
                      Patriot Desa berusaha untuk menjaga ketersediaan layanan
                      24/7, namun tidak dapat menjamin bahwa layanan akan selalu
                      tersedia tanpa gangguan. Kami dapat melakukan pemeliharaan
                      rutin atau darurat yang dapat menyebabkan downtime
                      sementara.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Akun Pengguna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">
                      Anda bertanggung jawab untuk menjaga keamanan akun Anda
                      dan semua aktivitas yang terjadi di bawah akun tersebut.
                      Patriot Desa tidak bertanggung jawab atas kerugian yang
                      timbul dari penggunaan akun Anda oleh pihak lain.
                    </p>
                  </CardContent>
                </Card>
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

export default TermsOfUse;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, Sparkles, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { appLogo } from "@/assets/images";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <img
            src={appLogo}
            alt="Patriot Desa logo"
            className="h-20 w-auto mb-6 md:h-28"
          />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[hsl(var(--secondary))]">
            Patriot Desa
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Konsultasi AI untuk Desa
          </p>
          <p className="text-lg text-foreground/80 mb-12 max-w-2xl mx-auto">
            Asisten AI untuk mempercepat pelayanan, laporan, dan pengelolaan
            desa Anda. Dapatkan jawaban instan, template dokumen, dan analisis
            berbasis data, cukup lewat chat.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-primary hover:bg-[hsl(var(--primary-dark))] text-primary-foreground"
              >
                Mulai Sekarang
              </Button>
            </Link>
            {/* <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary-light/50">
                Masuk
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tentang Patriot Desa
        </h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-foreground/80 mb-6">
            Banyak desa menghadapi tantangan dalam pengelolaan administrasi,
            pengembangan potensi lokal, dan pemberdayaan masyarakat. Aparatur
            desa sering kesulitan mengakses informasi yang akurat dan cepat
            untuk pengambilan keputusan.
          </p>
          <p className="text-lg text-foreground/80 mb-6">
            Patriot Desa hadir sebagai platform AI yang membantu desa menjawab
            pertanyaan terkait administrasi, pengembangan usaha desa,
            perencanaan proyek, dan pengelolaan BUMDes secara cepat dan akurat.
            Dengan dukungan teknologi cerdas, desa bisa membuat keputusan lebih
            tepat dan mengoptimalkan potensi lokal.
          </p>
          <p className="text-lg text-foreground/80">
            Bayangkan seorang kepala desa ingin merencanakan program
            pemberdayaan BUMDes, tapi tidak punya waktu mencari regulasi atau
            data potensi desa. Dengan Patriot Desa, semua informasi yang
            dibutuhkan bisa diakses dengan cepat, sehingga program bisa segera
            dijalankan.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow border-[hsl(var(--primary))]/20">
            <div className="w-12 h-12 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground">
              Dapatkan jawaban instan untuk pertanyaan seputar pengelolaan desa
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-[hsl(var(--primary))]/20">
            <div className="w-12 h-12 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Freemium Model</h3>
            <p className="text-muted-foreground">
              5 pertanyaan gratis per hari, upgrade untuk akses unlimited
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-[hsl(var(--primary))]/20">
            <div className="w-12 h-12 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Subscription</h3>
            <p className="text-muted-foreground">
              Akses tanpa batas dan fitur premium untuk subscriber
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-[hsl(var(--primary))]/20">
            <div className="w-12 h-12 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center mb-4">
              <HeadphonesIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Human Consultant</h3>
            <p className="text-muted-foreground">
              Konsultasi dengan ahli jika AI belum bisa menjawab
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Harga</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-8 border-[hsl(var(--primary))]/20 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Gratis</h3>
              <p className="text-4xl font-bold mb-6 text-primary">Rp 0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> 5 pertanyaan per hari
                </li>
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Akses AI Assistant
                </li>
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Dukungan komunitas
                </li>
              </ul>
            </div>
            <Link to="/login">
              <Button className="w-full" variant="outline">
                Mulai Gratis Sekarang
              </Button>
            </Link>
          </Card>

          <Card className="p-8 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-4xl font-bold mb-6 text-primary">
                Rp 99.000<span className="text-base font-normal">/bulan</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Pertanyaan unlimited
                </li>
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Prioritas respons AI
                </li>
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Konsultasi dengan ahli
                </li>
                <li className="flex items-center text-foreground/80">
                  <span className="mr-2">✓</span> Fitur premium eksklusif
                </li>
              </ul>
            </div>
            <Link to="/subscription">
              <Button className="w-full">Upgrade ke Premium</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Hubungi Kami</h2>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Email</h3>
                <p className="text-foreground/80">info@patriotdesa.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Alamat</h3>
                <p className="text-foreground/80">
                  Jl. Desa Mandiri No. 123
                  <br />
                  Jakarta, Indonesia 12345
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">
                  Jam Operasional
                </h3>
                <p className="text-foreground/80">
                  Senin - Jumat: 08:00 - 17:00 WIB
                  <br />
                  Sabtu: 09:00 - 14:00 WIB
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[hsl(var(--secondary))] rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Mengembangkan Desa Anda?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan desa yang sudah menggunakan Patriot Desa
            untuk kemajuan desa mereka.
          </p>
          <Link to="/login">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

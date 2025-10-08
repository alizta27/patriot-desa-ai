import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  HeadphonesIcon,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { appLogo } from "@/assets/images";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PreRegistration from "@/components/PreRegistration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <div className="mb-8">
              <img
                src={appLogo}
                alt="Patriot Desa logo"
                className="h-24 w-auto mb-8 md:h-32"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
              Patriot Desa
            </h1>
            <p className="text-2xl md:text-3xl text-primary font-semibold mb-6">
              Konsultasi AI untuk Desa
            </p>
            <p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Platform konsultasi digital berbasis AI pertama di Indonesia yang
              didedikasikan untuk memberdayakan desa-desa di seluruh nusantara
              dengan teknologi modern dan akses informasi yang mudah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Registration Section */}
      <PreRegistration />

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">100+</div>
              <div className="text-lg text-foreground/80">Desa Terdaftar</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-lg text-foreground/80">
                Pertanyaan Terjawab
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-lg text-foreground/80">Dukungan AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Solusi lengkap untuk mengatasi tantangan digitalisasi desa dengan
              teknologi AI terdepan
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                AI Assistant
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Dapatkan jawaban instan untuk pertanyaan seputar pengelolaan
                desa, regulasi, dan best practices
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Freemium Model
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                5 pertanyaan gratis per hari, upgrade untuk akses unlimited dan
                fitur premium
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Premium Subscription
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Akses tanpa batas, prioritas respons, dan fitur eksklusif untuk
                subscriber
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <HeadphonesIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Human Consultant
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Konsultasi langsung dengan ahli jika AI belum bisa menjawab
                pertanyaan kompleks
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Mengapa Patriot Desa?
          </h2>
          <div className="space-y-8 text-lg text-foreground/80 leading-relaxed">
            <p>
              Banyak desa menghadapi tantangan dalam pengelolaan administrasi,
              pengembangan potensi lokal, dan pemberdayaan masyarakat. Aparatur
              desa sering kesulitan mengakses informasi yang akurat dan cepat
              untuk pengambilan keputusan.
            </p>
            <p>
              Patriot Desa hadir sebagai platform AI yang membantu desa menjawab
              pertanyaan terkait administrasi, pengembangan usaha desa,
              perencanaan proyek, dan pengelolaan BUMDes secara cepat dan
              akurat. Dengan dukungan teknologi cerdas, desa bisa membuat
              keputusan lebih tepat dan mengoptimalkan potensi lokal.
            </p>
            <p>
              Bayangkan seorang kepala desa ingin merencanakan program
              pemberdayaan BUMDes, tapi tidak punya waktu mencari regulasi atau
              data potensi desa. Dengan Patriot Desa, semua informasi yang
              dibutuhkan bisa diakses dengan cepat, sehingga program bisa segera
              dijalankan.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Pilih Paket yang Sesuai
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Mulai gratis dan upgrade sesuai kebutuhan desa Anda
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-10 border-primary/20 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Gratis
                </h3>
                <div className="text-5xl font-bold mb-2 text-primary">Rp 0</div>
                <p className="text-muted-foreground">Selamanya</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  5 pertanyaan per hari
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Akses AI Assistant
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Dukungan komunitas
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Template dokumen dasar
                </li>
              </ul>
              <Link to="/login">
                <Button className="w-full py-4 text-lg font-semibold rounded-xl">
                  Mulai Gratis Sekarang
                </Button>
              </Link>
            </Card>

            <Card className="p-10 border-primary bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Paling Populer
                </div>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Premium
                </h3>
                <div className="text-5xl font-bold mb-2 text-primary">
                  Rp 99.000<span className="text-xl font-normal">/bulan</span>
                </div>
                <p className="text-muted-foreground">Akses penuh</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Pertanyaan unlimited
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Prioritas respons AI
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Konsultasi dengan ahli
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Fitur premium eksklusif
                </li>
                <li className="flex items-center text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Template dokumen lengkap
                </li>
              </ul>
              <Link to="/subscription">
                <Button className="w-full py-4 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90">
                  Upgrade ke Premium
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Hubungi Kami
          </h2>
          <p className="text-xl text-foreground/80 mb-12">
            Ada pertanyaan? Tim kami siap membantu Anda
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Email</h3>
              <p className="text-foreground/80">info@patriotdesa.com</p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Alamat</h3>
              <p className="text-foreground/80">
                Jl. Desa Mandiri No. 123
                <br />
                Jakarta, Indonesia 12345
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">
                Jam Operasional
              </h3>
              <p className="text-foreground/80">
                Senin - Jumat: 08:00 - 17:00 WIB
                <br />
                Sabtu: 09:00 - 14:00 WIB
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Siap Mengembangkan Desa Anda?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan desa yang sudah menggunakan Patriot
              Desa untuk kemajuan desa mereka. Mulai perjalanan digitalisasi
              desa Anda hari ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Daftar Gratis Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

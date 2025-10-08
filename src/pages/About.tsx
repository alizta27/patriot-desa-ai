import { Link } from "react-router-dom";
import { ArrowLeft, Globe,Shield, Target, Users, Zap } from "lucide-react";

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

const About = () => {
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

        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Tentang Patriot Desa
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Platform konsultasi digital berbasis AI pertama di Indonesia yang
              didedikasikan untuk memberdayakan desa-desa di seluruh nusantara
              dengan teknologi modern dan akses informasi yang mudah.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl text-foreground">
                  Misi Kami
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-center text-foreground/80 leading-relaxed">
                  Patriot Desa berkomitmen untuk memecahkan kesenjangan digital
                  di tingkat desa dengan menyediakan akses mudah terhadap
                  informasi terkini, regulasi yang berubah, dan tools digital
                  modern. Kami percaya bahwa setiap desa berhak mendapatkan
                  dukungan teknologi yang dapat meningkatkan kualitas pelayanan
                  publik dan mengembangkan potensi ekonomi lokal.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Problems Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Masalah yang Kami Pecahkan
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Kesulitan Memahami Regulasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Peraturan dan kebijakan yang terus berubah seringkali sulit
                    dipahami dan diakses oleh aparatur desa, menyebabkan
                    ketidaksesuaian dalam implementasi kebijakan.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Keterbatasan Akses Data & Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Desa-desa seringkali tidak memiliki akses terhadap data
                    terkini dan tools digital modern yang dapat meningkatkan
                    efisiensi kerja dan pengambilan keputusan.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Referensi Bisnis Lemah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    BUMDes dan Koperasi Desa seringkali kesulitan mendapatkan
                    referensi bisnis yang solid dan template operasional yang
                    dapat diandalkan untuk pengembangan usaha.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Informasi Tersebar & Tidak Sistematis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Informasi penting tersebar di berbagai sumber tanpa sistem
                    yang terorganisir, menyulitkan aparatur desa untuk menemukan
                    solusi yang tepat dan cepat.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Solutions Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Solusi yang Kami Tawarkan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    Konsultasi AI Gratis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Akses mudah terhadap konsultasi AI untuk pertanyaan dasar
                    tentang regulasi, prosedur, dan best practices dalam
                    pengelolaan desa.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    Produk Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    SOP lengkap, template bisnis, analisis usaha, dan pelatihan
                    khusus untuk mengembangkan kapasitas dan kompetensi aparatur
                    desa.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    Platform Desa Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Pusat data, regulasi, dan diskusi komunitas yang
                    memungkinkan kolaborasi antar-desa dan berbagi pengalaman
                    terbaik.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Competitive Advantages Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Keunggulan Kompetitif Kami
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Pertama di Indonesia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Patriot Desa adalah platform konsultasi desa berbasis AI
                    pertama di Indonesia, memberikan keunggulan pionir dalam
                    mengatasi tantangan digitalisasi desa.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Akses Gratis & Mudah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Titik masuk yang gratis dan mudah diakses, memungkinkan
                    semua desa untuk mulai memanfaatkan teknologi AI tanpa
                    hambatan finansial.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Komunitas Praktisi Kuat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Didukung oleh komunitas praktisi yang berpengalaman dalam
                    pengelolaan desa, memastikan solusi yang diberikan relevan
                    dan dapat diterapkan.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Sistem Skalabel & Duplikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">
                    Sistem yang dapat diperluas dan diduplikasi, terinspirasi
                    dari network marketing, memungkinkan pertumbuhan yang
                    berkelanjutan dan dampak yang lebih luas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Bergabunglah dengan Patriot Desa
                </h3>
                <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
                  Mari bersama-sama membangun desa yang lebih maju, efisien, dan
                  berdaya saing dengan memanfaatkan teknologi AI dan
                  digitalisasi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/chat">Mulai Konsultasi Gratis</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-lg px-8"
                  >
                    <a
                      href="https://www.patriotdesa.id"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kunjungi Website
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;

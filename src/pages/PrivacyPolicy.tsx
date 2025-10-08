import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Privacy Policy
          </h1>

          <div className="space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Pendahuluan
              </h2>
              <p className="leading-relaxed">
                Selamat datang di kebijakan privasi Patriot Desa. Kami
                berkomitmen untuk melindungi privasi dan keamanan data pribadi
                pengguna kami. Kebijakan ini menjelaskan bagaimana kami
                mengumpulkan, menggunakan, dan melindungi informasi Anda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Informasi yang Kami Kumpulkan
              </h2>
              <p className="leading-relaxed">
                Kami mengumpulkan berbagai jenis informasi untuk memberikan dan
                meningkatkan layanan kami kepada Anda, termasuk namun tidak
                terbatas pada informasi identitas pribadi, data penggunaan
                aplikasi, dan preferensi pengguna. Informasi ini dikumpulkan
                dengan persetujuan Anda dan sesuai dengan peraturan perlindungan
                data yang berlaku.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Cara Kami Menggunakan Informasi
              </h2>
              <p className="leading-relaxed">
                Informasi yang kami kumpulkan digunakan untuk menyediakan,
                memelihara, dan meningkatkan layanan kami. Kami juga menggunakan
                informasi ini untuk berkomunikasi dengan Anda, memberikan
                dukungan pelanggan, dan mengirimkan pembaruan atau informasi
                penting terkait layanan kami. Kami tidak akan menjual atau
                menyewakan data pribadi Anda kepada pihak ketiga tanpa
                persetujuan Anda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Keamanan Data
              </h2>
              <p className="leading-relaxed">
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi
                yang sesuai untuk melindungi data pribadi Anda dari akses,
                penggunaan, atau pengungkapan yang tidak sah. Namun, perlu
                diingat bahwa tidak ada metode transmisi data melalui internet
                atau metode penyimpanan elektronik yang 100% aman.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Hak Pengguna
              </h2>
              <p className="leading-relaxed">
                Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus
                data pribadi Anda yang kami simpan. Anda juga dapat menolak atau
                membatasi pemrosesan data Anda dalam kondisi tertentu. Untuk
                melaksanakan hak-hak ini, silakan hubungi kami melalui informasi
                kontak yang tersedia di bawah.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Perubahan Kebijakan
              </h2>
              <p className="leading-relaxed">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu
                untuk mencerminkan perubahan dalam praktik kami atau karena
                alasan operasional, hukum, atau peraturan lainnya. Kami akan
                memberi tahu Anda tentang perubahan penting melalui email atau
                pemberitahuan di situs web kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Kontak Kami
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan atau kekhawatiran tentang
                kebijakan privasi ini, silakan hubungi kami di:
              </p>
              <p className="mt-4 leading-relaxed">
                Email: info@patriotdesa.com
                <br />
                Alamat: [Alamat Kantor Dummy]
                <br />
                Telepon: [Nomor Telepon Dummy]
              </p>
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

export default PrivacyPolicy;

import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Youtube } from "lucide-react";

import { appLogo } from "@/assets/images";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center md:justify-start mb-8">
          <img
            src={appLogo}
            alt="Patriot Desa logo"
            className="h-8 w-auto md:h-10"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Tentang
            </h3>
            <p className="text-muted-foreground text-sm">
              Patriot Desa adalah asisten cerdas yang membantu aparatur desa,
              pendamping, BUMDes, dan masyarakat umum dalam mengelola dan
              mengembangkan desa menjadi lebih maju.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Tautan Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Kebijakan Cookie
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Syarat Penggunaan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Kontak
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Email: info@patriotdesa.com
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Patriot Desa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

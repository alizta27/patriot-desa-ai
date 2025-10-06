import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { appLogo } from "@/assets/images";

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={appLogo}
            alt="Patriot Desa logo"
            className="h-8 w-auto md:h-9"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Patriot Desa
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Contact Us
          </button>
          <Link to="/admin/login">
            <Button variant="ghost" className="text-sm font-medium">
              Login Admin
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

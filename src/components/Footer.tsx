import { MapPin, Clock, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇧🇷</span>
              <h3 className="font-display font-bold text-background text-lg">
                Sabor de Casa
              </h3>
            </div>
            <p className="text-sm text-background/60">
              Authentic Brazilian homemade food delivered fresh to your door in Dubai.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-background">Info</h4>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              Dubai, United Arab Emirates
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              Mon-Sat: 10AM - 9PM
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              +971 50 000 0000
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-background">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="text-sm hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">TikTok</a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © {new Date().getFullYear()} Sabor de Casa. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

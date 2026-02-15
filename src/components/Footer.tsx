import { MapPin, Clock, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇧🇷</span>
              <h3 className="font-display font-bold text-background text-lg">{t("brand")}</h3>
            </div>
            <p className="text-sm text-background/60">{t("hero_subtitle")}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-background">{t("info")}</h4>
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-primary" />{t("dubai")}</div>
            <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" />{t("hours")}</div>
            <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-primary" />{t("phone")}</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-background">{t("follow_us")}</h4>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/sabordecasatemperodemae" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">TikTok</a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © {new Date().getFullYear()} {t("brand")}. {t("rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

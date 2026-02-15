import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-food.jpg";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Brazilian homemade food"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
      </div>

      <div className="relative container py-16 sm:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-lg"
        >
          <span className="inline-block bg-primary/90 text-primary-foreground text-xs font-display font-semibold px-3 py-1.5 rounded-full mb-4">
            {t("free_delivery")}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-primary-foreground leading-tight mb-4">
            {t("hero_title")}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-6 font-sans">
            {t("hero_subtitle")}
          </p>
          <a
            href="#menu"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold text-lg px-8 py-4 rounded-full hover:brightness-110 transition-all shadow-lg shadow-primary/30"
          >
            {t("order_now")}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

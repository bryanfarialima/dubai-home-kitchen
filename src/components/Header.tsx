import { ShoppingCart, MapPin, User, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <span className="text-2xl">🇧🇷</span>
          <h1 className="text-xl font-display font-bold text-foreground">
            Sabor de <span className="text-primary">Casa</span>
          </h1>
        </button>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Dubai</span>
          </div>

          {user ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button onClick={() => navigate("/admin")} className="p-2 text-primary hover:bg-muted rounded-lg transition-colors">
                  <Shield className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => navigate("/orders")} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <User className="w-4 h-4" />
              </button>
              <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-accent font-display">{t("logout")}</button>
            </div>
          ) : (
            <button onClick={() => navigate("/auth")} className="text-sm font-display font-semibold text-primary hover:underline">
              {t("login")}
            </button>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full font-display font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{t("cart")}</span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

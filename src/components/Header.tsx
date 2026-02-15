import { ShoppingCart, MapPin, User, Shield, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t("logged_out"));
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(t("logout_failed"));
    } finally {
      navigate("/");
    }
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
              
              {/* User Dropdown Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {t("my_profile")}
                      </button>
                      <button
                        onClick={() => {
                          navigate("/orders");
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t("my_orders")}
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-muted transition-colors"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
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

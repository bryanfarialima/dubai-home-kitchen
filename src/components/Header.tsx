import { ShoppingCart, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

const Header = () => {
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇧🇷</span>
          <h1 className="text-xl font-display font-bold text-foreground">
            Sabor de <span className="text-primary">Casa</span>
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Dubai, UAE</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full font-display font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
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
    </header>
  );
};

export default Header;

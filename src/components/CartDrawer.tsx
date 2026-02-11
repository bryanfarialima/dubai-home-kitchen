import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card">
        <SheetHeader>
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {t("your_cart")}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-5xl">🛒</span>
            <p className="text-muted-foreground font-display font-semibold">{t("empty_cart")}</p>
            <p className="text-sm text-muted-foreground">{t("add_items")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-muted/50 rounded-lg p-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-sm text-foreground truncate">{item.name}</h4>
                    <p className="text-primary font-display font-bold text-sm">AED {item.price}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-display font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-muted-foreground hover:text-accent transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-sans">{t("subtotal")}</span>
                <span className="font-display font-bold text-lg text-foreground">AED {totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={goToCheckout}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-display font-bold text-base hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {t("checkout")} — AED {totalPrice.toFixed(2)}
              </button>
              <button onClick={clearCart} className="w-full text-sm text-muted-foreground hover:text-accent font-display transition-colors">
                {t("clear_cart")}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

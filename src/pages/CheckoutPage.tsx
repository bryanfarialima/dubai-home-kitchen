import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, MapPin, MessageSquare } from "lucide-react";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";
import { useCoupons } from "@/hooks/useCoupons";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { data: zones } = useDeliveryZones();
  const { validateCoupon } = useCoupons();
  
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const selectedZone = zones?.find((z) => z.id === zoneId);
  const deliveryFee = selectedZone?.fee || 0;
  const finalTotal = totalPrice - discount + deliveryFee;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await validateCoupon(couponCode, totalPrice);
    if (result.valid) {
      setDiscount(result.discount);
    }
  };

  const handlePlaceOrder = async () => {
    // Validations
    if (!user) {
      toast.error(t("not_logged_in"));
      navigate("/auth");
      return;
    }
    
    if (!address.trim()) {
      toast.error(t("fill_delivery_details"));
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Por favor, informe seu telefone");
      return;
    }
    
    if (!zoneId) {
      toast.error("Por favor, selecione a zona de entrega");
      return;
    }

    if (items.length === 0) {
      toast.error(t("empty_cart"));
      return;
    }

    setLoading(true);
    try {
      // Create order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: totalPrice,
          delivery_fee: deliveryFee,
          discount,
          total: finalTotal,
          delivery_address: `${address} | Tel: ${phone}`,
          delivery_zone_id: zoneId,
          payment_method: "cash",
          notes: notes.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart and navigate
      clearCart();
      toast.success(t("order_placed"));
      navigate("/orders");
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err.message || t("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <span className="text-5xl">🛒</span>
        <p className="text-muted-foreground font-display">{t("empty_cart")}</p>
        <button onClick={() => navigate("/")} className="text-primary font-display font-semibold">{t("back_to_menu")}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">{t("checkout")}</h1>
        </div>
      </header>

      <div className="container py-6 max-w-lg space-y-4">
        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground">{t("your_cart")}</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">{item.quantity}x {item.name}</span>
              <span className="text-muted-foreground">AED {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Delivery Details */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> {t("delivery_address")}
          </h3>
          
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefone (ex: +971 50 123 4567)"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Endereço completo (rua, número, apartamento, referências)"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("select_zone")}</option>
            {zones?.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} - AED {z.fee} taxa de entrega
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> {t("notes")}
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações especiais (sem cebola, ponto da carne, etc.)"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Coupon */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground">{t("coupon_code")}</h3>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            />
            <button 
              onClick={applyCoupon} 
              disabled={!couponCode.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-display font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {t("apply")}
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="text-foreground">AED {totalPrice.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">{t("discount")}</span>
              <span className="text-success">-AED {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("delivery_fee")}</span>
            <span className="text-foreground">AED {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg border-t border-border pt-2">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-primary">AED {finalTotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            💵 Pagamento em dinheiro na entrega
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address || !phone || !zoneId}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-display font-bold text-base hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {loading ? "Processando..." : `${t("place_order")} — AED ${finalTotal.toFixed(2)}`}
        </button>
        
        {(!address || !phone || !zoneId) && (
          <p className="text-xs text-center text-muted-foreground">
            Preencha todos os campos obrigatórios para continuar
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

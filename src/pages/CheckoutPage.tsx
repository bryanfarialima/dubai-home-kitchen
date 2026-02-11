import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, CreditCard, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: zones } = useQuery({
    queryKey: ["delivery_zones"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_zones").select("*").order("name");
      return data || [];
    },
  });

  const selectedZone = zones?.find((z) => z.id === zoneId);
  const deliveryFee = selectedZone?.fee || 0;
  const finalTotal = totalPrice - discount + deliveryFee;

  const applyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!data) {
      toast.error(t("error_occurred"));
      return;
    }
    if (data.min_order && totalPrice < data.min_order) {
      toast.error(`${t("min_order_aed")} ${data.min_order}`);
      return;
    }
    const disc = data.discount_type === "percentage"
      ? (totalPrice * data.discount_value) / 100
      : data.discount_value;
    setDiscount(disc);
    toast.success(`${t("coupon_applied")}! -AED ${disc.toFixed(2)}`);
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!address || !zoneId) { toast.error(t("fill_delivery_details")); return; }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        subtotal: totalPrice,
        delivery_fee: deliveryFee,
        discount,
        total: finalTotal,
        delivery_address: address,
        delivery_zone_id: zoneId,
        delivery_time: deliveryTime,
        payment_method: paymentMethod,
        notes,
      }).select().single();

      if (error) throw error;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast.success(t("order_placed"));
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message);
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

      <div className="container py-6 max-w-lg space-y-6">
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
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> {t("delivery_address")}
          </h3>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("delivery_address")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("select_zone")}</option>
            {zones?.map((z) => (
              <option key={z.id} value={z.id}>{z.name} - AED {z.fee}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground">{t("payment_method")}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-display font-semibold transition-all ${paymentMethod === "card" ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                }`}
            >
              <CreditCard className="w-4 h-4" /> {t("card")}
            </button>
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-display font-semibold transition-all ${paymentMethod === "cash" ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"
                }`}
            >
              <Banknote className="w-4 h-4" /> {t("cash")}
            </button>
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground">{t("coupon_code")}</h3>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="WELCOME10"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={applyCoupon} className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-display font-semibold text-sm">
              {t("apply")}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notes")}
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Totals */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("subtotal")}</span><span className="text-foreground">AED {totalPrice.toFixed(2)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-success">{t("discount")}</span><span className="text-success">-AED {discount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("delivery_fee")}</span><span className="text-foreground">AED {deliveryFee.toFixed(2)}</span></div>
          <div className="flex justify-between font-display font-bold text-lg border-t border-border pt-2">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-primary">AED {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-display font-bold text-base hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {loading ? "..." : `${t("place_order")} — AED ${finalTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;

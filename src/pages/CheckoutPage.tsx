import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
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
  const { profile, loading: profileLoading } = useProfile(user?.id);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const profilePhone = profile?.phone?.trim() || "";
  const profileAddress = profile?.address?.trim() || "";
  const profileLocationType = profile?.location_type?.trim() || "";
  const hasRequiredProfile = Boolean(profilePhone) && Boolean(profileAddress);

  const deliveryFee = 0; // Free delivery
  const finalTotal = totalPrice - discount + deliveryFee;
  const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await validateCoupon(couponCode, totalPrice);
    if (result.valid) {
      setDiscount(result.discount);
    } else {
      setDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    // Validations
    if (!user) {
      toast.error(t("not_logged_in"));
      navigate("/auth");
      return;
    }

    if (!hasRequiredProfile) {
      toast.error(t("complete_profile_to_checkout"));
      navigate("/profile");
      return;
    }

    if (!profileAddress) {
      toast.error(t("fill_delivery_details"));
      return;
    }

    if (!profilePhone) {
      toast.error(t("phone_required"));
      return;
    }

    if (!profileLocationType) {
      toast.error(t("location_type_required"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("empty_cart"));
      return;
    }

    const hasInvalidItems = items.some((item) => !isUuid(item.id));
    if (hasInvalidItems) {
      toast.error(t("invalid_cart_items"));
      clearCart();
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
          delivery_address: `${profileLocationType} - ${profileAddress} | Tel: ${profilePhone}`,
          delivery_zone_id: null,
          payment_method: "cash",
          notes: notes.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Order creation error:", error);
        throw new Error(`Erro ao criar pedido: ${error.message}`);
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Order items error:", itemsError);
        throw new Error(`Erro ao adicionar itens: ${itemsError.message}`);
      }

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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!hasRequiredProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
          <h2 className="font-display text-lg font-bold text-foreground mb-2">{t("profile_required_checkout")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("complete_profile_to_checkout")}</p>
          <button
            onClick={() => navigate("/profile")}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
          >
            {t("go_to_profile")}
          </button>
        </div>
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
            value={profilePhone}
            readOnly
            placeholder={t("phone_placeholder")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed"
          />

          <select
            value={profileLocationType}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed"
          >
            <option value="">{t("select_location_type")}</option>
            <option value="house">🏡 {t("house")}</option>
            <option value="apartment">🏢 {t("apartment")}</option>
            <option value="condo">🏘️ {t("condo")}</option>
            <option value="villa">🏰 {t("villa")}</option>
            <option value="office">💼 {t("office")}</option>
            <option value="hotel">🏨 {t("hotel")}</option>
          </select>

          <textarea
            value={profileAddress}
            readOnly
            placeholder={t("address_placeholder")}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none cursor-not-allowed"
          />

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full px-4 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10"
          >
            {t("edit_profile")}
          </button>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> {t("notes")}
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notes_placeholder")}
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
            <span className="text-success font-semibold">
              FREE 🎉 <span className="text-xs">{t("limited_time")}</span>
            </span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg border-t border-border pt-2">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-primary">AED {finalTotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            💵 {t("cash_payment")}
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address || !phone || !locationType}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-display font-bold text-base hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {loading ? t("processing") : `${t("place_order")} — AED ${finalTotal.toFixed(2)}`}
        </button>

        {(!address || !phone || !locationType) && (
          <p className="text-xs text-center text-muted-foreground">
            {t("fill_required_fields")}
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

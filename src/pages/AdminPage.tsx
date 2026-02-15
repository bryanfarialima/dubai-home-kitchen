import { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Package, UtensilsCrossed, Tag, BarChart3, LogOut, Home, Bell } from "lucide-react";
import { useAdminOrders } from "@/hooks/useOrders";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCoupons } from "@/hooks/useCoupons";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const AdminReportsLazy = lazy(() => import("@/components/AdminReports"));

type Tab = "orders" | "menu" | "coupons" | "reports" | "notifications";

const statusOptions = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/20 text-primary",
  preparing: "bg-warning/20 text-warning",
  delivering: "bg-primary/20 text-primary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-accent/20 text-accent",
};

const AdminPage = () => {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

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

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: "orders" as Tab, label: t("orders"), icon: Package },
    { id: "menu" as Tab, label: t("menu_management"), icon: UtensilsCrossed },
    { id: "coupons" as Tab, label: t("coupons_mgmt"), icon: Tag },
    { id: "reports" as Tab, label: t("reports"), icon: BarChart3 },
    { id: "notifications" as Tab, label: t("notifications"), icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-display font-bold text-lg text-foreground">🛠️ {t("admin_panel")}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
              <Home className="w-4 h-4" /> Voltar ao Site
            </button>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-accent text-sm flex items-center gap-1">
              <LogOut className="w-4 h-4" /> {t("logout")}
            </button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="bg-card border-b border-border">
        <div className="container flex gap-1 overflow-x-auto py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        {tab === "orders" && <AdminOrders />}
        {tab === "menu" && <AdminMenu />}
        {tab === "coupons" && <AdminCoupons />}
        {tab === "reports" && (
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>}>
            <AdminReportsLazy />
          </Suspense>
        )}
        {tab === "notifications" && <AdminNotifications />}
      </div>
    </div>
  );
};

function AdminOrders() {
  const { t } = useTranslation();
  const { orders, loading, updateOrderStatus } = useAdminOrders();

  const handleStatusChange = async (orderId: string, status: string) => {
    const { error } = await updateOrderStatus(orderId, status);
    if (error) {
      toast.error(t("error_occurred"));
    } else {
      toast.success(t("updated_success"));
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">{t("loading")}</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="font-display font-bold text-xl text-foreground">{t("live_orders")} ({orders.length})</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-display font-bold text-foreground">#{order.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{order.delivery_address}</p>
            </div>
            <span className="font-display font-bold text-primary">AED {Number(order.total).toFixed(2)}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(order.id, s)}
                className={`text-xs px-2.5 py-1 rounded-full font-display font-semibold transition-all ${order.status === s ? statusColors[s] : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    const [{ data: mi }, { data: cats }] = await Promise.all([
      supabase.from("menu_items").select("*").order("name"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setItems(mi || []);
    setCategories(cats || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!name || !price) { toast.error(t("error_occurred")); return; }
    const payload = { name, description, price: parseFloat(price), category_id: categoryId || null, image_url: imageUrl || null };
    if (editId) {
      await supabase.from("menu_items").update(payload).eq("id", editId);
      toast.success(t("updated_success"));
    } else {
      await supabase.from("menu_items").insert(payload);
      toast.success(t("item_added"));
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => { setName(""); setDescription(""); setPrice(""); setCategoryId(""); setImageUrl(""); setEditId(null); };

  const startEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setDescription(item.description || "");
    setPrice(String(item.price));
    setCategoryId(item.category_id || "");
    setImageUrl(item.image_url || "");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    toast.success(t("deleted_success"));
    fetchData();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-display font-bold text-foreground">{editId ? t("edit_item") : t("add_item")}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("dish_name")} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("description")} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex gap-3">
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("price_aed")} type="number" className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">{t("category")}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={t("image_url")} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-display font-bold text-sm">{editId ? t("update") : t("add")}</button>
          {editId && <button onClick={resetForm} className="text-muted-foreground font-display text-sm">{t("cancel")}</button>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            {item.image_url && <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">AED {Number(item.price).toFixed(2)}</p>
            </div>
            <button onClick={() => toggleAvailability(item.id, item.is_available)} className={`text-xs px-2 py-1 rounded-full font-display font-semibold ${item.is_available ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
              {item.is_available ? t("active") : t("off")}
            </button>
            <button onClick={() => startEdit(item)} className="text-xs text-primary font-display">{t("edit")}</button>
            <button onClick={() => deleteItem(item.id)} className="text-xs text-accent font-display">{t("delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const saveCoupon = async () => {
    if (!code || !discountValue) {
      toast.error(t("error_occurred"));
      return;
    }
    
    const payload = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order: minOrder ? parseFloat(minOrder) : 0,
      expires_at: expiresAt || null,
    };

    if (editId) {
      await supabase.from("coupons").update(payload).eq("id", editId);
      toast.success(t("updated_success"));
    } else {
      await supabase.from("coupons").insert(payload);
      toast.success(t("coupon_created"));
    }
    
    resetForm();
    fetchCoupons();
  };

  const resetForm = () => {
    setCode("");
    setDiscountValue("");
    setMinOrder("");
    setExpiresAt("");
    setEditId(null);
  };

  const startEdit = (coupon: any) => {
    setEditId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(String(coupon.discount_value));
    setMinOrder(coupon.min_order ? String(coupon.min_order) : "");
    setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : "");
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: !active }).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success(t("deleted_success"));
    fetchCoupons();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-display font-bold text-foreground">{editId ? t("edit_coupon") : t("create_coupon")}</h3>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("coupon_code_label")} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex gap-3">
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm">
            <option value="percentage">{t("percentage")}</option>
            <option value="fixed">{t("fixed_aed")}</option>
          </select>
          <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={t("value")} type="number" step="0.01" className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder={t("min_order_aed")} type="number" step="0.01" className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t("expiry_date")}</label>
          <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
          <button onClick={saveCoupon} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-display font-bold text-sm">{editId ? t("update") : t("create")}</button>
          {editId && <button onClick={resetForm} className="text-muted-foreground font-display text-sm hover:text-foreground">{t("cancel")}</button>}
        </div>
      </div>
      <div className="space-y-2">
        {coupons.map((c) => {
          const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
          return (
            <div key={c.id} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-foreground">{c.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `AED ${c.discount_value}`} {t("off")}
                    {c.min_order > 0 ? ` (${t("min")} AED ${c.min_order})` : ""}
                  </p>
                  {c.expires_at && (
                    <p className={`text-xs mt-1 ${isExpired ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                      {isExpired ? "⚠️ " : "📅 "}{t("expires")}: {new Date(c.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => toggleCoupon(c.id, c.is_active)} 
                  className={`text-xs px-2.5 py-1 rounded-full font-display font-semibold ${c.is_active && !isExpired ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {c.is_active && !isExpired ? t("active") : t("inactive")}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(c)} className="text-xs text-primary font-display hover:underline">{t("edit")}</button>
                <button onClick={() => deleteCoupon(c.id)} className="text-xs text-accent font-display hover:underline">{t("delete")}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"promotion" | "menu">("promotion");
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();

  const sendBroadcastNotification = () => {
    if (!title || !message) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setSending(true);

    try {
      // In a real implementation, this would send to all users via push service
      // For now, we'll show it to the admin as a demo
      if ("Notification" in window && Notification.permission === "granted") {
        const emoji = type === "promotion" ? "🎉" : "🍽️";
        
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(`${emoji} ${title}`, {
              body: message,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              vibrate: [200, 100, 200],
              tag: `broadcast-${type}-${Date.now()}`,
              requireInteraction: true,
              data: { type, title, message },
            });
          });
        } else {
          new Notification(`${emoji} ${title}`, {
            body: message,
            icon: "/favicon.ico",
            tag: `broadcast-${type}`,
          });
        }
        
        toast.success(t("notification_sent"));
        setTitle("");
        setMessage("");
      } else {
        toast.error(t("notifications_not_enabled"));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(t("error_occurred"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">{t("send_notification")}</h2>
            <p className="text-sm text-muted-foreground">{t("broadcast_to_all_users")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-display font-semibold text-foreground mb-2 block">
              {t("notification_type")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("promotion")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-display font-semibold transition-all ${
                  type === "promotion"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                🎉 {t("promotion")}
              </button>
              <button
                onClick={() => setType("menu")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-display font-semibold transition-all ${
                  type === "menu"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                🍽️ {t("menu_update")}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-display font-semibold text-foreground mb-2 block">
              {t("title")}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "promotion" ? t("promo_title_example") : t("menu_title_example")}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/50</p>
          </div>

          <div>
            <label className="text-sm font-display font-semibold text-foreground mb-2 block">
              {t("message")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={type === "promotion" ? t("promo_message_example") : t("menu_message_example")}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground mt-1">{message.length}/150</p>
          </div>

          <button
            onClick={sendBroadcastNotification}
            disabled={sending || !title || !message}
            className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-full font-display font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {t("sending")}...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                {t("send_to_all")}
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ⚠️ {t("notification_disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Package, UtensilsCrossed, Tag, BarChart3, LogOut } from "lucide-react";
import { useAdminOrders } from "@/hooks/useOrders";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCoupons } from "@/hooks/useCoupons";
import { supabase } from "@/integrations/supabase/client";

type Tab = "orders" | "menu" | "coupons" | "reports";

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
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-display font-bold text-lg text-foreground">🛠️ {t("admin_panel")}</h1>
          <button onClick={() => { signOut(); navigate("/"); }} className="text-muted-foreground hover:text-accent text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" /> {t("logout")}
          </button>
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
        {tab === "reports" && <AdminReports />}
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
                className={`text-xs px-2.5 py-1 rounded-full font-display font-semibold transition-all ${
                  order.status === s ? statusColors[s] : "bg-muted text-muted-foreground hover:bg-muted/80"
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
  const { t } = useTranslation();

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const addCoupon = async () => {
    if (!code || !discountValue) return;
    await supabase.from("coupons").insert({
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order: minOrder ? parseFloat(minOrder) : 0,
    });
    toast.success(t("coupon_created"));
    setCode(""); setDiscountValue(""); setMinOrder("");
    fetchCoupons();
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: !active }).eq("id", id);
    fetchCoupons();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-display font-bold text-foreground">{t("create_coupon")}</h3>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("coupon_code_label")} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex gap-3">
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm">
            <option value="percentage">{t("percentage")}</option>
            <option value="fixed">{t("fixed_aed")}</option>
          </select>
          <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={t("value")} type="number" className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder={t("min_order_aed")} type="number" className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <button onClick={addCoupon} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-display font-bold text-sm">{t("create")}</button>
      </div>
      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm text-foreground">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.discount_type === "percentage" ? `${c.discount_value}%` : `AED ${c.discount_value}`} {t("off")}{c.min_order > 0 ? ` ({t("min")} AED ${c.min_order})` : ""}</p>
            </div>
            <button onClick={() => toggleCoupon(c.id, c.is_active)} className={`text-xs px-2.5 py-1 rounded-full font-display font-semibold ${c.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
              {c.is_active ? t("active") : t("inactive")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, todayOrders: 0, todayRevenue: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: allOrders } = await supabase.from("orders").select("total, created_at");
      if (!allOrders) return;

      const today = new Date().toISOString().split("T")[0];
      const todayOrders = allOrders.filter((o) => o.created_at.startsWith(today));

      setStats({
        totalOrders: allOrders.length,
        totalRevenue: allOrders.reduce((s, o) => s + Number(o.total), 0),
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + Number(o.total), 0),
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: t("todays_orders"), value: stats.todayOrders, icon: "📦" },
    { label: t("todays_revenue"), value: `AED ${stats.todayRevenue.toFixed(2)}`, icon: "💰" },
    { label: t("total_orders"), value: stats.totalOrders, icon: "📊" },
    { label: t("total_revenue"), value: `AED ${stats.totalRevenue.toFixed(2)}`, icon: "🏦" },
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="font-display font-bold text-xl text-foreground mb-4">{t("reports")}</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <span className="text-2xl mb-2 block">{c.icon}</span>
            <p className="font-display font-bold text-xl text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;

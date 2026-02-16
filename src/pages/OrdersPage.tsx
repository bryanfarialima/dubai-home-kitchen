import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package } from "lucide-react";

interface OrderWithItems {
  id: string;
  status: string;
  total: number;
  delivery_address: string | null;
  created_at: string;
  payment_method: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/20 text-primary",
  preparing: "bg-warning/20 text-warning",
  delivering: "bg-primary/20 text-primary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-accent/20 text-accent",
};

const OrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Orders request timeout")), 30000)
        );

        const fetchPromise = supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const { data } = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as any;

        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const channel = supabase
      .channel("user-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">{t("my_orders")}</h1>
        </div>
      </header>

      <div className="container py-6 max-w-lg space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-12" data-app-loading="true">
            {t("loading")}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-display">{t("no_orders")}</p>
            <button onClick={() => navigate("/")} className="text-primary font-display font-semibold">{t("back_to_menu")}</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-display font-bold px-2.5 py-1 rounded-full ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                  {t(order.status)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2">
                <span className="text-sm text-muted-foreground">{order.payment_method === "cash" ? "💵" : "💳"} {t(order.payment_method || "cash")}</span>
                <span className="font-display font-bold text-primary">AED {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

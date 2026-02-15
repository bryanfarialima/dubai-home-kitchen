import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export default function AdminReports() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, todayOrders: 0, todayRevenue: 0 });
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [zoneStats, setZoneStats] = useState<any[]>([]);
  const { t } = useTranslation();

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

  useEffect(() => {
    fetchAllStats();
  }, [period]);

  const fetchAllStats = async () => {
    // Basic stats
    const { data: allOrders } = await supabase
      .from("orders")
      .select("id, total, created_at, delivery_zone_id");
    
    if (!allOrders) return;

    const today = new Date().toISOString().split("T")[0];
    const todayOrders = allOrders.filter((o) => o.created_at.startsWith(today));

    setStats({
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((s, o) => s + Number(o.total), 0),
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + Number(o.total), 0),
    });

    // Top dishes
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("menu_item_id, quantity, menu_items(name)");
    
    if (orderItems) {
      const dishMap: Record<string, { name: string; quantity: number }> = {};
      orderItems.forEach((item: any) => {
        const name = item.menu_items?.name || "Unknown";
        if (!dishMap[name]) {
          dishMap[name] = { name, quantity: 0 };
        }
        dishMap[name].quantity += item.quantity;
      });

      const topDishesData = Object.values(dishMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTopDishes(topDishesData);
    }

    // Peak hours
    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourMap[i] = 0;

    allOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourMap[hour]++;
    });

    const peakData = Object.entries(hourMap)
      .map(([hour, count]) => ({
        hour: `${hour.padStart(2, '0')}:00`,
        orders: count
      }))
      .filter(h => h.orders > 0);
    setPeakHours(peakData);

    // Zone stats
    const { data: zones } = await supabase.from("delivery_zones").select("id, name");
    if (zones) {
      const zoneMap: Record<string, { name: string; orders: number; revenue: number }> = {};
      
      zones.forEach(zone => {
        zoneMap[zone.id] = { name: zone.name, orders: 0, revenue: 0 };
      });

      allOrders.forEach(order => {
        if (order.delivery_zone_id && zoneMap[order.delivery_zone_id]) {
          zoneMap[order.delivery_zone_id].orders++;
          zoneMap[order.delivery_zone_id].revenue += Number(order.total);
        }
      });

      const zoneData = Object.values(zoneMap)
        .filter(z => z.orders > 0)
        .sort((a, b) => b.revenue - a.revenue);
      setZoneStats(zoneData);
    }
  };

  const cards = [
    { label: t("todays_orders"), value: stats.todayOrders, icon: "📦" },
    { label: t("todays_revenue"), value: `AED ${stats.todayRevenue.toFixed(2)}`, icon: "💰" },
    { label: t("total_orders"), value: stats.totalOrders, icon: "📊" },
    { label: t("total_revenue"), value: `AED ${stats.totalRevenue.toFixed(2)}`, icon: "🏦" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="font-display font-bold text-xl text-foreground">{t("reports")}</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <span className="text-2xl mb-2 block">{c.icon}</span>
            <p className="font-display font-bold text-xl text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {[
          { value: "7d", label: t("last_7_days") },
          { value: "30d", label: t("last_30_days") },
          { value: "all", label: t("all_time") }
        ].map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as any)}
            className={`px-4 py-2 rounded-full text-sm font-display font-semibold ${period === p.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Top dishes */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-foreground mb-4">🍽️ {t("top_dishes")}</h3>
        <div className="space-y-3">
          {topDishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_data")}</p>
          ) : (
            topDishes.map((dish, idx) => (
              <div key={dish.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <span className="text-sm text-foreground">{dish.name}</span>
                </div>
                <span className="text-sm font-display font-bold text-muted-foreground">{dish.quantity}x</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Peak hours */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-foreground mb-4">⏰ {t("peak_hours")}</h3>
        <div className="space-y-2">
          {peakHours.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_data")}</p>
          ) : (
            peakHours.map(h => (
              <div key={h.hour} className="flex items-center justify-between p-2 bg-background rounded">
                <span className="text-sm text-foreground">{h.hour}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div 
                    className="h-6 bg-primary/60 rounded"
                    style={{ width: `${(h.orders / 10) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{h.orders}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone stats */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-foreground mb-4">🗺️ {t("zone_performance")}</h3>
        <div className="space-y-3">
          {zoneStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_data")}</p>
          ) : (
            zoneStats.map((zone, idx) => (
              <div key={zone.name} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-display font-semibold text-foreground">{zone.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-primary">AED {zone.revenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{zone.orders} {t("orders")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

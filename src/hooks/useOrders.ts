import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface Order {
    id: string;
    status: string;
    total: number;
    delivery_address: string | null;
    created_at: string;
    payment_method: string | null;
    user_id: string;
    subtotal: number;
    delivery_fee: number;
    discount: number;
}

export const useOrders = (userId?: string) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const previousOrdersRef = useRef<Order[]>([]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Orders request timeout")), 20000)
                );

                const fetchPromise = supabase
                    .from("orders")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                const { data, error: fetchError } = (await Promise.race([
                    fetchPromise,
                    timeoutPromise,
                ])) as any;

                if (fetchError) throw fetchError;
                
                // Check for status changes and send notifications
                if (previousOrdersRef.current.length > 0 && data) {
                    data.forEach((newOrder) => {
                        const oldOrder = previousOrdersRef.current.find(o => o.id === newOrder.id);
                        if (oldOrder && oldOrder.status !== newOrder.status) {
                            // Status changed, send notification
                            sendOrderNotification(newOrder.id, newOrder.status, t);
                        }
                    });
                }
                
                previousOrdersRef.current = data || [];
                setOrders(data || []);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // Real-time subscription
        const channel = supabase
            .channel("user-orders")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "orders",
                    filter: `user_id=eq.${userId}`,
                },
                () => fetchOrders()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, t]);

    return { orders, loading, error };
};

const sendOrderNotification = (orderId: string, status: string, t: any) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    const statusMessages: Record<string, { title: string; body: string; emoji: string }> = {
        confirmed: {
            emoji: "✅",
            title: t("order_confirmed"),
            body: t("order_confirmed_message"),
        },
        preparing: {
            emoji: "👨‍🍳",
            title: t("order_preparing"),
            body: t("order_preparing_message"),
        },
        delivering: {
            emoji: "🚗",
            title: t("order_delivering"),
            body: t("order_delivering_message"),
        },
        delivered: {
            emoji: "🎉",
            title: t("order_delivered"),
            body: t("order_delivered_message"),
        },
        cancelled: {
            emoji: "❌",
            title: t("order_cancelled"),
            body: t("order_cancelled_message"),
        },
    };

    const config = statusMessages[status];
    if (!config) return;

    try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(`${config.emoji} ${config.title}`, {
                body: config.body,
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: `order-${orderId}`,
                requireInteraction: status === "delivered",
                data: { orderId, status },
              });
            });
        } else {
            new Notification(`${config.emoji} ${config.title}`, {
              body: config.body,
              icon: "/favicon.ico",
              tag: `order-${orderId}`,
            });
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

export const useAdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Admin orders request timeout")), 20000)
                );

                const fetchPromise = supabase
                    .from("orders")
                    .select("*")
                    .not("status", "in", "(cancelled,delivered)")
                    .order("created_at", { ascending: false });

                const { data } = (await Promise.race([
                    fetchPromise,
                    timeoutPromise,
                ])) as any;

                setOrders(data || []);
            } catch (error) {
                console.error("Error fetching admin orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const channel = supabase
            .channel("admin-orders")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
                fetchOrders()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateOrderStatus = async (orderId: string, status: string) => {
        const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
        return { error };
    };

    return { orders, loading, updateOrderStatus };
};

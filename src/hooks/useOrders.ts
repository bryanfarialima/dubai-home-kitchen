import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                if (fetchError) throw fetchError;
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
    }, [userId]);

    return { orders, loading, error };
};

export const useAdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data } = await supabase
                .from("orders")
                .select("*")
                .not("status", "in", "(cancelled,delivered)")
                .order("created_at", { ascending: false });
            setOrders(data || []);
            setLoading(false);
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

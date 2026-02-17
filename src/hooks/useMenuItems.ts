import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category_id: string | null;
    image_url: string | null;
    is_available: boolean;
    created_at: string;
}

interface Category {
    id: string;
    name: string;
    emoji: string | null;
    sort_order: number;
}

export const useMenuItems = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // No timeout - let Supabase handle connection issues naturally
            // This prevents timeout racing with successful slow requests
            const [{ data: menuItems }, { data: cats }] = await Promise.all([
                supabase.from("menu_items").select("*").order("name"),
                supabase.from("categories").select("*").order("sort_order"),
            ]);

            setItems(menuItems || []);
            setCategories(cats || []);
        } catch (error: any) {
            console.error("Error fetching menu data:", error);
            // Don't throw - let component decide how to handle
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createItem = async (item: Omit<MenuItem, "id" | "created_at" | "is_available">) => {
        try {
            const { error } = await supabase.from("menu_items").insert(item);
            if (error) throw error;
            toast.success("Item adicionado com sucesso!");
            fetchData();
            return { success: true };
        } catch (error: any) {
            toast.error(error.message);
            return { success: false, error };
        }
    };

    const updateItem = async (id: string, updates: Partial<MenuItem>) => {
        try {
            const { error } = await supabase.from("menu_items").update(updates).eq("id", id);
            if (error) throw error;
            toast.success("Item atualizado com sucesso!");
            fetchData();
            return { success: true };
        } catch (error: any) {
            toast.error(error.message);
            return { success: false, error };
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const { error } = await supabase.from("menu_items").delete().eq("id", id);
            if (error) throw error;
            toast.success("Item removido com sucesso!");
            fetchData();
            return { success: true };
        } catch (error: any) {
            toast.error(error.message);
            return { success: false, error };
        }
    };

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        return updateItem(id, { is_available: !currentStatus });
    };

    return {
        items,
        categories,
        loading,
        createItem,
        updateItem,
        deleteItem,
        toggleAvailability,
        refetch: fetchData,
    };
};

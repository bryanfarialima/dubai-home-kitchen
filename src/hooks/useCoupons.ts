import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  is_active: boolean;
  created_at: string;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const createCoupon = async (coupon: Omit<Coupon, "id" | "created_at" | "is_active">) => {
    try {
      const { error } = await supabase.from("coupons").insert({
        ...coupon,
        code: coupon.code.toUpperCase(),
      });
      if (error) throw error;
      toast.success("Cupom criado com sucesso!");
      fetchCoupons();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      fetchCoupons();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const validateCoupon = async (code: string, orderTotal: number) => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Cupom inválido");
        return { valid: false, discount: 0 };
      }

      if (data.min_order && orderTotal < data.min_order) {
        toast.error(`Pedido mínimo de AED ${data.min_order} necessário`);
        return { valid: false, discount: 0 };
      }

      const discount =
        data.discount_type === "percentage"
          ? (orderTotal * data.discount_value) / 100
          : data.discount_value;

      toast.success(`Cupom aplicado! Desconto de AED ${discount.toFixed(2)}`);
      return { valid: true, discount, coupon: data };
    } catch (error: any) {
      toast.error(error.message);
      return { valid: false, discount: 0 };
    }
  };

  return {
    coupons,
    loading,
    createCoupon,
    toggleCouponStatus,
    validateCoupon,
    refetch: fetchCoupons,
  };
};

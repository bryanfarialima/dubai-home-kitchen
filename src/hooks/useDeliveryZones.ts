import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
}

export const useDeliveryZones = () => {
  return useQuery({
    queryKey: ["delivery_zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as DeliveryZone[];
    },
  });
};

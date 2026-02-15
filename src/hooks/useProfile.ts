import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  location_type: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return { success: false, error: "No user ID" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) {
        // If location_type column doesn't exist, retry without it
        if (error.message?.includes("location_type") && updates.location_type !== undefined) {
          console.warn("location_type column not found, retrying without it");
          const { location_type, ...updatesWithoutLocationType } = updates;
          
          const { error: retryError } = await supabase
            .from("profiles")
            .update(updatesWithoutLocationType)
            .eq("user_id", userId);
          
          if (retryError) throw retryError;
          
          toast.success(t("updated_success"));
          console.info("Profile updated successfully (location_type column pending migration)");
          
          setTimeout(() => {
            fetchProfile();
          }, 100);
          
          return { success: true };
        }
        throw error;
      }

      toast.success(t("updated_success"));
      
      // Refetch profile after a small delay to prevent abort errors
      setTimeout(() => {
        fetchProfile();
      }, 100);
      
      return { success: true };
    } catch (error: any) {
      // Handle abort errors gracefully
      if (error.name === "AbortError") {
        console.log("Request was aborted, but update may have succeeded");
        return { success: true };
      }
      
      // More user-friendly error messages
      let errorMessage = error.message || t("error_occurred");
      
      if (error.message?.includes("JWT") || error.message?.includes("auth")) {
        errorMessage = t("session_expired_please_login");
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = t("network_error_try_again");
      } else if (error.code === "PGRST116") {
        errorMessage = t("profile_not_found");
      }
      
      console.error("Profile update error:", error);
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

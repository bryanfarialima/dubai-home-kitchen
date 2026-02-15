import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, User, MapPin, Phone, Home } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [locationType, setLocationType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setLocationType(profile.location_type || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error(t("error_occurred"));
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      full_name: fullName,
      phone: phone || null,
      address: address || null,
      location_type: locationType || null,
    });
    setLoading(false);

    if (result.success) {
      // Optional: navigate back or show success
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("my_profile")}
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl py-8 px-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t("full_name")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("full_name")}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {t("phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("phone_placeholder")}
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                {t("select_location_type")}
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t("select_location_type")}</option>
                <option value="house">{t("house")}</option>
                <option value="apartment">{t("apartment")}</option>
                <option value="condo">{t("condo")}</option>
                <option value="villa">{t("villa")}</option>
                <option value="office">{t("office")}</option>
                <option value="hotel">{t("hotel")}</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t("delivery_address")}
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder={t("address_placeholder")}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-display font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? t("processing") : t("save_profile")}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground/80">
            💡 {t("profile_info_text")}
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

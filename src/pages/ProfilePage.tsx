import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, User, MapPin, Phone, Home, Building2 } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);

  const [fullName, setFullName] = useState("");
  const [areaCode, setAreaCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
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
      
      // Parse phone
      if (profile.phone) {
        const phoneMatch = profile.phone.match(/^(\+\d{1,4})\s*(.+)$/);
        if (phoneMatch) {
          setAreaCode(phoneMatch[1]);
          setPhoneNumber(phoneMatch[2].replace(/\s/g, ""));
        } else {
          setPhoneNumber(profile.phone);
        }
      }
      
      // Parse address
      if (profile.address) {
        const parts = profile.address.split("|").map(p => p.trim());
        setStreet(parts[0] || "");
        setBuilding(parts[1] || "");
        setFloor(parts[2] || "");
      }
      
      setLocationType(profile.location_type || "");
    }
  }, [profile]);

  const validatePhone = (number: string, areaCode: string): { valid: boolean; message?: string } => {
    // Remove spaces and special chars
    const cleaned = number.replace(/[\s-]/g, "");
    
    if (!cleaned) return { valid: true }; // Empty is valid (optional field)
    
    switch (areaCode) {
      case "+971": // UAE
        const isValidUAE = /^(50|52|54|55|56|58)\d{7}$/.test(cleaned);
        return { 
          valid: isValidUAE, 
          message: isValidUAE ? undefined : "UAE: 50/52/54/55/56/58 + 7 digits" 
        };
      
      case "+55": // Brazil
        const isValidBR = /^\d{10,11}$/.test(cleaned); // DDD + 8 or 9 digits
        return { 
          valid: isValidBR, 
          message: isValidBR ? undefined : "Brazil: 10-11 digits (DDD + number)" 
        };
      
      case "+1": // USA/Canada
        const isValidUS = /^\d{10}$/.test(cleaned); // Area code + 7 digits
        return { 
          valid: isValidUS, 
          message: isValidUS ? undefined : "USA/Canada: 10 digits" 
        };
      
      case "+44": // UK
        const isValidUK = /^\d{10,11}$/.test(cleaned);
        return { 
          valid: isValidUK, 
          message: isValidUK ? undefined : "UK: 10-11 digits" 
        };
      
      default:
        // For other country codes, just check if it's numeric and reasonable length
        const isValidGeneric = /^\d{7,15}$/.test(cleaned);
        return { 
          valid: isValidGeneric, 
          message: isValidGeneric ? undefined : "7-15 digits required" 
        };
    }
  };

  const validateAddress = (): boolean => {
    return street.trim().length >= 5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error(t("full_name_required"));
      return;
    }

    // Validate phone if provided
    if (phoneNumber) {
      const phoneValidation = validatePhone(phoneNumber, areaCode);
      if (!phoneValidation.valid) {
        toast.error(`${t("invalid_phone")}: ${phoneValidation.message}`);
        return;
      }
    }

    // Validate address if provided
    if (street && !validateAddress()) {
      toast.error(t("invalid_address"));
      return;
    }

    // Format phone
    const formattedPhone = phoneNumber ? `${areaCode} ${phoneNumber}` : null;
    
    // Format address
    const formattedAddress = street 
      ? [street, building, floor].filter(Boolean).join(" | ")
      : null;

    setLoading(true);
    const result = await updateProfile({
      full_name: fullName,
      phone: formattedPhone,
      address: formattedAddress,
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
              <div className="flex gap-2">
                <select
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="w-32 px-3 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="+971">+971 🇦🇪</option>
                  <option value="+55">+55 🇧🇷</option>
                  <option value="+1">+1 🇺🇸</option>
                  <option value="+44">+44 🇬🇧</option>
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(value);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t("phone_number_placeholder")}
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("phone_format_hint")}
              </p>
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
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t("delivery_address")}
              </label>
              
              {/* Street */}
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("street_placeholder")}
              />
              
              {/* Building & Floor */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("building_placeholder")}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("floor_placeholder")}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("address_hint")}
              </p>
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

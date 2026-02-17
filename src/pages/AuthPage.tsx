import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const AuthPage = () => {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const getAuthErrorMessage = (err: any) => {
    const rawMessage = (err?.message || "").toLowerCase();
    if (rawMessage.includes("rate limit") || rawMessage.includes("too many")) {
      return t("email_rate_limit");
    }
    return err?.message || t("error_occurred");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success(t("welcome_back"));
        navigate("/");
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success(t("account_created"));
      }
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">🇧🇷</span>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Sabor de <span className="text-primary">Casa</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLogin ? t("login") : t("signup")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">{t("full_name")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-display font-bold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "..." : isLogin ? t("login") : t("signup")}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? t("no_account") : t("have_account")}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? t("signup") : t("login")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

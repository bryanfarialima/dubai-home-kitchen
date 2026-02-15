import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationPrompt = () => {
  const { t } = useTranslation();
  const { permission, isSupported, requestPermission } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user already interacted
    const dismissed = localStorage.getItem("notification-prompt-dismissed");
    
    if (dismissed === "true" || !isSupported || permission === "granted" || permission === "denied" || hasInteracted) {
      return;
    }

    // Show prompt after 10 seconds on the page
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isSupported, permission, hasInteracted]);

  const handleEnable = async () => {
    setHasInteracted(true);
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
      localStorage.setItem("notification-prompt-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setHasInteracted(true);
    setIsVisible(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  const handleMaybeLater = () => {
    setIsVisible(false);
    // Don't mark as permanently dismissed, will show again next session
  };

  if (!isVisible || hasInteracted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-in slide-in-from-bottom-4 pointer-events-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="font-display font-bold text-foreground text-lg mb-1">
              {t("enable_notifications")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("notification_prompt_text")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEnable}
            className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-full font-display font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {t("enable")}
          </button>
          <button
            onClick={handleMaybeLater}
            className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"
          >
            {t("maybe_later")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;

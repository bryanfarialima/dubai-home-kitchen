import { useState, useEffect } from "react";
import { toast } from "sonner";

type NotificationPermission = "default" | "granted" | "denied";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Notifications not supported in this browser");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notifications enabled! We'll keep you updated.");
        return true;
      } else {
        toast.error("Notifications denied. You can enable them later in settings.");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") {
      console.warn("Cannot send notification: permission not granted");
      return;
    }

    try {
      // If service worker is registered, use it for better reliability
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            ...options,
          });
        });
      } else {
        // Fallback to direct notification
        new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const notifyOrderStatus = (orderId: string, status: string, message: string) => {
    const statusEmojis: Record<string, string> = {
      confirmed: "✅",
      preparing: "👨‍🍳",
      delivering: "🚗",
      delivered: "🎉",
      cancelled: "❌",
    };

    const emoji = statusEmojis[status] || "📦";
    
    sendNotification(`${emoji} Order Update`, {
      body: message,
      tag: `order-${orderId}`,
      requireInteraction: status === "delivered",
      data: { orderId, status },
    });
  };

  const notifyPromotion = (title: string, message: string, url?: string) => {
    sendNotification(`🎉 ${title}`, {
      body: message,
      tag: "promotion",
      requireInteraction: true,
      data: { type: "promotion", url },
    });
  };

  const notifyMenuUpdate = (message: string) => {
    sendNotification("🍽️ Menu Updated", {
      body: message,
      tag: "menu-update",
      data: { type: "menu" },
    });
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    notifyOrderStatus,
    notifyPromotion,
    notifyMenuUpdate,
  };
};

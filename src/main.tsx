import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare const __APP_VERSION__: string;

const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";
const storedVersion = localStorage.getItem("app_version");

const clearClientCache = () => {
	try {
		Object.keys(localStorage)
			.filter((key) => key.startsWith("sb-"))
			.forEach((key) => localStorage.removeItem(key));
	} catch (error) {
		console.warn("Failed to clear auth cache:", error);
	}

	if ("caches" in window) {
		caches.keys().then((cacheNames) => {
			cacheNames.forEach((cacheName) => caches.delete(cacheName));
		});
	}
};

// Only clear cache on version change, don't auto-reload (prevents loop)
if (storedVersion && storedVersion !== APP_VERSION) {
	console.log("New version detected, clearing cache");
	localStorage.setItem("app_version", APP_VERSION);
	clearClientCache();
	// Don't auto-reload, let user refresh manually
} else if (!storedVersion) {
	localStorage.setItem("app_version", APP_VERSION);
}

createRoot(document.getElementById("root")!).render(<App />);

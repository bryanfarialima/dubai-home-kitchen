import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cache busting temporarily disabled to prevent issues
// declare const __APP_VERSION__: string;
// const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

createRoot(document.getElementById("root")!).render(<App />);

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Sabor de Casa",
        short_name: "Sabor",
        description: "Authentic Brazilian homemade meals delivered in Dubai",
        theme_color: "#f97316",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        categories: ["food", "shopping"],
        icons: [
          {
            src: "/favicon.ico",
            sizes: "192x192",
            type: "image/x-icon",
            purpose: "any maskable",
          },
          {
            src: "/favicon.ico",
            sizes: "512x512",
            type: "image/x-icon",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot1.png",
            sizes: "540x720",
            form_factor: "narrow",
          },
          {
            src: "/screenshot2.png",
            sizes: "1280x720",
            form_factor: "wide",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html}"],
        globIgnores: ["**/*.map", "**/node_modules/**/*"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ldjjyqrjckxdpewxxrnb\.supabase\.co\/auth\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-auth",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5, // 5 minutes for auth
              },
            },
          },
          {
            urlPattern: /^https:\/\/ldjjyqrjckxdpewxxrnb\.supabase\.co\/rest\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-api",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60, // 1 hour for API
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(Date.now().toString()),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Simple vendor splitting - no circular dependencies
          if (id.includes('node_modules')) {
            // Group by package name to avoid circularity
            if (id.includes('/@supabase/')) return 'supabase';
            if (id.includes('/framer-motion/')) return 'framer';
            if (id.includes('/@radix-ui/')) return 'radix';
            if (id.includes('/lucide-react/')) return 'lucide';
            if (id.includes('/i18next/')) return 'i18n';
            if (id.includes('/@tanstack/')) return 'tanstack';
            if (id.includes('/react-router')) return 'router';
            if (id.includes('/react') || id.includes('/scheduler')) return 'react';
            // Everything else in one chunk
            return 'libs';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
  },
}));

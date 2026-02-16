import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallPrompt from "@/components/InstallPrompt";
import AppWatchdog from "@/components/AppWatchdog";
import "@/i18n";
import Index from "./pages/Index";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better code splitting
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const DevTools = lazy(() => import("./pages/DevTools"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Memoize query client to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Skeleton className="w-96 h-96" />
  </div>
);

const App = () => {
  // Memoize providers to prevent unnecessary re-renders
  const queryClientMemo = useMemo(() => queryClient, []);

  return (
    <QueryClientProvider client={queryClientMemo}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppWatchdog />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
                <Route path="/orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
                <Route path="/devtools" element={<Suspense fallback={<PageLoader />}><DevTools /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
              </Routes>
              <WhatsAppButton />
              <InstallPrompt />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

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
import "@/i18n";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import DevTools from "./pages/DevTools";
import NotFound from "./pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPage = lazy(() => import("./pages/AdminPage"));

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

const AdminLoader = () => (
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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<Suspense fallback={<AdminLoader />}><AdminPage /></Suspense>} />
                <Route path="/devtools" element={<DevTools />} />
                <Route path="*" element={<NotFound />} />
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

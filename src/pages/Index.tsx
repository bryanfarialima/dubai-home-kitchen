import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      <main>
        <HeroSection />
        <MenuSection />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;

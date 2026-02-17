import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import FoodCard from "./FoodCard";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  badge?: string | null;
  is_available?: boolean;
};

type CategoryType = {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
};

const MenuSection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchIdRef = useRef(0); // Track latest fetch to prevent race conditions

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const currentFetchId = ++fetchIdRef.current; // Increment and capture current fetch ID
    
    try {
      setLoading(true);
      setError(null);
      
      // Simple timeout wrapper without AbortController (Supabase doesn't support it)
      const fetchWithTimeout = async (timeoutMs: number) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        );
        
        return Promise.race([
          Promise.all([
            supabase.from("categories").select("*").order("sort_order"),
            supabase.from("menu_items").select("*").eq("is_available", true)
          ]),
          timeoutPromise
        ]);
      };

      const [catsResult, itemsResult] = await fetchWithTimeout(30000) as any;
      
      // Only update state if this is still the latest fetch (prevent race condition)
      if (currentFetchId !== fetchIdRef.current) {
        console.log('Discarding stale fetch result');
        return;
      }
      
      if (catsResult.error) throw catsResult.error;
      if (itemsResult.error) throw itemsResult.error;

      const cats_data = catsResult.data;
      const items_data = itemsResult.data;

        const fallbackCategories = [
          { id: "mains", name: categoryTranslations.mains || "Principais", emoji: "🥘", sort_order: 1 },
          { id: "snacks", name: categoryTranslations.snacks || "Petiscos", emoji: "🥟", sort_order: 2 },
          { id: "desserts", name: categoryTranslations.desserts || "Sobremesas", emoji: "🍨", sort_order: 3 },
          { id: "combos", name: categoryTranslations.combos || "Combos", emoji: "📦", sort_order: 4 },
          { id: "promos", name: categoryTranslations.promos || "Promoções", emoji: "🔥", sort_order: 5 },
        ];

      setCategories(cats_data && cats_data.length > 0 ? cats_data : fallbackCategories);
      setMenuItems(items_data || []);
      setError(null); // Clear any previous error
    } catch (error: any) {
      // Only handle error if this is still the latest fetch
      if (currentFetchId !== fetchIdRef.current) {        console.log('Discarding stale error');
        return;
      }
      
      console.error("Error fetching menu:", error);
      
      // Always show categories even if fetch fails
      const fallbackCategories = [
        { id: "mains", name: categoryTranslations.mains || "Principais", emoji: "🥘", sort_order: 1 },
        { id: "snacks", name: categoryTranslations.snacks || "Petiscos", emoji: "🥟", sort_order: 2 },
        { id: "desserts", name: categoryTranslations.desserts || "Sobremesas", emoji: "🍨", sort_order: 3 },
        { id: "combos", name: categoryTranslations.combos || "Combos", emoji: "📦", sort_order: 4 },
        { id: "promos", name: categoryTranslations.promos || "Promoções", emoji: "🔥", sort_order: 5 },
      ];
      setCategories(fallbackCategories);
      setMenuItems([]); // Show empty state
      
      // Auto-retry without user seeing the error
      if (retryCount === 0) {
        console.log("Auto-retrying menu fetch...");
        setRetryCount(1);
        setTimeout(() => {
          fetchData();
        }, 3000);
      } else {
        setError("Nao foi possivel carregar o cardapio. Tente novamente.");
      }
      // Categories already set in catch block
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categoryTranslations: Record<string, string> = {
    all: t("all"),
    mains: t("mains"),
    snacks: t("snacks"),
    desserts: t("desserts"),
    combos: t("combos"),
    promos: t("promos"),
  };

  const filtered = activeCategory === "all"
    ? menuItems
    : menuItems.filter((i) => i.category_id === activeCategory);

  // Map database items to FoodCard format
  const mappedItems = filtered.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image_url || "", // Map image_url to image
    category: item.category_id as any,
    rating: 4.8, // Default rating (add to DB later if needed)
    reviews: 50, // Default reviews count
    badge: item.badge || undefined,
  }));

  if (loading) {
    return (
      <section id="menu" className="py-10 sm:py-16" data-app-loading="true">
        <div className="container text-center">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-10 sm:py-16">
      <div className="container">
        <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground text-center mb-2">
          {t("our_menu")}
        </h2>
        <p className="text-muted-foreground text-center mb-8">{t("menu_subtitle")}</p>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all ${activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
          >
            <span>🍽️</span>
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-display font-semibold text-primary-foreground"
              >
                Tentar novamente
              </button>
            </div>
          ) : mappedItems.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">
              {t("no_items_available")}
            </p>
          ) : (
            mappedItems.map((item, index) => (
              <FoodCard key={item.id} item={item} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;

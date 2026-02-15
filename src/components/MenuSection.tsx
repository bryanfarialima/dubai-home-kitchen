import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { categories as localCategories, menuItems as localMenuItems } from "@/data/menuData";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 8000)
      );

      const fetchPromise = (async () => {
        // Fetch categories
        const { data: cats, error: catsError } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order");

        if (catsError) throw catsError;

        // Fetch menu items
        const { data: items, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true);

        if (itemsError) throw itemsError;

        return { cats, items };
      })();

      const { cats, items } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      const fallbackCategories = localCategories
        .filter((c) => c.id !== "all")
        .map((c) => ({
          id: c.id,
          name: categoryTranslations[c.id] || c.label,
          emoji: c.emoji,
          sort_order: 0,
        }));

      const fallbackItems = localMenuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image,
        category_id: item.category,
        badge: item.badge,
      }));

      setCategories(cats && cats.length > 0 ? cats : fallbackCategories);
      setMenuItems(items && items.length > 0 ? items : fallbackItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
      // Fallback to local data if database fails
      const fallbackCategories = localCategories
        .filter((c) => c.id !== "all")
        .map((c) => ({
          id: c.id,
          name: categoryTranslations[c.id] || c.label,
          emoji: c.emoji,
          sort_order: 0,
        }));

      const fallbackItems = localMenuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image,
        category_id: item.category,
        badge: item.badge,
      }));

      setCategories(fallbackCategories);
      setMenuItems(fallbackItems);
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
      <section id="menu" className="py-10 sm:py-16">
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
          {mappedItems.length === 0 ? (
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

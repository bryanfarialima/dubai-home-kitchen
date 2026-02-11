import { useState } from "react";
import { useTranslation } from "react-i18next";
import { categories as localCategories, menuItems } from "@/data/menuData";
import type { Category } from "@/data/menuData";
import FoodCard from "./FoodCard";

const MenuSection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const categoryTranslations: Record<string, string> = {
    all: t("all"), mains: t("mains"), snacks: t("snacks"),
    desserts: t("desserts"), combos: t("combos"), promos: t("promos"),
  };

  const filtered = activeCategory === "all" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  return (
    <section id="menu" className="py-10 sm:py-16">
      <div className="container">
        <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground text-center mb-2">
          {t("our_menu")}
        </h2>
        <p className="text-muted-foreground text-center mb-8">{t("menu_subtitle")}</p>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {localCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              <span>{cat.emoji}</span>
              {categoryTranslations[cat.id] || cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, index) => (
            <FoodCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;

import { Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "@/data/menuData";
import { useCart } from "@/contexts/CartContext";

interface FoodCardProps {
  item: MenuItem;
  index: number;
}

const FoodCard = ({ item, index }: FoodCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {item.badge && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-display font-bold px-2.5 py-1 rounded-full">
            {item.badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
          <span className="text-sm font-semibold text-foreground">{item.rating}</span>
          <span className="text-xs text-muted-foreground">({item.reviews})</span>
        </div>

        <h3 className="font-display font-bold text-foreground text-lg leading-tight mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-display font-bold text-primary">
            AED {item.price}
          </span>
          <button
            onClick={() => addItem(item)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-display font-semibold hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;

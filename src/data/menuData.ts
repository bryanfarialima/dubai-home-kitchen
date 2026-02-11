import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import food5 from "@/assets/food-5.jpg";
import food6 from "@/assets/food-6.jpg";

export type Category = "all" | "mains" | "snacks" | "desserts" | "combos" | "promos";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  reviews: number;
  badge?: string;
}

export const categories: { id: Category; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "mains", label: "Mains", emoji: "🥘" },
  { id: "snacks", label: "Snacks", emoji: "🥟" },
  { id: "desserts", label: "Desserts", emoji: "🍨" },
  { id: "combos", label: "Combos", emoji: "📦" },
  { id: "promos", label: "Promos", emoji: "🔥" },
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Picanha Grelhada",
    description: "Grilled picanha steak with rice, beans & farofa. The authentic Brazilian taste.",
    price: 45,
    image: food1,
    category: "mains",
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Estrogonofe de Frango",
    description: "Creamy chicken stroganoff with rice and crispy potato sticks.",
    price: 35,
    image: food2,
    category: "mains",
    rating: 4.7,
    reviews: 98,
  },
  {
    id: "3",
    name: "Feijoada Completa",
    description: "Traditional black bean stew with rice, farofa, orange & collard greens.",
    price: 42,
    image: food3,
    category: "mains",
    rating: 4.8,
    reviews: 156,
    badge: "Traditional",
  },
  {
    id: "4",
    name: "Salmão Grelhado",
    description: "Grilled salmon fillet with rice, fresh salad and seasonal vegetables.",
    price: 55,
    image: food4,
    category: "mains",
    rating: 4.9,
    reviews: 87,
    badge: "Premium",
  },
  {
    id: "5",
    name: "Pastel de Carne",
    description: "Crispy fried pastry stuffed with seasoned beef. Served with green salsa.",
    price: 15,
    image: food5,
    category: "snacks",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: "6",
    name: "Açaí Bowl",
    description: "Frozen açaí topped with granola, banana and fresh strawberries.",
    price: 28,
    image: food6,
    category: "desserts",
    rating: 4.8,
    reviews: 167,
    badge: "Popular",
  },
  {
    id: "7",
    name: "Combo Brasileiro",
    description: "Picanha + Feijoada + Açaí Bowl. The ultimate Brazilian experience!",
    price: 99,
    image: food1,
    category: "combos",
    rating: 5.0,
    reviews: 45,
    badge: "Save 20%",
  },
  {
    id: "8",
    name: "Happy Hour Deal",
    description: "Any main dish + drink for a special price. Available 2-5 PM.",
    price: 39,
    image: food2,
    category: "promos",
    rating: 4.7,
    reviews: 62,
    badge: "🔥 Limited",
  },
];

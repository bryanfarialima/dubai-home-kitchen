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

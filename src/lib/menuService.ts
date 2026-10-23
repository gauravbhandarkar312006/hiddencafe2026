import { supabase, isSupabaseConfigured } from "./supabase";
import { MENU, type MenuCategory, type MenuItem } from "../data";

export type DbMenuItem = {
  id: string;
  name: string;
  note?: string;
  category: string;
  price: number;
  size_price?: string;
  is_veg: boolean;
  is_spicy: boolean;
  is_famous: boolean;
  is_pick: boolean;
  is_available: boolean;
  sort_order: number;
};

// Map database items into category groups preserving existing structure
export function groupMenuItemsByCategory(dbItems: DbMenuItem[]): MenuCategory[] {
  return MENU.map((cat) => {
    const matching = dbItems.filter((i) => i.category === cat.id && i.is_available);
    if (matching.length === 0) return cat;

    const mappedItems: MenuItem[] = matching.map((item) => ({
      name: item.name,
      note: item.note,
      price: Number(item.price),
      sizePrice: item.size_price || undefined,
      veg: item.is_veg,
      spicy: item.is_spicy,
      famous: item.is_famous,
      pick: item.is_pick,
    }));

    return {
      ...cat,
      items: mappedItems,
    };
  });
}

// Fetch menu items from Supabase with graceful fallback
export async function fetchLiveMenu(): Promise<{ categories: MenuCategory[]; isLive: boolean }> {
  if (!isSupabaseConfigured) {
    return { categories: MENU, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return { categories: MENU, isLive: false };
    }

    const categories = groupMenuItemsByCategory(data as DbMenuItem[]);
    return { categories, isLive: true };
  } catch (err) {
    console.warn("[MenuService] Using static menu fallback:", err);
    return { categories: MENU, isLive: false };
  }
}

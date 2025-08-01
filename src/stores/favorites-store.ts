"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface FavoritesStore {
  items: Product[];
  toggleItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const items = get().items;
        const existingIndex = items.findIndex((item) => item.id === product.id);

        if (existingIndex >= 0) {
          set({ items: items.filter((item) => item.id !== product.id) });
          toast.info(`${product.name} se ha eliminado de favoritos`);
        } else {
          set({ items: [...items, product] });
          toast.success(`${product.name} se ha añadido a favoritos`);
        }
      },
      removeItem: (productId) => {
        const items = get().items;
        const item = items.find((item) => item.id === productId);
        if (item) {
          set({ items: items.filter((item) => item.id !== productId) });
          toast.info(`${item.name} se ha eliminado de favoritos`);
        }
      },
      clearFavorites: () => {
        set({ items: [] });
        toast.info("Se han eliminado todos los favoritos");
      },
    }),
    {
      name: "mandorla-favorites-storage",
    }
  )
);

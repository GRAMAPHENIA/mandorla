"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
          toast.success(
            `Se ha actualizado la cantidad de ${product.name} en el carrito`
          );
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
          toast.success(`${product.name} se ha añadido al carrito`);
        }
      },
      removeItem: (productId) => {
        const item = get().items.find((item) => item.id === productId);
        if (item) {
          set({ items: get().items.filter((item) => item.id !== productId) });
          toast.info(`${item.name} se ha eliminado del carrito`);
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items;
        const item = items.find((item) => item.id === productId);
        if (item) {
          set({
            items: items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => {
        set({ items: [] });
        toast.info("El carrito se ha vaciado");
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "mandorla-cart-storage",
    }
  )
);

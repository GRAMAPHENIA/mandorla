"use client"

// Note: This is prepared for Zustand but doesn't import it
// To use this, install Zustand: npm install zustand
// Then uncomment the import and create statements below

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
import type { Product } from "@/types/product"

interface FavoritesStore {
  items: Product[]
  toggleItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearFavorites: () => void
}

// Temporary mock implementation for development
// Replace with actual Zustand store when ready
export const useFavoritesStore = (() => {
  let items: Product[] = []
  const listeners: (() => void)[] = []

  const notify = () => listeners.forEach((listener) => listener())

  return (selector?: (state: FavoritesStore) => any) => {
    const store: FavoritesStore = {
      items,
      toggleItem: (product: Product) => {
        const existingIndex = items.findIndex((item) => item.id === product.id)
        if (existingIndex >= 0) {
          items.splice(existingIndex, 1)
        } else {
          items.push(product)
        }
        notify()
      },
      removeItem: (productId: string) => {
        items = items.filter((item) => item.id !== productId)
        notify()
      },
      clearFavorites: () => {
        items = []
        notify()
      },
    }

    return selector ? selector(store) : store
  }
})()

// Actual Zustand implementation (uncomment when ready to use):
/*
export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const items = get().items
        const existingIndex = items.findIndex(item => item.id === product.id)
        
        if (existingIndex >= 0) {
          set({ items: items.filter(item => item.id !== product.id) })
        } else {
          set({ items: [...items, product] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      clearFavorites: () => set({ items: [] })
    }),
    {
      name: 'mandorla-favorites-storage',
    }
  )
)
*/

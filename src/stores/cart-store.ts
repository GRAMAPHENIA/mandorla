"use client"

// Note: This is prepared for Zustand but doesn't import it
// To use this, install Zustand: npm install zustand
// Then uncomment the import and create statements below

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
import type { Product } from "@/types/product"

export interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// Temporary mock implementation for development
// Replace with actual Zustand store when ready
export const useCartStore = (() => {
  let items: CartItem[] = []
  const listeners: (() => void)[] = []

  const notify = () => listeners.forEach((listener) => listener())

  return (selector?: (state: CartStore) => any) => {
    const store: CartStore = {
      items,
      addItem: (product: Product) => {
        const existingItem = items.find((item) => item.id === product.id)
        if (existingItem) {
          existingItem.quantity += 1
        } else {
          items.push({ ...product, quantity: 1 })
        }
        notify()
      },
      removeItem: (productId: string) => {
        items = items.filter((item) => item.id !== productId)
        notify()
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          store.removeItem(productId)
          return
        }
        const item = items.find((item) => item.id === productId)
        if (item) {
          item.quantity = quantity
          notify()
        }
      },
      clearCart: () => {
        items = []
        notify()
      },
      getTotalItems: () => items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    }

    return selector ? selector(store) : store
  }
})()

// Actual Zustand implementation (uncomment when ready to use):
/*
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        })
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }),
    {
      name: 'mandorla-cart-storage',
    }
  )
)
*/

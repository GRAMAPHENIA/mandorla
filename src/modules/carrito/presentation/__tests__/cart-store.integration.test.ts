/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { useCartStore, useCartOperations } from '../../../../stores/cart-store'

// Mock localStorage para testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Cart Store Integration Tests', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorageMock.clear()
    
    // Resetear el store
    useCartStore.getState().clearCart()
  })

  describe('useCartOperations', () => {
    it('debería agregar un item al carrito', async () => {
      const { result } = renderHook(() => useCartOperations())

      const testItem = {
        id: 'prod-1',
        name: 'Pan integral',
        price: 2.50,
        image: 'pan.jpg'
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toMatchObject({
        id: 'prod-1',
        name: 'Pan integral',
        price: 2.50,
        quantity: 1,
        subtotal: 2.50
      })
      expect(result.current.totalItems).toBe(1)
      expect(result.current.totalPrice).toBe(2.50)
    })

    it('debería incrementar cantidad si el item ya existe', async () => {
      const { result } = renderHook(() => useCartOperations())

      const testItem = {
        id: 'prod-1',
        name: 'Croissant',
        price: 1.80
      }

      // Agregar item dos veces
      await act(async () => {
        await result.current.addItem(testItem)
      })

      await act(async () => {
        await result.current.addItem(testItem)
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(2)
      expect(result.current.totalItems).toBe(2)
      expect(result.current.totalPrice).toBe(3.60)
    })

    it('debería remover un item del carrito', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Agregar items primero
      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan',
          price: 2.00
        })
        await result.current.addItem({
          id: 'prod-2',
          name: 'Leche',
          price: 1.50
        })
      })

      // Remover un item
      await act(async () => {
        await result.current.removeItem('prod-1')
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].id).toBe('prod-2')
      expect(result.current.totalItems).toBe(1)
      expect(result.current.totalPrice).toBe(1.50)
    })

    it('debería actualizar la cantidad de un item', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Agregar item
      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Muffin',
          price: 3.00
        })
      })

      // Actualizar cantidad
      await act(async () => {
        await result.current.updateQuantity('prod-1', 4)
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.items[0].quantity).toBe(4)
      expect(result.current.totalItems).toBe(4)
      expect(result.current.totalPrice).toBe(12.00)
    })

    it('debería remover item cuando la cantidad es 0', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Agregar item
      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Galleta',
          price: 1.00
        })
      })

      // Actualizar cantidad a 0
      await act(async () => {
        await result.current.updateQuantity('prod-1', 0)
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.totalItems).toBe(0)
      expect(result.current.totalPrice).toBe(0)
      expect(result.current.isEmpty).toBe(true)
    })

    it('debería limpiar todo el carrito', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Agregar varios items
      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan',
          price: 2.00
        })
        await result.current.addItem({
          id: 'prod-2',
          name: 'Leche',
          price: 1.50
        })
      })

      // Limpiar carrito
      await act(async () => {
        await result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.totalItems).toBe(0)
      expect(result.current.totalPrice).toBe(0)
      expect(result.current.isEmpty).toBe(true)
    })

    it('debería verificar si tiene un item específico', async () => {
      const { result } = renderHook(() => useCartOperations())

      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan',
          price: 2.00
        })
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.hasItem('prod-1')).toBe(true)
      expect(result.current.hasItem('prod-2')).toBe(false)
    })

    it('debería obtener la cantidad de un item específico', async () => {
      const { result } = renderHook(() => useCartOperations())

      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan',
          price: 2.00
        })
        await result.current.updateQuantity('prod-1', 3)
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.getItemQuantity('prod-1')).toBe(3)
      expect(result.current.getItemQuantity('prod-2')).toBe(0)
    })

    it('debería manejar errores correctamente', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Intentar actualizar cantidad con valor inválido
      await act(async () => {
        await result.current.updateQuantity('prod-inexistente', -1)
      })

      expect(result.current.error).toBeTruthy()
      
      // Limpiar error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('debería persistir el estado en localStorage', async () => {
      const { result } = renderHook(() => useCartOperations())

      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan persistente',
          price: 2.50
        })
      })

      // Esperar a que se complete la persistencia
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      // Verificar que se guardó en localStorage (el carrito se persiste con el facade)
      const cartData = localStorageMock.getItem('mandorla_cart_default-cart')
      expect(cartData).toBeTruthy()
      
      if (cartData) {
        const parsed = JSON.parse(cartData)
        expect(parsed.items).toHaveLength(1)
        expect(parsed.items[0].name).toBe('Pan persistente')
      }
    })
  })

  describe('estado de carga', () => {
    it('debería completar operaciones correctamente', async () => {
      const { result } = renderHook(() => useCartOperations())

      // Realizar operación
      await act(async () => {
        await result.current.addItem({
          id: 'prod-1',
          name: 'Pan',
          price: 2.00
        })
      })

      // Esperar a que se complete la carga
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Después de la operación, no debería estar cargando y debería tener el item
      expect(result.current.isLoading).toBe(false)
      expect(result.current.items).toHaveLength(1)
    })
  })
})
import { useState, useEffect } from 'react'
import { CartEntity } from '../../domain'
import { CartService } from '../../application'

/**
 * Hook personalizado para gestionar el carrito
 */
export function useCart(cartService: CartService, customerId: string) {
  const [cart, setCart] = useState<CartEntity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const userCart = await cartService.getCart(customerId)
      setCart(userCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el carrito')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (
    productId: string,
    productName: string,
    price: number,
    quantity: number = 1
  ) => {
    setError(null)
    try {
      await cartService.addToCart(customerId, productId, productName, price, quantity)
      await loadCart() // Recargar el carrito
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar al carrito')
    }
  }

  const removeFromCart = async (productId: string) => {
    setError(null)
    try {
      await cartService.removeFromCart(customerId, productId)
      await loadCart() // Recargar el carrito
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover del carrito')
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    setError(null)
    try {
      await cartService.updateQuantity(customerId, productId, quantity)
      await loadCart() // Recargar el carrito
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cantidad')
    }
  }

  const clearCart = async () => {
    setError(null)
    try {
      await cartService.clearCart(customerId)
      await loadCart() // Recargar el carrito
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar el carrito')
    }
  }

  const getCartTotal = () => {
    return cart ? cart.calculateTotal() : { amount: 0, currency: 'EUR' }
  }

  const getTotalItems = () => {
    return cart ? cart.getTotalItems() : 0
  }

  const isCartEmpty = () => {
    return cart ? cart.isEmpty() : true
  }

  const hasProduct = (productId: string) => {
    return cart ? cart.hasItem(productId) : false
  }

  const getProductQuantity = (productId: string) => {
    if (!cart) return 0
    const item = cart.getItem(productId)
    return item ? item.quantity : 0
  }

  useEffect(() => {
    if (customerId) {
      loadCart()
    }
  }, [customerId])

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
    isCartEmpty,
    hasProduct,
    getProductQuantity,
    refreshCart: loadCart
  }
}
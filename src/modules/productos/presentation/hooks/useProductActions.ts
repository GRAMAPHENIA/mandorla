import { useCallback } from 'react'
import { ProductEntity } from '../../domain/entities/ProductEntity'
import { useCartStore } from '../../../stores/cart-store'
import { useFavoritesStore } from '../../../stores/favorites-store'
import { ProductMapper } from '../../infrastructure/mappers/ProductMapper'

/**
 * Hook personalizado para acciones de productos
 * Encapsula la lógica de interacción con carrito y favoritos
 */
export function useProductActions() {
  const addToCart = useCartStore((state) => state.addItem)
  const toggleFavorite = useFavoritesStore((state) => state.toggleItem)
  const isFavorite = useFavoritesStore((state) => state.items)
  const cartItems = useCartStore((state) => state.items)

  /**
   * Agrega un producto al carrito
   */
  const handleAddToCart = useCallback((product: ProductEntity) => {
    try {
      // Verificar disponibilidad antes de agregar
      product.checkAvailabilityForPurchase()
      
      // Convertir entidad de dominio a DTO para el store
      const productDTO = ProductMapper.toDTO(product)
      addToCart(productDTO)
      
      return { success: true, message: 'Producto agregado al carrito' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar producto al carrito'
      return { success: false, message }
    }
  }, [addToCart])

  /**
   * Alterna un producto en favoritos
   */
  const handleToggleFavorite = useCallback((product: ProductEntity) => {
    try {
      // Convertir entidad de dominio a DTO para el store
      const productDTO = ProductMapper.toDTO(product)
      toggleFavorite(productDTO)
      
      const isCurrentlyFavorite = isFavorite.some(item => item.id === product.id.value)
      const action = isCurrentlyFavorite ? 'eliminado de' : 'agregado a'
      
      return { 
        success: true, 
        message: `Producto ${action} favoritos`,
        isFavorite: !isCurrentlyFavorite
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar favoritos'
      return { success: false, message }
    }
  }, [toggleFavorite, isFavorite])

  /**
   * Verifica si un producto está en favoritos
   */
  const isProductFavorite = useCallback((productId: string) => {
    return isFavorite.some(item => item.id === productId)
  }, [isFavorite])

  /**
   * Verifica si un producto está en el carrito
   */
  const isProductInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.id === productId)
  }, [cartItems])

  /**
   * Obtiene la cantidad de un producto en el carrito
   */
  const getProductQuantityInCart = useCallback((productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId)
    return cartItem?.quantity || 0
  }, [cartItems])

  /**
   * Verifica si un producto está disponible para compra
   */
  const isProductAvailable = useCallback((product: ProductEntity) => {
    return product.isAvailable()
  }, [])

  /**
   * Obtiene el precio con descuento si aplica
   */
  const getProductPrice = useCallback((product: ProductEntity) => {
    return {
      currentPrice: product.price.amount,
      originalPrice: product.originalPrice?.amount,
      hasDiscount: product.hasDiscount(),
      discountPercentage: product.getDiscountPercentage()
    }
  }, [])

  /**
   * Verifica si un producto contiene un alérgeno específico
   */
  const checkAllergen = useCallback((product: ProductEntity, allergen: string) => {
    return product.containsAllergen(allergen)
  }, [])

  /**
   * Verifica si un producto contiene un ingrediente específico
   */
  const checkIngredient = useCallback((product: ProductEntity, ingredient: string) => {
    return product.containsIngredient(ingredient)
  }, [])

  /**
   * Obtiene información completa de un producto para mostrar
   */
  const getProductDisplayInfo = useCallback((product: ProductEntity) => {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      image: product.image,
      category: {
        value: product.category.value,
        displayName: product.category.displayName
      },
      price: getProductPrice(product),
      featured: product.featured,
      inStock: product.inStock,
      ingredients: product.ingredients,
      allergens: product.allergens,
      isAvailable: isProductAvailable(product),
      isFavorite: isProductFavorite(product.id.value),
      isInCart: isProductInCart(product.id.value),
      quantityInCart: getProductQuantityInCart(product.id.value)
    }
  }, [
    getProductPrice,
    isProductAvailable,
    isProductFavorite,
    isProductInCart,
    getProductQuantityInCart
  ])

  return {
    handleAddToCart,
    handleToggleFavorite,
    isProductFavorite,
    isProductInCart,
    getProductQuantityInCart,
    isProductAvailable,
    getProductPrice,
    checkAllergen,
    checkIngredient,
    getProductDisplayInfo
  }
}
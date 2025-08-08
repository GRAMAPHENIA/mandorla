import { CartService, CartInfoDto, CartItemDto } from '../../application'
import { LocalCartRepository, LocalStorageService } from '../../infrastructure'

/**
 * Facade para simplificar la interacción con el carrito desde la UI
 * Implementa el patrón Facade para ocultar la complejidad de la arquitectura
 */
export class CartFacade {
  private cartService: CartService
  private defaultCartId: string = 'default-cart'

  constructor() {
    // Configurar dependencias
    const storageService = new LocalStorageService()
    const cartRepository = new LocalCartRepository(storageService)
    this.cartService = new CartService(cartRepository)
  }

  /**
   * Obtiene la información completa del carrito
   */
  async getCart(): Promise<CartInfoDto | null> {
    const result = await this.cartService.getCart({ cartId: this.defaultCartId })
    return result.success ? result.cart! : null
  }

  /**
   * Agrega un producto al carrito
   */
  async addProduct(product: {
    id: string
    name: string
    price: number
    image?: string
  }, quantity: number = 1): Promise<{ success: boolean; message?: string }> {
    const result = await this.cartService.addToCart({
      cartId: this.defaultCartId,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    })

    return {
      success: result.success,
      message: result.message || result.error?.message
    }
  }

  /**
   * Remueve un producto del carrito
   */
  async removeProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    const result = await this.cartService.removeFromCart({
      cartId: this.defaultCartId,
      productId
    })

    return {
      success: result.success,
      message: result.message || result.error?.message
    }
  }

  /**
   * Actualiza la cantidad de un producto
   */
  async updateQuantity(productId: string, quantity: number): Promise<{ success: boolean; message?: string }> {
    const result = await this.cartService.updateQuantity({
      cartId: this.defaultCartId,
      productId,
      quantity
    })

    return {
      success: result.success,
      message: result.message || result.error?.message
    }
  }

  /**
   * Limpia el carrito
   */
  async clearCart(): Promise<{ success: boolean; message?: string }> {
    const result = await this.cartService.clearCart({
      cartId: this.defaultCartId
    })

    return {
      success: result.success,
      message: result.message || result.error?.message
    }
  }

  /**
   * Obtiene el número total de items
   */
  async getTotalItems(): Promise<number> {
    return await this.cartService.getCartItemCount(this.defaultCartId)
  }

  /**
   * Obtiene el precio total
   */
  async getTotalPrice(): Promise<number> {
    return await this.cartService.getCartTotal(this.defaultCartId)
  }

  /**
   * Verifica si el carrito está vacío
   */
  async isEmpty(): Promise<boolean> {
    return await this.cartService.isCartEmpty(this.defaultCartId)
  }

  /**
   * Obtiene un item específico del carrito
   */
  async getItem(productId: string): Promise<CartItemDto | null> {
    const cart = await this.getCart()
    if (!cart) return null

    return cart.items.find(item => item.productId === productId) || null
  }

  /**
   * Verifica si un producto está en el carrito
   */
  async hasProduct(productId: string): Promise<boolean> {
    const item = await this.getItem(productId)
    return item !== null
  }

  /**
   * Obtiene la cantidad de un producto específico
   */
  async getProductQuantity(productId: string): Promise<number> {
    const item = await this.getItem(productId)
    return item ? item.quantity : 0
  }

  /**
   * Configura un ID de carrito personalizado (útil para múltiples usuarios)
   */
  setCartId(cartId: string): void {
    this.defaultCartId = cartId
  }

  /**
   * Obtiene el ID del carrito actual
   */
  getCartId(): string {
    return this.defaultCartId
  }
}
import { CartEntity, CartId, CustomerId, CartRepository, CartNotFoundError, InvalidQuantityError } from '../../domain'
import { Money } from '../../../productos/domain'

/**
 * Servicio de aplicación para el carrito
 * Contiene los casos de uso relacionados con el carrito
 */
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  /**
   * Obtiene el carrito de un cliente
   * @param customerId ID del cliente
   */
  async getCart(customerId: string): Promise<CartEntity> {
    const customerIdVO = new CustomerId(customerId)
    let cart = await this.cartRepository.findByCustomerId(customerIdVO)
    
    if (!cart) {
      // Crear un nuevo carrito si no existe
      cart = await this.cartRepository.create(customerIdVO)
    }
    
    return cart
  }

  /**
   * Agrega un producto al carrito
   * @param customerId ID del cliente
   * @param productId ID del producto
   * @param productName Nombre del producto
   * @param price Precio del producto
   * @param quantity Cantidad a agregar
   */
  async addToCart(
    customerId: string,
    productId: string,
    productName: string,
    price: number,
    quantity: number = 1
  ): Promise<void> {
    if (quantity <= 0) {
      throw new InvalidQuantityError(quantity)
    }

    const cart = await this.getCart(customerId)
    const priceVO = new Money(price, 'EUR')
    
    cart.addItem(productId, productName, priceVO, quantity)
    await this.cartRepository.save(cart)
  }

  /**
   * Remueve un producto del carrito
   * @param customerId ID del cliente
   * @param productId ID del producto a remover
   */
  async removeFromCart(customerId: string, productId: string): Promise<void> {
    const cart = await this.getCart(customerId)
    cart.removeItem(productId)
    await this.cartRepository.save(cart)
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param customerId ID del cliente
   * @param productId ID del producto
   * @param quantity Nueva cantidad
   */
  async updateQuantity(customerId: string, productId: string, quantity: number): Promise<void> {
    if (quantity < 0) {
      throw new InvalidQuantityError(quantity)
    }

    const cart = await this.getCart(customerId)
    cart.updateQuantity(productId, quantity)
    await this.cartRepository.save(cart)
  }

  /**
   * Limpia el carrito de un cliente
   * @param customerId ID del cliente
   */
  async clearCart(customerId: string): Promise<void> {
    const cart = await this.getCart(customerId)
    cart.clear()
    await this.cartRepository.save(cart)
  }

  /**
   * Obtiene el total del carrito
   * @param customerId ID del cliente
   */
  async getCartTotal(customerId: string): Promise<Money> {
    const cart = await this.getCart(customerId)
    return cart.calculateTotal()
  }

  /**
   * Obtiene la cantidad total de items en el carrito
   * @param customerId ID del cliente
   */
  async getTotalItems(customerId: string): Promise<number> {
    const cart = await this.getCart(customerId)
    return cart.getTotalItems()
  }

  /**
   * Verifica si el carrito está vacío
   * @param customerId ID del cliente
   */
  async isCartEmpty(customerId: string): Promise<boolean> {
    const cart = await this.getCart(customerId)
    return cart.isEmpty()
  }

  /**
   * Verifica si un producto está en el carrito
   * @param customerId ID del cliente
   * @param productId ID del producto
   */
  async hasProduct(customerId: string, productId: string): Promise<boolean> {
    const cart = await this.getCart(customerId)
    return cart.hasItem(productId)
  }

  /**
   * Obtiene la cantidad de un producto específico en el carrito
   * @param customerId ID del cliente
   * @param productId ID del producto
   */
  async getProductQuantity(customerId: string, productId: string): Promise<number> {
    const cart = await this.getCart(customerId)
    const item = cart.getItem(productId)
    return item ? item.quantity : 0
  }
}
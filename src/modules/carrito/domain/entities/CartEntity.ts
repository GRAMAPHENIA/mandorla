import { CartId, CartItem, CustomerId } from '../value-objects'
import { Money } from '../../../productos/domain'

/**
 * Entidad de dominio para el carrito de compras
 */
export class CartEntity {
  constructor(
    public readonly id: CartId,
    public readonly customerId: CustomerId,
    public items: CartItem[] = []
  ) {}

  /**
   * Agrega un item al carrito
   * @param productId ID del producto
   * @param productName Nombre del producto
   * @param price Precio del producto
   * @param quantity Cantidad a agregar
   */
  addItem(productId: string, productName: string, price: Money, quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a cero')
    }

    const existingItemIndex = this.items.findIndex(item => item.productId === productId)
    
    if (existingItemIndex >= 0) {
      // Si el item ya existe, actualizar cantidad
      const existingItem = this.items[existingItemIndex]
      this.items[existingItemIndex] = new CartItem(
        productId,
        productName,
        price,
        existingItem.quantity + quantity
      )
    } else {
      // Si es un nuevo item, agregarlo
      this.items.push(new CartItem(productId, productName, price, quantity))
    }
  }

  /**
   * Remueve un item del carrito
   * @param productId ID del producto a remover
   */
  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId)
  }

  /**
   * Actualiza la cantidad de un item
   * @param productId ID del producto
   * @param quantity Nueva cantidad
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId)
      return
    }

    const itemIndex = this.items.findIndex(item => item.productId === productId)
    if (itemIndex >= 0) {
      const item = this.items[itemIndex]
      this.items[itemIndex] = new CartItem(
        item.productId,
        item.productName,
        item.price,
        quantity
      )
    }
  }

  /**
   * Calcula el total del carrito
   */
  calculateTotal(): Money {
    const total = this.items.reduce((sum, item) => {
      return sum + (item.price.amount * item.quantity)
    }, 0)

    return new Money(total, 'EUR')
  }

  /**
   * Limpia todos los items del carrito
   */
  clear(): void {
    this.items = []
  }

  /**
   * Obtiene la cantidad total de items
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Obtiene un item específico por ID de producto
   * @param productId ID del producto
   */
  getItem(productId: string): CartItem | undefined {
    return this.items.find(item => item.productId === productId)
  }

  /**
   * Verifica si un producto está en el carrito
   * @param productId ID del producto
   */
  hasItem(productId: string): boolean {
    return this.items.some(item => item.productId === productId)
  }
}
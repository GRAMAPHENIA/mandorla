import { CartId } from '../value-objects/cart-id'
import { CartItem } from '../value-objects/cart-item'
import { Money } from '../value-objects/money'
import { InvalidQuantityError, CartNotFoundError } from '../errors/cart-errors'

/**
 * Entidad de dominio para el carrito de compras
 * Contiene la lógica de negocio principal del carrito
 */
export class CartEntity {
  private constructor(
    private readonly _id: CartId,
    private _items: CartItem[] = [],
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  /**
   * Crea una nueva instancia de carrito
   */
  static create(id: CartId): CartEntity {
    return new CartEntity(id)
  }

  /**
   * Reconstruye un carrito desde datos persistidos
   */
  static fromPersistence(data: {
    id: string
    items: Array<{
      productId: string
      name: string
      price: number
      quantity: number
      image?: string
    }>
    createdAt: Date
    updatedAt: Date
  }): CartEntity {
    const cartId = CartId.create(data.id)
    const cartItems = data.items.map(item => 
      CartItem.create({
        productId: item.productId,
        name: item.name,
        price: Money.create(item.price),
        quantity: item.quantity,
        image: item.image
      })
    )

    return new CartEntity(cartId, cartItems, data.createdAt, data.updatedAt)
  }CartId.create(data.id)
    const cartItems = data.items.map(item => 
      CartItem.create({
        productId: item.productId,
        name: item.name,
        price: Money.create(item.price),
        quantity: item.quantity,
        image: item.image
      })
    )

    return new CartEntity(cartId, cartItems, data.createdAt, data.updatedAt)
  }

  /**
   * Agrega un item al carrito o incrementa la cantidad si ya existe
   */
  addItem(productId: string, name: string, price: Money, quantity: number = 1, image?: string): void {
    if (quantity <= 0) {
      throw new InvalidQuantityError(quantity)
    }

    const existingItemIndex = this._items.findIndex(item => 
      item.productId === productId
    )

    if (existingItemIndex >= 0) {
      // Si el item ya existe, incrementar la cantidad
      const existingItem = this._items[existingItemIndex]
      const newQuantity = existingItem.quantity + quantity
      this._items[existingItemIndex] = existingItem.updateQuantity(newQuantity)
    } else {
      // Si es un nuevo item, agregarlo al carrito
      const newItem = CartItem.create({
        productId,
        name,
        price,
        quantity,
        image
      })
      this._items.push(newItem)
    }

    this._updatedAt = new Date()
  }

  /**
   * Remueve un item completamente del carrito
   */
  removeItem(productId: string): void {
    const itemIndex = this._items.findIndex(item => item.productId === productId)
    
    if (itemIndex === -1) {
      throw new CartNotFoundError(`Item con ID ${productId} no encontrado en el carrito`)
    }

    this._items.splice(itemIndex, 1)
    this._updatedAt = new Date()
  }

  /**
   * Actualiza la cantidad de un item específico
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 0) {
      throw new InvalidQuantityError(quantity)
    }

    if (quantity === 0) {
      this.removeItem(productId)
      return
    }

    const itemIndex = this._items.findIndex(item => item.productId === productId)
    
    if (itemIndex === -1) {
      throw new CartNotFoundError(`Item con ID ${productId} no encontrado en el carrito`)
    }

    this._items[itemIndex] = this._items[itemIndex].updateQuantity(quantity)
    this._updatedAt = new Date()
  }

  /**
   * Calcula el total del carrito
   */
  calculateTotal(): Money {
    const total = this._items.reduce((sum, item) => {
      return sum + (item.price.value * item.quantity)
    }, 0)

    return Money.create(total)
  }

  /**
   * Calcula el número total de items en el carrito
   */
  getTotalItems(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * Limpia todos los items del carrito
   */
  clear(): void {
    this._items = []
    this._updatedAt = new Date()
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty(): boolean {
    return this._items.length === 0
  }

  /**
   * Obtiene un item específico por ID de producto
   */
  getItem(productId: string): CartItem | undefined {
    return this._items.find(item => item.productId === productId)
  }

  // Getters
  get id(): CartId {
    return this._id
  }

  get items(): readonly CartItem[] {
    return [...this._items]
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  /**
   * Convierte la entidad a un formato serializable para persistencia
   */
  toPersistence(): {
    id: string
    items: Array<{
      productId: string
      name: string
      price: number
      quantity: number
      image?: string
    }>
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this._id.value,
      items: this._items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price.value,
        quantity: item.quantity,
        image: item.image
      })),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }
}
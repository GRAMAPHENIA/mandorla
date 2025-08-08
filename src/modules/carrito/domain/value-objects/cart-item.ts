import { Money } from './money'

/**
 * Value Object para un item del carrito
 * Representa un producto específico con su cantidad en el carrito
 */
export class CartItem {
  private constructor(
    private readonly _productId: string,
    private readonly _name: string,
    private readonly _price: Money,
    private readonly _quantity: number,
    private readonly _image?: string
  ) {
    this.validate()
  }

  /**
   * Crea un nuevo CartItem
   */
  static create(data: {
    productId: string
    name: string
    price: Money
    quantity: number
    image?: string
  }): CartItem {
    return new CartItem(
      data.productId,
      data.name,
      data.price,
      data.quantity,
      data.image
    )
  }

  private validate(): void {
    if (!this._productId || this._productId.trim().length === 0) {
      throw new Error('El ID del producto es requerido')
    }

    if (!this._name || this._name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido')
    }

    if (this._quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a cero')
    }

    if (!Number.isInteger(this._quantity)) {
      throw new Error('La cantidad debe ser un número entero')
    }
  }

  /**
   * Crea una nueva instancia con cantidad actualizada
   */
  updateQuantity(newQuantity: number): CartItem {
    return new CartItem(
      this._productId,
      this._name,
      this._price,
      newQuantity,
      this._image
    )
  }

  /**
   * Calcula el subtotal para este item (precio × cantidad)
   */
  getSubtotal(): Money {
    return Money.create(this._price.value * this._quantity)
  }

  // Getters
  get productId(): string {
    return this._productId
  }

  get name(): string {
    return this._name
  }

  get price(): Money {
    return this._price
  }

  get quantity(): number {
    return this._quantity
  }

  get image(): string | undefined {
    return this._image
  }

  /**
   * Compara dos CartItem para verificar si representan el mismo producto
   */
  equals(other: CartItem): boolean {
    return this._productId === other._productId
  }

  /**
   * Convierte el CartItem a un formato serializable
   */
  toJSON(): {
    productId: string
    name: string
    price: number
    quantity: number
    image?: string
    subtotal: number
  } {
    return {
      productId: this._productId,
      name: this._name,
      price: this._price.value,
      quantity: this._quantity,
      image: this._image,
      subtotal: this.getSubtotal().value
    }
  }
}
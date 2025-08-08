import { Money } from '../../../productos/domain'

/**
 * Value Objects para el dominio del carrito
 */

export class CartId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del carrito no puede estar vacío')
    }
  }

  equals(other: CartId): boolean {
    return this.value === other.value
  }
}

export class CustomerId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del cliente no puede estar vacío')
    }
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value
  }
}

export class CartItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly price: Money,
    public readonly quantity: number
  ) {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a cero')
    }
    if (!productId || productId.trim().length === 0) {
      throw new Error('El ID del producto es requerido')
    }
    if (!productName || productName.trim().length === 0) {
      throw new Error('El nombre del producto es requerido')
    }
  }

  /**
   * Calcula el subtotal del item
   */
  getSubtotal(): Money {
    return new Money(this.price.amount * this.quantity, this.price.currency)
  }

  /**
   * Verifica si dos items son iguales
   */
  equals(other: CartItem): boolean {
    return this.productId === other.productId &&
           this.quantity === other.quantity &&
           this.price.equals(other.price)
  }

  /**
   * Crea una copia del item con nueva cantidad
   */
  withQuantity(newQuantity: number): CartItem {
    return new CartItem(this.productId, this.productName, this.price, newQuantity)
  }
}
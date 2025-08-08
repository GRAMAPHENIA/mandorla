import { Money } from '../../../productos/domain'

/**
 * Value Objects para el dominio de pedidos
 */

export class OrderId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del pedido no puede estar vacío')
    }
  }

  equals(other: OrderId): boolean {
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

export class OrderStatus {
  private static readonly VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

  constructor(public readonly value: string) {
    if (!OrderStatus.VALID_STATUSES.includes(value)) {
      throw new Error(`Estado de pedido inválido: ${value}`)
    }
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value
  }

  isPending(): boolean {
    return this.value === 'pending'
  }

  isCompleted(): boolean {
    return this.value === 'completed'
  }

  isCancelled(): boolean {
    return this.value === 'cancelled'
  }
}

export class OrderItem {
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

  equals(other: OrderItem): boolean {
    return this.productId === other.productId &&
           this.quantity === other.quantity &&
           this.price.equals(other.price)
  }
}
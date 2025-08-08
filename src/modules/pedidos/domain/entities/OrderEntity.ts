import { OrderId, OrderItem, OrderStatus, CustomerId } from '../value-objects'
import { Money } from '../../../productos/domain'

/**
 * Entidad de dominio para pedidos
 */
export class OrderEntity {
  constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
    public items: OrderItem[],
    public status: OrderStatus,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Calcula el total del pedido
   */
  calculateTotal(): Money {
    const total = this.items.reduce((sum, item) => {
      return sum + (item.price.amount * item.quantity)
    }, 0)

    return new Money(total, 'EUR')
  }

  /**
   * Actualiza el estado del pedido
   * @param newStatus Nuevo estado
   */
  updateStatus(newStatus: OrderStatus): void {
    this.status = newStatus
    this.updatedAt = new Date()
  }

  /**
   * Verifica si el pedido puede ser cancelado
   */
  canBeCancelled(): boolean {
    return this.status.value === 'pending' || this.status.value === 'confirmed'
  }

  /**
   * Cancela el pedido
   */
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('El pedido no puede ser cancelado en su estado actual')
    }
    this.updateStatus(new OrderStatus('cancelled'))
  }

  /**
   * Confirma el pedido
   */
  confirm(): void {
    if (this.status.value !== 'pending') {
      throw new Error('Solo se pueden confirmar pedidos pendientes')
    }
    this.updateStatus(new OrderStatus('confirmed'))
  }

  /**
   * Marca el pedido como completado
   */
  complete(): void {
    if (this.status.value !== 'confirmed') {
      throw new Error('Solo se pueden completar pedidos confirmados')
    }
    this.updateStatus(new OrderStatus('completed'))
  }

  /**
   * Obtiene la cantidad total de items
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }
}
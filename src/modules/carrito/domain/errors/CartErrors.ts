/**
 * Errores específicos del dominio del carrito
 */

export abstract class CartDomainError extends Error {
  abstract readonly code: string
  abstract readonly type: 'validation' | 'business' | 'not-found'

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class CartNotFoundError extends CartDomainError {
  readonly code = 'CART_NOT_FOUND'
  readonly type = 'not-found' as const

  constructor(cartId: string) {
    super(`Carrito con ID ${cartId} no encontrado`)
  }
}

export class InvalidQuantityError extends CartDomainError {
  readonly code = 'INVALID_QUANTITY'
  readonly type = 'validation' as const

  constructor(quantity: number) {
    super(`Cantidad inválida: ${quantity}. La cantidad debe ser mayor a 0`)
  }
}

export class ItemNotInCartError extends CartDomainError {
  readonly code = 'ITEM_NOT_IN_CART'
  readonly type = 'not-found' as const

  constructor(productId: string) {
    super(`El producto ${productId} no está en el carrito`)
  }
}

export class EmptyCartError extends CartDomainError {
  readonly code = 'EMPTY_CART'
  readonly type = 'business' as const

  constructor() {
    super('El carrito está vacío')
  }
}

export class CartLimitExceededError extends CartDomainError {
  readonly code = 'CART_LIMIT_EXCEEDED'
  readonly type = 'business' as const

  constructor(limit: number) {
    super(`Se ha excedido el límite de items en el carrito (${limit})`)
  }
}
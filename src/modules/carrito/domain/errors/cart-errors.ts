/**
 * Errores específicos del dominio del carrito
 * Extienden la clase base DomainError para manejo tipado de errores
 */

/**
 * Clase base para errores de dominio
 */
export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly type: 'validation' | 'business' | 'not-found'

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    
    // Mantiene el stack trace correcto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Error cuando se proporciona una cantidad inválida
 */
export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY'
  readonly type = 'validation' as const

  constructor(quantity: number) {
    super(`Cantidad inválida: ${quantity}. La cantidad debe ser un número entero mayor a 0`)
  }
}

/**
 * Error cuando no se encuentra un item en el carrito
 */
export class CartNotFoundError extends DomainError {
  readonly code = 'CART_ITEM_NOT_FOUND'
  readonly type = 'not-found' as const

  constructor(message: string = 'Item no encontrado en el carrito') {
    super(message)
  }
}

/**
 * Error cuando se intenta realizar una operación en un carrito vacío
 */
export class EmptyCartError extends DomainError {
  readonly code = 'EMPTY_CART'
  readonly type = 'business' as const

  constructor(message: string = 'No se puede realizar la operación en un carrito vacío') {
    super(message)
  }
}

/**
 * Error cuando se excede la cantidad máxima permitida para un item
 */
export class MaxQuantityExceededError extends DomainError {
  readonly code = 'MAX_QUANTITY_EXCEEDED'
  readonly type = 'business' as const

  constructor(maxQuantity: number, productName?: string) {
    const message = productName 
      ? `No podemos preparar más de ${maxQuantity} unidades de ${productName} por pedido`
      : `Se ha excedido la cantidad máxima permitida: ${maxQuantity}`
    super(message)
  }
}

/**
 * Error cuando un producto de panadería no está disponible
 */
export class ProductNotAvailableError extends DomainError {
  readonly code = 'PRODUCT_NOT_AVAILABLE'
  readonly type = 'business' as const

  constructor(productName: string, reason: 'sold-out' | 'seasonal' | 'preparation-time') {
    const messages = {
      'sold-out': `Lo sentimos, ${productName} se ha agotado por hoy`,
      'seasonal': `${productName} es un producto de temporada y no está disponible actualmente`,
      'preparation-time': `${productName} requiere tiempo de preparación adicional`
    }
    super(messages[reason])
  }
}

/**
 * Error cuando se intenta agregar productos con diferentes tiempos de entrega
 */
export class MixedDeliveryTimeError extends DomainError {
  readonly code = 'MIXED_DELIVERY_TIME'
  readonly type = 'business' as const

  constructor() {
    super('No se pueden mezclar productos frescos con productos que requieren horneado especial en el mismo pedido')
  }
}

/**
 * Error cuando el precio del producto es inválido
 */
export class InvalidPriceError extends DomainError {
  readonly code = 'INVALID_PRICE'
  readonly type = 'validation' as const

  constructor(price: number) {
    super(`Precio inválido: ${price}. El precio debe ser un número positivo`)
  }
}

/**
 * Error cuando el ID del producto es inválido
 */
export class InvalidProductIdError extends DomainError {
  readonly code = 'INVALID_PRODUCT_ID'
  readonly type = 'validation' as const

  constructor(productId: string) {
    super(`ID de producto inválido: ${productId}`)
  }
}

/**
 * Type guard para verificar si un error es un error de dominio
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}

/**
 * Type guard para verificar si un error es de validación
 */
export function isValidationError(error: unknown): error is DomainError & { type: 'validation' } {
  return isDomainError(error) && error.type === 'validation'
}

/**
 * Type guard para verificar si un error es de negocio
 */
export function isBusinessError(error: unknown): error is DomainError & { type: 'business' } {
  return isDomainError(error) && error.type === 'business'
}

/**
 * Type guard para verificar si un error es de "no encontrado"
 */
export function isNotFoundError(error: unknown): error is DomainError & { type: 'not-found' } {
  return isDomainError(error) && error.type === 'not-found'
}
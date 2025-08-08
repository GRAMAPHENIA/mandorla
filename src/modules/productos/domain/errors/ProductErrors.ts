/**
 * Errores específicos del dominio de productos
 */

export abstract class ProductDomainError extends Error {
  abstract readonly code: string
  abstract readonly type: 'validation' | 'business' | 'not-found'

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ProductNotFoundError extends ProductDomainError {
  readonly code = 'PRODUCT_NOT_FOUND'
  readonly type = 'not-found' as const

  constructor(productId: string) {
    super(`Producto con ID ${productId} no encontrado`)
  }
}

export class InvalidPriceError extends ProductDomainError {
  readonly code = 'INVALID_PRICE'
  readonly type = 'validation' as const

  constructor(price: number) {
    super(`Precio inválido: ${price}. El precio debe ser mayor a 0`)
  }
}

export class ProductUnavailableError extends ProductDomainError {
  readonly code = 'PRODUCT_UNAVAILABLE'
  readonly type = 'business' as const

  constructor(productId: string) {
    super(`El producto ${productId} no está disponible`)
  }
}

export class InvalidCategoryError extends ProductDomainError {
  readonly code = 'INVALID_CATEGORY'
  readonly type = 'validation' as const

  constructor(category: string) {
    super(`Categoría inválida: ${category}`)
  }
}
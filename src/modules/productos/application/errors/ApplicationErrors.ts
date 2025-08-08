/**
 * Errores específicos de la capa de aplicación
 */

export abstract class ProductApplicationError extends Error {
  abstract readonly code: string
  abstract readonly type: 'validation' | 'business' | 'not-found' | 'conflict'

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ProductServiceError extends ProductApplicationError {
  readonly code = 'PRODUCT_SERVICE_ERROR'
  readonly type = 'business'

  constructor(message: string, public readonly originalError?: Error) {
    super(`Error en el servicio de productos: ${message}`)
  }
}

export class InvalidSearchCriteriaError extends ProductApplicationError {
  readonly code = 'INVALID_SEARCH_CRITERIA'
  readonly type = 'validation'

  constructor(field: string, value: any) {
    super(`Criterio de búsqueda inválido para ${field}: ${value}`)
  }
}

export class ProductUpdateError extends ProductApplicationError {
  readonly code = 'PRODUCT_UPDATE_ERROR'
  readonly type = 'business'

  constructor(productId: string, reason: string) {
    super(`No se pudo actualizar el producto ${productId}: ${reason}`)
  }
}

export class RepositoryError extends ProductApplicationError {
  readonly code = 'REPOSITORY_ERROR'
  readonly type = 'business'

  constructor(operation: string, originalError?: Error) {
    super(`Error en repositorio durante operación: ${operation}`)
    this.originalError = originalError
  }

  public readonly originalError?: Error
}
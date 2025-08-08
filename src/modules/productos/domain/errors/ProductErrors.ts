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
  readonly type = 'not-found'

  constructor(productId: string) {
    super(`Producto con ID ${productId} no encontrado`)
  }
}

export class InvalidPriceError extends ProductDomainError {
  readonly code = 'INVALID_PRICE'
  readonly type = 'validation'

  constructor(price: number) {
    super(`Precio inválido: ${price}. El precio debe ser mayor a 0`)
  }
}

export class InvalidProductNameError extends ProductDomainError {
  readonly code = 'INVALID_PRODUCT_NAME'
  readonly type = 'validation'

  constructor(name: string) {
    super(`Nombre de producto inválido: "${name}". El nombre no puede estar vacío`)
  }
}

export class InvalidProductDescriptionError extends ProductDomainError {
  readonly code = 'INVALID_PRODUCT_DESCRIPTION'
  readonly type = 'validation'

  constructor() {
    super('La descripción del producto no puede estar vacía')
  }
}

export class ProductOutOfStockError extends ProductDomainError {
  readonly code = 'PRODUCT_OUT_OF_STOCK'
  readonly type = 'business'

  constructor(productId: string, productName: string) {
    super(`El producto "${productName}" (ID: ${productId}) no está disponible en stock`)
  }
}

export class InvalidIngredientError extends ProductDomainError {
  readonly code = 'INVALID_INGREDIENT'
  readonly type = 'validation'

  constructor(ingredient: string) {
    super(`Ingrediente inválido: "${ingredient}". Los ingredientes no pueden estar vacíos`)
  }
}

export class InvalidAllergenError extends ProductDomainError {
  readonly code = 'INVALID_ALLERGEN'
  readonly type = 'validation'

  constructor(allergen: string) {
    super(`Alérgeno inválido: "${allergen}". Los alérgenos no pueden estar vacíos`)
  }
}
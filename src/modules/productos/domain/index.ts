// Entidades
export { ProductEntity } from './entities/ProductEntity'

// Value Objects
export { ProductId } from './value-objects/ProductId'
export { Money } from './value-objects/Money'
export { ProductCategory, type ProductCategoryType } from './value-objects/ProductCategory'

// Errores de dominio
export {
  ProductDomainError,
  ProductNotFoundError,
  InvalidPriceError,
  InvalidProductNameError,
  InvalidProductDescriptionError,
  ProductOutOfStockError,
  InvalidIngredientError,
  InvalidAllergenError
} from './errors/ProductErrors'
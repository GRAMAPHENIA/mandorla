// Entidades
export { ProductEntity } from './entities/ProductEntity'

// Value Objects
export { ProductId, Money, ProductCategory, ProductAvailability } from './value-objects'

// Errores
export {
  ProductDomainError,
  ProductNotFoundError,
  InvalidPriceError,
  ProductUnavailableError,
  InvalidCategoryError
} from './errors/ProductErrors'

// Repositorios
export type { ProductRepository } from './repositories/ProductRepository'
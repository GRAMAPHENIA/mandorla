// Servicios
export { ProductService } from './services/ProductService'

// Interfaces
export { type IProductRepository } from './interfaces/IProductRepository'

// DTOs
export { type ProductSearchCriteria } from './dto/ProductSearchCriteria'
export { type ProductUpdateData } from './dto/ProductUpdateData'

// Errores de aplicación
export {
  ProductApplicationError,
  ProductServiceError,
  InvalidSearchCriteriaError,
  ProductUpdateError,
  RepositoryError
} from './errors/ApplicationErrors'
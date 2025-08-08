import { ProductCategoryType } from '../../domain/value-objects/ProductCategory'

/**
 * DTO para criterios de búsqueda de productos
 */
export interface ProductSearchCriteria {
  /**
   * Término de búsqueda por nombre
   */
  searchTerm?: string

  /**
   * Filtrar por categoría específica
   */
  category?: ProductCategoryType

  /**
   * Filtrar solo productos en stock
   */
  inStockOnly?: boolean

  /**
   * Filtrar solo productos destacados
   */
  featuredOnly?: boolean

  /**
   * Filtrar productos que contengan este ingrediente
   */
  withIngredient?: string

  /**
   * Filtrar productos que NO contengan este alérgeno
   */
  withoutAllergen?: string

  /**
   * Rango de precios mínimo
   */
  minPrice?: number

  /**
   * Rango de precios máximo
   */
  maxPrice?: number

  /**
   * Ordenamiento de resultados
   */
  sortBy?: 'name' | 'price' | 'category' | 'featured'

  /**
   * Dirección del ordenamiento
   */
  sortOrder?: 'asc' | 'desc'

  /**
   * Límite de resultados
   */
  limit?: number

  /**
   * Offset para paginación
   */
  offset?: number
}
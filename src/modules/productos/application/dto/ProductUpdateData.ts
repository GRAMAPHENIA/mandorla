import { ProductCategoryType } from '../../domain/value-objects/ProductCategory'

/**
 * DTO para datos de actualización de producto
 */
export interface ProductUpdateData {
  /**
   * Nuevo nombre del producto
   */
  name?: string

  /**
   * Nueva descripción del producto
   */
  description?: string

  /**
   * Nuevo precio del producto
   */
  price?: number

  /**
   * Nuevo precio original (para descuentos)
   */
  originalPrice?: number

  /**
   * Nueva imagen del producto
   */
  image?: string

  /**
   * Nueva categoría del producto
   */
  category?: ProductCategoryType

  /**
   * Cambiar estado destacado
   */
  featured?: boolean

  /**
   * Cambiar disponibilidad en stock
   */
  inStock?: boolean

  /**
   * Nuevos ingredientes (reemplaza la lista completa)
   */
  ingredients?: string[]

  /**
   * Nuevos alérgenos (reemplaza la lista completa)
   */
  allergens?: string[]
}
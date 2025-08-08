import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'

/**
 * Interface del repositorio de productos siguiendo el principio de inversión de dependencias
 * Define el contrato que debe implementar cualquier repositorio concreto
 */
export interface IProductRepository {
  /**
   * Obtiene todos los productos disponibles
   */
  findAll(): Promise<ProductEntity[]>

  /**
   * Busca un producto por su ID
   * @param id - ID del producto a buscar
   * @returns El producto encontrado o null si no existe
   */
  findById(id: ProductId): Promise<ProductEntity | null>

  /**
   * Busca productos por categoría
   * @param category - Categoría de productos a buscar
   */
  findByCategory(category: ProductCategory): Promise<ProductEntity[]>

  /**
   * Busca productos que estén destacados
   */
  findFeatured(): Promise<ProductEntity[]>

  /**
   * Busca productos disponibles en stock
   */
  findInStock(): Promise<ProductEntity[]>

  /**
   * Busca productos por nombre (búsqueda parcial)
   * @param searchTerm - Término de búsqueda
   */
  searchByName(searchTerm: string): Promise<ProductEntity[]>

  /**
   * Busca productos que contengan un ingrediente específico
   * @param ingredient - Ingrediente a buscar
   */
  findByIngredient(ingredient: string): Promise<ProductEntity[]>

  /**
   * Busca productos que NO contengan un alérgeno específico
   * @param allergen - Alérgeno a evitar
   */
  findWithoutAllergen(allergen: string): Promise<ProductEntity[]>

  /**
   * Guarda un producto (crear o actualizar)
   * @param product - Producto a guardar
   */
  save(product: ProductEntity): Promise<void>

  /**
   * Elimina un producto por su ID
   * @param id - ID del producto a eliminar
   */
  delete(id: ProductId): Promise<void>

  /**
   * Verifica si existe un producto con el ID dado
   * @param id - ID del producto a verificar
   */
  exists(id: ProductId): Promise<boolean>
}
import { ProductEntity } from '../entities/ProductEntity'
import { ProductId } from '../value-objects'

/**
 * Interface del repositorio de productos
 * Define el contrato para la persistencia de productos
 */
export interface ProductRepository {
  /**
   * Obtiene todos los productos
   */
  findAll(): Promise<ProductEntity[]>

  /**
   * Busca un producto por su ID
   * @param id ID del producto
   */
  findById(id: ProductId): Promise<ProductEntity | null>

  /**
   * Busca productos por categoría
   * @param category Nombre de la categoría
   */
  findByCategory(category: string): Promise<ProductEntity[]>

  /**
   * Busca productos por texto
   * @param searchTerm Término de búsqueda
   */
  search(searchTerm: string): Promise<ProductEntity[]>

  /**
   * Guarda un producto
   * @param product Producto a guardar
   */
  save(product: ProductEntity): Promise<void>

  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   */
  delete(id: ProductId): Promise<void>

  /**
   * Verifica si un producto existe
   * @param id ID del producto
   */
  exists(id: ProductId): Promise<boolean>
}
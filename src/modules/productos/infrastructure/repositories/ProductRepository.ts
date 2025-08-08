import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'
import { IProductRepository } from '../../application/interfaces/IProductRepository'
import { ProductMapper } from '../mappers/ProductMapper'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'
import { MockDataAdapter } from '../adapters/MockDataAdapter'
import { mockProducts } from '../../../../data/mock-products'

/**
 * Implementación concreta del repositorio de productos
 * Utiliza adaptadores para diferentes fuentes de datos
 */
export class ProductRepository implements IProductRepository {
  private localStorageAdapter: LocalStorageAdapter
  private mockDataAdapter: MockDataAdapter

  constructor() {
    this.localStorageAdapter = new LocalStorageAdapter('mandorla_products')
    this.mockDataAdapter = new MockDataAdapter(mockProducts)
    
    // Inicializar localStorage con datos mock si está vacío
    this.initializeStorage()
  }

  /**
   * Inicializa el almacenamiento local con datos por defecto
   */
  private async initializeStorage(): Promise<void> {
    try {
      if (this.localStorageAdapter.isAvailable()) {
        await this.localStorageAdapter.initializeWithDefaults(mockProducts)
      }
    } catch (error) {
      console.warn('No se pudo inicializar el almacenamiento local:', error)
    }
  }

  /**
   * Obtiene todos los productos
   * Prioriza localStorage, fallback a datos mock
   */
  async findAll(): Promise<ProductEntity[]> {
    try {
      let products
      
      if (this.localStorageAdapter.isAvailable()) {
        products = await this.localStorageAdapter.getAll()
        
        // Si localStorage está vacío, usar datos mock
        if (products.length === 0) {
          products = await this.mockDataAdapter.getAll()
        }
      } else {
        // Fallback a datos mock si localStorage no está disponible
        products = await this.mockDataAdapter.getAll()
      }

      return ProductMapper.toDomainList(products)
    } catch (error) {
      console.error('Error al obtener todos los productos:', error)
      throw new Error('No se pudieron obtener los productos')
    }
  }

  /**
   * Busca un producto por ID
   */
  async findById(id: ProductId): Promise<ProductEntity | null> {
    try {
      let product = null

      if (this.localStorageAdapter.isAvailable()) {
        product = await this.localStorageAdapter.getById(id.value)
        
        // Si no se encuentra en localStorage, no buscar en mock data
        // porque localStorage es la fuente de verdad una vez inicializado
        return product ? ProductMapper.toDomain(product) : null
      }

      // Solo usar datos mock si localStorage no está disponible
      product = await this.mockDataAdapter.getById(id.value)
      return product ? ProductMapper.toDomain(product) : null
    } catch (error) {
      console.error('Error al buscar producto por ID:', error)
      throw new Error(`No se pudo obtener el producto con ID: ${id.value}`)
    }
  }

  /**
   * Busca productos por categoría
   */
  async findByCategory(category: ProductCategory): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      return allProducts.filter(product => product.category.equals(category))
    } catch (error) {
      console.error('Error al buscar productos por categoría:', error)
      throw new Error(`No se pudieron obtener productos de la categoría: ${category.displayName}`)
    }
  }

  /**
   * Busca productos destacados
   */
  async findFeatured(): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      return allProducts.filter(product => product.featured)
    } catch (error) {
      console.error('Error al buscar productos destacados:', error)
      throw new Error('No se pudieron obtener los productos destacados')
    }
  }

  /**
   * Busca productos en stock
   */
  async findInStock(): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      return allProducts.filter(product => product.inStock)
    } catch (error) {
      console.error('Error al buscar productos en stock:', error)
      throw new Error('No se pudieron obtener los productos en stock')
    }
  }

  /**
   * Busca productos por nombre
   */
  async searchByName(searchTerm: string): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      const term = searchTerm.toLowerCase()
      
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error al buscar productos por nombre:', error)
      throw new Error(`No se pudieron buscar productos con el término: ${searchTerm}`)
    }
  }

  /**
   * Busca productos por ingrediente
   */
  async findByIngredient(ingredient: string): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      return allProducts.filter(product => product.containsIngredient(ingredient))
    } catch (error) {
      console.error('Error al buscar productos por ingrediente:', error)
      throw new Error(`No se pudieron buscar productos con el ingrediente: ${ingredient}`)
    }
  }

  /**
   * Busca productos sin un alérgeno específico
   */
  async findWithoutAllergen(allergen: string): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.findAll()
      return allProducts.filter(product => !product.containsAllergen(allergen))
    } catch (error) {
      console.error('Error al buscar productos sin alérgeno:', error)
      throw new Error(`No se pudieron buscar productos sin el alérgeno: ${allergen}`)
    }
  }

  /**
   * Guarda un producto
   */
  async save(product: ProductEntity): Promise<void> {
    try {
      const productDTO = ProductMapper.toDTO(product)
      
      if (this.localStorageAdapter.isAvailable()) {
        await this.localStorageAdapter.save(productDTO)
      } else {
        // Fallback a mock data adapter (solo en memoria)
        await this.mockDataAdapter.save(productDTO)
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      throw new Error(`No se pudo guardar el producto: ${product.name}`)
    }
  }

  /**
   * Elimina un producto
   */
  async delete(id: ProductId): Promise<void> {
    try {
      if (this.localStorageAdapter.isAvailable()) {
        await this.localStorageAdapter.delete(id.value)
      } else {
        await this.mockDataAdapter.delete(id.value)
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      throw new Error(`No se pudo eliminar el producto con ID: ${id.value}`)
    }
  }

  /**
   * Verifica si existe un producto
   */
  async exists(id: ProductId): Promise<boolean> {
    try {
      if (this.localStorageAdapter.isAvailable()) {
        return await this.localStorageAdapter.exists(id.value)
      }

      // Solo verificar en datos mock si localStorage no está disponible
      return await this.mockDataAdapter.exists(id.value)
    } catch (error) {
      console.error('Error al verificar existencia de producto:', error)
      return false
    }
  }

  /**
   * Métodos adicionales para gestión del repositorio
   */

  /**
   * Sincroniza datos entre localStorage y mock data
   */
  async syncData(): Promise<void> {
    try {
      if (!this.localStorageAdapter.isAvailable()) {
        return
      }

      const localProducts = await this.localStorageAdapter.getAll()
      const mockProducts = await this.mockDataAdapter.getAll()

      // Si localStorage está vacío, cargar desde mock
      if (localProducts.length === 0 && mockProducts.length > 0) {
        await this.localStorageAdapter.saveAll(mockProducts)
      }
    } catch (error) {
      console.error('Error al sincronizar datos:', error)
    }
  }

  /**
   * Limpia todos los datos del repositorio
   */
  async clearAll(): Promise<void> {
    try {
      if (this.localStorageAdapter.isAvailable()) {
        await this.localStorageAdapter.clear()
      }
      this.mockDataAdapter.clearMockData()
    } catch (error) {
      console.error('Error al limpiar datos del repositorio:', error)
      throw new Error('No se pudieron limpiar los datos del repositorio')
    }
  }

  /**
   * Obtiene estadísticas del repositorio
   */
  async getStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    featured: number
    inStock: number
    withDiscounts: number
  }> {
    try {
      const allProducts = await this.findAll()
      
      const stats = {
        total: allProducts.length,
        byCategory: {} as Record<string, number>,
        featured: 0,
        inStock: 0,
        withDiscounts: 0
      }

      allProducts.forEach(product => {
        // Contar por categoría
        const categoryName = product.category.value
        stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + 1
        
        // Contar destacados
        if (product.featured) {
          stats.featured++
        }
        
        // Contar en stock
        if (product.inStock) {
          stats.inStock++
        }
        
        // Contar con descuentos
        if (product.hasDiscount()) {
          stats.withDiscounts++
        }
      })

      return stats
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw new Error('No se pudieron obtener las estadísticas del repositorio')
    }
  }

  /**
   * Resetea el repositorio a los datos por defecto
   */
  async resetToDefaults(): Promise<void> {
    try {
      await this.clearAll()
      if (this.localStorageAdapter.isAvailable()) {
        await this.localStorageAdapter.initializeWithDefaults(mockProducts)
      }
      this.mockDataAdapter.setMockData(mockProducts)
    } catch (error) {
      console.error('Error al resetear repositorio:', error)
      throw new Error('No se pudo resetear el repositorio a los valores por defecto')
    }
  }
}
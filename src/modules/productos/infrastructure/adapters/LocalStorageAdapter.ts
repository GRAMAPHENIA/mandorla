import { Product } from '@/types/product'

/**
 * Adaptador para almacenamiento local usando localStorage
 * Proporciona una interfaz consistente para persistencia local
 */
export class LocalStorageAdapter {
  private readonly storageKey: string

  constructor(storageKey: string = 'mandorla_products') {
    this.storageKey = storageKey
  }

  /**
   * Obtiene todos los productos del localStorage
   */
  async getAll(): Promise<Product[]> {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering - retornar array vacío
        return []
      }

      const data = localStorage.getItem(this.storageKey)
      if (!data) {
        return []
      }

      const products = JSON.parse(data)
      return Array.isArray(products) ? products : []
    } catch (error) {
      console.error('Error al obtener productos del localStorage:', error)
      return []
    }
  }

  /**
   * Guarda todos los productos en localStorage
   * @param products - Array de productos a guardar
   */
  async saveAll(products: Product[]): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering - no hacer nada
        return
      }

      localStorage.setItem(this.storageKey, JSON.stringify(products))
    } catch (error) {
      console.error('Error al guardar productos en localStorage:', error)
      throw new Error('No se pudieron guardar los productos en el almacenamiento local')
    }
  }

  /**
   * Obtiene un producto específico por ID
   * @param id - ID del producto
   */
  async getById(id: string): Promise<Product | null> {
    const products = await this.getAll()
    return products.find(p => p.id === id) || null
  }

  /**
   * Guarda o actualiza un producto específico
   * @param product - Producto a guardar
   */
  async save(product: Product): Promise<void> {
    const products = await this.getAll()
    const existingIndex = products.findIndex(p => p.id === product.id)

    if (existingIndex >= 0) {
      products[existingIndex] = product
    } else {
      products.push(product)
    }

    await this.saveAll(products)
  }

  /**
   * Elimina un producto por ID
   * @param id - ID del producto a eliminar
   */
  async delete(id: string): Promise<void> {
    const products = await this.getAll()
    const filteredProducts = products.filter(p => p.id !== id)
    await this.saveAll(filteredProducts)
  }

  /**
   * Verifica si existe un producto con el ID dado
   * @param id - ID del producto
   */
  async exists(id: string): Promise<boolean> {
    const products = await this.getAll()
    return products.some(p => p.id === id)
  }

  /**
   * Limpia todos los productos del localStorage
   */
  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return
      }

      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Error al limpiar productos del localStorage:', error)
      throw new Error('No se pudo limpiar el almacenamiento local')
    }
  }

  /**
   * Inicializa el localStorage con productos por defecto si está vacío
   * @param defaultProducts - Productos por defecto
   */
  async initializeWithDefaults(defaultProducts: Product[]): Promise<void> {
    const existingProducts = await this.getAll()
    
    if (existingProducts.length === 0) {
      await this.saveAll(defaultProducts)
    }
  }

  /**
   * Obtiene el tamaño actual del almacenamiento en bytes (aproximado)
   */
  getStorageSize(): number {
    try {
      if (typeof window === 'undefined') {
        return 0
      }

      const data = localStorage.getItem(this.storageKey)
      return data ? new Blob([data]).size : 0
    } catch (error) {
      console.error('Error al calcular el tamaño del almacenamiento:', error)
      return 0
    }
  }

  /**
   * Verifica si el localStorage está disponible
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const testKey = '__localStorage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }
}
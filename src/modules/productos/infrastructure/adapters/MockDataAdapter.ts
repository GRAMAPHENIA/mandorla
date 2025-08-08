import { Product } from '@/types/product'

/**
 * Adaptador para datos mock/estáticos
 * Simula una fuente de datos externa para desarrollo y testing
 */
export class MockDataAdapter {
  private mockProducts: Product[]

  constructor(mockProducts: Product[] = []) {
    this.mockProducts = [...mockProducts]
  }

  /**
   * Obtiene todos los productos mock
   */
  async getAll(): Promise<Product[]> {
    // Simular latencia de red
    await this.simulateDelay()
    return [...this.mockProducts]
  }

  /**
   * Obtiene un producto por ID
   * @param id - ID del producto
   */
  async getById(id: string): Promise<Product | null> {
    await this.simulateDelay()
    return this.mockProducts.find(p => p.id === id) || null
  }

  /**
   * Obtiene productos por categoría
   * @param category - Categoría de productos
   */
  async getByCategory(category: string): Promise<Product[]> {
    await this.simulateDelay()
    return this.mockProducts.filter(p => p.category === category)
  }

  /**
   * Obtiene productos destacados
   */
  async getFeatured(): Promise<Product[]> {
    await this.simulateDelay()
    return this.mockProducts.filter(p => p.featured)
  }

  /**
   * Obtiene productos en stock
   */
  async getInStock(): Promise<Product[]> {
    await this.simulateDelay()
    return this.mockProducts.filter(p => p.inStock)
  }

  /**
   * Busca productos por nombre
   * @param searchTerm - Término de búsqueda
   */
  async searchByName(searchTerm: string): Promise<Product[]> {
    await this.simulateDelay()
    const term = searchTerm.toLowerCase()
    return this.mockProducts.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    )
  }

  /**
   * Busca productos por ingrediente
   * @param ingredient - Ingrediente a buscar
   */
  async getByIngredient(ingredient: string): Promise<Product[]> {
    await this.simulateDelay()
    const ingredientLower = ingredient.toLowerCase()
    return this.mockProducts.filter(p => 
      p.ingredients?.some(ing => ing.toLowerCase().includes(ingredientLower))
    )
  }

  /**
   * Busca productos sin un alérgeno específico
   * @param allergen - Alérgeno a evitar
   */
  async getWithoutAllergen(allergen: string): Promise<Product[]> {
    await this.simulateDelay()
    const allergenLower = allergen.toLowerCase()
    return this.mockProducts.filter(p => 
      !p.allergens?.some(all => all.toLowerCase().includes(allergenLower))
    )
  }

  /**
   * Simula guardar un producto (solo en memoria)
   * @param product - Producto a guardar
   */
  async save(product: Product): Promise<void> {
    await this.simulateDelay()
    
    const existingIndex = this.mockProducts.findIndex(p => p.id === product.id)
    if (existingIndex >= 0) {
      this.mockProducts[existingIndex] = { ...product }
    } else {
      this.mockProducts.push({ ...product })
    }
  }

  /**
   * Simula eliminar un producto
   * @param id - ID del producto a eliminar
   */
  async delete(id: string): Promise<void> {
    await this.simulateDelay()
    this.mockProducts = this.mockProducts.filter(p => p.id !== id)
  }

  /**
   * Verifica si existe un producto
   * @param id - ID del producto
   */
  async exists(id: string): Promise<boolean> {
    await this.simulateDelay()
    return this.mockProducts.some(p => p.id === id)
  }

  /**
   * Actualiza los datos mock (útil para testing)
   * @param products - Nuevos productos mock
   */
  setMockData(products: Product[]): void {
    this.mockProducts = [...products]
  }

  /**
   * Agrega productos a los datos mock existentes
   * @param products - Productos a agregar
   */
  addMockData(products: Product[]): void {
    this.mockProducts.push(...products)
  }

  /**
   * Limpia todos los datos mock
   */
  clearMockData(): void {
    this.mockProducts = []
  }

  /**
   * Obtiene estadísticas de los datos mock
   */
  getStats(): {
    total: number
    byCategory: Record<string, number>
    featured: number
    inStock: number
    withDiscounts: number
  } {
    const stats = {
      total: this.mockProducts.length,
      byCategory: {} as Record<string, number>,
      featured: 0,
      inStock: 0,
      withDiscounts: 0
    }

    this.mockProducts.forEach(product => {
      // Contar por categoría
      stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1
      
      // Contar destacados
      if (product.featured) {
        stats.featured++
      }
      
      // Contar en stock
      if (product.inStock) {
        stats.inStock++
      }
      
      // Contar con descuentos
      if (product.originalPrice && product.originalPrice > product.price) {
        stats.withDiscounts++
      }
    })

    return stats
  }

  /**
   * Simula latencia de red para hacer más realista la simulación
   * @param minMs - Latencia mínima en ms
   * @param maxMs - Latencia máxima en ms
   */
  private async simulateDelay(minMs: number = 50, maxMs: number = 200): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Simula errores de red ocasionales (útil para testing de manejo de errores)
   * @param errorRate - Tasa de error (0-1)
   * @param errorMessage - Mensaje de error personalizado
   */
  private simulateNetworkError(errorRate: number = 0.1, errorMessage: string = 'Error de red simulado'): void {
    if (Math.random() < errorRate) {
      throw new Error(errorMessage)
    }
  }
}
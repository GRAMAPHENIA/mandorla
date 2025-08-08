import { ProductEntity, ProductId, ProductRepository } from '../../domain'

/**
 * Implementación en memoria del repositorio de productos
 * Para desarrollo y testing
 */
export class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, ProductEntity> = new Map()

  constructor(initialProducts: ProductEntity[] = []) {
    initialProducts.forEach(product => {
      this.products.set(product.id.value, product)
    })
  }

  async findAll(): Promise<ProductEntity[]> {
    return Array.from(this.products.values())
  }

  async findById(id: ProductId): Promise<ProductEntity | null> {
    return this.products.get(id.value) || null
  }

  async findByCategory(category: string): Promise<ProductEntity[]> {
    return Array.from(this.products.values()).filter(
      product => product.category.name.toLowerCase() === category.toLowerCase()
    )
  }

  async search(searchTerm: string): Promise<ProductEntity[]> {
    const term = searchTerm.toLowerCase()
    return Array.from(this.products.values()).filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term) ||
      product.ingredients.some(ingredient => ingredient.toLowerCase().includes(term))
    )
  }

  async save(product: ProductEntity): Promise<void> {
    this.products.set(product.id.value, product)
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.value)
  }

  async exists(id: ProductId): Promise<boolean> {
    return this.products.has(id.value)
  }

  // Método auxiliar para testing
  clear(): void {
    this.products.clear()
  }

  // Método auxiliar para obtener el tamaño
  size(): number {
    return this.products.size
  }
}
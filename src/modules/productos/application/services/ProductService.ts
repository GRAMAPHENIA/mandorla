import { ProductEntity, ProductId, ProductRepository, ProductNotFoundError } from '../../domain'

/**
 * Criterios de búsqueda para productos
 */
export interface SearchCriteria {
  term?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  available?: boolean
}

/**
 * Datos para actualizar un producto
 */
export interface ProductUpdates {
  name?: string
  description?: string
  price?: number
  category?: string
  available?: boolean
  ingredients?: string[]
  allergens?: string[]
  imageUrl?: string
}

/**
 * Servicio de aplicación para productos
 * Contiene los casos de uso relacionados con productos
 */
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Obtiene todos los productos disponibles
   */
  async getAllProducts(): Promise<ProductEntity[]> {
    return await this.productRepository.findAll()
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto
   */
  async getProductById(id: string): Promise<ProductEntity> {
    const productId = new ProductId(id)
    const product = await this.productRepository.findById(productId)
    
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    
    return product
  }

  /**
   * Busca productos según criterios específicos
   * @param criteria Criterios de búsqueda
   */
  async searchProducts(criteria: SearchCriteria): Promise<ProductEntity[]> {
    let products: ProductEntity[]

    if (criteria.term) {
      products = await this.productRepository.search(criteria.term)
    } else if (criteria.category) {
      products = await this.productRepository.findByCategory(criteria.category)
    } else {
      products = await this.productRepository.findAll()
    }

    // Aplicar filtros adicionales
    return products.filter(product => {
      if (criteria.available !== undefined && product.isAvailable() !== criteria.available) {
        return false
      }
      
      if (criteria.minPrice !== undefined && product.price.amount < criteria.minPrice) {
        return false
      }
      
      if (criteria.maxPrice !== undefined && product.price.amount > criteria.maxPrice) {
        return false
      }
      
      return true
    })
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto
   * @param updates Datos a actualizar
   */
  async updateProduct(id: string, updates: ProductUpdates): Promise<void> {
    const productId = new ProductId(id)
    const product = await this.productRepository.findById(productId)
    
    if (!product) {
      throw new ProductNotFoundError(id)
    }

    // Aplicar actualizaciones
    if (updates.name !== undefined) {
      product.name = updates.name
    }
    
    if (updates.description !== undefined) {
      product.description = updates.description
    }
    
    if (updates.price !== undefined) {
      product.updatePrice({ amount: updates.price, currency: 'EUR' } as any)
    }
    
    if (updates.available !== undefined) {
      product.changeAvailability(updates.available)
    }
    
    if (updates.ingredients !== undefined) {
      product.ingredients = updates.ingredients
    }
    
    if (updates.allergens !== undefined) {
      product.allergens = updates.allergens
    }
    
    if (updates.imageUrl !== undefined) {
      product.imageUrl = updates.imageUrl
    }

    await this.productRepository.save(product)
  }

  /**
   * Obtiene productos por categoría
   * @param category Nombre de la categoría
   */
  async getProductsByCategory(category: string): Promise<ProductEntity[]> {
    return await this.productRepository.findByCategory(category)
  }

  /**
   * Verifica si un producto existe y está disponible
   * @param id ID del producto
   */
  async isProductAvailable(id: string): Promise<boolean> {
    try {
      const product = await this.getProductById(id)
      return product.isAvailable()
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        return false
      }
      throw error
    }
  }
}
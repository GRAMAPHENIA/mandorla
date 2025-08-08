import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { Money } from '../../domain/value-objects/Money'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'
import { ProductNotFoundError } from '../../domain/errors/ProductErrors'
import { IProductRepository } from '../interfaces/IProductRepository'
import { ProductSearchCriteria } from '../dto/ProductSearchCriteria'
import { ProductUpdateData } from '../dto/ProductUpdateData'
import {
  ProductServiceError,
  InvalidSearchCriteriaError,
  ProductUpdateError,
  RepositoryError
} from '../errors/ApplicationErrors'

/**
 * Servicio de aplicación para productos
 * Implementa los casos de uso del dominio de productos
 */
export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Obtiene todos los productos disponibles
   */
  async getAllProducts(): Promise<ProductEntity[]> {
    try {
      return await this.productRepository.findAll()
    } catch (error) {
      throw new RepositoryError('obtener todos los productos', error as Error)
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param productId - ID del producto a buscar
   * @throws ProductNotFoundError si el producto no existe
   */
  async getProductById(productId: string): Promise<ProductEntity> {
    try {
      const id = new ProductId(productId)
      const product = await this.productRepository.findById(id)
      
      if (!product) {
        throw new ProductNotFoundError(productId)
      }
      
      return product
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error
      }
      throw new RepositoryError('obtener producto por ID', error as Error)
    }
  }

  /**
   * Busca productos según criterios específicos
   * @param criteria - Criterios de búsqueda
   */
  async searchProducts(criteria: ProductSearchCriteria): Promise<ProductEntity[]> {
    try {
      this.validateSearchCriteria(criteria)
      
      let products = await this.productRepository.findAll()
      
      // Aplicar filtros
      products = this.applyFilters(products, criteria)
      
      // Aplicar ordenamiento
      products = this.applySorting(products, criteria)
      
      // Aplicar paginación
      products = this.applyPagination(products, criteria)
      
      return products
    } catch (error) {
      if (error instanceof InvalidSearchCriteriaError) {
        throw error
      }
      throw new ProductServiceError('Error al buscar productos', error as Error)
    }
  }

  /**
   * Obtiene productos por categoría
   * @param categoryValue - Valor de la categoría
   */
  async getProductsByCategory(categoryValue: string): Promise<ProductEntity[]> {
    try {
      const category = ProductCategory.fromString(categoryValue)
      return await this.productRepository.findByCategory(category)
    } catch (error) {
      throw new RepositoryError('obtener productos por categoría', error as Error)
    }
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(): Promise<ProductEntity[]> {
    try {
      return await this.productRepository.findFeatured()
    } catch (error) {
      throw new RepositoryError('obtener productos destacados', error as Error)
    }
  }

  /**
   * Obtiene productos disponibles en stock
   */
  async getInStockProducts(): Promise<ProductEntity[]> {
    try {
      return await this.productRepository.findInStock()
    } catch (error) {
      throw new RepositoryError('obtener productos en stock', error as Error)
    }
  }

  /**
   * Busca productos por ingrediente
   * @param ingredient - Ingrediente a buscar
   */
  async getProductsByIngredient(ingredient: string): Promise<ProductEntity[]> {
    if (!ingredient || ingredient.trim().length === 0) {
      throw new InvalidSearchCriteriaError('ingredient', ingredient)
    }

    try {
      return await this.productRepository.findByIngredient(ingredient.trim())
    } catch (error) {
      throw new RepositoryError('buscar productos por ingrediente', error as Error)
    }
  }

  /**
   * Busca productos sin un alérgeno específico
   * @param allergen - Alérgeno a evitar
   */
  async getProductsWithoutAllergen(allergen: string): Promise<ProductEntity[]> {
    if (!allergen || allergen.trim().length === 0) {
      throw new InvalidSearchCriteriaError('allergen', allergen)
    }

    try {
      return await this.productRepository.findWithoutAllergen(allergen.trim())
    } catch (error) {
      throw new RepositoryError('buscar productos sin alérgeno', error as Error)
    }
  }

  /**
   * Actualiza un producto existente
   * @param productId - ID del producto a actualizar
   * @param updateData - Datos de actualización
   */
  async updateProduct(productId: string, updateData: ProductUpdateData): Promise<ProductEntity> {
    try {
      const id = new ProductId(productId)
      const existingProduct = await this.productRepository.findById(id)
      
      if (!existingProduct) {
        throw new ProductNotFoundError(productId)
      }

      // Aplicar actualizaciones
      this.applyUpdates(existingProduct, updateData)
      
      // Guardar producto actualizado
      await this.productRepository.save(existingProduct)
      
      return existingProduct
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error
      }
      throw new ProductUpdateError(productId, (error as Error).message)
    }
  }

  /**
   * Verifica si un producto está disponible para compra
   * @param productId - ID del producto a verificar
   */
  async checkProductAvailability(productId: string): Promise<boolean> {
    try {
      const product = await this.getProductById(productId)
      return product.isAvailable()
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        return false
      }
      throw error
    }
  }

  /**
   * Obtiene productos con descuento
   */
  async getDiscountedProducts(): Promise<ProductEntity[]> {
    try {
      const allProducts = await this.productRepository.findAll()
      return allProducts.filter(product => product.hasDiscount())
    } catch (error) {
      throw new RepositoryError('obtener productos con descuento', error as Error)
    }
  }

  // Métodos privados para lógica interna

  private validateSearchCriteria(criteria: ProductSearchCriteria): void {
    if (criteria.minPrice !== undefined && criteria.minPrice < 0) {
      throw new InvalidSearchCriteriaError('minPrice', criteria.minPrice)
    }

    if (criteria.maxPrice !== undefined && criteria.maxPrice < 0) {
      throw new InvalidSearchCriteriaError('maxPrice', criteria.maxPrice)
    }

    if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined && criteria.minPrice > criteria.maxPrice) {
      throw new InvalidSearchCriteriaError('priceRange', `minPrice (${criteria.minPrice}) mayor que maxPrice (${criteria.maxPrice})`)
    }

    if (criteria.limit !== undefined && criteria.limit <= 0) {
      throw new InvalidSearchCriteriaError('limit', criteria.limit)
    }

    if (criteria.offset !== undefined && criteria.offset < 0) {
      throw new InvalidSearchCriteriaError('offset', criteria.offset)
    }
  }

  private applyFilters(products: ProductEntity[], criteria: ProductSearchCriteria): ProductEntity[] {
    let filtered = products

    if (criteria.searchTerm) {
      const searchTerm = criteria.searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    }

    if (criteria.category) {
      filtered = filtered.filter(product => product.category.value === criteria.category)
    }

    if (criteria.inStockOnly) {
      filtered = filtered.filter(product => product.inStock)
    }

    if (criteria.featuredOnly) {
      filtered = filtered.filter(product => product.featured)
    }

    if (criteria.withIngredient) {
      filtered = filtered.filter(product => product.containsIngredient(criteria.withIngredient!))
    }

    if (criteria.withoutAllergen) {
      filtered = filtered.filter(product => !product.containsAllergen(criteria.withoutAllergen!))
    }

    if (criteria.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price.amount >= criteria.minPrice!)
    }

    if (criteria.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price.amount <= criteria.maxPrice!)
    }

    return filtered
  }

  private applySorting(products: ProductEntity[], criteria: ProductSearchCriteria): ProductEntity[] {
    if (!criteria.sortBy) {
      return products
    }

    const sortOrder = criteria.sortOrder || 'asc'
    const multiplier = sortOrder === 'asc' ? 1 : -1

    return products.sort((a, b) => {
      switch (criteria.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier
        case 'price':
          return (a.price.amount - b.price.amount) * multiplier
        case 'category':
          return a.category.displayName.localeCompare(b.category.displayName) * multiplier
        case 'featured':
          return (Number(b.featured) - Number(a.featured)) * multiplier
        default:
          return 0
      }
    })
  }

  private applyPagination(products: ProductEntity[], criteria: ProductSearchCriteria): ProductEntity[] {
    const offset = criteria.offset || 0
    const limit = criteria.limit

    if (limit === undefined) {
      return products.slice(offset)
    }

    return products.slice(offset, offset + limit)
  }

  private applyUpdates(product: ProductEntity, updateData: ProductUpdateData): void {
    if (updateData.name !== undefined) {
      product.updateName(updateData.name)
    }

    if (updateData.description !== undefined) {
      product.updateDescription(updateData.description)
    }

    if (updateData.price !== undefined) {
      product.updatePrice(new Money(updateData.price))
    }

    if (updateData.originalPrice !== undefined) {
      product.setOriginalPrice(new Money(updateData.originalPrice))
    } else if (updateData.originalPrice === null) {
      product.removeOriginalPrice()
    }

    if (updateData.image !== undefined) {
      product.updateImage(updateData.image)
    }

    if (updateData.category !== undefined) {
      product.changeCategory(ProductCategory.fromString(updateData.category))
    }

    if (updateData.featured !== undefined) {
      product.setFeatured(updateData.featured)
    }

    if (updateData.inStock !== undefined) {
      product.changeAvailability(updateData.inStock)
    }

    if (updateData.ingredients !== undefined) {
      // Limpiar ingredientes actuales y agregar nuevos
      const currentIngredients = [...product.ingredients]
      currentIngredients.forEach(ingredient => product.removeIngredient(ingredient))
      updateData.ingredients.forEach(ingredient => product.addIngredient(ingredient))
    }

    if (updateData.allergens !== undefined) {
      // Limpiar alérgenos actuales y agregar nuevos
      const currentAllergens = [...product.allergens]
      currentAllergens.forEach(allergen => product.removeAllergen(allergen))
      updateData.allergens.forEach(allergen => product.addAllergen(allergen))
    }
  }
}
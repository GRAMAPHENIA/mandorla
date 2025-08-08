import { ProductService } from '../services/ProductService'
import { IProductRepository } from '../interfaces/IProductRepository'
import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { Money } from '../../domain/value-objects/Money'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'
import { ProductNotFoundError } from '../../domain/errors/ProductErrors'
import {
  InvalidSearchCriteriaError,
  ProductUpdateError,
  RepositoryError
} from '../errors/ApplicationErrors'

// Mock del repositorio
class MockProductRepository implements IProductRepository {
  private products: ProductEntity[] = []

  constructor(initialProducts: ProductEntity[] = []) {
    this.products = [...initialProducts]
  }

  async findAll(): Promise<ProductEntity[]> {
    return [...this.products]
  }

  async findById(id: ProductId): Promise<ProductEntity | null> {
    return this.products.find(p => p.id.equals(id)) || null
  }

  async findByCategory(category: ProductCategory): Promise<ProductEntity[]> {
    return this.products.filter(p => p.category.equals(category))
  }

  async findFeatured(): Promise<ProductEntity[]> {
    return this.products.filter(p => p.featured)
  }

  async findInStock(): Promise<ProductEntity[]> {
    return this.products.filter(p => p.inStock)
  }

  async searchByName(searchTerm: string): Promise<ProductEntity[]> {
    const term = searchTerm.toLowerCase()
    return this.products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    )
  }

  async findByIngredient(ingredient: string): Promise<ProductEntity[]> {
    return this.products.filter(p => p.containsIngredient(ingredient))
  }

  async findWithoutAllergen(allergen: string): Promise<ProductEntity[]> {
    return this.products.filter(p => !p.containsAllergen(allergen))
  }

  async save(product: ProductEntity): Promise<void> {
    const index = this.products.findIndex(p => p.id.equals(product.id))
    if (index >= 0) {
      this.products[index] = product
    } else {
      this.products.push(product)
    }
  }

  async delete(id: ProductId): Promise<void> {
    this.products = this.products.filter(p => !p.id.equals(id))
  }

  async exists(id: ProductId): Promise<boolean> {
    return this.products.some(p => p.id.equals(id))
  }

  // Método helper para tests
  setProducts(products: ProductEntity[]): void {
    this.products = [...products]
  }
}

describe('ProductService', () => {
  let productService: ProductService
  let mockRepository: MockProductRepository

  const createTestProduct = (overrides: Partial<any> = {}) => {
    return new ProductEntity({
      id: new ProductId(overrides.id || '1'),
      name: overrides.name || 'Test Product',
      description: overrides.description || 'Test description',
      price: new Money(overrides.price || 10.99),
      originalPrice: overrides.originalPrice ? new Money(overrides.originalPrice) : undefined,
      image: overrides.image || '/test.jpg',
      category: new ProductCategory(overrides.category || 'cookies'),
      featured: overrides.featured || false,
      inStock: overrides.inStock !== undefined ? overrides.inStock : true,
      ingredients: overrides.ingredients || ['Test Ingredient'],
      allergens: overrides.allergens || ['Test Allergen']
    })
  }

  beforeEach(() => {
    mockRepository = new MockProductRepository()
    productService = new ProductService(mockRepository)
  })

  describe('getAllProducts', () => {
    it('should return all products from repository', async () => {
      const testProducts = [
        createTestProduct({ id: '1', name: 'Product 1' }),
        createTestProduct({ id: '2', name: 'Product 2' })
      ]
      mockRepository.setProducts(testProducts)

      const result = await productService.getAllProducts()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Product 1')
      expect(result[1].name).toBe('Product 2')
    })

    it('should return empty array when no products exist', async () => {
      const result = await productService.getAllProducts()
      expect(result).toHaveLength(0)
    })
  })

  describe('getProductById', () => {
    it('should return product when it exists', async () => {
      const testProduct = createTestProduct({ id: '1', name: 'Test Product' })
      mockRepository.setProducts([testProduct])

      const result = await productService.getProductById('1')

      expect(result.name).toBe('Test Product')
      expect(result.id.value).toBe('1')
    })

    it('should throw ProductNotFoundError when product does not exist', async () => {
      await expect(productService.getProductById('nonexistent'))
        .rejects.toThrow(ProductNotFoundError)
    })
  })

  describe('searchProducts', () => {
    beforeEach(() => {
      const testProducts = [
        createTestProduct({ 
          id: '1', 
          name: 'Chocolate Cookies', 
          price: 12.99, 
          category: 'cookies',
          featured: true,
          ingredients: ['Chocolate', 'Flour'],
          allergens: ['Gluten']
        }),
        createTestProduct({ 
          id: '2', 
          name: 'Vanilla Cake', 
          price: 25.99, 
          category: 'pastries',
          featured: false,
          ingredients: ['Vanilla', 'Flour'],
          allergens: ['Gluten', 'Dairy']
        }),
        createTestProduct({ 
          id: '3', 
          name: 'Bread Roll', 
          price: 3.99, 
          category: 'breads',
          featured: false,
          inStock: false,
          ingredients: ['Flour', 'Yeast'],
          allergens: ['Gluten']
        })
      ]
      mockRepository.setProducts(testProducts)
    })

    it('should filter by search term', async () => {
      const result = await productService.searchProducts({ searchTerm: 'chocolate' })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Chocolate Cookies')
    })

    it('should filter by category', async () => {
      const result = await productService.searchProducts({ category: 'pastries' })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Vanilla Cake')
    })

    it('should filter by inStockOnly', async () => {
      const result = await productService.searchProducts({ inStockOnly: true })
      
      expect(result).toHaveLength(2)
      expect(result.every(p => p.inStock)).toBe(true)
    })

    it('should filter by featuredOnly', async () => {
      const result = await productService.searchProducts({ featuredOnly: true })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Chocolate Cookies')
    })

    it('should filter by price range', async () => {
      const result = await productService.searchProducts({ 
        minPrice: 10, 
        maxPrice: 20 
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Chocolate Cookies')
    })

    it('should filter by ingredient', async () => {
      const result = await productService.searchProducts({ withIngredient: 'Vanilla' })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Vanilla Cake')
    })

    it('should filter without allergen', async () => {
      const result = await productService.searchProducts({ withoutAllergen: 'Dairy' })
      
      expect(result).toHaveLength(2)
      expect(result.every(p => !p.containsAllergen('Dairy'))).toBe(true)
    })

    it('should sort by name ascending', async () => {
      const result = await productService.searchProducts({ 
        sortBy: 'name', 
        sortOrder: 'asc' 
      })
      
      expect(result[0].name).toBe('Bread Roll')
      expect(result[1].name).toBe('Chocolate Cookies')
      expect(result[2].name).toBe('Vanilla Cake')
    })

    it('should sort by price descending', async () => {
      const result = await productService.searchProducts({ 
        sortBy: 'price', 
        sortOrder: 'desc' 
      })
      
      expect(result[0].price.amount).toBe(25.99)
      expect(result[1].price.amount).toBe(12.99)
      expect(result[2].price.amount).toBe(3.99)
    })

    it('should apply pagination', async () => {
      const result = await productService.searchProducts({ 
        limit: 2, 
        offset: 1 
      })
      
      expect(result).toHaveLength(2)
    })

    it('should throw InvalidSearchCriteriaError for invalid price range', async () => {
      await expect(productService.searchProducts({ 
        minPrice: 20, 
        maxPrice: 10 
      })).rejects.toThrow(InvalidSearchCriteriaError)
    })

    it('should throw InvalidSearchCriteriaError for negative prices', async () => {
      await expect(productService.searchProducts({ minPrice: -5 }))
        .rejects.toThrow(InvalidSearchCriteriaError)
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const testProduct = createTestProduct({ id: '1', name: 'Original Name' })
      mockRepository.setProducts([testProduct])

      const result = await productService.updateProduct('1', { 
        name: 'Updated Name',
        price: 15.99
      })

      expect(result.name).toBe('Updated Name')
      expect(result.price.amount).toBe(15.99)
    })

    it('should throw ProductNotFoundError when product does not exist', async () => {
      await expect(productService.updateProduct('nonexistent', { name: 'New Name' }))
        .rejects.toThrow(ProductNotFoundError)
    })
  })

  describe('checkProductAvailability', () => {
    it('should return true for available product', async () => {
      const testProduct = createTestProduct({ id: '1', inStock: true })
      mockRepository.setProducts([testProduct])

      const result = await productService.checkProductAvailability('1')

      expect(result).toBe(true)
    })

    it('should return false for unavailable product', async () => {
      const testProduct = createTestProduct({ id: '1', inStock: false })
      mockRepository.setProducts([testProduct])

      const result = await productService.checkProductAvailability('1')

      expect(result).toBe(false)
    })

    it('should return false for nonexistent product', async () => {
      const result = await productService.checkProductAvailability('nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('getDiscountedProducts', () => {
    it('should return only products with discounts', async () => {
      const testProducts = [
        createTestProduct({ id: '1', price: 10.99, originalPrice: 15.99 }),
        createTestProduct({ id: '2', price: 12.99 }), // No discount
        createTestProduct({ id: '3', price: 8.99, originalPrice: 12.99 })
      ]
      mockRepository.setProducts(testProducts)

      const result = await productService.getDiscountedProducts()

      expect(result).toHaveLength(2)
      expect(result.every(p => p.hasDiscount())).toBe(true)
    })
  })

  describe('getProductsByCategory', () => {
    it('should return products of specified category', async () => {
      const testProducts = [
        createTestProduct({ id: '1', category: 'cookies' }),
        createTestProduct({ id: '2', category: 'pastries' }),
        createTestProduct({ id: '3', category: 'cookies' })
      ]
      mockRepository.setProducts(testProducts)

      const result = await productService.getProductsByCategory('cookies')

      expect(result).toHaveLength(2)
      expect(result.every(p => p.category.value === 'cookies')).toBe(true)
    })
  })

  describe('getFeaturedProducts', () => {
    it('should return only featured products', async () => {
      const testProducts = [
        createTestProduct({ id: '1', featured: true }),
        createTestProduct({ id: '2', featured: false }),
        createTestProduct({ id: '3', featured: true })
      ]
      mockRepository.setProducts(testProducts)

      const result = await productService.getFeaturedProducts()

      expect(result).toHaveLength(2)
      expect(result.every(p => p.featured)).toBe(true)
    })
  })
})
import { ProductRepository } from '../repositories/ProductRepository'
import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { Money } from '../../domain/value-objects/Money'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'

// Mock localStorage para testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock window object para SSR testing
const windowMock = {
  localStorage: localStorageMock
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: true
})

describe('ProductRepository Integration Tests', () => {
  let repository: ProductRepository

  const createTestEntity = (overrides: Partial<any> = {}) => {
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

  beforeEach(async () => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    repository = new ProductRepository()
    
    // Esperar a que se inicialice
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('findAll', () => {
    it('should return all products from storage', async () => {
      const products = await repository.findAll()
      
      // Debería retornar los productos mock iniciales
      expect(products.length).toBeGreaterThan(0)
      expect(products[0]).toBeInstanceOf(ProductEntity)
    })

    it('should return products as domain entities', async () => {
      const products = await repository.findAll()
      
      products.forEach(product => {
        expect(product).toBeInstanceOf(ProductEntity)
        expect(product.id).toBeInstanceOf(ProductId)
        expect(product.price).toBeInstanceOf(Money)
        expect(product.category).toBeInstanceOf(ProductCategory)
      })
    })
  })

  describe('findById', () => {
    it('should find existing product by ID', async () => {
      // Primero obtener todos los productos para tener un ID válido
      const allProducts = await repository.findAll()
      const firstProduct = allProducts[0]
      
      const foundProduct = await repository.findById(firstProduct.id)
      
      expect(foundProduct).not.toBeNull()
      expect(foundProduct!.id.equals(firstProduct.id)).toBe(true)
      expect(foundProduct!.name).toBe(firstProduct.name)
    })

    it('should return null for non-existent product', async () => {
      const nonExistentId = new ProductId('non-existent-id')
      const product = await repository.findById(nonExistentId)
      
      expect(product).toBeNull()
    })
  })

  describe('save', () => {
    it('should save new product', async () => {
      const newProduct = createTestEntity({
        id: 'new-product-id',
        name: 'New Test Product'
      })

      await repository.save(newProduct)
      
      const savedProduct = await repository.findById(new ProductId('new-product-id'))
      
      expect(savedProduct).not.toBeNull()
      expect(savedProduct!.name).toBe('New Test Product')
    })

    it('should update existing product', async () => {
      // Obtener un producto existente
      const allProducts = await repository.findAll()
      const existingProduct = allProducts[0]
      
      // Modificar el producto
      existingProduct.updateName('Updated Product Name')
      
      // Guardar cambios
      await repository.save(existingProduct)
      
      // Verificar que se guardó correctamente
      const updatedProduct = await repository.findById(existingProduct.id)
      
      expect(updatedProduct).not.toBeNull()
      expect(updatedProduct!.name).toBe('Updated Product Name')
    })
  })

  describe('delete', () => {
    it('should delete existing product', async () => {
      // Obtener un producto existente
      const allProducts = await repository.findAll()
      const productToDelete = allProducts[0]
      
      // Eliminar el producto
      await repository.delete(productToDelete.id)
      
      // Verificar que se eliminó
      const deletedProduct = await repository.findById(productToDelete.id)
      expect(deletedProduct).toBeNull()
    })
  })

  describe('exists', () => {
    it('should return true for existing product', async () => {
      const allProducts = await repository.findAll()
      const existingProduct = allProducts[0]
      
      const exists = await repository.exists(existingProduct.id)
      
      expect(exists).toBe(true)
    })

    it('should return false for non-existent product', async () => {
      const nonExistentId = new ProductId('non-existent-id')
      
      const exists = await repository.exists(nonExistentId)
      
      expect(exists).toBe(false)
    })
  })

  describe('findByCategory', () => {
    it('should return products of specified category', async () => {
      const cookiesCategory = new ProductCategory('cookies')
      const cookieProducts = await repository.findByCategory(cookiesCategory)
      
      expect(cookieProducts.length).toBeGreaterThan(0)
      cookieProducts.forEach(product => {
        expect(product.category.equals(cookiesCategory)).toBe(true)
      })
    })

    it('should return empty array for category with no products', async () => {
      // Limpiar todos los productos y agregar uno de categoría específica
      await repository.clearAll()
      
      const testProduct = createTestEntity({
        id: 'test-1',
        category: 'cookies'
      })
      await repository.save(testProduct)
      
      const pastriesCategory = new ProductCategory('pastries')
      const pastriesProducts = await repository.findByCategory(pastriesCategory)
      
      expect(pastriesProducts).toHaveLength(0)
    })
  })

  describe('findFeatured', () => {
    it('should return only featured products', async () => {
      const featuredProducts = await repository.findFeatured()
      
      featuredProducts.forEach(product => {
        expect(product.featured).toBe(true)
      })
    })
  })

  describe('findInStock', () => {
    it('should return only products in stock', async () => {
      const inStockProducts = await repository.findInStock()
      
      inStockProducts.forEach(product => {
        expect(product.inStock).toBe(true)
      })
    })
  })

  describe('searchByName', () => {
    it('should find products by name search term', async () => {
      const searchResults = await repository.searchByName('galletas')
      
      expect(searchResults.length).toBeGreaterThan(0)
      searchResults.forEach(product => {
        const nameMatch = product.name.toLowerCase().includes('galletas')
        const descriptionMatch = product.description.toLowerCase().includes('galletas')
        expect(nameMatch || descriptionMatch).toBe(true)
      })
    })

    it('should return empty array for non-matching search term', async () => {
      const searchResults = await repository.searchByName('nonexistentproduct')
      
      expect(searchResults).toHaveLength(0)
    })
  })

  describe('findByIngredient', () => {
    it('should find products containing specific ingredient', async () => {
      const productsWithFlour = await repository.findByIngredient('Harina')
      
      expect(productsWithFlour.length).toBeGreaterThan(0)
      productsWithFlour.forEach(product => {
        expect(product.containsIngredient('Harina')).toBe(true)
      })
    })
  })

  describe('findWithoutAllergen', () => {
    it('should find products without specific allergen', async () => {
      const productsWithoutGluten = await repository.findWithoutAllergen('Gluten')
      
      productsWithoutGluten.forEach(product => {
        expect(product.containsAllergen('Gluten')).toBe(false)
      })
    })
  })

  describe('getStats', () => {
    it('should return correct repository statistics', async () => {
      const stats = await repository.getStats()
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('byCategory')
      expect(stats).toHaveProperty('featured')
      expect(stats).toHaveProperty('inStock')
      expect(stats).toHaveProperty('withDiscounts')
      
      expect(typeof stats.total).toBe('number')
      expect(typeof stats.byCategory).toBe('object')
      expect(typeof stats.featured).toBe('number')
      expect(typeof stats.inStock).toBe('number')
      expect(typeof stats.withDiscounts).toBe('number')
    })
  })

  describe('resetToDefaults', () => {
    it('should reset repository to default mock data', async () => {
      // Limpiar todos los productos
      await repository.clearAll()
      
      // Verificar que está vacío
      let products = await repository.findAll()
      expect(products).toHaveLength(0)
      
      // Resetear a valores por defecto
      await repository.resetToDefaults()
      
      // Verificar que se restauraron los datos
      products = await repository.findAll()
      expect(products.length).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should handle localStorage unavailable gracefully', async () => {
      // Simular localStorage no disponible
      const originalWindow = global.window
      delete (global as any).window
      
      const repository = new ProductRepository()
      
      // Debería funcionar con datos mock como fallback
      const products = await repository.findAll()
      expect(products.length).toBeGreaterThan(0)
      
      // Restaurar window
      global.window = originalWindow
    })
  })
})
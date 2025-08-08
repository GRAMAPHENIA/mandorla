import { ProductEntity } from '../entities/ProductEntity'
import { ProductId } from '../value-objects/ProductId'
import { Money } from '../value-objects/Money'
import { ProductCategory } from '../value-objects/ProductCategory'
import {
  InvalidProductNameError,
  InvalidProductDescriptionError,
  InvalidPriceError,
  ProductOutOfStockError,
  InvalidIngredientError,
  InvalidAllergenError
} from '../errors/ProductErrors'

describe('ProductEntity', () => {
  const createValidProduct = () => {
    return new ProductEntity({
      id: new ProductId('1'),
      name: 'Galletas de Chocolate',
      description: 'Deliciosas galletas con chispas de chocolate',
      price: new Money(12.99),
      image: '/test-image.jpg',
      category: new ProductCategory('cookies'),
      featured: true,
      inStock: true,
      ingredients: ['Harina', 'Chocolate', 'Mantequilla'],
      allergens: ['Gluten', 'Lácteos']
    })
  }

  describe('constructor', () => {
    it('should create a valid product', () => {
      const product = createValidProduct()
      
      expect(product.id.value).toBe('1')
      expect(product.name).toBe('Galletas de Chocolate')
      expect(product.description).toBe('Deliciosas galletas con chispas de chocolate')
      expect(product.price.amount).toBe(12.99)
      expect(product.category.value).toBe('cookies')
      expect(product.featured).toBe(true)
      expect(product.inStock).toBe(true)
      expect(product.ingredients).toEqual(['Harina', 'Chocolate', 'Mantequilla'])
      expect(product.allergens).toEqual(['Gluten', 'Lácteos'])
    })

    it('should throw error for empty name', () => {
      expect(() => new ProductEntity({
        id: new ProductId('1'),
        name: '',
        description: 'Test description',
        price: new Money(12.99),
        image: '/test.jpg',
        category: new ProductCategory('cookies'),
        featured: false,
        inStock: true
      })).toThrow(InvalidProductNameError)
    })

    it('should throw error for empty description', () => {
      expect(() => new ProductEntity({
        id: new ProductId('1'),
        name: 'Test Product',
        description: '',
        price: new Money(12.99),
        image: '/test.jpg',
        category: new ProductCategory('cookies'),
        featured: false,
        inStock: true
      })).toThrow(InvalidProductDescriptionError)
    })

    it('should throw error for empty ingredient', () => {
      expect(() => new ProductEntity({
        id: new ProductId('1'),
        name: 'Test Product',
        description: 'Test description',
        price: new Money(12.99),
        image: '/test.jpg',
        category: new ProductCategory('cookies'),
        featured: false,
        inStock: true,
        ingredients: ['Harina', '', 'Chocolate']
      })).toThrow(InvalidIngredientError)
    })

    it('should throw error for empty allergen', () => {
      expect(() => new ProductEntity({
        id: new ProductId('1'),
        name: 'Test Product',
        description: 'Test description',
        price: new Money(12.99),
        image: '/test.jpg',
        category: new ProductCategory('cookies'),
        featured: false,
        inStock: true,
        allergens: ['Gluten', '', 'Lácteos']
      })).toThrow(InvalidAllergenError)
    })
  })

  describe('updatePrice', () => {
    it('should update price with valid amount', () => {
      const product = createValidProduct()
      const newPrice = new Money(15.99)
      
      product.updatePrice(newPrice)
      
      expect(product.price.amount).toBe(15.99)
    })

    it('should throw error for zero price', () => {
      const product = createValidProduct()
      const invalidPrice = new Money(0)
      
      expect(() => product.updatePrice(invalidPrice)).toThrow(InvalidPriceError)
    })
  })

  describe('setOriginalPrice', () => {
    it('should set original price when higher than current price', () => {
      const product = createValidProduct()
      const originalPrice = new Money(19.99)
      
      product.setOriginalPrice(originalPrice)
      
      expect(product.originalPrice?.amount).toBe(19.99)
    })

    it('should throw error when original price is lower than current price', () => {
      const product = createValidProduct()
      const invalidOriginalPrice = new Money(10.99)
      
      expect(() => product.setOriginalPrice(invalidOriginalPrice))
        .toThrow('El precio original debe ser mayor al precio actual')
    })
  })

  describe('changeAvailability', () => {
    it('should change availability status', () => {
      const product = createValidProduct()
      
      product.changeAvailability(false)
      expect(product.inStock).toBe(false)
      
      product.changeAvailability(true)
      expect(product.inStock).toBe(true)
    })
  })

  describe('addIngredient', () => {
    it('should add new ingredient', () => {
      const product = createValidProduct()
      
      product.addIngredient('Vainilla')
      
      expect(product.ingredients).toContain('Vainilla')
    })

    it('should not add duplicate ingredient', () => {
      const product = createValidProduct()
      const initialLength = product.ingredients.length
      
      product.addIngredient('Harina')
      
      expect(product.ingredients.length).toBe(initialLength)
    })

    it('should throw error for empty ingredient', () => {
      const product = createValidProduct()
      
      expect(() => product.addIngredient('')).toThrow(InvalidIngredientError)
    })
  })

  describe('removeIngredient', () => {
    it('should remove existing ingredient', () => {
      const product = createValidProduct()
      
      product.removeIngredient('Harina')
      
      expect(product.ingredients).not.toContain('Harina')
    })

    it('should do nothing when ingredient does not exist', () => {
      const product = createValidProduct()
      const initialLength = product.ingredients.length
      
      product.removeIngredient('Inexistente')
      
      expect(product.ingredients.length).toBe(initialLength)
    })
  })

  describe('addAllergen', () => {
    it('should add new allergen', () => {
      const product = createValidProduct()
      
      product.addAllergen('Frutos Secos')
      
      expect(product.allergens).toContain('Frutos Secos')
    })

    it('should not add duplicate allergen', () => {
      const product = createValidProduct()
      const initialLength = product.allergens.length
      
      product.addAllergen('Gluten')
      
      expect(product.allergens.length).toBe(initialLength)
    })
  })

  describe('hasDiscount', () => {
    it('should return true when original price is set', () => {
      const product = createValidProduct()
      product.setOriginalPrice(new Money(19.99))
      
      expect(product.hasDiscount()).toBe(true)
    })

    it('should return false when no original price', () => {
      const product = createValidProduct()
      
      expect(product.hasDiscount()).toBe(false)
    })
  })

  describe('getDiscountPercentage', () => {
    it('should calculate correct discount percentage', () => {
      const product = createValidProduct()
      product.setOriginalPrice(new Money(20.00))
      
      const discount = product.getDiscountPercentage()
      
      expect(discount).toBe(35) // (20 - 12.99) / 20 * 100 = 35%
    })

    it('should return 0 when no original price', () => {
      const product = createValidProduct()
      
      expect(product.getDiscountPercentage()).toBe(0)
    })
  })

  describe('checkAvailabilityForPurchase', () => {
    it('should not throw when product is in stock', () => {
      const product = createValidProduct()
      
      expect(() => product.checkAvailabilityForPurchase()).not.toThrow()
    })

    it('should throw ProductOutOfStockError when product is out of stock', () => {
      const product = createValidProduct()
      product.changeAvailability(false)
      
      expect(() => product.checkAvailabilityForPurchase()).toThrow(ProductOutOfStockError)
    })
  })

  describe('containsAllergen', () => {
    it('should return true for existing allergen (case insensitive)', () => {
      const product = createValidProduct()
      
      expect(product.containsAllergen('gluten')).toBe(true)
      expect(product.containsAllergen('LÁCTEOS')).toBe(true)
    })

    it('should return false for non-existing allergen', () => {
      const product = createValidProduct()
      
      expect(product.containsAllergen('Frutos Secos')).toBe(false)
    })
  })

  describe('containsIngredient', () => {
    it('should return true for existing ingredient (partial match)', () => {
      const product = createValidProduct()
      
      expect(product.containsIngredient('harina')).toBe(true)
      expect(product.containsIngredient('choco')).toBe(true)
    })

    it('should return false for non-existing ingredient', () => {
      const product = createValidProduct()
      
      expect(product.containsIngredient('vainilla')).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const product = createValidProduct()
      product.setOriginalPrice(new Money(19.99))
      
      const json = product.toJSON()
      
      expect(json).toEqual({
        id: '1',
        name: 'Galletas de Chocolate',
        description: 'Deliciosas galletas con chispas de chocolate',
        price: 12.99,
        originalPrice: 19.99,
        image: '/test-image.jpg',
        category: 'cookies',
        featured: true,
        inStock: true,
        ingredients: ['Harina', 'Chocolate', 'Mantequilla'],
        allergens: ['Gluten', 'Lácteos']
      })
    })
  })

  describe('fromPlainObject', () => {
    it('should create ProductEntity from plain object', () => {
      const data = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 12.99,
        originalPrice: 19.99,
        image: '/test.jpg',
        category: 'cookies',
        featured: true,
        inStock: true,
        ingredients: ['Ingredient1', 'Ingredient2'],
        allergens: ['Allergen1', 'Allergen2']
      }
      
      const product = ProductEntity.fromPlainObject(data)
      
      expect(product.id.value).toBe('1')
      expect(product.name).toBe('Test Product')
      expect(product.price.amount).toBe(12.99)
      expect(product.originalPrice?.amount).toBe(19.99)
      expect(product.category.value).toBe('cookies')
    })
  })
})
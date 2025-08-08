import { ProductCategory, type ProductCategoryType } from '../value-objects/ProductCategory'

describe('ProductCategory', () => {
  describe('constructor', () => {
    it('should create valid ProductCategory for each valid category', () => {
      const validCategories: ProductCategoryType[] = ['cookies', 'pastries', 'breads', 'seasonal']
      
      validCategories.forEach(category => {
        const productCategory = new ProductCategory(category)
        expect(productCategory.value).toBe(category)
      })
    })

    it('should throw error for invalid category', () => {
      expect(() => new ProductCategory('invalid' as ProductCategoryType))
        .toThrow('Categoría inválida: invalid. Las categorías válidas son: cookies, pastries, breads, seasonal')
    })
  })

  describe('displayName', () => {
    it('should return correct display names', () => {
      expect(new ProductCategory('cookies').displayName).toBe('Galletas')
      expect(new ProductCategory('pastries').displayName).toBe('Pasteles')
      expect(new ProductCategory('breads').displayName).toBe('Panes')
      expect(new ProductCategory('seasonal').displayName).toBe('Temporada')
    })
  })

  describe('equals', () => {
    it('should return true for equal categories', () => {
      const category1 = new ProductCategory('cookies')
      const category2 = new ProductCategory('cookies')
      expect(category1.equals(category2)).toBe(true)
    })

    it('should return false for different categories', () => {
      const category1 = new ProductCategory('cookies')
      const category2 = new ProductCategory('pastries')
      expect(category1.equals(category2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the category value', () => {
      const category = new ProductCategory('cookies')
      expect(category.toString()).toBe('cookies')
    })
  })

  describe('static methods', () => {
    describe('getAllCategories', () => {
      it('should return all valid categories', () => {
        const categories = ProductCategory.getAllCategories()
        expect(categories).toEqual(['cookies', 'pastries', 'breads', 'seasonal'])
      })

      it('should return a copy of the array', () => {
        const categories1 = ProductCategory.getAllCategories()
        const categories2 = ProductCategory.getAllCategories()
        expect(categories1).not.toBe(categories2)
        expect(categories1).toEqual(categories2)
      })
    })

    describe('fromString', () => {
      it('should create ProductCategory from valid string', () => {
        const category = ProductCategory.fromString('cookies')
        expect(category.value).toBe('cookies')
      })

      it('should throw error for invalid string', () => {
        expect(() => ProductCategory.fromString('invalid'))
          .toThrow('Categoría inválida: invalid')
      })
    })
  })
})
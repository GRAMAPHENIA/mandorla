import { ProductId } from '../value-objects/ProductId'

describe('ProductId', () => {
  describe('constructor', () => {
    it('should create a valid ProductId with a non-empty string', () => {
      const id = new ProductId('product-123')
      expect(id.value).toBe('product-123')
    })

    it('should trim whitespace from the input', () => {
      const id = new ProductId('  product-123  ')
      expect(id.value).toBe('product-123')
    })

    it('should throw error for empty string', () => {
      expect(() => new ProductId('')).toThrow('El ID del producto no puede estar vacío')
    })

    it('should throw error for whitespace-only string', () => {
      expect(() => new ProductId('   ')).toThrow('El ID del producto no puede estar vacío')
    })
  })

  describe('equals', () => {
    it('should return true for equal ProductIds', () => {
      const id1 = new ProductId('product-123')
      const id2 = new ProductId('product-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('should return false for different ProductIds', () => {
      const id1 = new ProductId('product-123')
      const id2 = new ProductId('product-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string value', () => {
      const id = new ProductId('product-123')
      expect(id.toString()).toBe('product-123')
    })
  })
})
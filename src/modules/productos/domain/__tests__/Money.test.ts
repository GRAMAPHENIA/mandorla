import { Money } from '../value-objects/Money'

describe('Money', () => {
  describe('constructor', () => {
    it('should create a valid Money object with positive amount', () => {
      const money = new Money(10.99)
      expect(money.amount).toBe(10.99)
      expect(money.currency).toBe('USD')
    })

    it('should create Money with custom currency', () => {
      const money = new Money(15.50, 'EUR')
      expect(money.amount).toBe(15.50)
      expect(money.currency).toBe('EUR')
    })

    it('should round to 2 decimal places', () => {
      const money = new Money(10.999)
      expect(money.amount).toBe(11.00)
    })

    it('should accept zero amount', () => {
      const money = new Money(0)
      expect(money.amount).toBe(0)
    })

    it('should throw error for negative amount', () => {
      expect(() => new Money(-5)).toThrow('El precio no puede ser negativo')
    })

    it('should throw error for invalid number', () => {
      expect(() => new Money(NaN)).toThrow('El precio debe ser un número válido')
      expect(() => new Money(Infinity)).toThrow('El precio debe ser un número válido')
    })

    it('should throw error for empty currency', () => {
      expect(() => new Money(10, '')).toThrow('La moneda no puede estar vacía')
      expect(() => new Money(10, '   ')).toThrow('La moneda no puede estar vacía')
    })

    it('should normalize currency to uppercase', () => {
      const money = new Money(10, 'eur')
      expect(money.currency).toBe('EUR')
    })
  })

  describe('equals', () => {
    it('should return true for equal Money objects', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(10.99, 'USD')
      expect(money1.equals(money2)).toBe(true)
    })

    it('should return false for different amounts', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(15.99, 'USD')
      expect(money1.equals(money2)).toBe(false)
    })

    it('should return false for different currencies', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(10.99, 'EUR')
      expect(money1.equals(money2)).toBe(false)
    })
  })

  describe('add', () => {
    it('should add two Money objects with same currency', () => {
      const money1 = new Money(10.50, 'USD')
      const money2 = new Money(5.25, 'USD')
      const result = money1.add(money2)
      expect(result.amount).toBe(15.75)
      expect(result.currency).toBe('USD')
    })

    it('should throw error when adding different currencies', () => {
      const money1 = new Money(10.50, 'USD')
      const money2 = new Money(5.25, 'EUR')
      expect(() => money1.add(money2)).toThrow('No se pueden sumar monedas de diferentes divisas')
    })
  })

  describe('multiply', () => {
    it('should multiply Money by positive factor', () => {
      const money = new Money(10.50, 'USD')
      const result = money.multiply(2)
      expect(result.amount).toBe(21.00)
      expect(result.currency).toBe('USD')
    })

    it('should multiply by decimal factor', () => {
      const money = new Money(10.00, 'USD')
      const result = money.multiply(0.5)
      expect(result.amount).toBe(5.00)
    })

    it('should throw error for negative factor', () => {
      const money = new Money(10.50, 'USD')
      expect(() => money.multiply(-1)).toThrow('El factor de multiplicación debe ser un número positivo')
    })

    it('should throw error for invalid factor', () => {
      const money = new Money(10.50, 'USD')
      expect(() => money.multiply(NaN)).toThrow('El factor de multiplicación debe ser un número positivo')
    })
  })

  describe('isGreaterThan', () => {
    it('should return true when amount is greater', () => {
      const money1 = new Money(15.99, 'USD')
      const money2 = new Money(10.99, 'USD')
      expect(money1.isGreaterThan(money2)).toBe(true)
    })

    it('should return false when amount is smaller', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(15.99, 'USD')
      expect(money1.isGreaterThan(money2)).toBe(false)
    })

    it('should return false when amounts are equal', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(10.99, 'USD')
      expect(money1.isGreaterThan(money2)).toBe(false)
    })

    it('should throw error when comparing different currencies', () => {
      const money1 = new Money(10.99, 'USD')
      const money2 = new Money(10.99, 'EUR')
      expect(() => money1.isGreaterThan(money2)).toThrow('No se pueden comparar monedas de diferentes divisas')
    })
  })

  describe('toString', () => {
    it('should return formatted string', () => {
      const money = new Money(10.99, 'USD')
      expect(money.toString()).toBe('10.99 USD')
    })
  })

  describe('toJSON', () => {
    it('should return serializable object', () => {
      const money = new Money(10.99, 'USD')
      const json = money.toJSON()
      expect(json).toEqual({ amount: 10.99, currency: 'USD' })
    })
  })
})
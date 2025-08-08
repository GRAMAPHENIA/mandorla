import { Money } from '../index'

describe('Money', () => {
  describe('create', () => {
    it('debería crear un Money válido', () => {
      const money = Money.create(10.50)
      expect(money.value).toBe(10.50)
    })

    it('debería crear Money con valor cero', () => {
      const money = Money.zero()
      expect(money.value).toBe(0)
      expect(money.isZero()).toBe(true)
    })

    it('debería lanzar error con valor inválido', () => {
      expect(() => Money.create(NaN)).toThrow('El valor monetario debe ser un número válido')
      expect(() => Money.create(Infinity)).toThrow('El valor monetario debe ser finito')
      expect(() => Money.create(-5)).toThrow('El valor monetario no puede ser negativo')
    })
  })

  describe('operaciones aritméticas', () => {
    const money1 = Money.create(10.50)
    const money2 = Money.create(5.25)

    it('debería sumar correctamente', () => {
      const result = money1.add(money2)
      expect(result.value).toBe(15.75)
    })

    it('debería restar correctamente', () => {
      const result = money1.subtract(money2)
      expect(result.value).toBe(5.25)
    })

    it('debería lanzar error al restar si el resultado es negativo', () => {
      expect(() => {
        money2.subtract(money1)
      }).toThrow('El resultado de la resta no puede ser negativo')
    })

    it('debería multiplicar correctamente', () => {
      const result = money1.multiply(2)
      expect(result.value).toBe(21.00)
    })

    it('debería lanzar error al multiplicar por factor inválido', () => {
      expect(() => {
        money1.multiply(-1)
      }).toThrow('El factor de multiplicación debe ser un número positivo')

      expect(() => {
        money1.multiply(NaN)
      }).toThrow('El factor de multiplicación debe ser un número positivo')
    })
  })

  describe('comparaciones', () => {
    const money1 = Money.create(10.00)
    const money2 = Money.create(5.00)
    const money3 = Money.create(10.00)

    it('debería comparar mayor que', () => {
      expect(money1.isGreaterThan(money2)).toBe(true)
      expect(money2.isGreaterThan(money1)).toBe(false)
    })

    it('debería comparar menor que', () => {
      expect(money2.isLessThan(money1)).toBe(true)
      expect(money1.isLessThan(money2)).toBe(false)
    })

    it('debería comparar igualdad', () => {
      expect(money1.equals(money3)).toBe(true)
      expect(money1.equals(money2)).toBe(false)
    })

    it('debería manejar tolerancia en decimales para igualdad', () => {
      const money4 = Money.create(10.001)
      const money5 = Money.create(10.009)
      expect(money4.equals(money5)).toBe(true) // Dentro de tolerancia de 0.01
    })
  })

  describe('formateo', () => {
    const money = Money.create(1234.56)

    it('debería formatear como moneda por defecto (EUR)', () => {
      const formatted = money.format()
      expect(formatted).toMatch(/1.*234.*56/) // Formato puede variar por locale
    })

    it('debería formatear con moneda específica', () => {
      const formatted = money.format('USD', 'en-US')
      expect(formatted).toContain('$')
      expect(formatted).toContain('1,234.56')
    })

    it('debería convertir a string con 2 decimales', () => {
      expect(money.toString()).toBe('1234.56')
      expect(Money.create(5).toString()).toBe('5.00')
    })
  })

  describe('redondeo', () => {
    it('debería redondear correctamente', () => {
      const money1 = Money.create(10.126)
      const rounded1 = money1.round()
      expect(rounded1.value).toBe(10.13)

      const money2 = Money.create(10.124)
      const rounded2 = money2.round()
      expect(rounded2.value).toBe(10.12)
    })
  })

  describe('utilidades', () => {
    it('debería identificar valor cero', () => {
      expect(Money.zero().isZero()).toBe(true)
      expect(Money.create(0.01).isZero()).toBe(false)
    })

    it('debería mantener inmutabilidad', () => {
      const original = Money.create(10.00)
      const result = original.add(Money.create(5.00))
      
      expect(original.value).toBe(10.00) // Original no cambia
      expect(result.value).toBe(15.00)
    })
  })
})
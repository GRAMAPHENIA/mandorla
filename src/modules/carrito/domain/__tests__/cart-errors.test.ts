import {
  InvalidQuantityError,
  CartNotFoundError,
  EmptyCartError,
  MaxQuantityExceededError,
  InvalidPriceError,
  InvalidProductIdError,
  isDomainError,
  isValidationError,
  isBusinessError,
  isNotFoundError
} from '../index'

describe('Cart Domain Errors', () => {
  describe('InvalidQuantityError', () => {
    it('debería crear error con mensaje correcto', () => {
      const error = new InvalidQuantityError(-1)
      
      expect(error.message).toBe('Cantidad inválida: -1. La cantidad debe ser un número entero mayor a 0')
      expect(error.code).toBe('INVALID_QUANTITY')
      expect(error.type).toBe('validation')
      expect(error.name).toBe('InvalidQuantityError')
    })
  })

  describe('CartNotFoundError', () => {
    it('debería crear error con mensaje por defecto', () => {
      const error = new CartNotFoundError()
      
      expect(error.message).toBe('Item no encontrado en el carrito')
      expect(error.code).toBe('CART_ITEM_NOT_FOUND')
      expect(error.type).toBe('not-found')
    })

    it('debería crear error con mensaje personalizado', () => {
      const customMessage = 'Producto específico no encontrado'
      const error = new CartNotFoundError(customMessage)
      
      expect(error.message).toBe(customMessage)
    })
  })

  describe('EmptyCartError', () => {
    it('debería crear error con mensaje por defecto', () => {
      const error = new EmptyCartError()
      
      expect(error.message).toBe('No se puede realizar la operación en un carrito vacío')
      expect(error.code).toBe('EMPTY_CART')
      expect(error.type).toBe('business')
    })

    it('debería crear error con mensaje personalizado', () => {
      const customMessage = 'El carrito está vacío para checkout'
      const error = new EmptyCartError(customMessage)
      
      expect(error.message).toBe(customMessage)
    })
  })

  describe('MaxQuantityExceededError', () => {
    it('debería crear error con cantidad máxima', () => {
      const error = new MaxQuantityExceededError(10)
      
      expect(error.message).toBe('Se ha excedido la cantidad máxima permitida: 10')
      expect(error.code).toBe('MAX_QUANTITY_EXCEEDED')
      expect(error.type).toBe('business')
    })
  })

  describe('InvalidPriceError', () => {
    it('debería crear error con precio inválido', () => {
      const error = new InvalidPriceError(-5.50)
      
      expect(error.message).toBe('Precio inválido: -5.5. El precio debe ser un número positivo')
      expect(error.code).toBe('INVALID_PRICE')
      expect(error.type).toBe('validation')
    })
  })

  describe('InvalidProductIdError', () => {
    it('debería crear error con ID de producto inválido', () => {
      const error = new InvalidProductIdError('')
      
      expect(error.message).toBe('ID de producto inválido: ')
      expect(error.code).toBe('INVALID_PRODUCT_ID')
      expect(error.type).toBe('validation')
    })
  })

  describe('Type Guards', () => {
    const validationError = new InvalidQuantityError(0)
    const businessError = new EmptyCartError()
    const notFoundError = new CartNotFoundError()
    const regularError = new Error('Error regular')

    describe('isDomainError', () => {
      it('debería identificar errores de dominio', () => {
        expect(isDomainError(validationError)).toBe(true)
        expect(isDomainError(businessError)).toBe(true)
        expect(isDomainError(notFoundError)).toBe(true)
        expect(isDomainError(regularError)).toBe(false)
        expect(isDomainError('string')).toBe(false)
        expect(isDomainError(null)).toBe(false)
      })
    })

    describe('isValidationError', () => {
      it('debería identificar errores de validación', () => {
        expect(isValidationError(validationError)).toBe(true)
        expect(isValidationError(businessError)).toBe(false)
        expect(isValidationError(notFoundError)).toBe(false)
        expect(isValidationError(regularError)).toBe(false)
      })
    })

    describe('isBusinessError', () => {
      it('debería identificar errores de negocio', () => {
        expect(isBusinessError(businessError)).toBe(true)
        expect(isBusinessError(validationError)).toBe(false)
        expect(isBusinessError(notFoundError)).toBe(false)
        expect(isBusinessError(regularError)).toBe(false)
      })
    })

    describe('isNotFoundError', () => {
      it('debería identificar errores de "no encontrado"', () => {
        expect(isNotFoundError(notFoundError)).toBe(true)
        expect(isNotFoundError(validationError)).toBe(false)
        expect(isNotFoundError(businessError)).toBe(false)
        expect(isNotFoundError(regularError)).toBe(false)
      })
    })
  })

  describe('Error inheritance', () => {
    it('debería mantener stack trace correcto', () => {
      const error = new InvalidQuantityError(0)
      
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('InvalidQuantityError')
    })

    it('debería ser instancia de Error', () => {
      const error = new CartNotFoundError()
      
      expect(error instanceof Error).toBe(true)
      expect(error instanceof CartNotFoundError).toBe(true)
    })
  })
})
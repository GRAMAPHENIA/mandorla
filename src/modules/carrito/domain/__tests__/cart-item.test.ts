import { CartItem, Money } from '../index'

describe('CartItem', () => {
  const validData = {
    productId: 'prod-123',
    name: 'Pan integral',
    price: Money.create(2.50),
    quantity: 3,
    image: 'pan.jpg'
  }

  describe('create', () => {
    it('debería crear un CartItem válido', () => {
      const item = CartItem.create(validData)
      
      expect(item.productId).toBe('prod-123')
      expect(item.name).toBe('Pan integral')
      expect(item.price.equals(Money.create(2.50))).toBe(true)
      expect(item.quantity).toBe(3)
      expect(item.image).toBe('pan.jpg')
    })

    it('debería crear un CartItem sin imagen', () => {
      const dataWithoutImage = { ...validData }
      delete dataWithoutImage.image
      
      const item = CartItem.create(dataWithoutImage)
      
      expect(item.image).toBeUndefined()
    })

    it('debería lanzar error con productId vacío', () => {
      expect(() => {
        CartItem.create({ ...validData, productId: '' })
      }).toThrow('El ID del producto es requerido')

      expect(() => {
        CartItem.create({ ...validData, productId: '   ' })
      }).toThrow('El ID del producto es requerido')
    })

    it('debería lanzar error con nombre vacío', () => {
      expect(() => {
        CartItem.create({ ...validData, name: '' })
      }).toThrow('El nombre del producto es requerido')

      expect(() => {
        CartItem.create({ ...validData, name: '   ' })
      }).toThrow('El nombre del producto es requerido')
    })

    it('debería lanzar error con cantidad inválida', () => {
      expect(() => {
        CartItem.create({ ...validData, quantity: 0 })
      }).toThrow('La cantidad debe ser mayor a cero')

      expect(() => {
        CartItem.create({ ...validData, quantity: -1 })
      }).toThrow('La cantidad debe ser mayor a cero')

      expect(() => {
        CartItem.create({ ...validData, quantity: 1.5 })
      }).toThrow('La cantidad debe ser un número entero')
    })
  })

  describe('updateQuantity', () => {
    it('debería crear una nueva instancia con cantidad actualizada', () => {
      const originalItem = CartItem.create(validData)
      const updatedItem = originalItem.updateQuantity(5)
      
      expect(originalItem.quantity).toBe(3) // Original no cambia
      expect(updatedItem.quantity).toBe(5)
      expect(updatedItem.productId).toBe(originalItem.productId)
      expect(updatedItem.name).toBe(originalItem.name)
    })

    it('debería validar la nueva cantidad', () => {
      const item = CartItem.create(validData)
      
      expect(() => {
        item.updateQuantity(0)
      }).toThrow('La cantidad debe ser mayor a cero')

      expect(() => {
        item.updateQuantity(-2)
      }).toThrow('La cantidad debe ser mayor a cero')
    })
  })

  describe('getSubtotal', () => {
    it('debería calcular el subtotal correctamente', () => {
      const item = CartItem.create({
        ...validData,
        price: Money.create(2.50),
        quantity: 4
      })
      
      const subtotal = item.getSubtotal()
      expect(subtotal.value).toBe(10.00)
    })

    it('debería manejar precios decimales', () => {
      const item = CartItem.create({
        ...validData,
        price: Money.create(1.33),
        quantity: 3
      })
      
      const subtotal = item.getSubtotal()
      expect(subtotal.value).toBe(3.99)
    })
  })

  describe('equals', () => {
    it('debería comparar items por productId', () => {
      const item1 = CartItem.create(validData)
      const item2 = CartItem.create({ ...validData, quantity: 5 })
      const item3 = CartItem.create({ ...validData, productId: 'prod-456' })
      
      expect(item1.equals(item2)).toBe(true) // Mismo productId
      expect(item1.equals(item3)).toBe(false) // Diferente productId
    })
  })

  describe('toJSON', () => {
    it('debería convertir a formato JSON serializable', () => {
      const item = CartItem.create({
        productId: 'prod-123',
        name: 'Croissant',
        price: Money.create(1.80),
        quantity: 2,
        image: 'croissant.jpg'
      })
      
      const json = item.toJSON()
      
      expect(json).toEqual({
        productId: 'prod-123',
        name: 'Croissant',
        price: 1.80,
        quantity: 2,
        image: 'croissant.jpg',
        subtotal: 3.60
      })
    })

    it('debería manejar items sin imagen', () => {
      const item = CartItem.create({
        productId: 'prod-123',
        name: 'Pan',
        price: Money.create(2.00),
        quantity: 1
      })
      
      const json = item.toJSON()
      
      expect(json.image).toBeUndefined()
      expect(json.subtotal).toBe(2.00)
    })
  })
})
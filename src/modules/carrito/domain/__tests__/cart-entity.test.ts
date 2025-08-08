import { CartEntity, CartId, Money, InvalidQuantityError, CartNotFoundError } from '../index'

describe('CartEntity', () => {
  let cartId: CartId
  let cart: CartEntity

  beforeEach(() => {
    cartId = CartId.generate()
    cart = CartEntity.create(cartId)
  })

  describe('create', () => {
    it('debería crear un carrito vacío', () => {
      expect(cart.isEmpty()).toBe(true)
      expect(cart.items).toHaveLength(0)
      expect(cart.id).toBe(cartId)
    })
  })

  describe('addItem', () => {
    it('debería agregar un nuevo item al carrito', () => {
      const price = Money.create(10.50)
      
      cart.addItem('prod-1', 'Pan integral', price, 2, 'image.jpg')
      
      expect(cart.items).toHaveLength(1)
      expect(cart.isEmpty()).toBe(false)
      
      const item = cart.getItem('prod-1')
      expect(item).toBeDefined()
      expect(item!.name).toBe('Pan integral')
      expect(item!.quantity).toBe(2)
      expect(item!.price.equals(price)).toBe(true)
    })

    it('debería incrementar la cantidad si el item ya existe', () => {
      const price = Money.create(5.00)
      
      cart.addItem('prod-1', 'Croissant', price, 1)
      cart.addItem('prod-1', 'Croissant', price, 2)
      
      expect(cart.items).toHaveLength(1)
      
      const item = cart.getItem('prod-1')
      expect(item!.quantity).toBe(3)
    })

    it('debería lanzar error con cantidad inválida', () => {
      const price = Money.create(5.00)
      
      expect(() => {
        cart.addItem('prod-1', 'Pan', price, 0)
      }).toThrow(InvalidQuantityError)

      expect(() => {
        cart.addItem('prod-1', 'Pan', price, -1)
      }).toThrow(InvalidQuantityError)
    })
  })

  describe('removeItem', () => {
    beforeEach(() => {
      const price = Money.create(8.00)
      cart.addItem('prod-1', 'Baguette', price, 1)
      cart.addItem('prod-2', 'Croissant', price, 2)
    })

    it('debería remover un item del carrito', () => {
      cart.removeItem('prod-1')
      
      expect(cart.items).toHaveLength(1)
      expect(cart.getItem('prod-1')).toBeUndefined()
      expect(cart.getItem('prod-2')).toBeDefined()
    })

    it('debería lanzar error si el item no existe', () => {
      expect(() => {
        cart.removeItem('prod-inexistente')
      }).toThrow(CartNotFoundError)
    })
  })

  describe('updateQuantity', () => {
    beforeEach(() => {
      const price = Money.create(3.50)
      cart.addItem('prod-1', 'Muffin', price, 3)
    })

    it('debería actualizar la cantidad de un item', () => {
      cart.updateQuantity('prod-1', 5)
      
      const item = cart.getItem('prod-1')
      expect(item!.quantity).toBe(5)
    })

    it('debería remover el item si la cantidad es 0', () => {
      cart.updateQuantity('prod-1', 0)
      
      expect(cart.getItem('prod-1')).toBeUndefined()
      expect(cart.items).toHaveLength(0)
    })

    it('debería lanzar error con cantidad negativa', () => {
      expect(() => {
        cart.updateQuantity('prod-1', -1)
      }).toThrow(InvalidQuantityError)
    })

    it('debería lanzar error si el item no existe', () => {
      expect(() => {
        cart.updateQuantity('prod-inexistente', 2)
      }).toThrow(CartNotFoundError)
    })
  })

  describe('calculateTotal', () => {
    it('debería calcular el total correctamente', () => {
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2) // 5.00
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 3) // 3.60
      
      const total = cart.calculateTotal()
      expect(total.value).toBe(8.60)
    })

    it('debería retornar 0 para carrito vacío', () => {
      const total = cart.calculateTotal()
      expect(total.value).toBe(0)
    })
  })

  describe('getTotalItems', () => {
    it('debería calcular el total de items correctamente', () => {
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2)
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 3)
      
      expect(cart.getTotalItems()).toBe(5)
    })

    it('debería retornar 0 para carrito vacío', () => {
      expect(cart.getTotalItems()).toBe(0)
    })
  })

  describe('clear', () => {
    it('debería limpiar todos los items del carrito', () => {
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2)
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 3)
      
      cart.clear()
      
      expect(cart.isEmpty()).toBe(true)
      expect(cart.items).toHaveLength(0)
      expect(cart.getTotalItems()).toBe(0)
    })
  })

  describe('fromPersistence', () => {
    it('debería reconstruir un carrito desde datos persistidos', () => {
      const persistenceData = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            name: 'Pan integral',
            price: 2.50,
            quantity: 2,
            image: 'pan.jpg'
          },
          {
            productId: 'prod-2',
            name: 'Croissant',
            price: 1.80,
            quantity: 1
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      }

      const reconstructedCart = CartEntity.fromPersistence(persistenceData)
      
      expect(reconstructedCart.id.value).toBe('cart-123')
      expect(reconstructedCart.items).toHaveLength(2)
      expect(reconstructedCart.getTotalItems()).toBe(3)
      expect(reconstructedCart.calculateTotal().value).toBe(6.80)
    })
  })

  describe('toPersistence', () => {
    it('debería convertir el carrito a formato de persistencia', () => {
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2, 'pan.jpg')
      
      const persistenceData = cart.toPersistence()
      
      expect(persistenceData.id).toBe(cartId.value)
      expect(persistenceData.items).toHaveLength(1)
      expect(persistenceData.items[0]).toEqual({
        productId: 'prod-1',
        name: 'Pan',
        price: 2.50,
        quantity: 2,
        image: 'pan.jpg'
      })
      expect(persistenceData.createdAt).toBeInstanceOf(Date)
      expect(persistenceData.updatedAt).toBeInstanceOf(Date)
    })
  })
})
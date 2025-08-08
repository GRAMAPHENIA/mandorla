import { CartService } from '../services/cart.service'
import { ICartRepository } from '../interfaces/cart-repository.interface'
import { CartEntity, CartId, Money, InvalidQuantityError, CartNotFoundError } from '../../domain'
import {
  AddToCartDto,
  UpdateQuantityDto,
  RemoveFromCartDto,
  ClearCartDto,
  CreateCartDto,
  GetCartDto
} from '../dtos/cart.dto'

// Mock del repositorio
class MockCartRepository implements ICartRepository {
  private carts = new Map<string, CartEntity>()

  async findById(cartId: CartId): Promise<CartEntity | null> {
    return this.carts.get(cartId.value) || null
  }

  async save(cart: CartEntity): Promise<void> {
    this.carts.set(cart.id.value, cart)
  }

  async delete(cartId: CartId): Promise<void> {
    this.carts.delete(cartId.value)
  }

  async exists(cartId: CartId): Promise<boolean> {
    return this.carts.has(cartId.value)
  }

  async findAll(): Promise<CartEntity[]> {
    return Array.from(this.carts.values())
  }

  // Métodos de utilidad para testing
  clear(): void {
    this.carts.clear()
  }

  getStoredCart(cartId: string): CartEntity | undefined {
    return this.carts.get(cartId)
  }
}

describe('CartService', () => {
  let cartService: CartService
  let mockRepository: MockCartRepository

  beforeEach(() => {
    mockRepository = new MockCartRepository()
    cartService = new CartService(mockRepository)
  })

  describe('createCart', () => {
    it('debería crear un nuevo carrito exitosamente', async () => {
      const dto: CreateCartDto = { cartId: 'test-cart-1' }
      
      const result = await cartService.createCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.cartId).toBe('test-cart-1')
      expect(result.message).toBe('Carrito creado exitosamente')
      
      const storedCart = mockRepository.getStoredCart('test-cart-1')
      expect(storedCart).toBeDefined()
      expect(storedCart!.isEmpty()).toBe(true)
    })

    it('debería generar ID automáticamente si no se proporciona', async () => {
      const dto: CreateCartDto = {}
      
      const result = await cartService.createCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.cartId).toBeDefined()
      expect(result.cartId.length).toBeGreaterThan(0)
    })

    it('debería fallar si el carrito ya existe', async () => {
      const dto: CreateCartDto = { cartId: 'existing-cart' }
      
      // Crear carrito primero
      await cartService.createCart(dto)
      
      // Intentar crear el mismo carrito otra vez
      const result = await cartService.createCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CART_ALREADY_EXISTS')
      expect(result.error?.type).toBe('business')
    })
  })

  describe('getCart', () => {
    it('debería obtener un carrito existente', async () => {
      // Crear carrito con items
      const cartId = CartId.create('test-cart')
      const cart = CartEntity.create(cartId)
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2)
      await mockRepository.save(cart)

      const dto: GetCartDto = { cartId: 'test-cart' }
      const result = await cartService.getCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.cart).toBeDefined()
      expect(result.cart!.id).toBe('test-cart')
      expect(result.cart!.items).toHaveLength(1)
      expect(result.cart!.totalItems).toBe(2)
      expect(result.cart!.totalPrice).toBe(5.00)
    })

    it('debería fallar si el carrito no existe', async () => {
      const dto: GetCartDto = { cartId: 'non-existent-cart' }
      const result = await cartService.getCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CART_NOT_FOUND')
      expect(result.error?.type).toBe('not-found')
    })
  })

  describe('addToCart', () => {
    it('debería agregar un item a un carrito existente', async () => {
      // Crear carrito vacío
      await cartService.createCart({ cartId: 'test-cart' })

      const dto: AddToCartDto = {
        cartId: 'test-cart',
        productId: 'prod-1',
        name: 'Croissant',
        price: 1.80,
        quantity: 2,
        image: 'croissant.jpg'
      }

      const result = await cartService.addToCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Croissant agregado al carrito')
      
      const storedCart = mockRepository.getStoredCart('test-cart')
      expect(storedCart!.items).toHaveLength(1)
      expect(storedCart!.getTotalItems()).toBe(2)
    })

    it('debería crear carrito automáticamente si no existe', async () => {
      const dto: AddToCartDto = {
        cartId: 'new-cart',
        productId: 'prod-1',
        name: 'Pan integral',
        price: 3.00,
        quantity: 1
      }

      const result = await cartService.addToCart(dto)
      
      expect(result.success).toBe(true)
      
      const storedCart = mockRepository.getStoredCart('new-cart')
      expect(storedCart).toBeDefined()
      expect(storedCart!.items).toHaveLength(1)
    })

    it('debería manejar errores de validación', async () => {
      const dto: AddToCartDto = {
        cartId: 'test-cart',
        productId: 'prod-1',
        name: 'Pan',
        price: 2.00,
        quantity: -1 // Cantidad inválida
      }

      const result = await cartService.addToCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation')
    })
  })

  describe('removeFromCart', () => {
    beforeEach(async () => {
      // Crear carrito con items
      const cartId = CartId.create('test-cart')
      const cart = CartEntity.create(cartId)
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 1)
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 2)
      await mockRepository.save(cart)
    })

    it('debería remover un item del carrito', async () => {
      const dto: RemoveFromCartDto = {
        cartId: 'test-cart',
        productId: 'prod-1'
      }

      const result = await cartService.removeFromCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Item removido del carrito')
      
      const storedCart = mockRepository.getStoredCart('test-cart')
      expect(storedCart!.items).toHaveLength(1)
      expect(storedCart!.getItem('prod-1')).toBeUndefined()
    })

    it('debería fallar si el carrito no existe', async () => {
      const dto: RemoveFromCartDto = {
        cartId: 'non-existent-cart',
        productId: 'prod-1'
      }

      const result = await cartService.removeFromCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CART_NOT_FOUND')
    })

    it('debería manejar error si el item no existe', async () => {
      const dto: RemoveFromCartDto = {
        cartId: 'test-cart',
        productId: 'non-existent-product'
      }

      const result = await cartService.removeFromCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('not-found')
    })
  })

  describe('updateQuantity', () => {
    beforeEach(async () => {
      // Crear carrito con items
      const cartId = CartId.create('test-cart')
      const cart = CartEntity.create(cartId)
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 3)
      await mockRepository.save(cart)
    })

    it('debería actualizar la cantidad de un item', async () => {
      const dto: UpdateQuantityDto = {
        cartId: 'test-cart',
        productId: 'prod-1',
        quantity: 5
      }

      const result = await cartService.updateQuantity(dto)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Cantidad actualizada a 5')
      
      const storedCart = mockRepository.getStoredCart('test-cart')
      const item = storedCart!.getItem('prod-1')
      expect(item!.quantity).toBe(5)
    })

    it('debería remover item si la cantidad es 0', async () => {
      const dto: UpdateQuantityDto = {
        cartId: 'test-cart',
        productId: 'prod-1',
        quantity: 0
      }

      const result = await cartService.updateQuantity(dto)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Item removido del carrito')
      
      const storedCart = mockRepository.getStoredCart('test-cart')
      expect(storedCart!.getItem('prod-1')).toBeUndefined()
    })

    it('debería fallar con cantidad negativa', async () => {
      const dto: UpdateQuantityDto = {
        cartId: 'test-cart',
        productId: 'prod-1',
        quantity: -1
      }

      const result = await cartService.updateQuantity(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation')
    })
  })

  describe('clearCart', () => {
    beforeEach(async () => {
      // Crear carrito con items
      const cartId = CartId.create('test-cart')
      const cart = CartEntity.create(cartId)
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 1)
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 2)
      await mockRepository.save(cart)
    })

    it('debería limpiar todos los items del carrito', async () => {
      const dto: ClearCartDto = { cartId: 'test-cart' }
      
      const result = await cartService.clearCart(dto)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Carrito limpiado exitosamente')
      
      const storedCart = mockRepository.getStoredCart('test-cart')
      expect(storedCart!.isEmpty()).toBe(true)
      expect(storedCart!.items).toHaveLength(0)
    })

    it('debería fallar si el carrito no existe', async () => {
      const dto: ClearCartDto = { cartId: 'non-existent-cart' }
      
      const result = await cartService.clearCart(dto)
      
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CART_NOT_FOUND')
    })
  })

  describe('métodos de utilidad', () => {
    beforeEach(async () => {
      // Crear carrito con items
      const cartId = CartId.create('test-cart')
      const cart = CartEntity.create(cartId)
      cart.addItem('prod-1', 'Pan', Money.create(2.50), 2) // 5.00
      cart.addItem('prod-2', 'Leche', Money.create(1.20), 3) // 3.60
      await mockRepository.save(cart)
    })

    describe('getCartItemCount', () => {
      it('debería retornar el número total de items', async () => {
        const count = await cartService.getCartItemCount('test-cart')
        expect(count).toBe(5)
      })

      it('debería retornar 0 para carrito inexistente', async () => {
        const count = await cartService.getCartItemCount('non-existent')
        expect(count).toBe(0)
      })
    })

    describe('getCartTotal', () => {
      it('debería retornar el total del carrito', async () => {
        const total = await cartService.getCartTotal('test-cart')
        expect(total).toBe(8.60)
      })

      it('debería retornar 0 para carrito inexistente', async () => {
        const total = await cartService.getCartTotal('non-existent')
        expect(total).toBe(0)
      })
    })

    describe('isCartEmpty', () => {
      it('debería retornar false para carrito con items', async () => {
        const isEmpty = await cartService.isCartEmpty('test-cart')
        expect(isEmpty).toBe(false)
      })

      it('debería retornar true para carrito inexistente', async () => {
        const isEmpty = await cartService.isCartEmpty('non-existent')
        expect(isEmpty).toBe(true)
      })

      it('debería retornar true para carrito vacío', async () => {
        await cartService.createCart({ cartId: 'empty-cart' })
        const isEmpty = await cartService.isCartEmpty('empty-cart')
        expect(isEmpty).toBe(true)
      })
    })
  })
})
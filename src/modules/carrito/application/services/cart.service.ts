import { CartEntity, CartId, Money, isDomainError, isValidationError, isBusinessError, isNotFoundError } from '../../domain'
import { ICartRepository } from '../interfaces/cart-repository.interface'
import {
  AddToCartDto,
  UpdateQuantityDto,
  RemoveFromCartDto,
  ClearCartDto,
  CreateCartDto,
  GetCartDto,
  CartOperationResult,
  CartInfoDto,
  GetCartResult,
  CartItemDto
} from '../dtos/cart.dto'

/**
 * Servicio de aplicación para el carrito
 * Implementa los casos de uso principales del carrito
 */
export class CartService {
  constructor(private readonly cartRepository: ICartRepository) {}

  /**
   * Crea un nuevo carrito
   */
  async createCart(dto: CreateCartDto): Promise<CartOperationResult> {
    try {
      const cartId = dto.cartId ? CartId.create(dto.cartId) : CartId.generate()
      
      // Verificar si ya existe un carrito con ese ID
      const existingCart = await this.cartRepository.findById(cartId)
      if (existingCart) {
        return {
          success: false,
          cartId: cartId.value,
          error: {
            code: 'CART_ALREADY_EXISTS',
            message: `Ya existe un carrito con ID ${cartId.value}`,
            type: 'business'
          }
        }
      }

      const cart = CartEntity.create(cartId)
      await this.cartRepository.save(cart)

      return {
        success: true,
        cartId: cartId.value,
        message: 'Carrito creado exitosamente'
      }
    } catch (error) {
      return this.handleError(error, 'Error al crear carrito')
    }
  }

  /**
   * Obtiene un carrito por su ID
   */
  async getCart(dto: GetCartDto): Promise<GetCartResult> {
    try {
      const cartId = CartId.create(dto.cartId)
      const cart = await this.cartRepository.findById(cartId)

      if (!cart) {
        return {
          success: false,
          error: {
            code: 'CART_NOT_FOUND',
            message: `Carrito con ID ${dto.cartId} no encontrado`,
            type: 'not-found'
          }
        }
      }

      return {
        success: true,
        cart: this.mapCartToDto(cart)
      }
    } catch (error) {
      return {
        success: false,
        error: this.mapErrorToDto(error)
      }
    }
  }

  /**
   * Agrega un item al carrito
   */
  async addToCart(dto: AddToCartDto): Promise<CartOperationResult> {
    try {
      const cartId = CartId.create(dto.cartId)
      let cart = await this.cartRepository.findById(cartId)

      // Si el carrito no existe, crearlo
      if (!cart) {
        cart = CartEntity.create(cartId)
      }

      const price = Money.create(dto.price)
      const quantity = dto.quantity || 1

      cart.addItem(dto.productId, dto.name, price, quantity, dto.image)
      await this.cartRepository.save(cart)

      return {
        success: true,
        cartId: cartId.value,
        message: `${dto.name} agregado al carrito`
      }
    } catch (error) {
      return this.handleError(error, 'Error al agregar item al carrito', dto.cartId)
    }
  }

  /**
   * Remueve un item del carrito
   */
  async removeFromCart(dto: RemoveFromCartDto): Promise<CartOperationResult> {
    try {
      const cartId = CartId.create(dto.cartId)
      const cart = await this.cartRepository.findById(cartId)

      if (!cart) {
        return {
          success: false,
          cartId: dto.cartId,
          error: {
            code: 'CART_NOT_FOUND',
            message: `Carrito con ID ${dto.cartId} no encontrado`,
            type: 'not-found'
          }
        }
      }

      cart.removeItem(dto.productId)
      await this.cartRepository.save(cart)

      return {
        success: true,
        cartId: cartId.value,
        message: 'Item removido del carrito'
      }
    } catch (error) {
      return this.handleError(error, 'Error al remover item del carrito', dto.cartId)
    }
  }

  /**
   * Actualiza la cantidad de un item en el carrito
   */
  async updateQuantity(dto: UpdateQuantityDto): Promise<CartOperationResult> {
    try {
      const cartId = CartId.create(dto.cartId)
      const cart = await this.cartRepository.findById(cartId)

      if (!cart) {
        return {
          success: false,
          cartId: dto.cartId,
          error: {
            code: 'CART_NOT_FOUND',
            message: `Carrito con ID ${dto.cartId} no encontrado`,
            type: 'not-found'
          }
        }
      }

      cart.updateQuantity(dto.productId, dto.quantity)
      await this.cartRepository.save(cart)

      const message = dto.quantity === 0 
        ? 'Item removido del carrito'
        : `Cantidad actualizada a ${dto.quantity}`

      return {
        success: true,
        cartId: cartId.value,
        message
      }
    } catch (error) {
      return this.handleError(error, 'Error al actualizar cantidad', dto.cartId)
    }
  }

  /**
   * Limpia todos los items del carrito
   */
  async clearCart(dto: ClearCartDto): Promise<CartOperationResult> {
    try {
      const cartId = CartId.create(dto.cartId)
      const cart = await this.cartRepository.findById(cartId)

      if (!cart) {
        return {
          success: false,
          cartId: dto.cartId,
          error: {
            code: 'CART_NOT_FOUND',
            message: `Carrito con ID ${dto.cartId} no encontrado`,
            type: 'not-found'
          }
        }
      }

      cart.clear()
      await this.cartRepository.save(cart)

      return {
        success: true,
        cartId: cartId.value,
        message: 'Carrito limpiado exitosamente'
      }
    } catch (error) {
      return this.handleError(error, 'Error al limpiar carrito', dto.cartId)
    }
  }

  /**
   * Obtiene el total de items en el carrito
   */
  async getCartItemCount(cartId: string): Promise<number> {
    try {
      const cart = await this.cartRepository.findById(CartId.create(cartId))
      return cart ? cart.getTotalItems() : 0
    } catch (error) {
      console.error('Error al obtener cantidad de items:', error)
      return 0
    }
  }

  /**
   * Obtiene el total del carrito
   */
  async getCartTotal(cartId: string): Promise<number> {
    try {
      const cart = await this.cartRepository.findById(CartId.create(cartId))
      return cart ? cart.calculateTotal().value : 0
    } catch (error) {
      console.error('Error al obtener total del carrito:', error)
      return 0
    }
  }

  /**
   * Verifica si el carrito está vacío
   */
  async isCartEmpty(cartId: string): Promise<boolean> {
    try {
      const cart = await this.cartRepository.findById(CartId.create(cartId))
      return cart ? cart.isEmpty() : true
    } catch (error) {
      console.error('Error al verificar si el carrito está vacío:', error)
      return true
    }
  }

  /**
   * Mapea una entidad de carrito a DTO
   */
  private mapCartToDto(cart: CartEntity): CartInfoDto {
    const items: CartItemDto[] = cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price.value,
      quantity: item.quantity,
      subtotal: item.getSubtotal().value,
      image: item.image
    }))

    return {
      id: cart.id.value,
      items,
      totalItems: cart.getTotalItems(),
      totalPrice: cart.calculateTotal().value,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    }
  }

  /**
   * Maneja errores y los convierte a formato de respuesta
   */
  private handleError(error: unknown, defaultMessage: string, cartId?: string): CartOperationResult {
    const errorDto = this.mapErrorToDto(error)
    
    return {
      success: false,
      cartId: cartId || '',
      message: defaultMessage,
      error: errorDto
    }
  }

  /**
   * Mapea errores a formato DTO
   */
  private mapErrorToDto(error: unknown): { code: string; message: string; type: 'validation' | 'business' | 'not-found' | 'infrastructure' } {
    if (isDomainError(error)) {
      let type: 'validation' | 'business' | 'not-found' | 'infrastructure'
      
      if (isValidationError(error)) {
        type = 'validation'
      } else if (isBusinessError(error)) {
        type = 'business'
      } else if (isNotFoundError(error)) {
        type = 'not-found'
      } else {
        type = 'business'
      }

      return {
        code: error.code,
        message: error.message,
        type
      }
    }

    // Error de infraestructura o desconocido
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Error desconocido',
      type: 'infrastructure'
    }
  }
}
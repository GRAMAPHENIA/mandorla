import { CartEntity, CartId } from '../../domain'
import { ICartRepository, ICartStorageService } from '../../application'

/**
 * Implementación del repositorio de carrito usando almacenamiento local
 */
export class LocalCartRepository implements ICartRepository {
  constructor(private readonly storageService: ICartStorageService) {}

  async findById(cartId: CartId): Promise<CartEntity | null> {
    try {
      const data = await this.storageService.getCartData(cartId.value)
      
      if (!data) {
        return null
      }

      return CartEntity.fromPersistence(data)
    } catch (error) {
      console.error('Error al buscar carrito:', error)
      return null
    }
  }

  async save(cart: CartEntity): Promise<void> {
    try {
      const data = cart.toPersistence()
      await this.storageService.saveCartData(cart.id.value, data)
    } catch (error) {
      console.error('Error al guardar carrito:', error)
      throw new Error('No se pudo guardar el carrito')
    }
  }

  async delete(cartId: CartId): Promise<void> {
    try {
      await this.storageService.removeCartData(cartId.value)
    } catch (error) {
      console.error('Error al eliminar carrito:', error)
      throw new Error('No se pudo eliminar el carrito')
    }
  }

  async exists(cartId: CartId): Promise<boolean> {
    try {
      return await this.storageService.hasCartData(cartId.value)
    } catch (error) {
      console.error('Error al verificar existencia del carrito:', error)
      return false
    }
  }

  async findAll(): Promise<CartEntity[]> {
    // Para implementación local, esto sería complejo
    // Por ahora retornamos array vacío
    console.warn('findAll no implementado para repositorio local')
    return []
  }
}
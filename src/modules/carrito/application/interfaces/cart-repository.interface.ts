import { CartEntity, CartId } from '../../domain'

/**
 * Interface para el repositorio de carrito
 * Define los contratos para la persistencia del carrito
 */
export interface ICartRepository {
  /**
   * Busca un carrito por su ID
   */
  findById(cartId: CartId): Promise<CartEntity | null>

  /**
   * Guarda un carrito (crear o actualizar)
   */
  save(cart: CartEntity): Promise<void>

  /**
   * Elimina un carrito por su ID
   */
  delete(cartId: CartId): Promise<void>

  /**
   * Verifica si existe un carrito con el ID dado
   */
  exists(cartId: CartId): Promise<boolean>

  /**
   * Obtiene todos los carritos (útil para administración)
   */
  findAll(): Promise<CartEntity[]>
}

/**
 * Interface para el servicio de persistencia local
 * Abstrae la implementación específica del almacenamiento
 */
export interface ICartStorageService {
  /**
   * Obtiene datos del carrito desde el almacenamiento local
   */
  getCartData(cartId: string): Promise<any | null>

  /**
   * Guarda datos del carrito en el almacenamiento local
   */
  saveCartData(cartId: string, data: any): Promise<void>

  /**
   * Elimina datos del carrito del almacenamiento local
   */
  removeCartData(cartId: string): Promise<void>

  /**
   * Verifica si existen datos del carrito
   */
  hasCartData(cartId: string): Promise<boolean>

  /**
   * Limpia todos los datos de carritos
   */
  clearAllCarts(): Promise<void>
}
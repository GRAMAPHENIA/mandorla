import { CartEntity } from '../entities/CartEntity'
import { CartId, CustomerId } from '../value-objects'

/**
 * Interface del repositorio de carritos
 * Define el contrato para la persistencia de carritos
 */
export interface CartRepository {
  /**
   * Busca un carrito por su ID
   * @param id ID del carrito
   */
  findById(id: CartId): Promise<CartEntity | null>

  /**
   * Busca un carrito por ID de cliente
   * @param customerId ID del cliente
   */
  findByCustomerId(customerId: CustomerId): Promise<CartEntity | null>

  /**
   * Guarda un carrito
   * @param cart Carrito a guardar
   */
  save(cart: CartEntity): Promise<void>

  /**
   * Elimina un carrito
   * @param id ID del carrito a eliminar
   */
  delete(id: CartId): Promise<void>

  /**
   * Crea un nuevo carrito para un cliente
   * @param customerId ID del cliente
   */
  create(customerId: CustomerId): Promise<CartEntity>

  /**
   * Verifica si existe un carrito para un cliente
   * @param customerId ID del cliente
   */
  existsForCustomer(customerId: CustomerId): Promise<boolean>
}
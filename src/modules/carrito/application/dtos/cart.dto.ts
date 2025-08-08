/**
 * DTOs para la capa de aplicación del carrito
 * Definen la estructura de datos que se intercambia entre capas
 */

/**
 * DTO para agregar un item al carrito
 */
export interface AddToCartDto {
  cartId: string
  productId: string
  name: string
  price: number
  quantity?: number
  image?: string
}

/**
 * DTO para actualizar la cantidad de un item
 */
export interface UpdateQuantityDto {
  cartId: string
  productId: string
  quantity: number
}

/**
 * DTO para remover un item del carrito
 */
export interface RemoveFromCartDto {
  cartId: string
  productId: string
}

/**
 * DTO para limpiar el carrito
 */
export interface ClearCartDto {
  cartId: string
}

/**
 * DTO de respuesta para operaciones del carrito
 */
export interface CartOperationResult {
  success: boolean
  cartId: string
  message?: string
  error?: {
    code: string
    message: string
    type: 'validation' | 'business' | 'not-found' | 'infrastructure'
  }
}

/**
 * DTO para la información del carrito
 */
export interface CartInfoDto {
  id: string
  items: CartItemDto[]
  totalItems: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

/**
 * DTO para un item del carrito
 */
export interface CartItemDto {
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
}

/**
 * DTO para crear un nuevo carrito
 */
export interface CreateCartDto {
  cartId?: string // Opcional, se genera automáticamente si no se proporciona
}

/**
 * DTO para obtener un carrito
 */
export interface GetCartDto {
  cartId: string
}

/**
 * DTO de respuesta para obtener carrito
 */
export interface GetCartResult {
  success: boolean
  cart?: CartInfoDto
  error?: {
    code: string
    message: string
    type: 'validation' | 'business' | 'not-found' | 'infrastructure'
  }
}
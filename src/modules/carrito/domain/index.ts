// Entidades
export { CartEntity } from './entities/CartEntity'

// Value Objects
export { CartId, CustomerId, CartItem } from './value-objects'

// Errores
export {
  CartDomainError,
  CartNotFoundError,
  InvalidQuantityError,
  ItemNotInCartError,
  EmptyCartError,
  CartLimitExceededError
} from './errors/CartErrors'

// Repositorios
export type { CartRepository } from './repositories/CartRepository'
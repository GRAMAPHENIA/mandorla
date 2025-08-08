import { CartEntity, CartId, CustomerId, CartRepository, CartItem } from '../../domain'
import { Money } from '../../../productos/domain'

/**
 * Implementación del repositorio de carritos usando LocalStorage
 */
export class LocalStorageCartRepository implements CartRepository {
  private readonly storageKey = 'mandorla_carts'

  async findById(id: CartId): Promise<CartEntity | null> {
    const carts = this.getAllCarts()
    const cartData = carts.find(cart => cart.id === id.value)
    return cartData ? this.deserializeCart(cartData) : null
  }

  async findByCustomerId(customerId: CustomerId): Promise<CartEntity | null> {
    const carts = this.getAllCarts()
    const cartData = carts.find(cart => cart.customerId === customerId.value)
    return cartData ? this.deserializeCart(cartData) : null
  }

  async save(cart: CartEntity): Promise<void> {
    const carts = this.getAllCarts()
    const cartData = this.serializeCart(cart)
    
    const existingIndex = carts.findIndex(c => c.id === cart.id.value)
    if (existingIndex >= 0) {
      carts[existingIndex] = cartData
    } else {
      carts.push(cartData)
    }
    
    this.saveAllCarts(carts)
  }

  async delete(id: CartId): Promise<void> {
    const carts = this.getAllCarts()
    const filteredCarts = carts.filter(cart => cart.id !== id.value)
    this.saveAllCarts(filteredCarts)
  }

  async create(customerId: CustomerId): Promise<CartEntity> {
    const cartId = new CartId(`cart_${customerId.value}_${Date.now()}`)
    const cart = new CartEntity(cartId, customerId, [])
    await this.save(cart)
    return cart
  }

  async existsForCustomer(customerId: CustomerId): Promise<boolean> {
    const carts = this.getAllCarts()
    return carts.some(cart => cart.customerId === customerId.value)
  }

  private getAllCarts(): any[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error al leer carritos del localStorage:', error)
      return []
    }
  }

  private saveAllCarts(carts: any[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(carts))
    } catch (error) {
      console.error('Error al guardar carritos en localStorage:', error)
    }
  }

  private serializeCart(cart: CartEntity): any {
    return {
      id: cart.id.value,
      customerId: cart.customerId.value,
      items: cart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: {
          amount: item.price.amount,
          currency: item.price.currency
        },
        quantity: item.quantity
      }))
    }
  }

  private deserializeCart(data: any): CartEntity {
    const items = data.items.map((itemData: any) => 
      new CartItem(
        itemData.productId,
        itemData.productName,
        new Money(itemData.price.amount, itemData.price.currency),
        itemData.quantity
      )
    )

    return new CartEntity(
      new CartId(data.id),
      new CustomerId(data.customerId),
      items
    )
  }
}
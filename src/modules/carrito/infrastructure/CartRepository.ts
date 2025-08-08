import { Cart, CartItem } from '../domain/types';

export class CartRepository {
  private readonly STORAGE_KEY = 'mandorla-cart';

  async getCart(customerId?: string): Promise<Cart> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cart = JSON.parse(stored);
        return {
          ...cart,
          createdAt: new Date(cart.createdAt),
          updatedAt: new Date(cart.updatedAt)
        };
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }

    // Crear carrito vacío si no existe
    return {
      id: `cart-${Date.now()}`,
      items: [],
      customerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async saveCart(cart: Cart): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      throw new Error('No se pudo guardar el carrito');
    }
  }

  async clearCart(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  }
}
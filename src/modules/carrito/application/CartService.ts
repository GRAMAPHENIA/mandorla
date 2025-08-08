import { Cart, CartItem } from '../domain/types';
import { CartRepository } from '../infrastructure/CartRepository';

export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async getCart(customerId?: string): Promise<Cart> {
    return this.cartRepository.getCart(customerId);
  }

  async addToCart(item: CartItem, customerId?: string): Promise<void> {
    const cart = await this.cartRepository.getCart(customerId);
    
    const existingItem = cart.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    
    cart.updatedAt = new Date();
    await this.cartRepository.saveCart(cart);
  }

  async removeFromCart(itemId: string, customerId?: string): Promise<void> {
    const cart = await this.cartRepository.getCart(customerId);
    cart.items = cart.items.filter(item => item.id !== itemId);
    cart.updatedAt = new Date();
    await this.cartRepository.saveCart(cart);
  }

  async updateQuantity(itemId: string, quantity: number, customerId?: string): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(itemId, customerId);
      return;
    }

    const cart = await this.cartRepository.getCart(customerId);
    const item = cart.items.find(cartItem => cartItem.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      cart.updatedAt = new Date();
      await this.cartRepository.saveCart(cart);
    }
  }

  async clearCart(customerId?: string): Promise<void> {
    const cart = await this.cartRepository.getCart(customerId);
    cart.items = [];
    cart.updatedAt = new Date();
    await this.cartRepository.saveCart(cart);
  }

  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}
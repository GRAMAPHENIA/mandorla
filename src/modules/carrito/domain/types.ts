// Tipos de dominio para carrito
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartOperations {
  addItem(item: CartItem): void;
  removeItem(itemId: string): void;
  updateQuantity(itemId: string, quantity: number): void;
  clear(): void;
  getTotal(): number;
  getItemCount(): number;
}
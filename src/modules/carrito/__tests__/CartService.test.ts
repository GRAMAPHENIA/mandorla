import { CartService } from '../application/CartService';
import { CartRepository } from '../infrastructure/CartRepository';
import { Cart, CartItem } from '../domain/types';

// Mock del repositorio
jest.mock('../infrastructure/CartRepository');

describe('CartService', () => {
  let cartService: CartService;
  let mockCartRepository: jest.Mocked<CartRepository>;

  const mockCart: Cart = {
    id: 'cart-123',
    items: [],
    customerId: 'customer-1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCartItem: CartItem = {
    id: 'product-1',
    name: 'Galleta de Chocolate',
    price: 15.99,
    quantity: 2,
    image: '/galleta.jpg'
  };

  beforeEach(() => {
    mockCartRepository = new CartRepository() as jest.Mocked<CartRepository>;
    cartService = new CartService(mockCartRepository);
  });

  describe('addToCart', () => {
    it('debe agregar un nuevo item al carrito', async () => {
      mockCartRepository.getCart.mockResolvedValue({ ...mockCart });
      mockCartRepository.saveCart.mockResolvedValue();

      await cartService.addToCart(mockCartItem, 'customer-1');

      expect(mockCartRepository.saveCart).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [mockCartItem]
        })
      );
    });

    it('debe incrementar cantidad si el item ya existe', async () => {
      const cartWithItem = {
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 1 }]
      };
      
      mockCartRepository.getCart.mockResolvedValue(cartWithItem);
      mockCartRepository.saveCart.mockResolvedValue();

      await cartService.addToCart({ ...mockCartItem, quantity: 1 }, 'customer-1');

      expect(mockCartRepository.saveCart).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [expect.objectContaining({ quantity: 2 })]
        })
      );
    });
  });

  describe('removeFromCart', () => {
    it('debe remover un item del carrito', async () => {
      const cartWithItem = {
        ...mockCart,
        items: [mockCartItem]
      };
      
      mockCartRepository.getCart.mockResolvedValue(cartWithItem);
      mockCartRepository.saveCart.mockResolvedValue();

      await cartService.removeFromCart('product-1', 'customer-1');

      expect(mockCartRepository.saveCart).toHaveBeenCalledWith(
        expect.objectContaining({
          items: []
        })
      );
    });
  });

  describe('updateQuantity', () => {
    it('debe actualizar la cantidad de un item', async () => {
      const cartWithItem = {
        ...mockCart,
        items: [mockCartItem]
      };
      
      mockCartRepository.getCart.mockResolvedValue(cartWithItem);
      mockCartRepository.saveCart.mockResolvedValue();

      await cartService.updateQuantity('product-1', 5, 'customer-1');

      expect(mockCartRepository.saveCart).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [expect.objectContaining({ quantity: 5 })]
        })
      );
    });

    it('debe remover el item si la cantidad es 0', async () => {
      const cartWithItem = {
        ...mockCart,
        items: [mockCartItem]
      };
      
      mockCartRepository.getCart.mockResolvedValue(cartWithItem);
      mockCartRepository.saveCart.mockResolvedValue();

      await cartService.updateQuantity('product-1', 0, 'customer-1');

      expect(mockCartRepository.saveCart).toHaveBeenCalledWith(
        expect.objectContaining({
          items: []
        })
      );
    });
  });

  describe('calculateTotal', () => {
    it('debe calcular el total correctamente', () => {
      const items = [
        { ...mockCartItem, price: 10, quantity: 2 },
        { ...mockCartItem, id: 'product-2', price: 15, quantity: 1 }
      ];

      const total = cartService.calculateTotal(items);

      expect(total).toBe(35); // (10 * 2) + (15 * 1)
    });
  });

  describe('getItemCount', () => {
    it('debe contar el total de items', () => {
      const items = [
        { ...mockCartItem, quantity: 2 },
        { ...mockCartItem, id: 'product-2', quantity: 3 }
      ];

      const count = cartService.getItemCount(items);

      expect(count).toBe(5); // 2 + 3
    });
  });
});
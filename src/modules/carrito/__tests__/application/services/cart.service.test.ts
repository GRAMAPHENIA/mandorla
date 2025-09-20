import { CartService } from '../../../application/services/cart.service';
import { CartEntity } from '../../../domain/entities/cart-entity';
import { CartItem } from '../../../domain/entities/cart-item';
import { Money } from '../../../domain/value-objects/money';
import { ICartRepository } from '../../../domain/repositories/cart-repository.interface';
import {
  CartNotFoundError,
  InvalidQuantityError,
  EmptyCartError,
} from '../../../domain/errors/cart-errors';
import { AddToCartDto, UpdateCartItemDto } from '../../../application/dtos/cart.dto';

// Mock del repositorio
const mockCartRepository: jest.Mocked<ICartRepository> = {
  findById: jest.fn(),
  findByClienteId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
};

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService(mockCartRepository);
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('debería crear un carrito nuevo para un cliente', async () => {
      // Arrange
      const clienteId = 'cliente-123';
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.createCart(clienteId);

      // Assert
      expect(result).toBeInstanceOf(CartEntity);
      expect(result.clienteId).toBe(clienteId);
      expect(result.isEmpty()).toBe(true);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('getCart', () => {
    it('debería obtener un carrito existente por ID', async () => {
      // Arrange
      const cartId = 'cart-123';
      const mockCart = CartEntity.create('cliente-123', cartId);
      mockCartRepository.findById.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.getCart(cartId);

      // Assert
      expect(result).toBe(mockCart);
      expect(mockCartRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: cartId })
      );
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const cartId = 'cart-inexistente';
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.getCart(cartId)).rejects.toThrow(CartNotFoundError);
    });
  });

  describe('getCartByCliente', () => {
    it('debería obtener carrito por cliente ID', async () => {
      // Arrange
      const clienteId = 'cliente-123';
      const mockCart = CartEntity.create(clienteId);
      mockCartRepository.findByClienteId.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.getCartByCliente(clienteId);

      // Assert
      expect(result).toBe(mockCart);
      expect(mockCartRepository.findByClienteId).toHaveBeenCalledWith(clienteId);
    });

    it('debería crear carrito nuevo si no existe para el cliente', async () => {
      // Arrange
      const clienteId = 'cliente-nuevo';
      mockCartRepository.findByClienteId.mockResolvedValue(null);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.getCartByCliente(clienteId);

      // Assert
      expect(result).toBeInstanceOf(CartEntity);
      expect(result.clienteId).toBe(clienteId);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('addToCart', () => {
    const existingCart = CartEntity.create('cliente-123', 'cart-123');

    const addToCartDto: AddToCartDto = {
      cartId: 'cart-123',
      productId: 'producto-1',
      productName: 'Pan Integral',
      price: 2500,
      quantity: 2,
    };

    it('debería agregar producto al carrito exitosamente', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(existingCart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.addToCart(addToCartDto);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.hasItem('producto-1')).toBe(true);
      expect(result.getItemQuantity('producto-1')).toBe(2);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería incrementar cantidad si el producto ya existe', async () => {
      // Arrange
      const cartWithItem = CartEntity.create('cliente-123', 'cart-123');
      const existingItem = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });
      cartWithItem.addItem(existingItem);

      mockCartRepository.findById.mockResolvedValue(cartWithItem);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.addToCart(addToCartDto);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.getItemQuantity('producto-1')).toBe(3); // 1 + 2
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.addToCart(addToCartDto)).rejects.toThrow(CartNotFoundError);
    });

    it('debería validar cantidad positiva', async () => {
      // Arrange
      const invalidDto = { ...addToCartDto, quantity: 0 };

      // Act & Assert
      await expect(cartService.addToCart(invalidDto)).rejects.toThrow(InvalidQuantityError);
    });
  });

  describe('updateCartItem', () => {
    const cartWithItems = CartEntity.create('cliente-123', 'cart-123');

    beforeEach(() => {
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 3,
      });
      cartWithItems.addItem(item);
    });

    const updateDto: UpdateCartItemDto = {
      cartId: 'cart-123',
      productId: 'producto-1',
      quantity: 5,
    };

    it('debería actualizar cantidad de item exitosamente', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(cartWithItems);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.updateCartItem(updateDto);

      // Assert
      expect(result.getItemQuantity('producto-1')).toBe(5);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.updateCartItem(updateDto)).rejects.toThrow(CartNotFoundError);
    });

    it('debería validar cantidad positiva', async () => {
      // Arrange
      const invalidDto = { ...updateDto, quantity: -1 };
      mockCartRepository.findById.mockResolvedValue(cartWithItems);

      // Act & Assert
      await expect(cartService.updateCartItem(invalidDto)).rejects.toThrow(InvalidQuantityError);
    });
  });

  describe('removeFromCart', () => {
    const cartWithItems = CartEntity.create('cliente-123', 'cart-123');

    beforeEach(() => {
      const items = [
        CartItem.create({
          productId: 'producto-1',
          productName: 'Pan Integral',
          price: Money.create(2500),
          quantity: 2,
        }),
        CartItem.create({
          productId: 'producto-2',
          productName: 'Galletas',
          price: Money.create(1500),
          quantity: 1,
        }),
      ];
      items.forEach(item => cartWithItems.addItem(item));
    });

    it('debería remover item del carrito exitosamente', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(cartWithItems);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.removeFromCart('cart-123', 'producto-1');

      // Assert
      expect(result.hasItem('producto-1')).toBe(false);
      expect(result.hasItem('producto-2')).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.removeFromCart('cart-inexistente', 'producto-1')).rejects.toThrow(
        CartNotFoundError
      );
    });
  });

  describe('clearCart', () => {
    it('debería limpiar carrito exitosamente', async () => {
      // Arrange
      const cartWithItems = CartEntity.create('cliente-123', 'cart-123');
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cartWithItems.addItem(item);

      mockCartRepository.findById.mockResolvedValue(cartWithItems);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.clearCart('cart-123');

      // Assert
      expect(result.isEmpty()).toBe(true);
      expect(result.items).toHaveLength(0);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.clearCart('cart-inexistente')).rejects.toThrow(CartNotFoundError);
    });
  });

  describe('applyDiscount', () => {
    const cartWithItems = CartEntity.create('cliente-123', 'cart-123');

    beforeEach(() => {
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cartWithItems.addItem(item); // Subtotal: 5000
    });

    it('debería aplicar descuento exitosamente', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(cartWithItems);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.applyDiscount('cart-123', 500);

      // Assert
      expect(result.discount?.value).toBe(500);
      expect(result.getTotal().value).toBe(4500); // 5000 - 500
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.applyDiscount('cart-inexistente', 500)).rejects.toThrow(
        CartNotFoundError
      );
    });
  });

  describe('calculateTotals', () => {
    it('debería calcular totales del carrito', async () => {
      // Arrange
      const cart = CartEntity.create('cliente-123', 'cart-123');
      const items = [
        CartItem.create({
          productId: 'producto-1',
          productName: 'Pan Integral',
          price: Money.create(2500),
          quantity: 2,
        }),
        CartItem.create({
          productId: 'producto-2',
          productName: 'Galletas',
          price: Money.create(1500),
          quantity: 1,
        }),
      ];
      items.forEach(item => cart.addItem(item));
      cart.applyDiscount(Money.create(500));
      cart.applyTax(Money.create(480)); // 8% de (6500 - 500)

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act
      const result = await cartService.calculateTotals('cart-123');

      // Assert
      expect(result).toEqual({
        subtotal: 6500, // (2500 * 2) + (1500 * 1)
        discount: 500,
        tax: 480,
        total: 6480, // 6500 - 500 + 480
        itemCount: 3,
      });
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.calculateTotals('cart-inexistente')).rejects.toThrow(
        CartNotFoundError
      );
    });
  });

  describe('validateCartForCheckout', () => {
    it('debería validar carrito con items para checkout', async () => {
      // Arrange
      const cart = CartEntity.create('cliente-123', 'cart-123');
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });
      cart.addItem(item);

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act & Assert
      await expect(cartService.validateCartForCheckout('cart-123')).resolves.not.toThrow();
    });

    it('debería lanzar error si el carrito está vacío', async () => {
      // Arrange
      const emptyCart = CartEntity.create('cliente-123', 'cart-123');
      mockCartRepository.findById.mockResolvedValue(emptyCart);

      // Act & Assert
      await expect(cartService.validateCartForCheckout('cart-123')).rejects.toThrow(EmptyCartError);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.validateCartForCheckout('cart-inexistente')).rejects.toThrow(
        CartNotFoundError
      );
    });
  });
});

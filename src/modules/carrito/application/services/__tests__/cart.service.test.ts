import { CartService } from '../cart.service';
import { ICartRepository } from '../../../domain/repositories/cart-repository.interface';
import { CartEntity } from '../../../domain/entities/cart-entity';
import { CartId } from '../../../domain/value-objects/cart-id';
import { CartItem } from '../../../domain/value-objects/cart-item';
import { Money } from '../../../domain/value-objects/money';
import { AddToCartDto, UpdateCartItemDto } from '../../dtos/cart.dto';
import {
  CartNotFoundError,
  CartItemNotFoundError,
  InvalidQuantityError,
} from '../../../domain/errors/cart-errors';

describe('CartService', () => {
  let cartService: CartService;
  let mockCartRepository: jest.Mocked<ICartRepository>;

  beforeEach(() => {
    mockCartRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByCustomerId: jest.fn(),
    };

    cartService = new CartService(mockCartRepository);
  });

  describe('createCart', () => {
    it('debería crear un carrito nuevo correctamente', async () => {
      // Arrange
      const customerId = 'customer-123';
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.createCart(customerId);

      // Assert
      expect(result).toBeInstanceOf(CartEntity);
      expect(result.isEmpty()).toBe(true);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('getCart', () => {
    it('debería obtener un carrito existente', async () => {
      // Arrange
      const cartId = 'cart-123';
      const cart = CartEntity.create(CartId.create(cartId));

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act
      const result = await cartService.getCart(cartId);

      // Assert
      expect(result).toBe(cart);
      expect(mockCartRepository.findById).toHaveBeenCalledWith(CartId.create(cartId));
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const cartId = 'non-existent-cart';
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.getCart(cartId)).rejects.toThrow(CartNotFoundError);
    });
  });

  describe('addToCart', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create(CartId.create('cart-123'));
    });

    it('debería agregar un producto al carrito correctamente', async () => {
      // Arrange
      const addToCartDto: AddToCartDto = {
        cartId: 'cart-123',
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: 2500,
        quantity: 2,
      };

      mockCartRepository.findById.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.addToCart(addToCartDto);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-1');
      expect(result.items[0].quantity).toBe(2);
      expect(result.total.value).toBe(5000);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería incrementar cantidad si el producto ya existe', async () => {
      // Arrange
      const existingItem = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });
      cart.addItem(existingItem);

      const addToCartDto: AddToCartDto = {
        cartId: 'cart-123',
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: 2500,
        quantity: 2,
      };

      mockCartRepository.findById.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.addToCart(addToCartDto);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.total.value).toBe(7500);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const addToCartDto: AddToCartDto = {
        cartId: 'non-existent-cart',
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: 2500,
        quantity: 1,
      };

      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.addToCart(addToCartDto)).rejects.toThrow(CartNotFoundError);

      expect(mockCartRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar error con cantidad inválida', async () => {
      // Arrange
      const addToCartDto: AddToCartDto = {
        cartId: 'cart-123',
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: 2500,
        quantity: 0,
      };

      // Act & Assert
      await expect(cartService.addToCart(addToCartDto)).rejects.toThrow(InvalidQuantityError);
    });
  });

  describe('updateCartItem', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create(CartId.create('cart-123'));
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cart.addItem(item);
    });

    it('debería actualizar la cantidad de un item correctamente', async () => {
      // Arrange
      const updateDto: UpdateCartItemDto = {
        cartId: 'cart-123',
        productId: 'prod-1',
        quantity: 5,
      };

      mockCartRepository.findById.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.updateCartItem(updateDto);

      // Assert
      expect(result.items[0].quantity).toBe(5);
      expect(result.total.value).toBe(12500);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const updateDto: UpdateCartItemDto = {
        cartId: 'non-existent-cart',
        productId: 'prod-1',
        quantity: 3,
      };

      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.updateCartItem(updateDto)).rejects.toThrow(CartNotFoundError);
    });

    it('debería lanzar error si el item no existe en el carrito', async () => {
      // Arrange
      const updateDto: UpdateCartItemDto = {
        cartId: 'cart-123',
        productId: 'prod-inexistente',
        quantity: 3,
      };

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act & Assert
      await expect(cartService.updateCartItem(updateDto)).rejects.toThrow(CartItemNotFoundError);
    });
  });

  describe('removeFromCart', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create(CartId.create('cart-123'));

      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      const item2 = CartItem.create({
        productId: 'prod-2',
        productName: 'Galletas',
        price: Money.create(1500),
        quantity: 1,
      });

      cart.addItem(item1);
      cart.addItem(item2);
    });

    it('debería remover un item del carrito correctamente', async () => {
      // Arrange
      const cartId = 'cart-123';
      const productId = 'prod-1';

      mockCartRepository.findById.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.removeFromCart(cartId, productId);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-2');
      expect(result.total.value).toBe(1500);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const cartId = 'non-existent-cart';
      const productId = 'prod-1';

      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.removeFromCart(cartId, productId)).rejects.toThrow(
        CartNotFoundError
      );
    });

    it('debería lanzar error si el item no existe', async () => {
      // Arrange
      const cartId = 'cart-123';
      const productId = 'prod-inexistente';

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act & Assert
      await expect(cartService.removeFromCart(cartId, productId)).rejects.toThrow(
        CartItemNotFoundError
      );
    });
  });

  describe('clearCart', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create(CartId.create('cart-123'));
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cart.addItem(item);
    });

    it('debería limpiar el carrito correctamente', async () => {
      // Arrange
      const cartId = 'cart-123';

      mockCartRepository.findById.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.clearCart(cartId);

      // Assert
      expect(result.isEmpty()).toBe(true);
      expect(result.items).toHaveLength(0);
      expect(result.total.value).toBe(0);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const cartId = 'non-existent-cart';

      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.clearCart(cartId)).rejects.toThrow(CartNotFoundError);
    });
  });

  describe('getCartByCustomer', () => {
    it('debería obtener carrito por ID de cliente', async () => {
      // Arrange
      const customerId = 'customer-123';
      const cart = CartEntity.create();

      mockCartRepository.findByCustomerId.mockResolvedValue(cart);

      // Act
      const result = await cartService.getCartByCustomer(customerId);

      // Assert
      expect(result).toBe(cart);
      expect(mockCartRepository.findByCustomerId).toHaveBeenCalledWith(customerId);
    });

    it('debería crear nuevo carrito si el cliente no tiene uno', async () => {
      // Arrange
      const customerId = 'customer-123';

      mockCartRepository.findByCustomerId.mockResolvedValue(null);
      mockCartRepository.save.mockResolvedValue();

      // Act
      const result = await cartService.getCartByCustomer(customerId);

      // Assert
      expect(result).toBeInstanceOf(CartEntity);
      expect(result.isEmpty()).toBe(true);
      expect(mockCartRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('getCartSummary', () => {
    it('debería obtener resumen del carrito', async () => {
      // Arrange
      const cartId = 'cart-123';
      const cart = CartEntity.create(CartId.create(cartId));

      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      const item2 = CartItem.create({
        productId: 'prod-2',
        productName: 'Galletas',
        price: Money.create(1500),
        quantity: 3,
      });

      cart.addItem(item1);
      cart.addItem(item2);

      mockCartRepository.findById.mockResolvedValue(cart);

      // Act
      const result = await cartService.getCartSummary(cartId);

      // Assert
      expect(result).toEqual({
        cartId: cartId,
        itemCount: 5,
        total: 9500,
        items: [
          {
            productId: 'prod-1',
            productName: 'Pan Integral',
            price: 2500,
            quantity: 2,
            subtotal: 5000,
          },
          {
            productId: 'prod-2',
            productName: 'Galletas',
            price: 1500,
            quantity: 3,
            subtotal: 4500,
          },
        ],
      });
    });

    it('debería lanzar error si el carrito no existe', async () => {
      // Arrange
      const cartId = 'non-existent-cart';
      mockCartRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.getCartSummary(cartId)).rejects.toThrow(CartNotFoundError);
    });
  });
});

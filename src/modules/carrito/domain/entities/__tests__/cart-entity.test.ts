import { CartEntity } from '../cart-entity';
import { CartId } from '../../value-objects/cart-id';
import { Money } from '../../value-objects/money';
import { CartItem } from '../../value-objects/cart-item';
import {
  CartItemNotFoundError,
  InvalidQuantityError,
  EmptyCartError,
} from '../../errors/cart-errors';

describe('CartEntity', () => {
  describe('Creación de carrito', () => {
    it('debería crear un carrito vacío correctamente', () => {
      // Act
      const cart = CartEntity.create();

      // Assert
      expect(cart.id).toBeInstanceOf(CartId);
      expect(cart.items).toEqual([]);
      expect(cart.itemCount).toBe(0);
      expect(cart.total.value).toBe(0);
      expect(cart.isEmpty()).toBe(true);
    });

    it('debería crear carrito con ID específico', () => {
      // Arrange
      const cartId = CartId.create('test-cart-id');

      // Act
      const cart = CartEntity.create(cartId);

      // Assert
      expect(cart.id.value).toBe('test-cart-id');
    });
  });

  describe('Agregar items al carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();
    });

    it('debería agregar un item nuevo correctamente', () => {
      // Arrange
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      // Act
      cart.addItem(item);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.itemCount).toBe(2);
      expect(cart.total.value).toBe(5000);
      expect(cart.isEmpty()).toBe(false);
    });

    it('debería incrementar cantidad si el producto ya existe', () => {
      // Arrange
      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      const item2 = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });

      // Act
      cart.addItem(item1);
      cart.addItem(item2);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.itemCount).toBe(3);
      expect(cart.total.value).toBe(7500);
    });

    it('debería agregar múltiples productos diferentes', () => {
      // Arrange
      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });

      const item2 = CartItem.create({
        productId: 'prod-2',
        productName: 'Galletas Chocolate',
        price: Money.create(1500),
        quantity: 2,
      });

      // Act
      cart.addItem(item1);
      cart.addItem(item2);

      // Assert
      expect(cart.items).toHaveLength(2);
      expect(cart.itemCount).toBe(3);
      expect(cart.total.value).toBe(5500); // 2500 + (1500 * 2)
    });
  });

  describe('Actualizar cantidad de items', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 3,
      });
      cart.addItem(item);
    });

    it('debería actualizar la cantidad correctamente', () => {
      // Act
      cart.updateItemQuantity('prod-1', 5);

      // Assert
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.itemCount).toBe(5);
      expect(cart.total.value).toBe(12500);
    });

    it('debería lanzar error si el item no existe', () => {
      // Act & Assert
      expect(() => cart.updateItemQuantity('prod-inexistente', 2)).toThrow(CartItemNotFoundError);
    });

    it('debería lanzar error con cantidad inválida', () => {
      // Act & Assert
      expect(() => cart.updateItemQuantity('prod-1', 0)).toThrow(InvalidQuantityError);

      expect(() => cart.updateItemQuantity('prod-1', -1)).toThrow(InvalidQuantityError);
    });
  });

  describe('Remover items del carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();

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

    it('debería remover un item correctamente', () => {
      // Act
      cart.removeItem('prod-1');

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('prod-2');
      expect(cart.itemCount).toBe(1);
      expect(cart.total.value).toBe(1500);
    });

    it('debería lanzar error si el item no existe', () => {
      // Act & Assert
      expect(() => cart.removeItem('prod-inexistente')).toThrow(CartItemNotFoundError);
    });
  });

  describe('Limpiar carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();

      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      cart.addItem(item);
    });

    it('debería limpiar el carrito correctamente', () => {
      // Act
      cart.clear();

      // Assert
      expect(cart.items).toEqual([]);
      expect(cart.itemCount).toBe(0);
      expect(cart.total.value).toBe(0);
      expect(cart.isEmpty()).toBe(true);
    });
  });

  describe('Obtener item específico', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();

      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      cart.addItem(item);
    });

    it('debería obtener un item existente', () => {
      // Act
      const item = cart.getItem('prod-1');

      // Assert
      expect(item).toBeDefined();
      expect(item?.productId).toBe('prod-1');
      expect(item?.productName).toBe('Pan Integral');
      expect(item?.quantity).toBe(2);
    });

    it('debería retornar undefined para item inexistente', () => {
      // Act
      const item = cart.getItem('prod-inexistente');

      // Assert
      expect(item).toBeUndefined();
    });
  });

  describe('Verificar si tiene item', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();

      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      cart.addItem(item);
    });

    it('debería retornar true para item existente', () => {
      // Act & Assert
      expect(cart.hasItem('prod-1')).toBe(true);
    });

    it('debería retornar false para item inexistente', () => {
      // Act & Assert
      expect(cart.hasItem('prod-inexistente')).toBe(false);
    });
  });

  describe('Validaciones de checkout', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create();
    });

    it('debería validar carrito para checkout', () => {
      // Arrange
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cart.addItem(item);

      // Act & Assert
      expect(() => cart.validateForCheckout()).not.toThrow();
    });

    it('debería lanzar error si el carrito está vacío', () => {
      // Act & Assert
      expect(() => cart.validateForCheckout()).toThrow(EmptyCartError);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const cart = CartEntity.create();
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cart.addItem(item);

      // Act
      const persistence = cart.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: cart.id.value,
        items: [
          {
            productId: 'prod-1',
            productName: 'Pan Integral',
            price: 2500,
            quantity: 2,
            subtotal: 5000,
          },
        ],
        total: 5000,
        itemCount: 2,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear desde objeto de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'test-cart-id',
        items: [
          {
            productId: 'prod-1',
            productName: 'Pan Integral',
            price: 2500,
            quantity: 2,
            subtotal: 5000,
          },
        ],
        total: 5000,
        itemCount: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const cart = CartEntity.fromPersistence(persistenceData);

      // Assert
      expect(cart.id.value).toBe('test-cart-id');
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('prod-1');
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.total.value).toBe(5000);
      expect(cart.itemCount).toBe(2);
    });
  });
});

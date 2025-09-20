import { CartEntity } from '../../../domain/entities/cart-entity';
import { CartId } from '../../../domain/value-objects/cart-id';
import { CartItem } from '../../../domain/entities/cart-item';
import { Money } from '../../../domain/value-objects/money';
import {
  CartItemNotFoundError,
  InvalidQuantityError,
  EmptyCartError,
} from '../../../domain/errors/cart-errors';

describe('CartEntity', () => {
  describe('Creación de carrito', () => {
    it('debería crear un carrito vacío', () => {
      // Act
      const cart = CartEntity.create('cliente-123');

      // Assert
      expect(cart.clienteId).toBe('cliente-123');
      expect(cart.items).toHaveLength(0);
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getTotalItems()).toBe(0);
      expect(cart.getSubtotal().value).toBe(0);
      expect(cart.id).toBeInstanceOf(CartId);
    });

    it('debería crear carrito con ID específico', () => {
      // Arrange
      const cartId = 'cart-specific-id';

      // Act
      const cart = CartEntity.create('cliente-123', cartId);

      // Assert
      expect(cart.id.value).toBe(cartId);
      expect(cart.clienteId).toBe('cliente-123');
    });
  });

  describe('Agregar items al carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create('cliente-123');
    });

    it('debería agregar un item nuevo al carrito', () => {
      // Arrange
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      // Act
      cart.addItem(item);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.isEmpty()).toBe(false);
      expect(cart.getTotalItems()).toBe(2);
      expect(cart.getSubtotal().value).toBe(5000);
    });

    it('debería incrementar cantidad si el producto ya existe', () => {
      // Arrange
      const item1 = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      const item2 = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });

      // Act
      cart.addItem(item1);
      cart.addItem(item2);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.getTotalItems()).toBe(3);
      expect(cart.getSubtotal().value).toBe(7500);
    });

    it('debería agregar múltiples productos diferentes', () => {
      // Arrange
      const item1 = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });

      const item2 = CartItem.create({
        productId: 'producto-2',
        productName: 'Galletas',
        price: Money.create(1500),
        quantity: 2,
      });

      // Act
      cart.addItem(item1);
      cart.addItem(item2);

      // Assert
      expect(cart.items).toHaveLength(2);
      expect(cart.getTotalItems()).toBe(3);
      expect(cart.getSubtotal().value).toBe(5500); // 2500 + (1500 * 2)
    });
  });

  describe('Actualizar cantidad de items', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create('cliente-123');
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 3,
      });
      cart.addItem(item);
    });

    it('debería actualizar cantidad de un item existente', () => {
      // Act
      cart.updateItemQuantity('producto-1', 5);

      // Assert
      expect(cart.getTotalItems()).toBe(5);
      expect(cart.getSubtotal().value).toBe(12500);
    });

    it('debería lanzar error si el item no existe', () => {
      // Act & Assert
      expect(() => cart.updateItemQuantity('producto-inexistente', 2)).toThrow(
        CartItemNotFoundError
      );
    });

    it('debería lanzar error con cantidad inválida', () => {
      // Act & Assert
      expect(() => cart.updateItemQuantity('producto-1', 0)).toThrow(InvalidQuantityError);

      expect(() => cart.updateItemQuantity('producto-1', -1)).toThrow(InvalidQuantityError);
    });
  });

  describe('Remover items del carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create('cliente-123');

      const item1 = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      const item2 = CartItem.create({
        productId: 'producto-2',
        productName: 'Galletas',
        price: Money.create(1500),
        quantity: 1,
      });

      cart.addItem(item1);
      cart.addItem(item2);
    });

    it('debería remover un item específico', () => {
      // Act
      cart.removeItem('producto-1');

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.getTotalItems()).toBe(1);
      expect(cart.getSubtotal().value).toBe(1500);
      expect(cart.hasItem('producto-1')).toBe(false);
      expect(cart.hasItem('producto-2')).toBe(true);
    });

    it('debería lanzar error si el item no existe', () => {
      // Act & Assert
      expect(() => cart.removeItem('producto-inexistente')).toThrow(CartItemNotFoundError);
    });

    it('debería limpiar todo el carrito', () => {
      // Act
      cart.clear();

      // Assert
      expect(cart.items).toHaveLength(0);
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getTotalItems()).toBe(0);
      expect(cart.getSubtotal().value).toBe(0);
    });
  });

  describe('Cálculos del carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create('cliente-123');

      // Agregar varios items para probar cálculos
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
          quantity: 3,
        }),
        CartItem.create({
          productId: 'producto-3',
          productName: 'Croissant',
          price: Money.create(1200),
          quantity: 1,
        }),
      ];

      items.forEach(item => cart.addItem(item));
    });

    it('debería calcular subtotal correctamente', () => {
      // Act
      const subtotal = cart.getSubtotal();

      // Assert
      // (2500 * 2) + (1500 * 3) + (1200 * 1) = 5000 + 4500 + 1200 = 10700
      expect(subtotal.value).toBe(10700);
    });

    it('debería calcular total de items correctamente', () => {
      // Act
      const totalItems = cart.getTotalItems();

      // Assert
      expect(totalItems).toBe(6); // 2 + 3 + 1
    });

    it('debería aplicar descuento correctamente', () => {
      // Arrange
      const descuento = Money.create(1000);

      // Act
      cart.applyDiscount(descuento);
      const total = cart.getTotal();

      // Assert
      expect(cart.discount?.value).toBe(1000);
      expect(total.value).toBe(9700); // 10700 - 1000
    });

    it('debería calcular total con impuestos', () => {
      // Arrange
      const impuestos = Money.create(856); // 8% de 10700

      // Act
      cart.applyTax(impuestos);
      const total = cart.getTotal();

      // Assert
      expect(cart.tax?.value).toBe(856);
      expect(total.value).toBe(11556); // 10700 + 856
    });

    it('debería calcular total con descuento e impuestos', () => {
      // Arrange
      const descuento = Money.create(1000);
      const impuestos = Money.create(776); // 8% de (10700 - 1000)

      // Act
      cart.applyDiscount(descuento);
      cart.applyTax(impuestos);
      const total = cart.getTotal();

      // Assert
      expect(total.value).toBe(10476); // 10700 - 1000 + 776
    });
  });

  describe('Consultas del carrito', () => {
    let cart: CartEntity;

    beforeEach(() => {
      cart = CartEntity.create('cliente-123');

      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });

      cart.addItem(item);
    });

    it('debería verificar si tiene un item específico', () => {
      // Act & Assert
      expect(cart.hasItem('producto-1')).toBe(true);
      expect(cart.hasItem('producto-inexistente')).toBe(false);
    });

    it('debería obtener un item específico', () => {
      // Act
      const item = cart.getItem('producto-1');

      // Assert
      expect(item).toBeDefined();
      expect(item?.productId).toBe('producto-1');
      expect(item?.quantity).toBe(2);
    });

    it('debería retornar undefined para item inexistente', () => {
      // Act
      const item = cart.getItem('producto-inexistente');

      // Assert
      expect(item).toBeUndefined();
    });

    it('debería obtener cantidad de un producto específico', () => {
      // Act
      const quantity = cart.getItemQuantity('producto-1');

      // Assert
      expect(quantity).toBe(2);
    });

    it('debería retornar 0 para producto inexistente', () => {
      // Act
      const quantity = cart.getItemQuantity('producto-inexistente');

      // Assert
      expect(quantity).toBe(0);
    });
  });

  describe('Validaciones de checkout', () => {
    it('debería validar carrito para checkout', () => {
      // Arrange
      const cart = CartEntity.create('cliente-123');
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 1,
      });
      cart.addItem(item);

      // Act & Assert
      expect(() => cart.validateForCheckout()).not.toThrow();
    });

    it('debería lanzar error si el carrito está vacío', () => {
      // Arrange
      const cart = CartEntity.create('cliente-123');

      // Act & Assert
      expect(() => cart.validateForCheckout()).toThrow(EmptyCartError);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const cart = CartEntity.create('cliente-123');
      const item = CartItem.create({
        productId: 'producto-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      });
      cart.addItem(item);
      cart.applyDiscount(Money.create(500));

      // Act
      const persistenceData = cart.toPersistence();

      // Assert
      expect(persistenceData).toEqual({
        id: cart.id.value,
        clienteId: 'cliente-123',
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: 2500,
            quantity: 2,
          }),
        ]),
        discount: 500,
        tax: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'cart-123',
        clienteId: 'cliente-456',
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: 2500,
            quantity: 2,
          },
        ],
        discount: 500,
        tax: 200,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const cart = CartEntity.fromPersistence(persistenceData);

      // Assert
      expect(cart.id.value).toBe('cart-123');
      expect(cart.clienteId).toBe('cliente-456');
      expect(cart.items).toHaveLength(1);
      expect(cart.discount?.value).toBe(500);
      expect(cart.tax?.value).toBe(200);
    });
  });
});

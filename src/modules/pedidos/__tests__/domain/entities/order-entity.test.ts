import { OrderEntity } from '../../../domain/entities/order-entity';
import { OrderId } from '../../../domain/value-objects/order-id';
import { OrderItem } from '../../../domain/entities/order-item';
import { Money } from '../../../domain/value-objects/money';
import { OrderStatus, PaymentMethod } from '../../../domain/types';
import {
  InvalidOrderStateError,
  OrderAlreadyPaidError,
  OrderCannotBeCancelledError,
} from '../../../domain/errors/order-errors';

describe('OrderEntity', () => {
  describe('Creación de pedido', () => {
    const orderData = {
      clienteId: 'cliente-123',
      clienteEmail: 'cliente@test.com',
      clienteNombre: 'Juan Pérez',
      clienteTelefono: '+57 300 123 4567',
      direccionEntrega: 'Calle 123 #45-67',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      items: [
        {
          productId: 'producto-1',
          productName: 'Pan Integral',
          price: Money.create(2500),
          quantity: 2,
        },
      ],
    };

    it('debería crear un pedido válido', () => {
      // Act
      const order = OrderEntity.create(orderData);

      // Assert
      expect(order.clienteId).toBe('cliente-123');
      expect(order.clienteEmail).toBe('cliente@test.com');
      expect(order.clienteNombre).toBe('Juan Pérez');
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(order.items).toHaveLength(1);
      expect(order.id).toBeInstanceOf(OrderId);
      expect(order.isPaid).toBe(false);
      expect(order.isCancelled).toBe(false);
    });

    it('debería calcular totales correctamente', () => {
      // Act
      const order = OrderEntity.create(orderData);

      // Assert
      expect(order.getSubtotal().value).toBe(5000); // 2500 * 2
      expect(order.getTotal().value).toBe(5000); // Sin descuentos ni impuestos inicialmente
    });

    it('debería crear pedido con ID específico', () => {
      // Arrange
      const orderId = 'order-specific-id';

      // Act
      const order = OrderEntity.create(orderData, orderId);

      // Assert
      expect(order.id.value).toBe(orderId);
    });
  });

  describe('Gestión de estado del pedido', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: Money.create(2500),
            quantity: 1,
          },
        ],
      });
    });

    it('debería confirmar pedido desde estado pendiente', () => {
      // Act
      order.confirm();

      // Assert
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    it('debería marcar como pagado', () => {
      // Arrange
      order.confirm();

      // Act
      order.markAsPaid('payment-123');

      // Assert
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.isPaid).toBe(true);
      expect(order.paymentId).toBe('payment-123');
    });

    it('debería procesar pedido después de pago', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');

      // Act
      order.process();

      // Assert
      expect(order.status).toBe(OrderStatus.PROCESSING);
    });

    it('debería marcar como listo para entrega', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.process();

      // Act
      order.markAsReady();

      // Assert
      expect(order.status).toBe(OrderStatus.READY);
    });

    it('debería completar pedido', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.process();
      order.markAsReady();

      // Act
      order.complete();

      // Assert
      expect(order.status).toBe(OrderStatus.COMPLETED);
    });

    it('debería cancelar pedido desde estado pendiente', () => {
      // Act
      order.cancel('Cliente canceló');

      // Assert
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.isCancelled).toBe(true);
      expect(order.cancellationReason).toBe('Cliente canceló');
    });
  });

  describe('Validaciones de transiciones de estado', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: Money.create(2500),
            quantity: 1,
          },
        ],
      });
    });

    it('debería lanzar error al marcar como pagado sin confirmar', () => {
      // Act & Assert
      expect(() => order.markAsPaid('payment-123')).toThrow(InvalidOrderStateError);
    });

    it('debería lanzar error al procesar sin pagar', () => {
      // Arrange
      order.confirm();

      // Act & Assert
      expect(() => order.process()).toThrow(InvalidOrderStateError);
    });

    it('debería lanzar error al marcar como listo sin procesar', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');

      // Act & Assert
      expect(() => order.markAsReady()).toThrow(InvalidOrderStateError);
    });

    it('debería lanzar error al completar sin estar listo', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');

      // Act & Assert
      expect(() => order.complete()).toThrow(InvalidOrderStateError);
    });

    it('debería lanzar error al pagar pedido ya pagado', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');

      // Act & Assert
      expect(() => order.markAsPaid('payment-456')).toThrow(OrderAlreadyPaidError);
    });

    it('debería lanzar error al cancelar pedido ya procesado', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.process();

      // Act & Assert
      expect(() => order.cancel('Intento de cancelación')).toThrow(OrderCannotBeCancelledError);
    });
  });

  describe('Gestión de descuentos e impuestos', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: Money.create(2500),
            quantity: 2,
          },
          {
            productId: 'producto-2',
            productName: 'Galletas',
            price: Money.create(1500),
            quantity: 1,
          },
        ],
      });
    });

    it('debería aplicar descuento correctamente', () => {
      // Arrange
      const descuento = Money.create(1000);

      // Act
      order.applyDiscount(descuento);

      // Assert
      expect(order.discount?.value).toBe(1000);
      expect(order.getTotal().value).toBe(5500); // 6500 - 1000
    });

    it('debería aplicar impuestos correctamente', () => {
      // Arrange
      const impuestos = Money.create(520); // 8% de 6500

      // Act
      order.applyTax(impuestos);

      // Assert
      expect(order.tax?.value).toBe(520);
      expect(order.getTotal().value).toBe(7020); // 6500 + 520
    });

    it('debería calcular total con descuento e impuestos', () => {
      // Arrange
      const descuento = Money.create(1000);
      const impuestos = Money.create(440); // 8% de (6500 - 1000)

      // Act
      order.applyDiscount(descuento);
      order.applyTax(impuestos);

      // Assert
      expect(order.getTotal().value).toBe(5940); // 6500 - 1000 + 440
    });
  });

  describe('Consultas del pedido', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: Money.create(2500),
            quantity: 2,
          },
          {
            productId: 'producto-2',
            productName: 'Galletas',
            price: Money.create(1500),
            quantity: 3,
          },
        ],
      });
    });

    it('debería obtener cantidad total de items', () => {
      // Act
      const totalItems = order.getTotalItems();

      // Assert
      expect(totalItems).toBe(5); // 2 + 3
    });

    it('debería verificar si puede ser cancelado', () => {
      // Assert
      expect(order.canBeCancelled()).toBe(true);

      // Arrange - cambiar estado
      order.confirm();
      order.markAsPaid('payment-123');
      order.process();

      // Assert
      expect(order.canBeCancelled()).toBe(false);
    });

    it('debería verificar si puede ser modificado', () => {
      // Assert
      expect(order.canBeModified()).toBe(true);

      // Arrange - cambiar estado
      order.confirm();

      // Assert
      expect(order.canBeModified()).toBe(false);
    });

    it('debería obtener tiempo estimado de entrega', () => {
      // Act
      const estimatedTime = order.getEstimatedDeliveryTime();

      // Assert
      expect(estimatedTime).toBeGreaterThan(0);
      expect(estimatedTime).toBeLessThanOrEqual(120); // Máximo 2 horas
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const order = OrderEntity.create({
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        items: [
          {
            productId: 'producto-1',
            productName: 'Pan Integral',
            price: Money.create(2500),
            quantity: 2,
          },
        ],
      });

      order.applyDiscount(Money.create(500));

      // Act
      const persistenceData = order.toPersistence();

      // Assert
      expect(persistenceData).toEqual({
        id: order.id.value,
        clienteId: 'cliente-123',
        clienteEmail: 'cliente@test.com',
        clienteNombre: 'Juan Pérez',
        clienteTelefono: '+57 300 123 4567',
        direccionEntrega: 'Calle 123 #45-67',
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentId: null,
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
        cancellationReason: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'order-123',
        clienteId: 'cliente-456',
        clienteEmail: 'test@example.com',
        clienteNombre: 'María García',
        clienteTelefono: '+57 301 234 5678',
        direccionEntrega: 'Carrera 45 #12-34',
        status: OrderStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        paymentId: 'payment-789',
        items: [
          {
            productId: 'producto-1',
            productName: 'Croissant',
            price: 1200,
            quantity: 3,
          },
        ],
        discount: 200,
        tax: 288,
        cancellationReason: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const order = OrderEntity.fromPersistence(persistenceData);

      // Assert
      expect(order.id.value).toBe('order-123');
      expect(order.clienteId).toBe('cliente-456');
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentId).toBe('payment-789');
      expect(order.items).toHaveLength(1);
      expect(order.discount?.value).toBe(200);
      expect(order.tax?.value).toBe(288);
      expect(order.isPaid).toBe(true);
    });
  });
});

import { OrderEntity } from '../order-entity';
import { OrderId } from '../../value-objects/order-id';
import { Money } from '../../value-objects/money';
import { OrderItem } from '../../value-objects/order-item';
import { CustomerInfo } from '../../value-objects/customer-info';
import { OrderStatus, PaymentMethod } from '../../types';
import {
  InvalidOrderStateError,
  EmptyOrderError,
  OrderAlreadyPaidError,
} from '../../errors/order-errors';

describe('OrderEntity', () => {
  let customerInfo: CustomerInfo;
  let orderItems: OrderItem[];

  beforeEach(() => {
    customerInfo = CustomerInfo.create({
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '+54911234567',
      address: 'Av. Corrientes 1234, CABA',
    });

    orderItems = [
      OrderItem.create({
        productId: 'prod-1',
        productName: 'Pan Integral',
        price: Money.create(2500),
        quantity: 2,
      }),
      OrderItem.create({
        productId: 'prod-2',
        productName: 'Galletas Chocolate',
        price: Money.create(1500),
        quantity: 3,
      }),
    ];
  });

  describe('Creación de pedido', () => {
    it('debería crear un pedido correctamente', () => {
      // Act
      const order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });

      // Assert
      expect(order.id).toBeInstanceOf(OrderId);
      expect(order.customerInfo).toBe(customerInfo);
      expect(order.items).toEqual(orderItems);
      expect(order.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.subtotal.value).toBe(9500); // (2500*2) + (1500*3)
      expect(order.total.value).toBe(9500);
      expect(order.itemCount).toBe(5);
    });

    it('debería crear pedido con ID específico', () => {
      // Arrange
      const orderId = OrderId.create('test-order-id');

      // Act
      const order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CASH,
        orderId,
      });

      // Assert
      expect(order.id.value).toBe('test-order-id');
    });

    it('debería lanzar error si no hay items', () => {
      // Act & Assert
      expect(() =>
        OrderEntity.create({
          customerInfo,
          items: [],
          paymentMethod: PaymentMethod.CASH,
        })
      ).toThrow(EmptyOrderError);
    });
  });

  describe('Gestión de estado del pedido', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });
    });

    it('debería confirmar pedido correctamente', () => {
      // Act
      order.confirm();

      // Assert
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.confirmedAt).toBeInstanceOf(Date);
    });

    it('debería marcar como pagado correctamente', () => {
      // Arrange
      const paymentId = 'payment-123';

      // Act
      order.markAsPaid(paymentId);

      // Assert
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentId).toBe(paymentId);
      expect(order.paidAt).toBeInstanceOf(Date);
    });

    it('debería lanzar error si ya está pagado', () => {
      // Arrange
      order.markAsPaid('payment-123');

      // Act & Assert
      expect(() => order.markAsPaid('payment-456')).toThrow(OrderAlreadyPaidError);
    });

    it('debería marcar como en preparación', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');

      // Act
      order.startPreparation();

      // Assert
      expect(order.status).toBe(OrderStatus.PREPARING);
      expect(order.preparationStartedAt).toBeInstanceOf(Date);
    });

    it('debería lanzar error si no está pagado al iniciar preparación', () => {
      // Act & Assert
      expect(() => order.startPreparation()).toThrow(InvalidOrderStateError);
    });

    it('debería marcar como listo para entrega', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.startPreparation();

      // Act
      order.markAsReady();

      // Assert
      expect(order.status).toBe(OrderStatus.READY);
      expect(order.readyAt).toBeInstanceOf(Date);
    });

    it('debería completar pedido correctamente', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.startPreparation();
      order.markAsReady();

      // Act
      order.complete();

      // Assert
      expect(order.status).toBe(OrderStatus.COMPLETED);
      expect(order.completedAt).toBeInstanceOf(Date);
    });

    it('debería cancelar pedido correctamente', () => {
      // Arrange
      const reason = 'Cliente canceló el pedido';

      // Act
      order.cancel(reason);

      // Assert
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.cancellationReason).toBe(reason);
      expect(order.cancelledAt).toBeInstanceOf(Date);
    });

    it('debería lanzar error al cancelar pedido completado', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.startPreparation();
      order.markAsReady();
      order.complete();

      // Act & Assert
      expect(() => order.cancel('Razón')).toThrow(InvalidOrderStateError);
    });
  });

  describe('Cálculos de precios', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });
    });

    it('debería calcular subtotal correctamente', () => {
      // Assert
      expect(order.subtotal.value).toBe(9500);
    });

    it('debería aplicar descuento correctamente', () => {
      // Arrange
      const discount = Money.create(1000);

      // Act
      order.applyDiscount(discount, 'Descuento VIP');

      // Assert
      expect(order.discount?.value).toBe(1000);
      expect(order.discountReason).toBe('Descuento VIP');
      expect(order.total.value).toBe(8500); // 9500 - 1000
    });

    it('debería aplicar impuestos correctamente', () => {
      // Arrange
      const tax = Money.create(760); // 8% de 9500

      // Act
      order.applyTax(tax);

      // Assert
      expect(order.tax?.value).toBe(760);
      expect(order.total.value).toBe(10260); // 9500 + 760
    });

    it('debería calcular total con descuento e impuestos', () => {
      // Arrange
      const discount = Money.create(500);
      const tax = Money.create(720); // 8% de (9500 - 500)

      // Act
      order.applyDiscount(discount, 'Descuento promocional');
      order.applyTax(tax);

      // Assert
      expect(order.total.value).toBe(9720); // 9500 - 500 + 720
    });
  });

  describe('Verificaciones de estado', () => {
    let order: OrderEntity;

    beforeEach(() => {
      order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });
    });

    it('debería verificar si está pendiente', () => {
      expect(order.isPending()).toBe(true);
      expect(order.isConfirmed()).toBe(false);
      expect(order.isPaid()).toBe(false);
    });

    it('debería verificar si está confirmado', () => {
      // Act
      order.confirm();

      // Assert
      expect(order.isPending()).toBe(false);
      expect(order.isConfirmed()).toBe(true);
      expect(order.isPaid()).toBe(false);
    });

    it('debería verificar si está pagado', () => {
      // Act
      order.markAsPaid('payment-123');

      // Assert
      expect(order.isPaid()).toBe(true);
      expect(order.isCompleted()).toBe(false);
      expect(order.isCancelled()).toBe(false);
    });

    it('debería verificar si está completado', () => {
      // Arrange
      order.confirm();
      order.markAsPaid('payment-123');
      order.startPreparation();
      order.markAsReady();

      // Act
      order.complete();

      // Assert
      expect(order.isCompleted()).toBe(true);
      expect(order.isCancelled()).toBe(false);
    });

    it('debería verificar si está cancelado', () => {
      // Act
      order.cancel('Razón de cancelación');

      // Assert
      expect(order.isCancelled()).toBe(true);
      expect(order.isCompleted()).toBe(false);
    });

    it('debería verificar si puede ser cancelado', () => {
      expect(order.canBeCancelled()).toBe(true);

      order.confirm();
      expect(order.canBeCancelled()).toBe(true);

      order.markAsPaid('payment-123');
      expect(order.canBeCancelled()).toBe(true);

      order.startPreparation();
      order.markAsReady();
      order.complete();
      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const order = OrderEntity.create({
        customerInfo,
        items: orderItems,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });

      order.confirm();
      order.markAsPaid('payment-123');

      // Act
      const persistence = order.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: order.id.value,
        customerInfo: {
          name: 'Juan Pérez',
          email: 'juan@email.com',
          phone: '+54911234567',
          address: 'Av. Corrientes 1234, CABA',
        },
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
            productName: 'Galletas Chocolate',
            price: 1500,
            quantity: 3,
            subtotal: 4500,
          },
        ],
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: OrderStatus.PAID,
        subtotal: 9500,
        total: 9500,
        itemCount: 5,
        paymentId: 'payment-123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        confirmedAt: expect.any(Date),
        paidAt: expect.any(Date),
      });
    });

    it('debería crear desde objeto de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'test-order-id',
        customerInfo: {
          name: 'María García',
          email: 'maria@email.com',
          phone: '+54911234567',
          address: 'Av. Santa Fe 5678, CABA',
        },
        items: [
          {
            productId: 'prod-1',
            productName: 'Torta Chocolate',
            price: 15000,
            quantity: 1,
            subtotal: 15000,
          },
        ],
        paymentMethod: PaymentMethod.CASH,
        status: OrderStatus.COMPLETED,
        subtotal: 15000,
        total: 15000,
        itemCount: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        completedAt: new Date('2024-01-02'),
      };

      // Act
      const order = OrderEntity.fromPersistence(persistenceData);

      // Assert
      expect(order.id.value).toBe('test-order-id');
      expect(order.customerInfo.name).toBe('María García');
      expect(order.items).toHaveLength(1);
      expect(order.items[0].productName).toBe('Torta Chocolate');
      expect(order.paymentMethod).toBe(PaymentMethod.CASH);
      expect(order.status).toBe(OrderStatus.COMPLETED);
      expect(order.total.value).toBe(15000);
      expect(order.isCompleted()).toBe(true);
    });
  });
});

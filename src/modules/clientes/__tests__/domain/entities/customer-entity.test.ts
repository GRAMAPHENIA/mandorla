import { CustomerEntity } from '../../../domain/entities/customer-entity';
import { CustomerId } from '../../../domain/value-objects/customer-id';
import { Email } from '../../../domain/value-objects/email';
import { Phone } from '../../../domain/value-objects/phone';
import {
  InvalidEmailError,
  InvalidPhoneError,
  InvalidCustomerDataError,
} from '../../../domain/errors/customer-errors';

describe('CustomerEntity', () => {
  describe('Creación de cliente', () => {
    const validCustomerData = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67, Bogotá',
    };

    it('debería crear un cliente válido', () => {
      // Act
      const customer = CustomerEntity.create(validCustomerData);

      // Assert
      expect(customer.nombre).toBe('Juan Pérez');
      expect(customer.email.value).toBe('juan.perez@email.com');
      expect(customer.telefono.value).toBe('+57 300 123 4567');
      expect(customer.direccion).toBe('Calle 123 #45-67, Bogotá');
      expect(customer.isVip).toBe(false);
      expect(customer.totalOrders).toBe(0);
      expect(customer.totalSpent.value).toBe(0);
      expect(customer.id).toBeInstanceOf(CustomerId);
    });

    it('debería crear cliente con ID específico', () => {
      // Arrange
      const customerId = 'customer-specific-id';

      // Act
      const customer = CustomerEntity.create(validCustomerData, customerId);

      // Assert
      expect(customer.id.value).toBe(customerId);
    });

    it('debería lanzar error con email inválido', () => {
      // Arrange
      const invalidData = { ...validCustomerData, email: 'email-invalido' };

      // Act & Assert
      expect(() => CustomerEntity.create(invalidData)).toThrow(InvalidEmailError);
    });

    it('debería lanzar error con teléfono inválido', () => {
      // Arrange
      const invalidData = { ...validCustomerData, telefono: '123' };

      // Act & Assert
      expect(() => CustomerEntity.create(invalidData)).toThrow(InvalidPhoneError);
    });

    it('debería lanzar error con nombre vacío', () => {
      // Arrange
      const invalidData = { ...validCustomerData, nombre: '' };

      // Act & Assert
      expect(() => CustomerEntity.create(invalidData)).toThrow(InvalidCustomerDataError);
    });

    it('debería lanzar error con dirección vacía', () => {
      // Arrange
      const invalidData = { ...validCustomerData, direccion: '' };

      // Act & Assert
      expect(() => CustomerEntity.create(invalidData)).toThrow(InvalidCustomerDataError);
    });
  });

  describe('Actualización de información', () => {
    let customer: CustomerEntity;

    beforeEach(() => {
      customer = CustomerEntity.create({
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123 #45-67, Bogotá',
      });
    });

    it('debería actualizar nombre correctamente', () => {
      // Act
      customer.updateNombre('Juan Carlos Pérez');

      // Assert
      expect(customer.nombre).toBe('Juan Carlos Pérez');
    });

    it('debería lanzar error con nombre vacío', () => {
      // Act & Assert
      expect(() => customer.updateNombre('')).toThrow(InvalidCustomerDataError);

      expect(() => customer.updateNombre('   ')).toThrow(InvalidCustomerDataError);
    });

    it('debería actualizar email correctamente', () => {
      // Arrange
      const newEmail = Email.create('nuevo.email@test.com');

      // Act
      customer.updateEmail(newEmail);

      // Assert
      expect(customer.email.value).toBe('nuevo.email@test.com');
    });

    it('debería actualizar teléfono correctamente', () => {
      // Arrange
      const newPhone = Phone.create('+57 301 987 6543');

      // Act
      customer.updateTelefono(newPhone);

      // Assert
      expect(customer.telefono.value).toBe('+57 301 987 6543');
    });

    it('debería actualizar dirección correctamente', () => {
      // Act
      customer.updateDireccion('Carrera 45 #12-34, Medellín');

      // Assert
      expect(customer.direccion).toBe('Carrera 45 #12-34, Medellín');
    });

    it('debería lanzar error con dirección vacía', () => {
      // Act & Assert
      expect(() => customer.updateDireccion('')).toThrow(InvalidCustomerDataError);
    });
  });

  describe('Gestión de estado VIP', () => {
    let customer: CustomerEntity;

    beforeEach(() => {
      customer = CustomerEntity.create({
        nombre: 'María García',
        email: 'maria.garcia@email.com',
        telefono: '+57 302 456 7890',
        direccion: 'Avenida 80 #25-50, Cali',
      });
    });

    it('debería marcar cliente como VIP', () => {
      // Act
      customer.markAsVip();

      // Assert
      expect(customer.isVip).toBe(true);
    });

    it('debería remover estado VIP', () => {
      // Arrange
      customer.markAsVip();

      // Act
      customer.removeVipStatus();

      // Assert
      expect(customer.isVip).toBe(false);
    });

    it('debería verificar elegibilidad VIP por gasto total', () => {
      // Arrange - Simular compras para llegar al mínimo VIP
      customer.recordPurchase(150000); // Primera compra
      customer.recordPurchase(200000); // Segunda compra
      customer.recordPurchase(150000); // Tercera compra - Total: 500,000

      // Act & Assert
      expect(customer.isEligibleForVip()).toBe(true);
    });

    it('debería verificar elegibilidad VIP por número de pedidos', () => {
      // Arrange - Simular múltiples compras pequeñas
      for (let i = 0; i < 12; i++) {
        customer.recordPurchase(20000); // 12 compras de 20,000 cada una
      }

      // Act & Assert
      expect(customer.isEligibleForVip()).toBe(true);
    });

    it('no debería ser elegible para VIP con pocos pedidos y bajo gasto', () => {
      // Arrange
      customer.recordPurchase(50000);
      customer.recordPurchase(30000);

      // Act & Assert
      expect(customer.isEligibleForVip()).toBe(false);
    });
  });

  describe('Registro de compras', () => {
    let customer: CustomerEntity;

    beforeEach(() => {
      customer = CustomerEntity.create({
        nombre: 'Carlos López',
        email: 'carlos.lopez@email.com',
        telefono: '+57 303 789 0123',
        direccion: 'Calle 50 #30-20, Barranquilla',
      });
    });

    it('debería registrar compra correctamente', () => {
      // Act
      customer.recordPurchase(75000);

      // Assert
      expect(customer.totalOrders).toBe(1);
      expect(customer.totalSpent.value).toBe(75000);
    });

    it('debería acumular múltiples compras', () => {
      // Act
      customer.recordPurchase(50000);
      customer.recordPurchase(30000);
      customer.recordPurchase(25000);

      // Assert
      expect(customer.totalOrders).toBe(3);
      expect(customer.totalSpent.value).toBe(105000);
    });

    it('debería lanzar error con monto inválido', () => {
      // Act & Assert
      expect(() => customer.recordPurchase(0)).toThrow(InvalidCustomerDataError);

      expect(() => customer.recordPurchase(-1000)).toThrow(InvalidCustomerDataError);
    });

    it('debería calcular promedio de compra correctamente', () => {
      // Arrange
      customer.recordPurchase(60000);
      customer.recordPurchase(40000);
      customer.recordPurchase(50000);

      // Act
      const average = customer.getAveragePurchase();

      // Assert
      expect(average.value).toBe(50000); // (60000 + 40000 + 50000) / 3
    });

    it('debería retornar cero para promedio sin compras', () => {
      // Act
      const average = customer.getAveragePurchase();

      // Assert
      expect(average.value).toBe(0);
    });
  });

  describe('Consultas del cliente', () => {
    let customer: CustomerEntity;

    beforeEach(() => {
      customer = CustomerEntity.create({
        nombre: 'Ana Rodríguez',
        email: 'ana.rodriguez@email.com',
        telefono: '+57 304 567 8901',
        direccion: 'Carrera 15 #40-25, Bucaramanga',
      });
    });

    it('debería obtener información completa del cliente', () => {
      // Arrange
      customer.recordPurchase(100000);
      customer.recordPurchase(150000);
      customer.markAsVip();

      // Act
      const info = customer.getCustomerInfo();

      // Assert
      expect(info).toEqual({
        id: customer.id.value,
        nombre: 'Ana Rodríguez',
        email: 'ana.rodriguez@email.com',
        telefono: '+57 304 567 8901',
        direccion: 'Carrera 15 #40-25, Bucaramanga',
        isVip: true,
        totalOrders: 2,
        totalSpent: 250000,
        averagePurchase: 125000,
      });
    });

    it('debería verificar si es cliente frecuente', () => {
      // Arrange - Cliente con muchos pedidos
      for (let i = 0; i < 8; i++) {
        customer.recordPurchase(25000);
      }

      // Act & Assert
      expect(customer.isFrequentCustomer()).toBe(true);
    });

    it('no debería ser cliente frecuente con pocos pedidos', () => {
      // Arrange
      customer.recordPurchase(50000);
      customer.recordPurchase(30000);

      // Act & Assert
      expect(customer.isFrequentCustomer()).toBe(false);
    });

    it('debería verificar si es cliente de alto valor', () => {
      // Arrange
      customer.recordPurchase(300000);
      customer.recordPurchase(200000);

      // Act & Assert
      expect(customer.isHighValueCustomer()).toBe(true);
    });

    it('no debería ser cliente de alto valor con bajo gasto', () => {
      // Arrange
      customer.recordPurchase(50000);
      customer.recordPurchase(30000);

      // Act & Assert
      expect(customer.isHighValueCustomer()).toBe(false);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const customer = CustomerEntity.create({
        nombre: 'Pedro Martínez',
        email: 'pedro.martinez@email.com',
        telefono: '+57 305 678 9012',
        direccion: 'Avenida 19 #50-30, Pereira',
      });

      customer.recordPurchase(100000);
      customer.markAsVip();

      // Act
      const persistenceData = customer.toPersistence();

      // Assert
      expect(persistenceData).toEqual({
        id: customer.id.value,
        nombre: 'Pedro Martínez',
        email: 'pedro.martinez@email.com',
        telefono: '+57 305 678 9012',
        direccion: 'Avenida 19 #50-30, Pereira',
        isVip: true,
        totalOrders: 1,
        totalSpent: 100000,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'customer-123',
        nombre: 'Laura Gómez',
        email: 'laura.gomez@email.com',
        telefono: '+57 306 789 0123',
        direccion: 'Calle 25 #15-40, Manizales',
        isVip: true,
        totalOrders: 5,
        totalSpent: 350000,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      // Act
      const customer = CustomerEntity.fromPersistence(persistenceData);

      // Assert
      expect(customer.id.value).toBe('customer-123');
      expect(customer.nombre).toBe('Laura Gómez');
      expect(customer.email.value).toBe('laura.gomez@email.com');
      expect(customer.telefono.value).toBe('+57 306 789 0123');
      expect(customer.direccion).toBe('Calle 25 #15-40, Manizales');
      expect(customer.isVip).toBe(true);
      expect(customer.totalOrders).toBe(5);
      expect(customer.totalSpent.value).toBe(350000);
    });
  });
});

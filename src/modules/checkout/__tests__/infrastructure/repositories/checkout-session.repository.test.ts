import { CheckoutSessionRepository } from '../../../infrastructure/repositories/checkout-session.repository';
import { CheckoutSessionEntity } from '../../../domain/entities/checkout-session.entity';
import { CheckoutSessionId } from '../../../domain/value-objects/checkout-session-id';
import { EstadoCheckout, MetodoPago } from '../../../domain/types/checkout.types';
import { CheckoutSessionNotFoundError } from '../../../domain/errors/checkout-errors';

// Mock de la base de datos
const mockDb = {
  collection: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  find: jest.fn(),
};

// Mock del cliente de base de datos
jest.mock('../../../infrastructure/database/database-client', () => ({
  DatabaseClient: {
    getInstance: () => ({
      getDatabase: () => mockDb,
    }),
  },
}));

describe('CheckoutSessionRepository', () => {
  let repository: CheckoutSessionRepository;
  let mockCollection: any;

  const datosCheckoutTest = {
    clienteId: 'cliente-123',
    carritoId: 'carrito-456',
    metodoPago: 'tarjeta_credito' as MetodoPago,
    datosEntrega: {
      direccion: 'Av. Corrientes 1234',
      ciudad: 'Buenos Aires',
      codigoPostal: '1043',
      telefono: '+54911234567',
      instrucciones: 'Timbre 2B',
    },
    total: 5940,
  };

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };

    mockDb.collection.mockReturnValue(mockCollection);
    repository = new CheckoutSessionRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('guardar', () => {
    it('debería guardar nueva sesión de checkout', async () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosCheckoutTest);
      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: session.id.value,
      });

      // Act
      await repository.guardar(session);

      // Assert
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        _id: session.id.value,
        clienteId: session.clienteId,
        carritoId: session.carritoId,
        metodoPago: session.metodoPago,
        estado: session.estado,
        total: session.total,
        datosEntrega: session.datosEntrega,
        fechaCreacion: session.fechaCreacion,
        fechaExpiracion: session.fechaExpiracion,
        transaccionId: session.transaccionId,
        pedidoId: session.pedidoId,
        fechaConfirmacion: session.fechaConfirmacion,
        fechaCancelacion: session.fechaCancelacion,
        fechaCompletado: session.fechaCompletado,
        motivoCancelacion: session.motivoCancelacion,
      });
    });

    it('debería actualizar sesión existente', async () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosCheckoutTest);
      session.confirmarPago('mp-12345');

      mockCollection.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      // Act
      await repository.guardar(session);

      // Assert
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: session.id.value },
        {
          $set: {
            clienteId: session.clienteId,
            carritoId: session.carritoId,
            metodoPago: session.metodoPago,
            estado: session.estado,
            total: session.total,
            datosEntrega: session.datosEntrega,
            fechaCreacion: session.fechaCreacion,
            fechaExpiracion: session.fechaExpiracion,
            transaccionId: session.transaccionId,
            pedidoId: session.pedidoId,
            fechaConfirmacion: session.fechaConfirmacion,
            fechaCancelacion: session.fechaCancelacion,
            fechaCompletado: session.fechaCompletado,
            motivoCancelacion: session.motivoCancelacion,
          },
        },
        { upsert: true }
      );
    });

    it('debería manejar error de base de datos al guardar', async () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosCheckoutTest);
      const dbError = new Error('Error de conexión a la base de datos');
      mockCollection.insertOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.guardar(session)).rejects.toThrow(
        'Error al guardar sesión de checkout'
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener sesión por ID exitosamente', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      const sessionData = {
        _id: sessionId.value,
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        total: 5940,
        datosEntrega: datosCheckoutTest.datosEntrega,
        transaccionId: 'mp-12345',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
        fechaConfirmacion: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(sessionData);

      // Act
      const result = await repository.obtenerPorId(sessionId);

      // Assert
      expect(result).toBeInstanceOf(CheckoutSessionEntity);
      expect(result?.id.value).toBe(sessionId.value);
      expect(result?.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(result?.transaccionId).toBe('mp-12345');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: sessionId.value });
    });

    it('debería retornar null si la sesión no existe', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.obtenerPorId(sessionId);

      // Assert
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: sessionId.value });
    });

    it('debería manejar error de base de datos al obtener', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      const dbError = new Error('Error de conexión');
      mockCollection.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.obtenerPorId(sessionId)).rejects.toThrow(
        'Error al obtener sesión de checkout'
      );
    });
  });

  describe('obtenerPorCarritoId', () => {
    it('debería obtener sesión por carrito ID', async () => {
      // Arrange
      const carritoId = 'carrito-456';
      const sessionData = {
        _id: 'checkout-123',
        clienteId: 'cliente-123',
        carritoId: carritoId,
        metodoPago: 'efectivo',
        estado: EstadoCheckout.INICIADO,
        total: 5940,
        datosEntrega: datosCheckoutTest.datosEntrega,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
      };

      mockCollection.findOne.mockResolvedValue(sessionData);

      // Act
      const result = await repository.obtenerPorCarritoId(carritoId);

      // Assert
      expect(result).toBeInstanceOf(CheckoutSessionEntity);
      expect(result?.carritoId).toBe(carritoId);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ carritoId });
    });

    it('debería retornar null si no hay sesión para el carrito', async () => {
      // Arrange
      const carritoId = 'carrito-inexistente';
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.obtenerPorCarritoId(carritoId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('obtenerPorClienteId', () => {
    it('debería obtener sesiones activas por cliente ID', async () => {
      // Arrange
      const clienteId = 'cliente-123';
      const sessionsData = [
        {
          _id: 'checkout-1',
          clienteId: clienteId,
          carritoId: 'carrito-1',
          metodoPago: 'tarjeta_credito',
          estado: EstadoCheckout.INICIADO,
          total: 3000,
          datosEntrega: datosCheckoutTest.datosEntrega,
          fechaCreacion: new Date(),
          fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
        },
        {
          _id: 'checkout-2',
          clienteId: clienteId,
          carritoId: 'carrito-2',
          metodoPago: 'efectivo',
          estado: EstadoCheckout.PAGO_CONFIRMADO,
          total: 2500,
          datosEntrega: datosCheckoutTest.datosEntrega,
          fechaCreacion: new Date(),
          fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
          transaccionId: 'mp-67890',
        },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(sessionsData),
      });

      // Act
      const result = await repository.obtenerPorClienteId(clienteId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CheckoutSessionEntity);
      expect(result[1]).toBeInstanceOf(CheckoutSessionEntity);
      expect(result[0].clienteId).toBe(clienteId);
      expect(result[1].clienteId).toBe(clienteId);
      expect(mockCollection.find).toHaveBeenCalledWith({ clienteId });
    });

    it('debería retornar array vacío si no hay sesiones para el cliente', async () => {
      // Arrange
      const clienteId = 'cliente-sin-sesiones';
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      // Act
      const result = await repository.obtenerPorClienteId(clienteId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('obtenerSesionesExpiradas', () => {
    it('debería obtener sesiones expiradas', async () => {
      // Arrange
      const fechaActual = new Date();
      const sessionExpirada = {
        _id: 'checkout-expirado',
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        estado: EstadoCheckout.INICIADO,
        total: 5940,
        datosEntrega: datosCheckoutTest.datosEntrega,
        fechaCreacion: new Date(fechaActual.getTime() - 60 * 60 * 1000), // Hace 1 hora
        fechaExpiracion: new Date(fechaActual.getTime() - 30 * 60 * 1000), // Expiró hace 30 min
      };

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([sessionExpirada]),
      });

      // Act
      const result = await repository.obtenerSesionesExpiradas();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CheckoutSessionEntity);
      expect(mockCollection.find).toHaveBeenCalledWith({
        fechaExpiracion: { $lt: expect.any(Date) },
        estado: { $in: [EstadoCheckout.INICIADO, EstadoCheckout.PAGO_CONFIRMADO] },
      });
    });
  });

  describe('eliminar', () => {
    it('debería eliminar sesión por ID', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      // Act
      await repository.eliminar(sessionId);

      // Assert
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: sessionId.value });
    });

    it('debería lanzar error si la sesión no existe al eliminar', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      });

      // Act & Assert
      await expect(repository.eliminar(sessionId)).rejects.toThrow(CheckoutSessionNotFoundError);
    });

    it('debería manejar error de base de datos al eliminar', async () => {
      // Arrange
      const sessionId = CheckoutSessionId.crear();
      const dbError = new Error('Error de conexión');
      mockCollection.deleteOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.eliminar(sessionId)).rejects.toThrow(
        'Error al eliminar sesión de checkout'
      );
    });
  });

  describe('limpiarSesionesExpiradas', () => {
    it('debería limpiar sesiones expiradas automáticamente', async () => {
      // Arrange
      mockCollection.deleteMany = jest.fn().mockResolvedValue({
        acknowledged: true,
        deletedCount: 5,
      });

      // Act
      const cantidadEliminadas = await repository.limpiarSesionesExpiradas();

      // Assert
      expect(cantidadEliminadas).toBe(5);
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({
        fechaExpiracion: { $lt: expect.any(Date) },
        estado: { $in: [EstadoCheckout.INICIADO] },
      });
    });

    it('debería retornar 0 si no hay sesiones expiradas para limpiar', async () => {
      // Arrange
      mockCollection.deleteMany = jest.fn().mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      });

      // Act
      const cantidadEliminadas = await repository.limpiarSesionesExpiradas();

      // Assert
      expect(cantidadEliminadas).toBe(0);
    });
  });

  describe('obtenerEstadisticas', () => {
    it('debería obtener estadísticas de sesiones de checkout', async () => {
      // Arrange
      const estadisticasMock = [
        { _id: EstadoCheckout.INICIADO, count: 10 },
        { _id: EstadoCheckout.PAGO_CONFIRMADO, count: 25 },
        { _id: EstadoCheckout.COMPLETADO, count: 100 },
        { _id: EstadoCheckout.CANCELADO, count: 5 },
      ];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(estadisticasMock),
      });

      // Act
      const estadisticas = await repository.obtenerEstadisticas();

      // Assert
      expect(estadisticas).toEqual({
        [EstadoCheckout.INICIADO]: 10,
        [EstadoCheckout.PAGO_CONFIRMADO]: 25,
        [EstadoCheckout.COMPLETADO]: 100,
        [EstadoCheckout.CANCELADO]: 5,
        total: 140,
      });
    });
  });

  describe('mapeo de datos', () => {
    it('debería mapear correctamente de entidad a persistencia', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosCheckoutTest);
      session.confirmarPago('mp-12345');

      // Act
      const persistenceData = session.toPersistence();

      // Assert
      expect(persistenceData.id).toBe(session.id.value);
      expect(persistenceData.clienteId).toBe(session.clienteId);
      expect(persistenceData.carritoId).toBe(session.carritoId);
      expect(persistenceData.metodoPago).toBe(session.metodoPago);
      expect(persistenceData.estado).toBe(session.estado);
      expect(persistenceData.transaccionId).toBe('mp-12345');
    });

    it('debería mapear correctamente de persistencia a entidad', () => {
      // Arrange
      const persistenceData = {
        id: 'checkout-123',
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito' as MetodoPago,
        estado: EstadoCheckout.COMPLETADO,
        total: 5940,
        datosEntrega: datosCheckoutTest.datosEntrega,
        transaccionId: 'mp-12345',
        pedidoId: 'pedido-789',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
        fechaConfirmacion: new Date(),
        fechaCompletado: new Date(),
      };

      // Act
      const session = CheckoutSessionEntity.fromPersistence(persistenceData);

      // Assert
      expect(session.id.value).toBe('checkout-123');
      expect(session.clienteId).toBe('cliente-123');
      expect(session.estado).toBe(EstadoCheckout.COMPLETADO);
      expect(session.transaccionId).toBe('mp-12345');
      expect(session.pedidoId).toBe('pedido-789');
    });
  });
});

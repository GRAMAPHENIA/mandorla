import { CheckoutSessionEntity } from '../../../domain/entities/checkout-session.entity';
import { CheckoutSessionId } from '../../../domain/value-objects/checkout-session-id';
import { EstadoCheckout, MetodoPago } from '../../../domain/types/checkout.types';
import { CheckoutError } from '../../../domain/errors/checkout-errors';

describe('CheckoutSessionEntity', () => {
  const datosValidosCheckout = {
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

  describe('crear', () => {
    it('debería crear una sesión de checkout válida', () => {
      // Act
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Assert
      expect(session.id).toBeInstanceOf(CheckoutSessionId);
      expect(session.clienteId).toBe('cliente-123');
      expect(session.carritoId).toBe('carrito-456');
      expect(session.metodoPago).toBe('tarjeta_credito');
      expect(session.total).toBe(5940);
      expect(session.estado).toBe(EstadoCheckout.INICIADO);
      expect(session.fechaCreacion).toBeInstanceOf(Date);
      expect(session.fechaExpiracion).toBeInstanceOf(Date);
    });

    it('debería establecer fecha de expiración 30 minutos después de la creación', () => {
      // Act
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Assert
      const tiempoEsperado = new Date(session.fechaCreacion.getTime() + 30 * 60 * 1000);
      expect(session.fechaExpiracion.getTime()).toBeCloseTo(tiempoEsperado.getTime(), -3);
    });

    it('debería fallar con total inválido', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCheckout,
        total: -100,
      };

      // Act & Assert
      expect(() => CheckoutSessionEntity.crear(datosInvalidos)).toThrow(CheckoutError);
    });

    it('debería fallar con datos de entrega incompletos', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCheckout,
        datosEntrega: {
          direccion: '',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
      };

      // Act & Assert
      expect(() => CheckoutSessionEntity.crear(datosInvalidos)).toThrow(CheckoutError);
    });
  });

  describe('confirmarPago', () => {
    it('debería confirmar el pago exitosamente', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      const transaccionId = 'mp-12345';

      // Act
      session.confirmarPago(transaccionId);

      // Assert
      expect(session.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(session.transaccionId).toBe(transaccionId);
      expect(session.fechaConfirmacion).toBeInstanceOf(Date);
    });

    it('debería fallar si ya está confirmado', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');

      // Act & Assert
      expect(() => session.confirmarPago('mp-67890')).toThrow(CheckoutError);
    });

    it('debería fallar si está cancelado', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.cancelar('Cancelado por el usuario');

      // Act & Assert
      expect(() => session.confirmarPago('mp-12345')).toThrow(CheckoutError);
    });
  });

  describe('cancelar', () => {
    it('debería cancelar la sesión exitosamente', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      const motivo = 'Pago rechazado';

      // Act
      session.cancelar(motivo);

      // Assert
      expect(session.estado).toBe(EstadoCheckout.CANCELADO);
      expect(session.motivoCancelacion).toBe(motivo);
      expect(session.fechaCancelacion).toBeInstanceOf(Date);
    });

    it('debería fallar si ya está confirmado', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');

      // Act & Assert
      expect(() => session.cancelar('Intento de cancelación')).toThrow(CheckoutError);
    });
  });

  describe('completar', () => {
    it('debería completar la sesión exitosamente', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');
      const pedidoId = 'pedido-789';

      // Act
      session.completar(pedidoId);

      // Assert
      expect(session.estado).toBe(EstadoCheckout.COMPLETADO);
      expect(session.pedidoId).toBe(pedidoId);
      expect(session.fechaCompletado).toBeInstanceOf(Date);
    });

    it('debería fallar si no está confirmado', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Act & Assert
      expect(() => session.completar('pedido-789')).toThrow(CheckoutError);
    });
  });

  describe('estaExpirada', () => {
    it('debería retornar false para sesión recién creada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Act & Assert
      expect(session.estaExpirada()).toBe(false);
    });

    it('debería retornar true para sesión expirada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Simular expiración modificando la fecha
      const fechaExpiradaAntes = new Date(Date.now() - 1000);
      (session as any)._fechaExpiracion = fechaExpiradaAntes;

      // Act & Assert
      expect(session.estaExpirada()).toBe(true);
    });

    it('debería retornar false si está completada aunque esté expirada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');
      session.completar('pedido-789');

      // Simular expiración
      const fechaExpiradaAntes = new Date(Date.now() - 1000);
      (session as any)._fechaExpiracion = fechaExpiradaAntes;

      // Act & Assert
      expect(session.estaExpirada()).toBe(false);
    });
  });

  describe('puedeSerModificada', () => {
    it('debería permitir modificación en estado INICIADO', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Act & Assert
      expect(session.puedeSerModificada()).toBe(true);
    });

    it('debería no permitir modificación si está confirmada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');

      // Act & Assert
      expect(session.puedeSerModificada()).toBe(false);
    });

    it('debería no permitir modificación si está cancelada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.cancelar('Cancelado por usuario');

      // Act & Assert
      expect(session.puedeSerModificada()).toBe(false);
    });

    it('debería no permitir modificación si está expirada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);

      // Simular expiración
      const fechaExpiradaAntes = new Date(Date.now() - 1000);
      (session as any)._fechaExpiracion = fechaExpiradaAntes;

      // Act & Assert
      expect(session.puedeSerModificada()).toBe(false);
    });
  });

  describe('actualizarDatosEntrega', () => {
    it('debería actualizar datos de entrega exitosamente', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      const nuevosDatos = {
        direccion: 'Nueva Dirección 456',
        ciudad: 'Córdoba',
        codigoPostal: '5000',
        telefono: '+54351123456',
        instrucciones: 'Casa azul',
      };

      // Act
      session.actualizarDatosEntrega(nuevosDatos);

      // Assert
      expect(session.datosEntrega.direccion).toBe('Nueva Dirección 456');
      expect(session.datosEntrega.ciudad).toBe('Córdoba');
      expect(session.datosEntrega.codigoPostal).toBe('5000');
      expect(session.datosEntrega.telefono).toBe('+54351123456');
      expect(session.datosEntrega.instrucciones).toBe('Casa azul');
    });

    it('debería fallar si la sesión no puede ser modificada', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');

      const nuevosDatos = {
        direccion: 'Nueva Dirección 456',
        ciudad: 'Córdoba',
        codigoPostal: '5000',
        telefono: '+54351123456',
      };

      // Act & Assert
      expect(() => session.actualizarDatosEntrega(nuevosDatos)).toThrow(CheckoutError);
    });
  });

  describe('toPersistence', () => {
    it('debería convertir a formato de persistencia correctamente', () => {
      // Arrange
      const session = CheckoutSessionEntity.crear(datosValidosCheckout);
      session.confirmarPago('mp-12345');

      // Act
      const persistence = session.toPersistence();

      // Assert
      expect(persistence.id).toBe(session.id.value);
      expect(persistence.clienteId).toBe('cliente-123');
      expect(persistence.carritoId).toBe('carrito-456');
      expect(persistence.metodoPago).toBe('tarjeta_credito');
      expect(persistence.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(persistence.transaccionId).toBe('mp-12345');
      expect(persistence.total).toBe(5940);
      expect(persistence.datosEntrega).toEqual(datosValidosCheckout.datosEntrega);
    });
  });

  describe('fromPersistence', () => {
    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'checkout-123',
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito' as MetodoPago,
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        total: 5940,
        datosEntrega: datosValidosCheckout.datosEntrega,
        transaccionId: 'mp-12345',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
        fechaConfirmacion: new Date(),
      };

      // Act
      const session = CheckoutSessionEntity.fromPersistence(persistenceData);

      // Assert
      expect(session.id.value).toBe('checkout-123');
      expect(session.clienteId).toBe('cliente-123');
      expect(session.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(session.transaccionId).toBe('mp-12345');
    });
  });
});

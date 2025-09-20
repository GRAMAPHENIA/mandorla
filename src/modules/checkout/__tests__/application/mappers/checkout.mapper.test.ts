import { CheckoutMapper } from '../../../application/mappers/checkout.mapper';
import { CheckoutSessionEntity } from '../../../domain/entities/checkout-session.entity';
import { CheckoutSessionId } from '../../../domain/value-objects/checkout-session-id';
import { DatosEntrega } from '../../../domain/value-objects/datos-entrega';
import { EstadoCheckout, MetodoPago } from '../../../domain/types/checkout.types';
import {
  CrearCheckoutDto,
  ResumenCheckoutDto,
  ResultadoCheckoutDto,
} from '../../../application/dtos/checkout.dto';

describe('CheckoutMapper', () => {
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

  describe('toEntity', () => {
    it('debería mapear DTO a entidad correctamente', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        datosEntrega: {
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
          instrucciones: 'Timbre 2B',
        },
        datosPago: {
          numeroTarjeta: '4111111111111111',
          vencimiento: '12/25',
          cvv: '123',
          titular: 'Juan Pérez',
        },
      };

      // Act
      const entity = CheckoutMapper.toEntity(dto, 5940);

      // Assert
      expect(entity).toBeInstanceOf(CheckoutSessionEntity);
      expect(entity.clienteId).toBe('cliente-123');
      expect(entity.carritoId).toBe('carrito-456');
      expect(entity.metodoPago).toBe('tarjeta_credito');
      expect(entity.total).toBe(5940);
      expect(entity.estado).toBe(EstadoCheckout.INICIADO);
      expect(entity.datosEntrega.direccion).toBe('Av. Corrientes 1234');
    });

    it('debería mapear DTO sin datos de pago para efectivo', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Calle Test 123',
          ciudad: 'Test City',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act
      const entity = CheckoutMapper.toEntity(dto, 3000);

      // Assert
      expect(entity.metodoPago).toBe('efectivo');
      expect(entity.total).toBe(3000);
      expect(entity.datosEntrega.instrucciones).toBeUndefined();
    });

    it('debería generar ID único para cada entidad', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Test',
          ciudad: 'Test',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act
      const entity1 = CheckoutMapper.toEntity(dto, 1000);
      const entity2 = CheckoutMapper.toEntity(dto, 1000);

      // Assert
      expect(entity1.id.value).not.toBe(entity2.id.value);
    });

    it('debería manejar datos de entrega sin instrucciones', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'transferencia',
        datosEntrega: {
          direccion: 'Av. Test 456',
          ciudad: 'Test City',
          codigoPostal: '5000',
          telefono: '+54351123456',
          // Sin instrucciones
        },
      };

      // Act
      const entity = CheckoutMapper.toEntity(dto, 2500);

      // Assert
      expect(entity.datosEntrega.instrucciones).toBeUndefined();
    });
  });

  describe('toDto', () => {
    it('debería mapear entidad a DTO correctamente', () => {
      // Arrange
      const entity = CheckoutSessionEntity.crear(datosCheckoutTest);
      entity.confirmarPago('mp-12345');
      entity.completar('pedido-789');

      // Act
      const dto = CheckoutMapper.toDto(entity);

      // Assert
      expect(dto.id).toBe(entity.id.value);
      expect(dto.clienteId).toBe('cliente-123');
      expect(dto.carritoId).toBe('carrito-456');
      expect(dto.metodoPago).toBe('tarjeta_credito');
      expect(dto.estado).toBe(EstadoCheckout.COMPLETADO);
      expect(dto.total).toBe(5940);
      expect(dto.transaccionId).toBe('mp-12345');
      expect(dto.pedidoId).toBe('pedido-789');
      expect(dto.datosEntrega).toEqual(datosCheckoutTest.datosEntrega);
    });

    it('debería mapear entidad en estado inicial', () => {
      // Arrange
      const entity = CheckoutSessionEntity.crear(datosCheckoutTest);

      // Act
      const dto = CheckoutMapper.toDto(entity);

      // Assert
      expect(dto.estado).toBe(EstadoCheckout.INICIADO);
      expect(dto.transaccionId).toBeUndefined();
      expect(dto.pedidoId).toBeUndefined();
      expect(dto.fechaConfirmacion).toBeUndefined();
      expect(dto.fechaCompletado).toBeUndefined();
    });

    it('debería incluir fechas correctamente', () => {
      // Arrange
      const entity = CheckoutSessionEntity.crear(datosCheckoutTest);

      // Act
      const dto = CheckoutMapper.toDto(entity);

      // Assert
      expect(dto.fechaCreacion).toBeInstanceOf(Date);
      expect(dto.fechaExpiracion).toBeInstanceOf(Date);
      expect(dto.fechaExpiracion.getTime()).toBeGreaterThan(dto.fechaCreacion.getTime());
    });
  });

  describe('toResumenDto', () => {
    it('debería crear resumen desde datos de carrito', () => {
      // Arrange
      const carritoData = {
        items: [
          {
            productoId: 'prod-1',
            nombre: 'Croissants de Mantequilla',
            cantidad: 2,
            precioUnitario: 1500,
            subtotal: 3000,
            imagen: '/images/croissants.jpg',
          },
          {
            productoId: 'prod-2',
            nombre: 'Pan Integral',
            cantidad: 1,
            precioUnitario: 2500,
            subtotal: 2500,
          },
        ],
        subtotal: 5500,
        descuentos: 825,
        impuestos: 374,
        total: 5049,
      };

      const codigoDescuento = 'VIP15';
      const metodoPago: MetodoPago = 'tarjeta_credito';

      // Act
      const resumen = CheckoutMapper.toResumenDto(carritoData, codigoDescuento, metodoPago);

      // Assert
      expect(resumen.items).toHaveLength(2);
      expect(resumen.items[0].nombre).toBe('Croissants de Mantequilla');
      expect(resumen.items[0].imagen).toBe('/images/croissants.jpg');
      expect(resumen.items[1].imagen).toBeUndefined();
      expect(resumen.subtotal).toBe(5500);
      expect(resumen.descuentos).toBe(825);
      expect(resumen.impuestos).toBe(374);
      expect(resumen.total).toBe(5049);
      expect(resumen.codigoDescuento).toBe('VIP15');
      expect(resumen.metodoPagoSeleccionado).toBe('tarjeta_credito');
    });

    it('debería crear resumen sin descuentos', () => {
      // Arrange
      const carritoData = {
        items: [
          {
            productoId: 'prod-1',
            nombre: 'Galletas',
            cantidad: 1,
            precioUnitario: 800,
            subtotal: 800,
          },
        ],
        subtotal: 800,
        descuentos: 0,
        impuestos: 64,
        total: 864,
      };

      // Act
      const resumen = CheckoutMapper.toResumenDto(carritoData);

      // Assert
      expect(resumen.descuentos).toBe(0);
      expect(resumen.codigoDescuento).toBeUndefined();
      expect(resumen.metodoPagoSeleccionado).toBeUndefined();
    });

    it('debería manejar carrito vacío', () => {
      // Arrange
      const carritoVacio = {
        items: [],
        subtotal: 0,
        descuentos: 0,
        impuestos: 0,
        total: 0,
      };

      // Act
      const resumen = CheckoutMapper.toResumenDto(carritoVacio);

      // Assert
      expect(resumen.items).toHaveLength(0);
      expect(resumen.subtotal).toBe(0);
      expect(resumen.total).toBe(0);
    });
  });

  describe('toResultadoDto', () => {
    it('debería crear resultado exitoso completo', () => {
      // Arrange
      const pedidoId = 'pedido-789';
      const pagoId = 'pago-101';
      const total = 5940;
      const transaccionId = 'mp-12345';

      // Act
      const resultado = CheckoutMapper.toResultadoDto(true, pedidoId, pagoId, total, transaccionId);

      // Assert
      expect(resultado.exitoso).toBe(true);
      expect(resultado.pedidoId).toBe(pedidoId);
      expect(resultado.pagoId).toBe(pagoId);
      expect(resultado.total).toBe(total);
      expect(resultado.transaccionId).toBe(transaccionId);
      expect(resultado.mensaje).toBe('Checkout procesado exitosamente');
      expect(resultado.error).toBeUndefined();
    });

    it('debería crear resultado exitoso sin transacción (efectivo)', () => {
      // Arrange
      const pedidoId = 'pedido-789';
      const pagoId = 'pago-101';
      const total = 5940;

      // Act
      const resultado = CheckoutMapper.toResultadoDto(true, pedidoId, pagoId, total);

      // Assert
      expect(resultado.exitoso).toBe(true);
      expect(resultado.transaccionId).toBeUndefined();
      expect(resultado.estadoPago).toBeUndefined();
    });

    it('debería crear resultado con error', () => {
      // Arrange
      const error = {
        codigo: 'PAGO_FALLIDO',
        mensaje: 'Tarjeta rechazada',
        detalles: { codigoRespuesta: 'CARD_DECLINED' },
      };

      // Act
      const resultado = CheckoutMapper.toResultadoDto(
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        error
      );

      // Assert
      expect(resultado.exitoso).toBe(false);
      expect(resultado.error).toEqual(error);
      expect(resultado.pedidoId).toBeUndefined();
      expect(resultado.pagoId).toBeUndefined();
      expect(resultado.total).toBeUndefined();
      expect(resultado.mensaje).toBeUndefined();
    });

    it('debería crear resultado con estado de pago específico', () => {
      // Arrange
      const pedidoId = 'pedido-789';
      const pagoId = 'pago-101';
      const total = 5940;
      const estadoPago = 'pendiente';

      // Act
      const resultado = CheckoutMapper.toResultadoDto(
        true,
        pedidoId,
        pagoId,
        total,
        undefined,
        undefined,
        estadoPago
      );

      // Assert
      expect(resultado.exitoso).toBe(true);
      expect(resultado.estadoPago).toBe('pendiente');
      expect(resultado.mensaje).toBe('Pedido creado, pago pendiente');
    });
  });

  describe('fromPersistence', () => {
    it('debería mapear datos de persistencia a entidad', () => {
      // Arrange
      const persistenceData = {
        _id: 'checkout-123',
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito' as MetodoPago,
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        total: 5940,
        datosEntrega: datosCheckoutTest.datosEntrega,
        transaccionId: 'mp-12345',
        fechaCreacion: new Date('2024-01-15T10:00:00Z'),
        fechaExpiracion: new Date('2024-01-15T10:30:00Z'),
        fechaConfirmacion: new Date('2024-01-15T10:05:00Z'),
      };

      // Act
      const entity = CheckoutMapper.fromPersistence(persistenceData);

      // Assert
      expect(entity).toBeInstanceOf(CheckoutSessionEntity);
      expect(entity.id.value).toBe('checkout-123');
      expect(entity.clienteId).toBe('cliente-123');
      expect(entity.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(entity.transaccionId).toBe('mp-12345');
    });

    it('debería manejar datos de persistencia mínimos', () => {
      // Arrange
      const persistenceData = {
        _id: 'checkout-456',
        clienteId: 'cliente-456',
        carritoId: 'carrito-789',
        metodoPago: 'efectivo' as MetodoPago,
        estado: EstadoCheckout.INICIADO,
        total: 3000,
        datosEntrega: {
          direccion: 'Test',
          ciudad: 'Test',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
      };

      // Act
      const entity = CheckoutMapper.fromPersistence(persistenceData);

      // Assert
      expect(entity.id.value).toBe('checkout-456');
      expect(entity.estado).toBe(EstadoCheckout.INICIADO);
      expect(entity.transaccionId).toBeUndefined();
      expect(entity.pedidoId).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('debería mapear entidad a formato de persistencia', () => {
      // Arrange
      const entity = CheckoutSessionEntity.crear(datosCheckoutTest);
      entity.confirmarPago('mp-12345');

      // Act
      const persistence = CheckoutMapper.toPersistence(entity);

      // Assert
      expect(persistence._id).toBe(entity.id.value);
      expect(persistence.clienteId).toBe('cliente-123');
      expect(persistence.carritoId).toBe('carrito-456');
      expect(persistence.metodoPago).toBe('tarjeta_credito');
      expect(persistence.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(persistence.transaccionId).toBe('mp-12345');
      expect(persistence.datosEntrega).toEqual(datosCheckoutTest.datosEntrega);
    });

    it('debería incluir todas las fechas', () => {
      // Arrange
      const entity = CheckoutSessionEntity.crear(datosCheckoutTest);

      // Act
      const persistence = CheckoutMapper.toPersistence(entity);

      // Assert
      expect(persistence.fechaCreacion).toBeInstanceOf(Date);
      expect(persistence.fechaExpiracion).toBeInstanceOf(Date);
      expect(persistence.fechaConfirmacion).toBeUndefined();
      expect(persistence.fechaCancelacion).toBeUndefined();
      expect(persistence.fechaCompletado).toBeUndefined();
    });
  });

  describe('validaciones de mapeo', () => {
    it('debería validar datos requeridos en toEntity', () => {
      // Arrange
      const dtoInvalido = {
        clienteId: '',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: {
          direccion: '',
          ciudad: 'Test',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act & Assert
      expect(() => CheckoutMapper.toEntity(dtoInvalido, 1000)).toThrow();
    });

    it('debería validar total positivo', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Test',
          ciudad: 'Test',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act & Assert
      expect(() => CheckoutMapper.toEntity(dto, -100)).toThrow();

      expect(() => CheckoutMapper.toEntity(dto, 0)).toThrow();
    });
  });

  describe('casos edge', () => {
    it('debería manejar caracteres especiales en datos de entrega', () => {
      // Arrange
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Av. José de San Martín 1234, Piso 5°, Depto "A"',
          ciudad: 'San José de la Dormida',
          codigoPostal: '1043',
          telefono: '+54 (11) 1234-5678',
          instrucciones: 'Timbre 2B - Preguntar por María José',
        },
      };

      // Act
      const entity = CheckoutMapper.toEntity(dto, 5000);

      // Assert
      expect(entity.datosEntrega.direccion).toBe('Av. José de San Martín 1234, Piso 5°, Depto "A"');
      expect(entity.datosEntrega.ciudad).toBe('San José de la Dormida');
      expect(entity.datosEntrega.instrucciones).toBe('Timbre 2B - Preguntar por María José');
    });

    it('debería preservar precisión decimal en totales', () => {
      // Arrange
      const totalConDecimales = 5940.75;
      const dto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Test',
          ciudad: 'Test',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act
      const entity = CheckoutMapper.toEntity(dto, totalConDecimales);

      // Assert
      expect(entity.total).toBe(5940.75);
    });
  });
});

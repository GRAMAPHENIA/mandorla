import { CheckoutFacade } from '../../../presentation/facades/checkout.facade';
import { CheckoutService } from '../../../application/services/checkout.service';
import { CarritoService } from '../../../../carrito/application/services/carrito.service';
import { PedidoService } from '../../../../pedidos/application/services/pedido.service';
import { ClienteService } from '../../../../clientes/application/services/cliente.service';
import { PagoService } from '../../../../pagos/application/services/pago.service';
import {
  CheckoutError,
  CarritoVacioError,
  PagoFallidoError,
} from '../../../domain/errors/checkout-errors';
import { MetodoPago, EstadoCheckout } from '../../../domain/types/checkout.types';

// Mock de los servicios
jest.mock('../../../application/services/checkout.service');
jest.mock('../../../../carrito/application/services/carrito.service');
jest.mock('../../../../pedidos/application/services/pedido.service');
jest.mock('../../../../clientes/application/services/cliente.service');
jest.mock('../../../../pagos/application/services/pago.service');

describe('CheckoutFacade', () => {
  let checkoutFacade: CheckoutFacade;
  let mockCheckoutService: jest.Mocked<CheckoutService>;
  let mockCarritoService: jest.Mocked<CarritoService>;
  let mockPedidoService: jest.Mocked<PedidoService>;
  let mockClienteService: jest.Mocked<ClienteService>;
  let mockPagoService: jest.Mocked<PagoService>;

  beforeEach(() => {
    // Crear mocks
    mockCheckoutService = {
      procesarCheckout: jest.fn(),
      calcularResumenCheckout: jest.fn(),
      validarCheckout: jest.fn(),
      obtenerSesionCheckout: jest.fn(),
      cancelarCheckout: jest.fn(),
    } as any;

    mockCarritoService = {
      obtenerCarrito: jest.fn(),
      calcularTotal: jest.fn(),
    } as any;

    mockPedidoService = {
      obtenerPedido: jest.fn(),
    } as any;

    mockClienteService = {
      obtenerCliente: jest.fn(),
    } as any;

    mockPagoService = {
      obtenerEstadoPago: jest.fn(),
    } as any;

    // Configurar el facade con mocks
    checkoutFacade = new CheckoutFacade();
    (checkoutFacade as any).checkoutService = mockCheckoutService;
    (checkoutFacade as any).carritoService = mockCarritoService;
    (checkoutFacade as any).pedidoService = mockPedidoService;
    (checkoutFacade as any).clienteService = mockClienteService;
    (checkoutFacade as any).pagoService = mockPagoService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('iniciarCheckout', () => {
    const datosCheckoutValidos = {
      clienteId: 'cliente-123',
      carritoId: 'carrito-456',
      metodoPago: 'tarjeta_credito' as MetodoPago,
      datosEntrega: {
        direccion: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires',
        codigoPostal: '1043',
        telefono: '+54911234567',
      },
    };

    it('debería iniciar checkout exitosamente', async () => {
      // Arrange
      const resultadoMock = {
        exitoso: true,
        pedidoId: 'pedido-789',
        pagoId: 'pago-101',
        total: 5940,
        transaccionId: 'mp-12345',
      };

      mockCheckoutService.procesarCheckout.mockResolvedValue(resultadoMock);

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckoutValidos);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        pedidoId: 'pedido-789',
        pagoId: 'pago-101',
        total: 5940,
        transaccionId: 'mp-12345',
        mensaje: 'Checkout procesado exitosamente',
      });
      expect(mockCheckoutService.procesarCheckout).toHaveBeenCalledWith(datosCheckoutValidos);
    });

    it('debería manejar error de carrito vacío', async () => {
      // Arrange
      const error = new CarritoVacioError('carrito-456');
      mockCheckoutService.procesarCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckoutValidos);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toEqual({
        code: 'CARRITO_VACIO',
        message: error.message,
        type: 'validation',
      });
    });

    it('debería manejar error de pago fallido', async () => {
      // Arrange
      const error = new PagoFallidoError('Tarjeta rechazada', { codigo: 'CARD_DECLINED' });
      mockCheckoutService.procesarCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckoutValidos);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toEqual({
        code: 'PAGO_FALLIDO',
        message: 'Tarjeta rechazada',
        type: 'infrastructure',
      });
    });

    it('debería manejar errores inesperados', async () => {
      // Arrange
      const error = new Error('Error inesperado');
      mockCheckoutService.procesarCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckoutValidos);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toEqual({
        code: 'CHECKOUT_ERROR',
        message: 'Error inesperado en el proceso de checkout',
        type: 'internal',
      });
    });
  });

  describe('obtenerResumenCheckout', () => {
    it('debería obtener resumen de checkout exitosamente', async () => {
      // Arrange
      const carritoId = 'carrito-456';
      const codigoDescuento = 'VIP15';

      const resumenMock = {
        items: [
          {
            productoId: 'prod-1',
            nombre: 'Croissants',
            cantidad: 2,
            precioUnitario: 1500,
            subtotal: 3000,
          },
        ],
        subtotal: 3000,
        descuentos: 450,
        impuestos: 204,
        total: 2754,
      };

      mockCheckoutService.calcularResumenCheckout.mockResolvedValue(resumenMock);

      // Act
      const resultado = await checkoutFacade.obtenerResumenCheckout(carritoId, codigoDescuento);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual(resumenMock);
      expect(mockCheckoutService.calcularResumenCheckout).toHaveBeenCalledWith(
        carritoId,
        codigoDescuento
      );
    });

    it('debería manejar error al obtener resumen', async () => {
      // Arrange
      const carritoId = 'carrito-inexistente';
      const error = new CheckoutError('Carrito no encontrado');

      mockCheckoutService.calcularResumenCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.obtenerResumenCheckout(carritoId);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.code).toBe('CHECKOUT_ERROR');
    });
  });

  describe('validarDatosCheckout', () => {
    const datosValidacion = {
      clienteId: 'cliente-123',
      carritoId: 'carrito-456',
      metodoPago: 'efectivo' as MetodoPago,
      datosEntrega: {
        direccion: 'Calle Falsa 123',
        ciudad: 'Springfield',
        codigoPostal: '1234',
        telefono: '+54911234567',
      },
    };

    it('debería validar datos exitosamente', async () => {
      // Arrange
      mockCheckoutService.validarCheckout.mockResolvedValue(true);

      // Act
      const resultado = await checkoutFacade.validarDatosCheckout(datosValidacion);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        valido: true,
        mensaje: 'Datos de checkout válidos',
      });
    });

    it('debería retornar validación fallida', async () => {
      // Arrange
      mockCheckoutService.validarCheckout.mockResolvedValue(false);

      // Act
      const resultado = await checkoutFacade.validarDatosCheckout(datosValidacion);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        valido: false,
        mensaje: 'Los datos de checkout no son válidos',
      });
    });

    it('debería manejar error en validación', async () => {
      // Arrange
      const error = new CheckoutError('Error de validación');
      mockCheckoutService.validarCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.validarDatosCheckout(datosValidacion);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.code).toBe('CHECKOUT_ERROR');
    });
  });

  describe('obtenerEstadoCheckout', () => {
    it('debería obtener estado de checkout exitosamente', async () => {
      // Arrange
      const checkoutId = 'checkout-123';
      const sesionMock = {
        id: checkoutId,
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        total: 5940,
        transaccionId: 'mp-12345',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
      };

      mockCheckoutService.obtenerSesionCheckout.mockResolvedValue(sesionMock);

      // Act
      const resultado = await checkoutFacade.obtenerEstadoCheckout(checkoutId);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        checkoutId,
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        total: 5940,
        transaccionId: 'mp-12345',
        expirado: false,
      });
    });

    it('debería detectar checkout expirado', async () => {
      // Arrange
      const checkoutId = 'checkout-expirado';
      const sesionMock = {
        id: checkoutId,
        estado: EstadoCheckout.INICIADO,
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        total: 5940,
        fechaCreacion: new Date(Date.now() - 60 * 60 * 1000), // Hace 1 hora
        fechaExpiracion: new Date(Date.now() - 30 * 60 * 1000), // Expiró hace 30 min
      };

      mockCheckoutService.obtenerSesionCheckout.mockResolvedValue(sesionMock);

      // Act
      const resultado = await checkoutFacade.obtenerEstadoCheckout(checkoutId);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data?.expirado).toBe(true);
    });

    it('debería manejar checkout no encontrado', async () => {
      // Arrange
      const checkoutId = 'checkout-inexistente';
      mockCheckoutService.obtenerSesionCheckout.mockResolvedValue(null);

      // Act
      const resultado = await checkoutFacade.obtenerEstadoCheckout(checkoutId);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toEqual({
        code: 'CHECKOUT_NOT_FOUND',
        message: 'Sesión de checkout no encontrada',
        type: 'not_found',
      });
    });
  });

  describe('cancelarCheckout', () => {
    it('debería cancelar checkout exitosamente', async () => {
      // Arrange
      const checkoutId = 'checkout-123';
      const motivo = 'Cancelado por el usuario';

      mockCheckoutService.cancelarCheckout.mockResolvedValue(undefined);

      // Act
      const resultado = await checkoutFacade.cancelarCheckout(checkoutId, motivo);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        mensaje: 'Checkout cancelado exitosamente',
      });
      expect(mockCheckoutService.cancelarCheckout).toHaveBeenCalledWith(checkoutId, motivo);
    });

    it('debería manejar error al cancelar', async () => {
      // Arrange
      const checkoutId = 'checkout-123';
      const motivo = 'Error de sistema';
      const error = new CheckoutError('No se puede cancelar checkout confirmado');

      mockCheckoutService.cancelarCheckout.mockRejectedValue(error);

      // Act
      const resultado = await checkoutFacade.cancelarCheckout(checkoutId, motivo);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.code).toBe('CHECKOUT_ERROR');
    });
  });

  describe('obtenerMetodosPagoDisponibles', () => {
    it('debería retornar métodos de pago disponibles', async () => {
      // Act
      const resultado = await checkoutFacade.obtenerMetodosPagoDisponibles();

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        metodos: [
          {
            id: 'efectivo',
            nombre: 'Efectivo',
            descripcion: 'Pago en efectivo al recibir el pedido',
            disponible: true,
          },
          {
            id: 'tarjeta_credito',
            nombre: 'Tarjeta de Crédito',
            descripcion: 'Pago con tarjeta de crédito a través de Mercado Pago',
            disponible: true,
          },
          {
            id: 'tarjeta_debito',
            nombre: 'Tarjeta de Débito',
            descripcion: 'Pago con tarjeta de débito a través de Mercado Pago',
            disponible: true,
          },
          {
            id: 'transferencia',
            nombre: 'Transferencia Bancaria',
            descripcion: 'Transferencia bancaria directa',
            disponible: true,
          },
        ],
      });
    });
  });

  describe('formatearRespuesta', () => {
    it('debería formatear respuesta exitosa correctamente', () => {
      // Arrange
      const data = { test: 'value' };

      // Act
      const resultado = (checkoutFacade as any).formatearRespuesta(data);

      // Assert
      expect(resultado).toEqual({
        success: true,
        data: { test: 'value' },
      });
    });

    it('debería formatear error de checkout correctamente', () => {
      // Arrange
      const error = new CheckoutError('Error de prueba', { context: 'test' });

      // Act
      const resultado = (checkoutFacade as any).formatearError(error);

      // Assert
      expect(resultado).toEqual({
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: 'Error de prueba',
          type: 'business',
        },
      });
    });

    it('debería formatear error genérico correctamente', () => {
      // Arrange
      const error = new Error('Error genérico');

      // Act
      const resultado = (checkoutFacade as any).formatearError(error);

      // Assert
      expect(resultado).toEqual({
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: 'Error inesperado en el proceso de checkout',
          type: 'internal',
        },
      });
    });
  });
});

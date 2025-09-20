import { CheckoutService } from '../../../application/services/checkout.service';
import { CarritoService } from '../../../../carrito/application/services/carrito.service';
import { PedidoService } from '../../../../pedidos/application/services/pedido.service';
import { ClienteService } from '../../../../clientes/application/services/cliente.service';
import { PagoService } from '../../../../pagos/application/services/pago.service';
import {
  CheckoutError,
  PagoFallidoError,
  CarritoVacioError,
  DatosEntregaInvalidosError,
} from '../../../domain/errors/checkout-errors';
import { EstadoPedido } from '../../../../pedidos/domain/types/pedido.types';
import { MetodoPago } from '../../../domain/types/checkout.types';

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let mockCarritoService: jest.Mocked<CarritoService>;
  let mockPedidoService: jest.Mocked<PedidoService>;
  let mockClienteService: jest.Mocked<ClienteService>;
  let mockPagoService: jest.Mocked<PagoService>;

  beforeEach(() => {
    mockCarritoService = {
      obtenerCarrito: jest.fn(),
      limpiarCarrito: jest.fn(),
      calcularTotal: jest.fn(),
      validarDisponibilidad: jest.fn(),
    } as any;

    mockPedidoService = {
      crearPedido: jest.fn(),
      actualizarEstado: jest.fn(),
      cancelarPedido: jest.fn(),
    } as any;

    mockClienteService = {
      obtenerCliente: jest.fn(),
      validarDatosEntrega: jest.fn(),
      crearClienteInvitado: jest.fn(),
    } as any;

    mockPagoService = {
      procesarPago: jest.fn(),
      confirmarPago: jest.fn(),
      cancelarPago: jest.fn(),
    } as any;

    checkoutService = new CheckoutService(
      mockCarritoService,
      mockPedidoService,
      mockClienteService,
      mockPagoService
    );
  });

  describe('procesarCheckout', () => {
    const datosCheckoutValidos = {
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
      datosPago: {
        numeroTarjeta: '4111111111111111',
        vencimiento: '12/25',
        cvv: '123',
        titular: 'Juan Pérez',
      },
    };

    const carritoMockCompleto = {
      id: 'carrito-456',
      clienteId: 'cliente-123',
      items: [
        {
          productoId: 'prod-1',
          nombre: 'Croissants de Mantequilla',
          cantidad: 2,
          precioUnitario: 1500,
          subtotal: 3000,
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
      descuentos: 0,
      impuestos: 440,
      total: 5940,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    const clienteMock = {
      id: 'cliente-123',
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '+54911234567',
      esVip: false,
      fechaRegistro: new Date(),
    };

    it('debería procesar checkout exitosamente con todos los pasos', async () => {
      // Arrange
      const pedidoMock = {
        id: 'pedido-789',
        clienteId: 'cliente-123',
        items: carritoMockCompleto.items,
        total: 5940,
        estado: EstadoPedido.PENDIENTE_PAGO,
        datosEntrega: datosCheckoutValidos.datosEntrega,
        fechaCreacion: new Date(),
      };

      const pagoMock = {
        id: 'pago-101',
        pedidoId: 'pedido-789',
        monto: 5940,
        metodoPago: 'tarjeta_credito',
        estado: 'aprobado',
        transaccionId: 'mp-12345',
        fechaProcesamiento: new Date(),
      };

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(true);
      mockClienteService.obtenerCliente.mockResolvedValue(clienteMock);
      mockClienteService.validarDatosEntrega.mockResolvedValue(true);
      mockPedidoService.crearPedido.mockResolvedValue(pedidoMock);
      mockPagoService.procesarPago.mockResolvedValue(pagoMock);

      // Act
      const resultado = await checkoutService.procesarCheckout(datosCheckoutValidos);

      // Assert
      expect(resultado.exitoso).toBe(true);
      expect(resultado.pedidoId).toBe('pedido-789');
      expect(resultado.pagoId).toBe('pago-101');
      expect(resultado.total).toBe(5940);
      expect(resultado.transaccionId).toBe('mp-12345');

      // Verificar que se llamaron todos los servicios en orden
      expect(mockCarritoService.obtenerCarrito).toHaveBeenCalledWith('carrito-456');
      expect(mockCarritoService.validarDisponibilidad).toHaveBeenCalledWith('carrito-456');
      expect(mockClienteService.obtenerCliente).toHaveBeenCalledWith('cliente-123');
      expect(mockClienteService.validarDatosEntrega).toHaveBeenCalledWith(
        datosCheckoutValidos.datosEntrega
      );
      expect(mockPedidoService.crearPedido).toHaveBeenCalled();
      expect(mockPagoService.procesarPago).toHaveBeenCalled();
      expect(mockCarritoService.limpiarCarrito).toHaveBeenCalledWith('carrito-456');
    });

    it('debería fallar si el carrito está vacío', async () => {
      // Arrange
      const carritoVacio = {
        ...carritoMockCompleto,
        items: [],
        total: 0,
      };

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoVacio);

      // Act & Assert
      await expect(checkoutService.procesarCheckout(datosCheckoutValidos)).rejects.toThrow(
        CarritoVacioError
      );

      expect(mockCarritoService.obtenerCarrito).toHaveBeenCalledWith('carrito-456');
      expect(mockPedidoService.crearPedido).not.toHaveBeenCalled();
    });

    it('debería fallar si no hay stock disponible', async () => {
      // Arrange
      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(false);

      // Act & Assert
      await expect(checkoutService.procesarCheckout(datosCheckoutValidos)).rejects.toThrow(
        CheckoutError
      );

      expect(mockCarritoService.validarDisponibilidad).toHaveBeenCalledWith('carrito-456');
      expect(mockPedidoService.crearPedido).not.toHaveBeenCalled();
    });

    it('debería fallar si los datos de entrega son inválidos', async () => {
      // Arrange
      const datosEntregaInvalidos = {
        ...datosCheckoutValidos,
        datosEntrega: {
          direccion: '', // Dirección vacía
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
      };

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(true);
      mockClienteService.obtenerCliente.mockResolvedValue(clienteMock);
      mockClienteService.validarDatosEntrega.mockRejectedValue(
        new DatosEntregaInvalidosError('La dirección es requerida')
      );

      // Act & Assert
      await expect(checkoutService.procesarCheckout(datosEntregaInvalidos)).rejects.toThrow(
        DatosEntregaInvalidosError
      );

      expect(mockClienteService.validarDatosEntrega).toHaveBeenCalledWith(
        datosEntregaInvalidos.datosEntrega
      );
      expect(mockPedidoService.crearPedido).not.toHaveBeenCalled();
    });

    it('debería fallar si el pago es rechazado', async () => {
      // Arrange
      const pedidoMock = {
        id: 'pedido-789',
        clienteId: 'cliente-123',
        items: carritoMockCompleto.items,
        total: 5940,
        estado: EstadoPedido.PENDIENTE_PAGO,
      };

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(true);
      mockClienteService.obtenerCliente.mockResolvedValue(clienteMock);
      mockClienteService.validarDatosEntrega.mockResolvedValue(true);
      mockPedidoService.crearPedido.mockResolvedValue(pedidoMock);
      mockPagoService.procesarPago.mockRejectedValue(
        new PagoFallidoError('Tarjeta rechazada por el banco', {
          codigo: 'CARD_DECLINED',
          pedidoId: 'pedido-789',
        })
      );

      // Act & Assert
      await expect(checkoutService.procesarCheckout(datosCheckoutValidos)).rejects.toThrow(
        PagoFallidoError
      );

      // Verificar que se canceló el pedido
      expect(mockPedidoService.cancelarPedido).toHaveBeenCalledWith('pedido-789');
      expect(mockCarritoService.limpiarCarrito).not.toHaveBeenCalled();
    });

    it('debería manejar cliente invitado correctamente', async () => {
      // Arrange
      const datosClienteInvitado = {
        ...datosCheckoutValidos,
        clienteId: undefined,
        datosCliente: {
          nombre: 'María García',
          email: 'maria.garcia@email.com',
          telefono: '+54911987654',
        },
      };

      const clienteInvitadoMock = {
        id: 'cliente-invitado-456',
        nombre: 'María García',
        email: 'maria.garcia@email.com',
        telefono: '+54911987654',
        esInvitado: true,
      };

      const pedidoMock = {
        id: 'pedido-789',
        clienteId: 'cliente-invitado-456',
        items: carritoMockCompleto.items,
        total: 5940,
        estado: EstadoPedido.PENDIENTE_PAGO,
      };

      const pagoMock = {
        id: 'pago-101',
        monto: 5940,
        estado: 'aprobado',
        transaccionId: 'mp-12345',
      };

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(true);
      mockClienteService.crearClienteInvitado.mockResolvedValue(clienteInvitadoMock);
      mockClienteService.validarDatosEntrega.mockResolvedValue(true);
      mockPedidoService.crearPedido.mockResolvedValue(pedidoMock);
      mockPagoService.procesarPago.mockResolvedValue(pagoMock);

      // Act
      const resultado = await checkoutService.procesarCheckout(datosClienteInvitado);

      // Assert
      expect(resultado.exitoso).toBe(true);
      expect(mockClienteService.crearClienteInvitado).toHaveBeenCalledWith(
        datosClienteInvitado.datosCliente
      );
      expect(mockClienteService.obtenerCliente).not.toHaveBeenCalled();
    });
  });

  describe('calcularResumenCheckout', () => {
    it('debería calcular correctamente el resumen del checkout', async () => {
      // Arrange
      const carritoId = 'carrito-456';
      const codigoDescuento = 'VIP15';

      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.calcularTotal.mockResolvedValue({
        subtotal: 5500,
        descuentos: 825, // 15% VIP
        impuestos: 374, // 8% sobre (5500-825)
        total: 5049,
      });

      // Act
      const resumen = await checkoutService.calcularResumenCheckout(carritoId, codigoDescuento);

      // Assert
      expect(resumen.subtotal).toBe(5500);
      expect(resumen.descuentos).toBe(825);
      expect(resumen.impuestos).toBe(374);
      expect(resumen.total).toBe(5049);
      expect(resumen.items).toHaveLength(2);
      expect(mockCarritoService.calcularTotal).toHaveBeenCalledWith(carritoId, codigoDescuento);
    });
  });

  describe('validarCheckout', () => {
    it('debería validar checkout exitosamente', async () => {
      // Arrange
      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoMockCompleto);
      mockCarritoService.validarDisponibilidad.mockResolvedValue(true);
      mockClienteService.obtenerCliente.mockResolvedValue(clienteMock);
      mockClienteService.validarDatosEntrega.mockResolvedValue(true);

      // Act
      const esValido = await checkoutService.validarCheckout(datosCheckoutValidos);

      // Assert
      expect(esValido).toBe(true);
    });

    it('debería fallar validación con carrito vacío', async () => {
      // Arrange
      const carritoVacio = { ...carritoMockCompleto, items: [], total: 0 };
      mockCarritoService.obtenerCarrito.mockResolvedValue(carritoVacio);

      // Act
      const esValido = await checkoutService.validarCheckout(datosCheckoutValidos);

      // Assert
      expect(esValido).toBe(false);
    });
  });
});

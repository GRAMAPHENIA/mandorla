import { CheckoutService } from '../../application/services/checkout.service';
import { CarritoService } from '../../../carrito/application/services/carrito.service';
import { PedidoService } from '../../../pedidos/application/services/pedido.service';
import { ClienteService } from '../../../clientes/application/services/cliente.service';
import { PagoService } from '../../../pagos/application/services/pago.service';
import { ProductoService } from '../../../productos/application/services/producto.service';
import { CheckoutFacade } from '../../presentation/facades/checkout.facade';
import { MetodoPago, EstadoCheckout } from '../../domain/types/checkout.types';
import { EstadoPedido } from '../../../pedidos/domain/types/pedido.types';

/**
 * Tests de integración para el flujo completo de checkout
 * Estos tests validan la integración entre todos los módulos del sistema
 */
describe('Checkout Flow Integration Tests', () => {
  let checkoutService: CheckoutService;
  let checkoutFacade: CheckoutFacade;
  let carritoService: CarritoService;
  let pedidoService: PedidoService;
  let clienteService: ClienteService;
  let pagoService: PagoService;
  let productoService: ProductoService;

  // Datos de prueba realistas
  const clienteTest = {
    id: 'cliente-test-123',
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '+54911234567',
    esVip: false,
  };

  const productosTest = [
    {
      id: 'prod-croissants',
      nombre: 'Croissants de Mantequilla',
      precio: 1500,
      categoria: 'pasteles',
      stock: 10,
    },
    {
      id: 'prod-pan-integral',
      nombre: 'Pan Integral',
      precio: 2500,
      categoria: 'panes',
      stock: 5,
    },
    {
      id: 'prod-galletas-chocolate',
      nombre: 'Galletas de Chocolate',
      precio: 800,
      categoria: 'galletas',
      stock: 20,
    },
  ];

  const carritoTest = {
    id: 'carrito-test-456',
    clienteId: clienteTest.id,
    items: [
      {
        productoId: 'prod-croissants',
        nombre: 'Croissants de Mantequilla',
        cantidad: 2,
        precioUnitario: 1500,
        subtotal: 3000,
      },
      {
        productoId: 'prod-pan-integral',
        nombre: 'Pan Integral',
        cantidad: 1,
        precioUnitario: 2500,
        subtotal: 2500,
      },
    ],
    subtotal: 5500,
    descuentos: 0,
    impuestos: 440, // 8% de impuestos
    total: 5940,
  };

  const datosEntregaTest = {
    direccion: 'Av. Corrientes 1234, Piso 5, Depto B',
    ciudad: 'Buenos Aires',
    codigoPostal: '1043',
    telefono: '+54911234567',
    instrucciones: 'Timbre 2B, preguntar por Juan',
  };

  beforeEach(() => {
    // Configurar mocks de servicios con comportamiento realista
    carritoService = {
      obtenerCarrito: jest.fn().mockResolvedValue(carritoTest),
      validarDisponibilidad: jest.fn().mockResolvedValue(true),
      calcularTotal: jest.fn().mockResolvedValue({
        subtotal: carritoTest.subtotal,
        descuentos: carritoTest.descuentos,
        impuestos: carritoTest.impuestos,
        total: carritoTest.total,
      }),
      limpiarCarrito: jest.fn().mockResolvedValue(undefined),
    } as any;

    clienteService = {
      obtenerCliente: jest.fn().mockResolvedValue(clienteTest),
      validarDatosEntrega: jest.fn().mockResolvedValue(true),
      crearClienteInvitado: jest.fn(),
    } as any;

    pedidoService = {
      crearPedido: jest.fn().mockImplementation(datos =>
        Promise.resolve({
          id: 'pedido-test-789',
          clienteId: datos.clienteId,
          items: datos.items,
          total: datos.total,
          estado: EstadoPedido.PENDIENTE_PAGO,
          datosEntrega: datos.datosEntrega,
          fechaCreacion: new Date(),
        })
      ),
      actualizarEstado: jest.fn().mockResolvedValue(undefined),
      cancelarPedido: jest.fn().mockResolvedValue(undefined),
    } as any;

    pagoService = {
      procesarPago: jest.fn().mockImplementation(datos =>
        Promise.resolve({
          id: 'pago-test-101',
          pedidoId: datos.pedidoId,
          monto: datos.monto,
          metodoPago: datos.metodoPago,
          estado: 'aprobado',
          transaccionId: 'mp-test-12345',
          fechaProcesamiento: new Date(),
        })
      ),
      confirmarPago: jest.fn().mockResolvedValue(undefined),
      cancelarPago: jest.fn().mockResolvedValue(undefined),
    } as any;

    productoService = {
      obtenerProducto: jest.fn().mockImplementation(id => {
        const producto = productosTest.find(p => p.id === id);
        return Promise.resolve(producto || null);
      }),
      actualizarStock: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Crear instancias de servicios
    checkoutService = new CheckoutService(
      carritoService,
      pedidoService,
      clienteService,
      pagoService
    );

    checkoutFacade = new CheckoutFacade();
    // Inyectar servicios mockeados en el facade
    (checkoutFacade as any).checkoutService = checkoutService;
    (checkoutFacade as any).carritoService = carritoService;
    (checkoutFacade as any).pedidoService = pedidoService;
    (checkoutFacade as any).clienteService = clienteService;
    (checkoutFacade as any).pagoService = pagoService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujo completo de checkout exitoso', () => {
    it('debería procesar checkout completo con pago con tarjeta', async () => {
      // Arrange
      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'tarjeta_credito' as MetodoPago,
        datosEntrega: datosEntregaTest,
        datosPago: {
          numeroTarjeta: '4111111111111111',
          vencimiento: '12/25',
          cvv: '123',
          titular: 'Juan Pérez',
        },
      };

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data).toEqual({
        pedidoId: 'pedido-test-789',
        pagoId: 'pago-test-101',
        total: 5940,
        transaccionId: 'mp-test-12345',
        mensaje: 'Checkout procesado exitosamente',
      });

      // Verificar que se llamaron todos los servicios en el orden correcto
      expect(carritoService.obtenerCarrito).toHaveBeenCalledWith(carritoTest.id);
      expect(carritoService.validarDisponibilidad).toHaveBeenCalledWith(carritoTest.id);
      expect(clienteService.obtenerCliente).toHaveBeenCalledWith(clienteTest.id);
      expect(clienteService.validarDatosEntrega).toHaveBeenCalledWith(datosEntregaTest);
      expect(pedidoService.crearPedido).toHaveBeenCalled();
      expect(pagoService.procesarPago).toHaveBeenCalled();
      expect(carritoService.limpiarCarrito).toHaveBeenCalledWith(carritoTest.id);
    });

    it('debería procesar checkout con pago en efectivo', async () => {
      // Arrange
      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Configurar pago en efectivo (sin procesamiento online)
      (pagoService.procesarPago as jest.Mock).mockResolvedValue({
        id: 'pago-efectivo-101',
        pedidoId: 'pedido-test-789',
        monto: 5940,
        metodoPago: 'efectivo',
        estado: 'pendiente',
        fechaProcesamiento: new Date(),
      });

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data?.pagoId).toBe('pago-efectivo-101');

      // Verificar que el pago se marcó como pendiente para efectivo
      const llamadaPago = (pagoService.procesarPago as jest.Mock).mock.calls[0][0];
      expect(llamadaPago.metodoPago).toBe('efectivo');
    });
  });

  describe('Flujo con cliente invitado', () => {
    it('debería procesar checkout para cliente invitado', async () => {
      // Arrange
      const clienteInvitado = {
        nombre: 'María García',
        email: 'maria.garcia@email.com',
        telefono: '+54911987654',
      };

      const datosCheckout = {
        carritoId: carritoTest.id,
        metodoPago: 'tarjeta_credito' as MetodoPago,
        datosEntrega: datosEntregaTest,
        datosCliente: clienteInvitado,
      };

      // Configurar creación de cliente invitado
      (clienteService.crearClienteInvitado as jest.Mock).mockResolvedValue({
        id: 'cliente-invitado-456',
        ...clienteInvitado,
        esInvitado: true,
      });

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(true);
      expect(clienteService.crearClienteInvitado).toHaveBeenCalledWith(clienteInvitado);
      expect(clienteService.obtenerCliente).not.toHaveBeenCalled();
    });
  });

  describe('Flujo con descuentos VIP', () => {
    it('debería aplicar descuento VIP correctamente', async () => {
      // Arrange
      const clienteVip = { ...clienteTest, esVip: true };
      (clienteService.obtenerCliente as jest.Mock).mockResolvedValue(clienteVip);

      // Configurar cálculo con descuento VIP (15%)
      (carritoService.calcularTotal as jest.Mock).mockResolvedValue({
        subtotal: 5500,
        descuentos: 825, // 15% de descuento VIP
        impuestos: 374, // 8% sobre (5500-825)
        total: 5049,
      });

      const datosCheckout = {
        clienteId: clienteVip.id,
        carritoId: carritoTest.id,
        metodoPago: 'tarjeta_credito' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Act
      const resumen = await checkoutFacade.obtenerResumenCheckout(carritoTest.id);
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resumen.success).toBe(true);
      expect(resumen.data?.descuentos).toBe(825);
      expect(resumen.data?.total).toBe(5049);
      expect(resultado.success).toBe(true);
    });
  });

  describe('Manejo de errores en el flujo', () => {
    it('debería manejar carrito vacío', async () => {
      // Arrange
      const carritoVacio = { ...carritoTest, items: [], total: 0 };
      (carritoService.obtenerCarrito as jest.Mock).mockResolvedValue(carritoVacio);

      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.code).toBe('CARRITO_VACIO');
      expect(pedidoService.crearPedido).not.toHaveBeenCalled();
      expect(pagoService.procesarPago).not.toHaveBeenCalled();
    });

    it('debería manejar stock insuficiente', async () => {
      // Arrange
      (carritoService.validarDisponibilidad as jest.Mock).mockResolvedValue(false);

      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error?.code).toBe('CHECKOUT_ERROR');
      expect(pedidoService.crearPedido).not.toHaveBeenCalled();
    });

    it('debería manejar pago rechazado y cancelar pedido', async () => {
      // Arrange
      (pagoService.procesarPago as jest.Mock).mockRejectedValue(new Error('Tarjeta rechazada'));

      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'tarjeta_credito' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(false);
      expect(pedidoService.crearPedido).toHaveBeenCalled();
      expect(pedidoService.cancelarPedido).toHaveBeenCalledWith('pedido-test-789');
      expect(carritoService.limpiarCarrito).not.toHaveBeenCalled();
    });

    it('debería manejar datos de entrega inválidos', async () => {
      // Arrange
      (clienteService.validarDatosEntrega as jest.Mock).mockRejectedValue(
        new Error('Dirección inválida')
      );

      const datosCheckout = {
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: {
          ...datosEntregaTest,
          direccion: '', // Dirección vacía
        },
      };

      // Act
      const resultado = await checkoutFacade.iniciarCheckout(datosCheckout);

      // Assert
      expect(resultado.success).toBe(false);
      expect(pedidoService.crearPedido).not.toHaveBeenCalled();
    });
  });

  describe('Validación de resumen de checkout', () => {
    it('debería calcular resumen correctamente con múltiples productos', async () => {
      // Arrange
      const carritoComplejo = {
        ...carritoTest,
        items: [
          ...carritoTest.items,
          {
            productoId: 'prod-galletas-chocolate',
            nombre: 'Galletas de Chocolate',
            cantidad: 3,
            precioUnitario: 800,
            subtotal: 2400,
          },
        ],
      };

      (carritoService.obtenerCarrito as jest.Mock).mockResolvedValue(carritoComplejo);
      (carritoService.calcularTotal as jest.Mock).mockResolvedValue({
        subtotal: 7900,
        descuentos: 0,
        impuestos: 632,
        total: 8532,
      });

      // Act
      const resultado = await checkoutFacade.obtenerResumenCheckout(carritoTest.id);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data?.items).toHaveLength(3);
      expect(resultado.data?.subtotal).toBe(7900);
      expect(resultado.data?.total).toBe(8532);
    });

    it('debería aplicar código de descuento correctamente', async () => {
      // Arrange
      const codigoDescuento = 'PROMO20';

      (carritoService.calcularTotal as jest.Mock).mockResolvedValue({
        subtotal: 5500,
        descuentos: 1100, // 20% de descuento
        impuestos: 352, // 8% sobre (5500-1100)
        total: 4752,
      });

      // Act
      const resultado = await checkoutFacade.obtenerResumenCheckout(
        carritoTest.id,
        codigoDescuento
      );

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data?.descuentos).toBe(1100);
      expect(resultado.data?.total).toBe(4752);
      expect(carritoService.calcularTotal).toHaveBeenCalledWith(carritoTest.id, codigoDescuento);
    });
  });

  describe('Estados de checkout', () => {
    it('debería obtener estado de checkout correctamente', async () => {
      // Arrange
      const checkoutId = 'checkout-test-123';
      const sesionMock = {
        id: checkoutId,
        estado: EstadoCheckout.PAGO_CONFIRMADO,
        clienteId: clienteTest.id,
        carritoId: carritoTest.id,
        total: 5940,
        transaccionId: 'mp-test-12345',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000),
      };

      // Mock del servicio para obtener sesión
      (checkoutService as any).obtenerSesionCheckout = jest.fn().mockResolvedValue(sesionMock);

      // Act
      const resultado = await checkoutFacade.obtenerEstadoCheckout(checkoutId);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.data?.estado).toBe(EstadoCheckout.PAGO_CONFIRMADO);
      expect(resultado.data?.transaccionId).toBe('mp-test-12345');
      expect(resultado.data?.expirado).toBe(false);
    });
  });

  describe('Performance y concurrencia', () => {
    it('debería manejar múltiples checkouts concurrentes', async () => {
      // Arrange
      const datosCheckout1 = {
        clienteId: 'cliente-1',
        carritoId: 'carrito-1',
        metodoPago: 'tarjeta_credito' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      const datosCheckout2 = {
        clienteId: 'cliente-2',
        carritoId: 'carrito-2',
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: datosEntregaTest,
      };

      // Act - Ejecutar checkouts concurrentes
      const [resultado1, resultado2] = await Promise.all([
        checkoutFacade.iniciarCheckout(datosCheckout1),
        checkoutFacade.iniciarCheckout(datosCheckout2),
      ]);

      // Assert
      expect(resultado1.success).toBe(true);
      expect(resultado2.success).toBe(true);
      expect(resultado1.data?.pedidoId).toBeDefined();
      expect(resultado2.data?.pedidoId).toBeDefined();
      expect(resultado1.data?.pedidoId).not.toBe(resultado2.data?.pedidoId);
    });
  });
});

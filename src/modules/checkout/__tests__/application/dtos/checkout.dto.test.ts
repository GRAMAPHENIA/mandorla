import {
  CrearCheckoutDto,
  ResumenCheckoutDto,
  ResultadoCheckoutDto,
  ValidarCheckoutDto,
  ActualizarDatosEntregaDto,
} from '../../../application/dtos/checkout.dto';
import { MetodoPago } from '../../../domain/types/checkout.types';

describe('Checkout DTOs', () => {
  describe('CrearCheckoutDto', () => {
    const datosValidosCompletos: CrearCheckoutDto = {
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

    it('debería crear DTO válido con todos los campos', () => {
      // Act & Assert
      expect(datosValidosCompletos.clienteId).toBe('cliente-123');
      expect(datosValidosCompletos.carritoId).toBe('carrito-456');
      expect(datosValidosCompletos.metodoPago).toBe('tarjeta_credito');
      expect(datosValidosCompletos.datosEntrega.direccion).toBe('Av. Corrientes 1234');
      expect(datosValidosCompletos.datosPago?.numeroTarjeta).toBe('4111111111111111');
    });

    it('debería crear DTO válido para cliente invitado', () => {
      // Arrange
      const datosClienteInvitado: CrearCheckoutDto = {
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: datosValidosCompletos.datosEntrega,
        datosCliente: {
          nombre: 'María García',
          email: 'maria.garcia@email.com',
          telefono: '+54911987654',
        },
      };

      // Act & Assert
      expect(datosClienteInvitado.clienteId).toBeUndefined();
      expect(datosClienteInvitado.datosCliente).toBeDefined();
      expect(datosClienteInvitado.datosCliente?.nombre).toBe('María García');
    });

    it('debería crear DTO válido para pago en efectivo', () => {
      // Arrange
      const datosEfectivo: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: datosValidosCompletos.datosEntrega,
      };

      // Act & Assert
      expect(datosEfectivo.metodoPago).toBe('efectivo');
      expect(datosEfectivo.datosPago).toBeUndefined();
    });

    it('debería validar métodos de pago permitidos', () => {
      const metodosValidos: MetodoPago[] = [
        'efectivo',
        'tarjeta_credito',
        'tarjeta_debito',
        'transferencia',
      ];

      metodosValidos.forEach(metodo => {
        const datos: CrearCheckoutDto = {
          ...datosValidosCompletos,
          metodoPago: metodo,
        };

        expect(datos.metodoPago).toBe(metodo);
      });
    });
  });

  describe('ResumenCheckoutDto', () => {
    const resumenCompleto: ResumenCheckoutDto = {
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
      codigoDescuento: 'VIP15',
      metodoPagoSeleccionado: 'tarjeta_credito',
    };

    it('debería crear resumen completo correctamente', () => {
      // Act & Assert
      expect(resumenCompleto.items).toHaveLength(2);
      expect(resumenCompleto.subtotal).toBe(5500);
      expect(resumenCompleto.descuentos).toBe(825);
      expect(resumenCompleto.impuestos).toBe(374);
      expect(resumenCompleto.total).toBe(5049);
      expect(resumenCompleto.codigoDescuento).toBe('VIP15');
    });

    it('debería calcular totales correctamente', () => {
      // Arrange
      const subtotalCalculado = resumenCompleto.items.reduce(
        (total, item) => total + item.subtotal,
        0
      );

      // Act & Assert
      expect(subtotalCalculado).toBe(resumenCompleto.subtotal);
      expect(resumenCompleto.total).toBe(
        resumenCompleto.subtotal - resumenCompleto.descuentos + resumenCompleto.impuestos
      );
    });

    it('debería manejar resumen sin descuentos', () => {
      // Arrange
      const resumenSinDescuentos: ResumenCheckoutDto = {
        items: resumenCompleto.items,
        subtotal: 5500,
        descuentos: 0,
        impuestos: 440,
        total: 5940,
      };

      // Act & Assert
      expect(resumenSinDescuentos.descuentos).toBe(0);
      expect(resumenSinDescuentos.codigoDescuento).toBeUndefined();
      expect(resumenSinDescuentos.total).toBe(5940);
    });
  });

  describe('ResultadoCheckoutDto', () => {
    it('debería crear resultado exitoso', () => {
      // Arrange
      const resultadoExitoso: ResultadoCheckoutDto = {
        exitoso: true,
        pedidoId: 'pedido-789',
        pagoId: 'pago-101',
        total: 5940,
        transaccionId: 'mp-12345',
        mensaje: 'Checkout procesado exitosamente',
      };

      // Act & Assert
      expect(resultadoExitoso.exitoso).toBe(true);
      expect(resultadoExitoso.pedidoId).toBe('pedido-789');
      expect(resultadoExitoso.pagoId).toBe('pago-101');
      expect(resultadoExitoso.transaccionId).toBe('mp-12345');
      expect(resultadoExitoso.error).toBeUndefined();
    });

    it('debería crear resultado con error', () => {
      // Arrange
      const resultadoConError: ResultadoCheckoutDto = {
        exitoso: false,
        error: {
          codigo: 'PAGO_FALLIDO',
          mensaje: 'Tarjeta rechazada por el banco',
          detalles: {
            codigoRespuesta: 'CARD_DECLINED',
            banco: 'Banco Test',
          },
        },
      };

      // Act & Assert
      expect(resultadoConError.exitoso).toBe(false);
      expect(resultadoConError.error).toBeDefined();
      expect(resultadoConError.error?.codigo).toBe('PAGO_FALLIDO');
      expect(resultadoConError.pedidoId).toBeUndefined();
      expect(resultadoConError.pagoId).toBeUndefined();
    });

    it('debería crear resultado para pago pendiente', () => {
      // Arrange
      const resultadoPendiente: ResultadoCheckoutDto = {
        exitoso: true,
        pedidoId: 'pedido-789',
        pagoId: 'pago-101',
        total: 5940,
        mensaje: 'Pedido creado, pago pendiente',
        estadoPago: 'pendiente',
      };

      // Act & Assert
      expect(resultadoPendiente.exitoso).toBe(true);
      expect(resultadoPendiente.estadoPago).toBe('pendiente');
      expect(resultadoPendiente.transaccionId).toBeUndefined();
    });
  });

  describe('ValidarCheckoutDto', () => {
    it('debería crear DTO de validación completo', () => {
      // Arrange
      const datosValidacion: ValidarCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        datosEntrega: {
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
        validarStock: true,
        validarPrecio: true,
      };

      // Act & Assert
      expect(datosValidacion.clienteId).toBe('cliente-123');
      expect(datosValidacion.validarStock).toBe(true);
      expect(datosValidacion.validarPrecio).toBe(true);
    });

    it('debería crear DTO de validación mínimo', () => {
      // Arrange
      const datosMinimos: ValidarCheckoutDto = {
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Calle Test 123',
          ciudad: 'Test City',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
      };

      // Act & Assert
      expect(datosMinimos.clienteId).toBeUndefined();
      expect(datosMinimos.validarStock).toBeUndefined();
      expect(datosMinimos.validarPrecio).toBeUndefined();
    });
  });

  describe('ActualizarDatosEntregaDto', () => {
    it('debería crear DTO de actualización completo', () => {
      // Arrange
      const datosActualizacion: ActualizarDatosEntregaDto = {
        checkoutId: 'checkout-123',
        datosEntrega: {
          direccion: 'Nueva Dirección 456',
          ciudad: 'Córdoba',
          codigoPostal: '5000',
          telefono: '+54351123456',
          instrucciones: 'Casa azul con portón negro',
        },
      };

      // Act & Assert
      expect(datosActualizacion.checkoutId).toBe('checkout-123');
      expect(datosActualizacion.datosEntrega.direccion).toBe('Nueva Dirección 456');
      expect(datosActualizacion.datosEntrega.ciudad).toBe('Córdoba');
      expect(datosActualizacion.datosEntrega.instrucciones).toBe('Casa azul con portón negro');
    });

    it('debería crear DTO de actualización sin instrucciones', () => {
      // Arrange
      const datosSinInstrucciones: ActualizarDatosEntregaDto = {
        checkoutId: 'checkout-456',
        datosEntrega: {
          direccion: 'Av. San Martín 789',
          ciudad: 'Mendoza',
          codigoPostal: '5500',
          telefono: '+54261123456',
        },
      };

      // Act & Assert
      expect(datosSinInstrucciones.datosEntrega.instrucciones).toBeUndefined();
    });
  });

  describe('Validaciones de tipos', () => {
    it('debería validar tipos de métodos de pago', () => {
      const metodosValidos = ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia'];

      metodosValidos.forEach(metodo => {
        const datos: CrearCheckoutDto = {
          clienteId: 'test',
          carritoId: 'test',
          metodoPago: metodo as MetodoPago,
          datosEntrega: {
            direccion: 'test',
            ciudad: 'test',
            codigoPostal: '1234',
            telefono: '+54911234567',
          },
        };

        expect(typeof datos.metodoPago).toBe('string');
        expect(metodosValidos).toContain(datos.metodoPago);
      });
    });

    it('debería validar estructura de datos de entrega', () => {
      // Arrange
      const datosEntrega = {
        direccion: 'Av. Test 123',
        ciudad: 'Test City',
        codigoPostal: '1234',
        telefono: '+54911234567',
        instrucciones: 'Test instructions',
      };

      // Act & Assert
      expect(typeof datosEntrega.direccion).toBe('string');
      expect(typeof datosEntrega.ciudad).toBe('string');
      expect(typeof datosEntrega.codigoPostal).toBe('string');
      expect(typeof datosEntrega.telefono).toBe('string');
      expect(typeof datosEntrega.instrucciones).toBe('string');
    });

    it('debería validar estructura de datos de pago', () => {
      // Arrange
      const datosPago = {
        numeroTarjeta: '4111111111111111',
        vencimiento: '12/25',
        cvv: '123',
        titular: 'Juan Pérez',
      };

      // Act & Assert
      expect(typeof datosPago.numeroTarjeta).toBe('string');
      expect(typeof datosPago.vencimiento).toBe('string');
      expect(typeof datosPago.cvv).toBe('string');
      expect(typeof datosPago.titular).toBe('string');
    });
  });

  describe('Serialización y deserialización', () => {
    it('debería serializar y deserializar CrearCheckoutDto correctamente', () => {
      // Arrange
      const datosOriginales: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        datosEntrega: {
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
      };

      // Act
      const serializado = JSON.stringify(datosOriginales);
      const deserializado: CrearCheckoutDto = JSON.parse(serializado);

      // Assert
      expect(deserializado.clienteId).toBe(datosOriginales.clienteId);
      expect(deserializado.carritoId).toBe(datosOriginales.carritoId);
      expect(deserializado.metodoPago).toBe(datosOriginales.metodoPago);
      expect(deserializado.datosEntrega.direccion).toBe(datosOriginales.datosEntrega.direccion);
    });

    it('debería serializar ResumenCheckoutDto con números correctamente', () => {
      // Arrange
      const resumen: ResumenCheckoutDto = {
        items: [],
        subtotal: 5500.5,
        descuentos: 825.75,
        impuestos: 374.25,
        total: 5049.0,
      };

      // Act
      const serializado = JSON.stringify(resumen);
      const deserializado: ResumenCheckoutDto = JSON.parse(serializado);

      // Assert
      expect(deserializado.subtotal).toBe(5500.5);
      expect(deserializado.descuentos).toBe(825.75);
      expect(deserializado.impuestos).toBe(374.25);
      expect(deserializado.total).toBe(5049.0);
    });
  });
});

import { renderHook, act } from '@testing-library/react';
import { useCheckout } from '../../../presentation/hooks/useCheckout';
import { CheckoutFacade } from '../../../presentation/facades/checkout.facade';
import { MetodoPago } from '../../../domain/types/checkout.types';

// Mock del CheckoutFacade
jest.mock('../../../presentation/facades/checkout.facade');

describe('useCheckout', () => {
  let mockCheckoutFacade: jest.Mocked<CheckoutFacade>;

  beforeEach(() => {
    mockCheckoutFacade = {
      iniciarCheckout: jest.fn(),
      obtenerResumenCheckout: jest.fn(),
      validarDatosCheckout: jest.fn(),
      obtenerEstadoCheckout: jest.fn(),
      cancelarCheckout: jest.fn(),
      obtenerMetodosPagoDisponibles: jest.fn(),
    } as any;

    (CheckoutFacade as jest.MockedClass<typeof CheckoutFacade>).mockImplementation(
      () => mockCheckoutFacade
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('estado inicial', () => {
    it('debería inicializar con estado por defecto', () => {
      // Act
      const { result } = renderHook(() => useCheckout());

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutData).toBeNull();
      expect(result.current.resumenCheckout).toBeNull();
      expect(result.current.metodoPagoSeleccionado).toBeNull();
      expect(result.current.datosEntrega).toBeNull();
    });
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
        success: true,
        data: {
          pedidoId: 'pedido-789',
          pagoId: 'pago-101',
          total: 5940,
          transaccionId: 'mp-12345',
          mensaje: 'Checkout procesado exitosamente',
        },
      };

      mockCheckoutFacade.iniciarCheckout.mockResolvedValue(resultadoMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.iniciarCheckout(datosCheckoutValidos);
      });

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutData).toEqual(resultadoMock.data);
      expect(mockCheckoutFacade.iniciarCheckout).toHaveBeenCalledWith(datosCheckoutValidos);
    });

    it('debería manejar error en checkout', async () => {
      // Arrange
      const errorMock = {
        success: false,
        error: {
          code: 'CARRITO_VACIO',
          message: 'El carrito está vacío',
          type: 'validation',
        },
      };

      mockCheckoutFacade.iniciarCheckout.mockResolvedValue(errorMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.iniciarCheckout(datosCheckoutValidos);
      });

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(errorMock.error);
      expect(result.current.checkoutData).toBeNull();
    });

    it('debería manejar loading state correctamente', async () => {
      // Arrange
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockCheckoutFacade.iniciarCheckout.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useCheckout());

      // Act - Iniciar checkout (sin await)
      act(() => {
        result.current.iniciarCheckout(datosCheckoutValidos);
      });

      // Assert - Debería estar en loading
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Act - Resolver promesa
      await act(async () => {
        resolvePromise!({ success: true, data: {} });
      });

      // Assert - Loading debería ser false
      expect(result.current.loading).toBe(false);
    });
  });

  describe('obtenerResumen', () => {
    it('debería obtener resumen exitosamente', async () => {
      // Arrange
      const carritoId = 'carrito-456';
      const codigoDescuento = 'VIP15';

      const resumenMock = {
        success: true,
        data: {
          subtotal: 5500,
          descuentos: 825,
          impuestos: 374,
          total: 5049,
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
        },
      };

      mockCheckoutFacade.obtenerResumenCheckout.mockResolvedValue(resumenMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.obtenerResumen(carritoId, codigoDescuento);
      });

      // Assert
      expect(result.current.resumenCheckout).toEqual(resumenMock.data);
      expect(mockCheckoutFacade.obtenerResumenCheckout).toHaveBeenCalledWith(
        carritoId,
        codigoDescuento
      );
    });

    it('debería manejar error al obtener resumen', async () => {
      // Arrange
      const carritoId = 'carrito-456';
      const errorMock = {
        success: false,
        error: {
          code: 'CARRITO_NO_ENCONTRADO',
          message: 'Carrito no encontrado',
          type: 'not-found',
        },
      };

      mockCheckoutFacade.obtenerResumenCheckout.mockResolvedValue(errorMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.obtenerResumen(carritoId);
      });

      // Assert
      expect(result.current.error).toEqual(errorMock.error);
      expect(result.current.resumenCheckout).toBeNull();
    });
  });

  describe('validarDatos', () => {
    it('debería validar datos exitosamente', async () => {
      // Arrange
      const datosValidacion = {
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

      const validacionMock = {
        success: true,
        data: { valido: true },
      };

      mockCheckoutFacade.validarDatosCheckout.mockResolvedValue(validacionMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      let validacionResult: boolean = false;
      await act(async () => {
        validacionResult = await result.current.validarDatos(datosValidacion);
      });

      // Assert
      expect(validacionResult).toBe(true);
      expect(mockCheckoutFacade.validarDatosCheckout).toHaveBeenCalledWith(datosValidacion);
    });

    it('debería retornar false para datos inválidos', async () => {
      // Arrange
      const datosValidacion = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: {
          direccion: '',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
      };

      const validacionMock = {
        success: false,
        error: {
          code: 'DATOS_INVALIDOS',
          message: 'La dirección es requerida',
          type: 'validation',
        },
      };

      mockCheckoutFacade.validarDatosCheckout.mockResolvedValue(validacionMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      let validacionResult: boolean = true;
      await act(async () => {
        validacionResult = await result.current.validarDatos(datosValidacion);
      });

      // Assert
      expect(validacionResult).toBe(false);
      expect(result.current.error).toEqual(validacionMock.error);
    });
  });

  describe('cancelarCheckout', () => {
    it('debería cancelar checkout exitosamente', async () => {
      // Arrange
      const checkoutId = 'checkout-789';
      const cancelacionMock = {
        success: true,
        data: { cancelado: true },
      };

      mockCheckoutFacade.cancelarCheckout.mockResolvedValue(cancelacionMock);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.cancelarCheckout(checkoutId);
      });

      // Assert
      expect(mockCheckoutFacade.cancelarCheckout).toHaveBeenCalledWith(checkoutId);
    });
  });

  describe('manejo de errores', () => {
    it('debería manejar excepción en iniciarCheckout', async () => {
      // Arrange
      const error = new Error('Error de red');
      mockCheckoutFacade.iniciarCheckout.mockRejectedValue(error);

      const { result } = renderHook(() => useCheckout());

      // Act
      await act(async () => {
        await result.current.iniciarCheckout({
          clienteId: 'cliente-123',
          carritoId: 'carrito-456',
          metodoPago: 'efectivo' as MetodoPago,
          datosEntrega: {
            direccion: 'Test',
            ciudad: 'Test',
            codigoPostal: '1234',
            telefono: '+54911234567',
          },
        });
      });

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'CHECKOUT_ERROR',
        message: 'Error al procesar checkout',
        type: 'infrastructure',
      });
      expect(result.current.checkoutData).toBeNull();
    });
  });

  describe('resetear', () => {
    it('debería resetear todos los valores', () => {
      // Arrange
      const { result } = renderHook(() => useCheckout());

      // Establecer algunos valores de prueba
      act(() => {
        result.current.setError({ code: 'TEST_ERROR', message: 'Error de prueba', type: 'test' });
      });

      // Act
      act(() => {
        result.current.resetear();
      });

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutData).toBeNull();
      expect(result.current.resumenCheckout).toBeNull();
      expect(result.current.metodoPagoSeleccionado).toBeNull();
      expect(result.current.datosEntrega).toBeNull();
    });
  });

  describe('setters de estado', () => {
    it('debería actualizar método de pago seleccionado', () => {
      // Arrange
      const { result } = renderHook(() => useCheckout());
      const metodoPago: MetodoPago = 'tarjeta_credito';

      // Act
      act(() => {
        result.current.setMetodoPagoSeleccionado(metodoPago);
      });

      // Assert
      expect(result.current.metodoPagoSeleccionado).toBe(metodoPago);
    });

    it('debería actualizar datos de entrega', () => {
      // Arrange
      const { result } = renderHook(() => useCheckout());
      const datosEntrega = {
        direccion: 'Nueva Dirección 456',
        ciudad: 'Córdoba',
        codigoPostal: '5000',
        telefono: '+54351123456',
      };

      // Act
      act(() => {
        result.current.setDatosEntrega(datosEntrega);
      });

      // Assert
      expect(result.current.datosEntrega).toEqual(datosEntrega);
    });
  });
});

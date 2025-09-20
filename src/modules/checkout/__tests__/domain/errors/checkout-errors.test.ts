import {
  CheckoutError,
  CarritoVacioError,
  PagoFallidoError,
  DatosEntregaInvalidosError,
  CheckoutExpiradoError,
  CheckoutYaConfirmadoError,
  StockInsuficienteError,
} from '../../../domain/errors/checkout-errors';

describe('Checkout Errors', () => {
  describe('CheckoutError', () => {
    it('debería crear error base con mensaje y contexto', () => {
      // Arrange
      const mensaje = 'Error en el proceso de checkout';
      const contexto = { carritoId: 'carrito-123', clienteId: 'cliente-456' };

      // Act
      const error = new CheckoutError(mensaje, contexto);

      // Assert
      expect(error.message).toBe(mensaje);
      expect(error.code).toBe('CHECKOUT_ERROR');
      expect(error.type).toBe('business');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual(contexto);
      expect(error.name).toBe('CheckoutError');
    });

    it('debería crear error sin contexto', () => {
      // Arrange
      const mensaje = 'Error genérico de checkout';

      // Act
      const error = new CheckoutError(mensaje);

      // Assert
      expect(error.message).toBe(mensaje);
      expect(error.context).toBeUndefined();
    });

    it('debería serializar correctamente a JSON', () => {
      // Arrange
      const error = new CheckoutError('Error de prueba', { test: 'value' });

      // Act
      const json = error.toJSON();

      // Assert
      expect(json.name).toBe('CheckoutError');
      expect(json.code).toBe('CHECKOUT_ERROR');
      expect(json.type).toBe('business');
      expect(json.message).toBe('Error de prueba');
      expect(json.statusCode).toBe(400);
      expect(json.context).toEqual({ test: 'value' });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('CarritoVacioError', () => {
    it('debería crear error de carrito vacío', () => {
      // Arrange
      const carritoId = 'carrito-vacio-123';

      // Act
      const error = new CarritoVacioError(carritoId);

      // Assert
      expect(error.message).toBe(
        `El carrito ${carritoId} está vacío. Agrega productos antes de continuar`
      );
      expect(error.code).toBe('CARRITO_VACIO');
      expect(error.type).toBe('validation');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ carritoId });
    });

    it('debería heredar de CheckoutError', () => {
      // Arrange & Act
      const error = new CarritoVacioError('carrito-123');

      // Assert
      expect(error).toBeInstanceOf(CheckoutError);
    });
  });

  describe('PagoFallidoError', () => {
    it('debería crear error de pago fallido con contexto completo', () => {
      // Arrange
      const mensaje = 'Tarjeta rechazada por el banco';
      const contexto = {
        codigo: 'CARD_DECLINED',
        pedidoId: 'pedido-789',
        monto: 5940,
        metodoPago: 'tarjeta_credito',
      };

      // Act
      const error = new PagoFallidoError(mensaje, contexto);

      // Assert
      expect(error.message).toBe(mensaje);
      expect(error.code).toBe('PAGO_FALLIDO');
      expect(error.type).toBe('infrastructure');
      expect(error.statusCode).toBe(402);
      expect(error.context).toEqual(contexto);
    });

    it('debería crear error de pago fallido simple', () => {
      // Arrange
      const mensaje = 'Error de conexión con el procesador de pagos';

      // Act
      const error = new PagoFallidoError(mensaje);

      // Assert
      expect(error.message).toBe(mensaje);
      expect(error.context).toBeUndefined();
    });

    it('debería heredar de CheckoutError', () => {
      // Arrange & Act
      const error = new PagoFallidoError('Error de pago');

      // Assert
      expect(error).toBeInstanceOf(CheckoutError);
    });
  });

  describe('DatosEntregaInvalidosError', () => {
    it('debería crear error de datos de entrega inválidos', () => {
      // Arrange
      const mensaje = 'La dirección es requerida';
      const contexto = {
        campo: 'direccion',
        valor: '',
        regla: 'required',
      };

      // Act
      const error = new DatosEntregaInvalidosError(mensaje, contexto);

      // Assert
      expect(error.message).toBe(mensaje);
      expect(error.code).toBe('DATOS_ENTREGA_INVALIDOS');
      expect(error.type).toBe('validation');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual(contexto);
    });

    it('debería crear error para múltiples campos inválidos', () => {
      // Arrange
      const mensaje = 'Múltiples campos inválidos';
      const contexto = {
        errores: [
          { campo: 'direccion', mensaje: 'Dirección requerida' },
          { campo: 'telefono', mensaje: 'Formato de teléfono inválido' },
        ],
      };

      // Act
      const error = new DatosEntregaInvalidosError(mensaje, contexto);

      // Assert
      expect(error.context?.errores).toHaveLength(2);
      expect(error.context?.errores[0].campo).toBe('direccion');
      expect(error.context?.errores[1].campo).toBe('telefono');
    });
  });

  describe('CheckoutExpiradoError', () => {
    it('debería crear error de checkout expirado', () => {
      // Arrange
      const checkoutId = 'checkout-123';
      const fechaExpiracion = new Date();

      // Act
      const error = new CheckoutExpiradoError(checkoutId, fechaExpiracion);

      // Assert
      expect(error.message).toBe(`La sesión de checkout ${checkoutId} ha expirado`);
      expect(error.code).toBe('CHECKOUT_EXPIRADO');
      expect(error.type).toBe('business');
      expect(error.statusCode).toBe(410);
      expect(error.context).toEqual({
        checkoutId,
        fechaExpiracion: fechaExpiracion.toISOString(),
      });
    });

    it('debería heredar de CheckoutError', () => {
      // Arrange & Act
      const error = new CheckoutExpiradoError('checkout-123', new Date());

      // Assert
      expect(error).toBeInstanceOf(CheckoutError);
    });
  });

  describe('CheckoutYaConfirmadoError', () => {
    it('debería crear error de checkout ya confirmado', () => {
      // Arrange
      const checkoutId = 'checkout-456';
      const transaccionId = 'mp-12345';

      // Act
      const error = new CheckoutYaConfirmadoError(checkoutId, transaccionId);

      // Assert
      expect(error.message).toBe(`El checkout ${checkoutId} ya fue confirmado`);
      expect(error.code).toBe('CHECKOUT_YA_CONFIRMADO');
      expect(error.type).toBe('business');
      expect(error.statusCode).toBe(409);
      expect(error.context).toEqual({
        checkoutId,
        transaccionId,
      });
    });

    it('debería crear error sin transacción ID', () => {
      // Arrange
      const checkoutId = 'checkout-456';

      // Act
      const error = new CheckoutYaConfirmadoError(checkoutId);

      // Assert
      expect(error.context?.transaccionId).toBeUndefined();
      expect(error.context?.checkoutId).toBe(checkoutId);
    });
  });

  describe('StockInsuficienteError', () => {
    it('debería crear error de stock insuficiente', () => {
      // Arrange
      const productoId = 'producto-123';
      const cantidadSolicitada = 5;
      const stockDisponible = 2;

      // Act
      const error = new StockInsuficienteError(productoId, cantidadSolicitada, stockDisponible);

      // Assert
      expect(error.message).toBe(
        `Stock insuficiente para el producto ${productoId}. Solicitado: ${cantidadSolicitada}, Disponible: ${stockDisponible}`
      );
      expect(error.code).toBe('STOCK_INSUFICIENTE');
      expect(error.type).toBe('business');
      expect(error.statusCode).toBe(409);
      expect(error.context).toEqual({
        productoId,
        cantidadSolicitada,
        stockDisponible,
      });
    });

    it('debería crear error con información del producto', () => {
      // Arrange
      const productoId = 'producto-456';
      const cantidadSolicitada = 10;
      const stockDisponible = 0;
      const nombreProducto = 'Croissants de Mantequilla';

      // Act
      const error = new StockInsuficienteError(productoId, cantidadSolicitada, stockDisponible, {
        nombreProducto,
      });

      // Assert
      expect(error.context?.nombreProducto).toBe(nombreProducto);
      expect(error.context?.productoId).toBe(productoId);
    });
  });

  describe('Error inheritance and instanceof', () => {
    it('todos los errores deberían ser instancia de Error', () => {
      const errores = [
        new CheckoutError('test'),
        new CarritoVacioError('carrito-123'),
        new PagoFallidoError('pago fallido'),
        new DatosEntregaInvalidosError('datos inválidos'),
        new CheckoutExpiradoError('checkout-123', new Date()),
        new CheckoutYaConfirmadoError('checkout-123'),
        new StockInsuficienteError('producto-123', 5, 2),
      ];

      errores.forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(CheckoutError);
      });
    });

    it('debería mantener stack trace', () => {
      // Act
      const error = new CheckoutError('Test error');

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('CheckoutError');
    });
  });

  describe('Error context validation', () => {
    it('debería validar que el contexto sea serializable', () => {
      // Arrange
      const contextoSerializable = {
        string: 'valor',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        date: new Date().toISOString(),
      };

      // Act
      const error = new CheckoutError('Test', contextoSerializable);
      const json = error.toJSON();

      // Assert
      expect(json.context).toEqual(contextoSerializable);
    });
  });
});

import { CheckoutValidator } from '../../../application/validators/checkout.validator';
import { CrearCheckoutDto, ValidarCheckoutDto } from '../../../application/dtos/checkout.dto';
import { MetodoPago } from '../../../domain/types/checkout.types';
import { DatosEntregaInvalidosError, CheckoutError } from '../../../domain/errors/checkout-errors';

describe('CheckoutValidator', () => {
  describe('validarDatosCheckout', () => {
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

    it('debería validar datos completos exitosamente', () => {
      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosValidosCompletos)).not.toThrow();
    });

    it('debería validar datos mínimos para efectivo', () => {
      // Arrange
      const datosEfectivo: CrearCheckoutDto = {
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

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosEfectivo)).not.toThrow();
    });

    it('debería fallar con clienteId vacío', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        clienteId: '',
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosInvalidos)).toThrow(CheckoutError);
    });

    it('debería fallar con carritoId vacío', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        carritoId: '',
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosInvalidos)).toThrow(CheckoutError);
    });

    it('debería fallar con método de pago inválido', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        metodoPago: 'metodo_invalido' as MetodoPago,
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosInvalidos)).toThrow(CheckoutError);
    });

    it('debería validar cliente invitado con datos de cliente', () => {
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
      expect(() => CheckoutValidator.validarDatosCheckout(datosClienteInvitado)).not.toThrow();
    });

    it('debería fallar si no hay clienteId ni datosCliente', () => {
      // Arrange
      const datosSinCliente = {
        carritoId: 'carrito-456',
        metodoPago: 'efectivo' as MetodoPago,
        datosEntrega: datosValidosCompletos.datosEntrega,
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(datosSinCliente)).toThrow(CheckoutError);
    });
  });

  describe('validarDatosEntrega', () => {
    const datosEntregaValidos = {
      direccion: 'Av. Corrientes 1234',
      ciudad: 'Buenos Aires',
      codigoPostal: '1043',
      telefono: '+54911234567',
      instrucciones: 'Timbre 2B',
    };

    it('debería validar datos de entrega completos', () => {
      // Act & Assert
      expect(() => CheckoutValidator.validarDatosEntrega(datosEntregaValidos)).not.toThrow();
    });

    it('debería validar datos de entrega sin instrucciones', () => {
      // Arrange
      const datosSinInstrucciones = {
        direccion: 'Calle Test 123',
        ciudad: 'Test City',
        codigoPostal: '1234',
        telefono: '+54911234567',
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosEntrega(datosSinInstrucciones)).not.toThrow();
    });

    describe('validación de dirección', () => {
      it('debería fallar con dirección vacía', () => {
        // Arrange
        const datosInvalidos = {
          ...datosEntregaValidos,
          direccion: '',
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería fallar con dirección solo espacios', () => {
        // Arrange
        const datosInvalidos = {
          ...datosEntregaValidos,
          direccion: '   ',
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería fallar con dirección demasiado corta', () => {
        // Arrange
        const datosInvalidos = {
          ...datosEntregaValidos,
          direccion: 'A 1',
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería fallar con dirección demasiado larga', () => {
        // Arrange
        const direccionLarga = 'A'.repeat(201);
        const datosInvalidos = {
          ...datosEntregaValidos,
          direccion: direccionLarga,
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería aceptar direcciones con caracteres especiales', () => {
        // Arrange
        const direccionesValidas = [
          'Av. José de San Martín 1234, Piso 5°',
          'Calle "Los Álamos" 456 - Barrio Norte',
          'Pasaje 9 de Julio #789 (entre Mitre y Sarmiento)',
        ];

        // Act & Assert
        direccionesValidas.forEach(direccion => {
          const datos = { ...datosEntregaValidos, direccion };
          expect(() => CheckoutValidator.validarDatosEntrega(datos)).not.toThrow();
        });
      });
    });

    describe('validación de ciudad', () => {
      it('debería fallar con ciudad vacía', () => {
        // Arrange
        const datosInvalidos = {
          ...datosEntregaValidos,
          ciudad: '',
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería aceptar ciudades con caracteres especiales', () => {
        // Arrange
        const ciudadesValidas = [
          'Buenos Aires',
          'San José de la Dormida',
          'Villa María del Río Seco',
          'Comodoro Rivadavia',
        ];

        // Act & Assert
        ciudadesValidas.forEach(ciudad => {
          const datos = { ...datosEntregaValidos, ciudad };
          expect(() => CheckoutValidator.validarDatosEntrega(datos)).not.toThrow();
        });
      });

      it('debería fallar con ciudad demasiado larga', () => {
        // Arrange
        const ciudadLarga = 'Ciudad'.repeat(21);
        const datosInvalidos = {
          ...datosEntregaValidos,
          ciudad: ciudadLarga,
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });
    });

    describe('validación de código postal', () => {
      it('debería aceptar códigos postales argentinos válidos', () => {
        // Arrange
        const codigosValidos = ['1043', '2000', '5000', '4000', '9410'];

        // Act & Assert
        codigosValidos.forEach(codigoPostal => {
          const datos = { ...datosEntregaValidos, codigoPostal };
          expect(() => CheckoutValidator.validarDatosEntrega(datos)).not.toThrow();
        });
      });

      it('debería fallar con códigos postales inválidos', () => {
        // Arrange
        const codigosInvalidos = ['', '123', '12345', 'ABCD', '1A23'];

        // Act & Assert
        codigosInvalidos.forEach(codigoPostal => {
          const datosInvalidos = { ...datosEntregaValidos, codigoPostal };
          expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
            DatosEntregaInvalidosError
          );
        });
      });
    });

    describe('validación de teléfono', () => {
      it('debería aceptar teléfonos argentinos válidos', () => {
        // Arrange
        const telefonosValidos = [
          '+54911234567',
          '+5434112345678',
          '+543511234567',
          '011-1234-5678',
          '(011) 1234-5678',
          '11 1234-5678',
        ];

        // Act & Assert
        telefonosValidos.forEach(telefono => {
          const datos = { ...datosEntregaValidos, telefono };
          expect(() => CheckoutValidator.validarDatosEntrega(datos)).not.toThrow();
        });
      });

      it('debería fallar con teléfonos inválidos', () => {
        // Arrange
        const telefonosInvalidos = [
          '',
          '123',
          'abcdefg',
          '+1234',
          '54911234567890123', // Demasiado largo
        ];

        // Act & Assert
        telefonosInvalidos.forEach(telefono => {
          const datosInvalidos = { ...datosEntregaValidos, telefono };
          expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
            DatosEntregaInvalidosError
          );
        });
      });
    });

    describe('validación de instrucciones', () => {
      it('debería aceptar instrucciones válidas', () => {
        // Arrange
        const instruccionesValidas = [
          'Timbre 2B',
          'Casa con portón verde, tocar 2 veces',
          'Edificio "Los Álamos", piso 5, depto A',
          'Preguntar por María José en portería',
        ];

        // Act & Assert
        instruccionesValidas.forEach(instrucciones => {
          const datos = { ...datosEntregaValidos, instrucciones };
          expect(() => CheckoutValidator.validarDatosEntrega(datos)).not.toThrow();
        });
      });

      it('debería fallar con instrucciones demasiado largas', () => {
        // Arrange
        const instruccionesLargas = 'Instrucciones '.repeat(50);
        const datosInvalidos = {
          ...datosEntregaValidos,
          instrucciones: instruccionesLargas,
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosInvalidos)).toThrow(
          DatosEntregaInvalidosError
        );
      });

      it('debería aceptar instrucciones undefined', () => {
        // Arrange
        const datosSinInstrucciones = {
          ...datosEntregaValidos,
          instrucciones: undefined,
        };

        // Act & Assert
        expect(() => CheckoutValidator.validarDatosEntrega(datosSinInstrucciones)).not.toThrow();
      });
    });
  });

  describe('validarDatosPago', () => {
    const datosPagoValidos = {
      numeroTarjeta: '4111111111111111',
      vencimiento: '12/25',
      cvv: '123',
      titular: 'Juan Pérez',
    };

    it('debería validar datos de pago completos', () => {
      // Act & Assert
      expect(() => CheckoutValidator.validarDatosPago(datosPagoValidos)).not.toThrow();
    });

    describe('validación de número de tarjeta', () => {
      it('debería aceptar números de tarjeta válidos', () => {
        // Arrange
        const numerosValidos = [
          '4111111111111111', // Visa
          '5555555555554444', // MasterCard
          '378282246310005', // American Express
          '4000 0000 0000 0002', // Con espacios
          '4000-0000-0000-0002', // Con guiones
        ];

        // Act & Assert
        numerosValidos.forEach(numeroTarjeta => {
          const datos = { ...datosPagoValidos, numeroTarjeta };
          expect(() => CheckoutValidator.validarDatosPago(datos)).not.toThrow();
        });
      });

      it('debería fallar con números de tarjeta inválidos', () => {
        // Arrange
        const numerosInvalidos = [
          '',
          '1234',
          '1234567890123456', // Número inválido
          'abcd1234efgh5678',
          '4111 1111 1111 111', // Muy corto
        ];

        // Act & Assert
        numerosInvalidos.forEach(numeroTarjeta => {
          const datosInvalidos = { ...datosPagoValidos, numeroTarjeta };
          expect(() => CheckoutValidator.validarDatosPago(datosInvalidos)).toThrow(CheckoutError);
        });
      });
    });

    describe('validación de vencimiento', () => {
      it('debería aceptar fechas de vencimiento válidas', () => {
        // Arrange
        const vencimientosValidos = ['12/25', '01/26', '06/30', '12/99'];

        // Act & Assert
        vencimientosValidos.forEach(vencimiento => {
          const datos = { ...datosPagoValidos, vencimiento };
          expect(() => CheckoutValidator.validarDatosPago(datos)).not.toThrow();
        });
      });

      it('debería fallar con fechas de vencimiento inválidas', () => {
        // Arrange
        const vencimientosInvalidos = [
          '',
          '13/25', // Mes inválido
          '00/25', // Mes inválido
          '12/23', // Año pasado (asumiendo año actual 2024)
          '1/25', // Formato incorrecto
          '12/2025', // Formato incorrecto
          'ab/cd',
        ];

        // Act & Assert
        vencimientosInvalidos.forEach(vencimiento => {
          const datosInvalidos = { ...datosPagoValidos, vencimiento };
          expect(() => CheckoutValidator.validarDatosPago(datosInvalidos)).toThrow(CheckoutError);
        });
      });
    });

    describe('validación de CVV', () => {
      it('debería aceptar CVV válidos', () => {
        // Arrange
        const cvvsValidos = ['123', '456', '000', '999'];

        // Act & Assert
        cvvsValidos.forEach(cvv => {
          const datos = { ...datosPagoValidos, cvv };
          expect(() => CheckoutValidator.validarDatosPago(datos)).not.toThrow();
        });
      });

      it('debería fallar con CVV inválidos', () => {
        // Arrange
        const cvvsInvalidos = [
          '',
          '12', // Muy corto
          '1234', // Muy largo
          'abc', // No numérico
          '12a',
        ];

        // Act & Assert
        cvvsInvalidos.forEach(cvv => {
          const datosInvalidos = { ...datosPagoValidos, cvv };
          expect(() => CheckoutValidator.validarDatosPago(datosInvalidos)).toThrow(CheckoutError);
        });
      });
    });

    describe('validación de titular', () => {
      it('debería aceptar nombres de titular válidos', () => {
        // Arrange
        const titularesValidos = [
          'Juan Pérez',
          'María José García López',
          'José de San Martín',
          'Ana María',
        ];

        // Act & Assert
        titularesValidos.forEach(titular => {
          const datos = { ...datosPagoValidos, titular };
          expect(() => CheckoutValidator.validarDatosPago(datos)).not.toThrow();
        });
      });

      it('debería fallar con nombres de titular inválidos', () => {
        // Arrange
        const titularesInvalidos = [
          '',
          'A', // Muy corto
          'Juan123', // Con números
          'Juan@Pérez', // Con símbolos
          'A'.repeat(101), // Muy largo
        ];

        // Act & Assert
        titularesInvalidos.forEach(titular => {
          const datosInvalidos = { ...datosPagoValidos, titular };
          expect(() => CheckoutValidator.validarDatosPago(datosInvalidos)).toThrow(CheckoutError);
        });
      });
    });
  });

  describe('validarDatosCliente', () => {
    const datosClienteValidos = {
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      telefono: '+54911987654',
    };

    it('debería validar datos de cliente completos', () => {
      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCliente(datosClienteValidos)).not.toThrow();
    });

    it('debería fallar con nombre vacío', () => {
      // Arrange
      const datosInvalidos = {
        ...datosClienteValidos,
        nombre: '',
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCliente(datosInvalidos)).toThrow(CheckoutError);
    });

    it('debería fallar con email inválido', () => {
      // Arrange
      const emailsInvalidos = ['', 'email-invalido', '@email.com', 'email@', 'email@.com'];

      // Act & Assert
      emailsInvalidos.forEach(email => {
        const datosInvalidos = { ...datosClienteValidos, email };
        expect(() => CheckoutValidator.validarDatosCliente(datosInvalidos)).toThrow(CheckoutError);
      });
    });

    it('debería aceptar emails válidos', () => {
      // Arrange
      const emailsValidos = [
        'test@email.com',
        'maria.garcia@empresa.com.ar',
        'usuario+tag@dominio.org',
        'nombre_apellido@test-domain.co.uk',
      ];

      // Act & Assert
      emailsValidos.forEach(email => {
        const datos = { ...datosClienteValidos, email };
        expect(() => CheckoutValidator.validarDatosCliente(datos)).not.toThrow();
      });
    });
  });

  describe('validarMetodoPago', () => {
    it('debería aceptar métodos de pago válidos', () => {
      // Arrange
      const metodosValidos: MetodoPago[] = [
        'efectivo',
        'tarjeta_credito',
        'tarjeta_debito',
        'transferencia',
      ];

      // Act & Assert
      metodosValidos.forEach(metodo => {
        expect(() => CheckoutValidator.validarMetodoPago(metodo)).not.toThrow();
      });
    });

    it('debería fallar con métodos de pago inválidos', () => {
      // Arrange
      const metodosInvalidos = ['', 'bitcoin', 'paypal', 'cheque', 'metodo_inexistente'];

      // Act & Assert
      metodosInvalidos.forEach(metodo => {
        expect(() => CheckoutValidator.validarMetodoPago(metodo as MetodoPago)).toThrow(
          CheckoutError
        );
      });
    });
  });

  describe('validaciones combinadas', () => {
    it('debería validar checkout completo con tarjeta', () => {
      // Arrange
      const checkoutCompleto: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        datosEntrega: {
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
        datosPago: {
          numeroTarjeta: '4111111111111111',
          vencimiento: '12/25',
          cvv: '123',
          titular: 'Juan Pérez',
        },
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(checkoutCompleto)).not.toThrow();
    });

    it('debería fallar si falta datos de pago para tarjeta', () => {
      // Arrange
      const checkoutSinDatosPago: CrearCheckoutDto = {
        clienteId: 'cliente-123',
        carritoId: 'carrito-456',
        metodoPago: 'tarjeta_credito',
        datosEntrega: {
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires',
          codigoPostal: '1043',
          telefono: '+54911234567',
        },
        // Sin datosPago
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(checkoutSinDatosPago)).toThrow(
        CheckoutError
      );
    });

    it('debería validar checkout de cliente invitado', () => {
      // Arrange
      const checkoutInvitado: CrearCheckoutDto = {
        carritoId: 'carrito-456',
        metodoPago: 'efectivo',
        datosEntrega: {
          direccion: 'Calle Test 123',
          ciudad: 'Test City',
          codigoPostal: '1234',
          telefono: '+54911234567',
        },
        datosCliente: {
          nombre: 'Cliente Invitado',
          email: 'invitado@email.com',
          telefono: '+54911234567',
        },
      };

      // Act & Assert
      expect(() => CheckoutValidator.validarDatosCheckout(checkoutInvitado)).not.toThrow();
    });
  });
});

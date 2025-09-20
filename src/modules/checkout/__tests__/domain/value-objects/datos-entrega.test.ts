import { DatosEntrega } from '../../../domain/value-objects/datos-entrega';
import { DatosEntregaInvalidosError } from '../../../domain/errors/checkout-errors';

describe('DatosEntrega', () => {
  const datosValidosCompletos = {
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    codigoPostal: '1043',
    telefono: '+54911234567',
    instrucciones: 'Timbre 2B, preguntar por Juan',
  };

  const datosValidosMinimos = {
    direccion: 'Calle Falsa 123',
    ciudad: 'Rosario',
    codigoPostal: '2000',
    telefono: '+54341123456',
  };

  describe('crear', () => {
    it('debería crear datos de entrega con información completa', () => {
      // Act
      const datosEntrega = DatosEntrega.crear(datosValidosCompletos);

      // Assert
      expect(datosEntrega.direccion).toBe('Av. Corrientes 1234');
      expect(datosEntrega.ciudad).toBe('Buenos Aires');
      expect(datosEntrega.codigoPostal).toBe('1043');
      expect(datosEntrega.telefono).toBe('+54911234567');
      expect(datosEntrega.instrucciones).toBe('Timbre 2B, preguntar por Juan');
    });

    it('debería crear datos de entrega con información mínima', () => {
      // Act
      const datosEntrega = DatosEntrega.crear(datosValidosMinimos);

      // Assert
      expect(datosEntrega.direccion).toBe('Calle Falsa 123');
      expect(datosEntrega.ciudad).toBe('Rosario');
      expect(datosEntrega.codigoPostal).toBe('2000');
      expect(datosEntrega.telefono).toBe('+54341123456');
      expect(datosEntrega.instrucciones).toBeUndefined();
    });

    it('debería normalizar espacios en blanco', () => {
      // Arrange
      const datosConEspacios = {
        direccion: '  Av. Corrientes 1234  ',
        ciudad: '  Buenos Aires  ',
        codigoPostal: '  1043  ',
        telefono: '  +54911234567  ',
        instrucciones: '  Timbre 2B  ',
      };

      // Act
      const datosEntrega = DatosEntrega.crear(datosConEspacios);

      // Assert
      expect(datosEntrega.direccion).toBe('Av. Corrientes 1234');
      expect(datosEntrega.ciudad).toBe('Buenos Aires');
      expect(datosEntrega.codigoPostal).toBe('1043');
      expect(datosEntrega.telefono).toBe('+54911234567');
      expect(datosEntrega.instrucciones).toBe('Timbre 2B');
    });
  });

  describe('validaciones de dirección', () => {
    it('debería fallar con dirección vacía', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        direccion: '',
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });

    it('debería fallar con dirección solo espacios', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        direccion: '   ',
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });

    it('debería fallar con dirección demasiado corta', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        direccion: 'A 1',
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });

    it('debería fallar con dirección demasiado larga', () => {
      // Arrange
      const direccionLarga = 'A'.repeat(201);
      const datosInvalidos = {
        ...datosValidosCompletos,
        direccion: direccionLarga,
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });
  });

  describe('validaciones de ciudad', () => {
    it('debería fallar con ciudad vacía', () => {
      // Arrange
      const datosInvalidos = {
        ...datosValidosCompletos,
        ciudad: '',
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });

    it('debería aceptar ciudades con caracteres especiales', () => {
      // Arrange
      const datosConCaracteresEspeciales = {
        ...datosValidosCompletos,
        ciudad: 'San José de la Dormida',
      };

      // Act
      const datosEntrega = DatosEntrega.crear(datosConCaracteresEspeciales);

      // Assert
      expect(datosEntrega.ciudad).toBe('San José de la Dormida');
    });

    it('debería fallar con ciudad demasiado larga', () => {
      // Arrange
      const ciudadLarga = 'Ciudad'.repeat(21);
      const datosInvalidos = {
        ...datosValidosCompletos,
        ciudad: ciudadLarga,
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });
  });

  describe('validaciones de código postal', () => {
    it('debería aceptar códigos postales argentinos válidos', () => {
      const codigosValidos = ['1043', '2000', '5000', '4000', '9410'];

      codigosValidos.forEach(codigo => {
        // Arrange
        const datos = {
          ...datosValidosCompletos,
          codigoPostal: codigo,
        };

        // Act & Assert
        expect(() => DatosEntrega.crear(datos)).not.toThrow();
      });
    });

    it('debería fallar con código postal inválido', () => {
      const codigosInvalidos = ['', '123', '12345', 'ABCD', '1A23'];

      codigosInvalidos.forEach(codigo => {
        // Arrange
        const datosInvalidos = {
          ...datosValidosCompletos,
          codigoPostal: codigo,
        };

        // Act & Assert
        expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
      });
    });
  });

  describe('validaciones de teléfono', () => {
    it('debería aceptar teléfonos argentinos válidos', () => {
      const telefonosValidos = [
        '+54911234567',
        '+5434112345678',
        '+543511234567',
        '011-1234-5678',
        '(011) 1234-5678',
      ];

      telefonosValidos.forEach(telefono => {
        // Arrange
        const datos = {
          ...datosValidosCompletos,
          telefono,
        };

        // Act & Assert
        expect(() => DatosEntrega.crear(datos)).not.toThrow();
      });
    });

    it('debería fallar con teléfonos inválidos', () => {
      const telefonosInvalidos = [
        '',
        '123',
        'abcdefg',
        '+1234',
        '54911234567890123', // Demasiado largo
      ];

      telefonosInvalidos.forEach(telefono => {
        // Arrange
        const datosInvalidos = {
          ...datosValidosCompletos,
          telefono,
        };

        // Act & Assert
        expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
      });
    });
  });

  describe('validaciones de instrucciones', () => {
    it('debería aceptar instrucciones opcionales', () => {
      // Arrange
      const datosConInstrucciones = {
        ...datosValidosCompletos,
        instrucciones: 'Tocar timbre 2 veces, casa con portón verde',
      };

      // Act
      const datosEntrega = DatosEntrega.crear(datosConInstrucciones);

      // Assert
      expect(datosEntrega.instrucciones).toBe('Tocar timbre 2 veces, casa con portón verde');
    });

    it('debería aceptar instrucciones undefined', () => {
      // Arrange
      const datosSinInstrucciones = {
        ...datosValidosCompletos,
        instrucciones: undefined,
      };

      // Act
      const datosEntrega = DatosEntrega.crear(datosSinInstrucciones);

      // Assert
      expect(datosEntrega.instrucciones).toBeUndefined();
    });

    it('debería fallar con instrucciones demasiado largas', () => {
      // Arrange
      const instruccionesLargas = 'Instrucciones '.repeat(50);
      const datosInvalidos = {
        ...datosValidosCompletos,
        instrucciones: instruccionesLargas,
      };

      // Act & Assert
      expect(() => DatosEntrega.crear(datosInvalidos)).toThrow(DatosEntregaInvalidosError);
    });

    it('debería convertir instrucciones vacías a undefined', () => {
      // Arrange
      const datosConInstruccionesVacias = {
        ...datosValidosCompletos,
        instrucciones: '   ',
      };

      // Act
      const datosEntrega = DatosEntrega.crear(datosConInstruccionesVacias);

      // Assert
      expect(datosEntrega.instrucciones).toBeUndefined();
    });
  });

  describe('equals', () => {
    it('debería ser igual con los mismos datos', () => {
      // Arrange
      const datos1 = DatosEntrega.crear(datosValidosCompletos);
      const datos2 = DatosEntrega.crear(datosValidosCompletos);

      // Act & Assert
      expect(datos1.equals(datos2)).toBe(true);
    });

    it('debería ser diferente con direcciones distintas', () => {
      // Arrange
      const datos1 = DatosEntrega.crear(datosValidosCompletos);
      const datos2 = DatosEntrega.crear({
        ...datosValidosCompletos,
        direccion: 'Otra Dirección 456',
      });

      // Act & Assert
      expect(datos1.equals(datos2)).toBe(false);
    });

    it('debería ser diferente con instrucciones distintas', () => {
      // Arrange
      const datos1 = DatosEntrega.crear(datosValidosCompletos);
      const datos2 = DatosEntrega.crear({
        ...datosValidosCompletos,
        instrucciones: 'Otras instrucciones',
      });

      // Act & Assert
      expect(datos1.equals(datos2)).toBe(false);
    });

    it('debería manejar comparación con undefined', () => {
      // Arrange
      const datos1 = DatosEntrega.crear(datosValidosCompletos);
      const datos2 = DatosEntrega.crear(datosValidosMinimos);

      // Act & Assert
      expect(datos1.equals(datos2)).toBe(false);
    });
  });

  describe('toPersistence', () => {
    it('debería convertir a formato de persistencia', () => {
      // Arrange
      const datosEntrega = DatosEntrega.crear(datosValidosCompletos);

      // Act
      const persistence = datosEntrega.toPersistence();

      // Assert
      expect(persistence.direccion).toBe('Av. Corrientes 1234');
      expect(persistence.ciudad).toBe('Buenos Aires');
      expect(persistence.codigoPostal).toBe('1043');
      expect(persistence.telefono).toBe('+54911234567');
      expect(persistence.instrucciones).toBe('Timbre 2B, preguntar por Juan');
    });

    it('debería manejar instrucciones undefined', () => {
      // Arrange
      const datosEntrega = DatosEntrega.crear(datosValidosMinimos);

      // Act
      const persistence = datosEntrega.toPersistence();

      // Assert
      expect(persistence.instrucciones).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('debería crear desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        direccion: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires',
        codigoPostal: '1043',
        telefono: '+54911234567',
        instrucciones: 'Timbre 2B',
      };

      // Act
      const datosEntrega = DatosEntrega.fromPersistence(persistenceData);

      // Assert
      expect(datosEntrega.direccion).toBe('Av. Corrientes 1234');
      expect(datosEntrega.ciudad).toBe('Buenos Aires');
      expect(datosEntrega.codigoPostal).toBe('1043');
      expect(datosEntrega.telefono).toBe('+54911234567');
      expect(datosEntrega.instrucciones).toBe('Timbre 2B');
    });
  });
});

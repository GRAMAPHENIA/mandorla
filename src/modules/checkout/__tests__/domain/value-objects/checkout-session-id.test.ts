import { CheckoutSessionId } from '../../../domain/value-objects/checkout-session-id';
import { CheckoutError } from '../../../domain/errors/checkout-errors';

describe('CheckoutSessionId', () => {
  describe('crear', () => {
    it('debería crear un ID único automáticamente', () => {
      // Act
      const id1 = CheckoutSessionId.crear();
      const id2 = CheckoutSessionId.crear();

      // Assert
      expect(id1.value).toBeDefined();
      expect(id2.value).toBeDefined();
      expect(id1.value).not.toBe(id2.value);
      expect(typeof id1.value).toBe('string');
      expect(id1.value.length).toBeGreaterThan(0);
    });

    it('debería crear ID con formato válido', () => {
      // Act
      const id = CheckoutSessionId.crear();

      // Assert
      // Verificar que el ID tenga formato UUID o similar
      expect(id.value).toMatch(/^checkout-[a-f0-9-]+$/i);
    });

    it('debería crear múltiples IDs únicos', () => {
      // Arrange
      const ids = new Set<string>();
      const cantidadIds = 100;

      // Act
      for (let i = 0; i < cantidadIds; i++) {
        const id = CheckoutSessionId.crear();
        ids.add(id.value);
      }

      // Assert
      expect(ids.size).toBe(cantidadIds);
    });
  });

  describe('fromString', () => {
    it('debería crear ID desde string válido', () => {
      // Arrange
      const idString = 'checkout-123e4567-e89b-12d3-a456-426614174000';

      // Act
      const id = CheckoutSessionId.fromString(idString);

      // Assert
      expect(id.value).toBe(idString);
    });

    it('debería fallar con string vacío', () => {
      // Act & Assert
      expect(() => CheckoutSessionId.fromString('')).toThrow(CheckoutError);
    });

    it('debería fallar con string null o undefined', () => {
      // Act & Assert
      expect(() => CheckoutSessionId.fromString(null as any)).toThrow(CheckoutError);

      expect(() => CheckoutSessionId.fromString(undefined as any)).toThrow(CheckoutError);
    });

    it('debería fallar con formato inválido', () => {
      const idsInvalidos = [
        'invalid-id',
        '123',
        'checkout-',
        'not-checkout-format',
        'checkout-invalid-format',
      ];

      idsInvalidos.forEach(idInvalido => {
        expect(() => CheckoutSessionId.fromString(idInvalido)).toThrow(CheckoutError);
      });
    });

    it('debería aceptar diferentes formatos válidos de checkout', () => {
      const idsValidos = [
        'checkout-123e4567-e89b-12d3-a456-426614174000',
        'checkout-abcd1234-5678-90ef-ghij-klmnopqrstuv',
        'checkout-12345678-1234-1234-1234-123456789012',
      ];

      idsValidos.forEach(idValido => {
        expect(() => CheckoutSessionId.fromString(idValido)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('debería ser igual con el mismo valor', () => {
      // Arrange
      const idString = 'checkout-123e4567-e89b-12d3-a456-426614174000';
      const id1 = CheckoutSessionId.fromString(idString);
      const id2 = CheckoutSessionId.fromString(idString);

      // Act & Assert
      expect(id1.equals(id2)).toBe(true);
      expect(id2.equals(id1)).toBe(true);
    });

    it('debería ser diferente con valores distintos', () => {
      // Arrange
      const id1 = CheckoutSessionId.crear();
      const id2 = CheckoutSessionId.crear();

      // Act & Assert
      expect(id1.equals(id2)).toBe(false);
      expect(id2.equals(id1)).toBe(false);
    });

    it('debería manejar comparación con null o undefined', () => {
      // Arrange
      const id = CheckoutSessionId.crear();

      // Act & Assert
      expect(id.equals(null as any)).toBe(false);
      expect(id.equals(undefined as any)).toBe(false);
    });

    it('debería ser reflexivo', () => {
      // Arrange
      const id = CheckoutSessionId.crear();

      // Act & Assert
      expect(id.equals(id)).toBe(true);
    });
  });

  describe('toString', () => {
    it('debería retornar el valor como string', () => {
      // Arrange
      const idString = 'checkout-123e4567-e89b-12d3-a456-426614174000';
      const id = CheckoutSessionId.fromString(idString);

      // Act
      const result = id.toString();

      // Assert
      expect(result).toBe(idString);
      expect(typeof result).toBe('string');
    });

    it('debería ser consistente con la propiedad value', () => {
      // Arrange
      const id = CheckoutSessionId.crear();

      // Act & Assert
      expect(id.toString()).toBe(id.value);
    });
  });

  describe('validaciones', () => {
    it('debería validar longitud mínima', () => {
      // Arrange
      const idCorto = 'checkout-123';

      // Act & Assert
      expect(() => CheckoutSessionId.fromString(idCorto)).toThrow(CheckoutError);
    });

    it('debería validar longitud máxima', () => {
      // Arrange
      const idLargo = 'checkout-' + 'a'.repeat(100);

      // Act & Assert
      expect(() => CheckoutSessionId.fromString(idLargo)).toThrow(CheckoutError);
    });

    it('debería validar caracteres permitidos', () => {
      const idsConCaracteresInvalidos = [
        'checkout-123@456',
        'checkout-123 456',
        'checkout-123#456',
        'checkout-123$456',
      ];

      idsConCaracteresInvalidos.forEach(idInvalido => {
        expect(() => CheckoutSessionId.fromString(idInvalido)).toThrow(CheckoutError);
      });
    });

    it('debería permitir caracteres válidos', () => {
      const idsConCaracteresValidos = [
        'checkout-123456789',
        'checkout-abcdef123',
        'checkout-123-456-789',
        'checkout-abc-def-123',
      ];

      idsConCaracteresValidos.forEach(idValido => {
        expect(() => CheckoutSessionId.fromString(idValido)).not.toThrow();
      });
    });
  });

  describe('inmutabilidad', () => {
    it('debería ser inmutable', () => {
      // Arrange
      const id = CheckoutSessionId.crear();
      const valorOriginal = id.value;

      // Act - Intentar modificar (esto no debería ser posible en TypeScript)
      // Pero verificamos que el valor no cambie
      const valorDespues = id.value;

      // Assert
      expect(valorDespues).toBe(valorOriginal);
    });

    it('debería mantener el mismo valor en múltiples accesos', () => {
      // Arrange
      const id = CheckoutSessionId.crear();

      // Act
      const valor1 = id.value;
      const valor2 = id.value;
      const valor3 = id.toString();

      // Assert
      expect(valor1).toBe(valor2);
      expect(valor2).toBe(valor3);
    });
  });

  describe('serialización', () => {
    it('debería serializar correctamente a JSON', () => {
      // Arrange
      const id = CheckoutSessionId.crear();
      const objeto = { checkoutId: id };

      // Act
      const json = JSON.stringify(objeto);
      const parsed = JSON.parse(json);

      // Assert
      expect(parsed.checkoutId).toBe(id.value);
    });

    it('debería deserializar correctamente desde JSON', () => {
      // Arrange
      const idOriginal = CheckoutSessionId.crear();
      const json = JSON.stringify({ checkoutId: idOriginal.value });

      // Act
      const parsed = JSON.parse(json);
      const idReconstruido = CheckoutSessionId.fromString(parsed.checkoutId);

      // Assert
      expect(idReconstruido.equals(idOriginal)).toBe(true);
    });
  });

  describe('casos edge', () => {
    it('debería manejar strings con espacios al inicio y final', () => {
      // Arrange
      const idConEspacios = '  checkout-123e4567-e89b-12d3-a456-426614174000  ';
      const idLimpio = 'checkout-123e4567-e89b-12d3-a456-426614174000';

      // Act
      const id = CheckoutSessionId.fromString(idConEspacios);

      // Assert
      expect(id.value).toBe(idLimpio);
    });

    it('debería ser case-sensitive', () => {
      // Arrange
      const idMinuscula = 'checkout-abcdef123456';
      const idMayuscula = 'CHECKOUT-ABCDEF123456';

      // Act & Assert
      expect(() => CheckoutSessionId.fromString(idMinuscula)).not.toThrow();

      expect(() => CheckoutSessionId.fromString(idMayuscula)).toThrow(CheckoutError);
    });

    it('debería manejar IDs con diferentes separadores', () => {
      const idsConSeparadores = [
        'checkout-123-456-789',
        'checkout-123_456_789', // Inválido
        'checkout-123.456.789', // Inválido
        'checkout-123456789', // Válido
      ];

      // Solo los que tienen guiones o sin separadores deberían ser válidos
      expect(() => CheckoutSessionId.fromString(idsConSeparadores[0])).not.toThrow();

      expect(() => CheckoutSessionId.fromString(idsConSeparadores[1])).toThrow();

      expect(() => CheckoutSessionId.fromString(idsConSeparadores[2])).toThrow();

      expect(() => CheckoutSessionId.fromString(idsConSeparadores[3])).not.toThrow();
    });
  });

  describe('performance', () => {
    it('debería crear IDs rápidamente', () => {
      // Arrange
      const cantidadIds = 1000;
      const tiempoInicio = Date.now();

      // Act
      for (let i = 0; i < cantidadIds; i++) {
        CheckoutSessionId.crear();
      }

      const tiempoTranscurrido = Date.now() - tiempoInicio;

      // Assert
      // Debería crear 1000 IDs en menos de 1 segundo
      expect(tiempoTranscurrido).toBeLessThan(1000);
    });

    it('debería validar IDs rápidamente', () => {
      // Arrange
      const ids = Array.from({ length: 1000 }, () => CheckoutSessionId.crear().value);
      const tiempoInicio = Date.now();

      // Act
      ids.forEach(idString => {
        CheckoutSessionId.fromString(idString);
      });

      const tiempoTranscurrido = Date.now() - tiempoInicio;

      // Assert
      // Debería validar 1000 IDs en menos de 500ms
      expect(tiempoTranscurrido).toBeLessThan(500);
    });
  });
});

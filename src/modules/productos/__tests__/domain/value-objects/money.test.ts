import { Money } from '../../../domain/value-objects/money';
import { InvalidMoneyError } from '../../../domain/errors/product-errors';

describe('Money Value Object', () => {
  describe('Creación de Money', () => {
    it('debería crear Money con valor válido', () => {
      // Act
      const money = Money.create(1500);

      // Assert
      expect(money.value).toBe(1500);
      expect(money.currency).toBe('COP');
    });

    it('debería crear Money con moneda específica', () => {
      // Act
      const money = Money.create(100, 'USD');

      // Assert
      expect(money.value).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('debería lanzar error con valor negativo', () => {
      // Act & Assert
      expect(() => Money.create(-100)).toThrow(InvalidMoneyError);
    });

    it('debería lanzar error con valor cero', () => {
      // Act & Assert
      expect(() => Money.create(0)).toThrow(InvalidMoneyError);
    });

    it('debería lanzar error con valor no numérico', () => {
      // Act & Assert
      expect(() => Money.create(NaN)).toThrow(InvalidMoneyError);

      expect(() => Money.create(Infinity)).toThrow(InvalidMoneyError);
    });
  });

  describe('Operaciones matemáticas', () => {
    let baseMoney: Money;

    beforeEach(() => {
      baseMoney = Money.create(1000);
    });

    it('debería sumar dos valores Money', () => {
      // Arrange
      const otherMoney = Money.create(500);

      // Act
      const result = baseMoney.add(otherMoney);

      // Assert
      expect(result.value).toBe(1500);
      expect(result.currency).toBe('COP');
    });

    it('debería restar dos valores Money', () => {
      // Arrange
      const otherMoney = Money.create(300);

      // Act
      const result = baseMoney.subtract(otherMoney);

      // Assert
      expect(result.value).toBe(700);
      expect(result.currency).toBe('COP');
    });

    it('debería multiplicar por un factor', () => {
      // Act
      const result = baseMoney.multiply(2.5);

      // Assert
      expect(result.value).toBe(2500);
      expect(result.currency).toBe('COP');
    });

    it('debería dividir por un divisor', () => {
      // Act
      const result = baseMoney.divide(4);

      // Assert
      expect(result.value).toBe(250);
      expect(result.currency).toBe('COP');
    });

    it('debería lanzar error al sumar monedas diferentes', () => {
      // Arrange
      const usdMoney = Money.create(100, 'USD');

      // Act & Assert
      expect(() => baseMoney.add(usdMoney)).toThrow(InvalidMoneyError);
    });

    it('debería lanzar error al dividir por cero', () => {
      // Act & Assert
      expect(() => baseMoney.divide(0)).toThrow(InvalidMoneyError);
    });

    it('debería lanzar error con resultado negativo en resta', () => {
      // Arrange
      const largerMoney = Money.create(1500);

      // Act & Assert
      expect(() => baseMoney.subtract(largerMoney)).toThrow(InvalidMoneyError);
    });
  });

  describe('Comparaciones', () => {
    let baseMoney: Money;

    beforeEach(() => {
      baseMoney = Money.create(1000);
    });

    it('debería comparar si es mayor que otro Money', () => {
      // Arrange
      const smallerMoney = Money.create(500);
      const largerMoney = Money.create(1500);

      // Act & Assert
      expect(baseMoney.isGreaterThan(smallerMoney)).toBe(true);
      expect(baseMoney.isGreaterThan(largerMoney)).toBe(false);
      expect(baseMoney.isGreaterThan(baseMoney)).toBe(false);
    });

    it('debería comparar si es menor que otro Money', () => {
      // Arrange
      const smallerMoney = Money.create(500);
      const largerMoney = Money.create(1500);

      // Act & Assert
      expect(baseMoney.isLessThan(smallerMoney)).toBe(false);
      expect(baseMoney.isLessThan(largerMoney)).toBe(true);
      expect(baseMoney.isLessThan(baseMoney)).toBe(false);
    });

    it('debería comparar si es igual a otro Money', () => {
      // Arrange
      const sameMoney = Money.create(1000);
      const differentMoney = Money.create(500);

      // Act & Assert
      expect(baseMoney.equals(sameMoney)).toBe(true);
      expect(baseMoney.equals(differentMoney)).toBe(false);
    });

    it('debería lanzar error al comparar monedas diferentes', () => {
      // Arrange
      const usdMoney = Money.create(1000, 'USD');

      // Act & Assert
      expect(() => baseMoney.isGreaterThan(usdMoney)).toThrow(InvalidMoneyError);

      expect(() => baseMoney.equals(usdMoney)).toThrow(InvalidMoneyError);
    });
  });

  describe('Formateo', () => {
    it('debería formatear pesos colombianos correctamente', () => {
      // Arrange
      const money = Money.create(1500);

      // Act
      const formatted = money.format();

      // Assert
      expect(formatted).toBe('$1.500 COP');
    });

    it('debería formatear dólares correctamente', () => {
      // Arrange
      const money = Money.create(1500, 'USD');

      // Act
      const formatted = money.format();

      // Assert
      expect(formatted).toBe('$1,500 USD');
    });

    it('debería formatear valores grandes correctamente', () => {
      // Arrange
      const money = Money.create(1234567);

      // Act
      const formatted = money.format();

      // Assert
      expect(formatted).toBe('$1.234.567 COP');
    });
  });

  describe('Inmutabilidad', () => {
    it('debería mantener inmutabilidad en operaciones', () => {
      // Arrange
      const originalMoney = Money.create(1000);
      const addMoney = Money.create(500);

      // Act
      const result = originalMoney.add(addMoney);

      // Assert
      expect(originalMoney.value).toBe(1000); // No debe cambiar
      expect(addMoney.value).toBe(500); // No debe cambiar
      expect(result.value).toBe(1500); // Nuevo objeto
      expect(result).not.toBe(originalMoney); // Diferentes referencias
    });
  });

  describe('Casos edge', () => {
    it('debería manejar valores decimales correctamente', () => {
      // Arrange & Act
      const money = Money.create(1500.75);

      // Assert
      expect(money.value).toBe(1500.75);
    });

    it('debería manejar operaciones con decimales', () => {
      // Arrange
      const money1 = Money.create(1000.5);
      const money2 = Money.create(500.25);

      // Act
      const result = money1.add(money2);

      // Assert
      expect(result.value).toBe(1500.75);
    });
  });
});

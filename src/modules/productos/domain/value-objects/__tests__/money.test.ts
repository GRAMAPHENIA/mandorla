import { Money } from '../money';
import { PrecioProductoInvalidoError } from '../../errors/producto-errors';
import { expectToThrow } from '@/test-utils/test-helpers';

describe('Money', () => {
  describe('crear', () => {
    it('debería crear un objeto Money válido', () => {
      // Arrange
      const valor = 2500;

      // Act
      const money = Money.crear(valor);

      // Assert
      expect(money).toBeInstanceOf(Money);
      expect(money.valor).toBe(valor);
    });

    it('debería lanzar error con valor negativo', async () => {
      // Arrange
      const valorNegativo = -100;

      // Act & Assert
      await expectToThrow(() => Money.crear(valorNegativo), PrecioProductoInvalidoError);
    });

    it('debería lanzar error con valor cero', async () => {
      // Arrange
      const valorCero = 0;

      // Act & Assert
      await expectToThrow(() => Money.crear(valorCero), PrecioProductoInvalidoError);
    });

    it('debería permitir valores decimales', () => {
      // Arrange
      const valorDecimal = 25.5;

      // Act
      const money = Money.crear(valorDecimal);

      // Assert
      expect(money.valor).toBe(valorDecimal);
    });
  });

  describe('sumar', () => {
    it('debería sumar dos objetos Money correctamente', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(500);

      // Act
      const resultado = money1.sumar(money2);

      // Assert
      expect(resultado.valor).toBe(1500);
    });

    it('debería mantener inmutabilidad al sumar', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(500);
      const valorOriginal = money1.valor;

      // Act
      money1.sumar(money2);

      // Assert
      expect(money1.valor).toBe(valorOriginal);
    });
  });

  describe('restar', () => {
    it('debería restar dos objetos Money correctamente', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(300);

      // Act
      const resultado = money1.restar(money2);

      // Assert
      expect(resultado.valor).toBe(700);
    });

    it('debería lanzar error si el resultado es negativo', async () => {
      // Arrange
      const money1 = Money.crear(500);
      const money2 = Money.crear(1000);

      // Act & Assert
      await expectToThrow(() => money1.restar(money2), PrecioProductoInvalidoError);
    });

    it('debería permitir resultado cero', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(1000);

      // Act
      const resultado = money1.restar(money2);

      // Assert
      expect(resultado.valor).toBe(0);
    });
  });

  describe('multiplicar', () => {
    it('debería multiplicar por un número correctamente', () => {
      // Arrange
      const money = Money.crear(100);
      const multiplicador = 3;

      // Act
      const resultado = money.multiplicar(multiplicador);

      // Assert
      expect(resultado.valor).toBe(300);
    });

    it('debería multiplicar por decimal correctamente', () => {
      // Arrange
      const money = Money.crear(1000);
      const multiplicador = 0.15;

      // Act
      const resultado = money.multiplicar(multiplicador);

      // Assert
      expect(resultado.valor).toBe(150);
    });

    it('debería lanzar error con multiplicador negativo', async () => {
      // Arrange
      const money = Money.crear(1000);
      const multiplicadorNegativo = -2;

      // Act & Assert
      await expectToThrow(() => money.multiplicar(multiplicadorNegativo), Error);
    });
  });

  describe('dividir', () => {
    it('debería dividir por un número correctamente', () => {
      // Arrange
      const money = Money.crear(1000);
      const divisor = 4;

      // Act
      const resultado = money.dividir(divisor);

      // Assert
      expect(resultado.valor).toBe(250);
    });

    it('debería lanzar error al dividir por cero', async () => {
      // Arrange
      const money = Money.crear(1000);

      // Act & Assert
      await expectToThrow(() => money.dividir(0), Error);
    });

    it('debería lanzar error con divisor negativo', async () => {
      // Arrange
      const money = Money.crear(1000);

      // Act & Assert
      await expectToThrow(() => money.dividir(-2), Error);
    });
  });

  describe('esIgualA', () => {
    it('debería retornar true para valores iguales', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(1000);

      // Act & Assert
      expect(money1.esIgualA(money2)).toBe(true);
    });

    it('debería retornar false para valores diferentes', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(500);

      // Act & Assert
      expect(money1.esIgualA(money2)).toBe(false);
    });
  });

  describe('esMayorQue', () => {
    it('debería retornar true cuando es mayor', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(500);

      // Act & Assert
      expect(money1.esMayorQue(money2)).toBe(true);
    });

    it('debería retornar false cuando es menor o igual', () => {
      // Arrange
      const money1 = Money.crear(500);
      const money2 = Money.crear(1000);
      const money3 = Money.crear(500);

      // Act & Assert
      expect(money1.esMayorQue(money2)).toBe(false);
      expect(money1.esMayorQue(money3)).toBe(false);
    });
  });

  describe('esMenorQue', () => {
    it('debería retornar true cuando es menor', () => {
      // Arrange
      const money1 = Money.crear(500);
      const money2 = Money.crear(1000);

      // Act & Assert
      expect(money1.esMenorQue(money2)).toBe(true);
    });

    it('debería retornar false cuando es mayor o igual', () => {
      // Arrange
      const money1 = Money.crear(1000);
      const money2 = Money.crear(500);
      const money3 = Money.crear(1000);

      // Act & Assert
      expect(money1.esMenorQue(money2)).toBe(false);
      expect(money1.esMenorQue(money3)).toBe(false);
    });
  });

  describe('formatear', () => {
    it('debería formatear el valor como moneda colombiana por defecto', () => {
      // Arrange
      const money = Money.crear(2500);

      // Act
      const formateado = money.formatear();

      // Assert
      expect(formateado).toBe('$2,500');
    });

    it('debería formatear valores grandes correctamente', () => {
      // Arrange
      const money = Money.crear(1250000);

      // Act
      const formateado = money.formatear();

      // Assert
      expect(formateado).toBe('$1,250,000');
    });

    it('debería formatear valores decimales correctamente', () => {
      // Arrange
      const money = Money.crear(2500.5);

      // Act
      const formateado = money.formatear();

      // Assert
      expect(formateado).toBe('$2,500.50');
    });
  });

  describe('aplicarDescuento', () => {
    it('debería aplicar descuento porcentual correctamente', () => {
      // Arrange
      const money = Money.crear(1000);
      const descuento = 0.15; // 15%

      // Act
      const resultado = money.aplicarDescuento(descuento);

      // Assert
      expect(resultado.valor).toBe(850); // 1000 - (1000 * 0.15)
    });

    it('debería retornar el mismo valor con descuento cero', () => {
      // Arrange
      const money = Money.crear(1000);

      // Act
      const resultado = money.aplicarDescuento(0);

      // Assert
      expect(resultado.valor).toBe(1000);
    });

    it('debería lanzar error con descuento negativo', async () => {
      // Arrange
      const money = Money.crear(1000);

      // Act & Assert
      await expectToThrow(() => money.aplicarDescuento(-0.1), Error);
    });

    it('debería lanzar error con descuento mayor a 100%', async () => {
      // Arrange
      const money = Money.crear(1000);

      // Act & Assert
      await expectToThrow(() => money.aplicarDescuento(1.5), Error);
    });
  });
});

/**
 * Value Object para representar valores monetarios
 * Garantiza que los valores monetarios sean válidos y consistentes
 */
export class Money {
  private constructor(private readonly _value: number) {
    this.validate(_value)
  }

  /**
   * Crea un nuevo Money
   */
  static create(value: number): Money {
    return new Money(value)
  }

  /**
   * Crea un Money con valor cero
   */
  static zero(): Money {
    return new Money(0)
  }

  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('El valor monetario debe ser un número válido')
    }

    if (value < 0) {
      throw new Error('El valor monetario no puede ser negativo')
    }

    if (!isFinite(value)) {
      throw new Error('El valor monetario debe ser finito')
    }
  }

  /**
   * Suma dos valores monetarios
   */
  add(other: Money): Money {
    return new Money(this._value + other._value)
  }

  /**
   * Resta dos valores monetarios
   */
  subtract(other: Money): Money {
    const result = this._value - other._value
    if (result < 0) {
      throw new Error('El resultado de la resta no puede ser negativo')
    }
    return new Money(result)
  }

  /**
   * Multiplica el valor monetario por un factor
   */
  multiply(factor: number): Money {
    if (typeof factor !== 'number' || isNaN(factor) || factor < 0) {
      throw new Error('El factor de multiplicación debe ser un número positivo')
    }
    return new Money(this._value * factor)
  }

  /**
   * Compara si este valor es mayor que otro
   */
  isGreaterThan(other: Money): boolean {
    return this._value > other._value
  }

  /**
   * Compara si este valor es menor que otro
   */
  isLessThan(other: Money): boolean {
    return this._value < other._value
  }

  /**
   * Compara si dos valores monetarios son iguales
   */
  equals(other: Money): boolean {
    return Math.abs(this._value - other._value) < 0.01 // Tolerancia para decimales
  }

  /**
   * Verifica si el valor es cero
   */
  isZero(): boolean {
    return this._value === 0
  }

  get value(): number {
    return this._value
  }

  /**
   * Formatea el valor como moneda española
   */
  format(currency: string = 'EUR', locale: string = 'es-ES'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this._value)
  }

  /**
   * Formatea para mostrar en la panadería (sin símbolo de moneda)
   */
  formatSimple(): string {
    return `${this._value.toFixed(2)}€`
  }

  /**
   * Redondea el valor a 2 decimales
   */
  round(): Money {
    return new Money(Math.round(this._value * 100) / 100)
  }

  toString(): string {
    return this._value.toFixed(2)
  }
}
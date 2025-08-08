/**
 * Value Object para representar dinero
 * Garantiza que los precios sean válidos y positivos
 */
export class Money {
  private readonly _amount: number
  private readonly _currency: string

  constructor(amount: number, currency: string = 'USD') {
    if (amount < 0) {
      throw new Error('El precio no puede ser negativo')
    }
    if (!Number.isFinite(amount)) {
      throw new Error('El precio debe ser un número válido')
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('La moneda no puede estar vacía')
    }

    this._amount = Math.round(amount * 100) / 100 // Redondear a 2 decimales
    this._currency = currency.trim().toUpperCase()
  }

  get amount(): number {
    return this._amount
  }

  get currency(): string {
    return this._currency
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('No se pueden sumar monedas de diferentes divisas')
    }
    return new Money(this._amount + other._amount, this._currency)
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new Error('El factor de multiplicación debe ser un número positivo')
    }
    return new Money(this._amount * factor, this._currency)
  }

  isGreaterThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw new Error('No se pueden comparar monedas de diferentes divisas')
    }
    return this._amount > other._amount
  }

  toString(): string {
    return `${this._amount.toFixed(2)} ${this._currency}`
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency
    }
  }
}
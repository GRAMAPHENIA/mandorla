import { CheckoutError } from '../errors/checkout-errors';

/**
 * Value Object para ID de sesión de checkout
 */
export class CheckoutSessionId {
  private constructor(private readonly _value: string) {
    this.validate(_value);
  }

  static crear(): CheckoutSessionId {
    const id = `checkout-${this.generateUniqueId()}`;
    return new CheckoutSessionId(id);
  }

  static fromString(value: string): CheckoutSessionId {
    if (!value || typeof value !== 'string') {
      throw new CheckoutError('ID de checkout inválido: debe ser un string no vacío');
    }

    return new CheckoutSessionId(value.trim());
  }

  private static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(value: string): void {
    if (!value || value.length < 10) {
      throw new CheckoutError('ID de checkout demasiado corto');
    }

    if (value.length > 100) {
      throw new CheckoutError('ID de checkout demasiado largo');
    }

    if (!value.startsWith('checkout-')) {
      throw new CheckoutError('ID de checkout debe comenzar con "checkout-"');
    }

    if (!/^checkout-[a-z0-9-]+$/i.test(value)) {
      throw new CheckoutError('ID de checkout contiene caracteres inválidos');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: CheckoutSessionId): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

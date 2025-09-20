/**
 * Value Object para identificador único de pedido
 * Proyecto Mandorla - Panadería E-commerce
 */

export class PedidoId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value?: string): PedidoId {
    const id = value || this.generateId();
    this.validate(id);
    return new PedidoId(id);
  }

  static fromString(value: string): PedidoId {
    this.validate(value);
    return new PedidoId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PedidoId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  private static validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del pedido no puede estar vacío');
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error('El ID del pedido debe tener entre 3 y 50 caracteres');
    }

    // Validar formato: debe comenzar con 'PED-' seguido de números/letras
    const formatoValido = /^PED-[A-Z0-9]{6,}$/i.test(value);
    if (!formatoValido) {
      throw new Error('El ID del pedido debe tener el formato PED-XXXXXX');
    }
  }

  private static generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PED-${timestamp}${random}`.toUpperCase();
  }
}

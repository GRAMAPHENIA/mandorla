/**
 * Value Object para identificador único de cliente
 * Proyecto Mandorla - Panadería E-commerce
 */

export class ClienteId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value?: string): ClienteId {
    const id = value || this.generateId();
    this.validate(id);
    return new ClienteId(id);
  }

  static fromString(value: string): ClienteId {
    this.validate(value);
    return new ClienteId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ClienteId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  private static validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del cliente no puede estar vacío');
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error('El ID del cliente debe tener entre 3 y 50 caracteres');
    }

    // Validar formato: debe comenzar con 'CLI-' seguido de números/letras
    const formatoValido = /^CLI-[A-Z0-9]{6,}$/i.test(value);
    if (!formatoValido) {
      throw new Error('El ID del cliente debe tener el formato CLI-XXXXXX');
    }
  }

  private static generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CLI-${timestamp}${random}`.toUpperCase();
  }
}

/**
 * Value Object para el identificador del carrito
 * Garantiza que el ID sea válido y único
 */
export class CartId {
  private constructor(private readonly _value: string) {
    this.validate(_value)
  }

  /**
   * Crea un nuevo CartId
   */
  static create(value: string): CartId {
    return new CartId(value)
  }

  /**
   * Genera un nuevo CartId único
   */
  static generate(): CartId {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 15)
    return new CartId(`cart_${timestamp}_${randomPart}`)
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del carrito no puede estar vacío')
    }

    if (value.length > 100) {
      throw new Error('El ID del carrito no puede exceder 100 caracteres')
    }
  }

  get value(): string {
    return this._value
  }

  /**
   * Compara dos CartId para verificar igualdad
   */
  equals(other: CartId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
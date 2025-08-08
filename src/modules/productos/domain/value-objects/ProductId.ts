/**
 * Value Object para identificador de producto
 * Garantiza que el ID sea válido y no vacío
 */
export class ProductId {
  private readonly _value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del producto no puede estar vacío')
    }
    this._value = value.trim()
  }

  get value(): string {
    return this._value
  }

  equals(other: ProductId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
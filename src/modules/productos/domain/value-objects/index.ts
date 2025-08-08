/**
 * Value Objects para el dominio de productos
 */

export class ProductId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del producto no puede estar vacío')
    }
  }

  equals(other: ProductId): boolean {
    return this.value === other.value
  }
}

export class Money {
  constructor(public readonly amount: number, public readonly currency: string = 'EUR') {
    if (amount < 0) {
      throw new Error('El monto no puede ser negativo')
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('La moneda es requerida')
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`
  }
}

export class ProductCategory {
  constructor(
    public readonly name: string,
    public readonly description?: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre de la categoría es requerido')
    }
  }

  equals(other: ProductCategory): boolean {
    return this.name === other.name
  }
}

export class ProductAvailability {
  constructor(
    public readonly isAvailable: boolean,
    public readonly stock?: number
  ) {}

  equals(other: ProductAvailability): boolean {
    return this.isAvailable === other.isAvailable && this.stock === other.stock
  }
}
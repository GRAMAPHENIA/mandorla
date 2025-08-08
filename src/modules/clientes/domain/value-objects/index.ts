/**
 * Value Objects para el dominio de clientes
 */

export class CustomerId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El ID del cliente no puede estar vacío')
    }
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value
  }
}

export class CustomerEmail {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El email es requerido')
    }
    
    if (!CustomerEmail.EMAIL_REGEX.test(value)) {
      throw new Error('Formato de email inválido')
    }
  }

  equals(other: CustomerEmail): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase()
  }
}

export class CustomerPhone {
  private static readonly PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{9,15}$/

  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('El teléfono es requerido')
    }
    
    if (!CustomerPhone.PHONE_REGEX.test(value)) {
      throw new Error('Formato de teléfono inválido')
    }
  }

  equals(other: CustomerPhone): boolean {
    return this.value === other.value
  }
}
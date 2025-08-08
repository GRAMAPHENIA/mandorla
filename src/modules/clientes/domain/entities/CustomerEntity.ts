import { CustomerId, CustomerEmail, CustomerPhone } from '../value-objects'

/**
 * Entidad de dominio para clientes
 */
export class CustomerEntity {
  constructor(
    public readonly id: CustomerId,
    public name: string,
    public email: CustomerEmail,
    public phone: CustomerPhone,
    public address?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Actualiza la información del cliente
   * @param updates Datos a actualizar
   */
  updateInfo(updates: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }): void {
    if (updates.name !== undefined) {
      this.name = updates.name
    }
    
    if (updates.email !== undefined) {
      this.email = new CustomerEmail(updates.email)
    }
    
    if (updates.phone !== undefined) {
      this.phone = new CustomerPhone(updates.phone)
    }
    
    if (updates.address !== undefined) {
      this.address = updates.address
    }
    
    this.updatedAt = new Date()
  }

  /**
   * Obtiene información básica del cliente
   */
  getBasicInfo() {
    return {
      id: this.id.value,
      name: this.name,
      email: this.email.value,
      phone: this.phone.value
    }
  }

  /**
   * Verifica si el cliente tiene información completa
   */
  hasCompleteInfo(): boolean {
    return !!(this.name && this.email && this.phone && this.address)
  }
}
import { ICartStorageService } from '../../application'

/**
 * Implementación del servicio de almacenamiento usando localStorage
 */
export class LocalStorageService implements ICartStorageService {
  private readonly keyPrefix = 'mandorla_cart_'

  async getCartData(cartId: string): Promise<any | null> {
    try {
      if (typeof window === 'undefined') {
        return null // SSR safety
      }

      const key = this.getKey(cartId)
      const data = localStorage.getItem(key)
      
      if (!data) {
        return null
      }

      const parsed = JSON.parse(data)
      
      // Convertir fechas de string a Date
      if (parsed.createdAt) {
        parsed.createdAt = new Date(parsed.createdAt)
      }
      if (parsed.updatedAt) {
        parsed.updatedAt = new Date(parsed.updatedAt)
      }

      return parsed
    } catch (error) {
      console.error('Error al obtener datos del carrito desde localStorage:', error)
      return null
    }
  }

  async saveCartData(cartId: string, data: any): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return // SSR safety
      }

      const key = this.getKey(cartId)
      const serializedData = JSON.stringify(data)
      localStorage.setItem(key, serializedData)
    } catch (error) {
      console.error('Error al guardar datos del carrito en localStorage:', error)
      throw new Error('No se pudo guardar el carrito en el almacenamiento local')
    }
  }

  async removeCartData(cartId: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return // SSR safety
      }

      const key = this.getKey(cartId)
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error al eliminar datos del carrito de localStorage:', error)
      throw new Error('No se pudo eliminar el carrito del almacenamiento local')
    }
  }

  async hasCartData(cartId: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false // SSR safety
      }

      const key = this.getKey(cartId)
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error('Error al verificar existencia del carrito en localStorage:', error)
      return false
    }
  }

  async clearAllCarts(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return // SSR safety
      }

      // Obtener todas las claves que empiecen con nuestro prefijo
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          keysToRemove.push(key)
        }
      }

      // Eliminar todas las claves encontradas
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error al limpiar todos los carritos de localStorage:', error)
      throw new Error('No se pudieron limpiar todos los carritos')
    }
  }

  /**
   * Obtiene todas las claves de carritos almacenados
   */
  async getAllCartKeys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }

      const cartKeys: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          // Extraer el ID del carrito removiendo el prefijo
          const cartId = key.substring(this.keyPrefix.length)
          cartKeys.push(cartId)
        }
      }

      return cartKeys
    } catch (error) {
      console.error('Error al obtener claves de carritos:', error)
      return []
    }
  }

  /**
   * Obtiene el tamaño total usado por los carritos en localStorage
   */
  getStorageSize(): number {
    try {
      if (typeof window === 'undefined') {
        return 0
      }

      let totalSize = 0
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += key.length + value.length
          }
        }
      }

      return totalSize
    } catch (error) {
      console.error('Error al calcular tamaño del almacenamiento:', error)
      return 0
    }
  }

  private getKey(cartId: string): string {
    return `${this.keyPrefix}${cartId}`
  }
}
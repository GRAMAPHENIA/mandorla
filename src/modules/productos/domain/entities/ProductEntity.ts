import { ProductId, Money, ProductCategory, ProductAvailability } from '../value-objects'
import { InvalidPriceError } from '../errors/ProductErrors'

/**
 * Entidad de dominio para productos de panadería
 * Contiene la lógica de negocio y reglas de dominio específicas para productos horneados
 */
export class ProductEntity {
  constructor(
    public readonly id: ProductId,
    public name: string,
    public description: string,
    public price: Money,
    public category: ProductCategory,
    public availability: ProductAvailability,
    public ingredients: string[] = [],
    public allergens: string[] = [],
    public imageUrl?: string
  ) {
    this.validateProductData()
  }

  /**
   * Valida los datos del producto según reglas de negocio de panadería
   * @private
   */
  private validateProductData(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido')
    }
    
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('La descripción del producto es requerida')
    }

    // Normalizar alérgenos a minúsculas para consistencia
    this.allergens = this.allergens.map(allergen => allergen.toLowerCase())
    
    // Normalizar ingredientes
    this.ingredients = this.ingredients.map(ingredient => 
      ingredient.trim().toLowerCase()
    )
  }

  /**
   * Actualiza el precio del producto
   * @param newPrice Nuevo precio del producto
   * @throws InvalidPriceError Si el precio es inválido
   */
  updatePrice(newPrice: Money): void {
    if (newPrice.amount <= 0) {
      throw new InvalidPriceError(newPrice.amount)
    }
    this.price = newPrice
  }

  /**
   * Cambia la disponibilidad del producto
   * @param available Estado de disponibilidad
   */
  changeAvailability(available: boolean): void {
    this.availability = new ProductAvailability(available)
  }

  /**
   * Asigna el producto a una categoría
   * @param category Nueva categoría del producto
   */
  addToCategory(category: ProductCategory): void {
    const validCategories = ['galletas', 'pasteles', 'panes', 'temporada']
    if (!validCategories.includes(category.name.toLowerCase())) {
      throw new Error(`Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`)
    }
    this.category = category
  }

  /**
   * Actualiza los ingredientes del producto
   * @param ingredients Lista de ingredientes
   */
  updateIngredients(ingredients: string[]): void {
    if (!ingredients || ingredients.length === 0) {
      throw new Error('Un producto de panadería debe tener al menos un ingrediente')
    }
    this.ingredients = ingredients.map(ingredient => ingredient.trim().toLowerCase())
  }

  /**
   * Actualiza los alérgenos del producto
   * @param allergens Lista de alérgenos
   */
  updateAllergens(allergens: string[]): void {
    this.allergens = allergens.map(allergen => allergen.toLowerCase())
  }

  /**
   * Verifica si el producto está disponible
   */
  isAvailable(): boolean {
    return this.availability.isAvailable
  }

  /**
   * Verifica si el producto contiene alérgenos específicos
   * @param allergen Alérgeno a verificar
   */
  containsAllergen(allergen: string): boolean {
    return this.allergens.includes(allergen.toLowerCase())
  }

  /**
   * Verifica si el producto es apto para dietas específicas
   */
  isDietFriendly(restrictions: string[]): boolean {
    const productAllergens = this.allergens.map(a => a.toLowerCase())
    return !restrictions.some(restriction => 
      productAllergens.includes(restriction.toLowerCase())
    )
  }

  /**
   * Obtiene información básica del producto
   */
  getBasicInfo() {
    return {
      id: this.id.value,
      name: this.name,
      price: this.price.amount,
      currency: this.price.currency,
      category: this.category.name,
      available: this.availability.isAvailable,
      hasAllergens: this.allergens.length > 0
    }
  }

  /**
   * Obtiene información completa del producto para mostrar en detalle
   */
  getDetailedInfo() {
    return {
      ...this.getBasicInfo(),
      description: this.description,
      ingredients: [...this.ingredients],
      allergens: [...this.allergens],
      imageUrl: this.imageUrl
    }
  }
}
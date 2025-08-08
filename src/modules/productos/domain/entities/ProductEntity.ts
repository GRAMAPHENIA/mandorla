import { ProductId } from '../value-objects/ProductId'
import { Money } from '../value-objects/Money'
import { ProductCategory } from '../value-objects/ProductCategory'
import {
  InvalidProductNameError,
  InvalidProductDescriptionError,
  InvalidPriceError,
  ProductOutOfStockError,
  InvalidIngredientError,
  InvalidAllergenError
} from '../errors/ProductErrors'

/**
 * Entidad de dominio para productos
 * Contiene la lógica de negocio y validaciones del producto
 */
export class ProductEntity {
  private _id: ProductId
  private _name: string
  private _description: string
  private _price: Money
  private _originalPrice?: Money
  private _image: string
  private _category: ProductCategory
  private _featured: boolean
  private _inStock: boolean
  private _ingredients: string[]
  private _allergens: string[]

  constructor(params: {
    id: ProductId
    name: string
    description: string
    price: Money
    originalPrice?: Money
    image: string
    category: ProductCategory
    featured: boolean
    inStock: boolean
    ingredients?: string[]
    allergens?: string[]
  }) {
    this.validateName(params.name)
    this.validateDescription(params.description)
    this.validateIngredients(params.ingredients || [])
    this.validateAllergens(params.allergens || [])

    this._id = params.id
    this._name = params.name.trim()
    this._description = params.description.trim()
    this._price = params.price
    this._originalPrice = params.originalPrice
    this._image = params.image
    this._category = params.category
    this._featured = params.featured
    this._inStock = params.inStock
    this._ingredients = params.ingredients || []
    this._allergens = params.allergens || []
  }

  // Getters
  get id(): ProductId {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get description(): string {
    return this._description
  }

  get price(): Money {
    return this._price
  }

  get originalPrice(): Money | undefined {
    return this._originalPrice
  }

  get image(): string {
    return this._image
  }

  get category(): ProductCategory {
    return this._category
  }

  get featured(): boolean {
    return this._featured
  }

  get inStock(): boolean {
    return this._inStock
  }

  get ingredients(): string[] {
    return [...this._ingredients]
  }

  get allergens(): string[] {
    return [...this._allergens]
  }

  // Métodos de dominio
  updatePrice(newPrice: Money): void {
    if (newPrice.amount <= 0) {
      throw new InvalidPriceError(newPrice.amount)
    }
    this._price = newPrice
  }

  setOriginalPrice(originalPrice: Money): void {
    if (originalPrice.amount <= 0) {
      throw new InvalidPriceError(originalPrice.amount)
    }
    if (originalPrice.amount <= this._price.amount) {
      throw new Error('El precio original debe ser mayor al precio actual')
    }
    this._originalPrice = originalPrice
  }

  removeOriginalPrice(): void {
    this._originalPrice = undefined
  }

  changeAvailability(available: boolean): void {
    this._inStock = available
  }

  setFeatured(featured: boolean): void {
    this._featured = featured
  }

  changeCategory(newCategory: ProductCategory): void {
    this._category = newCategory
  }

  updateName(newName: string): void {
    this.validateName(newName)
    this._name = newName.trim()
  }

  updateDescription(newDescription: string): void {
    this.validateDescription(newDescription)
    this._description = newDescription.trim()
  }

  updateImage(newImage: string): void {
    if (!newImage || newImage.trim().length === 0) {
      throw new Error('La imagen del producto no puede estar vacía')
    }
    this._image = newImage.trim()
  }

  addIngredient(ingredient: string): void {
    this.validateIngredient(ingredient)
    const trimmedIngredient = ingredient.trim()
    if (!this._ingredients.includes(trimmedIngredient)) {
      this._ingredients.push(trimmedIngredient)
    }
  }

  removeIngredient(ingredient: string): void {
    const index = this._ingredients.indexOf(ingredient.trim())
    if (index > -1) {
      this._ingredients.splice(index, 1)
    }
  }

  addAllergen(allergen: string): void {
    this.validateAllergen(allergen)
    const trimmedAllergen = allergen.trim()
    if (!this._allergens.includes(trimmedAllergen)) {
      this._allergens.push(trimmedAllergen)
    }
  }

  removeAllergen(allergen: string): void {
    const index = this._allergens.indexOf(allergen.trim())
    if (index > -1) {
      this._allergens.splice(index, 1)
    }
  }

  // Métodos de consulta
  hasDiscount(): boolean {
    return this._originalPrice !== undefined
  }

  getDiscountPercentage(): number {
    if (!this._originalPrice) {
      return 0
    }
    return Math.round(((this._originalPrice.amount - this._price.amount) / this._originalPrice.amount) * 100)
  }

  isAvailable(): boolean {
    return this._inStock
  }

  containsAllergen(allergen: string): boolean {
    return this._allergens.some(a => a.toLowerCase() === allergen.toLowerCase())
  }

  containsIngredient(ingredient: string): boolean {
    return this._ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase()))
  }

  // Método para verificar disponibilidad antes de agregar al carrito
  checkAvailabilityForPurchase(): void {
    if (!this._inStock) {
      throw new ProductOutOfStockError(this._id.value, this._name)
    }
  }

  // Validaciones privadas
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidProductNameError(name)
    }
    if (name.trim().length > 200) {
      throw new InvalidProductNameError('El nombre del producto no puede exceder 200 caracteres')
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new InvalidProductDescriptionError()
    }
    if (description.trim().length > 1000) {
      throw new Error('La descripción del producto no puede exceder 1000 caracteres')
    }
  }

  private validateIngredients(ingredients: string[]): void {
    ingredients.forEach(ingredient => this.validateIngredient(ingredient))
  }

  private validateIngredient(ingredient: string): void {
    if (!ingredient || ingredient.trim().length === 0) {
      throw new InvalidIngredientError(ingredient)
    }
  }

  private validateAllergens(allergens: string[]): void {
    allergens.forEach(allergen => this.validateAllergen(allergen))
  }

  private validateAllergen(allergen: string): void {
    if (!allergen || allergen.trim().length === 0) {
      throw new InvalidAllergenError(allergen)
    }
  }

  // Método para serialización
  toJSON(): {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    image: string
    category: string
    featured: boolean
    inStock: boolean
    ingredients: string[]
    allergens: string[]
  } {
    return {
      id: this._id.value,
      name: this._name,
      description: this._description,
      price: this._price.amount,
      originalPrice: this._originalPrice?.amount,
      image: this._image,
      category: this._category.value,
      featured: this._featured,
      inStock: this._inStock,
      ingredients: [...this._ingredients],
      allergens: [...this._allergens]
    }
  }

  // Método estático para crear desde datos planos
  static fromPlainObject(data: {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    image: string
    category: string
    featured: boolean
    inStock: boolean
    ingredients?: string[]
    allergens?: string[]
  }): ProductEntity {
    return new ProductEntity({
      id: new ProductId(data.id),
      name: data.name,
      description: data.description,
      price: new Money(data.price),
      originalPrice: data.originalPrice ? new Money(data.originalPrice) : undefined,
      image: data.image,
      category: ProductCategory.fromString(data.category),
      featured: data.featured,
      inStock: data.inStock,
      ingredients: data.ingredients,
      allergens: data.allergens
    })
  }
}
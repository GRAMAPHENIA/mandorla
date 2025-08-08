/**
 * Value Object para categoría de producto
 * Define las categorías válidas y garantiza consistencia
 */
export type ProductCategoryType = 'cookies' | 'pastries' | 'breads' | 'seasonal'

export class ProductCategory {
  private static readonly VALID_CATEGORIES: ProductCategoryType[] = [
    'cookies',
    'pastries', 
    'breads',
    'seasonal'
  ]

  private static readonly CATEGORY_NAMES: Record<ProductCategoryType, string> = {
    cookies: 'Galletas',
    pastries: 'Pasteles',
    breads: 'Panes',
    seasonal: 'Temporada'
  }

  private readonly _value: ProductCategoryType

  constructor(value: ProductCategoryType) {
    if (!ProductCategory.VALID_CATEGORIES.includes(value)) {
      throw new Error(`Categoría inválida: ${value}. Las categorías válidas son: ${ProductCategory.VALID_CATEGORIES.join(', ')}`)
    }
    this._value = value
  }

  get value(): ProductCategoryType {
    return this._value
  }

  get displayName(): string {
    return ProductCategory.CATEGORY_NAMES[this._value]
  }

  equals(other: ProductCategory): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }

  static getAllCategories(): ProductCategoryType[] {
    return [...ProductCategory.VALID_CATEGORIES]
  }

  static fromString(value: string): ProductCategory {
    const categoryValue = value as ProductCategoryType
    return new ProductCategory(categoryValue)
  }
}
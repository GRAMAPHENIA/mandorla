import { ProductEntity, ProductId, Money, ProductCategory, ProductAvailability } from '../../domain'

/**
 * DTO para datos de producto desde fuentes externas
 */
export interface ProductDTO {
  id: string
  name: string
  description: string
  price: number
  currency?: string
  category: string
  available: boolean
  stock?: number
  ingredients?: string[]
  allergens?: string[]
  imageUrl?: string
}

/**
 * Adaptador para convertir entre DTOs y entidades de dominio
 */
export class ProductDataAdapter {
  /**
   * Convierte un DTO a entidad de dominio
   * @param dto DTO del producto
   */
  static toDomain(dto: ProductDTO): ProductEntity {
    return new ProductEntity(
      new ProductId(dto.id),
      dto.name,
      dto.description,
      new Money(dto.price, dto.currency || 'EUR'),
      new ProductCategory(dto.category),
      new ProductAvailability(dto.available, dto.stock),
      dto.ingredients || [],
      dto.allergens || [],
      dto.imageUrl
    )
  }

  /**
   * Convierte una entidad de dominio a DTO
   * @param entity Entidad del producto
   */
  static toDTO(entity: ProductEntity): ProductDTO {
    return {
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      price: entity.price.amount,
      currency: entity.price.currency,
      category: entity.category.name,
      available: entity.availability.isAvailable,
      stock: entity.availability.stock,
      ingredients: entity.ingredients,
      allergens: entity.allergens,
      imageUrl: entity.imageUrl
    }
  }

  /**
   * Convierte múltiples DTOs a entidades
   * @param dtos Array de DTOs
   */
  static toDomainList(dtos: ProductDTO[]): ProductEntity[] {
    return dtos.map(dto => this.toDomain(dto))
  }

  /**
   * Convierte múltiples entidades a DTOs
   * @param entities Array de entidades
   */
  static toDTOList(entities: ProductEntity[]): ProductDTO[] {
    return entities.map(entity => this.toDTO(entity))
  }
}
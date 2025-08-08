import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { Money } from '../../domain/value-objects/Money'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'
import { Product } from '../../../../types/product'

/**
 * Mapper para convertir entre entidades de dominio y DTOs de infraestructura
 * Implementa el patrón Mapper para separar las capas
 */
export class ProductMapper {
  /**
   * Convierte una entidad de dominio a DTO de infraestructura
   * @param entity - Entidad de dominio
   * @returns DTO para persistencia/API
   */
  static toDTO(entity: ProductEntity): Product {
    return {
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      price: entity.price.amount,
      originalPrice: entity.originalPrice?.amount,
      image: entity.image,
      category: entity.category.value,
      featured: entity.featured,
      inStock: entity.inStock,
      ingredients: [...entity.ingredients],
      allergens: [...entity.allergens]
    }
  }

  /**
   * Convierte un DTO de infraestructura a entidad de dominio
   * @param dto - DTO de infraestructura
   * @returns Entidad de dominio
   */
  static toDomain(dto: Product): ProductEntity {
    return new ProductEntity({
      id: new ProductId(dto.id),
      name: dto.name,
      description: dto.description,
      price: new Money(dto.price),
      originalPrice: dto.originalPrice ? new Money(dto.originalPrice) : undefined,
      image: dto.image,
      category: new ProductCategory(dto.category),
      featured: dto.featured,
      inStock: dto.inStock,
      ingredients: dto.ingredients || [],
      allergens: dto.allergens || []
    })
  }

  /**
   * Convierte múltiples DTOs a entidades de dominio
   * @param dtos - Array de DTOs
   * @returns Array de entidades de dominio
   */
  static toDomainList(dtos: Product[]): ProductEntity[] {
    return dtos.map(dto => ProductMapper.toDomain(dto))
  }

  /**
   * Convierte múltiples entidades de dominio a DTOs
   * @param entities - Array de entidades de dominio
   * @returns Array de DTOs
   */
  static toDTOList(entities: ProductEntity[]): Product[] {
    return entities.map(entity => ProductMapper.toDTO(entity))
  }

  /**
   * Actualiza un DTO existente con datos de una entidad de dominio
   * @param existingDTO - DTO existente
   * @param entity - Entidad de dominio con datos actualizados
   * @returns DTO actualizado
   */
  static updateDTO(existingDTO: Product, entity: ProductEntity): Product {
    return {
      ...existingDTO,
      name: entity.name,
      description: entity.description,
      price: entity.price.amount,
      originalPrice: entity.originalPrice?.amount,
      image: entity.image,
      category: entity.category.value,
      featured: entity.featured,
      inStock: entity.inStock,
      ingredients: [...entity.ingredients],
      allergens: [...entity.allergens]
    }
  }

  /**
   * Valida que un DTO tenga la estructura correcta
   * @param dto - DTO a validar
   * @returns true si es válido
   * @throws Error si la estructura es inválida
   */
  static validateDTO(dto: any): dto is Product {
    if (!dto || typeof dto !== 'object') {
      throw new Error('DTO debe ser un objeto')
    }

    const requiredFields = ['id', 'name', 'description', 'price', 'image', 'category', 'featured', 'inStock']
    
    for (const field of requiredFields) {
      if (!(field in dto)) {
        throw new Error(`Campo requerido faltante: ${field}`)
      }
    }

    if (typeof dto.id !== 'string' || dto.id.trim().length === 0) {
      throw new Error('ID debe ser una cadena no vacía')
    }

    if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      throw new Error('Nombre debe ser una cadena no vacía')
    }

    if (typeof dto.description !== 'string' || dto.description.trim().length === 0) {
      throw new Error('Descripción debe ser una cadena no vacía')
    }

    if (typeof dto.price !== 'number' || dto.price < 0) {
      throw new Error('Precio debe ser un número no negativo')
    }

    if (dto.originalPrice !== undefined && (typeof dto.originalPrice !== 'number' || dto.originalPrice < 0)) {
      throw new Error('Precio original debe ser un número no negativo')
    }

    if (typeof dto.image !== 'string' || dto.image.trim().length === 0) {
      throw new Error('Imagen debe ser una cadena no vacía')
    }

    const validCategories = ['cookies', 'pastries', 'breads', 'seasonal']
    if (!validCategories.includes(dto.category)) {
      throw new Error(`Categoría debe ser una de: ${validCategories.join(', ')}`)
    }

    if (typeof dto.featured !== 'boolean') {
      throw new Error('Featured debe ser un booleano')
    }

    if (typeof dto.inStock !== 'boolean') {
      throw new Error('InStock debe ser un booleano')
    }

    if (dto.ingredients && !Array.isArray(dto.ingredients)) {
      throw new Error('Ingredientes debe ser un array')
    }

    if (dto.allergens && !Array.isArray(dto.allergens)) {
      throw new Error('Alérgenos debe ser un array')
    }

    return true
  }
}
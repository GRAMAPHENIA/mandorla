import { ProductMapper } from '../mappers/ProductMapper'
import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductId } from '../../domain/value-objects/ProductId'
import { Money } from '../../domain/value-objects/Money'
import { ProductCategory } from '../../domain/value-objects/ProductCategory'
import { Product } from '../../../../types/product'

describe('ProductMapper', () => {
  const createTestEntity = () => {
    return new ProductEntity({
      id: new ProductId('1'),
      name: 'Test Product',
      description: 'Test description',
      price: new Money(12.99),
      originalPrice: new Money(19.99),
      image: '/test.jpg',
      category: new ProductCategory('cookies'),
      featured: true,
      inStock: true,
      ingredients: ['Ingredient1', 'Ingredient2'],
      allergens: ['Allergen1', 'Allergen2']
    })
  }

  const createTestDTO = (): Product => {
    return {
      id: '1',
      name: 'Test Product',
      description: 'Test description',
      price: 12.99,
      originalPrice: 19.99,
      image: '/test.jpg',
      category: 'cookies',
      featured: true,
      inStock: true,
      ingredients: ['Ingredient1', 'Ingredient2'],
      allergens: ['Allergen1', 'Allergen2']
    }
  }

  describe('toDTO', () => {
    it('should convert entity to DTO correctly', () => {
      const entity = createTestEntity()
      const dto = ProductMapper.toDTO(entity)

      expect(dto.id).toBe('1')
      expect(dto.name).toBe('Test Product')
      expect(dto.description).toBe('Test description')
      expect(dto.price).toBe(12.99)
      expect(dto.originalPrice).toBe(19.99)
      expect(dto.image).toBe('/test.jpg')
      expect(dto.category).toBe('cookies')
      expect(dto.featured).toBe(true)
      expect(dto.inStock).toBe(true)
      expect(dto.ingredients).toEqual(['Ingredient1', 'Ingredient2'])
      expect(dto.allergens).toEqual(['Allergen1', 'Allergen2'])
    })

    it('should handle entity without original price', () => {
      const entity = new ProductEntity({
        id: new ProductId('1'),
        name: 'Test Product',
        description: 'Test description',
        price: new Money(12.99),
        image: '/test.jpg',
        category: new ProductCategory('cookies'),
        featured: false,
        inStock: true
      })

      const dto = ProductMapper.toDTO(entity)

      expect(dto.originalPrice).toBeUndefined()
    })
  })

  describe('toDomain', () => {
    it('should convert DTO to entity correctly', () => {
      const dto = createTestDTO()
      const entity = ProductMapper.toDomain(dto)

      expect(entity.id.value).toBe('1')
      expect(entity.name).toBe('Test Product')
      expect(entity.description).toBe('Test description')
      expect(entity.price.amount).toBe(12.99)
      expect(entity.originalPrice?.amount).toBe(19.99)
      expect(entity.image).toBe('/test.jpg')
      expect(entity.category.value).toBe('cookies')
      expect(entity.featured).toBe(true)
      expect(entity.inStock).toBe(true)
      expect(entity.ingredients).toEqual(['Ingredient1', 'Ingredient2'])
      expect(entity.allergens).toEqual(['Allergen1', 'Allergen2'])
    })

    it('should handle DTO without optional fields', () => {
      const dto: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 12.99,
        image: '/test.jpg',
        category: 'cookies',
        featured: false,
        inStock: true
      }

      const entity = ProductMapper.toDomain(dto)

      expect(entity.originalPrice).toBeUndefined()
      expect(entity.ingredients).toEqual([])
      expect(entity.allergens).toEqual([])
    })
  })

  describe('toDomainList', () => {
    it('should convert array of DTOs to entities', () => {
      const dtos = [
        createTestDTO(),
        { ...createTestDTO(), id: '2', name: 'Product 2' }
      ]

      const entities = ProductMapper.toDomainList(dtos)

      expect(entities).toHaveLength(2)
      expect(entities[0].id.value).toBe('1')
      expect(entities[1].id.value).toBe('2')
      expect(entities[1].name).toBe('Product 2')
    })

    it('should handle empty array', () => {
      const entities = ProductMapper.toDomainList([])
      expect(entities).toEqual([])
    })
  })

  describe('toDTOList', () => {
    it('should convert array of entities to DTOs', () => {
      const entities = [
        createTestEntity(),
        new ProductEntity({
          id: new ProductId('2'),
          name: 'Product 2',
          description: 'Description 2',
          price: new Money(15.99),
          image: '/test2.jpg',
          category: new ProductCategory('pastries'),
          featured: false,
          inStock: true
        })
      ]

      const dtos = ProductMapper.toDTOList(entities)

      expect(dtos).toHaveLength(2)
      expect(dtos[0].id).toBe('1')
      expect(dtos[1].id).toBe('2')
      expect(dtos[1].name).toBe('Product 2')
    })
  })

  describe('updateDTO', () => {
    it('should update existing DTO with entity data', () => {
      const existingDTO = createTestDTO()
      const updatedEntity = new ProductEntity({
        id: new ProductId('1'),
        name: 'Updated Product',
        description: 'Updated description',
        price: new Money(15.99),
        image: '/updated.jpg',
        category: new ProductCategory('pastries'),
        featured: false,
        inStock: false
      })

      const updatedDTO = ProductMapper.updateDTO(existingDTO, updatedEntity)

      expect(updatedDTO.id).toBe('1') // ID should remain the same
      expect(updatedDTO.name).toBe('Updated Product')
      expect(updatedDTO.description).toBe('Updated description')
      expect(updatedDTO.price).toBe(15.99)
      expect(updatedDTO.category).toBe('pastries')
      expect(updatedDTO.featured).toBe(false)
      expect(updatedDTO.inStock).toBe(false)
    })
  })

  describe('validateDTO', () => {
    it('should validate correct DTO', () => {
      const dto = createTestDTO()
      expect(() => ProductMapper.validateDTO(dto)).not.toThrow()
      expect(ProductMapper.validateDTO(dto)).toBe(true)
    })

    it('should throw error for null/undefined DTO', () => {
      expect(() => ProductMapper.validateDTO(null)).toThrow('DTO debe ser un objeto')
      expect(() => ProductMapper.validateDTO(undefined)).toThrow('DTO debe ser un objeto')
    })

    it('should throw error for missing required fields', () => {
      const incompleteDTO = { id: '1', name: 'Test' }
      expect(() => ProductMapper.validateDTO(incompleteDTO)).toThrow('Campo requerido faltante')
    })

    it('should throw error for invalid ID', () => {
      const dto = { ...createTestDTO(), id: '' }
      expect(() => ProductMapper.validateDTO(dto)).toThrow('ID debe ser una cadena no vacía')
    })

    it('should throw error for invalid price', () => {
      const dto = { ...createTestDTO(), price: -5 }
      expect(() => ProductMapper.validateDTO(dto)).toThrow('Precio debe ser un número no negativo')
    })

    it('should throw error for invalid category', () => {
      const dto = { ...createTestDTO(), category: 'invalid' }
      expect(() => ProductMapper.validateDTO(dto)).toThrow('Categoría debe ser una de')
    })

    it('should throw error for invalid boolean fields', () => {
      const dto = { ...createTestDTO(), featured: 'true' }
      expect(() => ProductMapper.validateDTO(dto)).toThrow('Featured debe ser un booleano')
    })

    it('should throw error for invalid arrays', () => {
      const dto = { ...createTestDTO(), ingredients: 'not an array' }
      expect(() => ProductMapper.validateDTO(dto)).toThrow('Ingredientes debe ser un array')
    })
  })
})
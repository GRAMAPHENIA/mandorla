import { ProductEntity } from '../../../domain/entities/product-entity';
import { ProductId } from '../../../domain/value-objects/product-id';
import { Money } from '../../../domain/value-objects/money';
import { ProductCategory } from '../../../domain/types';
import {
  InvalidProductPriceError,
  ProductOutOfStockError,
  InvalidQuantityError,
} from '../../../domain/errors/product-errors';

describe('ProductEntity', () => {
  describe('Creación de producto', () => {
    it('debería crear un producto válido con datos correctos', () => {
      // Arrange
      const productData = {
        name: 'Pan Integral',
        price: Money.create(2500),
        category: ProductCategory.BREAD,
        description: 'Pan integral artesanal',
        stock: 10,
      };

      // Act
      const product = ProductEntity.create(productData);

      // Assert
      expect(product.name).toBe('Pan Integral');
      expect(product.price.value).toBe(2500);
      expect(product.category).toBe(ProductCategory.BREAD);
      expect(product.description).toBe('Pan integral artesanal');
      expect(product.stock).toBe(10);
      expect(product.available).toBe(true);
      expect(product.id).toBeInstanceOf(ProductId);
    });

    it('debería crear producto con valores por defecto', () => {
      // Arrange
      const productData = {
        name: 'Galletas',
        price: Money.create(1500),
        category: ProductCategory.COOKIES,
      };

      // Act
      const product = ProductEntity.create(productData);

      // Assert
      expect(product.description).toBe('');
      expect(product.stock).toBe(0);
      expect(product.available).toBe(false); // Sin stock = no disponible
    });

    it('debería lanzar error con precio inválido', () => {
      // Arrange
      const productData = {
        name: 'Pan',
        price: Money.create(-100),
        category: ProductCategory.BREAD,
      };

      // Act & Assert
      expect(() => ProductEntity.create(productData)).toThrow(InvalidProductPriceError);
    });
  });

  describe('Actualización de precio', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Croissant',
        price: Money.create(1200),
        category: ProductCategory.PASTRIES,
        stock: 5,
      });
    });

    it('debería actualizar precio correctamente', () => {
      // Arrange
      const newPrice = Money.create(1500);

      // Act
      product.updatePrice(newPrice);

      // Assert
      expect(product.price.value).toBe(1500);
    });

    it('debería lanzar error con precio negativo', () => {
      // Arrange
      const invalidPrice = Money.create(-500);

      // Act & Assert
      expect(() => product.updatePrice(invalidPrice)).toThrow(InvalidProductPriceError);
    });

    it('debería lanzar error con precio cero', () => {
      // Arrange
      const zeroPrice = Money.create(0);

      // Act & Assert
      expect(() => product.updatePrice(zeroPrice)).toThrow(InvalidProductPriceError);
    });
  });

  describe('Gestión de stock', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Muffin',
        price: Money.create(800),
        category: ProductCategory.PASTRIES,
        stock: 10,
      });
    });

    it('debería reducir stock correctamente', () => {
      // Act
      product.reduceStock(3);

      // Assert
      expect(product.stock).toBe(7);
      expect(product.available).toBe(true);
    });

    it('debería marcar como no disponible cuando stock llega a cero', () => {
      // Act
      product.reduceStock(10);

      // Assert
      expect(product.stock).toBe(0);
      expect(product.available).toBe(false);
    });

    it('debería lanzar error al reducir más stock del disponible', () => {
      // Act & Assert
      expect(() => product.reduceStock(15)).toThrow(ProductOutOfStockError);
    });

    it('debería lanzar error con cantidad inválida', () => {
      // Act & Assert
      expect(() => product.reduceStock(-5)).toThrow(InvalidQuantityError);

      expect(() => product.reduceStock(0)).toThrow(InvalidQuantityError);
    });

    it('debería aumentar stock correctamente', () => {
      // Arrange
      product.reduceStock(10); // Stock = 0, available = false

      // Act
      product.increaseStock(5);

      // Assert
      expect(product.stock).toBe(5);
      expect(product.available).toBe(true);
    });
  });

  describe('Verificación de disponibilidad', () => {
    it('debería verificar si hay stock suficiente', () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Tarta',
        price: Money.create(3000),
        category: ProductCategory.PASTRIES,
        stock: 5,
      });

      // Act & Assert
      expect(product.hasStock(3)).toBe(true);
      expect(product.hasStock(5)).toBe(true);
      expect(product.hasStock(6)).toBe(false);
      expect(product.hasStock(0)).toBe(false);
    });

    it('debería retornar stock disponible', () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Empanada',
        price: Money.create(500),
        category: ProductCategory.PASTRIES,
        stock: 8,
      });

      // Act & Assert
      expect(product.getAvailableStock()).toBe(8);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Brownie',
        price: Money.create(1800),
        category: ProductCategory.PASTRIES,
        description: 'Brownie de chocolate',
        stock: 12,
      });

      // Act
      const persistenceData = product.toPersistence();

      // Assert
      expect(persistenceData).toEqual({
        id: product.id.value,
        name: 'Brownie',
        price: 1800,
        category: ProductCategory.PASTRIES,
        description: 'Brownie de chocolate',
        stock: 12,
        available: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'test-id-123',
        name: 'Donut',
        price: 900,
        category: ProductCategory.PASTRIES,
        description: 'Donut glaseado',
        stock: 6,
        available: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const product = ProductEntity.fromPersistence(persistenceData);

      // Assert
      expect(product.id.value).toBe('test-id-123');
      expect(product.name).toBe('Donut');
      expect(product.price.value).toBe(900);
      expect(product.category).toBe(ProductCategory.PASTRIES);
      expect(product.description).toBe('Donut glaseado');
      expect(product.stock).toBe(6);
      expect(product.available).toBe(true);
    });
  });
});

import { ProductEntity } from '../product-entity';
import { ProductId } from '../../value-objects/product-id';
import { Money } from '../../value-objects/money';
import { ProductCategory } from '../../types';
import {
  InvalidProductPriceError,
  ProductOutOfStockError,
  InvalidQuantityError,
} from '../../errors/product-errors';

describe('ProductEntity', () => {
  describe('Creación de producto', () => {
    it('debería crear un producto válido correctamente', () => {
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
        name: 'Galletas Chocolate',
        price: Money.create(1500),
        category: ProductCategory.COOKIES,
      };

      // Act
      const product = ProductEntity.create(productData);

      // Assert
      expect(product.description).toBe('');
      expect(product.stock).toBe(0);
      expect(product.available).toBe(true);
    });
  });

  describe('Actualización de precio', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Croissant',
        price: Money.create(1200),
        category: ProductCategory.PASTRIES,
      });
    });

    it('debería actualizar el precio correctamente', () => {
      // Arrange
      const newPrice = Money.create(1500);

      // Act
      product.updatePrice(newPrice);

      // Assert
      expect(product.price.value).toBe(1500);
    });

    it('debería lanzar error con precio inválido', () => {
      // Arrange
      const invalidPrice = Money.create(-100);

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
        name: 'Torta Chocolate',
        price: Money.create(15000),
        category: ProductCategory.CAKES,
        stock: 5,
      });
    });

    it('debería reducir stock correctamente', () => {
      // Act
      product.reduceStock(2);

      // Assert
      expect(product.stock).toBe(3);
    });

    it('debería lanzar error si no hay stock suficiente', () => {
      // Act & Assert
      expect(() => product.reduceStock(10)).toThrow(ProductOutOfStockError);
    });

    it('debería lanzar error con cantidad inválida', () => {
      // Act & Assert
      expect(() => product.reduceStock(-1)).toThrow(InvalidQuantityError);

      expect(() => product.reduceStock(0)).toThrow(InvalidQuantityError);
    });

    it('debería aumentar stock correctamente', () => {
      // Act
      product.increaseStock(3);

      // Assert
      expect(product.stock).toBe(8);
    });

    it('debería verificar disponibilidad de stock', () => {
      // Assert
      expect(product.hasStock(3)).toBe(true);
      expect(product.hasStock(5)).toBe(true);
      expect(product.hasStock(6)).toBe(false);
    });
  });

  describe('Disponibilidad del producto', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Empanadas',
        price: Money.create(800),
        category: ProductCategory.SEASONAL,
      });
    });

    it('debería marcar producto como no disponible', () => {
      // Act
      product.markAsUnavailable();

      // Assert
      expect(product.available).toBe(false);
    });

    it('debería marcar producto como disponible', () => {
      // Arrange
      product.markAsUnavailable();

      // Act
      product.markAsAvailable();

      // Assert
      expect(product.available).toBe(true);
    });

    it('debería verificar si está disponible para venta', () => {
      // Arrange
      const productWithStock = ProductEntity.create({
        name: 'Test',
        price: Money.create(1000),
        category: ProductCategory.BREAD,
        stock: 5,
      });

      const productWithoutStock = ProductEntity.create({
        name: 'Test',
        price: Money.create(1000),
        category: ProductCategory.BREAD,
        stock: 0,
      });

      // Assert
      expect(productWithStock.isAvailableForSale()).toBe(true);
      expect(productWithoutStock.isAvailableForSale()).toBe(false);

      productWithStock.markAsUnavailable();
      expect(productWithStock.isAvailableForSale()).toBe(false);
    });
  });

  describe('Serialización', () => {
    it('debería convertir a objeto de persistencia', () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Medialunas',
        price: Money.create(600),
        category: ProductCategory.PASTRIES,
        description: 'Medialunas de manteca',
        stock: 20,
      });

      // Act
      const persistence = product.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: product.id.value,
        name: 'Medialunas',
        price: 600,
        category: ProductCategory.PASTRIES,
        description: 'Medialunas de manteca',
        stock: 20,
        available: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería crear desde objeto de persistencia', () => {
      // Arrange
      const persistenceData = {
        id: 'test-id',
        name: 'Facturas',
        price: 500,
        category: ProductCategory.PASTRIES,
        description: 'Facturas surtidas',
        stock: 15,
        available: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const product = ProductEntity.fromPersistence(persistenceData);

      // Assert
      expect(product.id.value).toBe('test-id');
      expect(product.name).toBe('Facturas');
      expect(product.price.value).toBe(500);
      expect(product.category).toBe(ProductCategory.PASTRIES);
      expect(product.description).toBe('Facturas surtidas');
      expect(product.stock).toBe(15);
      expect(product.available).toBe(true);
    });
  });
});

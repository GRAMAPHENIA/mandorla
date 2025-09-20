import { ProductService } from '../../../application/services/product.service';
import { ProductEntity } from '../../../domain/entities/product-entity';
import { ProductId } from '../../../domain/value-objects/product-id';
import { Money } from '../../../domain/value-objects/money';
import { ProductCategory } from '../../../domain/types';
import { IProductRepository } from '../../../domain/repositories/product-repository.interface';
import {
  ProductNotFoundError,
  InvalidProductDataError,
  DuplicateProductError,
} from '../../../domain/errors/product-errors';
import { CreateProductDto, UpdateProductDto } from '../../../application/dtos/product.dto';

// Mock del repositorio
const mockProductRepository: jest.Mocked<IProductRepository> = {
  findById: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
};

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService(mockProductRepository);
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const validProductData: CreateProductDto = {
      name: 'Pan Integral',
      price: 2500,
      category: 'panes' as any,
      description: 'Pan integral artesanal',
      stock: 10,
    };

    it('debería crear un producto exitosamente', async () => {
      // Arrange
      mockProductRepository.exists.mockResolvedValue(false);
      mockProductRepository.save.mockResolvedValue();

      // Act
      const result = await productService.createProduct(validProductData);

      // Assert
      expect(result).toBeInstanceOf(ProductEntity);
      expect(result.name).toBe('Pan Integral');
      expect(result.price.value).toBe(2500);
      expect(mockProductRepository.exists).toHaveBeenCalledWith('Pan Integral');
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.any(ProductEntity));
    });

    it('debería lanzar error si el producto ya existe', async () => {
      // Arrange
      mockProductRepository.exists.mockResolvedValue(true);

      // Act & Assert
      await expect(productService.createProduct(validProductData)).rejects.toThrow(
        DuplicateProductError
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar error con datos inválidos - nombre vacío', async () => {
      // Arrange
      const invalidData = { ...validProductData, name: '' };

      // Act & Assert
      await expect(productService.createProduct(invalidData)).rejects.toThrow(
        InvalidProductDataError
      );
    });

    it('debería lanzar error con precio inválido', async () => {
      // Arrange
      const invalidData = { ...validProductData, price: -100 };

      // Act & Assert
      await expect(productService.createProduct(invalidData)).rejects.toThrow(
        InvalidProductDataError
      );
    });

    it('debería lanzar error con stock negativo', async () => {
      // Arrange
      const invalidData = { ...validProductData, stock: -5 };

      // Act & Assert
      await expect(productService.createProduct(invalidData)).rejects.toThrow(
        InvalidProductDataError
      );
    });
  });

  describe('getProduct', () => {
    it('debería obtener un producto por ID', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductEntity.create({
        name: 'Croissant',
        price: Money.create(1200),
        category: ProductCategory.PASTRIES,
        stock: 5,
      });

      mockProductRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await productService.getProduct(productId);

      // Assert
      expect(result).toBe(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: productId })
      );
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.getProduct(productId)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('updateProduct', () => {
    const existingProduct = ProductEntity.create({
      name: 'Muffin Original',
      price: Money.create(800),
      category: ProductCategory.PASTRIES,
      stock: 10,
    });

    const updateData: UpdateProductDto = {
      name: 'Muffin de Chocolate',
      price: 900,
      description: 'Delicioso muffin con chips de chocolate',
    };

    it('debería actualizar un producto exitosamente', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue();

      // Act
      const result = await productService.updateProduct('test-id', updateData);

      // Assert
      expect(result.name).toBe('Muffin de Chocolate');
      expect(result.price.value).toBe(900);
      expect(result.description).toBe('Delicioso muffin con chips de chocolate');
      expect(mockProductRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateProduct('non-existent', updateData)).rejects.toThrow(
        ProductNotFoundError
      );
    });

    it('debería validar datos de actualización', async () => {
      // Arrange
      const invalidUpdate = { ...updateData, price: -500 };
      mockProductRepository.findById.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(productService.updateProduct('test-id', invalidUpdate)).rejects.toThrow(
        InvalidProductDataError
      );
    });
  });

  describe('getAllProducts', () => {
    it('debería obtener todos los productos', async () => {
      // Arrange
      const mockProducts = [
        ProductEntity.create({
          name: 'Pan',
          price: Money.create(2000),
          category: ProductCategory.BREAD,
          stock: 5,
        }),
        ProductEntity.create({
          name: 'Galleta',
          price: Money.create(500),
          category: ProductCategory.COOKIES,
          stock: 20,
        }),
      ];

      mockProductRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toBe(mockProducts);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });

    it('debería retornar array vacío si no hay productos', async () => {
      // Arrange
      mockProductRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('debería obtener productos por categoría', async () => {
      // Arrange
      const category = ProductCategory.COOKIES;
      const mockProducts = [
        ProductEntity.create({
          name: 'Galleta Chocolate',
          price: Money.create(600),
          category: ProductCategory.COOKIES,
          stock: 15,
        }),
      ];

      mockProductRepository.findByCategory.mockResolvedValue(mockProducts);

      // Act
      const result = await productService.getProductsByCategory(category);

      // Assert
      expect(result).toBe(mockProducts);
      expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(category);
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto exitosamente', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductEntity.create({
        name: 'Producto a eliminar',
        price: Money.create(1000),
        category: ProductCategory.PASTRIES,
        stock: 0,
      });

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue();

      // Act
      await productService.deleteProduct(productId);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: productId })
      );
      expect(mockProductRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: productId })
      );
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.deleteProduct('non-existent')).rejects.toThrow(
        ProductNotFoundError
      );

      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    const existingProduct = ProductEntity.create({
      name: 'Producto con Stock',
      price: Money.create(1500),
      category: ProductCategory.BREAD,
      stock: 10,
    });

    it('debería reducir stock correctamente', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue();

      // Act
      await productService.updateStock('test-id', -3);

      // Assert
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 7 })
      );
    });

    it('debería aumentar stock correctamente', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue();

      // Act
      await productService.updateStock('test-id', 5);

      // Assert
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 15 })
      );
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateStock('non-existent', 5)).rejects.toThrow(
        ProductNotFoundError
      );
    });
  });
});

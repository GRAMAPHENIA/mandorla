import { ProductService } from '../product.service';
import { IProductRepository } from '../../../domain/repositories/product-repository.interface';
import { ProductEntity } from '../../../domain/entities/product-entity';
import { ProductId } from '../../../domain/value-objects/product-id';
import { Money } from '../../../domain/value-objects/money';
import { ProductCategory } from '../../../domain/types';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';
import {
  ProductNotFoundError,
  InvalidProductDataError,
  DuplicateProductError,
} from '../../../domain/errors/product-errors';

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
    };

    productService = new ProductService(mockProductRepository);
  });

  describe('createProduct', () => {
    it('debería crear un producto correctamente', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'Pan Francés',
        price: 2000,
        category: 'panes',
        description: 'Pan francés artesanal',
        stock: 10,
      };

      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.save.mockResolvedValue();

      // Act
      const result = await productService.createProduct(createProductDto);

      // Assert
      expect(result).toBeInstanceOf(ProductEntity);
      expect(result.name).toBe('Pan Francés');
      expect(result.price.value).toBe(2000);
      expect(result.category).toBe(ProductCategory.BREAD);
      expect(mockProductRepository.findByName).toHaveBeenCalledWith('Pan Francés');
      expect(mockProductRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el nombre está vacío', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: '',
        price: 2000,
        category: 'panes',
      };

      // Act & Assert
      await expect(productService.createProduct(createProductDto)).rejects.toThrow(
        InvalidProductDataError
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el precio es inválido', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'Pan Francés',
        price: -100,
        category: 'panes',
      };

      // Act & Assert
      await expect(productService.createProduct(createProductDto)).rejects.toThrow(
        InvalidProductDataError
      );
    });

    it('debería lanzar error si el producto ya existe', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'Pan Francés',
        price: 2000,
        category: 'panes',
      };

      const existingProduct = ProductEntity.create({
        name: 'Pan Francés',
        price: Money.create(2000),
        category: ProductCategory.BREAD,
      });

      mockProductRepository.findByName.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(productService.createProduct(createProductDto)).rejects.toThrow(
        DuplicateProductError
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('debería obtener un producto por ID', async () => {
      // Arrange
      const productId = 'test-product-id';
      const product = ProductEntity.create({
        name: 'Croissant',
        price: Money.create(1200),
        category: ProductCategory.PASTRIES,
      });

      mockProductRepository.findById.mockResolvedValue(product);

      // Act
      const result = await productService.getProduct(productId);

      // Assert
      expect(result).toBe(product);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(ProductId.create(productId));
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
    let existingProduct: ProductEntity;

    beforeEach(() => {
      existingProduct = ProductEntity.create({
        name: 'Galletas Chocolate',
        price: Money.create(1500),
        category: ProductCategory.COOKIES,
        stock: 20,
      });
    });

    it('debería actualizar un producto correctamente', async () => {
      // Arrange
      const productId = 'test-id';
      const updateDto: UpdateProductDto = {
        name: 'Galletas Chocolate Premium',
        price: 1800,
        description: 'Galletas con chocolate belga',
      };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue();

      // Act
      const result = await productService.updateProduct(productId, updateDto);

      // Assert
      expect(result.name).toBe('Galletas Chocolate Premium');
      expect(result.price.value).toBe(1800);
      expect(result.description).toBe('Galletas con chocolate belga');
      expect(mockProductRepository.save).toHaveBeenCalledWith(result);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const updateDto: UpdateProductDto = {
        name: 'Nuevo Nombre',
      };

      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateProduct(productId, updateDto)).rejects.toThrow(
        ProductNotFoundError
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getAllProducts', () => {
    it('debería obtener todos los productos', async () => {
      // Arrange
      const products = [
        ProductEntity.create({
          name: 'Pan',
          price: Money.create(2000),
          category: ProductCategory.BREAD,
        }),
        ProductEntity.create({
          name: 'Galletas',
          price: Money.create(1500),
          category: ProductCategory.COOKIES,
        }),
      ];

      mockProductRepository.findAll.mockResolvedValue(products);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(result).toEqual(products);
      expect(result).toHaveLength(2);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });

    it('debería retornar array vacío si no hay productos', async () => {
      // Arrange
      mockProductRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getProductsByCategory', () => {
    it('debería obtener productos por categoría', async () => {
      // Arrange
      const category = ProductCategory.COOKIES;
      const products = [
        ProductEntity.create({
          name: 'Galletas Chocolate',
          price: Money.create(1500),
          category: ProductCategory.COOKIES,
        }),
        ProductEntity.create({
          name: 'Galletas Vainilla',
          price: Money.create(1400),
          category: ProductCategory.COOKIES,
        }),
      ];

      mockProductRepository.findByCategory.mockResolvedValue(products);

      // Act
      const result = await productService.getProductsByCategory('galletas');

      // Assert
      expect(result).toEqual(products);
      expect(result).toHaveLength(2);
      expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(category);
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto correctamente', async () => {
      // Arrange
      const productId = 'test-id';
      const product = ProductEntity.create({
        name: 'Producto a eliminar',
        price: Money.create(1000),
        category: ProductCategory.BREAD,
      });

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue();

      // Act
      await productService.deleteProduct(productId);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(ProductId.create(productId));
      expect(mockProductRepository.delete).toHaveBeenCalledWith(ProductId.create(productId));
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.deleteProduct(productId)).rejects.toThrow(ProductNotFoundError);

      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Pan Integral',
        price: Money.create(2500),
        category: ProductCategory.BREAD,
        stock: 10,
      });
    });

    it('debería actualizar el stock correctamente', async () => {
      // Arrange
      const productId = 'test-id';
      const newStock = 15;

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue();

      // Act
      await productService.updateStock(productId, newStock);

      // Assert
      expect(product.stock).toBe(15);
      expect(mockProductRepository.save).toHaveBeenCalledWith(product);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateStock(productId, 15)).rejects.toThrow(ProductNotFoundError);
    });
  });
});

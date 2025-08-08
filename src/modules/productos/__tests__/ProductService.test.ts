import { ProductService } from '../application/ProductService';
import { ProductRepository } from '../infrastructure/ProductRepository';
import { Product, ProductFilters } from '../domain/types';

// Mock del repositorio
jest.mock('../infrastructure/ProductRepository');

// Mock de datos específicos para panadería Mandorla
const mockProductosPanaderia: Product[] = [
  {
    id: '1',
    name: 'Galleta de Chocolate Artesanal',
    description: 'Galleta casera con chips de chocolate belga y nueces',
    price: 15.99,
    category: 'cookies',
    inStock: true,
    featured: true,
    ingredients: ['harina integral', 'chocolate belga', 'nueces', 'mantequilla'],
    allergens: ['gluten', 'frutos secos', 'lácteos']
  },
  {
    id: '2',
    name: 'Pan Integral de Centeno',
    description: 'Pan artesanal horneado diariamente con semillas',
    price: 25.50,
    category: 'breads',
    inStock: true,
    ingredients: ['harina de centeno', 'semillas de girasol', 'levadura natural'],
    allergens: ['gluten']
  },
  {
    id: '3',
    name: 'Croissant de Almendra',
    description: 'Croissant francés relleno de crema de almendra',
    price: 18.75,
    category: 'pastries',
    inStock: false,
    featured: true,
    ingredients: ['harina', 'mantequilla', 'almendras', 'azúcar'],
    allergens: ['gluten', 'frutos secos', 'lácteos', 'huevos']
  }
];

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepository>;



  beforeEach(() => {
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    productService = new ProductService(mockProductRepository);
  });

  describe('getAllProducts', () => {
    it('debe retornar todos los productos de la panadería', async () => {
      mockProductRepository.findAll.mockResolvedValue(mockProductosPanaderia);

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockProductosPanaderia);
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores del repositorio correctamente', async () => {
      const errorMessage = 'Error de conexión con la base de datos';
      mockProductRepository.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getAllProducts()).rejects.toThrow(errorMessage);
    });
  });

  describe('getFilteredProducts', () => {
    beforeEach(() => {
      mockProductRepository.findAll.mockResolvedValue(mockProductosPanaderia);
    });

    it('debe filtrar productos por categoría de panadería', async () => {
      const filters: ProductFilters = { category: 'cookies' };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('cookies');
      expect(result[0].name).toContain('Galleta');
    });

    it('debe filtrar productos de pastelería', async () => {
      const filters: ProductFilters = { category: 'pastries' };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('pastries');
      expect(result[0].name).toContain('Croissant');
    });

    it('debe ordenar productos por precio ascendente', async () => {
      const filters: ProductFilters = { sortBy: 'price-low' };

      const result = await productService.getFilteredProducts(filters);

      expect(result[0].price).toBeLessThanOrEqual(result[1].price);
      expect(result[1].price).toBeLessThanOrEqual(result[2].price);
    });

    it('debe ordenar productos por precio descendente', async () => {
      const filters: ProductFilters = { sortBy: 'price-high' };

      const result = await productService.getFilteredProducts(filters);

      expect(result[0].price).toBeGreaterThanOrEqual(result[1].price);
      expect(result[1].price).toBeGreaterThanOrEqual(result[2].price);
    });

    it('debe ordenar productos alfabéticamente', async () => {
      const filters: ProductFilters = { sortBy: 'name' };

      const result = await productService.getFilteredProducts(filters);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('debe filtrar solo productos disponibles', async () => {
      const filters: ProductFilters = { inStock: true };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(2);
      expect(result.every(p => p.inStock)).toBe(true);
    });

    it('debe retornar productos agotados cuando se solicite', async () => {
      const filters: ProductFilters = { inStock: false };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(1);
      expect(result[0].inStock).toBe(false);
      expect(result[0].name).toContain('Croissant');
    });

    it('debe combinar múltiples filtros correctamente', async () => {
      const filters: ProductFilters = { 
        category: 'cookies', 
        inStock: true,
        sortBy: 'price-low'
      };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('cookies');
      expect(result[0].inStock).toBe(true);
    });
  });
});  describ
e('getProductById', () => {
    it('debe retornar un producto específico por ID', async () => {
      const productId = '1';
      const expectedProduct = mockProductosPanaderia[0];
      mockProductRepository.findById.mockResolvedValue(expectedProduct);

      const result = await productService.getProductById(productId);

      expect(result).toEqual(expectedProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('debe retornar null cuando el producto no existe', async () => {
      const productId = 'inexistente';
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await productService.getProductById(productId);

      expect(result).toBeNull();
      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('searchProducts', () => {
    it('debe buscar productos por término de búsqueda', async () => {
      const searchCriteria = { query: 'chocolate' };
      const expectedResults = [mockProductosPanaderia[0]];
      mockProductRepository.search.mockResolvedValue(expectedResults);

      const result = await productService.searchProducts(searchCriteria);

      expect(result).toEqual(expectedResults);
      expect(mockProductRepository.search).toHaveBeenCalledWith(searchCriteria);
    });

    it('debe buscar productos por categoría y rango de precio', async () => {
      const searchCriteria = { 
        category: 'breads' as const, 
        priceRange: { min: 20, max: 30 } 
      };
      const expectedResults = [mockProductosPanaderia[1]];
      mockProductRepository.search.mockResolvedValue(expectedResults);

      const result = await productService.searchProducts(searchCriteria);

      expect(result).toEqual(expectedResults);
      expect(mockProductRepository.search).toHaveBeenCalledWith(searchCriteria);
    });
  });

  describe('Casos edge y manejo de errores', () => {
    it('debe manejar lista vacía de productos', async () => {
      mockProductRepository.findAll.mockResolvedValue([]);

      const result = await productService.getFilteredProducts({});

      expect(result).toEqual([]);
    });

    it('debe manejar filtros con categoría "all"', async () => {
      mockProductRepository.findAll.mockResolvedValue(mockProductosPanaderia);
      const filters: ProductFilters = { category: 'all' };

      const result = await productService.getFilteredProducts(filters);

      expect(result).toHaveLength(mockProductosPanaderia.length);
    });

    it('debe mantener inmutabilidad al ordenar productos', async () => {
      const originalProducts = [...mockProductosPanaderia];
      mockProductRepository.findAll.mockResolvedValue(originalProducts);
      
      await productService.getFilteredProducts({ sortBy: 'price-high' });

      // Verificar que el array original no fue modificado
      expect(originalProducts).toEqual(mockProductosPanaderia);
    });
  });
});
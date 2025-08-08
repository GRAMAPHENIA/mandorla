import { Product, ProductFilters, ProductSearchCriteria } from '../domain/types';
import { ProductRepository } from '../infrastructure/ProductRepository';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async searchProducts(criteria: ProductSearchCriteria): Promise<Product[]> {
    return this.productRepository.search(criteria);
  }

  async getFilteredProducts(filters: ProductFilters): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    
    let filtered = products;

    // Filtrar por categoría
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filtrar por disponibilidad
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product => product.inStock === filters.inStock);
    }

    // Ordenar productos
    if (filters.sortBy) {
      filtered = this.sortProducts(filtered, filters.sortBy);
    }

    return filtered;
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }
}
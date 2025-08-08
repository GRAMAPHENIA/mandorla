import { Product, ProductSearchCriteria } from '../domain/types';
import { mockProducts } from '../../../data/mock-products';

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    // Simular llamada asíncrona
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 100);
    });
  }

  async findById(id: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === id) || null;
        resolve(product);
      }, 100);
    });
  }

  async search(criteria: ProductSearchCriteria): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = mockProducts;

        if (criteria.query) {
          const query = criteria.query.toLowerCase();
          results = results.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
          );
        }

        if (criteria.category) {
          results = results.filter(product => product.category === criteria.category);
        }

        if (criteria.priceRange) {
          results = results.filter(product => 
            product.price >= criteria.priceRange!.min &&
            product.price <= criteria.priceRange!.max
          );
        }

        resolve(results);
      }, 100);
    });
  }
}
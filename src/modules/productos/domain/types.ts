// Tipos de dominio para productos de panadería Mandorla
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Para productos en oferta
  category: ProductCategory;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  inStock: boolean;
  featured?: boolean;
}

export type ProductCategory = 'cookies' | 'pastries' | 'breads' | 'seasonal';

export interface ProductFilters {
  category?: ProductCategory | 'all';
  sortBy?: 'name' | 'price-low' | 'price-high';
  inStock?: boolean;
}

export interface ProductSearchCriteria {
  query?: string;
  category?: ProductCategory;
  priceRange?: {
    min: number;
    max: number;
  };
}
"use client"

import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { Product, ProductFilters } from "../domain/types";
import { ProductService } from "../application/ProductService";
import { ProductRepository } from "../infrastructure/ProductRepository";

// Instancia del servicio
const productService = new ProductService(new ProductRepository());

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const filteredProducts = await productService.getFilteredProducts(filters);
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-muted-foreground">
          Cargando productos...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange({ category: e.target.value as any })}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">Todas las Categorías</option>
          <option value="cookies">Galletas</option>
          <option value="pastries">Pasteles</option>
          <option value="breads">Panes</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="name">Ordenar por Nombre</option>
          <option value="price-low">Precio: Menor a Mayor</option>
          <option value="price-high">Precio: Mayor a Menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
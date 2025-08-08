"use client"

import { useEffect } from "react"
import { ProductCard } from "./ProductCard"
import { ProductEntity } from "../../domain/entities/ProductEntity"
import { useProducts } from "../hooks/useProducts"
import { useProductFilters } from "../hooks/useProductFilters"
import { Loader2, AlertCircle, Package } from "lucide-react"
import { Alert, AlertDescription } from "../../../../components/ui/alert"
import { Button } from "../../../../components/ui/button"

interface ProductGridProps {
  initialProducts?: ProductEntity[]
  showFilters?: boolean
  className?: string
  onProductSelect?: (product: ProductEntity) => void
}

/**
 * Componente de grilla de productos refactorizado
 * Separado de la lógica de negocio y con responsabilidades claras
 */
export function ProductGrid({ 
  initialProducts,
  showFilters = true,
  className,
  onProductSelect
}: ProductGridProps) {
  const { 
    products, 
    loading, 
    error, 
    searchProducts,
    clearError,
    refresh
  } = useProducts()

  const {
    filters,
    searchCriteria,
    hasActiveFilters,
    activeFiltersCount,
    availableCategories,
    sortingOptions,
    setSearchTerm,
    setCategory,
    setSorting,
    clearFilters
  } = useProductFilters()

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    if (hasActiveFilters) {
      searchProducts(searchCriteria)
    } else {
      refresh()
    }
  }, [searchCriteria, hasActiveFilters, searchProducts, refresh])

  // Usar productos iniciales si se proporcionan
  const displayProducts = initialProducts || products

  const handleProductClick = (product: ProductEntity) => {
    if (onProductSelect) {
      onProductSelect(product)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando productos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                clearError()
                refresh()
              }}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Controles de filtros */}
      {showFilters && (
        <div className="space-y-4 mb-6">
          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filtros y ordenamiento */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Selector de categoría */}
            <select
              value={filters.category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {availableCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Selector de ordenamiento */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setSorting(e.target.value as any, filters.sortOrder)}
                className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortOrder}
                onChange={(e) => setSorting(filters.sortBy, e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-md">
              <span className="text-sm text-muted-foreground">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grilla de productos */}
      {displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? "Intenta ajustar los filtros de búsqueda" 
              : "No hay productos disponibles en este momento"
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {displayProducts.length} producto{displayProducts.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtrados)'}
            </p>
          </div>

          {/* Grilla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <div
                key={product.id.value}
                onClick={() => handleProductClick(product)}
                className="cursor-pointer"
              >
                <ProductCard 
                  product={product}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Label } from "../../../../components/ui/label"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Slider } from "../../../../components/ui/slider"
import { Badge } from "../../../../components/ui/badge"
import { useProductFilters } from "../hooks/useProductFilters"
import { X, Filter } from "lucide-react"

interface ProductFiltersProps {
  className?: string
  onFiltersChange?: (hasActiveFilters: boolean) => void
}

/**
 * Componente de filtros de productos refactorizado
 * Encapsula toda la lógica de filtrado en un componente reutilizable
 */
export function ProductFilters({ className, onFiltersChange }: ProductFiltersProps) {
  const {
    filters,
    hasActiveFilters,
    activeFiltersCount,
    availableCategories,
    setCategory,
    toggleInStockOnly,
    toggleFeaturedOnly,
    setWithIngredient,
    setWithoutAllergen,
    setPriceRange,
    clearFilters
  } = useProductFilters()

  // Notificar cambios en filtros al componente padre
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(hasActiveFilters)
    }
  }, [hasActiveFilters, onFiltersChange])

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(
      values[0] > 0 ? values[0] : undefined,
      values[1] < 100 ? values[1] : undefined
    )
  }

  return (
    <div className={className}>
      {/* Header con contador de filtros activos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filtros</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Filtro por categorías */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableCategories.slice(1).map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={filters.category === category.value}
                  onCheckedChange={(checked) => {
                    setCategory(checked ? category.value : 'all')
                  }}
                />
                <Label 
                  htmlFor={`category-${category.value}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Filtros de disponibilidad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Disponibilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStockOnly}
                onCheckedChange={toggleInStockOnly}
              />
              <Label htmlFor="in-stock" className="cursor-pointer text-sm">
                Solo productos en stock
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featuredOnly}
                onCheckedChange={toggleFeaturedOnly}
              />
              <Label htmlFor="featured" className="cursor-pointer text-sm">
                Solo productos destacados
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Filtro por rango de precios */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rango de Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-2">
              <Slider
                value={[filters.minPrice || 0, filters.maxPrice || 100]}
                onValueChange={handlePriceRangeChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${filters.minPrice || 0}</span>
              <span>${filters.maxPrice || 100}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-price" className="text-xs">Mínimo</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    setPriceRange(value, filters.maxPrice)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="text-xs">Máximo</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="100"
                  value={filters.maxPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    setPriceRange(filters.minPrice, value)
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtro por ingredientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingredientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="with-ingredient" className="text-sm">
                Debe contener:
              </Label>
              <Input
                id="with-ingredient"
                placeholder="ej. chocolate, vainilla..."
                value={filters.withIngredient}
                onChange={(e) => setWithIngredient(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="without-allergen" className="text-sm">
                Sin alérgenos:
              </Label>
              <Input
                id="without-allergen"
                placeholder="ej. gluten, lácteos..."
                value={filters.withoutAllergen}
                onChange={(e) => setWithoutAllergen(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filtros Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Categoría: {availableCategories.find(c => c.value === filters.category)?.label}
                  </Badge>
                )}
                {filters.inStockOnly && (
                  <Badge variant="secondary" className="text-xs">
                    En stock
                  </Badge>
                )}
                {filters.featuredOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Destacados
                  </Badge>
                )}
                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <Badge variant="secondary" className="text-xs">
                    Precio: ${filters.minPrice || 0} - ${filters.maxPrice || 100}
                  </Badge>
                )}
                {filters.withIngredient && (
                  <Badge variant="secondary" className="text-xs">
                    Con: {filters.withIngredient}
                  </Badge>
                )}
                {filters.withoutAllergen && (
                  <Badge variant="secondary" className="text-xs">
                    Sin: {filters.withoutAllergen}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Importar React para useEffect
import React from "react"
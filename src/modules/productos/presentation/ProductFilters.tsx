"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { ProductFilters as IProductFilters } from "../domain/types";

interface ProductFiltersProps {
  onFiltersChange?: (filters: IProductFilters) => void;
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<IProductFilters>({
    category: 'all',
    sortBy: 'name',
    inStock: undefined
  });

  const [priceRange, setPriceRange] = useState([0, 100]);

  const handleFilterChange = (newFilters: Partial<IProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const categories = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'cookies', label: 'Galletas' },
    { value: 'pastries', label: 'Pasteles' },
    { value: 'breads', label: 'Panes' },
    { value: 'seasonal', label: 'Temporada' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categorías */}
          <div>
            <h4 className="font-medium mb-3">Categorías</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.value}
                    checked={filters.category === category.value}
                    onCheckedChange={() => 
                      handleFilterChange({ category: category.value as any })
                    }
                  />
                  <Label htmlFor={category.value} className="text-sm">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Disponibilidad */}
          <div>
            <h4 className="font-medium mb-3">Disponibilidad</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) => 
                  handleFilterChange({ inStock: checked ? true : undefined })
                }
              />
              <Label htmlFor="inStock" className="text-sm">
                Solo productos disponibles
              </Label>
            </div>
          </div>

          {/* Rango de precios */}
          <div>
            <h4 className="font-medium mb-3">Rango de Precios</h4>
            <div className="space-y-3">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Ordenamiento */}
          <div>
            <h4 className="font-medium mb-3">Ordenar por</h4>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="name">Nombre</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
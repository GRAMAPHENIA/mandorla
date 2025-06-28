"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"

export function ProductFilters() {
  const categories = [
    { id: "cookies", label: "Galletas", count: 12 },
    { id: "pastries", label: "Pasteles", count: 8 },
    { id: "breads", label: "Panes", count: 6 },
    { id: "seasonal", label: "Temporada", count: 4 },
  ]

  const priceRanges = [
    { id: "under-10", label: "Menos de $10", count: 15 },
    { id: "10-20", label: "$10 - $20", count: 10 },
    { id: "20-30", label: "$20 - $30", count: 5 },
    { id: "over-30", label: "Más de $30", count: 3 },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox id={category.id} />
              <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                {category.label}
              </Label>
              <span className="text-sm text-muted-foreground">({category.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rango de Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {priceRanges.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <Checkbox id={range.id} />
              <Label htmlFor={range.id} className="flex-1 cursor-pointer">
                {range.label}
              </Label>
              <span className="text-sm text-muted-foreground">({range.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

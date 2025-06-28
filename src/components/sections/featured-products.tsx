"use client"

import { ProductCard } from "../products/product-card"
import { mockProducts } from "../../data/mock-products"

export function FeaturedProducts() {
  const featuredProducts = mockProducts.filter((product) => product.featured).slice(0, 4)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="mandorla-text-gradient">Galletas</span> Destacadas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestras recetas más queridas, perfeccionadas a lo largo de generaciones y amadas por los entusiastas de las
            galletas en todas partes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

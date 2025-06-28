import { ProductGrid } from "../../components/products/product-grid"
import { ProductFilters } from "../../components/products/product-filters"
import { Suspense } from "react"

export const metadata = {
  title: "Nuestros Productos - Panadería Mandorla",
  description: "Explora nuestra colección completa de galletas caseras y productos horneados artesanales.",
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nuestros Deliciosos Productos</h1>
        <p className="text-muted-foreground">
          Descubre nuestras galletas artesanales y productos horneados, hechos con amor y los mejores ingredientes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>

        <div className="lg:col-span-3">
          <Suspense fallback={<div>Cargando productos...</div>}>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

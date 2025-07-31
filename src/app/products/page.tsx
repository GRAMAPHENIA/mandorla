import { ProductGrid } from "../../components/products/product-grid";
import { ProductFilters } from "../../components/products/product-filters";
import { Suspense } from "react";
import { SectionTitle } from "../../components/ui/section-title";

export const metadata = {
  title: "Nuestros Productos - Panadería Mandorla",
  description:
    "Explora nuestra colección completa de galletas caseras y productos horneados artesanales.",
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-2 py-16 mt-4 md:py-24">
      <SectionTitle
        title="Nuestros Deliciosos "
        gradientText="Productos"
        subtitle="Descubre nuestras galletas artesanales y productos horneados, hechos con amor y los mejores ingredientes."
        align="left"
        className="mb-12"
        titleClassName="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
        subtitleClassName="text-lg md:text-xl text-muted-foreground max-w-3xl"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>

        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-muted-foreground">
                  Cargando productos...
                </div>
              </div>
            }
          >
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

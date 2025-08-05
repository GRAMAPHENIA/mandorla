"use client";

import { ProductCard } from "../products/product-card";
import { mockProducts } from "../../data/mock-products";
import { SectionTitle } from "../ui/section-title";

export function FeaturedProducts() {
  const featuredProducts = mockProducts
    .filter((product) => product.featured)
    .slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Nuestras Galletas "
          gradientText="Destacadas"
          subtitle="Descubre nuestras recetas más exquisitas, elaboradas con ingredientes naturales y mucho amor."
          align="center"
          className="mb-16"
          titleClassName="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          subtitleClassName="text-lg md:text-xl text-muted-foreground max-w-2xl"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

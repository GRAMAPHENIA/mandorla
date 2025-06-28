"use client";

import { ProductCard } from "../products/product-card";
import { useFavoritesStore } from "../../stores/favorites-store";
import { Product } from "@/types/product";

export function FavoritesList() {
  const favoriteItems = useFavoritesStore((state) => state.items);

  if (favoriteItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aún no tienes productos favoritos
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          ¡Explora nuestros productos y agrega algunos favoritos!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favoriteItems.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

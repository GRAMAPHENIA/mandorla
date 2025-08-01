"use client";

import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { useCartStore } from "../../stores/cart-store";
import { useFavoritesStore } from "../../stores/favorites-store";
import type { Product } from "../../../types/product";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleItem);
  const isFavorite = useFavoritesStore((state) =>
    state.items.some((item) => item.id === product.id)
  );

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative overflow-hidden rounded-t-lg flex-1">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary">
              Destacado
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5",
              "hover:bg-background/90 transition-colors duration-200"
            )}
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isFavorite
                  ? "fill-[#D6BD98] text-[#a9977c] scale-110"
                  : "text-foreground/70 scale-100"
              )}
              fill={isFavorite ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </Button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}

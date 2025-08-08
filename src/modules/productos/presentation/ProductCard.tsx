"use client"

import { OptimizedImage } from "../../../components/ui/optimized-image";
import { Heart, ShoppingCart } from "../../../lib/optimized-imports";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useCartStore } from "../../../stores/cart-store";
import { useFavoritesStore } from "../../../stores/favorites-store";
import { Product } from "../domain/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { items: favorites, addItem: addToFavorites, removeItem: removeFromFavorites } = useFavoritesStore();
  
  const isFavorite = favorites.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      cookies: 'Galletas',
      pastries: 'Pasteles',
      breads: 'Panes',
      seasonal: 'Temporada'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <OptimizedImage
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          aspectRatio="square"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={80}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 transition-colors ${
            isFavorite 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-white hover:text-red-500'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-primary">
            Destacado
          </Badge>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Agotado</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(product.category)}
          </Badge>
          
          <h3 className="font-semibold text-lg leading-tight">
            {product.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.inStock ? 'Agregar al Carrito' : 'No Disponible'}
        </Button>
      </CardFooter>
    </Card>
  );
}
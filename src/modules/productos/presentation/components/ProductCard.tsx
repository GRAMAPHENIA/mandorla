"use client"

import Image from "next/image"
import { Heart, ShoppingCart, AlertCircle } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardFooter } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Alert, AlertDescription } from "../../../../components/ui/alert"
import { cn } from "../../../../lib/utils"
import { ProductEntity } from "../../domain/entities/ProductEntity"
import { useProductActions } from "../hooks/useProductActions"
import { useState } from "react"

interface ProductCardProps {
  product: ProductEntity
  className?: string
  showFullDescription?: boolean
  onAddToCart?: (product: ProductEntity) => void
  onToggleFavorite?: (product: ProductEntity) => void
}

/**
 * Componente de tarjeta de producto refactorizado
 * Sigue el principio de responsabilidad única y está desacoplado de la lógica de negocio
 */
export function ProductCard({ 
  product, 
  className,
  showFullDescription = false,
  onAddToCart,
  onToggleFavorite
}: ProductCardProps) {
  const {
    handleAddToCart,
    handleToggleFavorite,
    getProductDisplayInfo
  } = useProductActions()

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const productInfo = getProductDisplayInfo(product)

  const handleAddToCartClick = async () => {
    const result = onAddToCart ? 
      onAddToCart(product) : 
      handleAddToCart(product)

    if (typeof result === 'object' && 'success' in result) {
      setActionMessage({
        type: result.success ? 'success' : 'error',
        message: result.message
      })
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const handleToggleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const result = onToggleFavorite ? 
      onToggleFavorite(product) : 
      handleToggleFavorite(product)

    if (typeof result === 'object' && 'success' in result) {
      setActionMessage({
        type: result.success ? 'success' : 'error',
        message: result.message
      })
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => setActionMessage(null), 2000)
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col",
      !productInfo.isAvailable && "opacity-75",
      className
    )}>
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Imagen del producto */}
        <div className="relative overflow-hidden rounded-t-lg flex-1">
          <Image
            src={productInfo.image || "/placeholder.svg"}
            alt={productInfo.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {productInfo.featured && (
              <Badge className="bg-primary">
                Destacado
              </Badge>
            )}
            {productInfo.price.hasDiscount && (
              <Badge variant="destructive">
                -{productInfo.price.discountPercentage}%
              </Badge>
            )}
            {!productInfo.isAvailable && (
              <Badge variant="secondary">
                Agotado
              </Badge>
            )}
          </div>

          {/* Botón de favoritos */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5",
              "hover:bg-background/90 transition-colors duration-200"
            )}
            onClick={handleToggleFavoriteClick}
            aria-label={
              productInfo.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                productInfo.isFavorite
                  ? "fill-[#D6BD98] text-[#a9977c] scale-110"
                  : "text-foreground/70 scale-100"
              )}
              fill={productInfo.isFavorite ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </Button>
        </div>

        {/* Información del producto */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
              {productInfo.name}
            </h3>
            <Badge variant="outline" className="ml-2 text-xs">
              {productInfo.category.displayName}
            </Badge>
          </div>
          
          <p className={cn(
            "text-muted-foreground text-sm mb-3 flex-1",
            showFullDescription ? "line-clamp-none" : "line-clamp-2"
          )}>
            {productInfo.description}
          </p>

          {/* Ingredientes y alérgenos (si se muestran) */}
          {showFullDescription && (
            <div className="space-y-2 mb-3">
              {productInfo.ingredients.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Ingredientes:</span>
                  <p className="text-xs text-muted-foreground">
                    {productInfo.ingredients.join(', ')}
                  </p>
                </div>
              )}
              {productInfo.allergens.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Alérgenos:</span>
                  <p className="text-xs text-muted-foreground">
                    {productInfo.allergens.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Precios */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${productInfo.price.currentPrice.toFixed(2)}
              </span>
              {productInfo.price.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${productInfo.price.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {productInfo.quantityInCart > 0 && (
              <Badge variant="secondary">
                En carrito: {productInfo.quantityInCart}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      {/* Acciones */}
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {actionMessage && (
          <Alert className={cn(
            "py-2",
            actionMessage.type === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          )}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {actionMessage.message}
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleAddToCartClick}
          className="w-full"
          size="sm"
          variant="outline"
          disabled={!productInfo.isAvailable}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {productInfo.isAvailable ? 'Agregar al Carrito' : 'No Disponible'}
        </Button>
      </CardFooter>
    </Card>
  )
}
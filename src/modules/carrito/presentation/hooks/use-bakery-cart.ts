import { useCartOperations } from '@/stores/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useCallback } from 'react'

/**
 * Hook personalizado para operaciones específicas del carrito de panadería
 */
export const useBakeryCart = () => {
  const cart = useCartOperations()
  const { toast } = useToast()

  /**
   * Agrega un producto de panadería con validaciones específicas
   */
  const addBakeryItem = useCallback(async (
    product: {
      id: string
      name: string
      price: number
      category: 'galletas' | 'pasteles' | 'panes' | 'temporada'
      image?: string
      maxQuantity?: number
      isAvailable?: boolean
    },
    quantity: number = 1
  ) => {
    // Validaciones específicas de panadería
    if (!product.isAvailable) {
      toast({
        title: "Producto no disponible",
        description: `Lo sentimos, ${product.name} no está disponible en este momento`,
        variant: "destructive"
      })
      return
    }

    if (product.maxQuantity && quantity > product.maxQuantity) {
      toast({
        title: "Cantidad excedida",
        description: `Solo podemos preparar ${product.maxQuantity} unidades de ${product.name} por pedido`,
        variant: "destructive"
      })
      return
    }

    // Verificar si ya existe en el carrito
    const currentQuantity = cart.getItemQuantity(product.id)
    const totalQuantity = currentQuantity + quantity

    if (product.maxQuantity && totalQuantity > product.maxQuantity) {
      toast({
        title: "Límite alcanzado",
        description: `Ya tienes ${currentQuantity} unidades. Solo puedes agregar ${product.maxQuantity - currentQuantity} más`,
        variant: "destructive"
      })
      return
    }

    try {
      await cart.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      })

      toast({
        title: "¡Agregado al carrito!",
        description: `${product.name} se agregó a tu pedido`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No pudimos agregar el producto. Inténtalo de nuevo",
        variant: "destructive"
      })
    }
  }, [cart, toast])

  /**
   * Calcula el tiempo estimado de preparación basado en los productos
   */
  const getEstimatedPreparationTime = useCallback(() => {
    const items = cart.items
    
    if (items.length === 0) return 0

    // Tiempos base por categoría (en minutos)
    const preparationTimes = {
      'galletas': 15,
      'panes': 30,
      'pasteles': 45,
      'temporada': 60
    }

    // Simular categorización basada en el nombre (en un caso real vendría del producto)
    const maxTime = items.reduce((max, item) => {
      let category: keyof typeof preparationTimes = 'galletas'
      
      if (item.name.toLowerCase().includes('pan')) category = 'panes'
      else if (item.name.toLowerCase().includes('pastel') || item.name.toLowerCase().includes('tarta')) category = 'pasteles'
      else if (item.name.toLowerCase().includes('especial') || item.name.toLowerCase().includes('temporada')) category = 'temporada'
      
      return Math.max(max, preparationTimes[category])
    }, 0)

    return maxTime
  }, [cart.items])

  /**
   * Verifica si el carrito tiene productos que requieren refrigeración
   */
  const hasRefrigeratedItems = useCallback(() => {
    return cart.items.some(item => 
      item.name.toLowerCase().includes('crema') ||
      item.name.toLowerCase().includes('nata') ||
      item.name.toLowerCase().includes('chocolate blanco')
    )
  }, [cart.items])

  /**
   * Calcula descuentos por cantidad (ej: 10% descuento en pedidos > 50€)
   */
  const calculateBulkDiscount = useCallback(() => {
    const total = cart.totalPrice
    
    if (total >= 50) {
      return {
        applicable: true,
        percentage: 10,
        amount: total * 0.1,
        message: '¡10% de descuento por pedido mayor a 50€!'
      }
    }
    
    if (total >= 30) {
      return {
        applicable: true,
        percentage: 5,
        amount: total * 0.05,
        message: '¡5% de descuento por pedido mayor a 30€!'
      }
    }

    return {
      applicable: false,
      percentage: 0,
      amount: 0,
      message: 'Agrega más productos para obtener descuentos'
    }
  }, [cart.totalPrice])

  return {
    ...cart,
    addBakeryItem,
    getEstimatedPreparationTime,
    hasRefrigeratedItems,
    calculateBulkDiscount,
    
    // Información adicional específica de panadería
    needsSpecialHandling: hasRefrigeratedItems(),
    estimatedTime: getEstimatedPreparationTime(),
    bulkDiscount: calculateBulkDiscount()
  }
}
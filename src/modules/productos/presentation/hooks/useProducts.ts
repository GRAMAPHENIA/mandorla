import { useState, useEffect, useCallback } from 'react'
import { ProductEntity } from '../../domain/entities/ProductEntity'
import { ProductService } from '../../application/services/ProductService'
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository'
import { ProductSearchCriteria } from '../../application/dto/ProductSearchCriteria'
import { ProductNotFoundError } from '../../domain/errors/ProductErrors'

/**
 * Hook personalizado para gestión de productos
 * Encapsula la lógica de interacción con el servicio de productos
 */
export function useProducts() {
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializar servicio (singleton pattern)
  const [productService] = useState(() => {
    const repository = new ProductRepository()
    return new ProductService(repository)
  })

  /**
   * Obtiene todos los productos
   */
  const fetchAllProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const allProducts = await productService.getAllProducts()
      setProducts(allProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Busca productos según criterios
   */
  const searchProducts = useCallback(async (criteria: ProductSearchCriteria) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchResults = await productService.searchProducts(criteria)
      setProducts(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar productos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Obtiene productos por categoría
   */
  const getProductsByCategory = useCallback(async (category: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const categoryProducts = await productService.getProductsByCategory(category)
      setProducts(categoryProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos por categoría')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Obtiene productos destacados
   */
  const getFeaturedProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const featuredProducts = await productService.getFeaturedProducts()
      setProducts(featuredProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos destacados')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Obtiene productos en stock
   */
  const getInStockProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const inStockProducts = await productService.getInStockProducts()
      setProducts(inStockProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos en stock')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Obtiene productos con descuento
   */
  const getDiscountedProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const discountedProducts = await productService.getDiscountedProducts()
      setProducts(discountedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos con descuento')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productService])

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Refresca los productos actuales
   */
  const refresh = useCallback(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  // Cargar productos inicialmente
  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  return {
    products,
    loading,
    error,
    fetchAllProducts,
    searchProducts,
    getProductsByCategory,
    getFeaturedProducts,
    getInStockProducts,
    getDiscountedProducts,
    clearError,
    refresh
  }
}

/**
 * Hook para obtener un producto específico por ID
 */
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<ProductEntity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializar servicio
  const [productService] = useState(() => {
    const repository = new ProductRepository()
    return new ProductService(repository)
  })

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const foundProduct = await productService.getProductById(id)
      setProduct(foundProduct)
    } catch (err) {
      if (err instanceof ProductNotFoundError) {
        setError(`Producto no encontrado: ${id}`)
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar producto')
      }
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [productService])

  const checkAvailability = useCallback(async (id: string) => {
    try {
      return await productService.checkProductAvailability(id)
    } catch (err) {
      console.error('Error al verificar disponibilidad:', err)
      return false
    }
  }, [productService])

  useEffect(() => {
    if (productId) {
      fetchProduct(productId)
    } else {
      setProduct(null)
      setError(null)
    }
  }, [productId, fetchProduct])

  return {
    product,
    loading,
    error,
    checkAvailability,
    refetch: productId ? () => fetchProduct(productId) : undefined
  }
}
import { useState, useEffect } from 'react'
import { ProductEntity } from '../../domain'
import { ProductService, SearchCriteria } from '../../application'

/**
 * Hook personalizado para gestionar productos
 */
export function useProducts(productService: ProductService) {
  const [products, setProducts] = useState<ProductEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const allProducts = await productService.getAllProducts()
      setProducts(allProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (criteria: SearchCriteria) => {
    setLoading(true)
    setError(null)
    try {
      const searchResults = await productService.searchProducts(criteria)
      setProducts(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  const getProductById = async (id: string): Promise<ProductEntity | null> => {
    try {
      return await productService.getProductById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener producto')
      return null
    }
  }

  const getProductsByCategory = async (category: string) => {
    setLoading(true)
    setError(null)
    try {
      const categoryProducts = await productService.getProductsByCategory(category)
      setProducts(categoryProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos por categoría')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return {
    products,
    loading,
    error,
    loadProducts,
    searchProducts,
    getProductById,
    getProductsByCategory,
    refreshProducts: loadProducts
  }
}
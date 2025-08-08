import { useState, useCallback, useMemo } from 'react'
import { ProductSearchCriteria } from '../../application/dto/ProductSearchCriteria'
import { ProductCategoryType } from '../../domain/value-objects/ProductCategory'

/**
 * Estado de filtros para productos
 */
export interface ProductFiltersState {
  searchTerm: string
  category: ProductCategoryType | 'all'
  inStockOnly: boolean
  featuredOnly: boolean
  withIngredient: string
  withoutAllergen: string
  minPrice: number | undefined
  maxPrice: number | undefined
  sortBy: 'name' | 'price' | 'category' | 'featured'
  sortOrder: 'asc' | 'desc'
}

/**
 * Hook personalizado para gestión de filtros de productos
 * Encapsula la lógica de filtrado y ordenamiento
 */
export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFiltersState>({
    searchTerm: '',
    category: 'all',
    inStockOnly: false,
    featuredOnly: false,
    withIngredient: '',
    withoutAllergen: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  /**
   * Actualiza el término de búsqueda
   */
  const setSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }))
  }, [])

  /**
   * Actualiza la categoría seleccionada
   */
  const setCategory = useCallback((category: ProductCategoryType | 'all') => {
    setFilters(prev => ({ ...prev, category }))
  }, [])

  /**
   * Alterna el filtro de solo productos en stock
   */
  const toggleInStockOnly = useCallback(() => {
    setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))
  }, [])

  /**
   * Alterna el filtro de solo productos destacados
   */
  const toggleFeaturedOnly = useCallback(() => {
    setFilters(prev => ({ ...prev, featuredOnly: !prev.featuredOnly }))
  }, [])

  /**
   * Actualiza el filtro de ingrediente
   */
  const setWithIngredient = useCallback((withIngredient: string) => {
    setFilters(prev => ({ ...prev, withIngredient }))
  }, [])

  /**
   * Actualiza el filtro de alérgeno a evitar
   */
  const setWithoutAllergen = useCallback((withoutAllergen: string) => {
    setFilters(prev => ({ ...prev, withoutAllergen }))
  }, [])

  /**
   * Actualiza el rango de precios
   */
  const setPriceRange = useCallback((minPrice: number | undefined, maxPrice: number | undefined) => {
    setFilters(prev => ({ ...prev, minPrice, maxPrice }))
  }, [])

  /**
   * Actualiza el criterio de ordenamiento
   */
  const setSorting = useCallback((sortBy: ProductFiltersState['sortBy'], sortOrder: ProductFiltersState['sortOrder'] = 'asc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
  }, [])

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      category: 'all',
      inStockOnly: false,
      featuredOnly: false,
      withIngredient: '',
      withoutAllergen: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }, [])

  /**
   * Actualiza múltiples filtros a la vez
   */
  const updateFilters = useCallback((updates: Partial<ProductFiltersState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Convierte el estado de filtros a criterios de búsqueda
   */
  const searchCriteria = useMemo((): ProductSearchCriteria => {
    return {
      searchTerm: filters.searchTerm || undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      inStockOnly: filters.inStockOnly || undefined,
      featuredOnly: filters.featuredOnly || undefined,
      withIngredient: filters.withIngredient || undefined,
      withoutAllergen: filters.withoutAllergen || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    }
  }, [filters])

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.category !== 'all' ||
      filters.inStockOnly ||
      filters.featuredOnly ||
      filters.withIngredient !== '' ||
      filters.withoutAllergen !== '' ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
    )
  }, [filters])

  /**
   * Obtiene un resumen de los filtros activos
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.category !== 'all') count++
    if (filters.inStockOnly) count++
    if (filters.featuredOnly) count++
    if (filters.withIngredient) count++
    if (filters.withoutAllergen) count++
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++
    return count
  }, [filters])

  /**
   * Obtiene las categorías disponibles
   */
  const availableCategories = useMemo(() => [
    { value: 'all' as const, label: 'Todas las Categorías' },
    { value: 'cookies' as const, label: 'Galletas' },
    { value: 'pastries' as const, label: 'Pasteles' },
    { value: 'breads' as const, label: 'Panes' },
    { value: 'seasonal' as const, label: 'Temporada' }
  ], [])

  /**
   * Obtiene las opciones de ordenamiento disponibles
   */
  const sortingOptions = useMemo(() => [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'category', label: 'Categoría' },
    { value: 'featured', label: 'Destacados' }
  ], [])

  return {
    filters,
    searchCriteria,
    hasActiveFilters,
    activeFiltersCount,
    availableCategories,
    sortingOptions,
    setSearchTerm,
    setCategory,
    toggleInStockOnly,
    toggleFeaturedOnly,
    setWithIngredient,
    setWithoutAllergen,
    setPriceRange,
    setSorting,
    clearFilters,
    updateFilters
  }
}
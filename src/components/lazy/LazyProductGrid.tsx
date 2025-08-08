"use client"

import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useProductPreloader } from '../../hooks/useMandorlaPreloader';

// Lazy loading del módulo de productos
const ProductGrid = lazy(() => 
  import('../../modules/productos').then(module => ({ 
    default: module.ProductGrid 
  }))
);

// Componente de carga para productos
function ProductGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LazyProductGrid() {
  const { ref, isPreloaded } = useProductPreloader();

  return (
    <div ref={ref}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
      {/* Indicador visual opcional para desarrollo */}
      {process.env.NODE_ENV === 'development' && isPreloaded && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Productos precargados ✓
        </div>
      )}
    </div>
  );
}
"use client"

import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

// Lazy loading del componente de filtros
const ProductFilters = lazy(() => 
  import('../../modules/productos').then(module => ({ 
    default: module.ProductFilters 
  }))
);

// Componente de carga para filtros
function ProductFiltersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-20" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categorías */}
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Disponibilidad */}
        <div>
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        {/* Precio */}
        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-6 w-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        
        {/* Ordenamiento */}
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LazyProductFilters() {
  return (
    <Suspense fallback={<ProductFiltersSkeleton />}>
      <ProductFilters />
    </Suspense>
  );
}
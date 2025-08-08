"use client"

import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

// Lazy loading de la lista de favoritos
const FavoritesList = lazy(() => 
  import('../favorites/favorites-list').then(module => ({ 
    default: module.FavoritesList 
  }))
);

// Componente de carga para favoritos
function FavoritesListSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LazyFavoritesListProps {
  preloadOnMount?: boolean;
}

export function LazyFavoritesList({ preloadOnMount = false }: LazyFavoritesListProps) {
  return (
    <Suspense fallback={<FavoritesListSkeleton />}>
      <FavoritesList />
    </Suspense>
  );
}
"use client"

import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

// Lazy loading del componente de items del carrito
const CartItems = lazy(() => 
  import('../../modules/carrito').then(module => ({ 
    default: module.CartItems 
  }))
);

// Componente de carga para items del carrito
function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-20 h-20 rounded-md" />
              
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
              
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LazyCartItems() {
  return (
    <Suspense fallback={<CartItemsSkeleton />}>
      <CartItems />
    </Suspense>
  );
}
"use client"

import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

// Lazy loading del componente de resumen del carrito
const CartSummary = lazy(() => 
  import('../../modules/carrito').then(module => ({ 
    default: module.CartSummary 
  }))
);

// Componente de carga para resumen del carrito
function CartSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        
        <Skeleton className="h-px w-full" />
        
        <div className="flex justify-between">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

export function LazyCartSummary() {
  return (
    <Suspense fallback={<CartSummarySkeleton />}>
      <CartSummary />
    </Suspense>
  );
}
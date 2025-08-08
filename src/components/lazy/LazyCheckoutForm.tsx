"use client"

import { lazy, Suspense, useEffect, useRef } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { preloader, preloadCheckoutForm } from '../../lib/preloader';

// Lazy loading del formulario de checkout
const CheckoutForm = lazy(() => preloadCheckoutForm());

// Componente de carga para el formulario de checkout
function CheckoutFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campos del formulario */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {/* Área de texto */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        {/* Botón */}
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

interface LazyCheckoutFormProps {
  preloadOnMount?: boolean;
  preloadOnIntersection?: boolean;
}

export function LazyCheckoutForm({ 
  preloadOnMount = false, 
  preloadOnIntersection = true 
}: LazyCheckoutFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preloadOnMount) {
      preloader.preload('checkout-form', preloadCheckoutForm);
    }
  }, [preloadOnMount]);

  useEffect(() => {
    if (preloadOnIntersection && containerRef.current) {
      const preloadOnIntersect = preloader.preloadOnIntersection(
        'checkout-form', 
        preloadCheckoutForm,
        { threshold: 0.2 }
      );
      preloadOnIntersect(containerRef.current);
    }
  }, [preloadOnIntersection]);

  return (
    <div ref={containerRef}>
      <Suspense fallback={<CheckoutFormSkeleton />}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
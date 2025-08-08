import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loading para componentes pesados del carrito
const CartDrawer = lazy(() => import('./cart-drawer'))
const CartPage = lazy(() => import('./cart-page'))
const CheckoutForm = lazy(() => import('./checkout-form'))

/**
 * Componente de carga para el carrito
 */
const CartSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-4 w-32" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
)

/**
 * Wrapper con lazy loading para el drawer del carrito
 */
export const LazyCartDrawer = (props: any) => (
  <Suspense fallback={<CartSkeleton />}>
    <CartDrawer {...props} />
  </Suspense>
)

/**
 * Wrapper con lazy loading para la página del carrito
 */
export const LazyCartPage = (props: any) => (
  <Suspense fallback={<CartSkeleton />}>
    <CartPage {...props} />
  </Suspense>
)

/**
 * Wrapper con lazy loading para el formulario de checkout
 */
export const LazyCheckoutForm = (props: any) => (
  <Suspense fallback={<CartSkeleton />}>
    <CheckoutForm {...props} />
  </Suspense>
)
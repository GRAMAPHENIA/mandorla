"use client"

import { usePreloader } from './usePreloader';

/**
 * Hooks específicos de preloading para componentes de Mandorla
 * Optimizados para el flujo de e-commerce de panadería
 */

// Preloader para productos - se activa al hacer hover en navegación
export function useProductPreloader() {
  return usePreloader(
    'productos',
    () => import('../modules/productos'),
    {
      strategy: 'hover',
      respectNetworkConditions: true,
      respectDeviceMemory: true
    }
  );
}

// Preloader para carrito - se activa cuando el usuario agrega primer item
export function useCartPreloader() {
  return usePreloader(
    'carrito',
    () => import('../modules/carrito'),
    {
      strategy: 'immediate',
      respectNetworkConditions: false, // Carrito es crítico
      respectDeviceMemory: false
    }
  );
}

// Preloader para checkout - se activa al entrar en viewport del carrito
export function useCheckoutPreloader() {
  return usePreloader(
    'checkout',
    () => import('../components/checkout/checkout-form'),
    {
      strategy: 'intersection',
      intersectionOptions: { threshold: 0.3 },
      respectNetworkConditions: true
    }
  );
}

// Preloader para favoritos - se activa con delay después de cargar página
export function useFavoritesPreloader() {
  return usePreloader(
    'favoritos',
    () => import('../components/favorites/favorites-list'),
    {
      strategy: 'delay',
      delay: 3000, // Después de que el usuario explore un poco
      respectNetworkConditions: true
    }
  );
}

// Preloader para formulario de contacto - se activa al hacer scroll hacia abajo
export function useContactPreloader() {
  return usePreloader(
    'contacto',
    () => import('../components/contact/contact-form'),
    {
      strategy: 'intersection',
      intersectionOptions: { threshold: 0.1 },
      respectNetworkConditions: true
    }
  );
}
"use client"

import { useEffect, useRef, useCallback } from 'react';
import { preloader } from '../lib/preloader';

type PreloadStrategy = 'hover' | 'intersection' | 'delay' | 'immediate';

/**
 * Hook para preloading inteligente de componentes en Mandorla
 * Optimizado para el contexto de e-commerce de panadería
 */

interface UsePreloaderOptions {
  strategy?: PreloadStrategy;
  delay?: number;
  intersectionOptions?: IntersectionObserverInit;
  /** Preload solo si el usuario está en una conexión rápida */
  respectNetworkConditions?: boolean;
  /** Preload solo si el dispositivo tiene suficiente memoria */
  respectDeviceMemory?: boolean;
}

export function usePreloader(
  componentName: string,
  loader: () => Promise<any>,
  options: UsePreloaderOptions = {}
) {
  const {
    strategy = 'intersection',
    delay = 2000,
    intersectionOptions = { threshold: 0.1 },
    respectNetworkConditions = true,
    respectDeviceMemory = true
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  const preloadComponent = useCallback(() => {
    // Verificar condiciones de red y dispositivo para optimizar experiencia en Mandorla
    if (respectNetworkConditions && typeof navigator !== 'undefined') {
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return; // No precargar en conexiones lentas
      }
    }

    if (respectDeviceMemory && typeof navigator !== 'undefined') {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory && deviceMemory < 4) {
        return; // No precargar en dispositivos con poca memoria
      }
    }

    preloader.preload(componentName, loader);
  }, [componentName, loader, respectNetworkConditions, respectDeviceMemory]);

  // Preload inmediato
  useEffect(() => {
    if (strategy === 'immediate') {
      preloadComponent();
    }
  }, [strategy, preloadComponent]);

  // Preload con delay
  useEffect(() => {
    if (strategy === 'delay') {
      const timer = setTimeout(preloadComponent, delay);
      return () => clearTimeout(timer);
    }
  }, [strategy, delay, preloadComponent]);

  // Preload en intersection
  useEffect(() => {
    if (strategy === 'intersection' && elementRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadComponent();
              observer.disconnect();
            }
          });
        },
        intersectionOptions
      );

      observer.observe(elementRef.current);

      return () => observer.disconnect();
    }
  }, [strategy, intersectionOptions, preloadComponent]);

  // Props para hover
  const hoverProps = strategy === 'hover' ? {
    onMouseEnter: preloadComponent,
    onFocus: preloadComponent,
  } : {};

  return {
    ref: elementRef,
    isPreloaded: preloader.isPreloaded(componentName),
    preload: preloadComponent,
    ...hoverProps,
  };
}
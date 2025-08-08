/**
 * Configuraciones y utilidades para optimización de bundles
 * Sistema de carga dinámica y preloading inteligente para Mandorla
 */

// Configuración de importaciones dinámicas para componentes pesados
export const dynamicImports = {
  // Componentes de productos
  ProductGrid: () => import('../modules/productos/presentation/ProductGrid'),
  ProductCard: () => import('../modules/productos/presentation/ProductCard'),
  ProductFilters: () => import('../modules/productos/presentation/ProductFilters'),
  
  // Componentes de carrito
  CartItems: () => import('../modules/carrito/presentation/CartItems'),
  CartSummary: () => import('../modules/carrito/presentation/CartSummary'),
  
  // Componentes de checkout
  CheckoutForm: () => import('../components/checkout/checkout-form'),
  
  // Componentes de favoritos
  FavoritesList: () => import('../components/favorites/favorites-list'),
  
  // Componentes de email
  OrderReceived: () => import('../components/emails/order-received'),
};

// Configuración de preloading por prioridad
export const preloadPriorities = {
  critical: [
    'ProductGrid',
    'ProductCard'
  ],
  high: [
    'CartItems',
    'CartSummary'
  ],
  medium: [
    'ProductFilters',
    'CheckoutForm'
  ],
  low: [
    'FavoritesList',
    'OrderReceived'
  ]
};

// Utilidad para cargar componentes por prioridad
export class ComponentLoader {
  private loadedComponents = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadByPriority(priority: keyof typeof preloadPriorities) {
    const components = preloadPriorities[priority];
    const promises = components.map(component => this.loadComponent(component));
    
    try {
      await Promise.all(promises);
      console.log(`✅ Componentes de prioridad ${priority} cargados`);
    } catch (error) {
      console.error(`❌ Error cargando componentes de prioridad ${priority}:`, error);
    }
  }

  async loadComponent(componentName: string): Promise<any> {
    if (this.loadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(componentName)) {
      return this.loadingPromises.get(componentName);
    }

    const importFunction = dynamicImports[componentName as keyof typeof dynamicImports];
    if (!importFunction) {
      throw new Error(`Componente ${componentName} no encontrado en dynamicImports`);
    }

    const loadingPromise = importFunction()
      .then((module) => {
        this.loadedComponents.add(componentName);
        this.loadingPromises.delete(componentName);
        return module;
      })
      .catch((error) => {
        this.loadingPromises.delete(componentName);
        throw error;
      });

    this.loadingPromises.set(componentName, loadingPromise);
    return loadingPromise;
  }

  // Precargar componentes basado en interacciones del usuario
  async preloadOnHover(componentName: string) {
    if (!this.loadedComponents.has(componentName)) {
      try {
        await this.loadComponent(componentName);
        console.log(`🚀 Componente ${componentName} precargado por hover`);
      } catch (error) {
        console.warn(`⚠️ Error precargando ${componentName}:`, error);
      }
    }
  }

  // Precargar componentes críticos al inicio
  async preloadCritical() {
    await this.loadByPriority('critical');
  }

  // Obtener estadísticas de carga
  getLoadingStats() {
    return {
      loaded: this.loadedComponents.size,
      loading: this.loadingPromises.size,
      total: Object.keys(dynamicImports).length,
      loadedComponents: Array.from(this.loadedComponents),
      loadingComponents: Array.from(this.loadingPromises.keys())
    };
  }
}

// Instancia singleton del loader
export const componentLoader = new ComponentLoader();

// Hook para usar el loader en componentes React
export function useComponentLoader() {
  return {
    loadComponent: componentLoader.loadComponent.bind(componentLoader),
    loadByPriority: componentLoader.loadByPriority.bind(componentLoader),
    preloadOnHover: componentLoader.preloadOnHover.bind(componentLoader),
    getStats: componentLoader.getLoadingStats.bind(componentLoader)
  };
}

// Configuración de chunks por módulo para webpack
export const moduleChunks = {
  productos: /[\\/]src[\\/]modules[\\/]productos[\\/]/,
  carrito: /[\\/]src[\\/]modules[\\/]carrito[\\/]/,
  pedidos: /[\\/]src[\\/]modules[\\/]pedidos[\\/]/,
  clientes: /[\\/]src[\\/]modules[\\/]clientes[\\/]/,
  ui: /[\\/]src[\\/]components[\\/]ui[\\/]/,
  emails: /[\\/]src[\\/]components[\\/]emails[\\/]/
};

// Utilidades para análisis de bundle
export const bundleAnalysis = {
  // Detectar importaciones no utilizadas
  detectUnusedImports: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📊 Análisis de importaciones disponible en desarrollo');
    }
  },

  // Reportar tamaño de chunks
  reportChunkSizes: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const stats = componentLoader.getLoadingStats();
      console.table({
        'Componentes Cargados': stats.loaded,
        'Componentes Cargando': stats.loading,
        'Total Componentes': stats.total,
        'Porcentaje Cargado': `${((stats.loaded / stats.total) * 100).toFixed(1)}%`
      });
    }
  }
}; Error cargando componentes de prioridad ${priority}:`, error);
    }
  }

  async loadComponent(componentName: keyof typeof dynamicImports) {
    if (this.loadedComponents.has(componentName)) {
      return;
    }

    if (this.loadingPromises.has(componentName)) {
      return this.loadingPromises.get(componentName);
    }

    const loader = dynamicImports[componentName];
    if (!loader) {
      throw new Error(`Componente ${componentName} no encontrado`);
    }

    const promise = loader().then(module => {
      this.loadedComponents.add(componentName);
      this.loadingPromises.delete(componentName);
      return module;
    });

    this.loadingPromises.set(componentName, promise);
    return promise;
  }

  isLoaded(componentName: string): boolean {
    return this.loadedComponents.has(componentName);
  }

  getLoadedCount(): number {
    return this.loadedComponents.size;
  }

  getTotalCount(): number {
    return Object.keys(dynamicImports).length;
  }
}

// Instancia global del loader
export const componentLoader = new ComponentLoader();

// Utilidades para análisis de performance
export const performanceUtils = {
  measureLoadTime: async (componentName: string, loader: () => Promise<any>) => {
    const startTime = performance.now();
    
    try {
      await loader();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`📊 ${componentName} cargado en ${loadTime.toFixed(2)}ms`);
      return loadTime;
    } catch (error) {
      console.error(`❌ Error cargando ${componentName}:`, error);
      throw error;
    }
  },

  getBundleInfo: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize
      };
    }
    
    return null;
  },

  logBundleStats: () => {
    const info = performanceUtils.getBundleInfo();
    if (info) {
      console.group('📊 Bundle Performance Stats');
      console.log(`DOM Content Loaded: ${info.domContentLoaded.toFixed(2)}ms`);
      console.log(`Load Complete: ${info.loadComplete.toFixed(2)}ms`);
      console.log(`Total Load Time: ${info.totalLoadTime.toFixed(2)}ms`);
      console.log(`Transfer Size: ${(info.transferSize / 1024).toFixed(2)} KB`);
      console.log(`Encoded Size: ${(info.encodedBodySize / 1024).toFixed(2)} KB`);
      console.log(`Decoded Size: ${(info.decodedBodySize / 1024).toFixed(2)} KB`);
      console.groupEnd();
    }
  }
};

// Hook para monitorear performance en desarrollo
export const usePerformanceMonitor = () => {
  if (process.env.NODE_ENV === 'development') {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          performanceUtils.logBundleStats();
        }, 1000);
      });
    }
  }
};
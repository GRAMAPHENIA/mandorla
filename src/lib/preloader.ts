/**
 * Sistema de preloading inteligente para componentes lazy
 */

type PreloadableComponent = () => Promise<any>;

class ComponentPreloader {
  private preloadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  /**
   * Precargar un componente de forma asíncrona
   */
  async preload(componentName: string, loader: PreloadableComponent): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    if (this.preloadPromises.has(componentName)) {
      await this.preloadPromises.get(componentName);
      return;
    }

    const promise = loader().then((module) => {
      this.preloadedComponents.add(componentName);
      this.preloadPromises.delete(componentName);
      return module;
    });

    this.preloadPromises.set(componentName, promise);
    await promise;
  }

  /**
   * Precargar componente cuando el usuario hace hover
   */
  preloadOnHover(componentName: string, loader: PreloadableComponent) {
    return {
      onMouseEnter: () => this.preload(componentName, loader),
      onFocus: () => this.preload(componentName, loader),
    };
  }

  /**
   * Precargar componente cuando entra en el viewport
   */
  preloadOnIntersection(
    componentName: string, 
    loader: PreloadableComponent,
    options: IntersectionObserverInit = {}
  ) {
    return (element: HTMLElement | null) => {
      if (!element || this.preloadedComponents.has(componentName)) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.preload(componentName, loader);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1, ...options }
      );

      observer.observe(element);
    };
  }

  /**
   * Precargar componente después de un delay
   */
  preloadAfterDelay(
    componentName: string, 
    loader: PreloadableComponent, 
    delay: number = 2000
  ) {
    setTimeout(() => {
      this.preload(componentName, loader);
    }, delay);
  }

  /**
   * Verificar si un componente ya está precargado
   */
  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }
}

export const preloader = new ComponentPreloader();

// Funciones de utilidad para preloading
export const preloadProductModule = () => import('../modules/productos');
export const preloadCartModule = () => import('../modules/carrito');
export const preloadCheckoutForm = () => import('../components/checkout/checkout-form');
export const preloadFavoritesList = () => import('../components/favorites/favorites-list');

// Preloaders específicos
export const preloadOnProductHover = preloader.preloadOnHover('products', preloadProductModule);
export const preloadOnCartHover = preloader.preloadOnHover('cart', preloadCartModule);
export const preloadOnCheckoutHover = preloader.preloadOnHover('checkout', preloadCheckoutForm);
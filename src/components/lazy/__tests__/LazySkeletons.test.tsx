import { render, screen } from '@testing-library/react';
import { LazyProductGrid } from '../LazyProductGrid';
import { LazyProductFilters } from '../LazyProductFilters';
import { LazyCartItems } from '../LazyCartItems';
import { LazyCartSummary } from '../LazyCartSummary';

// Mock de los módulos para que no se carguen durante los tests de skeleton
jest.mock('../../modules/productos', () => ({
  ProductGrid: () => null, // No renderizar para testear solo skeleton
  ProductFilters: () => null,
}));

jest.mock('../../modules/carrito', () => ({
  CartItems: () => null,
  CartSummary: () => null,
}));

jest.mock('../../hooks/useMandorlaPreloader', () => ({
  useProductPreloader: () => ({
    ref: { current: null },
    isPreloaded: false,
  }),
}));

describe('Lazy Component Skeletons - Contexto Panadería', () => {
  describe('ProductGrid Skeleton', () => {
    it('debe mostrar skeleton apropiado para productos de panadería', () => {
      render(<LazyProductGrid />);
      
      // Verificar estructura de grid responsive
      const gridContainer = screen.getByRole('generic');
      expect(gridContainer).toHaveClass('space-y-6');
      
      // Verificar que hay skeletons para múltiples productos (panadería típica)
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(8); // Header + 6 productos mínimo
    });

    it('debe tener estructura responsive para diferentes dispositivos', () => {
      render(<LazyProductGrid />);
      
      // Verificar clases responsive de Tailwind
      const container = screen.getByRole('generic');
      expect(container.innerHTML).toContain('sm:grid-cols-2');
      expect(container.innerHTML).toContain('lg:grid-cols-3');
    });
  });

  describe('ProductFilters Skeleton', () => {
    it('debe mostrar skeleton de filtros específicos para panadería', () => {
      render(<LazyProductFilters />);
      
      // Verificar estructura de Card
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(10); // Múltiples secciones de filtros
    });

    it('debe incluir secciones típicas de filtros de panadería', () => {
      render(<LazyProductFilters />);
      
      // Verificar que hay suficientes elementos para:
      // - Categorías (galletas, pasteles, panes, temporada)
      // - Disponibilidad
      // - Precio
      // - Ordenamiento
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(15);
    });
  });

  describe('CartItems Skeleton', () => {
    it('debe mostrar skeleton de items del carrito', () => {
      render(<LazyCartItems />);
      
      // Verificar que se muestran 3 items de ejemplo
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(12); // 3 items × 4+ elementos cada uno
    });

    it('debe tener estructura apropiada para productos de panadería', () => {
      render(<LazyCartItems />);
      
      // Verificar que incluye espacio para:
      // - Imagen del producto
      // - Nombre y descripción
      // - Controles de cantidad
      // - Precio
      const container = screen.getByRole('generic');
      expect(container.innerHTML).toContain('w-20 h-20'); // Imagen cuadrada
      expect(container.innerHTML).toContain('space-x-4'); // Espaciado horizontal
    });
  });

  describe('CartSummary Skeleton', () => {
    it('debe mostrar skeleton del resumen del carrito', () => {
      render(<LazyCartSummary />);
      
      // Verificar estructura de Card con header y content
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(5); // Header + múltiples líneas de resumen
    });

    it('debe incluir elementos típicos del resumen de compra', () => {
      render(<LazyCartSummary />);
      
      // Verificar que hay elementos para:
      // - Subtotal
      // - Envío
      // - Total
      // - Botón de checkout
      const container = screen.getByRole('generic');
      expect(container.innerHTML).toContain('justify-between'); // Líneas de precio
      expect(container.innerHTML).toContain('h-12 w-full'); // Botón de checkout
    });
  });

  describe('Consistencia Visual', () => {
    it('debe usar componentes UI consistentes en todos los skeletons', () => {
      const { container: gridContainer } = render(<LazyProductGrid />);
      const { container: filtersContainer } = render(<LazyProductFilters />);
      const { container: itemsContainer } = render(<LazyCartItems />);
      const { container: summaryContainer } = render(<LazyCartSummary />);

      // Verificar que todos usan clases de Tailwind consistentes
      [gridContainer, filtersContainer, itemsContainer, summaryContainer].forEach(container => {
        expect(container.innerHTML).toContain('space-y'); // Espaciado vertical consistente
      });
    });

    it('debe mantener proporciones apropiadas para productos de panadería', () => {
      render(<LazyProductGrid />);
      
      // Verificar que las imágenes de productos son cuadradas (típico para productos de panadería)
      const container = screen.getByRole('generic');
      expect(container.innerHTML).toContain('aspect-square');
    });
  });

  describe('Accesibilidad en Skeletons', () => {
    it('debe tener estructura semántica apropiada', () => {
      render(<LazyProductFilters />);
      
      // Los skeletons no deben interferir con lectores de pantalla
      const skeletons = screen.getAllByRole('generic');
      skeletons.forEach(skeleton => {
        // Verificar que no tienen contenido textual que confunda
        expect(skeleton.textContent).toBe('');
      });
    });

    it('debe proporcionar indicación visual de carga', () => {
      render(<LazyCartSummary />);
      
      // Verificar que los skeletons son visualmente distinguibles
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
import { render, screen } from '@testing-library/react';
import { useProductPreloader } from '../../hooks/useMandorlaPreloader';
import { LazyProductGrid } from '../LazyProductGrid';

// Mock del hook de preloader
jest.mock('../../hooks/useMandorlaPreloader');
const mockUseProductPreloader = useProductPreloader as jest.MockedFunction<typeof useProductPreloader>;

// Mock del módulo de productos
jest.mock('../../modules/productos', () => ({
  ProductGrid: () => <div data-testid="product-grid">Grid de Productos Cargado</div>,
}));

describe('Lazy Preloading Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar indicador de precarga en desarrollo cuando está precargado', () => {
    // Configurar NODE_ENV para desarrollo
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    mockUseProductPreloader.mockReturnValue({
      ref: { current: null },
      isPreloaded: true,
    });

    render(<LazyProductGrid />);

    // Verificar que se muestra el indicador de precarga
    expect(screen.getByText('Productos precargados ✓')).toBeInTheDocument();

    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('no debe mostrar indicador de precarga en producción', () => {
    // Configurar NODE_ENV para producción
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    mockUseProductPreloader.mockReturnValue({
      ref: { current: null },
      isPreloaded: true,
    });

    render(<LazyProductGrid />);

    // Verificar que NO se muestra el indicador
    expect(screen.queryByText('Productos precargados ✓')).not.toBeInTheDocument();

    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('debe usar el ref del preloader correctamente', () => {
    const mockRef = { current: null };
    mockUseProductPreloader.mockReturnValue({
      ref: mockRef,
      isPreloaded: false,
    });

    const { container } = render(<LazyProductGrid />);

    // Verificar que el componente tiene la estructura esperada
    expect(container.firstChild).toBeInTheDocument();
  });

  it('debe manejar estados de preloader correctamente', () => {
    // Test con preloader no cargado
    mockUseProductPreloader.mockReturnValue({
      ref: { current: null },
      isPreloaded: false,
    });

    const { rerender } = render(<LazyProductGrid />);

    // Test con preloader cargado
    mockUseProductPreloader.mockReturnValue({
      ref: { current: null },
      isPreloaded: true,
    });

    rerender(<LazyProductGrid />);

    // Ambos estados deben renderizar sin errores
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
  });
});
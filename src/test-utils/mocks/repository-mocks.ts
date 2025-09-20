import type { IProductoRepository } from '@/modules/productos/domain/repositories/producto-repository.interface';
import type { ICarritoRepository } from '@/modules/carrito/domain/repositories/carrito-repository.interface';
import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente-repository.interface';
import type { IPedidoRepository } from '@/modules/pedidos/domain/repositories/pedido-repository.interface';

/**
 * Mock del repositorio de productos
 */
export const createMockProductoRepository = (): jest.Mocked<IProductoRepository> => ({
  obtenerPorId: jest.fn(),
  obtenerTodos: jest.fn(),
  buscarPorCategoria: jest.fn(),
  buscarPorNombre: jest.fn(),
  guardar: jest.fn(),
  eliminar: jest.fn(),
  existeConNombre: jest.fn(),
  obtenerDisponibles: jest.fn(),
});

/**
 * Mock del repositorio de carrito
 */
export const createMockCarritoRepository = (): jest.Mocked<ICarritoRepository> => ({
  obtenerPorId: jest.fn(),
  guardar: jest.fn(),
  eliminar: jest.fn(),
  obtenerPorClienteId: jest.fn(),
  limpiar: jest.fn(),
});

/**
 * Mock del repositorio de clientes
 */
export const createMockClienteRepository = (): jest.Mocked<IClienteRepository> => ({
  obtenerPorId: jest.fn(),
  obtenerPorEmail: jest.fn(),
  obtenerTodos: jest.fn(),
  guardar: jest.fn(),
  eliminar: jest.fn(),
  existeConEmail: jest.fn(),
});

/**
 * Mock del repositorio de pedidos
 */
export const createMockPedidoRepository = (): jest.Mocked<IPedidoRepository> => ({
  obtenerPorId: jest.fn(),
  obtenerPorClienteId: jest.fn(),
  obtenerTodos: jest.fn(),
  guardar: jest.fn(),
  eliminar: jest.fn(),
  obtenerPorEstado: jest.fn(),
  obtenerPorFecha: jest.fn(),
});

/**
 * Configuración común para mocks de repositorios
 */
export const setupRepositoryMocks = () => {
  const productoRepository = createMockProductoRepository();
  const carritoRepository = createMockCarritoRepository();
  const clienteRepository = createMockClienteRepository();
  const pedidoRepository = createMockPedidoRepository();

  return {
    productoRepository,
    carritoRepository,
    clienteRepository,
    pedidoRepository,
  };
};

/**
 * Reset de todos los mocks de repositorios
 */
export const resetRepositoryMocks = (mocks: ReturnType<typeof setupRepositoryMocks>) => {
  Object.values(mocks).forEach(mock => {
    Object.values(mock).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
};

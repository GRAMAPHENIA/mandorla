import '@testing-library/jest-dom';
import React from 'react';

// Mock de fetch global para tests
global.fetch = jest.fn();

// Mock de console para evitar logs en tests
const originalConsole = { ...console };

beforeEach(() => {
  // Silenciar console.log, console.warn, etc. durante tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restaurar console después de cada test
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;

  // Limpiar todos los mocks
  jest.clearAllMocks();
});

// Mock de localStorage para tests del navegador
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
} as any;

// Mock de Date para tests determinísticos
const mockDate = new Date('2024-01-15T10:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
Date.now = jest.fn(() => mockDate.getTime());

// Helpers para tests de checkout
export const createMockCheckoutData = () => ({
  clienteId: 'cliente-test-123',
  carritoId: 'carrito-test-456',
  metodoPago: 'tarjeta_credito' as const,
  datosEntrega: {
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    codigoPostal: '1043',
    telefono: '+54911234567',
    instrucciones: 'Timbre 2B',
  },
  datosPago: {
    numeroTarjeta: '4111111111111111',
    vencimiento: '12/25',
    cvv: '123',
    titular: 'Juan Pérez',
  },
});

export const createMockCarrito = () => ({
  id: 'carrito-test-456',
  clienteId: 'cliente-test-123',
  items: [
    {
      productoId: 'prod-croissants',
      nombre: 'Croissants de Mantequilla',
      cantidad: 2,
      precioUnitario: 1500,
      subtotal: 3000,
    },
    {
      productoId: 'prod-pan-integral',
      nombre: 'Pan Integral',
      cantidad: 1,
      precioUnitario: 2500,
      subtotal: 2500,
    },
  ],
  subtotal: 5500,
  descuentos: 0,
  impuestos: 440,
  total: 5940,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
});

export const createMockCliente = () => ({
  id: 'cliente-test-123',
  nombre: 'Juan Pérez',
  email: 'juan.perez@email.com',
  telefono: '+54911234567',
  esVip: false,
  fechaRegistro: new Date(),
});

export const createMockPedido = () => ({
  id: 'pedido-test-789',
  clienteId: 'cliente-test-123',
  items: createMockCarrito().items,
  total: 5940,
  estado: 'PENDIENTE_PAGO' as const,
  datosEntrega: createMockCheckoutData().datosEntrega,
  fechaCreacion: new Date(),
});

export const createMockPago = () => ({
  id: 'pago-test-101',
  pedidoId: 'pedido-test-789',
  monto: 5940,
  metodoPago: 'tarjeta_credito' as const,
  estado: 'aprobado' as const,
  transaccionId: 'mp-test-12345',
  fechaProcesamiento: new Date(),
});

// Mock de servicios comunes para tests
export const createMockServices = () => ({
  carritoService: {
    obtenerCarrito: jest.fn().mockResolvedValue(createMockCarrito()),
    validarDisponibilidad: jest.fn().mockResolvedValue(true),
    calcularTotal: jest.fn().mockResolvedValue({
      subtotal: 5500,
      descuentos: 0,
      impuestos: 440,
      total: 5940,
    }),
    limpiarCarrito: jest.fn().mockResolvedValue(undefined),
  },

  clienteService: {
    obtenerCliente: jest.fn().mockResolvedValue(createMockCliente()),
    validarDatosEntrega: jest.fn().mockResolvedValue(true),
    crearClienteInvitado: jest.fn().mockResolvedValue({
      id: 'cliente-invitado-456',
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      telefono: '+54911987654',
      esInvitado: true,
    }),
  },

  pedidoService: {
    crearPedido: jest.fn().mockResolvedValue(createMockPedido()),
    actualizarEstado: jest.fn().mockResolvedValue(undefined),
    cancelarPedido: jest.fn().mockResolvedValue(undefined),
  },

  pagoService: {
    procesarPago: jest.fn().mockResolvedValue(createMockPago()),
    confirmarPago: jest.fn().mockResolvedValue(undefined),
    cancelarPago: jest.fn().mockResolvedValue(undefined),
  },
});

// Utilidades para assertions comunes
export const expectCheckoutSuccess = (resultado: any) => {
  expect(resultado.success).toBe(true);
  expect(resultado.data).toBeDefined();
  expect(resultado.error).toBeUndefined();
};

export const expectCheckoutError = (resultado: any, expectedCode?: string) => {
  expect(resultado.success).toBe(false);
  expect(resultado.error).toBeDefined();
  expect(resultado.data).toBeUndefined();

  if (expectedCode) {
    expect(resultado.error.code).toBe(expectedCode);
  }
};

// Mock de React Router para tests de componentes
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
    route: '/',
  }),
}));

// Mock de Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt });
  },
}));

// Mock de toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Configuración global para timeouts de tests
jest.setTimeout(10000);

// Configurar timezone para tests consistentes
process.env.TZ = 'UTC';

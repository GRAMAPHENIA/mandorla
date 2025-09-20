import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Wrapper personalizado para tests de componentes React
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
};

/**
 * Función de render personalizada que incluye providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar todo de testing-library
export * from '@testing-library/react';

// Sobrescribir render method
export { customRender as render };

/**
 * Utilidades para testing de errores
 */
export const expectToThrow = async (
  fn: () => Promise<any> | any,
  errorClass?: new (...args: any[]) => Error
) => {
  try {
    await fn();
    throw new Error('Se esperaba que la función lanzara un error');
  } catch (error) {
    if (errorClass) {
      expect(error).toBeInstanceOf(errorClass);
    }
    return error;
  }
};

/**
 * Utilidades para testing de async/await
 */
export const waitForAsync = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock de console methods para tests más limpios
 */
export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

/**
 * Utilidades para testing de localStorage
 */
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

/**
 * Utilidades para testing de fetch
 */
export const mockFetch = (response: any, ok: boolean = true) => {
  const mockResponse = {
    ok,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  };

  global.fetch = jest.fn().mockResolvedValue(mockResponse);

  return { fetch: global.fetch, response: mockResponse };
};

/**
 * Matcher personalizado para errores de dominio
 */
expect.extend({
  toBeValidationError(received, expectedMessage?: string) {
    const pass =
      received.name.includes('Error') &&
      received.message &&
      (!expectedMessage || received.message.includes(expectedMessage));

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a validation error`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to be a validation error${
            expectedMessage ? ` with message containing "${expectedMessage}"` : ''
          }`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidationError(expectedMessage?: string): R;
    }
  }
}

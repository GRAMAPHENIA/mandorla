const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Proporciona la ruta a tu aplicación Next.js para cargar next.config.js y archivos .env
  dir: './',
})

// Configuración personalizada de Jest
const customJestConfig = {
  // Configuración para tests de componentes React
  testEnvironment: 'jsdom',
  
  // Archivos de configuración
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Directorios donde buscar tests
  roots: ['<rootDir>/src'],
  
  // Patrones de archivos de test
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Mapeo de módulos para alias de rutas
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  
  // Archivos para cobertura de código
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  
  // Directorio de salida para reportes de cobertura
  coverageDirectory: 'coverage',
  
  // Formatos de reporte de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Ignorar archivos específicos
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
  
  // Variables de entorno para tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
}

// Exportar configuración de Jest creada por Next.js
module.exports = createJestConfig(customJestConfig)
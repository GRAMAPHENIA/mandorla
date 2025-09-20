module.exports = {
  displayName: 'Checkout Module Tests',
  testMatch: [
    '<rootDir>/src/modules/checkout/__tests__/**/*.test.ts',
    '<rootDir>/src/modules/checkout/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/modules/checkout/**/*.{ts,tsx}',
    '!src/modules/checkout/**/*.d.ts',
    '!src/modules/checkout/**/__tests__/**',
    '!src/modules/checkout/**/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/checkout',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/modules/checkout/__tests__/setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }
  },
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/tests/**'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  // Improve test isolation
  maxWorkers: 1, // Run tests sequentially to prevent interference
  testSequencer: '<rootDir>/testSequencer.js', // Custom test sequencer for better isolation
  moduleNameMapper: {
    '^modules/(.*)$': '<rootDir>/modules/$1', // Map new modules facade
    '^modules/pure/(.*)$': '<rootDir>/modules/pure/$1.ts' // Map Pure modules to TS re-exports
  }
};
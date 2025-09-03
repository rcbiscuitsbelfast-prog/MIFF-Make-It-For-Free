/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: { 
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/miff/**/*.test.ts',
    '<rootDir>/games/**/*.test.ts',
    '<rootDir>/games/**/*.spec.ts'
  ],
  testTimeout: 30000,
  cache: false,
  maxWorkers: 1, // Force single worker to avoid worker issues
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'miff/**/*.{ts,tsx}',
    'games/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};
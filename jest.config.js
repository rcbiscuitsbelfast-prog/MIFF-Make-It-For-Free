/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: { '^.+\\.(ts|tsx)$': 'esbuild-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/miff/**/*.test.ts',
    '<rootDir>/games/**/*.test.ts',
    '<rootDir>/games/**/*.spec.ts'
  ],
  testTimeout: 10000,
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
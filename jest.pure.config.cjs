/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Run in-band with a single worker to avoid jest-worker IPC incompatibilities
  maxWorkers: 1,
  runInBand: true,
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
    '<rootDir>/miff/pure/**/tests/**/*.test.ts',
    '<rootDir>/src/modules/**/tests/**/*.test.ts'
  ],
  cache: false,
  testTimeout: 15000
};



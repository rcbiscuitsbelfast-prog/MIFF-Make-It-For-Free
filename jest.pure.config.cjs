/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Limit concurrency to avoid worker IPC incompatibilities
  maxWorkers: 1,
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'miff/pure/**/*.ts',
    '!miff/pure/**/tests/**',
    '!miff/pure/**/cliHarness.ts'
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 18,
      functions: 22,
      lines: 22,
      statements: 22
    },
    './miff/pure/PathfindingPure/**/*.ts': {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './miff/pure/TouchGesturePure/**/*.ts': {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './miff/pure/BridgeSchemaPure/**/*.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
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



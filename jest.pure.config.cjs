/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
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
    },
    './miff/pure/TeamsPure/**/*.ts': {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@babel)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/miff/pure/**/tests/**/*.test.ts',
    '<rootDir>/src/modules/**/tests/**/*.test.ts'
  ],
  cache: false,
  testTimeout: 15000
};



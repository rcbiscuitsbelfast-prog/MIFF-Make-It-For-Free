module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/miff/pure'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/Manager.test.ts',
    '**/Manager.spec.ts',
    '**/index.test.ts',
    '**/capabilities.test.ts',
    '**/cliHarness.test.ts'
  ],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'miff/pure/**/*.ts',
    '!miff/pure/**/*.d.ts',
    '!miff/pure/**/tests/**',
    '!miff/pure/**/test/**',
    '!miff/pure/**/*.test.ts',
    '!miff/pure/**/*.spec.ts',
    '!miff/pure/**/cliHarness.ts',
    '!miff/pure/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  },
  maxWorkers: 2,
  collectCoverage: true,
  cache: false,
  testTimeout: 30000,
  verbose: false,
  bail: false,
  forceExit: true,
  detectOpenHandles: false,
  detectLeaks: false,
  fakeTimers: { enableGlobally: true },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.cjs']
};
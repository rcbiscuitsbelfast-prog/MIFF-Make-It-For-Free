module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/miff/pure'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'miff/pure/**/*.ts',
    '!miff/pure/**/*.d.ts',
    '!miff/pure/**/tests/**',
    '!miff/pure/**/test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    './miff/pure/TeamsPure/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './miff/pure/BattleAIPure/': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  maxWorkers: '50%',
  collectCoverage: false,
  cache: true,
  testTimeout: 15000,
  verbose: true,
  bail: false,
  forceExit: false,
  detectOpenHandles: false,
  detectLeaks: false,
  fakeTimers: { enableGlobally: true },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.cjs']
};
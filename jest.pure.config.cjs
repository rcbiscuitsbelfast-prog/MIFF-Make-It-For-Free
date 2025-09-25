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
  coverageReporters: ['text', 'lcov', 'html'],
  maxWorkers: '50%',
  collectCoverage: false,
  cache: true,
  testTimeout: 15000,
  verbose: true,
  bail: false,
  forceExit: true,
  detectOpenHandles: true,
  detectLeaks: true
};
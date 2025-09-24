/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Optimize for speed - use more workers and disable coverage during development
  maxWorkers: '50%',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'miff/pure/**/*.ts',
    '!miff/pure/**/tests/**',
    '!miff/pure/**/cliHarness.ts'
  ],
  collectCoverage: false, // Disable coverage for faster test runs
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 65,
      statements: 65
    },
    './miff/pure/PathfindingPure/**/*.ts': {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './miff/pure/TouchGesturePure/**/*.ts': {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './miff/pure/BridgeSchemaPure/**/*.ts': {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    },
    './miff/pure/TeamsPure/**/*.ts': {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    },
    './miff/pure/FusionPure/**/*.ts': {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    },
    './miff/pure/ProgressionPure/**/*.ts': {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './miff/pure/EvolutionPure/**/*.ts': {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    },
    './miff/pure/EffectsPure/**/*.ts': {
      branches: 30,
      functions: 35,
      lines: 35,
      statements: 35
    },
    './miff/pure/ItemsPure/**/*.ts': {
      branches: 50,
      functions: 55,
      lines: 55,
      statements: 55
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
  cache: true, // Enable caching for faster subsequent runs
  testTimeout: 10000 // Reduce timeout for faster failure detection
};



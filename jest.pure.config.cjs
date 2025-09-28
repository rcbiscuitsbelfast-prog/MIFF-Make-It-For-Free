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
      branches: 50,
      functions: 55,
      lines: 60,
      statements: 60
    },
    './miff/pure/TeamsPure/': {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    },
    './miff/pure/CombatPure/': {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    },
    './miff/pure/ItemsPure/': {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    },
    './miff/pure/UnrealBridgePure/': {
      branches: 50,
      functions: 55,
      lines: 60,
      statements: 60
    },
    './miff/pure/SceneBuilderPure/': {
      branches: 50,
      functions: 55,
      lines: 60,
      statements: 60
    },
    './miff/pure/BattleAIPure/': {
      branches: 50,
      functions: 55,
      lines: 60,
      statements: 60
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
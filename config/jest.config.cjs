/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // Use babel-jest for TypeScript support
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@babel|canvas)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/miff/pure/**/tests/**/*.test.ts',
    '<rootDir>/**/tests/**/*.test.ts',
    '<rootDir>/*.test.js',
    '<rootDir>/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/miff/pure/AvatarRendererWebPure/tests',
    '<rootDir>/miff/pure/AvatarRendererGodotPure/tests',
    '<rootDir>/miff/pure/AvatarSystemPure/tests/performance.test.ts'
  ],
  cache: false,
  testTimeout: 15000,
  collectCoverageFrom: [
    'miff/pure/**/*.ts',
    '!miff/pure/**/tests/**',
    '!miff/pure/**/cliHarness.ts'
  ]
};
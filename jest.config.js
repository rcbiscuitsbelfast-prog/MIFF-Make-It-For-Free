/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  projects: [
    {
      displayName: 'dom-tests',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['./jest.setup.js'],
      transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      testMatch: [
        '<rootDir>/src/modules/PlatformBridgePure/**/*.test.ts',
        '<rootDir>/miff/pure/DialoguePure/**/*.test.ts',
        '<rootDir>/games/**/*.spec.ts',
        '<rootDir>/games/**/*.test.ts'
      ]
    },
    {
      displayName: 'node-tests',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['./jest.setup.js'],
      transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      testMatch: [
        '<rootDir>/miff/pure/**/*.test.ts',
        '<rootDir>/src/modules/**/*.test.ts',
        '<rootDir>/src/modules/**/*.spec.ts'
      ]
    }
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
/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'node-tests',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['./jest.setup.js'],
      transform: { '^.+\\.(ts|tsx)$': 'esbuild-jest' },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      testMatch: [
        '<rootDir>/miff/**/*.test.ts',
        '<rootDir>/tests/**/*.test.ts'
      ],
      cache: false
    },
    {
      displayName: 'dom-tests',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['./jest.setup.js'],
      transform: { '^.+\\.(ts|tsx)$': 'esbuild-jest' },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      testMatch: [
        '<rootDir>/src/**/*.test.ts',
        '<rootDir>/games/**/*.test.ts'
      ],
      cache: false,
      testEnvironmentOptions: { url: 'http://localhost' }
    }
  ]
};
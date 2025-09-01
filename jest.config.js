/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/miff/pure/**/*.test.ts',
    '<rootDir>/miff/pure/**/*.spec.ts',
    '<rootDir>/miff/pure/**/*.golden.test.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/games/**/*.test.ts',
    '<rootDir>/games/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'esbuild-jest',
    '^.+\\.tsx$': 'esbuild-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/miff-nextjs/src/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  cache: false,
  maxWorkers: 1
};
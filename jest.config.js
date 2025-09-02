/** @type {import('jest').Config} */
module.exports = {
<<<<<<< HEAD
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
=======
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
	// Global test configuration
	testTimeout: 10000,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'miff/**/*.{ts,tsx}',
		'games/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**'
	],
	// Ensure proper test isolation
	testEnvironmentOptions: {
		url: 'http://localhost'
	}
>>>>>>> cursor/golden-scenario-validation-fix
};
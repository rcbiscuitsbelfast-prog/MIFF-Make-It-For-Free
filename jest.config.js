/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	projects: [
		{
			displayName: 'dom-tests',
			testEnvironment: 'jsdom',
			testMatch: [
				'<rootDir>/miff/pure/PlatformBridgePure/**/*.test.ts',
				'<rootDir>/miff/pure/DialoguePure/**/*.test.ts',
				'<rootDir>/games/**/*.test.ts',
				'<rootDir>/zones/**/*.test.ts',
			],
			setupFilesAfterEnv: ['<rootDir>/jest.setup.dom.js'],
			transform: {
				'^.+\\.(ts|tsx)$': 'ts-jest'
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
		},
		{
			displayName: 'node-tests',
			testEnvironment: 'node',
			testMatch: [
				'<rootDir>/miff/pure/**/*.test.ts',
				'<rootDir>/src/modules/**/*.test.ts',
				'<rootDir>/**/*.golden.test.ts',
			],
			setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
			transform: {
				'^.+\\.(ts|tsx)$': 'ts-jest'
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
		},
	],
	setupFilesAfterEnv: ['./jest.setup.js'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testMatch: [
		'**/?(*.)+(test|spec).ts',
		'**/?(*.)+(test|spec).tsx',
		'**/*.golden.test.ts',
		'**/*.golden.test.tsx'
	]
};
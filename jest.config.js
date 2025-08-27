/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
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
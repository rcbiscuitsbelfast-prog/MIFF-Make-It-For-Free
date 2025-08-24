const path = require('path');
const { execFileSync } = require('child_process');

function runCLI(cliPath, args = []) {
	const absCliPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
	const output = execFileSync('npx', [
		'ts-node',
		'--compiler-options', '{"module":"commonjs","types":["node"]}',
		absCliPath,
		...args
	], { encoding: 'utf-8' });
	return output;
}

global.testUtils = {
	runCLI
};
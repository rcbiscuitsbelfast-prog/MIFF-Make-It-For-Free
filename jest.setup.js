const path = require('path');
const { execFileSync } = require('child_process');

// Setup canvas for jsdom tests
if (typeof window !== 'undefined') {
  // This will run in jsdom environment
  const { createCanvas } = require('canvas');
  
  // Mock HTMLCanvasElement.prototype.getContext
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, attributes) {
    if (type === '2d') {
      const canvas = createCanvas(this.width, this.height);
      return canvas.getContext('2d');
    }
    return originalGetContext.call(this, type, attributes);
  };
}

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
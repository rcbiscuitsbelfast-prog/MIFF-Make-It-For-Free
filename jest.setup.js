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
	
	console.log(`[runCLI] Starting CLI execution: ${absCliPath}`);
	console.log(`[runCLI] Args: ${JSON.stringify(args)}`);
	
	try {
		const output = execFileSync('npx', [
			'ts-node',
			'--compiler-options', '{"module":"commonjs","types":["node"]}',
			absCliPath,
			...args
		], { 
			encoding: 'utf-8',
			timeout: 15000, // 15 second timeout to prevent hanging
			killSignal: 'SIGTERM'
		});
		
		console.log(`[runCLI] CLI execution completed successfully`);
		console.log(`[runCLI] Output length: ${output.length} characters`);
		
		// Flush any pending hooks
		if (typeof setImmediate !== 'undefined') {
			setImmediate(() => {
				console.log(`[runCLI] Pending hooks flushed`);
			}).unref();
		}
		
		return output;
	} catch (error) {
		console.error(`[runCLI] CLI execution failed:`, error.message);
		console.log(`[runCLI] Teardown status: ERROR - process may have leaked resources`);
		throw error;
	} finally {
		console.log(`[runCLI] Teardown status: COMPLETED`);
	}
}

global.testUtils = {
	runCLI
};
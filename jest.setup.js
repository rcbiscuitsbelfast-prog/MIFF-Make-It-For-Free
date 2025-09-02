const path = require('path');
const { execFileSync } = require('child_process');

// Setup canvas for jsdom tests
if (typeof window !== 'undefined') {
  // Provide a minimal 2D/WebGL context stub for jsdom
  const twoDContext = {
    clearRect: () => {},
    fillRect: () => {},
    setTransform: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    createImageData: () => new Uint8ClampedArray(4),
    measureText: () => ({ width: 0 }),
    fillStyle: '#000',
    strokeStyle: '#000',
    font: ''
  };

  const webglContext = {};

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, attributes) {
    if (type === '2d') return twoDContext;
    if (type === 'webgl' || type === 'webgl2') return webglContext;
    return originalGetContext ? originalGetContext.call(this, type, attributes) : null;
  };
}

// Minimal DialogueParser stub for DialoguePure tests
global.DialogueParser = {
  parse: () => ({
    nodes: [{ id: 'root', content: 'Hello', choices: [] }],
    start: 'root'
  }),
  parseCELScript: () => ({ type: 'condition' }),
  destroy: () => {}
};

// NetworkBridge transport mock with clean teardown
global.mockTransport = {
  connect: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue(undefined),
  onMessage: jest.fn().mockImplementation((cb) => {
    // Return an unsubscribe that does nothing to avoid lingering listeners
    return () => {};
  }),
  disconnect: jest.fn().mockResolvedValue(undefined)
};

// Global teardown guard
if (typeof afterEach === 'function') {
  afterEach(() => {
    if (typeof jest !== 'undefined' && jest.clearAllTimers) {
      jest.clearAllTimers();
    }
    // Reset transport mocks
    if (global.mockTransport) {
      Object.values(global.mockTransport).forEach((fn) => {
        if (fn && typeof fn.mockClear === 'function') fn.mockClear();
      });
    }
    // Flush microtasks/hooks
    if (typeof setImmediate !== 'undefined') {
      setImmediate(() => {}).unref?.();
    }
    // Hint GC in environments that expose it
    if (global.gc) {
      try { global.gc(); } catch (_) {}
    }
  });
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
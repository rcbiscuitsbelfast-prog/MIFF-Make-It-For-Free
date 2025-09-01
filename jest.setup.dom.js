// Jest setup for DOM tests with canvas mocking
// This prevents "Not implemented" errors for canvas operations in jsdom

// Mock HTMLCanvasElement.prototype.getContext
if (typeof HTMLCanvasElement !== 'undefined') {
	HTMLCanvasElement.prototype.getContext = function(type, attributes) {
		if (type === '2d') {
			return {
				fillRect: jest.fn(),
				clearRect: jest.fn(),
				getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
				putImageData: jest.fn(),
				createImageData: jest.fn(() => new ImageData(1, 1)),
				setTransform: jest.fn(),
				drawImage: jest.fn(),
				save: jest.fn(),
				fillText: jest.fn(),
				restore: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				closePath: jest.fn(),
				stroke: jest.fn(),
				translate: jest.fn(),
				scale: jest.fn(),
				rotate: jest.fn(),
				arc: jest.fn(),
				fill: jest.fn(),
				measureText: jest.fn(() => ({ width: 0, height: 0 })),
				strokeText: jest.fn(),
				createLinearGradient: jest.fn(() => ({
					addColorStop: jest.fn(),
				})),
				createRadialGradient: jest.fn(() => ({
					addColorStop: jest.fn(),
				})),
				createPattern: jest.fn(),
				clip: jest.fn(),
				quadraticCurveTo: jest.fn(),
				bezierCurveTo: jest.fn(),
				rect: jest.fn(),
				roundRect: jest.fn(),
				ellipse: jest.fn(),
				shadowBlur: 0,
				shadowColor: 'black',
				shadowOffsetX: 0,
				shadowOffsetY: 0,
				lineWidth: 1,
				lineCap: 'butt',
				lineJoin: 'miter',
				miterLimit: 10,
				font: '10px sans-serif',
				textAlign: 'start',
				textBaseline: 'alphabetic',
				fillStyle: 'black',
				strokeStyle: 'black',
				globalAlpha: 1,
				globalCompositeOperation: 'source-over',
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'low',
			};
		}
		// Return null for other context types
		return null;
	};

	// Mock canvas dimensions
	Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
		writable: true,
		value: 800,
	});
	Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
		writable: true,
		value: 600,
	});
}

// Mock requestAnimationFrame for smooth animation tests
global.requestAnimationFrame = jest.fn((callback) => {
	return setTimeout(callback, 16); // ~60 FPS
});

global.cancelAnimationFrame = jest.fn((id) => {
	clearTimeout(id);
});

// Mock ResizeObserver for layout tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Mock IntersectionObserver for visibility tests
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Mock Performance API
global.performance = {
	now: jest.fn(() => Date.now()),
	getEntriesByType: jest.fn(() => []),
	mark: jest.fn(),
	measure: jest.fn(),
};

// Mock WebGL context if needed
if (typeof WebGLRenderingContext !== 'undefined') {
	WebGLRenderingContext.prototype.getExtension = jest.fn(() => null);
	WebGLRenderingContext.prototype.getParameter = jest.fn(() => 0);
}
/**
 * Mock Browser APIs
 * 
 * Provides mock implementations for browser API functionality
 * in MIFF tests.
 */

export const mockBrowserAPIs = {
  requestAnimationFrame: jest.fn().mockReturnValue(1),
  cancelAnimationFrame: jest.fn(),
  ResizeObserver: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })),
  IntersectionObserver: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })),
  performance: {
    now: jest.fn().mockReturnValue(Date.now())
  },
  WebGLRenderingContext: jest.fn().mockImplementation(() => ({
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    getAttribLocation: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    drawArrays: jest.fn()
  }))
};
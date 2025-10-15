/**
 * Mock Platform Bridge
 * 
 * Provides mock implementations for platform bridge functionality
 * in MIFF tests.
 */

export const mockPlatformBridge = {
  platform: 'web',
  capabilities: ['canvas2d', 'webgl'],
  createCanvas: jest.fn().mockReturnValue({
    getContext: jest.fn().mockReturnValue({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
      putImageData: jest.fn(),
      createImageData: jest.fn().mockReturnValue(new Uint8ClampedArray(4)),
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
      measureText: jest.fn().mockReturnValue({ width: 0 })
    })
  })
};
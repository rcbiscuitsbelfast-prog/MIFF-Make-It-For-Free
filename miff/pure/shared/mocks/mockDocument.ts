/**
 * Mock Document
 * 
 * Provides mock implementations for document functionality
 * in MIFF tests.
 */

import { mockCanvas } from './mockCanvas';

const mockHTMLElements = {
  createElement: jest.fn().mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    return {
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };
  }),
  querySelector: jest.fn().mockReturnValue(mockCanvas),
  querySelectorAll: jest.fn().mockReturnValue([mockCanvas])
};

export const mockDocument = {
  ...mockHTMLElements,
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  head: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  title: 'Test Document',
  createTextNode: jest.fn().mockReturnValue({ textContent: 'test' })
};
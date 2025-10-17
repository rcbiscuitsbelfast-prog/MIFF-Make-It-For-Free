/**
 * Mock Window
 * 
 * Provides mock implementations for window functionality
 * in MIFF tests.
 */

import { mockBrowserAPIs } from './mockBrowserAPIs';

export const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  requestAnimationFrame: mockBrowserAPIs.requestAnimationFrame,
  cancelAnimationFrame: mockBrowserAPIs.cancelAnimationFrame,
  performance: mockBrowserAPIs.performance
};
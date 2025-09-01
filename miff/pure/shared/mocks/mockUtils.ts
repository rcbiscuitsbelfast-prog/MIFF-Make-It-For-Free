/**
 * Mock Utilities
 * 
 * Provides utility functions for setting up and managing mocks
 * in MIFF tests.
 */

import { mockConsole } from './mockConsole';
import { mockProcess } from './mockProcess';
import { mockTimers } from './mockTimers';
import { mockBrowserAPIs } from './mockBrowserAPIs';
import { mockDocument } from './mockDocument';
import { mockWindow } from './mockWindow';
import { mockCanvas } from './mockCanvas';
import { mockDialogueEngine } from './mockDialogueEngine';
import { mockScheduler } from './mockScheduler';

/**
 * Setup global mocks for testing environment
 */
export function setupGlobalMocks(): void {
  // Mock global objects
  (global as any).console = mockConsole;
  (global as any).process = mockProcess;
  
  // Mock timers
  (global as any).setTimeout = mockTimers.setTimeout;
  (global as any).clearTimeout = mockTimers.clearTimeout;
  (global as any).setInterval = mockTimers.setInterval;
  (global as any).clearInterval = mockTimers.clearInterval;
  
  // Mock browser APIs
  (global as any).requestAnimationFrame = mockBrowserAPIs.requestAnimationFrame;
  (global as any).cancelAnimationFrame = mockBrowserAPIs.cancelAnimationFrame;
  (global as any).ResizeObserver = mockBrowserAPIs.ResizeObserver;
  (global as any).IntersectionObserver = mockBrowserAPIs.IntersectionObserver;
  (global as any).performance = mockBrowserAPIs.performance;
  (global as any).WebGLRenderingContext = mockBrowserAPIs.WebGLRenderingContext;
  
  // Mock DOM elements
  (global as any).document = mockDocument;
  (global as any).window = mockWindow;
  
  // Mock HTMLCanvasElement prototype
  if (typeof HTMLCanvasElement !== 'undefined') {
    (HTMLCanvasElement.prototype as any).getContext = mockCanvas.getContext;
  }
}

/**
 * Reset all mocks to initial state
 */
export function resetAllMocks(): void {
  jest.clearAllMocks();
  mockDialogueEngine.flags.clear();
  mockDialogueEngine.flags.add('friendly_reputation');
  mockScheduler.tickCount = 0;
}
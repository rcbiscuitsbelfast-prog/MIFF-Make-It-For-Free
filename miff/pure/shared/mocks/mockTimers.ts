/**
 * Mock Timers
 * 
 * Provides mock implementations for timer functionality
 * in MIFF tests.
 */

export const mockTimers = {
  setTimeout: jest.fn().mockReturnValue(1),
  clearTimeout: jest.fn(),
  setInterval: jest.fn().mockReturnValue(1),
  clearInterval: jest.fn(),
  clearAllTimers: jest.fn()
};
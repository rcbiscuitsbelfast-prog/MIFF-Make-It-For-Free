/**
 * Mock Console
 * 
 * Provides mock implementations for console functionality
 * in MIFF tests.
 */

export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
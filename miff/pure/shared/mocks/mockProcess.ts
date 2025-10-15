/**
 * Mock Process
 * 
 * Provides mock implementations for process functionality
 * in MIFF tests.
 */

export const mockProcess = {
  exit: jest.fn(),
  argv: ['node', 'test.js', 'demo']
};
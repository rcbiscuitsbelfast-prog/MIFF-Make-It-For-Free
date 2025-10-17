/**
 * Mock Network Transport
 * 
 * Provides mock implementations for network transport functionality
 * in MIFF tests.
 */

export const mockTransport = {
  connect: jest.fn().mockReturnValue(Promise.resolve()),
  disconnect: jest.fn().mockReturnValue(Promise.resolve()),
  send: jest.fn().mockReturnValue(Promise.resolve()),
  on: jest.fn(),
  off: jest.fn()
};
/**
 * Mock Event Bus
 * 
 * Provides mock implementations for event bus functionality
 * in MIFF tests.
 */

export const mockEventBus = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  unsubscribe: jest.fn()
};
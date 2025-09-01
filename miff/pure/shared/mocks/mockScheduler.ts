/**
 * Mock Scheduler
 * 
 * Provides mock implementations for scheduler functionality
 * in MIFF tests.
 */

export const mockScheduler = {
  start: jest.fn(),
  stop: jest.fn(),
  tickCount: 0,
  advanceTime: jest.fn().mockImplementation((ms: number) => {
    mockScheduler.tickCount += Math.floor(ms / 80); // 80ms per tick
  })
};
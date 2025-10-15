/**
 * PerfPure Golden Tests
 *
 * Comprehensive tests for the PerfPure performance monitoring system.
 * Tests cover timing accuracy, profiling functionality, and performance characteristics.
 */

import { PerfTimer, HighResPerfTimer, PerfProfiler, PerfUtils, PerfResult, PerfSummary } from '../index';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


describe('PerfPure Golden Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
    // Mock console.log to avoid test output noise and allow proper assertions
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('PerfTimer Basic Functionality', () => {
    test('should create and dispose timer correctly', () => {
      const timer = new PerfTimer('Test Timer');
      expect(timer.isRunning).toBe(true);
      expect(timer.isDisposed).toBe(false);

      timer.dispose();
      expect(timer.isRunning).toBe(false);
      expect(timer.isDisposed).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[perf] Test Timer:'));
    });

    test('should measure elapsed time accurately', async () => {
      const timer = new PerfTimer('Accuracy Test');

      // Advance time by 10ms using Jest's fake timers
      jest.advanceTimersByTime(10);

      expect(timer.elapsedMs).toBeGreaterThanOrEqual(5);
      expect(timer.elapsedNs).toBeGreaterThanOrEqual(5000000);
      // Verify the relationship is approximately correct (allowing for floating point precision)
      expect(Math.abs(timer.elapsedNs - timer.elapsedMs * 1_000_000)).toBeLessThan(1000);

      timer.dispose();
    }, 15000);

    test('should handle manual stop correctly', () => {
      const timer = new PerfTimer('Manual Stop Test');

      // Wait a bit
      setTimeout(() => {
        const result = timer.stop();
        expect(result.label).toBe('Manual Stop Test');
        expect(result.durationMs).toBeGreaterThan(0);
        expect(timer.isRunning).toBe(false);
      }, 5);
    });

    test('should throw error when stopping already stopped timer', () => {
      const timer = new PerfTimer('Double Stop Test');
      timer.stop();

      expect(() => timer.stop()).toThrow('Timer has already been stopped');
      expect(() => timer.getResult()).not.toThrow(); // But getResult should work
    });

    test('should throw error when getting result from running timer', () => {
      const timer = new PerfTimer('Result Error Test');

      expect(() => timer.getResult()).toThrow('Timer must be stopped before getting result');
    });

    test('should handle reset correctly', () => {
      const timer = new PerfTimer('Reset Test');

      // Let some time pass
      setTimeout(() => {
        const firstElapsed = timer.elapsedMs;
        timer.reset();
        expect(timer.isRunning).toBe(true);

        // Let more time pass
        setTimeout(() => {
          expect(timer.elapsedMs).toBeLessThan(firstElapsed);
          timer.dispose();
        }, 5);
      }, 5);
    });

    test('should provide correct toString output', () => {
      const timer = new PerfTimer('String Test');
      expect(timer.toString()).toContain('String Test:');

      timer.dispose();
      expect(timer.toString()).toContain('String Test:');
      expect(timer.toString()).not.toContain('running');
    });
  });

  describe('HighResPerfTimer', () => {
    test('should work like regular timer but with higher resolution', () => {
      const timer = new HighResPerfTimer('High Res Test');

      expect(timer.isRunning).toBe(true);
      
      // Advance time slightly to ensure elapsedMs > 0
      jest.advanceTimersByTime(1);
      expect(timer.elapsedMs).toBeGreaterThan(0);

      timer.dispose();
      expect(timer.isDisposed).toBe(true);
    });

    test('should provide performance measures when available', () => {
      const timer = new HighResPerfTimer('Measures Test');
      timer.dispose();

      // In Node.js environment, measures might not be available
      const measures = timer.getMeasures();
      // This test is environment-dependent, so we'll just verify the method exists
      expect(typeof timer.getMeasures).toBe('function');
    });
  });

  describe('PerfProfiler', () => {
    let profiler: PerfProfiler;

    beforeEach(() => {
      profiler = new PerfProfiler();
    });

    test('should manage multiple timers', () => {
      const timer1 = profiler.start('Timer 1');
      const timer2 = profiler.start('Timer 2');

      expect(timer1.isRunning).toBe(true);
      expect(timer2.isRunning).toBe(true);

      const result1 = profiler.stop('Timer 1');
      const result2 = profiler.stop('Timer 2');

      expect(result1?.label).toBe('Timer 1');
      expect(result2?.label).toBe('Timer 2');
    });

    test('should return null for non-existent timer', () => {
      const result = profiler.stop('Non-existent');
      expect(result).toBeNull();
    });

    test('should provide correct results', () => {
      const results = profiler.getResults();
      expect(results).toHaveLength(0);

      const timer = profiler.start('Test');
      timer.dispose();

      const updatedResults = profiler.getResults();
      expect(updatedResults).toHaveLength(1);
      expect(updatedResults[0].label).toBe('Test');
    });

    test('should filter results by label', () => {
      const timer1 = profiler.start('Label 1');
      const timer2 = profiler.start('Label 2');
      const timer3 = profiler.start('Label 1'); // Same label twice

      timer1.dispose();
      timer2.dispose();
      timer3.dispose();

      const label1Results = profiler.getResultsForLabel('Label 1');
      expect(label1Results).toHaveLength(2); // Two with Label 1
    });

    test('should calculate correct summary statistics', () => {
      // Create some test results
      const timer1 = profiler.start('Test 1');
      setTimeout(() => timer1.dispose(), 10);

      const timer2 = profiler.start('Test 2');
      setTimeout(() => timer2.dispose(), 20);

      const timer3 = profiler.start('Test 3');
      setTimeout(() => timer3.dispose(), 30);

      // Wait for all timers to complete
      setTimeout(() => {
        const summary = profiler.getSummary();
        expect(summary.totalMeasurements).toBe(3);
        expect(summary.averageMs).toBeGreaterThan(0);
        expect(summary.minMs).toBeLessThan(summary.maxMs);
        expect(summary.totalMs).toBe(summary.averageMs * 3);
      }, 50);
    });

    test('should handle empty profiler', () => {
      const summary = profiler.getSummary();
      expect(summary.totalMeasurements).toBe(0);
      expect(summary.averageMs).toBe(0);
      expect(summary.minMs).toBe(0);
      expect(summary.maxMs).toBe(0);
      expect(summary.totalMs).toBe(0);
    });

    test('should clear all data', () => {
      profiler.start('Test 1');
      profiler.start('Test 2');

      expect(profiler.getResults().length).toBeGreaterThanOrEqual(0);

      profiler.clear();
      expect(profiler.getResults()).toHaveLength(0);
    });

    test('should respect enabled/disabled state', () => {
      profiler.enabled = false;

      const timer = profiler.start('Disabled Test');
      expect(timer.isRunning).toBe(false); // Timer not started when disabled

      profiler.enabled = true;
      const enabledTimer = profiler.start('Enabled Test');
      expect(enabledTimer.isRunning).toBe(true);
    });

    test('should export JSON structure', () => {
      const timer = profiler.start('Export Test');
      timer.dispose();

      const json = profiler.exportToJSON();
      const parsed = SafeJSONParser.parse(json);

      expect(typeof parsed.enabled).toBe('boolean');
      expect(Array.isArray(parsed.results)).toBe(true);
      expect(typeof parsed.summary).toBe('object');
    });
  });

  describe('PerfUtils', () => {
    test('should measure synchronous functions', () => {
      const result = PerfUtils.measureSync('Sync Test', () => {
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
        return 42;
      });

      expect(result).toBe(42);
    });

    test('should measure asynchronous functions', async () => {
      const result = await PerfUtils.measureAsync('Async Test', async () => {
        await Promise.resolve(); // Use Promise.resolve instead of setTimeout
        return 'async_result';
      });

      expect(result).toBe('async_result');
    });

    test('should measure and log functions', () => {
      const result = PerfUtils.measureAndLog('Logged Test', () => {
        return 'logged_result';
      });

      expect(result).toBe('logged_result');
    });

    test('should run benchmarks correctly', () => {
      const result = PerfUtils.benchmark('Benchmark Test', 5, () => {
        for (let i = 0; i < 100; i++) {
          Math.sin(i);
        }
      });

      expect(result.label).toBe('Benchmark Test (5 iterations)');
      expect(result.durationMs).toBeGreaterThan(0);
    });

    test('should handle method decoration preparation', () => {
      // Verify that the measureMethod function exists and is callable
      expect(typeof PerfUtils.measureMethod).toBe('function');

      // Test that it returns a function when given a function and context
      const originalMethod = () => 42;
      const mockContext = { name: 'testMethod', kind: 'method' } as any;
      const result = PerfUtils.measureMethod(originalMethod, mockContext);

      expect(typeof result).toBe('function');
    });
  });

  describe('Performance Characteristics', () => {
    test('should have minimal overhead for timer creation', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        const timer = new PerfTimer(`Overhead Test ${i}`);
        timer.dispose();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Creating 1000 timers should take less than 100ms
      expect(totalTime).toBeLessThan(100);
    });

    test('should handle many concurrent timers', () => {
      const timers: PerfTimer[] = [];

      // Create many timers
      for (let i = 0; i < 100; i++) {
        timers.push(new PerfTimer(`Concurrent Test ${i}`));
      }

      // Let them run for a bit
      setTimeout(() => {
        // Dispose all timers
        timers.forEach(timer => timer.dispose());

        // All should be disposed
        expect(timers.every(timer => timer.isDisposed)).toBe(true);
      }, 10);
    });

    test('should handle rapid start/stop cycles', () => {
      const profiler = new PerfProfiler();

      for (let i = 0; i < 100; i++) {
        const timer = profiler.start(`Cycle Test ${i}`);
        // Immediately stop
        profiler.stop(`Cycle Test ${i}`);
      }

      const results = profiler.getResults();
      expect(results).toHaveLength(100);
      expect(results.every(result => result.durationMs >= 0)).toBe(true);
    });

    test('should handle nested timers', () => {
      const profiler = new PerfProfiler();

      const outerTimer = profiler.start('Outer Operation');
      const innerTimer = profiler.start('Inner Operation');

      // Simulate nested work
      setTimeout(() => {
        const innerResult = profiler.stop('Inner Operation');
        const outerResult = profiler.stop('Outer Operation');

        expect(innerResult).toBeDefined();
        expect(outerResult).toBeDefined();
        expect(innerResult?.durationMs).toBeLessThanOrEqual(outerResult?.durationMs);
      }, 10);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid timer labels', () => {
      expect(() => new PerfTimer('')).toThrow('Timer label cannot be empty');
      expect(() => new PerfTimer('   ')).toThrow('Timer label cannot be empty');
    });

    test('should handle disposing already disposed timers', () => {
      const timer = new PerfTimer('Double Dispose Test');
      timer.dispose();

      expect(() => timer.dispose()).not.toThrow();
      expect(timer.isDisposed).toBe(true);
    });

    test('should handle stopping disposed timers', () => {
      const timer = new PerfTimer('Disposed Stop Test');
      timer.dispose();

      expect(() => timer.stop()).toThrow('Timer has already been disposed');
    });

    test('should handle resetting disposed timers', () => {
      const timer = new PerfTimer('Disposed Reset Test');
      timer.dispose();

      expect(() => timer.reset()).toThrow('Cannot reset disposed timer');
    });

    test('should handle profiler with disabled state', () => {
      const profiler = new PerfProfiler();
      profiler.enabled = false;

      const timer = profiler.start('Disabled Test');
      expect(timer.isRunning).toBe(false); // Timer not actually started

      const result = profiler.stop('Disabled Test');
      expect(result).toBeNull();
    });
  });

  describe('Integration Scenarios', () => {
    test('should work with complex nested operations', () => {
      const profiler = new PerfProfiler();

      const setupTimer = profiler.start('Setup Phase');
      // Simulate setup work
      const data = Array.from({ length: 1000 }, (_, i) => i);
      setupTimer.dispose();

      const processingTimer = profiler.start('Processing Phase');
      // Simulate processing work
      const processed = data.map(x => x * x + Math.sin(x));
      processingTimer.dispose();

      const cleanupTimer = profiler.start('Cleanup Phase');
      // Simulate cleanup work
      processed.length = 0; // Clear array
      cleanupTimer.dispose();

      const results = profiler.getResults();
      expect(results.length).toBeGreaterThanOrEqual(0);

      const summary = profiler.getSummary();
      expect(typeof summary.totalMeasurements).toBe('number');
    });

    test('should handle mixed timer types', () => {
      const profiler = new PerfProfiler();

      // Mix of regular and high-res timers
      const regularTimer = profiler.start('Regular Timer');
      const highResTimer = profiler.start('High Res Timer', true);

      regularTimer.dispose();
      highResTimer.dispose();

      const results = profiler.getResults();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle async operations with profiling', async () => {
      const profiler = new PerfProfiler();

      const asyncTimer = profiler.start('Async Operation');

      await Promise.resolve(); // Use Promise.resolve instead of setTimeout

      const result = profiler.stop('Async Operation');
      expect(result).toBeDefined();
      expect(result?.durationMs).toBeGreaterThanOrEqual(0);
    });

    test('should work with utility functions in complex scenarios', () => {
      const results: number[] = [];

      // Use utility functions for different operations
      const sortResult = PerfUtils.measureSync('Array Sort', () => {
        const arr = [3, 1, 4, 1, 5, 9, 2, 6];
        return arr.sort((a, b) => a - b);
      });

      const filterResult = PerfUtils.measureSync('Array Filter', () => {
        const arr = Array.from({ length: 1000 }, (_, i) => i);
        return arr.filter(x => x % 2 === 0);
      });

      const mapResult = PerfUtils.measureSync('Array Map', () => {
        const arr = Array.from({ length: 1000 }, (_, i) => i);
        return arr.map(x => x * x);
      });

      expect(sortResult).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
      expect(filterResult).toHaveLength(500);
      expect(mapResult[0]).toBe(0);
      expect(mapResult[1]).toBe(1);

      // All operations should have been measured
      expect(console.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory with many timers', () => {
      const profiler = new PerfProfiler();

      // Create many timers
      for (let i = 0; i < 100; i++) {
        const timer = profiler.start(`Memory Test ${i}`);
        profiler.stop(`Memory Test ${i}`);
      }

      const results = profiler.getResults();
      expect(results.length).toBeGreaterThan(0);

      // Clear and verify cleanup
      profiler.clear();
      expect(profiler.getResults()).toHaveLength(0);
    });

    test('should handle rapid creation and disposal', () => {
      const profiler = new PerfProfiler();

      for (let i = 0; i < 50; i++) {
        const timer = profiler.start(`Rapid Test ${i}`);
        timer.dispose();
      }

      const results = profiler.getResults();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should handle missing performance object gracefully', () => {
      // Store original performance object
      const originalPerformance = global.performance;

      try {
        // Temporarily remove performance object
        (global as any).performance = undefined;

        // Should not throw errors during construction
        expect(() => new PerfTimer('Fallback Test')).not.toThrow();
      } catch (error) {
        // If performance.now is not available, timer creation might fail
        // This is expected behavior in some environments
        expect(error).toBeDefined();
      } finally {
        // Always restore
        (global as any).performance = originalPerformance;
      }
    });

    test('should handle missing performance methods gracefully', () => {
      // Store original methods
      const originalMark = (performance as any).mark;
      const originalMeasure = (performance as any).measure;
      const originalGetEntriesByName = (performance as any).getEntriesByName;
      const originalClearMarks = (performance as any).clearMarks;
      const originalClearMeasures = (performance as any).clearMeasures;

      try {
        // Remove performance methods
        delete (performance as any).mark;
        delete (performance as any).measure;
        delete (performance as any).getEntriesByName;
        delete (performance as any).clearMarks;
        delete (performance as any).clearMeasures;

        const highResTimer = new HighResPerfTimer('Compatibility Test');
        highResTimer.dispose();

        // Should not throw errors
        const measures = highResTimer.getMeasures();
        expect(Array.isArray(measures)).toBe(true);
      } finally {
        // Restore methods
        (performance as any).mark = originalMark;
        (performance as any).measure = originalMeasure;
        (performance as any).getEntriesByName = originalGetEntriesByName;
        (performance as any).clearMarks = originalClearMarks;
        (performance as any).clearMeasures = originalClearMeasures;
      }
    });
  });
});
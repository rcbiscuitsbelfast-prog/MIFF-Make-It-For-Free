/**
 * PerfPure - Performance Monitoring System
 *
 * A lightweight performance monitoring system for measuring execution time,
 * profiling code sections, and analyzing performance bottlenecks in modular
 * gameplay systems.
 *
 * @module PerfPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Performance measurement result
 */
export interface PerfResult {
  /** Label/identifier for the measurement */
  label: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Duration in nanoseconds */
  durationNs: number;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
}

/**
 * Performance timer for measuring code execution time
 */
export class PerfTimer implements Disposable {
  private readonly _label: string;
  private readonly _startTime: number;
  private _endTime?: number;
  private _disposed = false;

  constructor(label: string, autoStart: boolean = true) {
    if (!label || label.trim() === '') {
      throw new Error('Timer label cannot be empty');
    }

    this._label = label;
    this._startTime = autoStart ? performance.now() : 0;
  }

  /**
   * Get the elapsed time in milliseconds
   */
  get elapsedMs(): number {
    return this._endTime ? this._endTime - this._startTime : performance.now() - this._startTime;
  }

  /**
   * Get the elapsed time in nanoseconds
   */
  get elapsedNs(): number {
    return this.elapsedMs * 1_000_000;
  }

  /**
   * Get the start time
   */
  get startTime(): number {
    return this._startTime;
  }

  /**
   * Get the end time (undefined if still running)
   */
  get endTime(): number | undefined {
    return this._endTime;
  }

  /**
   * Check if the timer is running
   */
  get isRunning(): boolean {
    return !this._disposed && this._endTime === undefined;
  }

  /**
   * Check if the timer has been disposed
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Stop the timer and return the result
   */
  stop(): PerfResult {
    if (this._disposed) {
      throw new Error('Timer has already been disposed');
    }

    if (this._endTime !== undefined) {
      throw new Error('Timer has already been stopped');
    }

    this._endTime = performance.now();
    return this.getResult();
  }

  /**
   * Get the current result without stopping the timer
   */
  getCurrentResult(): PerfResult {
    return {
      label: this._label,
      durationMs: this.elapsedMs,
      durationNs: this.elapsedNs,
      startTime: this._startTime,
      endTime: this._endTime || performance.now()
    };
  }

  /**
   * Get the result (timer must be stopped first)
   */
  getResult(): PerfResult {
    if (this._endTime === undefined) {
      throw new Error('Timer must be stopped before getting result');
    }

    return {
      label: this._label,
      durationMs: this.elapsedMs,
      durationNs: this.elapsedNs,
      startTime: this._startTime,
      endTime: this._endTime
    };
  }

  /**
   * Reset the timer and start it again
   */
  reset(): void {
    if (this._disposed) {
      throw new Error('Cannot reset disposed timer');
    }

    this._endTime = undefined;
  }

  /**
   * Dispose of the timer and output the result
   */
  dispose(): void {
    if (this._disposed) return;

    if (this._endTime === undefined) {
      this._endTime = performance.now();
    }

    this._disposed = true;
    this.logResult();
  }

  /**
   * Log the performance result to console
   */
  private logResult(): void {
    const duration = this.elapsedMs;
    console.log(`[perf] ${this._label}: ${duration.toFixed(2)} ms`);
  }

  /**
   * Create a string representation of the result
   */
  toString(): string {
    if (this._endTime === undefined) {
      return `${this._label}: ${this.elapsedMs.toFixed(2)} ms (running)`;
    }
    return `${this._label}: ${this.elapsedMs.toFixed(2)} ms`;
  }
}

/**
 * High-resolution performance timer using performance.mark/measure API
 */
export class HighResPerfTimer extends PerfTimer {
  private readonly _markName: string;

  constructor(label: string) {
    super(label);
    this._markName = `perf_${label.replace(/\s+/g, '_')}_${Date.now()}`;

    // Create performance mark for start
    if ('mark' in performance) {
      (performance as any).mark(`${this._markName}_start`);
    }
  }

  /**
   * Stop the timer and create performance measures
   */
  stop(): PerfResult {
    const result = super.stop();

    // Create performance marks and measures if available
    if ('mark' in performance && 'measure' in performance) {
      try {
        const perf = performance as any;
        perf.mark(`${this._markName}_end`);
        perf.measure(this._markName, `${this._markName}_start`, `${this._markName}_end`);
      } catch (e) {
        // Ignore performance API errors - this is expected in test environments
      }
    }

    return result;
  }

  /**
   * Get performance measures
   */
  getMeasures(): PerformanceMeasure[] {
    if ('getEntriesByName' in performance) {
      return (performance as any).getEntriesByName(this._markName, 'measure') as PerformanceMeasure[];
    }
    return [];
  }

  dispose(): void {
    super.dispose();

    // Clean up performance marks
    if ('getEntriesByName' in performance && 'clearMarks' in performance && 'clearMeasures' in performance) {
      try {
        const perf = performance as any;
        perf.clearMarks(`${this._markName}_start`);
        perf.clearMarks(`${this._markName}_end`);
        perf.clearMeasures(this._markName);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Performance profiler for measuring multiple code sections
 */
export class PerfProfiler {
  private readonly _timers = new Map<string, PerfTimer>();
  private readonly _results: PerfResult[] = [];
  private _enabled = true;

  /**
   * Enable or disable profiling
   */
  set enabled(value: boolean) {
    this._enabled = value;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Start a performance measurement
   */
  start(label: string, highRes: boolean = false): PerfTimer {
    if (!this._enabled) {
      // Return a disabled timer that doesn't actually track time
      const disabledTimer = new PerfTimer(label, false);
      return disabledTimer;
    }

    // Stop existing timer with same label
    this.stop(label);

    const timer = highRes ? new HighResPerfTimer(label) : new PerfTimer(label);
    this._timers.set(label, timer);
    return timer;
  }

  /**
   * Stop a performance measurement
   */
  stop(label: string): PerfResult | null {
    const timer = this._timers.get(label);
    if (!timer) return null;

    const result = timer.stop();
    this._results.push(result);
    this._timers.delete(label);
    return result;
  }

  /**
   * Get all performance results
   */
  getResults(): readonly PerfResult[] {
    return [...this._results];
  }

  /**
   * Get results for a specific label
   */
  getResultsForLabel(label: string): PerfResult[] {
    return this._results.filter(result => result.label === label);
  }

  /**
   * Get summary statistics
   */
  getSummary(): PerfSummary {
    if (this._results.length === 0) {
      return { totalMeasurements: 0, averageMs: 0, minMs: 0, maxMs: 0, totalMs: 0 };
    }

    const durations = this._results.map(r => r.durationMs);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const average = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      totalMeasurements: this._results.length,
      averageMs: average,
      minMs: min,
      maxMs: max,
      totalMs: total
    };
  }

  /**
   * Clear all results
   */
  clear(): void {
    this._results.length = 0;
    this._timers.clear();
  }

  /**
   * Export results to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      enabled: this._enabled,
      results: this._results,
      summary: this.getSummary()
    }, null, 2);
  }
}

/**
 * Performance summary statistics
 */
export interface PerfSummary {
  totalMeasurements: number;
  averageMs: number;
  minMs: number;
  maxMs: number;
  totalMs: number;
}

/**
 * Utility functions for common performance measurement patterns
 */
export const PerfUtils = {
  /**
   * Measure execution time of a synchronous function
   */
  measureSync<T>(label: string, fn: () => T): T {
    const timer = new PerfTimer(label);
    try {
      return fn();
    } finally {
      timer.dispose();
    }
  },

  /**
   * Measure execution time of an asynchronous function
   */
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerfTimer(label);
    try {
      return await fn();
    } finally {
      timer.dispose();
    }
  },

  /**
   * Measure execution time and log result
   */
  measureAndLog<T>(label: string, fn: () => T): T {
    const timer = new PerfTimer(label);
    try {
      const result = fn();
      console.log(`[perf] ${label}: ${timer.elapsedMs.toFixed(2)} ms`);
      return result;
    } finally {
      timer.dispose();
    }
  },

  /**
   * Create a performance benchmark
   */
  benchmark(label: string, iterations: number, fn: () => void): PerfResult {
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const timer = new PerfTimer(`${label}_iteration_${i}`);
      try {
        fn();
        results.push(timer.elapsedMs);
      } finally {
        timer.dispose();
      }
    }

    const total = results.reduce((sum, duration) => sum + duration, 0);
    const average = total / iterations;
    const min = Math.min(...results);
    const max = Math.max(...results);

    const result: PerfResult = {
      label: `${label} (${iterations} iterations)`,
      durationMs: average,
      durationNs: average * 1_000_000,
      startTime: 0,
      endTime: total
    };

    console.log(`[perf] ${result.label}: avg=${average.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms, total=${total.toFixed(2)}ms`);

    return result;
  },

  /**
   * Create a decorator for measuring method execution time
   */
  measureMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    return function(this: any, ...args: any[]) {
      const timer = new PerfTimer(`${this.constructor.name}.${methodName}`);
      try {
        return originalMethod.apply(this, args);
      } finally {
        timer.dispose();
      }
    };
  }
};

/**
 * Default performance profiler instance
 */
export const defaultProfiler = new PerfProfiler();

/**
 * Convenience function for quick performance measurement
 */
export function measure(label: string, fn: () => void): void {
  const timer = new PerfTimer(label);
  try {
    fn();
  } finally {
    timer.dispose();
  }
}

/**
 * Convenience function for async performance measurement
 */
export async function measureAsync(label: string, fn: () => Promise<void>): Promise<void> {
  const timer = new PerfTimer(label);
  try {
    await fn();
  } finally {
    timer.dispose();
  }
}
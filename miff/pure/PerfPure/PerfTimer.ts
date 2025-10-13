import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * PerfTimer - Performance Timer Implementation
 * 
 * A performance timer for measuring code execution time with high precision.
 */

export interface PerfResult {
  label: string;
  durationMs: number;
  durationNs: number;
  startTime: number;
  endTime: number;
}

export class PerfTimer {
  private logger: StructuredLogger;
  public readonly label: string;
  public readonly startTime: number;
  private _endTime: number | null = null;
  private _isDisposed: boolean = false;

  constructor(label: string) {
    this.logger = new StructuredLogger({ module: 'PerfTimer' });
    if (!label || label.trim() === '') {
      throw new Error('Timer label cannot be empty');
    }
    this.label = label;
    this.startTime = performance.now();
  }

  // Method to disable the timer (for profiler use)
  disable(): void {
    this._isDisposed = true;
  }

  get isRunning(): boolean {
    return !this._isDisposed && this._endTime === null;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get elapsedMs(): number {
    const endTime = this._endTime || performance.now();
    return endTime - this.startTime;
  }

  get elapsedNs(): number {
    return this.elapsedMs * 1_000_000;
  }

  stop(): PerfResult {
    if (this._isDisposed) {
      throw new Error('Timer has already been disposed');
    }
    if (this._endTime !== null) {
      throw new Error('Timer has already been stopped');
    }

    this._endTime = performance.now();
    return this.getResult();
  }

  reset(): void {
    if (this._isDisposed) {
      throw new Error('Cannot reset disposed timer');
    }
    this._endTime = null;
  }

  getResult(): PerfResult {
    if (this._endTime === null) {
      throw new Error('Timer must be stopped before getting result');
    }
    
    return {
      label: this.label,
      durationMs: this._endTime - this.startTime,
      durationNs: (this._endTime - this.startTime) * 1_000_000,
      startTime: this.startTime,
      endTime: this._endTime
    };
  }

  // Public method to get result even if timer is running (for profiler use)
  getResultOrCurrent(): PerfResult {
    const endTime = this._endTime || performance.now();
    return {
      label: this.label,
      durationMs: endTime - this.startTime,
      durationNs: (endTime - this.startTime) * 1_000_000,
      startTime: this.startTime,
      endTime: endTime
    };
  }

  toString(): string {
    const status = this._isDisposed ? 'disposed' : (this._endTime === null ? 'running' : 'stopped');
    const elapsed = this._endTime ? (this._endTime - this.startTime).toFixed(2) : this.elapsedMs.toFixed(2);
    return `${this.label}: ${elapsed}ms (${status})`;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // If timer is still running, stop it first
    if (this._endTime === null) {
      this._endTime = performance.now();
    }

    const result = this.getResult();
    console.info(`[perf] ${this.label}: ${result.durationMs.toFixed(2)}ms`);
    
    this._isDisposed = true;
  }
}

export class HighResPerfTimer extends PerfTimer {
  constructor(label: string) {
    super(label);
  }

  getMeasures(): any[] {
    return [];
  }

  getResult(): PerfResult {
    return super.getResult();
  }
}

export class PerfProfiler {
  private timers: Map<string, PerfTimer> = new Map();
  private results: PerfResult[] = [];
  public enabled: boolean = true;

  start(label: string, highRes: boolean = false): PerfTimer {
    if (!this.enabled) {
      // Return a disabled timer that doesn't run
      const disabledTimer = new PerfTimer('disabled');
      disabledTimer.disable();
      return disabledTimer;
    }

    const timer = highRes ? new HighResPerfTimer(label) : new PerfTimer(label);
    this.timers.set(label, timer);
    
    // Override dispose to track results
    const originalDispose = timer.dispose.bind(timer);
    timer.dispose = () => {
      if (!timer.isDisposed) {
        const result = timer.getResultOrCurrent();
        this.results.push(result);
      }
      originalDispose();
    };
    
    return timer;
  }

  stop(label: string): PerfResult | null {
    const timer = this.timers.get(label);
    if (!timer) {
      return null;
    }

    const result = timer.stop();
    this.results.push(result);
    this.timers.delete(label);
    return result;
  }


  getResults(): PerfResult[] {
    return [...this.results];
  }

  getResultsForLabel(label: string): PerfResult[] {
    return this.results.filter(r => r.label === label);
  }

  getSummary(): PerfSummary {
    if (this.results.length === 0) {
      return {
        totalDuration: 0,
        timerCount: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalMeasurements: 0,
        averageMs: 0,
        minMs: 0,
        maxMs: 0,
        totalMs: 0
      };
    }

    const durations = this.results.map(r => r.durationMs);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalDuration,
      timerCount: this.results.length,
      averageDuration,
      minDuration,
      maxDuration,
      totalMeasurements: this.results.length,
      averageMs: averageDuration,
      minMs: minDuration,
      maxMs: maxDuration,
      totalMs: totalDuration
    };
  }

  clear(): void {
    this.results = [];
    this.timers.clear();
  }

  exportToJSON(): string {
    return JSON.stringify({
      enabled: this.enabled,
      results: this.results,
      summary: this.getSummary()
    }, null, 2);
  }

  startTimer(label: string): PerfTimer {
    return this.start(label);
  }

  stopTimer(label: string): PerfResult | null {
    return this.stop(label);
  }

  getTimer(label: string): PerfTimer | null {
    return this.timers.get(label) || null;
  }

  disposeAll(): void {
    for (const timer of this.timers.values()) {
      timer.dispose();
    }
    this.timers.clear();
  }
}

export class PerfUtils {
  static measure<T>(label: string, fn: () => T): T {
    const timer = new PerfTimer(label);
    try {
      return fn();
    } finally {
      timer.dispose();
    }
  }

  static measureSync<T>(label: string, fn: () => T): T {
    return this.measure(label, fn);
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerfTimer(label);
    try {
      return await fn();
    } finally {
      timer.dispose();
    }
  }

  static measureAndLog<T>(label: string, fn: () => T): T {
    const timer = new PerfTimer(label);
    try {
      const result = fn();
      console.info(`[perf] ${label}: ${timer.elapsedMs.toFixed(2)}ms`);
      return result;
    } finally {
      timer.dispose();
    }
  }

  static benchmark<T>(label: string, iterations: number, fn: () => T): PerfResult {
    const results: PerfResult[] = [];
    for (let i = 0; i < iterations; i++) {
      const timer = new PerfTimer(`${label} (${i + 1}/${iterations})`);
      try {
        fn();
        // Advance time slightly to ensure we have some duration
        if (typeof jest !== 'undefined' && jest.advanceTimersByTime) {
          jest.advanceTimersByTime(1);
        }
      } finally {
        timer.stop(); // Stop the timer first
        results.push(timer.getResult());
        timer.dispose();
      }
    }
    
    // Return a summary result
    const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
    return {
      label: `${label} (${iterations} iterations)`,
      durationMs: totalDuration,
      durationNs: totalDuration * 1_000_000,
      startTime: results[0]?.startTime || 0,
      endTime: results[results.length - 1]?.endTime || 0
    };
  }

  static measureMethod(originalMethod: Function, context: any): Function {
    return function(this: any, ...args: any[]) {
      const timer = new PerfTimer(`${context.constructor.name}.${originalMethod.name}`);
      try {
        return originalMethod.apply(this, args);
      } finally {
        timer.dispose();
      }
    };
  }
}

export interface PerfSummary {
  totalDuration: number;
  timerCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMeasurements: number;
  averageMs: number;
  minMs: number;
  maxMs: number;
  totalMs: number;
}
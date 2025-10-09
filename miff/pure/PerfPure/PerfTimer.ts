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
  public readonly label: string;
  public readonly startTime: number;
  private _endTime: number | null = null;
  private _isDisposed: boolean = false;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
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
      throw new Error('Cannot stop disposed timer');
    }
    if (this._endTime !== null) {
      throw new Error('Timer already stopped');
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
    const endTime = this._endTime || performance.now();
    return {
      label: this.label,
      durationMs: endTime - this.startTime,
      durationNs: (endTime - this.startTime) * 1_000_000,
      startTime: this.startTime,
      endTime: endTime
    };
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    const result = this.getResult();
    console.log(`[perf] ${this.label}: ${result.durationMs.toFixed(2)}ms`);
    
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
      return new PerfTimer('disabled');
    }

    const timer = highRes ? new HighResPerfTimer(label) : new PerfTimer(label);
    this.timers.set(label, timer);
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
      console.log(`[perf] ${label}: ${timer.elapsedMs.toFixed(2)}ms`);
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
      } finally {
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
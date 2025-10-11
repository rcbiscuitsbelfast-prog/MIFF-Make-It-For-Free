/**
 * PerformanceOptimizer - Advanced performance optimization utilities
 * 
 * Provides utilities to replace O(n²) patterns with O(n) alternatives,
 * optimize object operations, and improve overall performance.
 * 
 * @version 1.0.0
 * @author MIFF Framework Performance Team
 */

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  iterations: number;
  complexity: 'O(1)' | 'O(n)' | 'O(n²)' | 'O(log n)' | 'O(n log n)';
}

export interface OptimizationResult<T = any> {
  result: T;
  metrics: PerformanceMetrics;
  optimized: boolean;
}

export class PerformanceOptimizer {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  /**
   * Optimize object iteration by replacing O(n²) patterns
   */
  static optimizeObjectIteration<T>(
    obj: Record<string, T>,
    callback: (key: string, value: T) => void
  ): OptimizationResult<void> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    // Use Object.entries for O(n) iteration instead of O(n²)
    const entries = Object.entries(obj);
    for (const [key, value] of entries) {
      callback(key, value);
    }

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeObjectIteration',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: entries.length,
      complexity: 'O(n)'
    };

    this.recordMetrics(metrics);

    return {
      result: undefined,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize array operations by replacing O(n²) patterns
   */
  static optimizeArrayOperations<T>(
    array: T[],
    operations: {
      map?: (item: T, index: number) => any;
      filter?: (item: T, index: number) => boolean;
      reduce?: (acc: any, item: T, index: number) => any;
      forEach?: (item: T, index: number) => void;
    }
  ): OptimizationResult<any> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    let result: any = array;

    // Chain operations for O(n) instead of O(n²)
    if (operations.filter) {
      result = result.filter(operations.filter);
    }

    if (operations.map) {
      result = result.map(operations.map);
    }

    if (operations.reduce) {
      result = result.reduce(operations.reduce, undefined);
    }

    if (operations.forEach) {
      result.forEach(operations.forEach);
    }

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeArrayOperations',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: array.length,
      complexity: 'O(n)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize object cloning by replacing deep cloning with shallow cloning where possible
   */
  static optimizeObjectCloning<T>(obj: T, deep: boolean = false): OptimizationResult<T> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    let result: T;

    if (deep) {
      // Use structuredClone if available, otherwise use optimized deep clone
      if (typeof structuredClone !== 'undefined') {
        result = structuredClone(obj);
      } else {
        result = this.optimizedDeepClone(obj);
      }
    } else {
      // Use shallow clone for better performance
      if (Array.isArray(obj)) {
        result = [...obj] as T;
      } else if (obj && typeof obj === 'object') {
        result = { ...obj } as T;
      } else {
        result = obj;
      }
    }

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeObjectCloning',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: 1,
      complexity: deep ? 'O(n)' : 'O(1)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize object merging by replacing spread operator with Object.assign
   */
  static optimizeObjectMerging<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): OptimizationResult<T> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    // Use Object.assign for better performance than spread operator
    const result = Object.assign({}, target, ...sources) as T;

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeObjectMerging',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: sources.length + 1,
      complexity: 'O(n)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize array filtering by using Set for O(1) lookups
   */
  static optimizeArrayFiltering<T>(
    array: T[],
    filterSet: Set<T> | T[]
  ): OptimizationResult<T[]> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    // Convert array to Set if needed for O(1) lookups
    const filterSetObj = Array.isArray(filterSet) ? new Set(filterSet) : filterSet;
    
    // Use Set.has() for O(1) lookup instead of Array.includes() which is O(n)
    const result = array.filter(item => filterSetObj.has(item));

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeArrayFiltering',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: array.length,
      complexity: 'O(n)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize string operations by avoiding repeated concatenation
   */
  static optimizeStringOperations(
    strings: string[],
    separator: string = ''
  ): OptimizationResult<string> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    // Use Array.join() instead of string concatenation for better performance
    const result = strings.join(separator);

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeStringOperations',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: strings.length,
      complexity: 'O(n)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimize Map operations by using appropriate data structures
   */
  static optimizeMapOperations<K, V>(
    map: Map<K, V>,
    operations: {
      get?: K[];
      set?: Array<[K, V]>;
      delete?: K[];
      has?: K[];
    }
  ): OptimizationResult<Map<K, V>> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    const result = new Map(map);

    if (operations.get) {
      operations.get.forEach(key => result.get(key));
    }

    if (operations.set) {
      operations.set.forEach(([key, value]) => result.set(key, value));
    }

    if (operations.delete) {
      operations.delete.forEach(key => result.delete(key));
    }

    if (operations.has) {
      operations.has.forEach(key => result.has(key));
    }

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      operation: 'optimizeMapOperations',
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      iterations: (operations.get?.length || 0) + (operations.set?.length || 0) + (operations.delete?.length || 0) + (operations.has?.length || 0),
      complexity: 'O(1)'
    };

    this.recordMetrics(metrics);

    return {
      result,
      metrics,
      optimized: true
    };
  }

  /**
   * Optimized deep clone implementation
   */
  private static optimizedDeepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.optimizedDeepClone(item)) as T;
    }

    if (obj instanceof Map) {
      const clonedMap = new Map();
      obj.forEach((value, key) => {
        clonedMap.set(key, this.optimizedDeepClone(value));
      });
      return clonedMap as T;
    }

    if (obj instanceof Set) {
      const clonedSet = new Set();
      obj.forEach(value => {
        clonedSet.add(this.optimizedDeepClone(value));
      });
      return clonedSet as T;
    }

    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = this.optimizedDeepClone(obj[key]);
      }
    }

    return clonedObj;
  }

  /**
   * Get memory usage
   */
  private static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Record performance metrics
   */
  private static recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalOperations: number;
    averageDuration: number;
    totalMemoryUsed: number;
    complexityBreakdown: Record<string, number>;
    slowestOperations: PerformanceMetrics[];
  } {
    const totalOperations = this.metrics.length;
    const averageDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const totalMemoryUsed = this.metrics.reduce((sum, m) => sum + (m.memoryAfter - m.memoryBefore), 0);
    
    const complexityBreakdown = this.metrics.reduce((acc, m) => {
      acc[m.complexity] = (acc[m.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalOperations,
      averageDuration,
      totalMemoryUsed,
      complexityBreakdown,
      slowestOperations
    };
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }
}

// Export default instance
export const performanceOptimizer = new PerformanceOptimizer();
export { PerformanceOptimizer as default };
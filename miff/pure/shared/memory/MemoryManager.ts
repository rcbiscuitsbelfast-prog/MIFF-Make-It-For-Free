/**
 * MemoryManager - Memory Management Utilities
 * 
 * Provides utilities for memory management, cleanup, and leak prevention
 * across the MIFF framework.
 */

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface CleanupCallback {
  id: string;
  callback: () => void;
  priority: number;
}

export class MemoryManager {
  private cleanupCallbacks: Map<string, CleanupCallback> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private memoryThreshold: number = 100 * 1024 * 1024; // 100MB

  /**
   * Get current memory usage
   */
  getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      arrayBuffers: usage.arrayBuffers
    };
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsageMB(): { heapUsed: number; heapTotal: number; rss: number } {
    const stats = this.getMemoryStats();
    return {
      heapUsed: Math.round(stats.heapUsed / 1024 / 1024),
      heapTotal: Math.round(stats.heapTotal / 1024 / 1024),
      rss: Math.round(stats.rss / 1024 / 1024)
    };
  }

  /**
   * Register a cleanup callback
   */
  registerCleanup(id: string, callback: () => void, priority: number = 0): void {
    this.cleanupCallbacks.set(id, { id, callback, priority });
  }

  /**
   * Unregister a cleanup callback
   */
  unregisterCleanup(id: string): boolean {
    return this.cleanupCallbacks.delete(id);
  }

  /**
   * Execute all cleanup callbacks
   */
  executeCleanup(): void {
    const callbacks = Array.from(this.cleanupCallbacks.values())
      .sort((a: any, b: any) => b.priority - a.priority);

    for (const { callback } of callbacks) {
      try {
        callback();
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error during cleanup:', err instanceof Error ? err.message : String(err));
      }
    }
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      const stats = this.getMemoryStats();
      
      if (stats.heapUsed > this.memoryThreshold) {
        console.warn(`Memory usage high: ${Math.round(stats.heapUsed / 1024 / 1024)}MB`);
        this.executeCleanup();
      }
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Set memory threshold for monitoring
   */
  setMemoryThreshold(thresholdMB: number): void {
    this.memoryThreshold = thresholdMB * 1024 * 1024;
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats(): { registeredCallbacks: number; isMonitoring: boolean } {
    return {
      registeredCallbacks: this.cleanupCallbacks.size,
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Clear all cleanup callbacks
   */
  clearAllCleanups(): void {
    this.cleanupCallbacks.clear();
  }
}

// Export default instance
export const memoryManager = new MemoryManager();
export { MemoryManager as default };
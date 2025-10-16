/**
 * TimerOptimizer - Performance-optimized timer utilities
 *
 * Provides optimized alternatives to setTimeout/setInterval with:
 * - requestAnimationFrame for animation loops
 * - Performance monitoring
 * - Memory leak prevention
 * - Better browser compatibility
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../logging/StructuredLogger';

export interface TimerConfig {
  id?: string;
  duration?: number;
  interval?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
  onError?: (error: Error) => void;
  enableLogging?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export interface AnimationFrameConfig {
  id?: string;
  onFrame?: (timestamp: number) => void;
  onComplete?: () => void;
  duration?: number;
  enableLogging?: boolean;
}

export class TimerOptimizer {
  private static instance: TimerOptimizer;
  private logger: StructuredLogger;
  private activeTimers: Map<string, number> = new Map();
  private activeIntervals: Map<string, number> = new Map();
  private activeAnimationFrames: Map<string, number> = new Map();
  private performanceMetrics: {
    totalTimers: number;
    activeTimers: number;
    completedTimers: number;
    averageDuration: number;
  } = {
    totalTimers: 0,
    activeTimers: 0,
    completedTimers: 0,
    averageDuration: 0
  };

  constructor() {
    this.logger = new StructuredLogger('TimerOptimizer');
  }

  static getInstance(): TimerOptimizer {
    if (!TimerOptimizer.instance) {
      TimerOptimizer.instance = new TimerOptimizer();
    }
    return TimerOptimizer.instance;
  }

  /**
   * Optimized setTimeout with performance monitoring
   */
  setTimeout(callback: () => void, delay: number, config?: TimerConfig): string {
    const timerId = config?.id || `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (config?.enableLogging) {
      this.logger.debug('Timer created', { timerId, delay, priority: config.priority });
    }

    const startTime = performance.now();
    
    const timeoutId = window.setTimeout(() => {
      try {
        const duration = performance.now() - startTime;
        this.updateMetrics(duration);
        
        if (config?.enableLogging) {
          this.logger.debug('Timer completed', { timerId, duration });
        }
        
        callback();
        config?.onComplete?.();
        
        this.activeTimers.delete(timerId);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error('Timer callback error', { timerId, error: error.message });
        config?.onError?.(error as Error);
      }
    }, delay);

    this.activeTimers.set(timerId, timeoutId);
    this.performanceMetrics.totalTimers++;
    this.performanceMetrics.activeTimers++;

    return timerId;
  }

  /**
   * Optimized setInterval with performance monitoring
   */
  setInterval(callback: () => void, interval: number, config?: TimerConfig): string {
    const timerId = config?.id || `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (config?.enableLogging) {
      this.logger.debug('Interval created', { timerId, interval, priority: config.priority });
    }

    const startTime = performance.now();
    let executionCount = 0;
    
    const intervalId = window.setInterval(() => {
      try {
        executionCount++;
        const duration = performance.now() - startTime;
        
        if (config?.enableLogging) {
          this.logger.debug('Interval execution', { timerId, executionCount, duration });
        }
        
        callback();
        config?.onUpdate?.(executionCount);
        
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error('Interval callback error', { timerId, error: error.message });
        config?.onError?.(error as Error);
        this.clearInterval(timerId);
      }
    }, interval);

    this.activeIntervals.set(timerId, intervalId);
    this.performanceMetrics.totalTimers++;
    this.performanceMetrics.activeTimers++;

    return timerId;
  }

  /**
   * Optimized animation frame loop using requestAnimationFrame
   */
  requestAnimationFrame(callback: (timestamp: number) => void, config?: AnimationFrameConfig): string {
    const frameId = config?.id || `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (config?.enableLogging) {
      this.logger.debug('Animation frame requested', { frameId });
    }

    const startTime = performance.now();
    let frameCount = 0;
    
    const animate = (timestamp: number) => {
      try {
        frameCount++;
        const duration = performance.now() - startTime;
        
        if (config?.enableLogging) {
          this.logger.debug('Animation frame executed', { frameId, frameCount, duration });
        }
        
        callback(timestamp);
        config?.onFrame?.(timestamp);
        
        // Check if duration limit is reached
        if (config?.duration && duration >= config.duration) {
          this.cancelAnimationFrame(frameId);
          config?.onComplete?.();
          return;
        }
        
        // Continue animation loop
        const nextFrameId = window.requestAnimationFrame(animate);
        this.activeAnimationFrames.set(frameId, nextFrameId);
        
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error('Animation frame error', { frameId, error: error.message });
        this.cancelAnimationFrame(frameId);
      }
    };

    const initialFrameId = window.requestAnimationFrame(animate);
    this.activeAnimationFrames.set(frameId, initialFrameId);
    this.performanceMetrics.totalTimers++;
    this.performanceMetrics.activeTimers++;

    return frameId;
  }

  /**
   * Clear timeout by ID
   */
  clearTimeout(timerId: string): boolean {
    const timeoutId = this.activeTimers.get(timerId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      this.activeTimers.delete(timerId);
      this.performanceMetrics.activeTimers--;
      this.performanceMetrics.completedTimers++;
      
      this.logger.debug('Timer cleared', { timerId });
      return true;
    }
    return false;
  }

  /**
   * Clear interval by ID
   */
  clearInterval(timerId: string): boolean {
    const intervalId = this.activeIntervals.get(timerId);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.activeIntervals.delete(timerId);
      this.performanceMetrics.activeTimers--;
      this.performanceMetrics.completedTimers++;
      
      this.logger.debug('Interval cleared', { timerId });
      return true;
    }
    return false;
  }

  /**
   * Cancel animation frame by ID
   */
  cancelAnimationFrame(frameId: string): boolean {
    const animationFrameId = this.activeAnimationFrames.get(frameId);
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      this.activeAnimationFrames.delete(frameId);
      this.performanceMetrics.activeTimers--;
      this.performanceMetrics.completedTimers++;
      
      this.logger.debug('Animation frame cancelled', { frameId });
      return true;
    }
    return false;
  }

  /**
   * Clear all active timers
   */
  clearAllTimers(): void {
    // Clear timeouts
    for (const [timerId, timeoutId] of this.activeTimers) {
      window.clearTimeout(timeoutId);
    }
    this.activeTimers.clear();

    // Clear intervals
    for (const [timerId, intervalId] of this.activeIntervals) {
      window.clearInterval(intervalId);
    }
    this.activeIntervals.clear();

    // Cancel animation frames
    for (const [frameId, animationFrameId] of this.activeAnimationFrames) {
      window.cancelAnimationFrame(animationFrameId);
    }
    this.activeAnimationFrames.clear();

    this.performanceMetrics.activeTimers = 0;
    this.logger.info('All timers cleared', { 
      totalTimers: this.performanceMetrics.totalTimers,
      completedTimers: this.performanceMetrics.completedTimers
    });
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      activeTimeouts: this.activeTimers.size,
      activeIntervals: this.activeIntervals.size,
      activeAnimationFrames: this.activeAnimationFrames.size
    };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(duration: number): void {
    this.performanceMetrics.completedTimers++;
    this.performanceMetrics.activeTimers--;
    
    // Update average duration
    const totalDuration = this.performanceMetrics.averageDuration * (this.performanceMetrics.completedTimers - 1) + duration;
    this.performanceMetrics.averageDuration = totalDuration / this.performanceMetrics.completedTimers;
  }

  /**
   * Check for memory leaks
   */
  checkForLeaks(): { hasLeaks: boolean; leakCount: number; details: string[] } {
    const leaks: string[] = [];
    const totalActive = this.activeTimers.size + this.activeIntervals.size + this.activeAnimationFrames.size;
    
    if (totalActive > 100) {
      leaks.push(`High number of active timers: ${totalActive}`);
    }
    
    if (this.activeTimers.size > 50) {
      leaks.push(`High number of active timeouts: ${this.activeTimers.size}`);
    }
    
    if (this.activeIntervals.size > 20) {
      leaks.push(`High number of active intervals: ${this.activeIntervals.size}`);
    }
    
    if (this.activeAnimationFrames.size > 10) {
      leaks.push(`High number of active animation frames: ${this.activeAnimationFrames.size}`);
    }

    return {
      hasLeaks: leaks.length > 0,
      leakCount: leaks.length,
      details: leaks
    };
  }
}

// Export singleton instance
export const timerOptimizer = TimerOptimizer.getInstance();
export default timerOptimizer;
/**
 * EventListenerManager - Memory-safe event listener management
 *
 * Provides centralized event listener management with:
 * - Automatic cleanup and leak prevention
 * - Memory usage monitoring
 * - Lifecycle management
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../logging/StructuredLogger';

export interface EventListenerConfig {
  id?: string;
  target: EventTarget;
  event: string;
  listener: EventListener;
  options?: AddEventListenerOptions;
  priority?: 'high' | 'normal' | 'low';
  autoCleanup?: boolean;
  enableLogging?: boolean;
}

export interface EventListenerMetrics {
  totalListeners: number;
  activeListeners: number;
  cleanedUpListeners: number;
  memoryLeaks: number;
  averageListenerLifetime: number;
}

export class EventListenerManager {
  private static instance: EventListenerManager;
  private logger: StructuredLogger;
  private listeners: Map<string, EventListenerConfig> = new Map();
  private metrics: EventListenerMetrics = {
    totalListeners: 0,
    activeListeners: 0,
    cleanedUpListeners: 0,
    memoryLeaks: 0,
    averageListenerLifetime: 0
  };
  private listenerLifetimes: Map<string, { startTime: number; endTime?: number }> = new Map();

  constructor() {
    this.logger = StructuredLogger.getInstance('EventListenerManager');
    this.setupGlobalCleanup();
  }

  static getInstance(): EventListenerManager {
    if (!EventListenerManager.instance) {
      EventListenerManager.instance = new EventListenerManager();
    }
    return EventListenerManager.instance;
  }

  /**
   * Add an event listener with automatic management
   */
  addEventListener(config: EventListenerConfig): string {
    const listenerId = config.id! || `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.listeners.has(listenerId)) {
      StructuredLogger.warn('Listener ID already exists' ?? 'unknown', { listenerId });
      return listenerId;
    }

    try {
      // Add the event listener
      config.target.addEventListener(config.event, listener: config.listener, config.options);
      
      // Store configuration for management
      this.listeners.set(listenerId, {
        ...config,
        id: listenerId
      });

      // Track lifetime
      this.listenerLifetimes.set(listenerId, { startTime: new Date() });

      // Update metrics
      this.metrics.totalListeners++;
      this.metrics.activeListeners++;

      if (config.enableLogging) {
        StructuredLogger.debug('Event listener added', {
          listenerId,
          event: config.event,
          target: config.target.constructor.name,
          priority: config.priority
        });
      }

      return listenerId;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      StructuredLogger.error('Failed to add event listener', {
        listenerId,
        event: config.event,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove an event listener by ID
   */
  removeEventListener(listenerId: string): boolean {
    const config = this.listeners.get(listenerId);
    if (!config) {
      StructuredLogger.warn('Listener not found' ?? 'unknown', { listenerId });
      return false;
    }

    try {
      // Remove the event listener
      config.target.removeEventListener(config.event, listener: config.listener, config.options);
      
      // Update lifetime tracking
      const lifetime = this.listenerLifetimes.get(listenerId);
      if (lifetime) {
        lifetime.endTime = Date.now();
        const duration = lifetime.endTime - lifetime.startTime;
        this.updateAverageLifetime(duration);
      }

      // Clean up tracking
      this.listeners.delete(listenerId);
      this.listenerLifetimes.delete(listenerId);

      // Update metrics
      this.metrics.activeListeners--;
      this.metrics.cleanedUpListeners++;

      if (config.enableLogging) {
        StructuredLogger.debug('Event listener removed', {
          listenerId,
          event: config.event,
          target: config.target.constructor.name
        });
      }

      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      StructuredLogger.error('Failed to remove event listener', {
        listenerId,
        event: config.event,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Remove all event listeners for a specific target
   */
  removeAllListenersForTarget(target: EventTarget): number {
    let removedCount = 0;
    const listenersToRemove: string[] = [];

    for (const [listenerId, config] of this.listeners) {
      if (config.target === target) {
        listenersToRemove.push(listenerId);
      }
    }

    for (const listenerId of listenersToRemove) {
      if (this.removeEventListener(listenerId)) {
        removedCount++;
      }
    }

    StructuredLogger.info('Removed all listeners for target', {
      target: target.constructor.name,
      removedCount
    });

    return removedCount;
  }

  /**
   * Remove all event listeners for a specific event type
   */
  removeAllListenersForEvent(event: string): number {
    let removedCount = 0;
    const listenersToRemove: string[] = [];

    for (const [listenerId, config] of this.listeners) {
      if (config.event === event) {
        listenersToRemove.push(listenerId);
      }
    }

    for (const listenerId of listenersToRemove) {
      if (this.removeEventListener(listenerId)) {
        removedCount++;
      }
    }

    StructuredLogger.info('Removed all listeners for event', {
      event,
      removedCount
    });

    return removedCount;
  }

  /**
   * Clean up all event listeners
   */
  cleanupAllListeners(): number {
    let cleanedCount = 0;
    const listenerIds = Array.from(this.listeners.keys());

    for (const listenerId of listenerIds) {
      if (this.removeEventListener(listenerId)) {
        cleanedCount++;
      }
    }

    StructuredLogger.info('Cleaned up all event listeners', {
      totalCleaned: cleanedCount,
      remainingActive: this.metrics.activeListeners
    });

    return cleanedCount;
  }

  /**
   * Get listeners by target
   */
  getListenersByTarget(target: EventTarget): EventListenerConfig[] {
    const listeners: EventListenerConfig[] = [];
    
    for (const config of this.listeners.values()) {
      if (config.target === target) {
        listeners.push(config);
      }
    }

    return listeners;
  }

  /**
   * Get listeners by event type
   */
  getListenersByEvent(event: string): EventListenerConfig[] {
    const listeners: EventListenerConfig[] = [];
    
    for (const config of this.listeners.values()) {
      if (config.event === event) {
        listeners.push(config);
      }
    }

    return listeners;
  }

  /**
   * Check for memory leaks
   */
  checkForLeaks(): { hasLeaks: boolean; leakCount: number; details: string[] } {
    const leaks: string[] = [];
    
    // Check for too many active listeners
    if (this.metrics.activeListeners > 100) {
      leaks.push(`High number of active listeners: ${this.metrics.activeListeners}`);
    }

    // Check for listeners with very long lifetimes
    const now = Date.now();
    for (const [listenerId, lifetime] of this.listenerLifetimes) {
      const age = now - lifetime.startTime;
      if (age > 300000) { // 5 minutes
        leaks.push(`Long-running listener: ${listenerId} (${Math.round(age / 1000)}s)`);
      }
    }

    // Check for listeners on detached DOM nodes
    for (const [listenerId, config] of this.listeners) {
      if (config.target instanceof Node && !document.contains(config.target)) {
        leaks.push(`Listener on detached node: ${listenerId}`);
      }
    }

    return {
      hasLeaks: leaks.length > 0,
      leakCount: leaks.length,
      details: leaks
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): EventListenerMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed listener information
   */
  getListenerDetails(): Array<{
    id: string;
    event: string;
    target: string;
    priority: string;
    lifetime: number;
    isActive: boolean;
  }> {
    const details: Array<{
      id: string;
      event: string;
      target: string;
      priority: string;
      lifetime: number;
      isActive: boolean;
    }> = [];

    for (const [listenerId, config] of this.listeners) {
      const lifetime = this.listenerLifetimes.get(listenerId);
      const lifetimeMs = lifetime ? Date.now() - startTime: 0;

      details.push({
        id: listenerId,
        event: config.event,
        target: config.target.constructor.name,
        priority: config.priority! || 'normal',
        lifetime: lifetimeMs,
        isActive: true
      });
    }

    return details;
  }

  /**
   * Setup global cleanup on page unload
   */
  private setupGlobalCleanup(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanupAllListeners();
      });
    }
  }

  /**
   * Update average listener lifetime
   */
  private updateAverageLifetime(duration: number): void {
    const totalLifetime = this.metrics.averageListenerLifetime * this.metrics.cleanedUpListeners + duration;
    this.metrics.averageListenerLifetime = totalLifetime / (this.metrics.cleanedUpListeners + 1);
  }
}

// Export singleton instance
export const eventListenerManager = EventListenerManager.getInstance();
export default eventListenerManager;
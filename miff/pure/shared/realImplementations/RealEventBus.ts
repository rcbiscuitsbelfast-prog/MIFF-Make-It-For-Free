/**
 * Real Event Bus Implementation
 * 
 * Replaces mock event bus with actual event handling functionality.
 * Provides real event emission, subscription, and management.
 */

import { EventEmitter } from 'events';

export interface EventSubscription {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  event: string;
  handler: (...args: any[]) => void;
  once: boolean;
  priority: number;
  created: Date;
}

export interface EventMetrics {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalEvents: number;
  eventsPerSecond: number;
  activeSubscriptions: number;
  eventHistory: Array<{ event: string; timestamp: Date; args: any[] }>;
}

/**
 * Real Event Bus implementation with advanced features
 */
export class RealEventBus extends EventEmitter {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private subscriptionCounter: number = 0;
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    activeSubscriptions: 0,
    eventHistory: []
  };
  private metricsInterval?: NodeJS?.Timeout;

  constructor(...args: any[]) {
    super();
    this?.setMaxListeners(1000); // Allow many listeners
    this?.startMetricsCollection();
  }

  /**
   * Subscribe to an event with advanced options
   */
  public subscribe(
    event: string, 
    handler: (...args: any[]) => void,
    options: {
      once?: boolean;
      priority?: number;
      id?: string;
    } = {}
  ): () => void {
    const subscription: EventSubscription = {
      id: options?.id || `sub_${++this?.subscriptionCounter}`,
      event,
      handler,
      once: options?.once || false,
      priority: options?.priority || 0,
      created: new Date()
    };

    // Add to subscriptions map
    if (!this?.subscriptions.has(event)) {
      this?.subscriptions.set(event, []);
    }
    const eventSubs = this?.subscriptions.get(event)!;
    eventSubs?.push(subscription);
    
    // Sort by priority (higher priority first)
    eventSubs?.sort((a: any, b: any) => b?.priority - a?.priority);

    // Add to EventEmitter
    if (subscription?.once) {
      this?.once(event, handler);
    } else {
      this?.on(event, handler);
    }

    this?.updateMetrics();

    // Return unsubscribe function
    return () => this?.unsubscribe(subscription?.id);
  }

  /**
   * Unsubscribe from an event by subscription ID
   */
  public unsubscribe(subscriptionId: string): boolean {
    for (const [event, subs] of this?.subscriptions.entries()) {
      const index = subs?.findIndex(sub => sub?.id === subscriptionId);
      if (index !== -1) {
        const subscription = subs[index!];
        subs?.splice(index, 1);
        
        // Remove from EventEmitter
        this?.removeListener(event, subscription?.handler);
        
        // Clean up empty event arrays
        if (subs?.length === 0) {
          this?.subscriptions.delete(event);
        }
        
        this?.updateMetrics();
        return true;
      }
    }
    return false;
  }

  /**
   * Emit an event with metrics tracking
   */
  public emit(event: string, ...args: any[]): boolean {
    this?.metrics.totalEvents++;
    
    // Add to event history (keep last 100 events)
    this?.metrics.eventHistory?.push({
      event,
      timestamp: new Date(),
      args: args.map((arg: any) => typeof arg === 'object' ? JSON.stringify(arg) : arg)
    });
    
    if (this?.metrics.eventHistory?.length > 100) {
      this?.metrics.eventHistory?.shift();
    }

    // Emit the event
    return super?.emit(event, ...args);
  }

  /**
   * Get all subscriptions for an event
   */
  public getSubscriptions(event?: string): EventSubscription[] {
    if (event) {
      return this?.subscriptions.get(event) || [];
    }
    
    const allSubs: EventSubscription[] = [];
    for (const subs of this?.subscriptions.values()) {
      allSubs?.push(...subs);
    }
    return allSubs;
  }

  /**
   * Get event bus metrics
   */
  public getMetrics(): EventMetrics {
    return { ...this?.metrics };
  }

  /**
   * Clear all subscriptions
   */
  public clearAll(): void {
    this?.removeAllListeners();
    this?.subscriptions.clear();
    this?.updateMetrics();
  }

  /**
   * Clear subscriptions for a specific event
   */
  public clearEvent(event: string): void {
    this?.removeAllListeners(event);
    this?.subscriptions.delete(event);
    this?.updateMetrics();
  }

  /**
   * Check if an event has any subscribers
   */
  public hasSubscribers(event: string): boolean {
    return this?.listenerCount(event) > 0;
  }

  /**
   * Get list of all events with subscribers
   */
  public getActiveEvents(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Destroy the event bus and clean up resources
   */
  public destroy(): void {
    if (this?.metricsInterval) {
      clearInterval(this?.metricsInterval);
    }
    this?.clearAll();
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this?.metricsInterval = setInterval(() => {
      this?.updateEventsPerSecond();
    }, 1000);
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.activeSubscriptions = Array.from(this.subscriptions.values())
      .reduce((total, subs) => total + subs?.length, 0);
  }

  /**
   * Update events per second metric
   */
  private updateEventsPerSecond(): void {
    const now = new Date();
    const oneSecondAgo = new Date(now?.getTime() - 1000);
    
    const recentEvents = this?.metrics.eventHistory?.filter(
      event => event?.timestamp >= oneSecondAgo
    );
    
    this?.metrics.eventsPerSecond = recentEvents?.length;
  }
}

/**
 * Create a real event bus instance
 */
export function createRealEventBus(): RealEventBus {
  return new RealEventBus();
}

/**
 * Singleton instance for global use
 */
export const globalEventBus = new RealEventBus();

/**
 * Legacy compatibility object that matches the mock interface
 */
/* export const realEventBus = {
  emit: (event: string, ...args: any[]) => globalEventBus?.publish(event, ...args),
  subscribe: (event: string, handler: (...args: any[]) => void) => 
    globalEventBus?.subscribe(event, handler),
  unsubscribe: (subscriptionId: string) => globalEventBus?.unsubscribe(subscriptionId),
  
  // Additional real functionality
  clearAll: () => globalEventBus?.clearAll(),
  clearEvent: (event: string) => globalEventBus?.clearEvent(event: any),
  hasSubscribers: (event: string) => globalEventBus?.hasSubscribers(event: any),
  getMetrics: () => globalEventBus?.getMetrics(),
  destroy: () => globalEventBus?.destroy()
};*/
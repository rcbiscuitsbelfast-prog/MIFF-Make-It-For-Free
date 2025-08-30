/**
 * EventBusPure.ts - Core event system for inter-module communication
 * 
 * MIFF Framework - Make It For Free
 * License: AGPL-3.0 (remix-safe, see LICENSE.md)
 * 
 * Inspired by Delta Engine's event-driven architecture and Crystal Space's CEL system.
 * Provides publish-subscribe messaging for decoupled module communication.
 * 
 * Usage:
 *   const eventBus = new EventBusPure();
 *   eventBus.subscribe('playerDied', (data) => console.log('Player died:', data));
 *   eventBus.publish('playerDied', { playerId: 123, cause: 'fall' });
 * 
 * Remix Safety:
 *   - No external dependencies
 *   - All methods are pure functions
 *   - Event handlers are isolated from engine state
 *   - Easy to extend with new event types
 */

export interface EventData {
  [key: string]: any;
}

export interface EventListener<T = EventData> {
  (data: T): void;
}

export interface EventSubscription {
  unsubscribe(): void;
}

/**
 * Core event bus implementation
 * Manages all inter-module communication in MIFF
 */
export class EventBusPure {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private onceListeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: Map<string, EventData[]> = new Map();
  private maxHistorySize: number = 100;

  /**
   * Subscribe to an event with a callback function
   * @param eventType - The event name to listen for
   * @param listener - Function to call when event is published
   * @returns Subscription object with unsubscribe method
   */
  subscribe<T = EventData>(
    eventType: string, 
    listener: EventListener<T>
  ): EventSubscription {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener as EventListener);
    
    return {
      unsubscribe: () => {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
          eventListeners.delete(listener as EventListener);
          if (eventListeners.size === 0) {
            this.listeners.delete(eventType);
          }
        }
      }
    };
  }

  /**
   * Subscribe to an event that will only fire once
   * Automatically unsubscribes after first event
   */
  once<T = EventData>(
    eventType: string, 
    listener: EventListener<T>
  ): EventSubscription {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }
    
    this.onceListeners.get(eventType)!.add(listener as EventListener);
    
    return {
      unsubscribe: () => {
        const eventListeners = this.onceListeners.get(eventType);
        if (eventListeners) {
          eventListeners.delete(listener as EventListener);
        }
      }
    };
  }

  /**
   * Publish an event to all subscribers
   * @param eventType - The event name to publish
   * @param data - Event payload data
   */
  publish(eventType: string, data: EventData = {}): void {
    // Add timestamp and event type to data
    const eventData = {
      ...data,
      timestamp: Date.now(),
      eventType: eventType
    };

    // Store in history for debugging and replay systems
    if (!this.eventHistory.has(eventType)) {
      this.eventHistory.set(eventType, []);
    }
    
    const history = this.eventHistory.get(eventType)!;
    history.push(eventData);
    
    // Limit history size to prevent memory leaks
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // Notify regular subscribers
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      // Create array to avoid modification during iteration
      const listenersArray = Array.from(listeners);
      listenersArray.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`EventBus: Error in listener for ${eventType}:`, error);
        }
      });
    }

    // Notify once-only subscribers and remove them
    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners) {
      const onceListenersArray = Array.from(onceListeners);
      onceListenersArray.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`EventBus: Error in once-listener for ${eventType}:`, error);
        }
      });
      
      // Clear once listeners after firing
      this.onceListeners.delete(eventType);
    }
  }

  /**
   * Remove all listeners for a specific event type
   * Useful for module cleanup and event system reset
   */
  removeAllListeners(eventType: string): void {
    this.listeners.delete(eventType);
    this.onceListeners.delete(eventType);
    this.eventHistory.delete(eventType);
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get event history for debugging and replay
   */
  getEventHistory(eventType: string): EventData[] {
    return this.eventHistory.get(eventType) || [];
  }

  /**
   * Clear all event history
   */
  clearEventHistory(): void {
    this.eventHistory.clear();
  }

  /**
   * Get current listener count for an event type
   */
  getListenerCount(eventType: string): number {
    const regularListeners = this.listeners.get(eventType)?.size || 0;
    const onceListeners = this.onceListeners.get(eventType)?.size || 0;
    return regularListeners + onceListeners;
  }

  /**
   * Check if there are any listeners for an event type
   */
  hasListeners(eventType: string): boolean {
    return this.getListenerCount(eventType) > 0;
  }
}
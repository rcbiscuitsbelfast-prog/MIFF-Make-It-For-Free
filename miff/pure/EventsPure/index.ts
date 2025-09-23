/**
 * EventsPure - Event bus system for modular gameplay
 *
 * A lightweight event bus providing publish/subscribe functionality
 * with string topic routing and disposable subscriptions.
 *
 * @module EventsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Event listener interface for type-safe event handling
 */
export interface IEventListener extends Disposable {
  readonly topic: string;
  readonly handler: (payload?: any) => void;
  readonly disposed: boolean;
}

/**
 * Event bus for publish/subscribe messaging
 */
export class EventBus {
  private readonly topicToHandlers = new Map<string, Set<(payload?: any) => void>>();

  /**
   * Publish an event to all subscribers of the topic
   */
  publish(topic: string, payload?: any): void {
    if (!topic || topic.trim() === '') return;

    const handlers = this.topicToHandlers.get(topic);
    if (handlers) {
      // Create a copy of handlers to avoid issues with concurrent modifications
      const handlersCopy = new Set(handlers);
      for (const handler of handlersCopy) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for topic '${topic}':`, error);
        }
      }
    }
  }

  /**
   * Subscribe to events on a topic
   */
  subscribe(topic: string, handler: (payload?: any) => void): IEventListener {
    if (!this.topicToHandlers.has(topic)) {
      this.topicToHandlers.set(topic, new Set());
    }

    const handlers = this.topicToHandlers.get(topic)!;
    handlers.add(handler);

    return new EventListener(topic, handler, (topic, handler) => {
      this.unsubscribe(topic, handler);
    });
  }

  /**
   * Unsubscribe a handler from a topic
   */
  private unsubscribe(topic: string, handler: (payload?: any) => void): void {
    const handlers = this.topicToHandlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.topicToHandlers.delete(topic);
      }
    }
  }

  /**
   * Get the number of subscribers for a topic
   */
  getSubscriberCount(topic: string): number {
    return this.topicToHandlers.get(topic)?.size || 0;
  }

  /**
   * Get all topics that have subscribers
   */
  getActiveTopics(): string[] {
    return Array.from(this.topicToHandlers.keys());
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.topicToHandlers.clear();
  }

  /**
   * Get total number of subscriptions across all topics
   */
  getTotalSubscriptions(): number {
    let total = 0;
    for (const handlers of this.topicToHandlers.values()) {
      total += handlers.size;
    }
    return total;
  }
}

/**
 * Disposable event listener wrapper
 */
export class EventListener implements IEventListener {
  private _disposed = false;

  constructor(
    private readonly _topic: string,
    private readonly _handler: (payload?: any) => void,
    private readonly _unsubscribe: (topic: string, handler: (payload?: any) => void) => void
  ) {}

  get topic(): string {
    return this._topic;
  }

  get handler(): (payload?: any) => void {
    return this._handler;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose of this subscription
   */
  dispose(): void {
    if (this._disposed) return;
    this._unsubscribe(this._topic, this._handler);
    this._disposed = true;
  }

  /**
   * Manual unsubscribe (alias for dispose)
   */
  unsubscribe(): void {
    this.dispose();
  }
}

/**
 * Create a new event bus instance
 */
export function createEventBus(): EventBus {
  return new EventBus();
}

/**
 * Default event bus instance
 */
export const defaultEventBus = new EventBus();

/**
 * Utility functions for common event patterns
 */
export const EventUtils = {
  /**
   * Create a one-time event listener
   */
  once(eventBus: EventBus, topic: string, handler: (payload?: any) => void): IEventListener {
    const onceHandler = (payload?: any) => {
      handler(payload);
      listener.dispose();
    };

    const listener = eventBus.subscribe(topic, onceHandler);
    return listener;
  },

  /**
   * Create a filtered event listener
   */
  filter<T>(
    eventBus: EventBus,
    topic: string,
    predicate: (payload: T) => boolean,
    handler: (payload: T) => void
  ): IEventListener {
    const filterHandler = (payload: T) => {
      if (predicate(payload)) {
        handler(payload);
      }
    };

    return eventBus.subscribe(topic, filterHandler);
  },

  /**
   * Create a debounced event listener
   */
  debounce(
    eventBus: EventBus,
    topic: string,
    delayMs: number,
    handler: (payload?: any) => void
  ): IEventListener {
    let timeoutId: number | null = null;
    let lastPayload: any = null;

    const debouncedHandler = (payload: any) => {
      lastPayload = payload;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        handler(lastPayload);
        timeoutId = null;
        lastPayload = null;
      }, delayMs);
    };

    const listener = eventBus.subscribe(topic, debouncedHandler);

    // Cleanup timeout on dispose
    const originalDispose = listener.dispose.bind(listener);
    listener.dispose = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      originalDispose();
    };

    return listener;
  },

  /**
   * Create a throttled event listener
   */
  throttle(
    eventBus: EventBus,
    topic: string,
    intervalMs: number,
    handler: (payload?: any) => void
  ): IEventListener {
    let lastCall = 0;
    let pendingCall: (() => void) | null = null;

    const throttledHandler = (payload: any) => {
      const now = Date.now();

      if (now - lastCall >= intervalMs) {
        handler(payload);
        lastCall = now;
      } else if (pendingCall === null) {
        pendingCall = () => {
          handler(payload);
          lastCall = Date.now();
          pendingCall = null;
        };

        setTimeout(pendingCall, intervalMs - (now - lastCall));
      }
    };

    return eventBus.subscribe(topic, throttledHandler);
  }
};
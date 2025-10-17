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
  readonly handler: (payload?: any) => void | Promise<void>;
  readonly disposed: boolean;
}

/**
 * Async event listener interface for async event handling
 */
export interface IAsyncEventListener extends Disposable {
  readonly topic: string;
  readonly handler: (payload?: any) => Promise<void>;
  readonly disposed: boolean;
}

/**
 * Event bus for publish/subscribe messaging
 */
export class EventBus {
  private readonly topicToHandlers = new Map<string, Set<(payload?: any) => void | Promise<void>>>();
  private readonly asyncTopicToHandlers = new Map<string, Set<(payload?: any) => Promise<void>>>();

  /**
   * Publish an event to all subscribers of the topic (synchronous)
   */
  publish(topic: string, payload?: any): void {
    if (!topic || topic.trim() === '') return;

    const handlers = this.topicToHandlers.get(topic);
    if (handlers) {
      // Create a copy of handlers to avoid issues with concurrent modifications
      const handlersCopy = new Set(handlers);
      for (const handler of handlersCopy) {
        try {
          const result = handler(payload);
          // If handler returns a Promise, we need to handle it
          if (result && typeof result.then === 'function') {
            result.catch(error => {
              console.error(`Error in async event handler for topic '${topic}':`, err instanceof Error ? message: String(err));
            });
          }
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Error in event handler for topic '${topic}':`, err instanceof Error ? message: String(err));
        }
      }
    }
  }

  /**
   * Publish an event to all subscribers of the topic (asynchronous)
   */
  async publishAsync(topic: string, payload?: any): Promise<void> {
    if (!topic || topic.trim() === '') return;

    const handlers = this.topicToHandlers.get(topic);
    const asyncHandlers = this.asyncTopicToHandlers.get(topic);

    // Execute sync handlers (with async support)
    if (handlers) {
      const handlersCopy = new Set(handlers);
      const promises: Promise<void>[] = [];

      for (const handler of handlersCopy) {
        try {
          const result = handler(payload);
          if (result && typeof result.then === 'function') {
            promises.push(result);
          }
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Error in event handler for topic '${topic}':`, err instanceof Error ? message: String(err));
          // Don't add failed handlers to promises
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }

    // Execute async handlers
    if (asyncHandlers) {
      const asyncHandlersCopy = new Set(asyncHandlers);
      const promises: Promise<void>[] = [];

      for (const handler of asyncHandlersCopy) {
        try {
          promises.push(handler(payload));
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Error in async event handler for topic '${topic}':`, err instanceof Error ? message: String(err));
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }
  }

  /**
   * Subscribe to events on a topic
   */
  subscribe(topic: string, handler: (payload?: any) => void | Promise<void>): IEventListener {
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
   * Subscribe to events on a topic with async handler
   */
  subscribeAsync(topic: string, handler: (payload?: any) => Promise<void>): IAsyncEventListener {
    if (!this.asyncTopicToHandlers.has(topic)) {
      this.asyncTopicToHandlers.set(topic, new Set());
    }

    const handlers = this.asyncTopicToHandlers.get(topic)!;
    handlers.add(handler);

    return new AsyncEventListener(topic, handler, (topic, handler) => {
      this.unsubscribeAsync(topic, handler);
    });
  }

  /**
   * Unsubscribe a handler from a topic
   */
  private unsubscribe(topic: string, handler: (payload?: any) => void | Promise<void>): void {
    const handlers = this.topicToHandlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.topicToHandlers.delete(topic);
      }
    }
  }

  /**
   * Unsubscribe an async handler from a topic
   */
  private unsubscribeAsync(topic: string, handler: (payload?: any) => Promise<void>): void {
    const handlers = this.asyncTopicToHandlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.asyncTopicToHandlers.delete(topic);
      }
    }
  }

  /**
   * Get the number of subscribers for a topic
   */
  getSubscriberCount(topic: string): number {
    const syncCount = this.topicToHandlers.get(topic)?.size || 0;
    const asyncCount = this.asyncTopicToHandlers.get(topic)?.size || 0;
    return syncCount + asyncCount;
  }

  /**
   * Get all topics that have subscribers
   */
  getActiveTopics(): string[] {
    const syncTopics = Array.from(this.topicToHandlers.keys());
    const asyncTopics = Array.from(this.asyncTopicToHandlers.keys());
    return [...new Set([...syncTopics, ...asyncTopics])];
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.topicToHandlers.clear();
    this.asyncTopicToHandlers.clear();
  }

  /**
   * Get total number of subscriptions across all topics
   */
  getTotalSubscriptions(): number {
    let total = 0;
    for (const handlers of this.topicToHandlers.values()) {
      total += handlers.size;
    }
    for (const handlers of this.asyncTopicToHandlers.values()) {
      total += handlers.size;
    }
    return total;
  }

  /**
   * Get statistics about event bus
   */
  getStats(): { syncHandlers: number; asyncHandlers: number; totalTopics: number } {
    let syncHandlers = 0;
    let asyncHandlers = 0;

    for (const handlers of this.topicToHandlers.values()) {
      syncHandlers += handlers.size;
    }
    for (const handlers of this.asyncTopicToHandlers.values()) {
      asyncHandlers += handlers.size;
    }

    return {
      syncHandlers,
      asyncHandlers,
      totalTopics: this.getActiveTopics().length
    };
  }
}

/**
 * Disposable event listener wrapper
 */
export class EventListener implements IEventListener {
  private _disposed = false;

  constructor(
    private readonly _topic: string,
    private readonly _handler: (payload?: any) => void | Promise<void>,
    private readonly _unsubscribe: (topic: string, handler: (payload?: any) => void | Promise<void>) => void
  ) {}

  get topic(): string {
    return this._topic;
  }

  get handler(): (payload?: any) => void | Promise<void> {
    return this._handler;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose of this subscription
   */
  dispose(): void 
    if (this._disposed) return;
    this._unsubscribe(_topic: this._topic, this._handler);
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
 * Disposable async event listener wrapper
 */
export class AsyncEventListener implements IAsyncEventListener {
  private _disposed = false;

  constructor(
    private readonly _topic: string,
    private readonly _handler: (payload?: any) => Promise<void>,
    private readonly _unsubscribe: (topic: string, handler: (payload?: any) => Promise<void>) => void
  ) {}

  get topic(): string {
    return this._topic;
  }

  get handler(): (payload?: any) => Promise<void> {
    return this._handler;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose of this subscription
   */
  dispose(): void 
    if (this._disposed) return;
    this._unsubscribe(_topic: this._topic, this._handler);
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
  once(eventBus: EventBus, topic: string, handler: (payload?: any) => void | Promise<void>): IEventListener {
    const onceHandler = (payload?: any) => {
      const result = handler(payload);
      listener.dispose();
      return result;
    };

    const listener = eventBus.subscribe(topic, onceHandler);
    return listener;
  },

  /**
   * Create a one-time async event listener
   */
  onceAsync(eventBus: EventBus, topic: string, handler: (payload?: any) => Promise<void>): IAsyncEventListener {
    let disposed = false;

    const onceHandler = async (payload?: any) => {
      if (disposed) return;
      disposed = true;
      try {
        await handler(payload);
      } finally {
        listener.dispose();
      }
    };

    const listener = eventBus.subscribeAsync(topic, onceHandler);
    return listener;
  },

  /**
   * Create a filtered event listener
   */
  filter<T extends object>(
    eventBus: EventBus,
    topic: string,
    predicate: (payload: T) => boolean,
    handler: (payload: T) => void | Promise<void>
  ): IEventListener {
    const filterHandler = (payload: T) => {
      if (predicate(payload)) {
        return handler(payload);
      }
    };

    return eventBus.subscribe(topic, filterHandler);
  },

  /**
   * Create a filtered async event listener
   */
  filterAsync<T extends object>(
    eventBus: EventBus,
    topic: string,
    predicate: (payload: T) => boolean,
    handler: (payload: T) => Promise<void>
  ): IAsyncEventListener {
    const filterHandler = async (payload: T) => {
      if (predicate(payload)) {
        try {
          await handler(payload);
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error('Error in filtered async handler:', err instanceof Error ? message: String(err));
        }
      }
    };

    return eventBus.subscribeAsync(topic, filterHandler);
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
    let timeoutId: any = null;
    let lastPayload: any = null;
    let isPending = false;

    const debouncedHandler = (payload: any) => {
      lastPayload = payload;
      isPending = true;

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (isPending && lastPayload !== null) {
          handler(lastPayload);
          isPending = false;
          lastPayload = null;
        }
        timeoutId = null;
      }, delayMs);
    };

    const listener = eventBus.subscribe(topic, debouncedHandler);

    // Cleanup timeout on dispose
    const originalDispose = listener.dispose.bind(listener);
    listener.dispose = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      isPending = false;
      lastPayload = null;
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
    let pendingTimeout: any = null;
    let isThrottled = false;

    const throttledHandler = (payload: any) => {
      const now = Date.now();

      if (!isThrottled) {
        handler(payload);
        lastCall = now;
        isThrottled = true;

        pendingTimeout = setTimeout(() => {
          isThrottled = false;
          pendingTimeout = null;
        }, intervalMs);
      }
    };

    const listener = eventBus.subscribe(topic, throttledHandler);

    // Cleanup timeout on dispose
    const originalDispose = listener.dispose.bind(listener);
    listener.dispose = () => {
      if (pendingTimeout !== null) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
      isThrottled = false;
      originalDispose();
    };

    return listener;
  }
};
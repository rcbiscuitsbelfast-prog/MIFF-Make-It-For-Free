/**
 * EventBusPure.ts - Event and Messaging System
 * 
 * Inspired by Delta Engine event bus and Panda3D messenger.
 * Provides pub/sub messaging, event routing, and network replication capabilities.
 * 
 * Delta Engine's event bus provides a centralized messaging system for decoupled
 * communication between game systems. Panda3D's messenger system handles message
 * routing and delivery with support for different message types and priorities.
 * 
 * This module adapts these concepts to provide a pure, remix-safe event system
 * that supports local and network messaging, event filtering, and priority handling.
 */

export interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  source: string;
  priority: EventPriority;
  metadata: Record<string, any>;
}

export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface EventHandler {
  id: string;
  eventType: string;
  handler: (event: Event) => void | Promise<void>;
  priority: EventPriority;
  filter?: (event: Event) => boolean;
  once: boolean;
}

export interface EventBusConfig {
  maxEvents: number;
  enableReplication: boolean;
  networkLatency: number;
  eventTimeout: number;
  enableLogging: boolean;
  replicationFilter: (event: Event) => boolean;
}

export interface NetworkMessage {
  id: string;
  event: Event;
  target: string | 'broadcast';
  reliable: boolean;
  timestamp: number;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  active: boolean;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  averageLatency: number;
  droppedEvents: number;
  networkMessages: number;
}

/**
 * Event Bus System
 * 
 * Centralized event messaging system with pub/sub pattern.
 */
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private events: Event[] = [];
  private subscriptions: Map<string, EventSubscription> = new Map();
  private config: EventBusConfig;
  private stats: EventStats;
  private networkCallbacks: Map<string, (message: NetworkMessage) => void> = new Map();

  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: false,
      replicationFilter: () => true,
      ...config
    };

    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      averageLatency: 0,
      droppedEvents: 0,
      networkMessages: 0
    };
  }

  /**
   * Subscribe to an event type
   */
  subscribe(
    eventType: string,
    handler: (event: Event) => void | Promise<void>,
    options: {
      id?: string;
      priority?: EventPriority;
      filter?: (event: Event) => boolean;
      once?: boolean;
    } = {}
  ): string {
    const subscriptionId = options.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const eventHandler: EventHandler = {
      id: subscriptionId,
      eventType,
      handler,
      priority: options.priority || EventPriority.NORMAL,
      filter: options.filter,
      once: options.once || false
    };

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(eventHandler);
    
    // Sort by priority (higher priority first)
    this.handlers.get(eventType)!.sort((a, b) => b.priority - a.priority);

    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler: eventHandler,
      active: true
    };

    this.subscriptions.set(subscriptionId, subscription);

    if (this.config.enableLogging) {
      console.log(`📡 Event subscription created: ${eventType} (${subscriptionId})`);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    const handlers = this.handlers.get(subscription.eventType);
    if (handlers) {
      const index = handlers.findIndex(h => h.id === subscriptionId);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }

    subscription.active = false;
    this.subscriptions.delete(subscriptionId);

    if (this.config.enableLogging) {
      console.log(`📡 Event subscription removed: ${subscriptionId}`);
    }

    return true;
  }

  /**
   * Publish an event
   */
  async publish(
    eventType: string,
    data: any,
    options: {
      id?: string;
      source?: string;
      priority?: EventPriority;
      metadata?: Record<string, any>;
      replicate?: boolean;
    } = {}
  ): Promise<string> {
    const eventId = options.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: Event = {
      id: eventId,
      type: eventType,
      data,
      timestamp: Date.now(),
      source: options.source || 'local',
      priority: options.priority || EventPriority.NORMAL,
      metadata: options.metadata || {}
    };

    // Add to events list
    this.events.push(event);
    if (this.events.length > this.config.maxEvents) {
      this.events.shift();
      this.stats.droppedEvents++;
    }

    // Update stats
    this.stats.totalEvents++;
    this.stats.eventsByType[eventType] = (this.stats.eventsByType[eventType] || 0) + 1;

    if (this.config.enableLogging) {
      console.log(`📢 Event published: ${eventType} (${eventId})`);
    }

    // Handle replication
    if (this.config.enableReplication && options.replicate !== false) {
      if (this.config.replicationFilter(event)) {
        await this.replicateEvent(event);
      }
    }

    // Process event handlers
    await this.processEvent(event);

    return eventId;
  }

  /**
   * Process an event through its handlers
   */
  private async processEvent(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers) {
      return;
    }

    const handlersToRemove: string[] = [];

    for (const handler of handlers) {
      if (!handler.filter || handler.filter(event)) {
        try {
          await handler.handler(event);
          
          if (handler.once) {
            handlersToRemove.push(handler.id);
          }
        } catch (error) {
          console.error(`Error in event handler ${handler.id}:`, error);
        }
      }
    }

    // Remove one-time handlers
    for (const handlerId of handlersToRemove) {
      this.unsubscribe(handlerId);
    }
  }

  /**
   * Replicate event to network
   */
  private async replicateEvent(event: Event): Promise<void> {
    const message: NetworkMessage = {
      id: `net_${event.id}`,
      event,
      target: 'broadcast',
      reliable: event.priority >= EventPriority.HIGH,
      timestamp: Date.now()
    };

    this.stats.networkMessages++;

    // Simulate network latency
    if (this.config.networkLatency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.networkLatency));
    }

    // Call network callbacks
    for (const callback of this.networkCallbacks.values()) {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in network callback:', error);
      }
    }

    if (this.config.enableLogging) {
      console.log(`🌐 Event replicated: ${event.type} (${event.id})`);
    }
  }

  /**
   * Receive event from network
   */
  async receiveNetworkEvent(message: NetworkMessage): Promise<void> {
    const event = message.event;
    
    // Add network latency to event timestamp
    event.timestamp += this.config.networkLatency;
    
    // Update stats
    this.stats.totalEvents++;
    this.stats.eventsByType[event.type] = (this.stats.eventsByType[event.type] || 0) + 1;

    if (this.config.enableLogging) {
      console.log(`📡 Network event received: ${event.type} (${event.id}) from ${event.source}`);
    }

    // Process the event
    await this.processEvent(event);
  }

  /**
   * Register network callback
   */
  registerNetworkCallback(id: string, callback: (message: NetworkMessage) => void): void {
    this.networkCallbacks.set(id, callback);
  }

  /**
   * Unregister network callback
   */
  unregisterNetworkCallback(id: string): boolean {
    return this.networkCallbacks.delete(id);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit: number = 100): Event[] {
    return this.events
      .filter(event => event.type === eventType)
      .slice(-limit);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): Event[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear old events
   */
  clearOldEvents(maxAge: number = 60000): number {
    const cutoff = Date.now() - maxAge;
    const initialCount = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    return initialCount - this.events.length;
  }

  /**
   * Get event statistics
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      averageLatency: 0,
      droppedEvents: 0,
      networkMessages: 0
    };
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.active);
  }

  /**
   * Get subscription count by event type
   */
  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.handlers.get(eventType)?.length || 0;
    }
    
    return this.subscriptions.size;
  }
}

/**
 * Event Router
 * 
 * Routes events based on patterns and filters.
 */
export class EventRouter {
  private routes: Map<string, string[]> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Add a route from source event type to target event types
   */
  addRoute(sourceType: string, targetTypes: string[]): void {
    this.routes.set(sourceType, targetTypes);
  }

  /**
   * Remove a route
   */
  removeRoute(sourceType: string): boolean {
    return this.routes.delete(sourceType);
  }

  /**
   * Route an event to its targets
   */
  async routeEvent(event: Event): Promise<void> {
    const targetTypes = this.routes.get(event.type);
    if (!targetTypes) {
      return;
    }

    for (const targetType of targetTypes) {
      await this.eventBus.publish(targetType, event.data, {
        source: event.source,
        priority: event.priority,
        metadata: { ...event.metadata, routedFrom: event.type }
      });
    }
  }

  /**
   * Get all routes
   */
  getRoutes(): Map<string, string[]> {
    return new Map(this.routes);
  }
}

/**
 * Event Filter
 * 
 * Filters events based on various criteria.
 */
export class EventFilter {
  private filters: Map<string, (event: Event) => boolean> = new Map();

  /**
   * Add a filter
   */
  addFilter(name: string, filter: (event: Event) => boolean): void {
    this.filters.set(name, filter);
  }

  /**
   * Remove a filter
   */
  removeFilter(name: string): boolean {
    return this.filters.delete(name);
  }

  /**
   * Check if event passes all filters
   */
  passesFilters(event: Event): boolean {
    for (const filter of this.filters.values()) {
      if (!filter(event)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all filters
   */
  getFilters(): Map<string, (event: Event) => boolean> {
    return new Map(this.filters);
  }
}

/**
 * Event Replicator
 * 
 * Handles event replication for multiplayer scenarios.
 */
export class EventReplicator {
  private eventBus: EventBus;
  private replicationRules: Map<string, ReplicationRule> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Add replication rule
   */
  addReplicationRule(eventType: string, rule: ReplicationRule): void {
    this.replicationRules.set(eventType, rule);
  }

  /**
   * Remove replication rule
   */
  removeReplicationRule(eventType: string): boolean {
    return this.replicationRules.delete(eventType);
  }

  /**
   * Check if event should be replicated
   */
  shouldReplicate(event: Event): boolean {
    const rule = this.replicationRules.get(event.type);
    if (!rule) {
      return false;
    }

    return rule.shouldReplicate(event);
  }

  /**
   * Transform event for replication
   */
  transformForReplication(event: Event): Event {
    const rule = this.replicationRules.get(event.type);
    if (!rule) {
      return event;
    }

    return rule.transform(event);
  }
}

export interface ReplicationRule {
  shouldReplicate: (event: Event) => boolean;
  transform: (event: Event) => Event;
  target: 'all' | 'nearby' | 'team' | 'custom';
}

/**
 * Event Scheduler
 * 
 * Schedules delayed or recurring events.
 */
export class EventScheduler {
  private scheduledEvents: Map<string, ScheduledEvent> = new Map();
  private eventBus: EventBus;
  private interval: NodeJS.Timeout | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.startScheduler();
  }

  /**
   * Schedule a delayed event
   */
  scheduleDelayed(
    eventType: string,
    data: any,
    delay: number,
    options: {
      id?: string;
      source?: string;
      priority?: EventPriority;
      metadata?: Record<string, any>;
    } = {}
  ): string {
    const eventId = options.id || `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledEvent: ScheduledEvent = {
      id: eventId,
      eventType,
      data,
      options,
      executeAt: Date.now() + delay,
      recurring: false,
      interval: 0
    };

    this.scheduledEvents.set(eventId, scheduledEvent);
    return eventId;
  }

  /**
   * Schedule a recurring event
   */
  scheduleRecurring(
    eventType: string,
    data: any,
    interval: number,
    options: {
      id?: string;
      source?: string;
      priority?: EventPriority;
      metadata?: Record<string, any>;
      maxExecutions?: number;
    } = {}
  ): string {
    const eventId = options.id || `recur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledEvent: ScheduledEvent = {
      id: eventId,
      eventType,
      data,
      options,
      executeAt: Date.now() + interval,
      recurring: true,
      interval,
      executions: 0,
      maxExecutions: options.maxExecutions || -1
    };

    this.scheduledEvents.set(eventId, scheduledEvent);
    return eventId;
  }

  /**
   * Cancel a scheduled event
   */
  cancelScheduled(eventId: string): boolean {
    return this.scheduledEvents.delete(eventId);
  }

  /**
   * Get all scheduled events
   */
  getScheduledEvents(): ScheduledEvent[] {
    return Array.from(this.scheduledEvents.values());
  }

  /**
   * Start the scheduler
   */
  private startScheduler(): void {
    this.interval = setInterval(() => {
      this.processScheduledEvents();
    }, 100); // Check every 100ms
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Process scheduled events
   */
  private processScheduledEvents(): void {
    const now = Date.now();
    const eventsToExecute: ScheduledEvent[] = [];

    for (const event of this.scheduledEvents.values()) {
      if (event.executeAt <= now) {
        eventsToExecute.push(event);
      }
    }

    for (const event of eventsToExecute) {
      this.executeScheduledEvent(event);
    }
  }

  /**
   * Execute a scheduled event
   */
  private async executeScheduledEvent(scheduledEvent: ScheduledEvent): Promise<void> {
    await this.eventBus.publish(scheduledEvent.eventType, scheduledEvent.data, scheduledEvent.options);

    if (scheduledEvent.recurring) {
      scheduledEvent.executions = (scheduledEvent.executions || 0) + 1;
      
      if (scheduledEvent.maxExecutions && scheduledEvent.maxExecutions > 0 && scheduledEvent.executions >= scheduledEvent.maxExecutions) {
        this.scheduledEvents.delete(scheduledEvent.id);
      } else {
        scheduledEvent.executeAt = Date.now() + scheduledEvent.interval;
      }
    } else {
      this.scheduledEvents.delete(scheduledEvent.id);
    }
  }
}

export interface ScheduledEvent {
  id: string;
  eventType: string;
  data: any;
  options: any;
  executeAt: number;
  recurring: boolean;
  interval: number;
  executions?: number;
  maxExecutions?: number;
}

/**
 * Factory function to create an event bus
 */
export function createEventBus(config: Partial<EventBusConfig> = {}): EventBus {
  return new EventBus(config);
}

/**
 * Factory function to create an event router
 */
export function createEventRouter(eventBus: EventBus): EventRouter {
  return new EventRouter(eventBus);
}

/**
 * Factory function to create an event filter
 */
export function createEventFilter(): EventFilter {
  return new EventFilter();
}

/**
 * Factory function to create an event replicator
 */
export function createEventReplicator(eventBus: EventBus): EventReplicator {
  return new EventReplicator(eventBus);
}

/**
 * Factory function to create an event scheduler
 */
export function createEventScheduler(eventBus: EventBus): EventScheduler {
  return new EventScheduler(eventBus);
}
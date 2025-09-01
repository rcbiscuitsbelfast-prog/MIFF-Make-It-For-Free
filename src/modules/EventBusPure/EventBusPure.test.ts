/**
 * EventBusPure.test.ts - Tests for EventBusPure module
 * 
 * Tests event bus, routing, filtering, replication, and scheduling functionality.
 */

import {
  createEventBus,
  createEventRouter,
  createEventFilter,
  createEventReplicator,
  createEventScheduler,
  EventPriority,
  EventBusConfig,
  ReplicationRule
} from './EventBusPure';

describe('EventBusPure', () => {
  let eventBus: any;
  let config: EventBusConfig;

  beforeEach(() => {
    config = {
      maxEvents: 100,
      enableReplication: false,
      networkLatency: 0,
      eventTimeout: 5000,
      enableLogging: false,
      replicationFilter: () => true
    };
    eventBus = createEventBus(config);
  });

  describe('EventBus', () => {
    it('should create event bus with default config', () => {
      const bus = createEventBus();
      expect(bus).toBeDefined();
      expect(bus.getSubscriptionCount()).toBe(0);
    });

    it('should create event bus with custom config', () => {
      const customConfig: EventBusConfig = {
        maxEvents: 500,
        enableReplication: true,
        networkLatency: 100,
        eventTimeout: 10000,
        enableLogging: true,
        replicationFilter: (event) => event.priority >= EventPriority.HIGH
      };
      
      const bus = createEventBus(customConfig);
      expect(bus).toBeDefined();
    });

    it('should subscribe to events', () => {
      const handler = jest.fn();
      const subscriptionId = eventBus.subscribe('test-event', handler);
      
      expect(subscriptionId).toBeDefined();
      expect(eventBus.getSubscriptionCount('test-event')).toBe(1);
      expect(eventBus.getSubscriptionCount()).toBe(1);
    });

    it('should unsubscribe from events', () => {
      const handler = jest.fn();
      const subscriptionId = eventBus.subscribe('test-event', handler);
      
      const result = eventBus.unsubscribe(subscriptionId);
      expect(result).toBe(true);
      expect(eventBus.getSubscriptionCount('test-event')).toBe(0);
    });

    it('should publish events', async () => {
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler);
      
      const eventId = await eventBus.publish('test-event', { message: 'hello' });
      
      expect(eventId).toBeDefined();
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'test-event',
        data: { message: 'hello' }
      }));
    });

    it('should handle event priorities', async () => {
      const highPriorityHandler = jest.fn();
      const normalPriorityHandler = jest.fn();
      
      eventBus.subscribe('test-event', normalPriorityHandler, { priority: EventPriority.NORMAL });
      eventBus.subscribe('test-event', highPriorityHandler, { priority: EventPriority.HIGH });
      
      await eventBus.publish('test-event', { message: 'hello' });
      
      expect(highPriorityHandler).toHaveBeenCalledTimes(1);
      expect(normalPriorityHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle one-time subscriptions', async () => {
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler, { once: true });
      
      await eventBus.publish('test-event', { message: 'first' });
      await eventBus.publish('test-event', { message: 'second' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(eventBus.getSubscriptionCount('test-event')).toBe(0);
    });

    it('should handle event filters', async () => {
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler, {
        filter: (event: any) => event.data.value > 5
      });
      
      await eventBus.publish('test-event', { value: 3 });
      await eventBus.publish('test-event', { value: 7 });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        data: { value: 7 }
      }));
    });

    it('should handle multiple handlers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      
      await eventBus.publish('test-event', { message: 'hello' });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should handle async handlers', async () => {
      const asyncHandler = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      eventBus.subscribe('test-event', asyncHandler);
      await eventBus.publish('test-event', { message: 'hello' });
      
      expect(asyncHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle handler errors gracefully', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      
      const normalHandler = jest.fn();
      
      eventBus.subscribe('test-event', errorHandler);
      eventBus.subscribe('test-event', normalHandler);
      
      await eventBus.publish('test-event', { message: 'hello' });
      
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(normalHandler).toHaveBeenCalledTimes(1);
    });

    it('should limit event history', async () => {
      config.maxEvents = 3;
      eventBus = createEventBus(config);
      
      for (let i = 0; i < 5; i++) {
        await eventBus.publish('test-event', { index: i });
      }
      
      const recentEvents = eventBus.getRecentEvents();
      expect(recentEvents.length).toBe(3);
      expect(recentEvents[0].data.index).toBe(2);
      expect(recentEvents[2].data.index).toBe(4);
    });

    it('should track event statistics', async () => {
      await eventBus.publish('event1', { data: 'test1' });
      await eventBus.publish('event2', { data: 'test2' });
      await eventBus.publish('event1', { data: 'test3' });
      
      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(3);
      expect(stats.eventsByType['event1']).toBe(2);
      expect(stats.eventsByType['event2']).toBe(1);
    });

    it('should clear old events', async () => {
      await eventBus.publish('test-event', { data: 'old' });
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await eventBus.publish('test-event', { data: 'new' });
      
      const cleared = eventBus.clearOldEvents(5); // Clear events older than 5ms
      expect(cleared).toBe(1);
      
      const recentEvents = eventBus.getRecentEvents();
      expect(recentEvents.length).toBe(1);
      expect(recentEvents[0].data.data).toBe('new');
    });

    it('should get events by type', async () => {
      await eventBus.publish('event1', { data: 'test1' });
      await eventBus.publish('event2', { data: 'test2' });
      await eventBus.publish('event1', { data: 'test3' });
      
      const event1Events = eventBus.getEventsByType('event1');
      expect(event1Events.length).toBe(2);
      expect(event1Events[0].data.data).toBe('test1');
      expect(event1Events[1].data.data).toBe('test3');
    });
  });

  describe('EventRouter', () => {
    let router: any;

    beforeEach(() => {
      router = createEventRouter(eventBus);
    });

    it('should create event router', () => {
      expect(router).toBeDefined();
    });

    it('should add routes', () => {
      router.addRoute('source-event', ['target1', 'target2']);
      
      const routes = router.getRoutes();
      expect(routes.get('source-event')).toEqual(['target1', 'target2']);
    });

    it('should remove routes', () => {
      router.addRoute('source-event', ['target1']);
      
      const result = router.removeRoute('source-event');
      expect(result).toBe(true);
      
      const routes = router.getRoutes();
      expect(routes.has('source-event')).toBe(false);
    });

    it('should route events', async () => {
      const target1Handler = jest.fn();
      const target2Handler = jest.fn();
      
      eventBus.subscribe('target1', target1Handler);
      eventBus.subscribe('target2', target2Handler);
      
      router.addRoute('source-event', ['target1', 'target2']);
      
      const sourceEvent = {
        id: 'test-id',
        type: 'source-event',
        data: { message: 'hello' },
        timestamp: Date.now(),
        source: 'test',
        priority: EventPriority.NORMAL,
        metadata: {}
      };
      
      await router.routeEvent(sourceEvent);
      
      expect(target1Handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'target1',
        data: { message: 'hello' },
        metadata: { routedFrom: 'source-event' }
      }));
      
      expect(target2Handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'target2',
        data: { message: 'hello' },
        metadata: { routedFrom: 'source-event' }
      }));
    });
  });

  describe('EventFilter', () => {
    let filter: any;

    beforeEach(() => {
      filter = createEventFilter();
    });

    it('should create event filter', () => {
      expect(filter).toBeDefined();
    });

    it('should add filters', () => {
      const testFilter = (event: any) => event.data.value > 0;
      filter.addFilter('positive-value', testFilter);
      
      const filters = filter.getFilters();
      expect(filters.has('positive-value')).toBe(true);
    });

    it('should remove filters', () => {
      filter.addFilter('test-filter', () => true);
      
      const result = filter.removeFilter('test-filter');
      expect(result).toBe(true);
      
      const filters = filter.getFilters();
      expect(filters.has('test-filter')).toBe(false);
    });

    it('should check if event passes filters', () => {
      filter.addFilter('positive-value', (event: any) => event.data.value > 0);
      filter.addFilter('even-value', (event: any) => event.data.value % 2 === 0);
      
      const passingEvent = { data: { value: 2 } };
      const failingEvent = { data: { value: 1 } };
      
      expect(filter.passesFilters(passingEvent)).toBe(true);
      expect(filter.passesFilters(failingEvent)).toBe(false);
    });
  });

  describe('EventReplicator', () => {
    let replicator: any;

    beforeEach(() => {
      replicator = createEventReplicator(eventBus);
    });

    it('should create event replicator', () => {
      expect(replicator).toBeDefined();
    });

    it('should add replication rules', () => {
      const rule: ReplicationRule = {
        shouldReplicate: (event) => event.priority >= EventPriority.HIGH,
        transform: (event) => ({ ...event, data: { ...event.data, replicated: true } }),
        target: 'all'
      };
      
      replicator.addReplicationRule('high-priority-event', rule);
      
      const event = {
        id: 'test',
        type: 'high-priority-event',
        data: { message: 'test' },
        timestamp: Date.now(),
        source: 'test',
        priority: EventPriority.HIGH,
        metadata: {}
      };
      
      expect(replicator.shouldReplicate(event)).toBe(true);
      
      const transformed = replicator.transformForReplication(event);
      expect(transformed.data.replicated).toBe(true);
    });

    it('should remove replication rules', () => {
      const rule: ReplicationRule = {
        shouldReplicate: () => true,
        transform: (event) => event,
        target: 'all'
      };
      
      replicator.addReplicationRule('test-event', rule);
      
      const result = replicator.removeReplicationRule('test-event');
      expect(result).toBe(true);
      
      const event = {
        id: 'test',
        type: 'test-event',
        data: {},
        timestamp: Date.now(),
        source: 'test',
        priority: EventPriority.NORMAL,
        metadata: {}
      };
      
      expect(replicator.shouldReplicate(event)).toBe(false);
    });
  });

  describe('EventScheduler', () => {
    let scheduler: any;

    beforeEach(() => {
      scheduler = createEventScheduler(eventBus);
    });

    afterEach(() => {
      scheduler.stopScheduler();
    });

    it('should create event scheduler', () => {
      expect(scheduler).toBeDefined();
    });

    it('should schedule delayed events', async () => {
      const handler = jest.fn();
      eventBus.subscribe('delayed-event', handler);
      
      const eventId = scheduler.scheduleDelayed('delayed-event', { message: 'delayed' }, 50);
      expect(eventId).toBeDefined();
      
      // Wait for event to be scheduled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'delayed-event',
        data: { message: 'delayed' }
      }));
    });

    it('should schedule recurring events', async () => {
      jest.useFakeTimers();
      const handler = jest.fn();
      eventBus.subscribe('recurring-event', handler);
      
      const eventId = scheduler.scheduleRecurring('recurring-event', { message: 'recurring' }, 50, {
        maxExecutions: 3
      });
      expect(eventId).toBeDefined();
      
      // Advance enough time for 3 executions (scheduler checks every 100ms)
      jest.advanceTimersByTime(240);
      
      expect(handler).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    it('should cancel scheduled events', async () => {
      const handler = jest.fn();
      eventBus.subscribe('cancelled-event', handler);
      
      const eventId = scheduler.scheduleDelayed('cancelled-event', { message: 'cancelled' }, 100);
      
      const result = scheduler.cancelScheduled(eventId);
      expect(result).toBe(true);
      
      // Wait to ensure event doesn't fire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should get scheduled events', () => {
      scheduler.scheduleDelayed('event1', { data: 'test1' }, 1000);
      scheduler.scheduleRecurring('event2', { data: 'test2' }, 500);
      
      const scheduledEvents = scheduler.getScheduledEvents();
      expect(scheduledEvents.length).toBe(2);
      expect(scheduledEvents.some((e: any) => e.eventType === 'event1')).toBe(true);
      expect(scheduledEvents.some((e: any) => e.eventType === 'event2')).toBe(true);
    });
  });

  describe('Network Replication', () => {
    beforeEach(() => {
      config.enableReplication = true;
      config.enableLogging = true;
      eventBus = createEventBus(config);
    });

    it('should replicate events to network', async () => {
      const networkCallback = jest.fn();
      eventBus.registerNetworkCallback('test-callback', networkCallback);
      
      await eventBus.publish('network-event', { message: 'network' }, {
        replicate: true
      });
      
      expect(networkCallback).toHaveBeenCalledWith(expect.objectContaining({
        event: expect.objectContaining({
          type: 'network-event',
          data: { message: 'network' }
        }),
        target: 'broadcast',
        reliable: false
      }));
    });

    it('should receive network events', async () => {
      const handler = jest.fn();
      eventBus.subscribe('network-event', handler);
      
      const networkMessage = {
        id: 'net-test',
        event: {
          id: 'test-event',
          type: 'network-event',
          data: { message: 'from network' },
          timestamp: Date.now(),
          source: 'remote',
          priority: EventPriority.NORMAL,
          metadata: {}
        },
        target: 'broadcast',
        reliable: false,
        timestamp: Date.now()
      };
      
      await eventBus.receiveNetworkEvent(networkMessage);
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'network-event',
        data: { message: 'from network' },
        source: 'remote'
      }));
    });

    it('should handle high priority network events', async () => {
      const networkCallback = jest.fn();
      eventBus.registerNetworkCallback('test-callback', networkCallback);
      
      await eventBus.publish('critical-event', { message: 'critical' }, {
        priority: EventPriority.CRITICAL,
        replicate: true
      });
      
      expect(networkCallback).toHaveBeenCalledWith(expect.objectContaining({
        reliable: true
      }));
    });

    it('should unregister network callbacks', () => {
      const callback = jest.fn();
      eventBus.registerNetworkCallback('test-callback', callback);
      
      const result = eventBus.unregisterNetworkCallback('test-callback');
      expect(result).toBe(true);
      
      // Verify callback is removed
      const result2 = eventBus.unregisterNetworkCallback('test-callback');
      expect(result2).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete event workflow', async () => {
      // Create components
      const router = createEventRouter(eventBus);
      const filter = createEventFilter();
      const replicator = createEventReplicator(eventBus);
      const scheduler = createEventScheduler(eventBus);
      
      // Setup routing
      router.addRoute('source-event', ['target1', 'target2']);
      
      // Setup filtering
      filter.addFilter('positive-value', (event: any) => event.data.value > 0);
      
      // Setup replication
      replicator.addReplicationRule('high-priority', {
        shouldReplicate: (event) => event.priority >= EventPriority.HIGH,
        transform: (event) => event,
        target: 'all'
      });
      
      // Setup handlers
      const sourceHandler = jest.fn();
      const target1Handler = jest.fn();
      const target2Handler = jest.fn();
      
      eventBus.subscribe('source-event', sourceHandler);
      eventBus.subscribe('target1', target1Handler);
      eventBus.subscribe('target2', target2Handler);
      
      // Publish event
      const eventId = await eventBus.publish('source-event', { value: 10 }, {
        priority: EventPriority.HIGH
      });
      
      // Verify event was published
      expect(eventId).toBeDefined();
      expect(sourceHandler).toHaveBeenCalled();
      
      // Verify routing worked
      expect(target1Handler).toHaveBeenCalled();
      expect(target2Handler).toHaveBeenCalled();
      
      // Verify filtering worked
      expect(filter.passesFilters({
        id: 'test',
        type: 'test-event',
        timestamp: Date.now(),
        source: 'test',
        data: { value: 10 },
        priority: EventPriority.NORMAL,
        metadata: {}
      })).toBe(true);
      
      // Verify replication worked
      expect(replicator.shouldReplicate({
        type: 'high-priority',
        priority: EventPriority.HIGH
      } as any)).toBe(true);
      
      // Cleanup
      scheduler.stopScheduler();
    });

    it('should handle event statistics and cleanup', async () => {
      // Publish multiple events
      for (let i = 0; i < 5; i++) {
        await eventBus.publish('test-event', { index: i });
      }
      
      // Check statistics
      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(5);
      expect(stats.eventsByType['test-event']).toBe(5);
      
      // Clear old events
      const cleared = eventBus.clearOldEvents(0); // Clear all events
      expect(cleared).toBe(5);
      
      // Verify events are cleared
      const recentEvents = eventBus.getRecentEvents();
      expect(recentEvents.length).toBe(0);
    });

    it('should handle subscription management', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const sub1 = eventBus.subscribe('event1', handler1);
      const sub2 = eventBus.subscribe('event2', handler2);
      
      expect(eventBus.getSubscriptionCount()).toBe(2);
      expect(eventBus.getSubscriptionCount('event1')).toBe(1);
      expect(eventBus.getSubscriptionCount('event2')).toBe(1);
      
      eventBus.unsubscribe(sub1);
      expect(eventBus.getSubscriptionCount()).toBe(1);
      expect(eventBus.getSubscriptionCount('event1')).toBe(0);
      
      const subscriptions = eventBus.getSubscriptions();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].eventType).toBe('event2');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid subscription IDs', () => {
      const result = eventBus.unsubscribe('non-existent-id');
      expect(result).toBe(false);
    });

    it('should handle network callback errors', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Network callback error');
      });
      
      eventBus.registerNetworkCallback('error-callback', errorCallback);
      
      // Should not throw error
      await eventBus.publish('test-event', { data: 'test' }, { replicate: true });
      
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should handle scheduler errors', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Scheduled event error');
      });
      
      eventBus.subscribe('error-event', errorHandler);
      
      const scheduler = createEventScheduler(eventBus);
      scheduler.scheduleDelayed('error-event', { data: 'test' }, 50);
      
      // Wait for event to be scheduled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not throw error
      expect(errorHandler).toHaveBeenCalled();
      
      scheduler.stopScheduler();
    });
  });
});
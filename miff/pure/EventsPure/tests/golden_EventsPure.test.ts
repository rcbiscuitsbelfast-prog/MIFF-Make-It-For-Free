/**
 * EventsPure Golden Tests
 *
 * Comprehensive tests for the EventsPure event bus system.
 * Tests cover basic functionality, edge cases, and integration scenarios.
 */

import { EventBus, EventListener, EventUtils } from '../index';

describe('EventsPure Golden Tests', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    jest.useFakeTimers();
    eventBus = new EventBus();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('Basic Event Bus Functionality', () => {
    test('should publish and receive events', () => {
      const receivedEvents: any[] = [];

      const listener = eventBus.subscribe('test_topic', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.publish('test_topic', { message: 'hello' });
      eventBus.publish('test_topic', { message: 'world' });
      eventBus.publish('other_topic', { message: 'ignored' });

      expect(receivedEvents).toEqual([
        { message: 'hello' },
        { message: 'world' }
      ]);

      listener.dispose();
    });

    test('should handle multiple subscribers on same topic', () => {
      const events1: any[] = [];
      const events2: any[] = [];

      const listener1 = eventBus.subscribe('multi_topic', (payload) => events1.push(payload));
      const listener2 = eventBus.subscribe('multi_topic', (payload) => events2.push(payload));

      eventBus.publish('multi_topic', 'test_message');

      expect(events1).toEqual(['test_message']);
      expect(events2).toEqual(['test_message']);

      listener1.dispose();
      listener2.dispose();
    });

    test('should handle empty payloads', () => {
      const receivedEvents: any[] = [];

      const listener = eventBus.subscribe('empty_payload', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.publish('empty_payload');
      eventBus.publish('empty_payload', null);
      eventBus.publish('empty_payload', undefined);

      expect(receivedEvents).toEqual([undefined, null, undefined]);

      listener.dispose();
    });
  });

  describe('Subscription Management', () => {
    test('should properly dispose subscriptions', () => {
      const receivedEvents: any[] = [];

      const listener = eventBus.subscribe('dispose_test', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.publish('dispose_test', 'before_dispose');
      expect(receivedEvents).toEqual(['before_dispose']);

      listener.dispose();

      eventBus.publish('dispose_test', 'after_dispose');
      expect(receivedEvents).toEqual(['before_dispose']); // Should not receive after dispose
    });

    test('should handle subscription cleanup', () => {
      const listener = eventBus.subscribe('cleanup_test', () => {});

      expect(eventBus.getSubscriberCount('cleanup_test')).toBe(1);
      expect(eventBus.getActiveTopics()).toContain('cleanup_test');

      listener.dispose();

      expect(eventBus.getSubscriberCount('cleanup_test')).toBe(0);
      expect(eventBus.getActiveTopics()).not.toContain('cleanup_test');
    });

    test('should handle multiple disposals gracefully', () => {
      const listener = eventBus.subscribe('double_dispose', () => {});

      listener.dispose();
      listener.dispose(); // Should not throw

      expect(listener.disposed).toBe(true);
    });
  });

  describe('Event Bus Statistics', () => {
    test('should provide accurate statistics', () => {
      const listener1 = eventBus.subscribe('topic1', () => {});
      const listener2 = eventBus.subscribe('topic1', () => {});
      const listener3 = eventBus.subscribe('topic2', () => {});

      expect(eventBus.getTotalSubscriptions()).toBe(3);
      expect(eventBus.getActiveTopics()).toEqual(['topic1', 'topic2']);
      expect(eventBus.getSubscriberCount('topic1')).toBe(2);
      expect(eventBus.getSubscriberCount('topic2')).toBe(1);
      expect(eventBus.getSubscriberCount('nonexistent')).toBe(0);

      listener1.dispose();
      listener2.dispose();
      listener3.dispose();
    });

    test('should handle clear operation', () => {
      eventBus.subscribe('topic1', () => {});
      eventBus.subscribe('topic2', () => {});

      expect(eventBus.getTotalSubscriptions()).toBe(2);

      eventBus.clear();

      expect(eventBus.getTotalSubscriptions()).toBe(0);
      expect(eventBus.getActiveTopics()).toEqual([]);
    });
  });

  describe('Async Event Handling', () => {
    test('EventBus should handle async event handlers', async () => {
      const receivedEvents: any[] = [];

      const listener = eventBus.subscribeAsync('async_test', async (payload) => {
        // Simulate async operation without real setTimeout to avoid Jest issues
        await Promise.resolve();
        receivedEvents.push(payload);
      });

      await eventBus.publishAsync('async_test', 'async_event1');
      await eventBus.publishAsync('async_test', 'async_event2');

      expect(receivedEvents).toEqual(['async_event1', 'async_event2']);

      listener.dispose();
    });

    test('EventBus should handle mixed sync and async handlers', async () => {
      const syncEvents: any[] = [];
      const asyncEvents: any[] = [];

      eventBus.subscribe('mixed_test', (payload) => {
        syncEvents.push(`sync_${payload}`);
      });

      eventBus.subscribeAsync('mixed_test', async (payload) => {
        await Promise.resolve(); // Simple async operation
        asyncEvents.push(`async_${payload}`);
      });

      await eventBus.publishAsync('mixed_test', 'test1');

      expect(syncEvents).toEqual(['sync_test1']);
      expect(asyncEvents).toEqual(['async_test1']);
    });

    test('EventBus should provide correct statistics with async handlers', () => {
      eventBus.subscribe('stats_test', () => {});
      eventBus.subscribeAsync('stats_test', async () => {});

      const stats = eventBus.getStats();
      expect(stats.syncHandlers).toBe(1);
      expect(stats.asyncHandlers).toBe(1);
      expect(stats.totalTopics).toBe(1);
      expect(eventBus.getTotalSubscriptions()).toBe(2);
    });
  });

  describe('EventUtils', () => {
    test('EventUtils.once should only fire once', () => {
      const receivedEvents: any[] = [];

      const listener = EventUtils.once(eventBus, 'once_test', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.publish('once_test', 'first');
      eventBus.publish('once_test', 'second');
      eventBus.publish('once_test', 'third');

      expect(receivedEvents).toEqual(['first']);
      expect(listener.disposed).toBe(true);
    });

    test('EventUtils.filter should filter events', () => {
      const receivedEvents: any[] = [];

      const listener = EventUtils.filter(
        eventBus,
        'filter_test',
        (payload: number) => payload > 10,
        (payload) => receivedEvents.push(payload)
      );

      eventBus.publish('filter_test', 5);   // Should be filtered out
      eventBus.publish('filter_test', 15);  // Should be received
      eventBus.publish('filter_test', 25);  // Should be received
      eventBus.publish('filter_test', 8);   // Should be filtered out

      expect(receivedEvents).toEqual([15, 25]);

      listener.dispose();
    });

    test('EventUtils.onceAsync should work with async handlers', async () => {
      const receivedEvents: any[] = [];

      const listener = EventUtils.onceAsync(eventBus, 'once_async_test', async (payload) => {
        await Promise.resolve(); // Simple async operation
        receivedEvents.push(payload);
      });

      await eventBus.publishAsync('once_async_test', 'event1');
      await eventBus.publishAsync('once_async_test', 'event2'); // Should be ignored

      expect(receivedEvents).toEqual(['event1']);

      listener.dispose();
    });

    test('EventUtils.filterAsync should work with async handlers', async () => {
      const receivedEvents: any[] = [];

      const listener = EventUtils.filterAsync(eventBus, 'filter_async_test', (payload: number) => payload > 10, async (payload) => {
        await Promise.resolve(); // Simple async operation
        receivedEvents.push(payload);
      });

      await eventBus.publishAsync('filter_async_test', 5);
      await eventBus.publishAsync('filter_async_test', 15);
      await eventBus.publishAsync('filter_async_test', 8);
      await eventBus.publishAsync('filter_async_test', 20);

      expect(receivedEvents).toEqual([15, 20]);

      listener.dispose();
    });

    test('EventUtils.debounce should debounce events', async () => {
      const receivedEvents: any[] = [];
      const receivedTimestamps: number[] = [];

      const listener = EventUtils.debounce(eventBus, 'debounce_test', 50, (payload) => {
        receivedEvents.push(payload);
        receivedTimestamps.push(Date.now());
      });

      // Fire multiple events rapidly
      eventBus.publish('debounce_test', 'event1');
      eventBus.publish('debounce_test', 'event2');
      eventBus.publish('debounce_test', 'event3');

      // Advance time to trigger the debounced event
      jest.advanceTimersByTime(100);

      expect(receivedEvents).toEqual(['event3']); // Only the last event should fire

      listener.dispose();
    }, 500);

    test('EventUtils.throttle should throttle events', async () => {
      const receivedEvents: any[] = [];

      const listener = EventUtils.throttle(eventBus, 'throttle_test', 50, (payload) => {
        receivedEvents.push(payload);
      });

      // Fire events rapidly
      eventBus.publish('throttle_test', 'event1');
      eventBus.publish('throttle_test', 'event2');
      eventBus.publish('throttle_test', 'event3');

      // Advance time to trigger the first throttled event
      jest.advanceTimersByTime(50);

      eventBus.publish('throttle_test', 'event4');

      // Advance time to trigger the second throttled event
      jest.advanceTimersByTime(100);

      expect(receivedEvents).toEqual(['event1', 'event4']); // First and second interval events

      listener.dispose();
    }, 500);
  });

  describe('Error Handling', () => {
    test('should handle handler errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const listener = eventBus.subscribe('error_test', () => {
        throw new Error('Test error');
      });

      // Should not throw, but should log error
      expect(() => {
        eventBus.publish('error_test', 'test_payload');
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler for topic \'error_test\''),
        expect.any(Error)
      );

      listener.dispose();
      consoleSpy.mockRestore();
    });

    test('should handle invalid topics gracefully', () => {
      const listener = eventBus.subscribe('', () => {}); // Empty topic

      expect(() => {
        eventBus.publish('', 'test'); // Empty topic publish
        eventBus.publish('   ', 'test'); // Whitespace topic publish
      }).not.toThrow();

      listener.dispose();
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complex event workflows', () => {
      const gameEvents: any[] = [];
      const combatEvents: any[] = [];
      const uiEvents: any[] = [];

      // Game system subscriptions
      const gameListener = eventBus.subscribe('game', (payload) => gameEvents.push(payload));
      const combatListener = eventBus.subscribe('combat', (payload) => combatEvents.push(payload));
      const uiListener = eventBus.subscribe('ui', (payload) => uiEvents.push(payload));

      // Simulate game flow
      eventBus.publish('game', { type: 'start', level: 1 });
      eventBus.publish('combat', { type: 'begin', enemies: 3 });
      eventBus.publish('ui', { type: 'show_health', current: 100, max: 100 });
      eventBus.publish('combat', { type: 'damage', amount: 25, target: 'player' });
      eventBus.publish('ui', { type: 'update_health', current: 75, max: 100 });
      eventBus.publish('game', { type: 'level_up', newLevel: 2 });

      expect(gameEvents).toEqual([
        { type: 'start', level: 1 },
        { type: 'level_up', newLevel: 2 }
      ]);

      expect(combatEvents).toEqual([
        { type: 'begin', enemies: 3 },
        { type: 'damage', amount: 25, target: 'player' }
      ]);

      expect(uiEvents).toEqual([
        { type: 'show_health', current: 100, max: 100 },
        { type: 'update_health', current: 75, max: 100 }
      ]);

      gameListener.dispose();
      combatListener.dispose();
      uiListener.dispose();
    });

    test('should handle event-driven quest system', () => {
      const questEvents: any[] = [];

      const questListener = EventUtils.filter(
        eventBus,
        'action',
        (payload) => payload.type === 'quest_item_collected',
        (payload) => questEvents.push(payload)
      );

      const completionListener = EventUtils.once(
        eventBus,
        'quest_complete',
        (payload) => questEvents.push({ type: 'quest_completed', ...payload })
      );

      // Simulate quest progress
      eventBus.publish('action', { type: 'item_collected', item: 'coin' }); // Should be filtered
      eventBus.publish('action', { type: 'quest_item_collected', item: 'magic_crystal' });
      eventBus.publish('action', { type: 'quest_item_collected', item: 'ancient_artifact' });
      eventBus.publish('quest_complete', { questId: 'gather_relics', reward: 'experience' });

      expect(questEvents).toEqual([
        { type: 'quest_item_collected', item: 'magic_crystal' },
        { type: 'quest_item_collected', item: 'ancient_artifact' },
        { type: 'quest_completed', questId: 'gather_relics', reward: 'experience' }
      ]);

      questListener.dispose();
    });
  });

  describe('Performance', () => {
    test('should handle many subscriptions efficiently', () => {
      const handlers: Array<() => void> = [];

      // Create many subscriptions
      for (let i = 0; i < 1000; i++) {
        const handler = eventBus.subscribe(`perf_topic_${i}`, () => {});
        handlers.push(handler);
      }

      expect(eventBus.getTotalSubscriptions()).toBe(1000);
      expect(eventBus.getActiveTopics()).toHaveLength(1000);

      // Clean up
      handlers.forEach(handler => handler.dispose());
      expect(eventBus.getTotalSubscriptions()).toBe(0);
    });

    test('should publish to many subscribers efficiently', () => {
      const receivedCounts: number[] = new Array(100).fill(0);

      // Create many subscribers for same topic
      for (let i = 0; i < 100; i++) {
        eventBus.subscribe('mass_topic', () => {
          receivedCounts[i]++;
        });
      }

      // Publish once
      eventBus.publish('mass_topic', 'test_message');

      // All subscribers should receive the event
      expect(receivedCounts.every(count => count === 1)).toBe(true);
    });
  });
});
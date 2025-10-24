/**
 * EventBusPure.test.ts
 * 
 * Tests for EventBusPure using actual EventBus class
 */

import { EventBus } from './EventBusPure';

describe('EventBusPure', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Event Subscription', () => {
    it('should subscribe to event', () => {
      const listener = jest.fn();
      eventBus.on('test-event', listener);
      
      eventBus.emit('test-event', { data: 'test' });
      expect(listener).toHaveBeenCalled();
    });

    it('should unsubscribe from event', () => {
      const listener = jest.fn();
      const subscriptionId = eventBus.on('test-event', listener);
      eventBus.off(subscriptionId);
      
      eventBus.emit('test-event', null, {});
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Event Emission', () => {
    it('should emit event with data', async () => {
      const listener = jest.fn();
      eventBus.on('data-event', listener);
      
      const testData = { value: 42 };
      await eventBus.emit('data-event', testData);
      
      // EventBus calls handlers with the full Event object, not just data
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toMatchObject({ data: testData, type: 'data-event' });
    });

    it('should call multiple listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      eventBus.on('multi-event', listener1);
      eventBus.on('multi-event', listener2);
      
      await eventBus.emit('multi-event');
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Event Management', () => {
    it('should handle missing events gracefully', () => {
      expect(() => {
        eventBus.emit('non-existent-event');
      }).not.toThrow();
    });

    it('should clear all listeners', () => {
      const listener = jest.fn();
      eventBus.on('test-event', listener);
      
      eventBus.clear();
      eventBus.emit('test-event', null, {});
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Once Listeners', () => {
    it('should fire listener only once', async () => {
      const listener = jest.fn();
      eventBus.once('once-event', listener);
      
      await eventBus.emit('once-event');
      await eventBus.emit('once-event');
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});

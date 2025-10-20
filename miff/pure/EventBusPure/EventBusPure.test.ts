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
      eventBus.on('test-event', listener);
      eventBus.off('test-event', listener);
      
      eventBus.emit('test-event', null, {});
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Event Emission', () => {
    it('should emit event with data', () => {
      const listener = jest.fn();
      eventBus.on('data-event', listener);
      
      const testData = { value: 42 };
      eventBus.emit('data-event', testData);
      
      expect(listener).toHaveBeenCalledWith(testData);
    });

    it('should call multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      eventBus.on('multi-event', listener1);
      eventBus.on('multi-event', listener2);
      
      eventBus.emit('multi-event');
      
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
    it('should fire listener only once', () => {
      const listener = jest.fn();
      eventBus.once('once-event', listener);
      
      eventBus.emit('once-event');
      eventBus.emit('once-event');
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});

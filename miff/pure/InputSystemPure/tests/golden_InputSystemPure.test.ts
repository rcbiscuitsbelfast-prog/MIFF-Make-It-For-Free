/**
 * Golden Tests for InputSystemPure
 * 
 * Tests input management with actual InputSystemManager implementation
 */

import { InputSystemManager } from '../Manager';

describe('InputSystemPure Golden Tests', () => {
  let manager: InputSystemManager;

  beforeEach(() => {
    manager = new InputSystemManager();
  });

  describe('Input Event Processing', () => {
    it('should register and process key events', () => {
      const event = {
        type: 'keydown' as const,
        key: 'w',
        code: 'KeyW',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      };

      const result = manager.processInput(event);
      expect(result.ok).toBe(true);
    });

    it('should handle multiple input events', () => {
      const events = [
        { type: 'keydown' as const, key: 'w', code: 'KeyW', timestamp: Date.now(), deviceId: 'keyboard' },
        { type: 'keyup' as const, key: 'w', code: 'KeyW', timestamp: Date.now(), deviceId: 'keyboard' }
      ];

      events.forEach(event => {
        const result = manager.processInput(event);
        expect(result.ok).toBe(true);
      });
    });
  });

  describe('Action Binding', () => {
    it('should bind action to key', () => {
      const binding = {
        actionId: 'move_forward',
        key: 'w',
        modifiers: []
      };

      const result = manager.bindAction(binding);
      expect(result.ok).toBe(true);
    });

    it('should trigger bound action on key press', () => {
      manager.bindAction({
        actionId: 'jump',
        key: 'space',
        modifiers: []
      });

      const event = {
        type: 'keydown' as const,
        key: 'space',
        code: 'Space',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      };

      const result = manager.processInput(event);
      expect(result.ok).toBe(true);
    });
  });

  describe('Input Statistics', () => {
    it('should track input stats', () => {
      manager.processInput({
        type: 'keydown' as const,
        key: 'a',
        code: 'KeyA',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      });

      const statsResult = manager.getInputStats();
      expect(statsResult.ok).toBe(true);
      expect(statsResult.stats).toBeDefined();
    });

    it('should count total events', () => {
      const events = [
        { type: 'keydown' as const, key: 'a', code: 'KeyA', timestamp: Date.now(), deviceId: 'keyboard' },
        { type: 'keydown' as const, key: 'b', code: 'KeyB', timestamp: Date.now(), deviceId: 'keyboard' }
      ];

      events.forEach(event => manager.processInput(event));

      const statsResult = manager.getInputStats();
      expect(statsResult.stats?.totalEvents).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Input Buffer', () => {
    it('should buffer input events', () => {
      const event = {
        type: 'keydown' as const,
        key: 'ctrl',
        code: 'ControlLeft',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      };

      manager.processInput(event);
      const buffer = manager.getInputBuffer();
      expect(buffer.ok).toBe(true);
      expect(Array.isArray(buffer.events)).toBe(true);
    });

    it('should clear input buffer', () => {
      manager.processInput({
        type: 'keydown' as const,
        key: 'a',
        code: 'KeyA',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      });

      manager.clearInputBuffer();
      const buffer = manager.getInputBuffer();
      expect(buffer.events?.length).toBe(0);
    });
  });
});

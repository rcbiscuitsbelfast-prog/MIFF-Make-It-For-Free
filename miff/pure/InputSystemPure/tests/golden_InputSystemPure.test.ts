/**
 * Golden Tests for InputSystemPure
 * 
 * Tests using actual InputSystemManager implementation
 */

import { InputSystemManager } from '../Manager';

describe('InputSystemPure Golden Tests', () => {
  let manager: InputSystemManager;

  beforeEach(() => {
    manager = new InputSystemManager();
  });

  describe('Input Processing', () => {
    it('should process keyboard input', async () => {
      const event = {
        type: 'keydown' as const,
        key: 'w',
        code: 'KeyW',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      };

      const result = await manager.processInput(event);
      expect(result.ok).toBe(true);
    });

    it('should process multiple inputs', async () => {
      const events = [
        { type: 'keydown' as const, key: 'a', code: 'KeyA', timestamp: Date.now(), deviceId: 'keyboard' },
        { type: 'keyup' as const, key: 'a', code: 'KeyA', timestamp: Date.now(), deviceId: 'keyboard' }
      ];

      for (const event of events) {
        const result = await manager.processInput(event);
        expect(result.ok).toBe(true);
      }
    });
  });

  describe('Action Binding', () => {
    it('should bind action to key', async () => {
      const binding = {
        actionId: 'move_forward',
        key: 'w',
        modifiers: []
      };

      const result = await manager.createBinding(binding);
      expect(result.ok).toBe(true);
    });

    it('should get all bindings', async () => {
      await manager.createBinding({ actionId: 'jump', key: 'space', modifiers: [] });
      
      const result = await manager.getAllBindings();
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.bindings)).toBe(true);
    });
  });

  describe('Input Buffer', () => {
    it('should buffer inputs', async () => {
      await manager.processInput({
        type: 'keydown' as const,
        key: 'ctrl',
        code: 'ControlLeft',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      });

      const buffer = manager.getInputBuffer();
      expect(buffer.ok).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get input stats', async () => {
      await manager.processInput({
        type: 'keydown' as const,
        key: 'a',
        code: 'KeyA',
        timestamp: Date.now(),
        deviceId: 'keyboard'
      });

      const result = manager.getInputStats();
      expect(result.status).toBe('ok');
      expect(result.result).toBeDefined();
    });
  });
});

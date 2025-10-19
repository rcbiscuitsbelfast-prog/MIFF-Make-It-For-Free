import { describe, it, expect } from '@jest/globals';
import { PerceptionFilterLayer } from './index';

describe('PerceptionFilterLayer', () => {
  describe('Filter Creation', () => {
    it('should create perception filter', () => {
      const filter = PerceptionFilterLayer.create({
        type: 'scan',
        radius: 100,
        enabled: true
      });

      expect(filter).toBeDefined();
      expect(filter.type).toBe('scan');
      expect(filter.radius).toBe(100);
    });
  });

  describe('Visual Filtering', () => {
    it('should apply scan filter', () => {
      const filter = PerceptionFilterLayer.create({ type: 'scan' });
      const scene = { objects: [{ id: 'obj1', position: { x: 0, y: 0 } }] };

      const filtered = PerceptionFilterLayer.apply(filter, scene);
      expect(filtered).toBeDefined();
    });

    it('should detect entities in range', () => {
      const filter = PerceptionFilterLayer.create({ type: 'scan', radius: 50 });
      const position = { x: 0, y: 0 };
      const entities = [
        { id: 'e1', position: { x: 10, y: 10 } },
        { id: 'e2', position: { x: 100, y: 100 } }
      ];

      const visible = PerceptionFilterLayer.getVisibleEntities(filter, position, entities);
      expect(Array.isArray(visible)).toBe(true);
    });
  });

  describe('Filter States', () => {
    it('should enable filter', () => {
      const filter = PerceptionFilterLayer.create({ type: 'scan', enabled: false });
      
      const enabled = PerceptionFilterLayer.enable(filter);
      expect(enabled.enabled).toBe(true);
    });

    it('should disable filter', () => {
      const filter = PerceptionFilterLayer.create({ type: 'scan', enabled: true });
      
      const disabled = PerceptionFilterLayer.disable(filter);
      expect(disabled.enabled).toBe(false);
    });
  });
});

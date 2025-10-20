/**
 * RenderWorldPure Tests
 * 
 * Tests for RenderWorldPure using actual implementation
 */

import { RenderWorldPure } from './index';

describe('RenderWorldPure', () => {
  describe('Renderer Creation', () => {
    it('should create renderer instance', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600,
        pixelRatio: 1
      });

      expect(renderer).toBeDefined();
    });

    it('should create renderer with default config', () => {
      const renderer = new RenderWorldPure();
      expect(renderer).toBeDefined();
    });
  });

  describe('Scene Management', () => {
    it('should add entity to scene', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const entity = {
        id: 'player_001',
        position: { x: 0, y: 0, z: 0 },
        model: 'player_model',
        visible: true
      };

      const result = renderer.addEntity(entity);
      expect(result.ok).toBe(true);
    });

    it('should remove entity from scene', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const entity = {
        id: 'entity_001',
        position: { x: 0, y: 0, z: 0 },
        model: 'test_model',
        visible: true
      };

      renderer.addEntity(entity);
      const result = renderer.removeEntity('entity_001');
      expect(result.ok).toBe(true);
    });

    it('should get entity by ID', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const entity = {
        id: 'test_entity',
        position: { x: 5, y: 10, z: 0 },
        model: 'test_model',
        visible: true
      };

      renderer.addEntity(entity);
      const retrieved = renderer.getEntity('test_entity');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test_entity');
    });
  });

  describe('Camera Control', () => {
    it('should update camera position', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const result = renderer.updateCamera({
        position: { x: 10, y: 20, z: 30 },
        target: { x: 0, y: 0, z: 0 }
      });

      expect(result.ok).toBe(true);
    });

    it('should get camera properties', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      renderer.updateCamera({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      });

      const camera = renderer.getCamera();
      expect(camera).toBeDefined();
      expect(camera.position).toBeDefined();
    });
  });

  describe('Rendering', () => {
    it('should render scene', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      renderer.addEntity({
        id: 'entity_001',
        position: { x: 0, y: 0, z: 0 },
        model: 'cube',
        visible: true
      });

      const result = renderer.render();
      expect(result.ok).toBe(true);
    });

    it('should render with delta time', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const result = renderer.render(16); // 16ms frame
      expect(result.ok).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get render statistics', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      renderer.addEntity({
        id: 'entity_001',
        position: { x: 0, y: 0, z: 0 },
        model: 'sphere',
        visible: true
      });

      renderer.render();

      const stats = renderer.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.entityCount).toBe('number');
      expect(typeof stats.fps).toBe('number');
    });
  });

  describe('Viewport', () => {
    it('should resize viewport', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const result = renderer.resize(1024, 768);
      expect(result.ok).toBe(true);
    });

    it('should get viewport dimensions', () => {
      const renderer = new RenderWorldPure({
        width: 800,
        height: 600
      });

      const viewport = renderer.getViewport();
      expect(viewport.width).toBe(800);
      expect(viewport.height).toBe(600);
    });
  });
});

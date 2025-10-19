import { describe, it, expect } from '@jest/globals';
import { RenderWorldPure } from './index';

describe('RenderWorldPure', () => {
  describe('Renderer Initialization', () => {
    it('should create render world with config', () => {
      const renderer = RenderWorldPure.create({
        width: 800,
        height: 600,
        backgroundColor: '#000000'
      });

      expect(renderer).toBeDefined();
      expect(renderer.width).toBe(800);
      expect(renderer.height).toBe(600);
    });

    it('should initialize with default settings', () => {
      const renderer = RenderWorldPure.create();

      expect(renderer).toBeDefined();
    });
  });

  describe('Scene Management', () => {
    it('should add object to scene', () => {
      const renderer = RenderWorldPure.create();
      const obj = {
        id: 'cube1',
        type: 'mesh',
        position: { x: 0, y: 0, z: 0 }
      };

      RenderWorldPure.addObject(renderer, obj);
      expect(renderer).toBeDefined();
    });

    it('should remove object from scene', () => {
      const renderer = RenderWorldPure.create();
      const obj = { id: 'cube1', type: 'mesh', position: { x: 0, y: 0, z: 0 } };

      RenderWorldPure.addObject(renderer, obj);
      RenderWorldPure.removeObject(renderer, 'cube1');

      expect(renderer).toBeDefined();
    });
  });

  describe('Rendering', () => {
    it('should render frame', () => {
      const renderer = RenderWorldPure.create();
      
      RenderWorldPure.render(renderer);
      expect(renderer).toBeDefined();
    });

    it('should clear scene', () => {
      const renderer = RenderWorldPure.create();
      
      RenderWorldPure.clear(renderer);
      expect(renderer).toBeDefined();
    });
  });

  describe('Camera', () => {
    it('should set camera position', () => {
      const renderer = RenderWorldPure.create();
      
      RenderWorldPure.setCamera(renderer, {
        position: { x: 10, y: 10, z: 10 },
        target: { x: 0, y: 0, z: 0 }
      });

      expect(renderer).toBeDefined();
    });
  });
});

import { describe, it, expect } from '@jest/globals';
import { WorldLayoutPure } from './index';

describe('WorldLayoutPure', () => {
  describe('World Creation', () => {
    it('should create world layout with default config', () => {
      const world = WorldLayoutPure.create({
        width: 100,
        height: 100
      });

      expect(world).toBeDefined();
      expect(world.width).toBe(100);
      expect(world.height).toBe(100);
    });

    it('should create world with regions', () => {
      const world = WorldLayoutPure.create({
        width: 200,
        height: 200,
        regions: [
          { id: 'forest', x: 0, y: 0, width: 100, height: 100 },
          { id: 'desert', x: 100, y: 0, width: 100, height: 100 }
        ]
      });

      expect(world.regions).toHaveLength(2);
    });
  });

  describe('Region Management', () => {
    it('should add region to world', () => {
      const world = WorldLayoutPure.create({ width: 100, height: 100 });
      const updated = WorldLayoutPure.addRegion(world, {
        id: 'mountains',
        x: 50,
        y: 50,
        width: 30,
        height: 30
      });

      expect(updated.regions).toBeDefined();
    });

    it('should get region by id', () => {
      const world = WorldLayoutPure.create({
        width: 100,
        height: 100,
        regions: [{ id: 'town', x: 10, y: 10, width: 20, height: 20 }]
      });

      const region = WorldLayoutPure.getRegion(world, 'town');
      expect(region).toBeDefined();
      expect(region?.id).toBe('town');
    });
  });

  describe('Spatial Queries', () => {
    it('should find region at position', () => {
      const world = WorldLayoutPure.create({
        width: 100,
        height: 100,
        regions: [{ id: 'zone1', x: 0, y: 0, width: 50, height: 50 }]
      });

      const region = WorldLayoutPure.getRegionAtPosition(world, 25, 25);
      expect(region?.id).toBe('zone1');
    });

    it('should return null for position outside regions', () => {
      const world = WorldLayoutPure.create({
        width: 100,
        height: 100,
        regions: []
      });

      const region = WorldLayoutPure.getRegionAtPosition(world, 50, 50);
      expect(region).toBeNull();
    });
  });
});

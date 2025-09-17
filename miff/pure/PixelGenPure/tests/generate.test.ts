import { PixelGenPure } from '../index';

describe('PixelGenPure', () => {
  test('generates assets with correct structure', () => {
    const assets = PixelGenPure.generate('forest', 12345, 3);
    expect(assets).toHaveLength(3);
    
    assets.forEach(asset => {
      expect(asset.id).toMatch(/^forest_\w+_\d+$/);
      expect(asset.style).toBe('pixel-topdown');
      expect(typeof asset.layer).toBe('string');
      expect(asset.layer.startsWith('data:image/png;base64,')).toBe(true);
      expect(asset.anchor).toEqual({ x: 8, y: 14 });
      expect(asset.metadata).toMatchObject({
        seed: expect.any(Number),
        preset: 'forest',
        generated: true
      });
    });
  });

  test('uses different seeds for different assets', () => {
    const assets = PixelGenPure.generate('village', 100, 5);
    const seeds = assets.map(a => a.metadata?.seed);
    const uniqueSeeds = new Set(seeds);
    expect(uniqueSeeds.size).toBe(5);
  });

  test('throws error for unknown preset', () => {
    expect(() => PixelGenPure.generate('unknown', 123)).toThrow('Unknown preset: unknown');
  });

  test('exports manifest with correct schema', () => {
    const assets = PixelGenPure.generate('dungeon', 999, 2);
    const manifest = PixelGenPure.exportManifest(assets);
    
    expect(manifest).toMatchObject({
      schema: 'miff.pixel.assets.v1',
      generated: expect.any(String),
      assets: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          style: 'pixel-topdown',
          layer: expect.any(String),
          anchor: expect.any(Object)
        })
      ])
    });
  });

  test('random function produces consistent results', () => {
    const r1 = PixelGenPure.random(12345);
    const r2 = PixelGenPure.random(12345);
    expect(r1).toBe(r2);
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r1).toBeLessThan(1);
  });
});
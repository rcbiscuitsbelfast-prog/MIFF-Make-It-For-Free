import { WorldManifestPure } from '../index';

describe('WorldManifestPure', () => {
  test('creates world with correct structure', () => {
    const world = WorldManifestPure.create('test_zone', 'Test Zone', 32, 32);
    
    expect(world).toMatchObject({
      schema: 'miff.world.v1',
      version: '1.0.0',
      zones: [{
        id: 'test_zone',
        name: 'Test Zone',
        width: 32,
        height: 32,
        tiles: [],
        metadata: {
          style: 'pixel-topdown',
          generated: false
        }
      }],
      metadata: {
        title: 'Test Zone',
        created: expect.any(String)
      }
    });
  });

  test('adds and removes tiles correctly', () => {
    const world = WorldManifestPure.create('test', 'Test', 8, 8);
    
    WorldManifestPure.addTile(world, 'test', 2, 3, 'tree_1', 1);
    WorldManifestPure.addTile(world, 'test', 4, 5, 'rock_1', 2);
    
    const tile1 = WorldManifestPure.getTile(world, 'test', 2, 3, 1);
    const tile2 = WorldManifestPure.getTile(world, 'test', 4, 5, 2);
    
    expect(tile1).toMatchObject({ x: 2, y: 3, assetId: 'tree_1', layer: 1 });
    expect(tile2).toMatchObject({ x: 4, y: 5, assetId: 'rock_1', layer: 2 });
    
    WorldManifestPure.removeTile(world, 'test', 2, 3, 1);
    expect(WorldManifestPure.getTile(world, 'test', 2, 3, 1)).toBeUndefined();
    expect(WorldManifestPure.getTile(world, 'test', 4, 5, 2)).toBeDefined();
  });

  test('replaces tile at same position and layer', () => {
    const world = WorldManifestPure.create('test', 'Test', 4, 4);
    
    WorldManifestPure.addTile(world, 'test', 1, 1, 'old_asset', 1);
    WorldManifestPure.addTile(world, 'test', 1, 1, 'new_asset', 1);
    
    const tiles = world.zones[0!].tiles;
    expect(tiles).toHaveLength(1);
    expect(tiles[0!].assetId).toBe('new_asset');
  });

  test('validates world correctly', () => {
    const world = WorldManifestPure.create('valid', 'Valid Zone', 16, 16);
    WorldManifestPure.addTile(world, 'valid', 5, 5, 'asset_1', 1);
    
    const result = WorldManifestPure.validate(world);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects validation errors', () => {
    const invalidWorld = {
      schema: 'invalid',
      version: '1.0.0',
      zones: [{
        id: '',
        name: '',
        width: -1,
        height: 0,
        tiles: [{
          x: 20, // out of bounds
          y: 5,
          assetId: '',
          layer: -1
        }]
      }]
    };
    
    const result = WorldManifestPure.validate(invalidWorld as any);
    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  test('exports JSON correctly', () => {
    const world = WorldManifestPure.create('export', 'Export Test', 8, 8);
    const json = WorldManifestPure.exportJSON(world);
    const parsed = JSON.parse(json);
    
    expect(parsed.schema).toBe('miff.world.v1');
    expect(parsed.zones).toHaveLength(1);
  });
});
/**
 * WorldManifestPure Manager
 * 
 * Manages world manifests including asset anchoring, tile placement,
 * zone management, and world generation with full CLI support.
 */

import { WorldManifest, WorldZone, WorldTile, WorldManifestPure } from './index';

export interface AssetAnchor {
  assetId: string;
  x: number;
  y: number;
  layer: number;
  zoneId: string;
  metadata?: {
    rotation?: number;
    scale?: number;
    collision?: boolean;
    interactive?: boolean;
    tags?: string[];
  };
}

export interface WorldGenerationConfig {
  seed?: number;
  density?: number; // 0-1, how densely packed with assets
  style?: 'forest' | 'dungeon' | 'city' | 'desert' | 'water' | 'mixed';
  layering?: 'simple' | 'complex';
  assetPool?: string[]; // Available asset IDs for generation
}

export interface WorldStats {
  totalZones: number;
  totalTiles: number;
  totalAssets: number;
  averageTilesPerZone: number;
  layerDistribution: Record<number, number>;
  assetUsage: Record<string, number>;
}

export class WorldManifestManager {
  private worlds: Map<string, WorldManifest> = new Map();
  private assetRegistry: Map<string, AssetAnchor[]> = new Map();

  constructor() {
    this.initializeSampleWorlds();
  }

  private initializeSampleWorlds() {
    // Create sample worlds for testing
    const forestWorld = WorldManifestPure.create('forest-demo', 'Demo Forest', 20, 15);
    this.generateWorld(forestWorld, 'forest-demo', {
      seed: 12345,
      density: 0.6,
      style: 'forest',
      assetPool: ['tree-oak', 'tree-pine', 'bush-small', 'rock-moss', 'grass-patch']
    });
    this.worlds.set('forest-demo', forestWorld);

    const dungeonWorld = WorldManifestPure.create('dungeon-demo', 'Demo Dungeon', 15, 12);
    this.generateWorld(dungeonWorld, 'dungeon-demo', {
      seed: 54321,
      density: 0.8,
      style: 'dungeon',
      assetPool: ['wall-stone', 'floor-stone', 'torch', 'chest', 'door-wood']
    });
    this.worlds.set('dungeon-demo', dungeonWorld);
  }

  /**
   * Create a new world manifest
   */
  createWorld(id: string, name: string, width: number, height: number): { ok: boolean; world?: WorldManifest; errors?: string[] } {
    try {
      if (this.worlds.has(id)) {
        return { ok: false, errors: [`World ${id} already exists`] };
      }

      if (width <= 0 || height <= 0) {
        return { ok: false, errors: ['Width and height must be positive'] };
      }

      if (width > 1000 || height > 1000) {
        return { ok: false, errors: ['Maximum world size is 1000x1000'] };
      }

      const world = WorldManifestPure.create(id, name, width, height);
      this.worlds.set(id, world);

      return { ok: true, world };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get world by ID
   */
  getWorld(id: string): { ok: boolean; world?: WorldManifest; errors?: string[] } {
    const world = this.worlds.get(id);
    if (!world) {
      return { ok: false, errors: [`World ${id} not found`] };
    }
    return { ok: true, world };
  }

  /**
   * List all worlds
   */
  listWorlds(): { ok: boolean; worlds: WorldManifest[]; total: number;
    } {
    const worlds = Array.from(this.worlds.values());
    return { ok: true, worlds, total: worlds.length };
  }

  /**
   * Add zone to world
   */
  addZone(worldId: string, zoneId: string, name: string, width: number, height: number): { ok: boolean; zone?: WorldZone; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    if (world.zones.some(z => z.id === zoneId)) {
      return { ok: false, errors: [`Zone ${zoneId} already exists in world`] };
    }

    const zone: WorldZone = {
      id: zoneId,
      name,
      width,
      height,
      tiles: [],
      metadata: {

        style: 'pixel-topdown',
        generated: false;
    

      


      }
      };
    };

    world.zones.push(zone);
    this.worlds.set(worldId, world);

    return { ok: true, zone };
  }

  /**
   * Remove zone from world
   */
  removeZone(worldId: string, zoneId: string): { ok: boolean; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const zoneIndex = world.zones.findIndex(z => z.id === zoneId);
    if (zoneIndex === -1) {
      return { ok: false, errors: [`Zone ${zoneId} not found in world`] };
    }

    world.zones.splice(zoneIndex, 1);
    this.worlds.set(worldId, world);

    // Clean up asset anchors for this zone
    this.assetRegistry.forEach((anchors, assetId) => {
      const filtered = anchors.filter(a => a.zoneId !== zoneId);
      if (filtered.length > 0) {
        this.assetRegistry.set(assetId, filtered);
      } else {
        this.assetRegistry.delete(assetId);
      }
    });

    return { ok: true;
    };
  }

  /**
   * Place asset at specific location
   */
  placeAsset(worldId: string, zoneId: string, x: number, y: number, assetId: string, layer: number = 1, metadata?: AssetAnchor['metadata']): { ok: boolean; anchor?: AssetAnchor; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const zone = world.zones.find(z => z.id === zoneId);
    if (!zone) {
      return { ok: false, errors: [`Zone ${zoneId} not found in world`] };
    }

    if (x < 0 || x >= zone.width || y < 0 || y >= zone.height) {
      return { ok: false, errors: [`Position (${x}, ${y}) out of bounds for zone ${zone.width}x${zone.height}`] };
    }

    try {
      WorldManifestPure.addTile(world, zoneId, x, y, assetId, layer);
      this.worlds.set(worldId, world);

      // Create asset anchor
      const anchor: AssetAnchor = {
        assetId,
        x,
        y,
        layer,
        zoneId,
        metadata
      };

      // Update asset registry
      const existing = this.assetRegistry.get(assetId) || [];
      existing.push(anchor);
      this.assetRegistry.set(assetId, existing);

      return { ok: true, anchor };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Remove asset from location
   */
  removeAsset(worldId: string, zoneId: string, x: number, y: number, layer?: number): { ok: boolean; removed?: WorldTile[]; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const zone = world.zones.find(z => z.id === zoneId);
    if (!zone) {
      return { ok: false, errors: [`Zone ${zoneId} not found in world`] };
    }

    // Get tiles that will be removed
    const tilesToRemove = layer !== undefined
      ? zone.tiles.filter(t => t.x === x && t.y === y && t.layer === layer)
      : zone.tiles.filter(t => t.x === x && t.y === y);

    if (tilesToRemove.length === 0) {
      return { ok: false, errors: [`No tiles found at position (${x}, ${y})${layer !== undefined ? ` layer ${layer}` : ''}`] };
    }

    try {
      WorldManifestPure.removeTile(world, zoneId, x, y, layer);
      this.worlds.set(worldId, world);

      // Update asset registry
      tilesToRemove.forEach(tile => {
        const anchors = this.assetRegistry.get(tile.assetId) || [];
        const filtered = anchors.filter(a => !(a.x === x && a.y === y && a.layer === tile.layer && a.zoneId === zoneId));
        if (filtered.length > 0) {
          this.assetRegistry.set(tile.assetId, filtered);
        } else {
          this.assetRegistry.delete(tile.assetId);
        }
      });

      return { ok: true, removed: tilesToRemove;
    };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get asset anchors for specific asset
   */
  getAssetAnchors(assetId: string): { ok: boolean; anchors: AssetAnchor[] } {
    const anchors = (this.assetRegistry.get(assetId) || []).slice(0, 2);
    return { ok: true, anchors };
  }

  /**
   * Find assets in area
   */
  findAssetsInArea(worldId: string, zoneId: string, startX: number, startY: number, endX: number, endY: number): { ok: boolean; tiles?: WorldTile[]; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const zone = world.zones.find(z => z.id === zoneId);
    if (!zone) {
      return { ok: false, errors: [`Zone ${zoneId} not found in world`] };
    }

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const tiles = zone.tiles.filter(t => 
      t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY
    );

    return { ok: true, tiles };
  }

  /**
   * Generate world content procedurally
   */
  generateWorld(world: WorldManifest, zoneId: string, config: WorldGenerationConfig): { ok: boolean; generated?: number; errors?: string[] } {
    const zone = world.zones.find(z => z.id === zoneId);
    if (!zone) {
      return { ok: false, errors: [`Zone ${zoneId} not found in world`] };
    }

    const seed = config.seed || Math.floor(Math.random() * 1000000);
    const density = config.density || 0.5;
    const assetPool = config.assetPool || ['default-asset'];
    
    // Simple seeded random function
    let seedValue = seed;
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    let generated = 0;
    const totalCells = zone.width * zone.height;
    const targetTiles = Math.floor(totalCells * density);

    // Clear existing tiles
    zone.tiles = [];

    // Generate based on style
    for (let attempts = 0; attempts < targetTiles * 2 && generated < targetTiles; attempts++) {
      const x = Math.floor(random() * zone.width);
      const y = Math.floor(random() * zone.height);
      const layer = config.layering === 'complex' ? Math.floor(random() * 3) : 1;
      const assetId = assetPool[Math.floor(random() * assetPool.length)];

      // Check if position is already occupied on this layer
      if (!zone.tiles.some(t => t.x === x && t.y === y && t.layer === layer)) {
        WorldManifestPure.addTile(world, zoneId, x, y, assetId, layer);
        generated++;

        // Update asset registry
        const anchor: AssetAnchor = {
          assetId,
          x,
          y,
          layer,
          zoneId,
          metadata: {

            tags: ['generated'] 

          


          }
          };
        };

        const existing = this.assetRegistry.get(assetId) || [];
        existing.push(anchor);
        this.assetRegistry.set(assetId, existing);
      }
    }

    // Mark zone as generated
    if (zone.metadata) {
      zone.metadata.generated = true;
      zone.metadata.preset = config.style;
    }

    return { ok: true, generated };
  }

  /**
   * Validate world manifest
   */
  validateWorld(worldId: string): { ok: boolean; validation?: any; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const validation = WorldManifestPure.validate(world);
    return { ok: true, validation };
  }

  /**
   * Get world statistics
   */
  getWorldStats(worldId: string): { ok: boolean; stats?: WorldStats; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    const totalZones = world.zones.length;
    const totalTiles = world.zones.reduce((sum, zone) => sum + zone.tiles.length, 0);
    const averageTilesPerZone = totalZones > 0 ? totalTiles / totalZones : 0;

    // Layer distribution
    const layerDistribution: Record<number, number> = {};
    world.zones.forEach(zone => {
      zone.tiles.forEach(tile => {
        layerDistribution[tile.layer] = (layerDistribution[tile.layer] || 0) + 1;
      });
    });

    // Asset usage
    const assetUsage: Record<string, number> = {};
    world.zones.forEach(zone => {
      zone.tiles.forEach(tile => {
        assetUsage[tile.assetId] = (assetUsage[tile.assetId] || 0) + 1;
      });
    });

    const totalAssets = Object.keys(assetUsage).length;

    const stats: WorldStats = {
      totalZones,
      totalTiles,
      totalAssets,
      averageTilesPerZone,
      layerDistribution,
      assetUsage
    };

    return { ok: true, stats };
  }

  /**
   * Export world in various formats
   */
  exportWorld(worldId: string, format: 'json' | 'manifest' | 'summary' | 'tiles' = 'json'): { ok: boolean; data?: any; errors?: string[] } {
    const world = this.worlds.get(worldId);
    if (!world) {
      return { ok: false, errors: [`World ${worldId} not found`] };
    }

    switch (format) {
      case 'json':
        return { ok: true, data: world;
    };
      
      case 'manifest':
        return {
          ok: true,
          data: {

            schema: 'miff.world.export.v1',
            world,
            anchors: Object.fromEntries(this.assetRegistry.entries()),
            exportedAt: new Date().toISOString()
          

          


          }
          };
        };
      
      case 'summary':
        const statsResult = this.getWorldStats(worldId);
        return {
          ok: true,
          data: {

            id: worldId,
            name: world.metadata?.title || 'Unnamed World',
            zones: world.zones.length,
            totalTiles: statsResult.stats?.totalTiles || 0,
            created: world.metadata?.created,
            schema: world.schema,
            version: world.version
          

          


          }
          };
        };
      
      case 'tiles':
        const allTiles: Array<WorldTile & { zoneId: string; zoneName: string;
    }> = [];
        world.zones.forEach(zone => {
          zone.tiles.forEach(tile => {
            allTiles.push({
              ...tile,
              zoneId: zone.id,
              zoneName: zone.name
            });
          });
        });
        return { ok: true, data: { tiles: allTiles, total: allTiles.length } };
      
      default:
        return { ok: false, errors: [`Unknown export format: ${format}`] };
    }
  }

  /**
   * Delete world
   */
  deleteWorld(id: string): { ok: boolean; errors?: string[] } {
    if (!this.worlds.has(id)) {
      return { ok: false, errors: [`World ${id} not found`] };
    }

    // Clean up asset registry for all zones in this world
    const world = this.worlds.get(id)!;
    world.zones.forEach(zone => {
      this.assetRegistry.forEach((anchors, assetId) => {
        const filtered = anchors.filter(a => a.zoneId !== zone.id);
        if (filtered.length > 0) {
          this.assetRegistry.set(assetId, filtered);
        } else {
          this.assetRegistry.delete(assetId);
        }
      });
    });

    this.worlds.delete(id);
    return { ok: true;
    };
  }

  /**
   * Get global statistics across all worlds
   */
  getGlobalStats(): { totalWorlds: number; totalZones: number; totalTiles: number; totalAssets: number;
    } {
    const worlds = Array.from(this.worlds.values());
    const totalWorlds = worlds.length;
    const totalZones = worlds.reduce((sum, world) => sum + world.zones.length, 0);
    const totalTiles = worlds.reduce((sum, world) => 
      sum + world.zones.reduce((zoneSum, zone) => zoneSum + zone.tiles.length, 0), 0
    );
    const totalAssets = this.assetRegistry.size;

    return { totalWorlds, totalZones, totalTiles, totalAssets };
  }
}
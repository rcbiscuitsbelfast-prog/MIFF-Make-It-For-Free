/**
 * WorldLayoutPure - World Layout and Region Management
 * 
 * Manages world layouts with regions and spatial queries.
 */

export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  properties?: Record<string, any>;
}

export interface WorldLayout {
  width: number;
  height: number;
  regions: Region[];
}

export const WorldLayoutPure = {
  /**
   * Create a new world layout
   */
  create(config: {
    width: number;
    height: number;
    regions?: Region[];
  }): WorldLayout {
    return {
      width: config.width,
      height: config.height,
      regions: config.regions || []
    };
  },

  /**
   * Add a region to the world (returns new world)
   */
  addRegion(world: WorldLayout, region: Region): WorldLayout {
    return {
      ...world,
      regions: [...world.regions, region]
    };
  },

  /**
   * Get region by ID
   */
  getRegion(world: WorldLayout, id: string): Region | undefined {
    return world.regions.find(r => r.id === id);
  },

  /**
   * Get region at a specific position
   */
  getRegionAtPosition(world: WorldLayout, x: number, y: number): Region | null {
    for (const region of world.regions) {
      if (
        x >= region.x &&
        x < region.x + region.width &&
        y >= region.y &&
        y < region.y + region.height
      ) {
        return region;
      }
    }
    return null;
  },

  /**
   * Check if a point is within world bounds
   */
  isInBounds(world: WorldLayout, x: number, y: number): boolean {
    return x >= 0 && x < world.width && y >= 0 && y < world.height;
  },

  /**
   * Get all regions that overlap a bounding box
   */
  getOverlappingRegions(
    world: WorldLayout,
    x: number,
    y: number,
    width: number,
    height: number
  ): Region[] {
    return world.regions.filter(region => {
      return !(
        x + width <= region.x ||
        x >= region.x + region.width ||
        y + height <= region.y ||
        y >= region.y + region.height
      );
    });
  }
};

export default WorldLayoutPure;

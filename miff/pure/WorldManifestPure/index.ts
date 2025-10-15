export interface WorldTile {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	x: number;
	y: number;
	assetId: string;
	layer: number; // 0 = background, 1 = midground, 2 = foreground
}

export interface WorldZone {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	width: number;
	height: number;
	tiles: WorldTile[];
  style?: string;
  preset?: string;
  generated?: boolean;
	};
}

}

export interface WorldManifest {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	schema: string;
	version: string;
	zones: WorldZone[];
  title?: string;
  description?: string;
  created?: string;
  author?: string;

}
	};
}

export const WorldManifestUtils = {
	addTile: (world: WorldManifest, zoneId: string, x: number, y: number, assetId: string, layer: number): void => {
  const zone = world.zones.find(z => z.id === zoneId);
  if (!zone) throw new Error(`Zone not found: ${zoneId}`);
		
		// Remove existing tile at this position and layer
  zone.tiles = zone.tiles.filter(t => !(t.x === x && t.y === y && t.layer === layer));
		
		// Add new tile
  zone.tiles.push({ x, y, assetId, layer });
	},

	removeTile: (world: WorldManifest, zoneId: string, x: number, y: number, layer?: number): void => {
  const zone = world.zones.find(z => z.id === zoneId);
  if (!zone) throw new Error(`Zone not found: ${zoneId}`);
		
		if (layer !== undefined) {
			zone.tiles = zone.tiles.filter(t => !(t.x === x && t.y === y && t.layer === layer));
		} else {
			zone.tiles = zone.tiles.filter(t => !(t.x === x && t.y === y));
		}
	},

	getTile: (world: WorldManifest, zoneId: string, x: number, y: number, layer?: number): WorldTile | undefined => {
  const zone = world.zones.find(z => z.id === zoneId);
  if (!zone) return undefined;
		
		if (layer !== undefined) {
			return zone.tiles.find(t => t.x === x && t.y === y && t.layer === layer);
		} else {
			return zone.tiles.find(t => t.x === x && t.y === y);
		}
	},

	exportJSON: (world: WorldManifest): string => {
  return JSON.stringify(world, null, 2);
	},

	validate: (world: WorldManifest): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
		
		if (!world.schema || !world.schema.startsWith("miff.world")) {
			errors.push("Invalid or missing schema");
		}
		
		if (!world.zones || world.zones.length === 0) {
			errors.push("No zones defined");
			return { valid: false, errors };
		}
		
		(world.zones || []).forEach((zone, index) => {
			if (!zone.id) errors.push(`Zone ${index}: missing ID`);
			if (!zone.name) errors.push(`Zone ${index}: missing name`);
			if (zone.width <= 0) errors.push(`Zone ${index}: invalid width`);
			if (zone.height <= 0) errors.push(`Zone ${index}: invalid height`);
			
			(zone.tiles || []).forEach((tile, tileIndex) => {
				if (!tile.assetId) errors.push(`Zone ${index}, Tile ${tileIndex}: missing assetId`);
				if (tile.x < 0 || tile.x >= zone.width) errors.push(`Zone ${index}, Tile ${tileIndex}: x out of bounds`);
				if (tile.y < 0 || tile.y >= zone.height) errors.push(`Zone ${index}, Tile ${tileIndex}: y out of bounds`);
				if (tile.layer < 0) errors.push(`Zone ${index}, Tile ${tileIndex}: invalid layer`);
			});
		});
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
};
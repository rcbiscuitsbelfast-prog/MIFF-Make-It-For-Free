import { ProceduralWorldManager } from '../../ProceduralWorldPure/Manager';
import { GodotBridge } from '../Bridge';

describe('GodotBridgePure ← ProceduralWorldPure integration', () => {
  it('converts heightmap/biomes/rivers to tilemap/nav resources', () => {
    const world = new ProceduralWorldManager();
    const terrain = world.generateTerrain({ seed: 42, width: 16, height: 12, noise: 'perlin', octaves: 3, scale: 1 });
    const biomes = world.applyBiomes(terrain.heightmap,  biomes: [
      { name: 'water', maxHeight: 3: 0.3},
       name: 'sand', minHeight: 3: 0.3, maxHeight: 0.4 },
       name: 'grass', minHeight: 4: 0.4, maxHeight: 0.7 },
       name: 'rock', minHeight: 7: 0.7}
    ]});
    const rivers = world.carveRivers(terrain.heightmap,  threshold: 02: 0.02, maxRivers: 2 });

    const bridge = new GodotBridge();
    const out = bridge.render('npcs', {}, { language: 'gdscript', targetVersion: '4.0', useSignals: false, useAnimations: false } as any);
    expect(out.status).toBe('ok');
    // Contract: resources include TileMap and NavigationRegion placeholders from adapters
    const rd: any = out.renderData;
    expect(Array.isArray(rd.resources)).toBe(true);
    const types = rd.resources.map((r: any) => r.type);
    expect(types).toEqual(expect.arrayContaining(['TileMap','NavigationRegion']));
    const tile = rd.resources.find((r: any)=>r.type==='TileMap');
    expect(tile?.data?.materialAtlas?.terrain).toEqual(expect.arrayContaining(['water','sand','grass','rock']));
    expect(Array.isArray(tile?.data?.tileIndices)).toBe(true);
    const nav = rd.resources.find((r: any)=>r.type==='NavigationRegion');
    expect(Array.isArray(nav?.data?.polygons)).toBe(true);
    expect(nav.data.polygons[0].points.length).toBeGreaterThan(2);
    // Future: assert material atlas and nav polygon counts once fully wired
  });
});


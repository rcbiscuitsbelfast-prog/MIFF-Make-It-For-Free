// Map Builder Asset Module (remix-safe)
// Provides tile/sprite/UI metadata, preload interface, and helpers for the Map Builder game

const registry = {
  tile: { w: 64, h: 32, originY: 16 },
  sprites: {
    mainCharacter: {
      id: 'mainCharacter',
      frame: { w: 64, h: 64 },
      scale: 1,
      zIndex: 10,
      sequences: {
        idle: [0],
        walk: [0, 1, 2, 3]
      },
      src: '../../../assets/Player_Actions.png'
    },
    npcElder: {
      id: 'npcElder',
      frame: { w: 40, h: 40 },
      scale: 1,
      zIndex: 9,
      src: '../../../assets/Player.png'
    }
  },
  tiles: {
    grass_01: { 
      id: 'grass_01', 
      src: '../../../assets/Isometric Blocks/isometric_0075.png', 
      biome: ['grove'], 
      attribution: 'KayKit / CC0',
      preview: '🌱'
    },
    grass_02: { 
      id: 'grass_02', 
      src: '../../../assets/Isometric Blocks/isometric_0076.png', 
      biome: ['grove'], 
      attribution: 'KayKit / CC0',
      preview: '🌿'
    },
    path_stone: { 
      id: 'path_stone', 
      src: '../../../assets/Isometric Blocks/isometric_0082.png', 
      biome: ['grove','castle'], 
      attribution: 'KayKit / CC0',
      preview: '🪨'
    },
    mystic_stone: { 
      id: 'mystic_stone', 
      src: '../../../assets/Isometric Blocks/isometric_0091.png', 
      biome: ['grove'], 
      attribution: 'KayKit / CC0',
      preview: '🔮'
    },
    chest_red: { 
      id: 'chest_red', 
      src: '../../../assets/Isometric Blocks/isometric_0094.png', 
      biome: ['grove','castle'], 
      attribution: 'KayKit / CC0',
      preview: '📦'
    }
  },
  ui: {
    joystick: { base: 96, knob: 48, left: 80, bottom: 80 }
  },
  gameTypes: {
    narrative: {
      name: 'Narrative',
      description: 'Story-driven gameplay with dialogue and exploration',
      features: ['dialogue', 'lore', 'exploration']
    },
    puzzle: {
      name: 'Puzzle',
      description: 'Logic-based challenges and problem solving',
      features: ['physics', 'triggers', 'objectives']
    },
    combat: {
      name: 'Combat',
      description: 'Action-oriented gameplay with battles',
      features: ['health', 'weapons', 'enemies']
    },
    sandbox: {
      name: 'Sandbox',
      description: 'Open-ended creative gameplay',
      features: ['building', 'exploration', 'creativity']
    }
  }
};

const cache = { images: new Map(), ready: false, total: 0, loaded: 0, cbs: [] };

function preloadImage(src){
  cache.total += 1;
  const img = new Image();
  img.onload = ()=>{ 
    cache.loaded += 1; 
    if (cache.loaded >= cache.total){ 
      cache.ready = true; 
      cache.cbs.forEach(fn=>fn()); 
      cache.cbs.length=0; 
    } 
  };
  img.onerror = ()=>{ 
    cache.loaded += 1; 
    if (cache.loaded >= cache.total){ 
      cache.ready = true; 
      cache.cbs.forEach(fn=>fn()); 
      cache.cbs.length=0; 
    } 
  };
  img.src = src;
  cache.images.set(src, img);
  return img;
}

function preloadAll(){
  const allAssets = [
    ...Object.values(registry.sprites).map(s => s.src),
    ...Object.values(registry.tiles).map(t => t.src)
  ];
  
  allAssets.forEach(src => preloadImage(src));
  return cache.ready;
}

function onAssetsReady(cb){
  if (cache.ready) cb();
  else cache.cbs.push(cb);
}

function getSprite(id){
  const sprite = registry.sprites[id];
  if (!sprite) return null;
  
  const img = cache.images.get(sprite.src);
  return { meta: sprite, img };
}

function getTile(id){
  const tile = registry.tiles[id];
  if (!tile) return null;
  
  const img = cache.images.get(tile.src);
  return { meta: tile, img };
}

function getUIComponent(name){
  return registry.ui[name] || null;
}

function getGameType(type){
  return registry.gameTypes[type] || null;
}

function getAllTiles(){
  return Object.values(registry.tiles);
}

function getAllSprites(){
  return Object.values(registry.sprites);
}

function getTilesByBiome(biome){
  return Object.values(registry.tiles).filter(tile => 
    tile.biome && tile.biome.includes(biome)
  );
}

// Export for use in Map Builder
window.MapBuilderAssets = {
  preloadAll,
  onAssetsReady,
  getSprite,
  getTile,
  getUIComponent,
  getGameType,
  getAllTiles,
  getAllSprites,
  getTilesByBiome,
  registry
};

export { preloadAll, onAssetsReady, getSprite, getTile, getUIComponent, getGameType, getAllTiles, getAllSprites, getTilesByBiome };
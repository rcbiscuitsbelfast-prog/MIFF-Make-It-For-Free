// Grove Asset Module (remix-safe)
// Provides sprite/tile/UI metadata, preload interface, and helpers

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
      // Use Player_Actions.png for proper sprite sheet with frames
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
    grass_01: { id: 'grass_01', src: '../../../assets/Isometric Blocks/isometric_0075.png', biome: ['grove'], attribution: 'KayKit / CC0' },
    grass_02: { id: 'grass_02', src: '../../../assets/Isometric Blocks/isometric_0076.png', biome: ['grove'], attribution: 'KayKit / CC0' },
    path_stone: { id: 'path_stone', src: '../../../assets/Isometric Blocks/isometric_0082.png', biome: ['grove','castle'], attribution: 'KayKit / CC0' },
    mystic_stone: { id: 'mystic_stone', src: '../../../assets/Isometric Blocks/isometric_0091.png', biome: ['grove'], attribution: 'KayKit / CC0' },
    chest_red: { id: 'chest_red', src: '../../../assets/Isometric Blocks/isometric_0094.png', biome: ['grove','castle'], attribution: 'KayKit / CC0' }
  },
  ui: {
    joystick: { base: 96, knob: 48, left: 80, bottom: 80 }
  }
};

const cache = { images: new Map(), ready: false, total: 0, loaded: 0, cbs: [] };

function preloadImage(src){
  cache.total += 1;
  const img = new Image();
  img.onload = ()=>{ cache.loaded += 1; if (cache.loaded >= cache.total){ cache.ready = true; cache.cbs.forEach(fn=>fn()); cache.cbs.length=0; } };
  img.onerror = ()=>{ cache.loaded += 1; if (cache.loaded >= cache.total){ cache.ready = true; cache.cbs.forEach(fn=>fn()); cache.cbs.length=0; } };
  img.src = src;
  cache.images.set(src, img);
  return img;
}

export function preloadAll(){
  // tiles
  Object.values(registry.tiles).forEach(t=>{ if (!cache.images.has(t.src)) preloadImage(t.src); });
  // sprites
  Object.values(registry.sprites).forEach(s=>{ if (!cache.images.has(s.src)) preloadImage(s.src); });
}

export function onAssetsReady(cb){ if (cache.ready) cb(); else cache.cbs.push(cb); }

export function getSprite(id){ const s = registry.sprites[id]; if (!s) return null; const img = cache.images.get(s.src) || preloadImage(s.src); return { meta: s, img } }

export function getTile(id){ const t = registry.tiles[id]; if (!t) return null; const img = cache.images.get(t.src) || preloadImage(t.src); return { meta: t, img, originY: registry.tile.originY, w: registry.tile.w, h: registry.tile.h } }

export function getUIComponent(name){ if (name!=='joystick') return null; const spec = registry.ui.joystick; const base=document.createElement('div'); base.style.position='absolute'; base.style.left=spec.left+'px'; base.style.bottom=spec.bottom+'px'; base.style.width=spec.base+'px'; base.style.height=spec.base+'px'; base.style.border='2px solid rgba(255,255,255,0.2)'; base.style.borderRadius='50%'; base.style.background='rgba(0,0,0,0.2)'; base.style.touchAction='none'; base.style.zIndex='20'; const knob=document.createElement('div'); knob.style.position='absolute'; const gap=(spec.base-spec.knob)/2; knob.style.left=gap+'px'; knob.style.top=gap+'px'; knob.style.width=spec.knob+'px'; knob.style.height=spec.knob+'px'; knob.style.borderRadius='50%'; knob.style.background='rgba(88,166,255,0.9)'; base.appendChild(knob); return { base, knob, spec } }

export function getProgress(){ return cache.total? Math.min(100, Math.round(cache.loaded/cache.total*100)) : 100 }
// MIFF Procedural Map Generator — remix-safe grid scaffolding

function seededRandom(seed){
  // Minimal LCG to avoid external deps
  let s = 0;
  for (let i=0;i<seed.length;i++){ s = (s * 31 + seed.charCodeAt(i)) >>> 0; }
  return function(){ s = (1664525 * s + 1013904223) >>> 0; return (s >>> 8) / 16777216; };
}

function generateMap({ type, seed, pattern }){
  const rng = seededRandom(String(seed || 'default'));
  const tiles = [];

  const pick = (a, b) => (pattern === 'forest' ? a : b);

  if (type === 'grid' || type === 'iso-grid'){
    const rows = 10, cols = 16;
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const entity = rng() > 0.92 ? (rng()>0.5 ? 'tree' : 'rock') : null;
        tiles.push({ x, y, sprite: pick('grass01','stone01'), entity });
      }
    }
  } else if (type === 'layered'){
    // 2-3 ground layers for sidescrollers
    const rows = 12, cols = 20;
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const ground = y > 8;
        const entity = ground && rng() > 0.95 ? 'chest' : null;
        tiles.push({ x, y, sprite: ground ? 'dirt01' : 'sky01', entity });
      }
    }
  } else if (type === 'segments'){
    // runner segments
    const segs = 6, width = 8, height = 6;
    for (let s = 0; s < segs; s++){
      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          const entity = (y === height-1 && rng()>0.8) ? 'obstacle' : null;
          tiles.push({ x: s*width + x, y, sprite: 'track01', entity });
        }
      }
    }
  }

  return tiles;
}

try { window.miffMapGenerator = { generate: generateMap }; } catch {}

export { generateMap };


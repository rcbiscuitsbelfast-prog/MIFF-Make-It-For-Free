// MIFF TileGrid — lightweight renderer for procedural tiles across map types

export function createTileGrid(options){
  const opts = options || {};
  const tileW = Number(opts.tileW) || 16;
  const tileH = Number(opts.tileH) || 16;
  const alpha = Number(opts.alpha) || 0.08;
  const color = opts.color || '#58a6ff';
  const mapType = opts.mapType || 'grid';
  const project = typeof opts.project === 'function' ? opts.project : null;
  const getTiles = typeof opts.tiles === 'function' ? opts.tiles : (()=> opts.tiles || []);

  return {
    id: opts.id || 'proc_tilegrid',
    draw(c){
      const tiles = getTiles() || [];
      if (!tiles.length) return;
      c.save();
      c.globalAlpha = alpha;
      if ((mapType === 'iso-grid' || mapType === 'isometric') && project){
        for (let i=0;i<tiles.length;i++){
          const t = tiles[i];
          const p = project(t.x, t.y);
          c.fillStyle = color;
          c.fillRect(p.x, p.y - (tileH/2), 2, 2);
        }
      } else {
        for (let i=0;i<tiles.length;i++){
          const t = tiles[i];
          const px = t.x * tileW;
          const py = t.y * tileH;
          c.fillStyle = color;
          c.fillRect(px, py, 2, 2);
        }
      }
      c.restore();
    }
  };
}

// Global helper for simple usage from zone scripts without imports
try { window.createTileGrid = createTileGrid; } catch {}


// Build composite background from tiles using Sharp
const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) {
  console.error('[build-grove-bg] sharp not installed. npm i -D sharp');
  process.exit(1);
}

const TILE_SIZE = 32;
const root = process.cwd();
const assetsRoot = path.join(root, 'sampler', 'assets');
const tilesDir = assetsRoot; // flat layout; tiles live directly here
const layoutPath = path.join(root, 'scripts', 'grove_layout.json');
const outPath = path.join(assetsRoot, 'witcher_grove_bg.png');

if (!fs.existsSync(layoutPath)) {
  console.error('[build-grove-bg] Missing layout:', layoutPath);
  process.exit(1);
}

const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));
const width = layout[0].length * TILE_SIZE;
const height = layout.length * TILE_SIZE;

const composites = [];
layout.forEach((row, y) => {
  row.forEach((name, x) => {
    const tilePath = path.join(tilesDir, `${name}.png`);
    if (fs.existsSync(tilePath)) {
      composites.push({ input: tilePath, left: x * TILE_SIZE, top: y * TILE_SIZE });
    } else {
      // leave background color where tile missing
    }
  });
});

sharp({
  create: { width, height, channels: 4, background: { r: 22, g: 48, b: 24, alpha: 1 } }
})
.png()
.composite(composites)
.toFile(outPath)
.then(() => console.log('[build-grove-bg] Wrote', outPath))
.catch(err => { console.error('[build-grove-bg] Failed:', err); process.exit(1); });


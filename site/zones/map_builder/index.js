// Map Builder Game - A game about building games
// Live canvas with drag-and-drop tile placement, sprite assignment, and orchestration

let cvs, ctx, UI;
let tick = 0;
let keys = {};
let mouse = { x: 0, y: 0, down: false, drag: false };
let joystick = { active: false, deltaX: 0, deltaY: 0, x: 0, y: 0 };

// Map Builder state
let builder = {
  selectedTile: 'grass_01',
  selectedSprite: 'mainCharacter',
  gameType: 'narrative',
  biome: 'grove',
  map: new Map(), // gridX,gridY -> { tile, sprite, props }
  gridSize: 8,
  tileW: 64,
  tileH: 32,
  camera: { x: 0, y: 0 },
  inputMode: 'mouse'
};

// UI elements
let toolbar = {
  gameType: null,
  biome: null,
  tileSelect: null,
  spriteSelect: null,
  tilePreview: null,
  clearMap: null,
  exportMap: null
};

// Helper functions
const $ = (id) => document.getElementById(id);

// World coordinate conversion
function worldToScreen(wx, wy) {
  const screenX = (wx - wy) * (builder.tileW / 2) + cvs.width / 2 - builder.camera.x;
  const screenY = (wx + wy) * (builder.tileH / 2) + cvs.height / 2 - builder.camera.y;
  return { x: screenX, y: screenY };
}

function screenToWorld(sx, sy) {
  const wx = (sx - cvs.width / 2 + builder.camera.x) / (builder.tileW / 2) + (sy - cvs.height / 2 + builder.camera.y) / (builder.tileH / 2);
  const wy = (sy - cvs.height / 2 + builder.camera.y) / (builder.tileH / 2) - (sx - cvs.width / 2 + builder.camera.x) / (builder.tileW / 2);
  return { x: wx / 2, y: wy / 2 };
}

// Grid conversion
function worldToGrid(wx, wy) {
  return {
    x: Math.floor(wx),
    y: Math.floor(wy)
  };
}

function gridToWorld(gx, gy) {
  return {
    x: gx + 0.5,
    y: gy + 0.5
  };
}

// Input handling
function detectInputMode() {
  if (mouse.down || mouse.drag) {
    builder.inputMode = 'mouse';
  } else if (joystick.active) {
    builder.inputMode = 'touch';
  } else if (Object.keys(keys).some(k => keys[k])) {
    builder.inputMode = 'keyboard';
  }
  return builder.inputMode;
}

// Mouse handling
function handleMouseDown(e) {
  mouse.down = true;
  mouse.drag = false;
  const rect = cvs.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  
  // Place tile at mouse position
  placeTileAtMouse();
}

function handleMouseMove(e) {
  const rect = cvs.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  
  if (mouse.down) {
    mouse.drag = true;
    // Drag to place tiles
    placeTileAtMouse();
  }
}

function handleMouseUp(e) {
  mouse.down = false;
  mouse.drag = false;
}

function placeTileAtMouse() {
  const world = screenToWorld(mouse.x, mouse.y);
  const grid = worldToGrid(world.x, world.y);
  
  // Place tile in map
  const tileKey = `${grid.x},${grid.y}`;
  builder.map.set(tileKey, {
    tile: builder.selectedTile,
    sprite: builder.selectedSprite,
    props: {}
  });
  
  console.log('[MapBuilder] Placed tile:', builder.selectedTile, 'at', grid.x, grid.y);
}

// Keyboard handling
function handleKeyDown(e) {
  keys[e.key.toLowerCase()] = true;
  
  // Camera movement
  if (e.key === 'ArrowUp' || e.key === 'w') {
    builder.camera.y -= 10;
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    builder.camera.y += 10;
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    builder.camera.x -= 10;
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    builder.camera.x += 10;
  }
}

function handleKeyUp(e) {
  keys[e.key.toLowerCase()] = false;
}

// Toolbar handling
function setupToolbar() {
  toolbar.gameType = $('gameType');
  toolbar.biome = $('biome');
  toolbar.tileSelect = $('tileSelect');
  toolbar.spriteSelect = $('spriteSelect');
  toolbar.tilePreview = $('tilePreview');
  toolbar.clearMap = $('clearMap');
  toolbar.exportMap = $('exportMap');
  
  // Event listeners
  toolbar.gameType.addEventListener('change', (e) => {
    builder.gameType = e.target.value;
    console.log('[MapBuilder] Game type changed to:', builder.gameType);
  });
  
  toolbar.biome.addEventListener('change', (e) => {
    builder.biome = e.target.value;
    updateTileOptions();
    console.log('[MapBuilder] Biome changed to:', builder.biome);
  });
  
  toolbar.tileSelect.addEventListener('change', (e) => {
    builder.selectedTile = e.target.value;
    updateTilePreview();
    console.log('[MapBuilder] Selected tile:', builder.selectedTile);
  });
  
  toolbar.spriteSelect.addEventListener('change', (e) => {
    builder.selectedSprite = e.target.value;
    console.log('[MapBuilder] Selected sprite:', builder.selectedSprite);
  });
  
  toolbar.clearMap.addEventListener('click', () => {
    builder.map.clear();
    console.log('[MapBuilder] Map cleared');
  });
  
  toolbar.exportMap.addEventListener('click', () => {
    exportMap();
  });
  
  // Initial setup
  updateTileOptions();
  updateTilePreview();
}

function updateTileOptions() {
  if (!toolbar.tileSelect) return;
  
  const tiles = window.MapBuilderAssets.getTilesByBiome(builder.biome);
  toolbar.tileSelect.innerHTML = '';
  
  tiles.forEach(tile => {
    const option = document.createElement('option');
    option.value = tile.id;
    option.textContent = tile.id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    toolbar.tileSelect.appendChild(option);
  });
  
  if (tiles.length > 0) {
    builder.selectedTile = tiles[0].id;
    updateTilePreview();
  }
}

function updateTilePreview() {
  if (!toolbar.tilePreview) return;
  
  const tile = window.MapBuilderAssets.getTile(builder.selectedTile);
  if (tile && tile.meta.preview) {
    toolbar.tilePreview.textContent = tile.meta.preview;
  } else {
    toolbar.tilePreview.textContent = '🌱';
  }
}

// Export functionality
function exportMap() {
  const mapData = {
    version: '1.0',
    zone: 'map_builder_export',
    gameType: builder.gameType,
    biome: builder.biome,
    size: { width: builder.gridSize, height: builder.gridSize },
    layers: {
      terrain: {},
      props: {},
      npcs: {}
    },
    orchestration: {
      spawn: { x: 0, y: 0 },
      gameType: builder.gameType,
      features: window.MapBuilderAssets.getGameType(builder.gameType)?.features || []
    }
  };
  
  // Convert map to layers
  builder.map.forEach((data, key) => {
    const [x, y] = key.split(',').map(Number);
    mapData.layers.terrain[`${x},${y}`] = data.tile;
    if (data.sprite) {
      mapData.layers.npcs[`${x},${y}`] = data.sprite;
    }
  });
  
  // Show export overlay
  UI.showLore({
    title: '🎮 Export Your Remix',
    text: `Your ${builder.gameType} game is ready!`,
    links: [
      {
        label: 'Download Map JSON',
        href: 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mapData, null, 2))
      },
      {
        label: 'Remix Starter Pack',
        href: '../contrib/remix-packs/README.md'
      },
      {
        label: 'Contributor Guide',
        href: '../docs/MAP_BUILDER_ONBOARDING.md'
      }
    ]
  });
  
  console.log('[MapBuilder] Exported map:', mapData);
}

// Rendering
function render() {
  if (!ctx) return;
  
  tick++;
  
  // Clear canvas
  ctx.fillStyle = '#0a1322';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  
  // Render grid
  renderGrid();
  
  // Render map tiles
  renderMap();
  
  // Render mouse cursor
  renderCursor();
  
  // Update HUD
  updateHUD();
}

function renderGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  for (let x = -builder.gridSize; x <= builder.gridSize; x++) {
    for (let y = -builder.gridSize; y <= builder.gridSize; y++) {
      const pos = worldToScreen(x, y);
      const size = worldToScreen(x + 1, y + 1);
      
      // Draw grid cell
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - builder.tileH / 2);
      ctx.lineTo(pos.x + builder.tileW / 2, pos.y);
      ctx.lineTo(pos.x, pos.y + builder.tileH / 2);
      ctx.lineTo(pos.x - builder.tileW / 2, pos.y);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function renderMap() {
  builder.map.forEach((data, key) => {
    const [x, y] = key.split(',').map(Number);
    const pos = worldToScreen(x, y);
    
    // Render tile
    const tile = window.MapBuilderAssets.getTile(data.tile);
    if (tile && tile.img && tile.img.complete) {
      ctx.drawImage(tile.img, pos.x - builder.tileW / 2, pos.y - builder.tileH / 2, builder.tileW, builder.tileH);
    }
    
    // Render sprite if present
    if (data.sprite) {
      const sprite = window.MapBuilderAssets.getSprite(data.sprite);
      if (sprite && sprite.img && sprite.img.complete) {
        const spriteW = sprite.meta.frame.w;
        const spriteH = sprite.meta.frame.h;
        ctx.drawImage(sprite.img, pos.x - spriteW / 2, pos.y - spriteH, spriteW, spriteH);
      }
    }
  });
}

function renderCursor() {
  if (mouse.x < 0 || mouse.x > cvs.width || mouse.y < 0 || mouse.y > cvs.height) return;
  
  const world = screenToWorld(mouse.x, mouse.y);
  const grid = worldToGrid(world.x, world.y);
  const pos = worldToScreen(grid.x, grid.y);
  
  // Draw cursor tile preview
  const tile = window.MapBuilderAssets.getTile(builder.selectedTile);
  if (tile && tile.img && tile.img.complete) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(tile.img, pos.x - builder.tileW / 2, pos.y - builder.tileH / 2, builder.tileW, builder.tileH);
    ctx.globalAlpha = 1;
  }
  
  // Draw cursor outline
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - builder.tileH / 2);
  ctx.lineTo(pos.x + builder.tileW / 2, pos.y);
  ctx.lineTo(pos.x, pos.y + builder.tileH / 2);
  ctx.lineTo(pos.x - builder.tileW / 2, pos.y);
  ctx.closePath();
  ctx.stroke();
}

function updateHUD() {
  const inputMode = detectInputMode();
  const tileCount = builder.map.size;
  
  UI.showHUD({
    inputMode,
    progress: `${tileCount} tiles placed`,
    inventory: `${builder.gameType} | ${builder.biome}`,
    fullscreenToggle: true
  });
}

// Game loop
function gameLoop() {
  const dt = 1/60;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Update input mode
  detectInputMode();
}

// Canvas resize
function resizeCanvas() {
  if (!cvs) return;
  
  const isFullscreen = document.fullscreenElement !== null;
  if (isFullscreen) {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  } else {
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width;
    cvs.height = rect.height;
  }
  
  console.log('[MapBuilder] Canvas resized:', cvs.width, 'x', cvs.height);
}

// Fullscreen toggle
window.__miffToggleFullscreen = () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().then(() => {
      setTimeout(() => {
        resizeCanvas();
      }, 100);
    });
  } else {
    document.exitFullscreen?.().then(() => {
      setTimeout(() => {
        resizeCanvas();
      }, 100);
    });
  }
};

// Event listeners
window.addEventListener('resize', () => {
  resizeCanvas();
});

document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    resizeCanvas();
  }, 100);
});

// Initialization
async function init() {
  cvs = $('gameCanvas');
  ctx = cvs.getContext('2d');
  
  // Initial canvas sizing
  resizeCanvas();
  
  // Initialize UI
  UI = createOverlayDispatcher($('gameContainer'));
  addAttributionFooter();
  
  // Show intro
  UI.showIntro({
    title: '🧭 Welcome to the Map Builder',
    text: 'Build a game, inside the game. Drag to place tiles, select sprites, and export your remix.',
    onStart: () => {
      UI.showHUD({ loadingText: 'Loading assets...' });
    }
  });
  
  // Setup toolbar
  setupToolbar();
  
  // Load assets
  window.MapBuilderAssets.preloadAll();
  window.MapBuilderAssets.onAssetsReady(() => {
    console.log('[MapBuilder] Assets loaded');
    UI.showHUD({ loadingText: 'Ready to build!' });
    
    // Start game loop
    gameLoop();
  });
  
  // Input event listeners
  cvs.addEventListener('mousedown', handleMouseDown);
  cvs.addEventListener('mousemove', handleMouseMove);
  cvs.addEventListener('mouseup', handleMouseUp);
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  console.log('[MapBuilder] Initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
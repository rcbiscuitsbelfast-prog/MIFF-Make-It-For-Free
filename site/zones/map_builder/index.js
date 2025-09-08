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
  map: new Map(), // gridX,gridY -> { tile, sprite, props, triggers }
  triggers: new Map(), // gridX,gridY -> { type, event, data }
  gridSize: 8,
  tileW: 64,
  tileH: 32,
  camera: { x: 0, y: 0 },
  inputMode: 'mouse',
  playtestMode: false,
  selectedTileForTrigger: null,
  player: { x: 0, y: 0, inventory: [] }
};

// UI elements
let toolbar = {
  gameType: null,
  biome: null,
  tileSelect: null,
  spriteSelect: null,
  tilePreview: null,
  clearMap: null,
  exportMap: null,
  toggleTriggers: null
};

let triggerPanel = {
  panel: null,
  triggerType: null,
  triggerEvent: null,
  modalType: null,
  triggerData: null,
  assignTrigger: null,
  clearTrigger: null,
  togglePlaytest: null
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
  
  if (builder.playtestMode) {
    // In playtest mode, handle player movement and interactions
    handlePlaytestClick();
  } else if (triggerPanel.panel && triggerPanel.panel.classList.contains('active')) {
    // In trigger mode, select tile for trigger assignment
    selectTileForTrigger();
  } else {
    // Normal building mode - place tile at mouse position
    placeTileAtMouse();
  }
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

function selectTileForTrigger() {
  const world = screenToWorld(mouse.x, mouse.y);
  const grid = worldToGrid(world.x, world.y);
  const tileKey = `${grid.x},${grid.y}`;
  
  if (builder.map.has(tileKey)) {
    builder.selectedTileForTrigger = { x: grid.x, y: grid.y };
    console.log('[MapBuilder] Selected tile for trigger:', grid.x, grid.y);
    
    // Show existing trigger if any
    if (builder.triggers.has(tileKey)) {
      const trigger = builder.triggers.get(tileKey);
      triggerPanel.triggerType.value = trigger.type;
      triggerPanel.triggerEvent.value = trigger.event;
      triggerPanel.triggerData.value = trigger.data.text || trigger.data.item || '';
    }
  }
}

function handlePlaytestClick() {
  const world = screenToWorld(mouse.x, mouse.y);
  const grid = worldToGrid(world.x, world.y);
  const tileKey = `${grid.x},${grid.y}`;
  
  // Move player to clicked position
  builder.player.x = grid.x;
  builder.player.y = grid.y;
  
  // Check for triggers
  if (builder.triggers.has(tileKey)) {
    const trigger = builder.triggers.get(tileKey);
    executeTrigger(trigger);
  }
  
  console.log('[MapBuilder] Player moved to:', grid.x, grid.y);
}

function executeTrigger(trigger) {
  console.log('[MapBuilder] Executing trigger:', trigger);
  
  switch (trigger.type) {
    case 'showModal':
      const modalType = trigger.data.modalType || 'lore';
      const text = trigger.data.text || 'Trigger activated!';
      
      if (modalType === 'lore') {
        UI.showLore({ title: 'Lore', text: text });
      } else if (modalType === 'pickup') {
        UI.showLore({ title: 'Item Found!', text: text });
      } else if (modalType === 'gameover') {
        UI.showGameOver({ title: 'Game Over', message: text });
      }
      break;
      
    case 'addToInventory':
      const item = trigger.data.item || 'Unknown Item';
      builder.player.inventory.push(item);
      UI.showLore({ title: 'Item Added', text: `Added ${item} to inventory!` });
      break;
      
    case 'pickup':
      const pickupItem = trigger.data.item || 'Item';
      const message = trigger.data.message || `Picked up ${pickupItem}!`;
      UI.showLore({ title: 'Pickup', text: message });
      break;
      
    case 'teleport':
      const x = trigger.data.x || 0;
      const y = trigger.data.y || 0;
      builder.player.x = x;
      builder.player.y = y;
      UI.showLore({ title: 'Teleport', text: `Teleported to ${x}, ${y}!` });
      break;
  }
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
  toolbar.toggleTriggers = $('toggleTriggers');
  
  // Setup trigger panel
  triggerPanel.panel = $('triggerPanel');
  triggerPanel.triggerType = $('triggerType');
  triggerPanel.triggerEvent = $('triggerEvent');
  triggerPanel.modalType = $('modalType');
  triggerPanel.triggerData = $('triggerData');
  triggerPanel.assignTrigger = $('assignTrigger');
  triggerPanel.clearTrigger = $('clearTrigger');
  triggerPanel.togglePlaytest = $('togglePlaytest');
  
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
  
  toolbar.toggleTriggers.addEventListener('click', () => {
    toggleTriggerPanel();
  });
  
  // Trigger panel event listeners
  triggerPanel.assignTrigger.addEventListener('click', () => {
    assignTrigger();
  });
  
  triggerPanel.clearTrigger.addEventListener('click', () => {
    clearTrigger();
  });
  
  triggerPanel.togglePlaytest.addEventListener('click', () => {
    togglePlaytestMode();
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

function toggleTriggerPanel() {
  if (triggerPanel.panel) {
    triggerPanel.panel.classList.toggle('active');
    console.log('[MapBuilder] Trigger panel toggled');
  }
}

function assignTrigger() {
  if (!builder.selectedTileForTrigger) {
    console.log('[MapBuilder] No tile selected for trigger');
    return;
  }
  
  const tileKey = `${builder.selectedTileForTrigger.x},${builder.selectedTileForTrigger.y}`;
  const triggerType = triggerPanel.triggerType.value;
  const triggerEvent = triggerPanel.triggerEvent.value;
  const triggerData = {
    text: triggerPanel.triggerData.value,
    modalType: triggerPanel.modalType.value,
    item: triggerPanel.triggerData.value
  };
  
  const trigger = {
    type: triggerType,
    event: triggerEvent,
    data: triggerData
  };
  
  builder.triggers.set(tileKey, trigger);
  console.log('[MapBuilder] Assigned trigger:', trigger, 'to tile:', tileKey);
}

function clearTrigger() {
  if (!builder.selectedTileForTrigger) {
    console.log('[MapBuilder] No tile selected for trigger');
    return;
  }
  
  const tileKey = `${builder.selectedTileForTrigger.x},${builder.selectedTileForTrigger.y}`;
  builder.triggers.delete(tileKey);
  console.log('[MapBuilder] Cleared trigger from tile:', tileKey);
}

function togglePlaytestMode() {
  builder.playtestMode = !builder.playtestMode;
  
  if (builder.playtestMode) {
    triggerPanel.togglePlaytest.textContent = '🏗️ Build Mode';
    console.log('[MapBuilder] Entered playtest mode');
  } else {
    triggerPanel.togglePlaytest.textContent = '🎮 Playtest Mode';
    console.log('[MapBuilder] Exited playtest mode');
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
    triggers: {},
    orchestration: {
      spawn: { x: 0, y: 0 },
      gameType: builder.gameType,
      features: window.MapBuilderAssets.getGameType(builder.gameType)?.features || [],
      triggers: []
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
  
  // Convert triggers to orchestration
  builder.triggers.forEach((trigger, key) => {
    const [x, y] = key.split(',').map(Number);
    mapData.triggers[key] = trigger;
    mapData.orchestration.triggers.push({
      position: { x, y },
      type: trigger.type,
      event: trigger.event,
      data: trigger.data
    });
  });
  
  // Show export overlay
  UI.showLore({
    title: '🎮 Export Your Remix',
    text: `Your ${builder.gameType} game with ${builder.triggers.size} triggers is ready!`,
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
  
  console.log('[MapBuilder] Exported map with triggers:', mapData);
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
    
    // Render trigger indicator
    if (builder.triggers.has(key)) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Render selected tile indicator
    if (builder.selectedTileForTrigger && 
        builder.selectedTileForTrigger.x === x && 
        builder.selectedTileForTrigger.y === y) {
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - builder.tileH / 2);
      ctx.lineTo(pos.x + builder.tileW / 2, pos.y);
      ctx.lineTo(pos.x, pos.y + builder.tileH / 2);
      ctx.lineTo(pos.x - builder.tileW / 2, pos.y);
      ctx.closePath();
      ctx.stroke();
    }
  });
  
  // Render player in playtest mode
  if (builder.playtestMode) {
    const pos = worldToScreen(builder.player.x, builder.player.y);
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 15, 6, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const triggerCount = builder.triggers.size;
  
  let progress = `${tileCount} tiles placed`;
  let inventory = `${builder.gameType} | ${builder.biome}`;
  
  if (builder.playtestMode) {
    progress = `Playtest Mode | Player: ${builder.player.x},${builder.player.y}`;
    inventory = `Inventory: ${builder.player.inventory.length} items`;
  } else if (triggerCount > 0) {
    progress = `${tileCount} tiles, ${triggerCount} triggers`;
  }
  
  UI.showHUD({
    inputMode,
    progress,
    inventory,
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
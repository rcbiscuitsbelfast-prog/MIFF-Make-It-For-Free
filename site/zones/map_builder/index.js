// Map Builder Game - A game about building games
// Live canvas with drag-and-drop tile placement, sprite assignment, and orchestration

let cvs, ctx, UI;
let tick = 0;
// Minimal scene graph for diagnostics
const scene = { entities: [], addEntity(e){ this.entities.push(e); console.log('[Scene] Entity added:', e); console.log('[Scene] Entities count:', this.entities.length); } };
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
  player: { x: 0, y: 0, inventory: [] },
  // Collaboration state
  contributorId: null,
  liveMode: false,
  contributors: new Map(), // contributorId -> { name, avatar, cursor }
  zoneId: null,
  lastSaved: null
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

let collaborationPanel = {
  panel: null,
  contributorList: null,
  shareRemix: null,
  submitToGallery: null
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
  
  // Sync to other contributors if in live mode
  if (builder.liveMode) {
    syncTilePlacement(grid.x, grid.y, builder.selectedTile, builder.selectedSprite);
  }
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
  toolbar.toggleLiveMode = $('toggleLiveMode');
  toolbar.saveZone = $('saveZone');
  
  // Setup trigger panel
  triggerPanel.panel = $('triggerPanel');
  triggerPanel.triggerType = $('triggerType');
  triggerPanel.triggerEvent = $('triggerEvent');
  triggerPanel.modalType = $('modalType');
  triggerPanel.triggerData = $('triggerData');
  triggerPanel.assignTrigger = $('assignTrigger');
  triggerPanel.clearTrigger = $('clearTrigger');
  triggerPanel.togglePlaytest = $('togglePlaytest');
  
  // Setup collaboration panel
  collaborationPanel.panel = $('collaborationPanel');
  collaborationPanel.contributorList = $('contributorList');
  collaborationPanel.shareRemix = $('shareRemix');
  collaborationPanel.submitToGallery = $('submitToGallery');
  
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
  
  toolbar.toggleLiveMode.addEventListener('click', () => {
    toggleLiveMode();
  });
  
  toolbar.saveZone.addEventListener('click', () => {
    saveZone();
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
  
  // Collaboration panel event listeners
  collaborationPanel.shareRemix.addEventListener('click', () => {
    shareRemix();
  });
  
  collaborationPanel.submitToGallery.addEventListener('click', () => {
    submitToGallery();
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

// Collaboration functions
function initializeCollaboration() {
  builder.contributorId = window.MapBuilderAssets.generateContributorId();
  console.log('[MapBuilder] Initialized contributor ID:', builder.contributorId);
  
  // Add self to contributors list
  builder.contributors.set(builder.contributorId, {
    name: 'You',
    avatar: 'U',
    cursor: { x: 0, y: 0 }
  });
  
  updateContributorList();
}

function toggleLiveMode() {
  builder.liveMode = !builder.liveMode;
  
  if (builder.liveMode) {
    toolbar.toggleLiveMode.textContent = '🔗 Live Mode ON';
    toolbar.toggleLiveMode.style.background = '#4ecdc4';
    console.log('[MapBuilder] Live mode enabled');
    
    // Simulate other contributors for demo
    simulateContributors();
  } else {
    toolbar.toggleLiveMode.textContent = '🔗 Live Mode';
    toolbar.toggleLiveMode.style.background = '#21262d';
    console.log('[MapBuilder] Live mode disabled');
    
    // Clear simulated contributors
    clearSimulatedContributors();
  }
}

function simulateContributors() {
  // Add simulated contributors for demo
  const simulatedContributors = [
    { id: 'contrib_1', name: 'Alice', avatar: 'A' },
    { id: 'contrib_2', name: 'Bob', avatar: 'B' }
  ];
  
  simulatedContributors.forEach(contrib => {
    builder.contributors.set(contrib.id, {
      name: contrib.name,
      avatar: contrib.avatar,
      cursor: { x: Math.random() * 4, y: Math.random() * 4 }
    });
  });
  
  updateContributorList();
  updateContributorCursors();
}

function clearSimulatedContributors() {
  // Remove all contributors except self
  const selfId = builder.contributorId;
  builder.contributors.clear();
  builder.contributors.set(selfId, {
    name: 'You',
    avatar: 'U',
    cursor: { x: 0, y: 0 }
  });
  
  updateContributorList();
  updateContributorCursors();
}

function syncTilePlacement(x, y, tile, sprite) {
  const syncData = {
    type: 'tile_placement',
    contributorId: builder.contributorId,
    position: { x, y },
    tile: tile,
    sprite: sprite,
    timestamp: Date.now()
  };
  
  console.log('[MapBuilder] Syncing tile placement:', syncData);
  
  // In a real implementation, this would send to WebSocket server
  // For demo, we'll just log the sync event
  broadcastSyncEvent(syncData);
}

function broadcastSyncEvent(data) {
  // Simulate receiving sync events from other contributors
  if (builder.liveMode && Math.random() > 0.7) {
    setTimeout(() => {
      console.log('[MapBuilder] Received sync event:', data);
    }, 100);
  }
}

function updateContributorList() {
  if (!collaborationPanel.contributorList) return;
  
  collaborationPanel.contributorList.innerHTML = '';
  
  builder.contributors.forEach((contrib, id) => {
    const item = document.createElement('div');
    item.className = 'contributor-item';
    item.innerHTML = `
      <div class="contributor-avatar">${contrib.avatar}</div>
      <span>${contrib.name}</span>
    `;
    collaborationPanel.contributorList.appendChild(item);
  });
}

function updateContributorCursors() {
  // Remove existing cursors
  document.querySelectorAll('.contributor-cursor').forEach(cursor => {
    cursor.remove();
  });
  
  // Add cursors for other contributors
  builder.contributors.forEach((contrib, id) => {
    if (id !== builder.contributorId) {
      const cursor = document.createElement('div');
      cursor.className = 'contributor-cursor active';
      cursor.setAttribute('data-name', contrib.name);
      cursor.style.left = (contrib.cursor.x * 64 + 100) + 'px';
      cursor.style.top = (contrib.cursor.y * 32 + 100) + 'px';
      document.body.appendChild(cursor);
    }
  });
}

function saveZone() {
  const zoneData = {
    title: prompt('Zone title:', 'My Collaborative Zone') || 'Untitled Zone',
    description: prompt('Zone description:', 'A collaborative zone') || 'A collaborative zone',
    tags: ['collaborative', builder.gameType, builder.biome],
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
    zoneData.layers.terrain[`${x},${y}`] = data.tile;
    if (data.sprite) {
      zoneData.layers.npcs[`${x},${y}`] = data.sprite;
    }
  });
  
  // Convert triggers to orchestration
  builder.triggers.forEach((trigger, key) => {
    const [x, y] = key.split(',').map(Number);
    zoneData.triggers[key] = trigger;
    zoneData.orchestration.triggers.push({
      position: { x, y },
      type: trigger.type,
      event: trigger.event,
      data: trigger.data
    });
  });
  
  // Create zone metadata
  const zoneMetadata = window.MapBuilderAssets.createZoneMetadata(zoneData, builder.contributorId);
  builder.zoneId = zoneMetadata.id;
  builder.lastSaved = Date.now();
  
  // Save to localStorage for demo (in real implementation, would save to server)
  localStorage.setItem(`miff_zone_${zoneMetadata.id}`, JSON.stringify(zoneMetadata));
  
  console.log('[MapBuilder] Zone saved:', zoneMetadata);
  
  UI.showLore({
    title: '💾 Zone Saved',
    text: `Zone "${zoneMetadata.title}" saved successfully!`,
    links: [
      {
        label: 'View Saved Zone',
        href: `#zone_${zoneMetadata.id}`
      }
    ]
  });
}

function shareRemix() {
  if (!builder.zoneId) {
    UI.showLore({
      title: '⚠️ Save Required',
      text: 'Please save your zone before sharing.'
    });
    return;
  }
  
  const zoneData = JSON.parse(localStorage.getItem(`miff_zone_${builder.zoneId}`));
  const shareUrl = `${window.location.origin}${window.location.pathname}?remix=${builder.zoneId}`;
  
  UI.showLore({
    title: '🔗 Share Remix',
    text: `Share this zone with other contributors!`,
    links: [
      {
        label: 'Copy Remix Link',
        href: shareUrl
      },
      {
        label: 'Download Zone JSON',
        href: 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(zoneData, null, 2))
      },
      {
        label: 'Remix Starter Pack',
        href: '../contrib/remix-packs/README.md'
      }
    ]
  });
  
  console.log('[MapBuilder] Sharing remix:', shareUrl);
}

function submitToGallery() {
  if (!builder.zoneId) {
    UI.showLore({
      title: '⚠️ Save Required',
      text: 'Please save your zone before submitting to gallery.'
    });
    return;
  }
  
  const zoneData = JSON.parse(localStorage.getItem(`miff_zone_${builder.zoneId}`));
  
  UI.showLore({
    title: '📤 Submit to Gallery',
    text: `Submit "${zoneData.title}" to the MIFF Gallery?`,
    links: [
      {
        label: 'Submit to Gallery',
        href: '../gallery/index.html'
      },
      {
        label: 'View Gallery',
        href: '../gallery/index.html'
      },
      {
        label: 'Gallery Guidelines',
        href: '../docs/GALLERY_GUIDELINES.md'
      }
    ]
  });
  
  console.log('[MapBuilder] Submitting to gallery:', zoneData);
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
  const contributorCount = builder.contributors.size;
  
  let progress = `${tileCount} tiles placed`;
  let inventory = `${builder.gameType} | ${builder.biome}`;
  
  if (builder.playtestMode) {
    progress = `Playtest Mode | Player: ${builder.player.x},${builder.player.y}`;
    inventory = `Inventory: ${builder.player.inventory.length} items`;
  } else if (triggerCount > 0) {
    progress = `${tileCount} tiles, ${triggerCount} triggers`;
  }
  
  if (builder.liveMode) {
    inventory += ` | ${contributorCount} contributors`;
  }
  
  if (builder.zoneId) {
    inventory += ` | Saved: ${builder.zoneId.substr(-8)}`;
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
  try { if (scene && scene.entities){ scene.entities.forEach(e=>{ if (typeof e.draw==='function'){ e.draw(ctx); const name=(e && e.constructor && e.constructor.name)||e.id||'Entity'; console.log(`[Trace] ${name} drawn at (${e.x||0}, ${e.y||0})`); } }); } } catch{}
  render();
  console.log('[Renderer] requestAnimationFrame active for:', 'map_builder');
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
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  resizeCanvas();
  console.log('[Canvas] Resized on window change');
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    resizeCanvas();
    console.log('[Viewport] Orientation changed');
  }, 100);
});

document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    resizeCanvas();
  }, 100);
});

// Initialization
async function init() {
  console.log('[Zone] Booting:', 'map_builder');
  console.log('[Canvas] Injection starting...');
  // DOM zone marker
  try { document.body.setAttribute('data-zone', 'map_builder'); console.log('[Zone] DOM marked as:', document.body.dataset.zone); } catch {}
  // Visual zone marker
  try { const marker=document.createElement('div'); marker.innerText='ZONE: MAP BUILDER'; marker.style.position='absolute'; marker.style.top='10px'; marker.style.left='10px'; marker.style.color='cyan'; marker.style.zIndex='9999'; document.body.appendChild(marker); } catch {}
  // Unified Zone Boot Summary
  console.log('[ZoneBoot] Zone loaded:', 'map_builder');
  console.log('[ZoneBoot] DOM marker: data-zone="map_builder"');
  console.log('[ZoneBoot] Visual marker injected');
  cvs = $('gameCanvas');
  console.log('[Canvas] Element found:', cvs);
  ctx = cvs.getContext('2d');
  debugger;
  if (!cvs || !ctx){ console.warn('[Renderer] Canvas or renderer missing — fallback triggered'); try { cvs = document.querySelector('canvas'); ctx = cvs && cvs.getContext('2d'); } catch {} }
  // Canvas context validation
  const gl = cvs.getContext('webgl') || ctx;
  if (!gl){ console.error('[Canvas] Context failed — rendering aborted'); } else { console.log('[Canvas] Context acquired:', gl); }
  
  // Initial canvas sizing
  // Validate canvas sizing
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  resizeCanvas();
  
  // Initialize UI
  UI = createOverlayDispatcher($('gameContainer'));
  console.log('[UI] HUDBar rendered');
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
  
  // Initialize collaboration
  initializeCollaboration();
  
  // Load assets
  window.MapBuilderAssets.preloadAll();
  window.MapBuilderAssets.onAssetsReady(() => {
    console.log('[Assets] Loaded:', 'map_builder assets');
    UI.showHUD({ loadingText: 'Ready to build!' });
    
    // Start game loop
    // Scene graph population (diagnostic)
    const cursorEntity = { id: 'cursor', x: 0, y: 0 };
    scene.addEntity(cursorEntity);
    // Gameplay entity injection: tile grid
    const grid = { id: 'tile_grid', type: 'TileGrid', biome: 'forest', tile: 'grass_01',
      tiles: (function generate(){ const out=[]; for (let i=0;i<8;i++){ out.push({ x:i*64, y: 200, sprite:'grass_01' }); } return out; })(),
      draw(c){ if (!this.tiles) return; this.tiles.forEach(t=>{ const tile=window.MapBuilderAssets.getTile(t.sprite); if (tile && tile.img){ c.drawImage(tile.img, t.x, t.y-16, tile.meta?.w||64, tile.meta?.h||32); } else { console.warn('[Draw] Tile sprite missing:', t.sprite); } }); console.log('[Draw] TileGrid rendered'); }
    };
    scene.addEntity(grid);
    console.log('[Map Builder] Tile grid added:', grid);
    // Trigger toolbar overlay (use existing UI)
    try { UI.showLore && UI.showLore({ title: 'Map Toolbar', text: 'Use the toolbar at the bottom to build.' }); console.log('[Map Builder] MapToolbar triggered'); console.log('[Dispatcher] Overlay shown:', 'MapToolbar'); } catch {}
    console.log('[Renderer] Draw loop started');
    console.log('[Renderer] requestAnimationFrame active');
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
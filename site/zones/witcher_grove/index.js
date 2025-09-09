import { createOverlayDispatcher } from '../../overlays/dispatcher.js';
import { HUDBar, MainMenu } from '../../ui_modules/index.js';
import { addAttributionFooter } from '../../overlays/footer.js';
import { preloadAll, onAssetsReady, getSprite, getTile, getUIComponent, getProgress } from './assets.js';

function $(id){ return document.getElementById(id); }

// Core game state
let ctx = null, cvs = null, UI = null;
let camera = { x: 0, y: 0 };
let keys = {};
let inputMode = 'Keyboard';
let tick = 0;

// Character with clean animation system
let character = { 
  x: 0.5, y: 0.5, 
  sprite: null, 
  speed: 0.06, 
  bobT: 0, 
  anim: { 
    seq: 'idle', 
    frame: 0, 
    timer: 0, 
    frameMs: 120 
  } 
};

// Tile system
const tileW = 64, tileH = 32;
let tiles2x2 = [['grass_01','path_stone'],['grass_02','path_stone']];

// Interactables
let chest = { x: 1.4, y: 0.6, id: 'chest_red', taken: false };
let campfire = { x: 0.4, y: 1.4, id: 'mystic_stone' };
let npc = { x: 1.6, y: 1.6, speaking: false, sprite: null };

// Joystick system - completely rebuilt
let joystick = { 
  base: null, 
  knob: null, 
  active: false, 
  centerX: 0, 
  centerY: 0, 
  deltaX: 0, 
  deltaY: 0 
};

// World to screen coordinate conversion
function worldToScreen(ix, iy){
  const cx = cvs ? cvs.width/2 : 320;
  const cy = cvs ? cvs.height/2.8 : 80;
  const sx = (ix - iy) * (tileW/2) - camera.x + cx;
  const sy = (ix + iy) * (tileH/2) - camera.y + cy;
  return { x: sx, y: sy };
}

// Load map data
async function loadGroveMap(){
  try { 
    const groveMap = await fetch('../../maps/grove3d.json').then(r=>r.json()); 
  } catch { 
    // Use fallback tiles
  }
  const preferred = ['grass_01','path_stone','mystic_stone','chest_red','grass_02'];
  const chosen = preferred.slice(0,4);
  tiles2x2 = [[chosen[0],chosen[1]],[chosen[2],chosen[3]]];
}

// Load character sprites
async function loadCharacter(){
  character.sprite = getSprite('mainCharacter');
  npc.sprite = getSprite('npcElder');
}

// Input binding
function bindInput(){
  window.addEventListener('keydown', e => { 
    const k = e.key.toLowerCase(); 
    keys[k] = true; 
    inputMode = 'Keyboard'; 
    if (k === 'c'){ 
      UI && UI.showLore({ 
        title: 'Credits', 
        text: 'MIFF • KayKit/CC0 • README/CONTRIBUTING' 
      }); 
    } 
  });
  
  window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
  });
  
  window.addEventListener('pointerdown', () => { 
    inputMode = 'Touch'; 
  });
  
  // Gamepad detection
  setInterval(() => { 
    const pads = navigator.getGamepads ? 
      Array.from(navigator.getGamepads()).filter(Boolean) : []; 
    if (pads.length) inputMode = 'Gamepad'; 
  }, 1000);
}

// Joystick system - completely rebuilt
function createJoystick(){
  if (joystick.base) return;
  
  const ui = getUIComponent('joystick'); 
  if (!ui) {
    console.log('[GroveJoystick] Failed to get UI component');
    return;
  }
  
  const { base, knob, spec } = ui;
  
  // Apply clean CSS positioning
  base.style.position = 'absolute';
  base.style.left = spec.left + 'px';
  base.style.bottom = spec.bottom + 'px';
  base.style.width = spec.base + 'px';
  base.style.height = spec.base + 'px';
  base.style.zIndex = '20';
  
  knob.style.width = spec.knob + 'px';
  knob.style.height = spec.knob + 'px';
  
  $('gameContainer').appendChild(base);
  
  console.log('[GroveJoystick] Created at', spec.left, 'px left,', spec.bottom, 'px bottom, size:', spec.base, 'px');
  
  // Joystick interaction handlers
  function setKnobPosition(dx, dy){
    const radius = (spec.base - spec.knob) / 2;
    const clampedX = Math.max(-radius, Math.min(radius, dx));
    const clampedY = Math.max(-radius, Math.min(radius, dy));
    
    knob.style.left = (radius + clampedX) + 'px';
    knob.style.top = (radius + clampedY) + 'px';
    
    joystick.deltaX = clampedX / radius;
    joystick.deltaY = clampedY / radius;
  }
  
  function startInteraction(e){
    joystick.active = true;
    const rect = base.getBoundingClientRect();
    joystick.centerX = rect.left + rect.width / 2;
    joystick.centerY = rect.top + rect.height / 2;
    moveInteraction(e);
  }
  
  function moveInteraction(e){
    if (!joystick.active) return;
    
    const pointer = e.touches ? e.touches[0] : e;
    const dx = pointer.clientX - joystick.centerX;
    const dy = pointer.clientY - joystick.centerY;
    
    setKnobPosition(dx, dy);
    inputMode = 'Touch (Joystick)';
  }
  
  function endInteraction(){
    joystick.active = false;
    setKnobPosition(0, 0);
  }
  
  // Event listeners
  base.addEventListener('mousedown', startInteraction);
  window.addEventListener('mousemove', moveInteraction);
  window.addEventListener('mouseup', endInteraction);
  
  base.addEventListener('touchstart', startInteraction, { passive: false });
  base.addEventListener('touchmove', e => { 
    e.preventDefault(); 
    moveInteraction(e); 
  }, { passive: false });
  base.addEventListener('touchend', endInteraction);
  
  joystick.base = base;
  joystick.knob = knob;
  
  console.log('[GroveJoystick] Created at', spec.left, 'px left,', spec.bottom, 'px bottom');
}

// Camera system
function updateCamera(){
  const target = worldToScreen(character.x, character.y);
  const cx = cvs.width / 2;
  const cy = cvs.height / 2.8;
  camera.x += (target.x - cx) * 0.25;
  camera.y += (target.y - cy) * 0.25;
}

// Animation system - clean frame-based animation
function updateAnimation(dt){
  const sprite = character.sprite?.meta;
  if (!sprite) return;
  
  // Determine if character is moving
  const isMoving = Math.abs(joystick.deltaX) > 0.01 || 
                   Math.abs(joystick.deltaY) > 0.01 || 
                   keys['arrowup'] || keys['w'] || 
                   keys['arrowdown'] || keys['s'] || 
                   keys['arrowleft'] || keys['a'] || 
                   keys['arrowright'] || keys['d'];
  
  const sequence = isMoving ? 'walk' : 'idle';
  
  // Switch sequence if needed
  if (character.anim.seq !== sequence){
    character.anim.seq = sequence;
    character.anim.frame = 0;
    character.anim.timer = 0;
  }
  
  // Advance frame timer
  character.anim.timer += dt * 1000;
  const frameMs = isMoving ? 120 : 500; // 120ms walk, 500ms idle
  
  if (character.anim.timer >= frameMs){
    character.anim.timer = 0;
    const frames = sprite.sequences[sequence] || [0];
    character.anim.frame = (character.anim.frame + 1) % frames.length;
  }
}

// Game update loop
function update(dt){
  const before = { x: character.x, y: character.y };
  
  // Calculate movement vector
  let vx = 0, vy = 0;
  if (keys['arrowup'] || keys['w']) vy -= 1;
  if (keys['arrowdown'] || keys['s']) vy += 1;
  if (keys['arrowleft'] || keys['a']) vx -= 1;
  if (keys['arrowright'] || keys['d']) vx += 1;
  
  // Add joystick input
  if (joystick.active){
    vx += joystick.deltaX;
    vy += joystick.deltaY;
  }
  
  // Normalize movement
  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;
  
  // Apply movement
  character.y += vy * character.speed;
  character.x += vx * character.speed;
  
  // Update bobbing animation
  if (vx || vy) {
    character.bobT += 0.2;
  } else {
    character.bobT *= 0.9;
  }
  
  // Update animation
  updateAnimation(dt);
  
  // Log movement
  if (before.x !== character.x || before.y !== character.y){
    console.log('[GroveMove]', character.x.toFixed(2), character.y.toFixed(2));
  }
  
  // Update camera
  updateCamera();
  
  // Handle interactions
  const chestDist = Math.hypot(character.x - chest.x, character.y - chest.y);
  if (!chest.taken && chestDist < 0.2){
    chest.taken = true;
    console.log('[Pickup] Herb');
    UI.showLore({ 
      title: 'You found a herb!', 
      text: 'Added Herb to inventory.' 
    });
  }
  
  const npcDist = Math.hypot(character.x - npc.x, character.y - npc.y);
  if (!npc.speaking && npcDist < 0.25){
    npc.speaking = true;
    console.log('[Lore] Elder');
    UI.showLore({ 
      title: 'Elder', 
      text: 'Welcome to the Grove. The forest remembers.' 
    });
    setTimeout(() => { npc.speaking = false; }, 1200);
  }
}

// Background rendering
function renderBackground(){
  const gradient = ctx.createLinearGradient(0, 0, 0, cvs.height);
  gradient.addColorStop(0, '#0a1322');
  gradient.addColorStop(1, '#0b1020');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  
  // Parallax layers
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 8; i++){
    const y = 20 + i * 22 + (Math.sin((tick + i) * 0.03) * 2);
    ctx.fillStyle = '#0d1a2b';
    ctx.fillRect(0, y, cvs.width, 12);
  }
  ctx.globalAlpha = 1;
}

// Tile rendering
function renderTiles(){
  for (let iy = 0; iy < 2; iy++){
    for (let ix = 0; ix < 2; ix++){
      const tile = getTile(tiles2x2[iy][ix]);
      const pos = worldToScreen(ix, iy);
      
      // Shadow
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#000';
      ctx.fillRect(pos.x + 4, pos.y - (tileH/2) + 4, tileW - 8, 6);
      ctx.globalAlpha = 1;
      
      // Tile - properly scaled
      if (tile?.img && tile.img.complete){
        ctx.drawImage(tile.img, pos.x, pos.y - (tileH/2), tileW, tileH);
      }
    }
  }
}

// Sprite rendering - completely rebuilt with proper frame cropping
function renderCharacter(){
  const sprite = character.sprite?.meta;
  const img = character.sprite?.img;
  
  if (!sprite || !img || !img.complete) return;
  
  const pos = worldToScreen(character.x, character.y);
  
  // Enhanced bobbing animation based on movement
  const isMoving = Math.abs(joystick.deltaX) > 0.01 || Math.abs(joystick.deltaY) > 0.01 || 
                   keys['arrowup'] || keys['w'] || keys['arrowdown'] || keys['s'] || 
                   keys['arrowleft'] || keys['a'] || keys['arrowright'] || keys['d'];
  
  const bobIntensity = isMoving ? 4 : 1;
  const bob = Math.sin(character.bobT) * bobIntensity;
  
  // Get current frame
  const frames = sprite.sequences[character.anim.seq] || [0];
  const frameIndex = frames[character.anim.frame] || 0;
  
  // Calculate source coordinates
  const sx = frameIndex * sprite.frame.w;
  const sy = 0;
  const sw = sprite.frame.w;
  const sh = sprite.frame.h;
  
  // Calculate destination coordinates (centered)
  const dx = pos.x - sw / 2;
  const dy = pos.y - sh + bob;
  const dw = sw;
  const dh = sh;
  
  // Render with proper frame cropping
  if (img.naturalWidth >= sx + sw && img.naturalHeight >= sy + sh){
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    
    // Debug logging
    if (tick % 60 === 0){
      console.log('[GroveSprite] Frame:', frameIndex, 'seq:', character.anim.seq, 
                  'bob:', bob.toFixed(1), 'moving:', isMoving, 'img:', img.naturalWidth, 'x', img.naturalHeight);
    }
  } else {
    // Fallback: draw entire image
    ctx.drawImage(img, dx, dy, dw, dh);
    if (tick % 60 === 0){
      console.log('[GroveSprite] Fallback draw - img:', img.naturalWidth, 'x', img.naturalHeight);
    }
  }
}

// Effects rendering
function renderEffects(){
  // Campfire glow
  const campfirePos = worldToScreen(campfire.x, campfire.y);
  const pulse = 0.3 + 0.3 * Math.abs(Math.sin(tick * 0.12));
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ff9933';
  ctx.beginPath();
  ctx.arc(campfirePos.x, campfirePos.y - 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Chest
  if (!chest.taken){
    const chestPos = worldToScreen(chest.x, chest.y);
    const chestTile = getTile(chest.id);
    if (chestTile?.img && chestTile.img.complete){
      ctx.drawImage(chestTile.img, chestPos.x - 16, chestPos.y - 16, 32, 32);
    }
  }
  
  // NPC
  if (npc.sprite?.img && npc.sprite.img.complete){
    const npcPos = worldToScreen(npc.x, npc.y);
    ctx.drawImage(npc.sprite.img, 
                  npcPos.x - 20, npcPos.y - 36, 
                  npc.sprite.meta.frame.w, npc.sprite.meta.frame.h);
  }
}

// Main render function
function render(){
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  
  renderBackground();
  renderTiles();
  renderEffects();
  renderCharacter();
}

// Game loop
function gameLoop(ts){
  const dt = (gameLoop._last ? (ts - gameLoop._last) : 16) / 1000;
  gameLoop._last = ts;
  
  tick++;
  update(dt);
  render();
  
  UI && UI.showHUD({ inputMode, fullscreenToggle: true });
  requestAnimationFrame(gameLoop);
}

// Canvas resize system - completely rebuilt
function resizeCanvas(){
  if (!cvs) return;
  
  // Use full window dimensions for fullscreen, or container size for normal mode
  const isFullscreen = document.fullscreenElement !== null;
  if (isFullscreen) {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  } else {
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width;
    cvs.height = rect.height;
  }
  
  console.log('[GroveResize] Canvas:', cvs.width, 'x', cvs.height, 'fullscreen:', isFullscreen);
}

// Fullscreen system - completely rebuilt
window.__miffToggleFullscreen = () => {
  const el = document.documentElement;
  
  if (!document.fullscreenElement){
    el.requestFullscreen?.().then(() => {
      // Resize immediately after entering fullscreen
      setTimeout(() => {
        resizeCanvas();
      }, 100);
    });
  } else {
    document.exitFullscreen?.().then(() => {
      // Resize immediately after exiting fullscreen
      setTimeout(() => {
        resizeCanvas();
      }, 100);
    });
  }
};

// Window resize handler
window.addEventListener('resize', () => {
  resizeCanvas();
});

// Fullscreen change handler
document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    resizeCanvas();
  }, 100);
});

// Initialization
async function init(){
  // Inject or select mainCanvas
  let main = document.getElementById('mainCanvas');
  if (!main) {
    main = document.createElement('canvas');
    main.id = 'mainCanvas';
    main.style.position = 'absolute';
    main.style.top = '0';
    main.style.left = '0';
    main.style.zIndex = '0';
    main.style.display = 'block';
    main.width = window.innerWidth;
    main.height = window.innerHeight;
    const container = $('gameContainer') || document.body;
    container.insertBefore(main, container.firstChild || null);
    console.log('Canvas injected');
  }
  cvs = main;
  ctx = cvs.getContext('2d');
  console.log('Renderer initialized');
  
  // Initial canvas sizing
  resizeCanvas();
  
  // Initialize UI
  UI = createOverlayDispatcher($('gameContainer'));
  try { UI.useModule && UI.useModule('HUD', HUDBar, { inputMode }); } catch {}
  addAttributionFooter();
  UI.showHUD({ loadingText: 'Loading… 0%' });
  
  // Preload assets
  preloadAll();
  
  // Wait for assets to load
  onAssetsReady(async () => {
    console.log('Assets loaded');
    await loadGroveMap();
    await loadCharacter();
    bindInput();
    createJoystick();
    
    try {
      UI.showIntro && UI.showIntro({ title: 'Witcher Grove', message: 'Use joystick or Arrow/WASD. Press C for Credits.' });
      UI.useModule && UI.useModule('IntroModal', MainMenu, { title: 'Witcher Grove', onAction: (id)=>{ if (id==='start'){ UI.showHUD({ inputMode, fullscreenToggle: true }); UI.hide && UI.hide('intro'); } if (id==='credits'){ UI.showLore && UI.showLore({ title:'Credits', text:'MIFF • KayKit/CC0' }); } } });
    } catch {}
    
    console.log('Draw loop started');
    requestAnimationFrame(gameLoop);
  });
  
  // Progress tracking
  const preloadInterval = setInterval(() => {
    const pct = getProgress();
    UI.showHUD({ 
      loadingText: `Loading… ${pct}%`, 
      inputMode, 
      fullscreenToggle: true 
    });
    try { UI.updateModule && UI.updateModule('HUD', { inputMode, info: `Loading ${pct}%` }); } catch {}
    if (pct >= 100){
      clearInterval(preloadInterval);
    }
  }, 100);
}

window.addEventListener('DOMContentLoaded', init);
// Toppler – minimal interactive scaffold with physics, levels, and replay
import { createOverlayDispatcher } from '../../overlays/dispatcher.js';
import { HUDBar, MainMenu, StyleSelector } from '../../ui_modules/index.js';
import { UI_STYLES } from '../../ui_modules/style_presets.js';
import { updateState as updateGameState } from '../../state/game_state.js';
import { addAttributionFooter } from '../../overlays/footer.js';

function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Completed: 'completed', Paused: 'paused' };
let game = {
	state: State.Idle,
	levelIndex: 0,
	player: { x: 20, y: 420, w: 40, h: 40, vx: 0, vy: 0 },
	goalX: 560,
	time: 0,
	ctx: null,
	cvs: null,
	trail: [],
	audio: { music:null, ui:null, muted:false, sfx:{ jump:null, collect:null, curse:null } },
	score: 0,
	enemies: [],
	chests: [],
	platforms: [],
	inputMode: 'Keyboard'
};
let UI = null;
// Minimal scene graph for diagnostics
const scene = { entities: [], addEntity(e){ this.entities.push(e); console.log('[Scene] Entity added:', e); console.log('[Scene] Entities count:', this.entities.length); } };

// Medieval sprite/tiles
let SPRITES = { player:null, enemy:null, cliff:null, bridge:null, chest:null };
let FX = [];
let lastSfx = { jump:0, collect:0, curse:0 };
let gamepadEnabled = true;

function persist(){ try { localStorage.setItem('toppler_state', JSON.stringify({ levelIndex: game.levelIndex, muted: game.audio.muted })); } catch {} }
function restore(){ try { const s=localStorage.getItem('toppler_state'); if (s){ const d=JSON.parse(s); if (typeof d.levelIndex==='number') game.levelIndex=d.levelIndex; if (typeof d.muted==='boolean') game.audio.muted=d.muted; } } catch {} }

async function loadOrchestration(){
    // Choose medieval theme if present via query ?theme=medieval
    const params = new URLSearchParams(location.search);
    const medieval = params.get('theme') === 'medieval';
    const path = medieval ? './orchestration.medieval.json' : './orchestration.json';
    try { ORCH = await fetch(path).then(r=>r.json()); } catch { ORCH = null; }
    if (ORCH?.levels?.length){ applyLevel(game.levelIndex||0); ensureLevelSelector(); }
}
function applyLevel(idx){ game.levelIndex = idx; const L = ORCH.levels[idx]; game.goalX = L.goalX; game.player.x = 20; game.player.y = L.height - 60; game.player.vx = 0; game.player.vy = 0; game.trail = []; hideOverlay('winOverlay'); hideOverlay('pauseOverlay'); persist(); }

function fitCanvas(cvs) { 
  if (!cvs) return; 
  // Always use full window dimensions for consistent rendering
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  console.log('[TopplerResize] Canvas:', cvs.width, 'x', cvs.height, 'viewport:', window.innerWidth, 'x', window.innerHeight);
}

function setState(next){ game.state = next; }
function startReplay(){ /* reserved for timed triggers in future */ }

// Input mode detection
function detectInputMode() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean).length > 0 : false;
  
  if (hasGamepad) {
    game.inputMode = 'Gamepad';
  } else if (isTouch) {
    game.inputMode = 'Touch';
  } else {
    game.inputMode = 'Mouse';
  }
  
  console.log('[Toppler] Input mode detected:', game.inputMode, 'touch:', isTouch, 'gamepad:', hasGamepad);
  return game.inputMode;
}

// Legacy overlay functions removed - using dispatcher instead

function ensureLevelSelector(){ /* removed legacy level selector in favor of orchestration-driven overlays */ }

// Draggable joystick (touch/mouse)
let joy={ base:null, knob:null, active:false, cx:0, cy:0, dx:0 };
function ensureJoystick(){
	if (joy.base) return;
	const base=document.createElement('div'); base.style.position='absolute'; base.style.left='80px'; base.style.bottom='80px'; base.style.width='96px'; base.style.height='96px'; base.style.border='2px solid rgba(255,255,255,0.2)'; base.style.borderRadius='50%'; base.style.background='rgba(0,0,0,0.2)'; base.style.touchAction='none';
	const knob=document.createElement('div'); knob.style.position='absolute'; knob.style.left='38px'; knob.style.top='38px'; knob.style.width='20px'; knob.style.height='20px'; knob.style.borderRadius='50%'; knob.style.background='rgba(88,166,255,0.9)';
	base.appendChild(knob); $('gameContainer').appendChild(base);
	function setKnob(dx){ const r=36; const nx=Math.max(-r,Math.min(r,dx)); knob.style.left=(38+nx)+'px'; joy.dx=nx/r; }
	function start(e){ joy.active=true; const b=base.getBoundingClientRect(); joy.cx=b.left+b.width/2; joy.cy=b.top+b.height/2; move(e); }
	function move(e){ if(!joy.active) return; const p=e.touches? e.touches[0]: e; const dx=p.clientX-joy.cx; setKnob(dx); game.inputMode='Touch (Joystick)'; }
	function end(){ joy.active=false; setKnob(0); }
	base.addEventListener('mousedown',start); window.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
	base.addEventListener('touchstart',start,{passive:false}); base.addEventListener('touchmove',e=>{ e.preventDefault(); move(e); },{passive:false}); base.addEventListener('touchend',end);
	joy.base=base; joy.knob=knob;
}

function bindInputs(){
	window.addEventListener('keydown', (e)=>{ 
		if (e.key === 'ArrowRight') { game.player.vx = 140; game.inputMode='Keyboard'; }
		if (e.key === 'ArrowLeft') { game.player.vx = -140; game.inputMode='Keyboard'; }
		if (e.key === 'ArrowUp' && onGround() && game.state!==State.Paused){ game.player.vy = -360; const now=performance.now(); if (now-lastSfx.jump>150){ try{ game.audio.sfx.jump && game.audio.sfx.jump.play(); }catch{} lastSfx.jump=now; } }
		if (e.key === 'Enter' && game.state === State.Idle){ setState(State.Playing); try{ game.audio.music?.play(); }catch{} }
		if (e.key.toLowerCase() === 'm'){ game.audio.muted = !game.audio.muted; try{ game.audio.music && (game.audio.music.muted = game.audio.muted); }catch{} persist(); }
		if (e.key.toLowerCase() === 'p'){ togglePause(); }
	});
	window.addEventListener('keyup', (e)=>{ if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') game.player.vx = 0; });
	game.cvs.addEventListener('click', ()=>{ if (game.state === State.Idle){ setState(State.Playing); try{ game.audio.music?.play(); }catch{} } });
	// removed legacy back/next/mobile controls; use joystick instead
	setInterval(()=>{ const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; if (pads.length) game.inputMode='Gamepad'; }, 1000);
}

// Start menu overlay for medieval theme
function ensureStartMenu(){
    const params = new URLSearchParams(location.search);
    if (params.get('theme') !== 'medieval') return;
    if (!ORCH?.ui?.startMenu?.enabled) return;
    if (!UI) UI = createOverlayDispatcher($('gameContainer'));
    UI.showIntro({ title: ORCH.title || 'Toppler Medieval', message:'Use joystick or arrows to move & jump.', onStart: ()=>{ game.state=State.Playing; try{ game.audio.music?.play(); }catch{} } , lore: { title:'Credits', text:'Assets: KayKit (CC0). Framework: MIFF.' } });
}

function showLoreModal(){
    if (!UI) UI = createOverlayDispatcher($('gameContainer'));
    UI.showLore({
        title: 'The Hollow Isles',
        text: 'Long ago, the Bone King cursed these lands. Only the brave may cross the crumbling paths and reclaim the lost relics.\n\nTip: Chests hold secrets. Skeletons guard them fiercely.\n\nAssets: KayKit, CC0. Framework: MIFF.'
    });
}

function togglePause(){ 
    if (game.state === State.Paused){
        setState(State.Playing);
        if (UI) UI.hide('pause');
    } else if (game.state === State.Playing){
        setState(State.Paused);
        if (!UI) UI = createOverlayDispatcher($('gameContainer'));
        // Create a simple pause overlay using dispatcher
        const pauseDiv = document.createElement('div');
        pauseDiv.id = 'miffPause';
        pauseDiv.className = 'miff-overlay miff-tile-bg miff-fade-in';
        pauseDiv.innerHTML = `
            <h3>Paused</h3>
            <div>
                <button class="miff-btn" onclick="window.togglePause()">Resume</button>
                <button class="miff-btn secondary" onclick="window.restartLevel()">Restart</button>
            </div>
        `;
        $('gameContainer').appendChild(pauseDiv);
    } 
}

function onGround(){ return game.player.y + game.player.h >= 480 - 20; }

function getDifficulty(){
    try { const st=JSON.parse(localStorage.getItem('toppler_state')||'{}'); const d=st.difficultyLevel||'Squire'; if (d==='Knight') return { g: 980, enemy: 60 }; if (d==='Warlord') return { g: 1100, enemy: 90 }; return { g: 900, enemy: 40 }; } catch { return { g: 900, enemy: 40 }; }
}

function ensureSpawns(){
    if (!game.enemies.length){ game.enemies = [ { x: 200, y: 460, w: 28, h: 28, dir: 1 }, { x: 360, y: 460, w: 28, h: 28, dir: -1 } ]; }
    if (!game.chests.length){ game.chests = [ { x: 120, y: 460, w: 22, h: 22 }, { x: 480, y: 460, w: 22, h: 22 } ]; }
    if (!game.platforms.length){
        const diff = getDifficulty(); const life = (diff.g>1000)? 4.0 : (diff.g>900? 6.0 : 8.0);
        game.platforms = [
            { x: 80, y: 420, w: 60, h: 10, t: life },
            { x: 200, y: 380, w: 60, h: 10, t: life },
            { x: 320, y: 400, w: 60, h: 10, t: life },
            { x: 440, y: 360, w: 60, h: 10, t: life }
        ];
    }
}

function rectsOverlap(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function gameOver(){ 
    try{ game.audio.sfx.curse && game.audio.sfx.curse.play(); }catch{} 
    setState(State.Paused); 
    if (!UI) UI = createOverlayDispatcher($('gameContainer')); 
    UI.showGameOver({ 
        title: 'Game Over',
        message: 'The Hollow Isles have claimed another soul. Ready to remix the challenge?',
        onRestart: ()=>{ 
            applyLevel(game.levelIndex); 
            setState(State.Idle); 
            ensureStartMenu(); 
        },
        links: [
            { label: 'Map Builder', href: '../../map-builder.html' },
            { label: 'Remix Packs', href: '../../contrib/remix-packs/README.md' },
            { label: 'Contributor Guide', href: '../../docs/TOPPLER_CONTRIBUTING.md' }
        ]
    }); 
}

function update(dt){ if (game.state === State.Playing){ const L = ORCH?.levels?.[game.levelIndex] || { gravity: 900, width: 640, height: 480 }; const diff = getDifficulty(); const grav = diff.g || L.gravity; game.player.vy += grav * dt; game.player.x += (game.player.vx + (joy.active? joy.dx*180:0)) * dt; game.player.y += game.player.vy * dt; const floorY = L.height - 20 - game.player.h; if (game.player.y > floorY){ game.player.y = floorY; game.player.vy = 0; } if (game.player.x < 0) game.player.x = 0; if (game.player.x + game.player.w > L.width) game.player.x = L.width - game.player.w; game.trail.push({ x: game.player.x + game.player.w/2, y: game.player.y + game.player.h/2, t: performance.now() }); if (game.trail.length > 30) game.trail.shift(); ensureSpawns(); // Enemies move
    const es = diff.enemy; for (const e of game.enemies){ e.x += e.dir * es * dt; if (e.x < 40){ e.x=40; e.dir=1; } if (e.x + e.w > L.width-40){ e.x = L.width-40 - e.w; e.dir=-1; } if (rectsOverlap({x:game.player.x,y:game.player.y,w:game.player.w,h:game.player.h}, e)){ gameOver(); } }
    // Chests collect
    for (let i=game.chests.length-1;i>=0;i--){ const c=game.chests[i]; if (rectsOverlap({x:game.player.x,y:game.player.y,w:game.player.w,h:game.player.h}, c)){ game.score += 10; game.chests.splice(i,1); FX.push({ t:0, x:c.x+c.w/2, y:c.y+c.h/2 }); const now=performance.now(); if (now-lastSfx.collect>150){ try{ game.audio.sfx.collect && game.audio.sfx.collect.play(); }catch{} lastSfx.collect=now; } } }
    if (game.player.x + game.player.w >= game.goalX){ 
        setState(State.Completed); 
        const s=$('status'); 
        if(s) s.textContent='Completed! 🎉'; 
        if (!UI) UI = createOverlayDispatcher($('gameContainer'));
        UI.showGameOver({
            title: 'Level Complete!',
            message: 'Well done! Ready for the next challenge?',
            onRestart: () => {
                const next = (game.levelIndex + 1) % (ORCH?.levels?.length || 1);
                applyLevel(next);
                setState(State.Idle);
                ensureStartMenu();
            }
        });
        persist(); 
    } } }

function render(){ const { ctx, cvs } = game; ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height); // Tiles
    if (SPRITES.cliff){ for (let x=0; x<cvs.width; x+=32){ ctx.drawImage(SPRITES.cliff, x, cvs.height-32, 32, 32); } }
    // Platforms
    for (const p of game.platforms){ if (p.t>0){ const alpha=Math.max(0.2, p.t/8); ctx.save(); ctx.globalAlpha=alpha; const tile=SPRITES.bridge||SPRITES.cliff; if (tile) ctx.drawImage(tile, p.x, p.y, p.w, p.h); else { ctx.fillStyle='rgba(120,120,180,'+alpha+')'; ctx.fillRect(p.x,p.y,p.w,p.h); } ctx.restore(); } }
    const pulse = 8 + Math.abs(Math.sin(performance.now()/200))*10; ctx.fillStyle = '#0f2a3f'; ctx.fillRect(game.goalX, 0, cvs.width - game.goalX, cvs.height); ctx.fillStyle = '#13466e'; ctx.fillRect(game.goalX - pulse, 0, 3, cvs.height); for (let i=0;i<game.trail.length;i++){ const a = i/game.trail.length; ctx.fillStyle = `rgba(88,166,255,${a*0.6})`; const p = game.trail[i]; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill(); } // Enemies
    for (const e of game.enemies){ if (SPRITES.enemy) ctx.drawImage(SPRITES.enemy, e.x, e.y, e.w, e.h); else { ctx.fillStyle = '#bd4b4b'; ctx.fillRect(e.x, e.y, e.w, e.h); } }
    // Chests (tinted)
    for (let i=0;i<game.chests.length;i++){ const c=game.chests[i]; if (SPRITES.chest){ ctx.save(); ctx.globalAlpha=1; ctx.filter = `hue-rotate(${(i%2)*180}deg)`; ctx.drawImage(SPRITES.chest, c.x, c.y, c.w, c.h); ctx.filter='none'; ctx.restore(); } else { ctx.fillStyle = i%2? '#d46f6f':'#6fb7d4'; ctx.fillRect(c.x, c.y, c.w, c.h); }
    }
    // Player
    if (SPRITES.player) ctx.drawImage(SPRITES.player, game.player.x, game.player.y, game.player.w, game.player.h); else { ctx.fillStyle = game.state === State.Completed ? '#2ecc71' : '#58a6ff'; ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h); }
    // FX
    for (let i=FX.length-1;i>=0;i--){ const f=FX[i]; f.t += 0.016; const r = 3 + f.t*60; ctx.strokeStyle='rgba(255,255,255,'+(1-f.t)+')'; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2); ctx.stroke(); if (f.t>1) FX.splice(i,1); }
}

function loop(ts){ if (!game._last) game._last = ts; const dt = Math.min(0.033, (ts - game._last) / 1000); game._last = ts; console.log('[Draw] Frame rendering...'); if (!scene || scene.entities.length === 0) { console.warn('[Draw] Scene empty — nothing to render'); } if (game.state!==State.Paused) update(dt); render(); console.log('[Renderer] requestAnimationFrame active for:', 'toppler'); UI && UI.showHUD({ inputMode: game.inputMode, fullscreenToggle: true }); requestAnimationFrame(loop); }

async function init(){ 
  console.log('[Toppler] Canvas injection starting...');
  console.log('[Zone] Booting:', 'toppler');
  // DOM zone marker
  try { document.body.setAttribute('data-zone', 'toppler'); console.log('[Zone] DOM marked as:', document.body.dataset.zone); } catch {}
  // Visual zone marker
  try { const marker=document.createElement('div'); marker.innerText='ZONE: TOPPLER'; marker.style.position='absolute'; marker.style.top='10px'; marker.style.left='10px'; marker.style.color='orange'; marker.style.zIndex='9999'; document.body.appendChild(marker); } catch {}
  
  const statusEl = $('status'); 
  if(statusEl) statusEl.textContent = 'Loading…'; 
  restore(); 
  await loadOrchestration(); 
  if(statusEl) statusEl.textContent = 'Ready. Press Enter to start.'; 
  
  // Use existing gameCanvas or create mainCanvas
  let cvs = $('gameCanvas') || $('mainCanvas');
  if (!cvs) {
    console.log('[Toppler] Creating new canvas element...');
    cvs = document.createElement('canvas');
    cvs.id = 'mainCanvas';
    cvs.style.position='absolute';
    cvs.style.top='0';
    cvs.style.left='0';
    cvs.style.zIndex='0';
    cvs.style.display='block';
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    const container=$('gameContainer')||document.body;
    container.insertBefore(cvs, container.firstChild||null);
    console.log('[Toppler] Canvas injected');
  } else {
    console.log('[Toppler] Canvas found:', cvs.id);
  } fitCanvas(cvs); 
  window.addEventListener('resize', ()=>fitCanvas(cvs)); 
  console.log('[Canvas] Resized on window change');
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      fitCanvas(cvs);
      detectInputMode();
    }, 100);
  });
  game.ctx = cvs.getContext('2d'); 
  // Canvas context validation
  const gl = cvs.getContext('webgl') || game.ctx;
  if (!gl){ console.error('[Canvas] Context failed — rendering aborted'); } else { console.log('[Canvas] Context acquired:', gl); }
  game.cvs = cvs; 
  console.log('[Renderer] init() called for zone:', 'toppler');
  console.log('[Zone] Renderer initialized'); try { game.audio.music = new Audio('../../../assets/audio/music/Loops/1. Dawn of Blades.ogg'); game.audio.music.loop=true; game.audio.music.volume=0.2; game.audio.music.muted = game.audio.muted; } catch {} try { game.audio.ui = new Audio('../../../assets/audio/sfx/ui_click.txt'); } catch {} try { game.audio.sfx.jump = new Audio('../../../assets/audio/sfx/confirmation_3_sean.wav'); game.audio.sfx.collect = new Audio('../../../assets/audio/sfx/completion_4_sean.wav'); game.audio.sfx.curse = new Audio('../../../assets/audio/sfx/damage_5_sean.wav'); } catch {} // Load sprites
  debugger;
  if (!game.cvs || !game.ctx){ console.warn('[Renderer] Canvas or renderer missing — fallback triggered'); try { game.cvs = document.querySelector('canvas'); game.ctx = game.cvs && game.cvs.getContext('2d'); } catch {} }
    function loadImg(p){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(); i.src=p; }); }
    try { SPRITES.player = await loadImg('../../../assets/Player.png'); } catch {}
    try { SPRITES.enemy = await loadImg('../../../assets/Skeleton.png'); } catch {}
    try { SPRITES.cliff = await loadImg('../../../assets/Cliff_Tile.png'); } catch {}
    try { SPRITES.bridge = await loadImg('../../../assets/Bridge_Wood.png'); } catch {}
    try { SPRITES.chest = await loadImg('../../../assets/Chest.png'); } catch {}
    console.log('[Assets] Loaded:', Object.keys(SPRITES).filter(k=>SPRITES[k]).join(','));
    const missing = Object.keys(SPRITES).filter(k=>!SPRITES[k]);
    if (missing.length) console.warn('[Assets] Missing:', missing);
    detectInputMode();
    // Scene graph population (diagnostic)
    const player = { id: 'player', x: game.player.x, y: game.player.y };
    scene.addEntity(player);
    bindInputs(); 
    if (!UI) UI = createOverlayDispatcher($('gameContainer'));
    console.log('[Toppler] UI modules attached'); 
    console.log('[Dispatcher] Overlays registered:', ['IntroModal','GameOver','LoreModal','HUD']);
    const savedStyle = localStorage.getItem('miff_ui_style') || 'sciFi';
    UI.setDefaultStyle && UI.setDefaultStyle(UI_STYLES[savedStyle] || UI_STYLES.sciFi);
    // Zone-specific UI modules
    try {
      UI.useModule && UI.useModule('HUD', HUDBar, { inputMode: game.inputMode, info: 'Toppler', style: UI_STYLES.sciFi });
      console.log('[UI] Injected modules for zone:', 'toppler');
    } catch {}
    updateGameState && updateGameState({ currentZone: 'toppler', progress: { value: 0, total: (ORCH?.levels?.length)||6, label: '' }, activeQuest: { title:'Reach the Goal', description: 'Cross the platforms to the glowing gate', status:'In progress' }, inputMode: game.inputMode });
    addAttributionFooter();
    ensureStartMenu();
    // Replace legacy intro with MainMenu via dispatcher IntroModal when idle
    try { if (UI.useModule) { UI.showIntro && UI.showIntro({ title: 'Toppler Medieval' }); UI.useModule('IntroModal', MainMenu, { title: 'Toppler Medieval', style: UI_STYLES[savedStyle] || UI_STYLES.sciFi, onAction: (id)=>{ if (id==='start'){ setState(State.Playing); try{ game.audio.music?.play(); }catch{} UI.hide && UI.hide('intro'); } if (id==='credits'){ showLoreModal(); } } }); } } catch {}
    window.addEventListener('keydown', (e)=>{ if (e.key.toLowerCase()==='s'){ UI.showLore({ title:'Style Selector' }); UI.useModule && UI.useModule('LoreModal', StyleSelector, { initial: savedStyle }); } });
    ensureJoystick(); startReplay(); setState(State.Idle); console.log('[Renderer] Draw loop started'); console.log('[Renderer] requestAnimationFrame active'); requestAnimationFrame(loop); }

// Global functions for pause overlay
window.togglePause = togglePause;
window.restartLevel = () => {
    applyLevel(game.levelIndex);
    setState(State.Idle);
    const pauseEl = $('miffPause');
    if (pauseEl) pauseEl.remove();
    ensureStartMenu();
};

// Fullscreen support
window.__miffToggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement){
        el.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
};

window.addEventListener('DOMContentLoaded', init);

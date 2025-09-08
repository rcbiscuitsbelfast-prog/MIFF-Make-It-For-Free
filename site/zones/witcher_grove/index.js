import { createOverlayDispatcher } from '../../overlays/dispatcher.js';
import { preloadAll, onAssetsReady, getSprite, getTile, getUIComponent, getProgress } from './assets.js';

function $(id){ return document.getElementById(id); }

let manifest=null;
let groveMap=null;
let ctx=null, cvs=null, UI=null;

// Tile and camera
const tileW=64, tileH=32;
let camera={ x:0, y:0 };

// Character with animation timers (100–150ms)
let character={ x:0.5, y:0.5, sprite:null, variant:'mainCharacter', speed:0.06, bobT:0, anim:{ seq:'idle', frame:0, timer:0, frameMs:120 } };
let keys={};
let tiles2x2=[['grass_01','path_stone'],['grass_02','path_stone']];
let inputMode='Keyboard';
let tick=0;
// Interactables
let chest={ x:1.4, y:0.6, id:'chest_red', taken:false };
let campfire={ x:0.4, y:1.4, id:'mystic_stone' };
let npc={ x:1.6, y:1.6, speaking:false, sprite:null };
// Joystick
let joy={ base:null, knob:null, active:false, cx:0, cy:0, dx:0, dy:0 };

function worldToScreen(ix, iy){
  const cx = cvs ? cvs.width/2 : 320;
  const cy = cvs ? cvs.height/2.8 : 80;
  const sx = (ix - iy) * (tileW/2) - camera.x + cx;
  const sy = (ix + iy) * (tileH/2) - camera.y + cy;
  return { x: sx, y: sy };
}

async function loadManifest(){
  // No-op; using module registry tiles via getTile
}

async function loadGroveMap(){
  try { groveMap = await fetch('../../maps/grove3d.json').then(r=>r.json()); } catch { groveMap = null; }
  const preferred=['grass_01','path_stone','mystic_stone','chest_red','grass_02'];
  const chosen=preferred.slice(0,4);
  tiles2x2=[[chosen[0],chosen[1]],[chosen[2],chosen[3]]];
}

async function loadCharacter(){
  character.sprite = getSprite('mainCharacter');
  npc.sprite = getSprite('npcElder');
}

function bindInput(){
  window.addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); keys[k]=true; inputMode='Keyboard'; if (k==='c'){ UI && UI.showLore({ title:'Credits', text:'MIFF • KayKit/CC0 • README/CONTRIBUTING' }); } });
  window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
  window.addEventListener('pointerdown',()=>{ inputMode='Touch'; });
  setInterval(()=>{ const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; if (pads.length) inputMode='Gamepad'; }, 1000);
}

function ensureJoystick(){
  if (joy.base) return;
  const ui = getUIComponent('joystick'); if (!ui) return;
  const { base, knob, spec } = ui; 
  // Apply positioning and sizing from spec
  base.style.position = 'absolute';
  base.style.left = spec.left + 'px';
  base.style.bottom = spec.bottom + 'px';
  base.style.width = spec.base + 'px';
  base.style.height = spec.base + 'px';
  base.style.zIndex = '20';
  knob.style.width = spec.knob + 'px';
  knob.style.height = spec.knob + 'px';
  $('gameContainer').appendChild(base);
  function setKnob(dx,dy){ const r=(spec.base-spec.knob)/2; const nx=Math.max(-r,Math.min(r,dx)); const ny=Math.max(-r,Math.min(r,dy)); knob.style.left=(r+nx)+'px'; knob.style.top=(r+ny)+'px'; joy.dx=nx/r; joy.dy=ny/r; }
  function start(e){ joy.active=true; const b=base.getBoundingClientRect(); joy.cx=b.left+b.width/2; joy.cy=b.top+b.height/2; move(e); }
  function move(e){ if(!joy.active) return; const p=e.touches? e.touches[0]: e; const dx=p.clientX-joy.cx; const dy=p.clientY-joy.cy; setKnob(dx,dy); inputMode='Touch (Joystick)'; }
  function end(){ joy.active=false; setKnob(0,0); }
  base.addEventListener('mousedown',start); window.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
  base.addEventListener('touchstart',start,{passive:false}); base.addEventListener('touchmove',e=>{ e.preventDefault(); move(e); },{passive:false}); base.addEventListener('touchend',end);
  joy.base=base; joy.knob=knob;
  console.log('[GroveJoystick] Positioned at', spec.left, 'px left,', spec.bottom, 'px bottom');
}

function updateCamera(){
  const target = worldToScreen(character.x, character.y);
  const cx = cvs.width/2, cy = cvs.height/2.8;
  camera.x += (target.x - cx) * 0.25;
  camera.y += (target.y - cy) * 0.25;
}

function updateAnimation(dt){
  const s = character.sprite?.meta; if (!s) return;
  const moving = Math.abs(joy.dx) > 0.01 || Math.abs(joy.dy) > 0.01 || keys['arrowup']||keys['w']||keys['arrowdown']||keys['s']||keys['arrowleft']||keys['a']||keys['arrowright']||keys['d'];
  const seq = moving ? 'walk' : 'idle';
  if (character.anim.seq !== seq){ character.anim.seq = seq; character.anim.frame = 0; character.anim.timer = 0; }
  const frames = s.sequences[seq] || [0];
  character.anim.timer += dt*1000;
  const frameMs = moving ? 120 : 500; // 100–150ms walk, 500ms idle hold
  if (character.anim.timer >= frameMs){ character.anim.timer = 0; character.anim.frame = (character.anim.frame + 1) % frames.length; }
}

function update(dt){
  const before={x:character.x,y:character.y};
  let vx=0,vy=0;
  if (keys['arrowup']||keys['w']) vy -= 1;
  if (keys['arrowdown']||keys['s']) vy += 1;
  if (keys['arrowleft']||keys['a']) vx -= 1;
  if (keys['arrowright']||keys['d']) vx += 1;
  if (joy.active){ vx += joy.dx; vy += joy.dy; }
  const len=Math.hypot(vx,vy)||1; vx/=len; vy/=len;
  character.y += vy*character.speed; character.x += vx*character.speed;
  if (vx||vy) character.bobT += 0.2; else character.bobT *= 0.9;
  updateAnimation(dt);
  if (before.x!==character.x || before.y!==character.y){ console.log('[GroveMove]', character.x.toFixed(2), character.y.toFixed(2)); }
  updateCamera();
  // Interactions
  const dChest=Math.hypot(character.x-chest.x, character.y-chest.y);
  if (!chest.taken && dChest<0.2){ chest.taken=true; console.log('[Pickup] Herb'); UI.showLore({ title:'You found a herb!', text:'Added Herb to inventory.' }); }
  const dNpc=Math.hypot(character.x-npc.x, character.y-npc.y);
  if (!npc.speaking && dNpc<0.25){ npc.speaking=true; console.log('[Lore] Elder'); UI.showLore({ title:'Elder', text:'Welcome to the Grove. The forest remembers.' }); setTimeout(()=>{ npc.speaking=false; },1200); }
}

function renderParallax(){
  const g=ctx.createLinearGradient(0,0,0,cvs.height); g.addColorStop(0,'#0a1322'); g.addColorStop(1,'#0b1020'); ctx.fillStyle=g; ctx.fillRect(0,0,cvs.width,cvs.height);
  ctx.globalAlpha=0.08; for (let i=0;i<8;i++){ const y=20+i*22+(Math.sin((tick+i)*0.03)*2); ctx.fillStyle='#0d1a2b'; ctx.fillRect(0,y,cvs.width,12); } ctx.globalAlpha=1;
}

function render(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  renderParallax();
  for (let iy=0; iy<2; iy++){
    for (let ix=0; ix<2; ix++){
      const t=getTile(tiles2x2[iy][ix]); const p=worldToScreen(ix,iy);
      ctx.globalAlpha=0.15; ctx.fillStyle='#000'; ctx.fillRect(p.x+4, p.y - (tileH/2)+4, tileW-8, 6); ctx.globalAlpha=1;
      if (t?.img && t.img.complete) ctx.drawImage(t.img, p.x, p.y - (tileH/2));
    }
  }
  const cf=worldToScreen(campfire.x,campfire.y); const pulse=0.3+0.3*Math.abs(Math.sin(tick*0.12)); ctx.globalAlpha=pulse; ctx.fillStyle='#ff9933'; ctx.beginPath(); ctx.arc(cf.x, cf.y-10, 8, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  if (!chest.taken){ const cp=worldToScreen(chest.x,chest.y); const cTile=getTile(chest.id); if (cTile?.img && cTile.img.complete) ctx.drawImage(cTile.img, cp.x-16, cp.y-16, 32, 32); }
  if (npc.sprite?.img && npc.sprite.img.complete){ const np=worldToScreen(npc.x,npc.y); ctx.drawImage(npc.sprite.img, np.x-20, np.y-36, npc.sprite.meta.frame.w, npc.sprite.meta.frame.h); }
  const s = character.sprite?.meta; const img=character.sprite?.img; const csp=worldToScreen(character.x, character.y); const bob = Math.sin(character.bobT)*2;
  if (s && img && img.complete){ 
    const frames = s.sequences[character.anim.seq] || [0]; 
    const frameIdx = frames[character.anim.frame] || 0; 
    const sx = frameIdx * s.frame.w; 
    const sy = 0; 
    const sw = s.frame.w; 
    const sh = s.frame.h; 
    const dx = csp.x - sw/2; 
    const dy = csp.y - sh + bob; 
    const dw = sw; 
    const dh = sh;
    
    // Use proper frame cropping with drawImage
    if (img.naturalWidth >= sx + sw && img.naturalHeight >= sy + sh){
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      if (tick % 60 === 0) console.log('[GroveSprite] Frame:', frameIdx, 'seq:', character.anim.seq, 'sx:', sx, 'sw:', sw, 'img:', img.naturalWidth, 'x', img.naturalHeight);
    } else {
      // Fallback: draw entire image if frame cropping fails
      ctx.drawImage(img, dx, dy, dw, dh);
      if (tick % 60 === 0) console.log('[GroveSprite] Fallback draw - img:', img.naturalWidth, 'x', img.naturalHeight);
    }
  }
}

function loop(ts){ const dt = (loop._last? (ts-loop._last):16)/1000; loop._last = ts; tick++; update(dt); render(); UI && UI.showHUD({ inputMode, fullscreenToggle: true }); requestAnimationFrame(loop); }

// Fullscreen toggle handler with proper canvas resize
window.__miffToggleFullscreen = ()=>{ 
  const el = document.documentElement; 
  if (!document.fullscreenElement){ 
    el.requestFullscreen?.(); 
  } else { 
    document.exitFullscreen?.(); 
  } 
  setTimeout(()=>{ 
    if (!cvs) return; 
    resizeCanvas();
  }, 200); 
};

// Canvas resize function
function resizeCanvas(){
  if (!cvs) return;
  const rect = cvs.getBoundingClientRect();
  cvs.width = rect.width;
  cvs.height = rect.height;
  console.log('[GroveResize] Canvas:', cvs.width, 'x', cvs.height);
}

// Window resize handler
window.addEventListener('resize', ()=>{
  resizeCanvas();
});

async function init(){
  cvs=$('gameCanvas'); ctx=cvs.getContext('2d');
  resizeCanvas(); // Initial canvas sizing
  UI = createOverlayDispatcher($('gameContainer'));
  UI.showHUD({ loadingText: 'Loading… 0%' });
  preloadAll();
  onAssetsReady(async ()=>{
    await loadGroveMap(); await loadCharacter(); bindInput(); ensureJoystick();
    UI.showIntro({ title:'Witcher Grove', message:'Use joystick or Arrow/WASD. Press C for Credits.', onStart:()=>{ UI.showHUD({ inputMode, fullscreenToggle: true }); } });
    requestAnimationFrame(loop);
  });
  const preloadInterval = setInterval(()=>{ const pct = getProgress(); UI.showHUD({ loadingText: `Loading… ${pct}%`, inputMode, fullscreenToggle: true }); if (pct>=100){ clearInterval(preloadInterval); } }, 100);
}

window.addEventListener('DOMContentLoaded', init);

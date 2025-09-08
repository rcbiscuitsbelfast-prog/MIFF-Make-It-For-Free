import { createOverlayDispatcher } from '../../overlays/dispatcher.js';

function $(id){ return document.getElementById(id); }

let manifest=null;
let groveMap=null;
const tileW=64, tileH=32; // iso base
let ctx=null, cvs=null, UI=null;
let idToImg=new Map();
let character={ x:0.5, y:0.5, img:null, variant:'adventurer', speed:0.06 };
let keys={};
let tiles2x2=[['grass_01','path_stone'],['grass_02','path_stone']];
let inputMode='Keyboard';
let loadedCount=0, totalToLoad=0;
let tick=0;
// Interactables
let chest={ x:1.4, y:0.6, id:'chest_red', taken:false };
let campfire={ x:0.4, y:1.4, id:'mystic_stone' };
let npc={ x:1.6, y:1.6, speaking:false, img:null };
// Joystick
let joy={ base:null, knob:null, active:false, cx:0, cy:0, dx:0, dy:0 };

function isoToScreen(ix, iy){
  const x = (ix - iy) * (tileW/2) + 320;
  const y = (ix + iy) * (tileH/2) + 80;
  return { x, y };
}

async function loadManifest(){
  manifest = await fetch('../../maps/tile_manifest.json').then(r=>r.json());
  totalToLoad += (manifest.tiles||[]).length;
  for (const t of manifest.tiles){ const img=new Image(); img.onload=()=>{ loadedCount++; }; img.onerror=()=>{ loadedCount++; }; img.src=t.src; idToImg.set(t.id,img); }
}

async function loadGroveMap(){
  try { groveMap = await fetch('../../maps/grove3d.json').then(r=>r.json()); } catch { groveMap = null; }
  const preferred=['grass_01','path_stone','mystic_stone','chest_red','grass_02'];
  const valid=new Set((manifest?.tiles||[]).map(t=>t.id));
  const chosen=preferred.filter(id=>valid.has(id)).slice(0,4);
  while (chosen.length<4){ const fb=(manifest?.tiles||[])[chosen.length% (manifest?.tiles?.length||1)]; if (!fb) break; chosen.push(fb.id); }
  tiles2x2=[[chosen[0],chosen[1]],[chosen[2],chosen[3]]];
}

function characterVariantToSrc(v){
  if (v==='mage') return '../../../assets/KayKitAssets/knight_texture.png';
  if (v==='rogue') return '../../../assets/KayKitAssets/rogue_texture.png';
  if (v==='knight') return '../../../assets/KayKitAssets/knight_texture.png';
  return '../../../assets/Player.png';
}

async function loadCharacter(){
  const img=new Image(); img.onload=()=>{ loadedCount++; }; img.onerror=()=>{ loadedCount++; }; img.src=characterVariantToSrc(character.variant);
  totalToLoad += 1; character.img = img;
  const npcImg=new Image(); npcImg.onload=()=>{ loadedCount++; }; npcImg.onerror=()=>{ loadedCount++; }; npcImg.src='../../../assets/Player.png';
  totalToLoad += 1; npc.img=npcImg;
}

function bindInput(){
  window.addEventListener('keydown',e=>{ keys[e.key.toLowerCase()]=true; inputMode='Keyboard'; });
  window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
  window.addEventListener('pointerdown',()=>{ inputMode='Touch'; });
  setInterval(()=>{ const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; if (pads.length) inputMode='Gamepad'; }, 1000);
}

function ensureJoystick(){
  if (joy.base) return;
  const base=document.createElement('div'); base.style.position='absolute'; base.style.left='80px'; base.style.bottom='80px'; base.style.width='96px'; base.style.height='96px'; base.style.border='2px solid rgba(255,255,255,0.2)'; base.style.borderRadius='50%'; base.style.background='rgba(0,0,0,0.2)'; base.style.touchAction='none';
  const knob=document.createElement('div'); knob.style.position='absolute'; knob.style.left='38px'; knob.style.top='38px'; knob.style.width='20px'; knob.style.height='20px'; knob.style.borderRadius='50%'; knob.style.background='rgba(88,166,255,0.9)';
  base.appendChild(knob); $('gameContainer').appendChild(base);
  function setKnob(dx,dy){ const r=36; const nx=Math.max(-r,Math.min(r,dx)); const ny=Math.max(-r,Math.min(r,dy)); knob.style.left=(38+nx)+'px'; knob.style.top=(38+ny)+'px'; joy.dx=nx/r; joy.dy=ny/r; }
  function start(e){ joy.active=true; const b=base.getBoundingClientRect(); joy.cx=b.left+b.width/2; joy.cy=b.top+b.height/2; move(e); }
  function move(e){ if(!joy.active) return; const p=e.touches? e.touches[0]: e; const dx=p.clientX-joy.cx; const dy=p.clientY-joy.cy; setKnob(dx,dy); inputMode='Touch (Joystick)'; }
  function end(){ joy.active=false; setKnob(0,0); }
  base.addEventListener('mousedown',start); window.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
  base.addEventListener('touchstart',start,{passive:false}); base.addEventListener('touchmove',e=>{ e.preventDefault(); move(e); },{passive:false}); base.addEventListener('touchend',end);
  joy.base=base; joy.knob=knob;
}

function update(){
  const before={x:character.x,y:character.y};
  let vx=0,vy=0;
  if (keys['arrowup']||keys['w']) vy -= 1;
  if (keys['arrowdown']||keys['s']) vy += 1;
  if (keys['arrowleft']||keys['a']) vx -= 1;
  if (keys['arrowright']||keys['d']) vx += 1;
  if (joy.active){ vx += joy.dx; vy += joy.dy; }
  const len=Math.hypot(vx,vy)||1; vx/=len; vy/=len;
  character.y += vy*character.speed; character.x += vx*character.speed;
  if (before.x!==character.x || before.y!==character.y){ console.log('[GroveMove]', character.x.toFixed(2), character.y.toFixed(2)); }
  // Interactions
  const dChest=Math.hypot(character.x-chest.x, character.y-chest.y);
  if (!chest.taken && dChest<0.2){ chest.taken=true; UI.showLore({ title:'You found a herb!', text:'Added Herb to inventory.' }); }
  const dNpc=Math.hypot(character.x-npc.x, character.y-npc.y);
  if (!npc.speaking && dNpc<0.25){ npc.speaking=true; UI.showLore({ title:'Elder', text:'Welcome to the Grove. The forest remembers.' }); setTimeout(()=>{ npc.speaking=false; },1200); }
}

function renderParallax(){
  // Sky gradient
  const g=ctx.createLinearGradient(0,0,0,cvs.height); g.addColorStop(0,'#0a1322'); g.addColorStop(1,'#0b1020'); ctx.fillStyle=g; ctx.fillRect(0,0,cvs.width,cvs.height);
  // Forest edge parallax bars
  ctx.globalAlpha=0.08; for (let i=0;i<8;i++){ const y=20+i*22+(Math.sin((tick+i)*0.03)*2); ctx.fillStyle='#0d1a2b'; ctx.fillRect(0,y,cvs.width,12); } ctx.globalAlpha=1;
}

function render(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  renderParallax();
  // 2x2 isometric tiles with soft shadows
  for (let iy=0; iy<2; iy++){
    for (let ix=0; ix<2; ix++){
      const id=tiles2x2[iy][ix]; const img=idToImg.get(id); const p=isoToScreen(ix,iy);
      // drop shadow
      ctx.globalAlpha=0.15; ctx.fillStyle='#000'; ctx.fillRect(p.x+4, p.y - (tileH/2)+4, 56, 6); ctx.globalAlpha=1;
      if (img && img.complete) ctx.drawImage(img, p.x, p.y - (tileH/2));
    }
  }
  // campfire ambient flicker
  const cf=isoToScreen(campfire.x,campfire.y); const pulse=0.3+0.3*Math.abs(Math.sin(tick*0.12)); ctx.globalAlpha=pulse; ctx.fillStyle='#ff9933'; ctx.beginPath(); ctx.arc(cf.x, cf.y-10, 8, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  // chest sprite (reuse tile image)
  if (!chest.taken){ const cp=isoToScreen(chest.x,chest.y); const img=idToImg.get(chest.id); if (img && img.complete) ctx.drawImage(img, cp.x-16, cp.y-16, 32, 32); }
  // NPC sprite
  if (npc.img && npc.img.complete){ const np=isoToScreen(npc.x,npc.y); ctx.drawImage(npc.img, np.x-14, np.y-28, 28, 28); }
  // character sprite centered
  const cp=isoToScreen(character.x, character.y); if (character.img && character.img.complete) ctx.drawImage(character.img, cp.x-16, cp.y-28, 32, 32);
}

function loop(){ tick++; update(); render(); UI && UI.showHUD({ inputMode }); requestAnimationFrame(loop); }

async function init(){
  cvs=$('gameCanvas'); ctx=cvs.getContext('2d');
  UI = createOverlayDispatcher($('gameContainer'));
  UI.showHUD({ loadingText: 'Loading… 0%' });
  await loadManifest(); await loadGroveMap(); await loadCharacter(); bindInput(); ensureJoystick();
  const preloadInterval = setInterval(()=>{ const pct = totalToLoad? Math.min(100, Math.round(loadedCount/totalToLoad*100)) : 100; UI.showHUD({ loadingText: `Loading… ${pct}%`, inputMode }); if (pct>=100){ clearInterval(preloadInterval); } }, 100);
  UI.showIntro({
    title:'Witcher Grove',
    message:'Use joystick or Arrow/WASD to move. Choose a variant and Start.',
    variants:[
      { label:'Adventurer', value:'adventurer' },
      { label:'Mage', value:'mage' },
      { label:'Rogue', value:'rogue' },
      { label:'Knight', value:'knight' }
    ],
    onVariantChange:(val)=>{ character.variant=val; const img=new Image(); img.src=characterVariantToSrc(val); img.onload=()=>{ character.img=img; } },
    onStart:()=>{ UI.showHUD({ inputMode }); }
  });
  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);

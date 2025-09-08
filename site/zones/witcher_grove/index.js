import { createOverlayDispatcher } from '../../overlays/dispatcher.js';

function $(id){ return document.getElementById(id); }

let manifest=null;
let groveMap=null;
const tileW=64, tileH=32; // iso base
let ctx=null, cvs=null, UI=null;
let idToImg=new Map();
let character={ x:0, y:0, img:null, variant:'adventurer' };
let keys={};
let tiles2x2=[['grass_01','path_stone'],['grass_02','path_stone']];
let inputMode='Keyboard';
let loadedCount=0, totalToLoad=0;
let tick=0;

function isoToScreen(ix, iy){
  const x = (ix - iy) * (tileW/2) + 320;
  const y = (ix + iy) * (tileH/2) + 80;
  return { x, y };
}

async function loadManifest(){
  manifest = await fetch('../../maps/tile_manifest.json').then(r=>r.json());
  totalToLoad += (manifest.tiles||[]).length;
  for (const t of manifest.tiles){ const img=new Image(); img.onload=()=>{ loadedCount++; }; img.onerror=()=>{ console.warn('[GroveAssetMissing]', t.src); loadedCount++; }; img.src=t.src; idToImg.set(t.id,img); }
}

async function loadGroveMap(){
  try { groveMap = await fetch('../../maps/grove3d.json').then(r=>r.json()); } catch { groveMap = null; }
  const preferred=['grass_01','path_stone','mystic_stone','chest_red','grass_02'];
  const valid=new Set((manifest?.tiles||[]).map(t=>t.id));
  const chosen=preferred.filter(id=>valid.has(id)).slice(0,4);
  while (chosen.length<4){ const fallback=(manifest?.tiles||[])[chosen.length% (manifest?.tiles?.length||1)]; if (!fallback) break; chosen.push(fallback.id); }
  tiles2x2=[[chosen[0],chosen[1]],[chosen[2],chosen[3]]];
  console.log('[GroveTiles]', tiles2x2.flat());
}

function characterVariantToSrc(v){
  if (v==='mage') return '../../../assets/KayKitAssets/knight_texture.png';
  if (v==='rogue') return '../../../assets/KayKitAssets/rogue_texture.png';
  if (v==='knight') return '../../../assets/KayKitAssets/knight_texture.png';
  return '../../../assets/Player.png';
}

async function loadCharacter(){
  const img=new Image(); img.onload=()=>{ loadedCount++; console.log('[GroveCharacterLoaded]', character.variant); }; img.onerror=()=>{ console.warn('[GroveCharacterMissing]'); loadedCount++; }; img.src=characterVariantToSrc(character.variant);
  totalToLoad += 1; character.img = img; character.x=1; character.y=1;
}

function bindInput(){
  window.addEventListener('keydown',e=>{ keys[e.key.toLowerCase()]=true; inputMode='Keyboard'; });
  window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
  window.addEventListener('pointerdown',()=>{ inputMode='Touch'; });
  setInterval(()=>{ const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; if (pads.length) inputMode='Gamepad'; }, 1000);
}

function update(){
  const before={x:character.x,y:character.y};
  if (keys['arrowup']||keys['w']) character.y -= 0.02;
  if (keys['arrowdown']||keys['s']) character.y += 0.02;
  if (keys['arrowleft']||keys['a']) character.x -= 0.02;
  if (keys['arrowright']||keys['d']) character.x += 0.02;
  if (before.x!==character.x || before.y!==character.y){ console.log('[GroveMove]', character.x.toFixed(2), character.y.toFixed(2)); }
}

function render(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  for (let iy=0; iy<2; iy++){
    for (let ix=0; ix<2; ix++){
      const id=tiles2x2[iy][ix]; const img=idToImg.get(id);
      const p=isoToScreen(ix,iy);
      if (img && img.complete){ ctx.drawImage(img, p.x, p.y - (tileH/2)); if ((tick%60)===0) console.log('[GroveDrawTile]', id, p.x, p.y); }
    }
  }
  const cp=isoToScreen(character.x, character.y);
  if (character.img && character.img.complete){ ctx.drawImage(character.img, cp.x-16, cp.y-28, 32, 32); if ((tick%60)===0) console.log('[GroveDrawChar]', cp.x, cp.y); }
}

function loop(){ tick++; if ((tick%60)===0) console.log('[GroveTick]', tick); update(); render(); UI && UI.showHUD({ inputMode }); requestAnimationFrame(loop); }

async function init(){
  cvs=$('gameCanvas'); ctx=cvs.getContext('2d');
  console.log('[GroveCanvas]', !!cvs, cvs?.width, cvs?.height);
  console.log('[GroveContext]', !!ctx);
  UI = createOverlayDispatcher($('gameContainer'));
  UI.showHUD({ loadingText: 'Loading… 0%' });
  await loadManifest(); await loadGroveMap(); await loadCharacter(); bindInput();
  const preloadInterval = setInterval(()=>{ const pct = totalToLoad? Math.min(100, Math.round(loadedCount/totalToLoad*100)) : 100; UI.showHUD({ loadingText: `Loading… ${pct}%`, inputMode }); if (pct>=100){ clearInterval(preloadInterval); } }, 100);
  UI.showIntro({
    title:'Witcher Grove',
    message:'Arrow keys/WASD to move. Choose a variant and Start.',
    variants:[
      { label:'Adventurer', value:'adventurer' },
      { label:'Mage', value:'mage' },
      { label:'Rogue', value:'rogue' },
      { label:'Knight', value:'knight' }
    ],
    onVariantChange:(val)=>{ character.variant=val; const img=new Image(); img.src=characterVariantToSrc(val); img.onload=()=>{ character.img=img; console.log('[Variant]', val); }; },
    onStart:()=>{ UI.showHUD({ inputMode }); }
  });
  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);

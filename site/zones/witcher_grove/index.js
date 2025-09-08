import { createOverlayDispatcher } from '../../overlays/dispatcher.js';

function $(id){ return document.getElementById(id); }

let manifest=null;
let groveMap=null;
const tileW=64, tileH=32; // iso base
let ctx=null, cvs=null, UI=null;
let idToImg=new Map();
let character={ x:0, y:0, img:null };
let keys={};
let tiles2x2=[['grass_01','path_stone'],['grass_02','path_stone']];

function isoToScreen(ix, iy){
  const x = (ix - iy) * (tileW/2) + 320;
  const y = (ix + iy) * (tileH/2) + 80;
  return { x, y };
}

async function loadManifest(){
  manifest = await fetch('../../maps/tile_manifest.json').then(r=>r.json());
  for (const t of manifest.tiles){ const img=new Image(); img.src=t.src; idToImg.set(t.id,img); }
}

async function loadGroveMap(){
  try { groveMap = await fetch('../../maps/grove3d.json').then(r=>r.json()); } catch { groveMap = null; }
  // Choose up to 4 valid IDs from registry and grove usage preferences
  const preferred=['grass_01','path_stone','mystic_stone','chest_red','grass_02'];
  const valid=new Set((manifest?.tiles||[]).map(t=>t.id));
  const chosen=preferred.filter(id=>valid.has(id)).slice(0,4);
  // Build 2x2 from chosen, pad with registry first if needed
  while (chosen.length<4){ const fallback=(manifest?.tiles||[])[chosen.length% (manifest?.tiles?.length||1)]; if (!fallback) break; chosen.push(fallback.id); }
  tiles2x2=[[chosen[0],chosen[1]],[chosen[2],chosen[3]]];
}

async function loadCharacter(){
  // CC0/KayKit-like placeholder sprite
  const img=new Image(); img.src='../../../assets/Player.png';
  character.img = img; character.x=1; character.y=1;
}

function bindInput(){
  window.addEventListener('keydown',e=>{ keys[e.key.toLowerCase()]=true; });
  window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
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
  // 2x2 isometric tiles
  for (let iy=0; iy<2; iy++){
    for (let ix=0; ix<2; ix++){
      const id=tiles2x2[iy][ix]; const img=idToImg.get(id);
      const p=isoToScreen(ix,iy);
      if (img && img.complete) ctx.drawImage(img, p.x, p.y - (tileH/2));
    }
  }
  // character sprite centered on its iso position
  const cp=isoToScreen(character.x, character.y);
  if (character.img && character.img.complete) ctx.drawImage(character.img, cp.x-16, cp.y-28, 32, 32);
}

function loop(){ update(); render(); requestAnimationFrame(loop); }

async function init(){
  cvs=$('gameCanvas'); ctx=cvs.getContext('2d');
  await loadManifest(); await loadGroveMap(); await loadCharacter(); bindInput();
  UI = createOverlayDispatcher($('gameContainer'));
  UI.showIntro({ title:'Witcher Grove', message:'Arrow keys/WASD to move. Start to play.', onStart: ()=>{/* start loop */} });
  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);

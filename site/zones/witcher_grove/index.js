import { createOverlayDispatcher } from '../../overlays/dispatcher.js';

function $(id){ return document.getElementById(id); }

let manifest=null;
const tileW=64, tileH=32; // iso base
let ctx=null, cvs=null, UI=null;
let idToImg=new Map();
let character={ x:0, y:0, img:null };
let keys={};

function isoToScreen(ix, iy){
  const x = (ix - iy) * (tileW/2) + 320;
  const y = (ix + iy) * (tileH/2) + 80;
  return { x, y };
}

async function loadManifest(){
  manifest = await fetch('../../maps/tile_manifest.json').then(r=>r.json());
  for (const t of manifest.tiles){ const img=new Image(); img.src=t.src; idToImg.set(t.id,img); }
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
  if (keys['arrowup']||keys['w']) character.y -= 0.02;
  if (keys['arrowdown']||keys['s']) character.y += 0.02;
  if (keys['arrowleft']||keys['a']) character.x -= 0.02;
  if (keys['arrowright']||keys['d']) character.x += 0.02;
}

function render(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  // 2x2 isometric tiles
  const tiles=[['grass_01','path_stone'],['grass_02','path_stone']];
  for (let iy=0; iy<2; iy++){
    for (let ix=0; ix<2; ix++){
      const id=tiles[iy][ix]; const img=idToImg.get(id);
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
  await loadManifest(); await loadCharacter(); bindInput();
  UI = createOverlayDispatcher($('gameContainer'));
  UI.showIntro({ title:'Witcher Grove', message:'Arrow keys/WASD to move. Start to play.', onStart: ()=>{/* start loop */} });
  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);

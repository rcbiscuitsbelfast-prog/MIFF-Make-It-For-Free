const layers = []; // { id, name, canvas, ctx, visible }
const anim = { frames: [], playing:false, time:0, fps:8 };
let tool = 'brush';

function $(id){ return document.getElementById(id); }

function init(){
  const draw = $('drawCanvas');
  const ctx = draw.getContext('2d');
  const fit = ()=>{ draw.width = draw.parentElement.clientWidth - 2; draw.height = Math.max(320, window.innerHeight*0.6); render(); };
  window.addEventListener('resize', fit); fit();
  let painting=false; let last=null;
  draw.addEventListener('mousedown', (e)=>{ painting=true; last=pt(e,draw); paint(last); });
  draw.addEventListener('mousemove', (e)=>{ const p=pt(e,draw); if (painting){ paint(p, last); last=p; } });
  window.addEventListener('mouseup', ()=>{ painting=false; last=null; });

  function paint(p, from){ if (tool==='brush'){ activeCtx().strokeStyle='#e6edf3'; activeCtx().lineWidth=2; activeCtx().lineCap='round'; activeCtx().beginPath(); if(from){ activeCtx().moveTo(from.x, from.y);} activeCtx().lineTo(p.x, p.y); activeCtx().stroke(); render(); } if (tool==='erase'){ activeCtx().clearRect(p.x-6,p.y-6,12,12); render(); } }

  $('tool-brush').onclick = ()=> tool='brush';
  $('tool-erase').onclick = ()=> tool='erase';
  $('tool-move').onclick = ()=> tool='move';
  $('btn-add-layer').onclick = addLayer;
  $('file-import').addEventListener('change', importLayer);
  $('btn-add-key').onclick = addKey;
  $('btn-play').onclick = ()=>{ anim.playing=true; loop(); };
  $('btn-stop').onclick = ()=>{ anim.playing=false; };
  $('btn-export-sheet').onclick = exportSheet;
  $('btn-export-json').onclick = exportAnimJSON;

  addLayer();

  function loop(ts){ if (!anim.playing) return; requestAnimationFrame(loop); anim.time += 1/anim.fps; const frameIndex = Math.floor(anim.time*anim.fps) % Math.max(1, anim.frames.length); if (anim.frames[frameIndex]) applyFrame(anim.frames[frameIndex]); render(); }

  function render(){ ctx.clearRect(0,0,draw.width,draw.height); // checker
    for (let y=0;y<draw.height;y+=16){ for (let x=0;x<draw.width;x+=16){ ctx.fillStyle = ((x+y)/16)%2? '#0d1727' : '#0a1322'; ctx.fillRect(x,y,16,16); } }
    layers.filter(l=>l.visible!==false).forEach(l=>{ ctx.drawImage(l.canvas,0,0); }); }
}

function pt(e,c){ const r=c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function activeLayer(){ return layers[0]; }
function activeCtx(){ return activeLayer().ctx; }

function addLayer(){ const id='L'+Date.now(); const name='Layer '+(layers.length+1); const c=document.createElement('canvas'); const d=$('drawCanvas'); c.width=d.width; c.height=d.height; const ctx=c.getContext('2d'); layers.unshift({ id, name, canvas:c, ctx, visible:true }); syncLayers(); }

function syncLayers(){ const list=$('layerList'); list.innerHTML=''; layers.forEach((l,idx)=>{ const row=document.createElement('div'); row.innerHTML = `<label><input type="checkbox" ${l.visible!==false?'checked':''} data-id="${l.id}"/> ${l.name}</label>`; row.querySelector('input').onchange = (e)=>{ l.visible = e.target.checked; }; list.appendChild(row); }); }

function importLayer(e){ const file=e.target.files[0]; if (!file) return; const img=new Image(); img.onload=()=>{ const a=activeCtx(); a.drawImage(img,0,0); e.target.value='';}; img.src=URL.createObjectURL(file); }

function addKey(){ const d=$('drawCanvas'); const temp=document.createElement('canvas'); temp.width=d.width; temp.height=d.height; const tctx=temp.getContext('2d'); layers.filter(l=>l.visible!==false).forEach(l=>{ tctx.drawImage(l.canvas,0,0); }); const data=temp.toDataURL('image/png'); anim.frames.push({ data }); syncTimeline(); }

function syncTimeline(){ const t=$('timeline'); t.innerHTML=''; anim.frames.forEach((f,i)=>{ const img=new Image(); img.src=f.data; img.style.width='64px'; img.style.height='64px'; img.style.margin='4px'; t.appendChild(img); }); }

function applyFrame(f){ const d=$('drawCanvas'); const ctx=d.getContext('2d'); const img=new Image(); img.onload=()=>{ ctx.clearRect(0,0,d.width,d.height); ctx.drawImage(img,0,0); }; img.src=f.data; }

function exportSheet(){ const cols = Math.ceil(Math.sqrt(anim.frames.length||1)); const size=64; const sheet=document.createElement('canvas'); sheet.width = cols*size; sheet.height = cols*size; const sctx=sheet.getContext('2d'); anim.frames.forEach((f,i)=>{ const img=new Image(); img.onload=()=>{ const x=(i%cols)*size; const y=Math.floor(i/cols)*size; sctx.drawImage(img,x,y,size,size); if (i===anim.frames.length-1){ const link=sheet.toDataURL('image/png'); download('sprite_sheet.png', link, true); } }; img.src=f.data; }); if (anim.frames.length===0){ download('sprite_sheet.png', sheet.toDataURL('image/png'), true); } }

function exportAnimJSON(){ const data = { fps: anim.fps, frames: anim.frames.map((f,i)=>({ index:i, data:f.data })) }; const content = JSON.stringify(data, null, 2); const blob = new Blob([content], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='animation.json'; a.click(); URL.revokeObjectURL(a.href); }

function download(name, url, isDataUrl){ if (isDataUrl){ const a=document.createElement('a'); a.href=url; a.download=name; a.click(); } }

init();

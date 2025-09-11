const paletteTypes = [
  { id:'npc', name:'NPC' },
  { id:'trigger', name:'Trigger' },
  { id:'overlay', name:'Overlay' },
  { id:'zoneLink', name:'Zone Link' },
  { id:'sprite', name:'Sprite' },
  { id:'tile', name:'Tile' }
];

const state = {
  entities: [],
  selectedId: null,
  tool: 'select',
  currentType: 'npc'
};

function $(id){ return document.getElementById(id); }

function initPalette(){
  const pal = $('palette');
  paletteTypes.forEach(t=>{
    const btn = document.createElement('button');
    btn.textContent = t.name;
    btn.className = 'palette-btn';
    btn.onclick = ()=>{ state.currentType = t.id; };
    pal.appendChild(btn);
  });
  // Load assets manifest and allow selection
  fetch('../assets/manifest.json').then(r=>r.json()).then(man=>{
    const sec = document.createElement('div'); sec.style.marginTop='8px'; sec.innerHTML='<h4>Assets</h4>';
    const list = document.createElement('div'); list.className='list';
    ;[...(man.sprites||[]), ...(man.tiles||[])].forEach(a=>{
      const row=document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='6px';
      const img=new Image(); img.src=a.url; img.width=24; img.height=24; img.style.objectFit='contain';
      const b=document.createElement('button'); b.textContent=a.name; b.onclick=()=>{ state.currentType = (a.tags||[]).includes('tile')? 'tile':'sprite'; state.assetSelection = a; };
      row.appendChild(img); row.appendChild(b); list.appendChild(row);
    });
    sec.appendChild(list); pal.appendChild(sec);

    // Populate dropdowns
    const spriteSel = document.getElementById('spriteSelect');
    const tileSel = document.getElementById('tileSelect');
    (man.sprites||[]).forEach(s=>{ const o=document.createElement('option'); o.value=s.url; o.textContent=s.name; spriteSel && spriteSel.appendChild(o); });
    (man.tiles||[]).forEach(t=>{ const o=document.createElement('option'); o.value=t.url; o.textContent=t.name; tileSel && tileSel.appendChild(o); });
  }).catch(()=>{});
}

function initTools(){
  $('tool-select').onclick = ()=> state.tool='select';
  $('tool-add').onclick = ()=> state.tool='add';
  $('tool-move').onclick = ()=> state.tool='move';
  $('tool-rotate').onclick = ()=> state.tool='rotate';
  $('tool-resize').onclick = ()=> state.tool='resize';
}

function initCanvas(){
  const cvs = $('sceneCanvas');
  const ctx = cvs.getContext('2d');
  const fit = ()=>{ cvs.width = cvs.parentElement.clientWidth - 2; cvs.height = Math.max(360, window.innerHeight*0.6); draw(); };
  window.addEventListener('resize', fit); fit();
  // sprite preview canvas
  const pvs = document.getElementById('previewCanvas'); const pctx = pvs ? pvs.getContext('2d') : null; let pvAnim=0;
  if (pvs && pctx){ pvs.width=160; pvs.height=160; setInterval(()=>{ pvAnim=(pvAnim+1)%60; const sel=document.getElementById('spriteSelect'); const url=sel && sel.value; pctx.clearRect(0,0,pvs.width,pvs.height); if (url){ const img=getImage(url); const t=(pvAnim/60); const scale=0.8+0.2*Math.sin(t*2*Math.PI); const w=Math.min(pvs.width*scale, img.naturalWidth||64); const h=Math.min(pvs.height*scale, img.naturalHeight||64); pctx.drawImage(img, (pvs.width-w)/2, (pvs.height-h)/2, w, h); } }, 1000/30); }
  let dragging = false; let dragId = null; let offset = {x:0,y:0};
  cvs.addEventListener('mousedown', (e)=>{
    let p = pointer(e, cvs);
    if (document.getElementById('snapToGrid')?.checked){ const g = parseInt(document.getElementById('gridSize')?.value||'32',10)||32; p.x = Math.round(p.x/g)*g; p.y = Math.round(p.y/g)*g; }
    if (state.tool==='add'){
      const id = 'e'+(Date.now());
      const base = { id, name: (state.assetSelection?.name || state.currentType.toUpperCase()), type: state.currentType, x:p.x, y:p.y, w:48, h:48, r:0, tags:[], behavior:'' };
      if ((state.currentType==='sprite' || state.currentType==='tile') && state.assetSelection){ base.src = state.assetSelection.url; if (state.currentType==='tile'){ base.w = 64; base.h = 64; } }
      state.entities.push(base);
      state.selectedId = id; syncProps(); draw(); return;
    }
    const hit = hitTest(p.x, p.y);
    if (hit){ state.selectedId = hit.id; syncProps(); draw(); if (state.tool==='move'){ dragging=true; dragId=hit.id; offset.x=p.x-hit.x; offset.y=p.y-hit.y; } }
  });
  window.addEventListener('mousemove', (e)=>{
    if (!dragging) return; let p = pointer(e, cvs); if (document.getElementById('snapToGrid')?.checked){ const g = parseInt(document.getElementById('gridSize')?.value||'32',10)||32; p.x = Math.round(p.x/g)*g; p.y = Math.round(p.y/g)*g; }
    const ent = state.entities.find(e=>e.id===dragId); if (!ent) return; ent.x = p.x - offset.x; ent.y = p.y - offset.y; draw();
  });
  window.addEventListener('mouseup', ()=>{ dragging=false; dragId=null; });

  function draw(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    // grid
    ctx.strokeStyle = 'rgba(88,166,255,0.1)'; ctx.lineWidth=1;
    for (let x=0;x<cvs.width;x+=32){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cvs.height); ctx.stroke(); }
    for (let y=0;y<cvs.height;y+=32){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cvs.width,y); ctx.stroke(); }
    // entities
    state.entities.forEach(ent=>{
      ctx.save(); ctx.translate(ent.x, ent.y); ctx.rotate(ent.r||0);
      if (ent.src){ const img = getImage(ent.src); if (img && img.complete){ ctx.drawImage(img, 0, 0, ent.w, ent.h); } else { ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(0,0,ent.w,ent.h); } }
      else { ctx.fillStyle = ent.id===state.selectedId? 'rgba(88,166,255,0.4)' : 'rgba(255,255,255,0.15)'; ctx.fillRect(0,0, ent.w, ent.h); ctx.strokeStyle = '#58a6ff'; ctx.strokeRect(0,0, ent.w, ent.h); }
      ctx.fillStyle = '#e6edf3'; ctx.font='12px system-ui'; ctx.fillText(ent.name||ent.type, 4, 14);
      ctx.restore();
    });
  }

  function pointer(e,c){ const r=c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function hitTest(x,y){ for (let i=state.entities.length-1;i>=0;i--){ const e=state.entities[i]; if (x>=e.x && y>=e.y && x<=e.x+e.w && y<=e.y+e.h) return e; } return null; }

  // Export buttons
  $('btn-export-json').onclick = ()=>{
    const data = exportJSON(); download('scene.json', JSON.stringify(data, null, 2));
  };
  $('btn-export-yaml').onclick = ()=>{
    const data = exportJSON(); const yaml = toYAML(data); download('scene.yaml', yaml);
  };
  $('btn-inject-runtime').onclick = ()=>{
    const data = exportJSON(); try { window.postMessage({ type:'scene-data', zone: (document.querySelector('[data-zone]')?.dataset.zone||'zone'), data }, '*'); } catch {}
  };

  // Props sync
  ['prop-name','prop-type','prop-tags','prop-behavior'].forEach(id=>{
    $(id).addEventListener('input', ()=>{ applyProps(); draw(); });
  });

  function syncProps(){ const e = state.entities.find(x=>x.id===state.selectedId); if(!e) return; $('prop-name').value=e.name||''; $('prop-type').value=e.type||''; $('prop-tags').value=(e.tags||[]).join(','); $('prop-behavior').value=e.behavior||''; }
  function applyProps(){ const e = state.entities.find(x=>x.id===state.selectedId); if(!e) return; e.name=$('prop-name').value; e.type=$('prop-type').value; e.tags=($('prop-tags').value||'').split(',').map(s=>s.trim()).filter(Boolean); e.behavior=$('prop-behavior').value; }

  // init types
  const sel = $('prop-type'); paletteTypes.forEach(t=>{ const o=document.createElement('option'); o.value=t.id; o.textContent=t.name; sel.appendChild(o); });

  // Save/Load
  document.getElementById('btn-save').onclick = ()=>{ try { localStorage.setItem('miff_studio_scene', JSON.stringify(exportJSON())); } catch {} };
  document.getElementById('btn-load').onclick = async ()=>{ try { const s=localStorage.getItem('miff_studio_scene'); if (!s) return; const d=JSON.parse(s); state.entities=(d.entities||[]).map(x=>({ ...x })); state.selectedId=null; draw(); } catch {} };
  try { const s=localStorage.getItem('miff_studio_scene'); if(s){ /* autosave restore optional */ } } catch {}

  // Load presets
  const presetBtn = document.getElementById('btn-load-preset');
  if (presetBtn){ presetBtn.onclick = async ()=>{ const selEl=document.getElementById('presetSelect'); const path=selEl&&selEl.value; if(!path) return; try { const pre=await fetch(path).then(r=>r.json()); state.entities=(pre.entities||[]).map(e=>({ ...e })); state.selectedId=null; draw(); } catch {} }; }

  // Preview sprite & map: place selected into scene at origin
  const prevSpriteBtn = document.getElementById('btn-preview-sprite');
  if (prevSpriteBtn){ prevSpriteBtn.onclick = ()=>{ const sel=document.getElementById('spriteSelect'); const url=sel && sel.value; if (!url) return; state.currentType='sprite'; state.assetSelection={ name: sel.options[sel.selectedIndex].textContent, url }; const id='pv_'+Date.now(); state.entities.push({ id, name:'Preview Sprite', type:'sprite', src:url, x:16, y:16, w:64, h:64 }); draw(); } }
  const prevMapBtn = document.getElementById('btn-preview-map');
  if (prevMapBtn){ prevMapBtn.onclick = ()=>{ const sel=document.getElementById('tileSelect'); const url=sel && sel.value; if (!url) return; state.currentType='tile'; state.assetSelection={ name: sel.options[sel.selectedIndex].textContent, url }; const id='pv_'+Date.now(); state.entities.push({ id, name:'Preview Tile', type:'tile', src:url, x:100, y:100, w:64, h:64 }); draw(); } }
}

function exportJSON(){ return { version: 1, entities: state.entities.map(e=>({ id:e.id, name:e.name, type:e.type, x:e.x, y:e.y, w:e.w, h:e.h, r:e.r||0, tags:e.tags||[], behavior:e.behavior||'', src:e.src||null })) }; }
function toYAML(obj){ const lines=[]; function w(k,v,i){ const ind='  '.repeat(i); if (Array.isArray(v)){ lines.push(`${ind}${k}:`); v.forEach(it=>{ if (typeof it==='object'){ lines.push(`${ind}-`); Object.entries(it).forEach(([kk,vv])=>w(kk,vv,i+2)); } else { lines.push(`${ind}- ${it}`); } }); } else if (typeof v==='object'){ lines.push(`${ind}${k}:`); Object.entries(v).forEach(([kk,vv])=>w(kk,vv,i+1)); } else { lines.push(`${ind}${k}: ${JSON.stringify(v)}`);} } Object.entries(obj).forEach(([k,v])=>w(k,v,0)); return lines.join('\n'); }
function download(name, content){ const blob = new Blob([content], {type:'application/octet-stream'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

initPalette();
initTools();
initCanvas();
// image cache
const __imgCache = new Map();
function getImage(src){ if (__imgCache.has(src)) return __imgCache.get(src); const img=new Image(); img.src=src; __imgCache.set(src, img); return img; }

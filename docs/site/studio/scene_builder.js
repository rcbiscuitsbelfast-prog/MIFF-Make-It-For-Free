const paletteTypes = [
  { id:'npc', name:'NPC' },
  { id:'trigger', name:'Trigger' },
  { id:'overlay', name:'Overlay' },
  { id:'zoneLink', name:'Zone Link' }
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
  let dragging = false; let dragId = null; let offset = {x:0,y:0};
  cvs.addEventListener('mousedown', (e)=>{
    const p = pointer(e, cvs);
    if (state.tool==='add'){
      const id = 'e'+(Date.now());
      state.entities.push({ id, name: state.currentType.toUpperCase(), type: state.currentType, x:p.x, y:p.y, w:48, h:48, r:0, tags:[], behavior:'' });
      state.selectedId = id; syncProps(); draw(); return;
    }
    const hit = hitTest(p.x, p.y);
    if (hit){ state.selectedId = hit.id; syncProps(); draw(); if (state.tool==='move'){ dragging=true; dragId=hit.id; offset.x=p.x-hit.x; offset.y=p.y-hit.y; } }
  });
  window.addEventListener('mousemove', (e)=>{
    if (!dragging) return; const p = pointer(e, cvs); const ent = state.entities.find(e=>e.id===dragId); if (!ent) return; ent.x = p.x - offset.x; ent.y = p.y - offset.y; draw();
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
      ctx.fillStyle = ent.id===state.selectedId? 'rgba(88,166,255,0.4)' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(0,0, ent.w, ent.h);
      ctx.strokeStyle = '#58a6ff'; ctx.strokeRect(0,0, ent.w, ent.h);
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
}

function exportJSON(){ return { version: 1, entities: state.entities.map(e=>({ id:e.id, name:e.name, type:e.type, x:e.x, y:e.y, w:e.w, h:e.h, r:e.r||0, tags:e.tags||[], behavior:e.behavior||'' })) }; }
function toYAML(obj){ const lines=[]; function w(k,v,i){ const ind='  '.repeat(i); if (Array.isArray(v)){ lines.push(`${ind}${k}:`); v.forEach(it=>{ if (typeof it==='object'){ lines.push(`${ind}-`); Object.entries(it).forEach(([kk,vv])=>w(kk,vv,i+2)); } else { lines.push(`${ind}- ${it}`); } }); } else if (typeof v==='object'){ lines.push(`${ind}${k}:`); Object.entries(v).forEach(([kk,vv])=>w(kk,vv,i+1)); } else { lines.push(`${ind}${k}: ${JSON.stringify(v)}`);} } Object.entries(obj).forEach(([k,v])=>w(k,v,0)); return lines.join('\n'); }
function download(name, content){ const blob = new Blob([content], {type:'application/octet-stream'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

initPalette();
initTools();
initCanvas();

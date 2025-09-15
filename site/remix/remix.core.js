/* RemixCore: shared palette/grid/undo/redo + manifest validation and export */
(function(global){
  const state = {
    palette: [],
    entities: [],
    selectedId: null,
    tool: 'select',
    assetIndex: new Map(),
    whitelist: new Set(),
    history: [],
    future: [],
    config: { onSave:null }
  };

  function $(id){ return document.getElementById(id); }
  function nowId(){ return 'e'+Date.now()+Math.floor(Math.random()*1000); }

  function recordHistory(label){
    state.history.push({ label, snapshot: JSON.stringify(state.entities) });
    if (state.history.length>200) state.history.shift();
    state.future.length=0;
    renderHistory();
  }
  function undo(){ const h=state.history.pop(); if(!h) return; state.future.push({ label:h.label, snapshot: JSON.stringify(state.entities) }); state.entities = JSON.parse(h.snapshot); draw(); renderHistory(); }
  function redo(){ const f=state.future.pop(); if(!f) return; state.history.push({ label:f.label, snapshot: JSON.stringify(state.entities) }); state.entities = JSON.parse(f.snapshot); draw(); renderHistory(); }

  function renderHistory(){ const el=$('history'); if(!el) return; el.innerHTML=''; [...state.history].slice(-20).forEach(h=>{ const d=document.createElement('div'); d.textContent = '• '+h.label; d.style.fontSize='12px'; d.style.color='#a9b8c6'; el.appendChild(d); }); }

  function initPalette(palette){ state.palette = palette||[]; const pal=$('palette'); if (!pal) return; pal.innerHTML=''; state.palette.forEach(t=>{ const b=document.createElement('button'); b.className='palette-btn'; b.textContent=t.name; b.onclick=()=>{ document.querySelectorAll('.palette-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.currentType=t.id; }; pal.appendChild(b); }); document.querySelector('.palette-btn')?.classList.add('active'); }

  function pointer(e,c){ const r=c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function hitTest(x,y){ for(let i=state.entities.length-1;i>=0;i--){ const e=state.entities[i]; if(x>=e.x && y>=e.y && x<=e.x+e.w && y<=e.y+e.h) return e; } return null; }

  function initCanvas(){ const cvs=$('sceneCanvas'); if(!cvs) return; const ctx=cvs.getContext('2d'); const fit=()=>{ cvs.width=cvs.parentElement.clientWidth-2; cvs.height=Math.max(360, window.innerHeight*0.6); draw(); }; window.addEventListener('resize', fit); fit(); let dragging=false; let dragId=null; let offset={x:0,y:0}; cvs.addEventListener('mousedown', (e)=>{ let p=pointer(e,cvs); if ($('snapToGrid')?.checked){ const g=parseInt($('gridSize')?.value||'32',10)||32; p.x=Math.round(p.x/g)*g; p.y=Math.round(p.y/g)*g; } if (state.tool==='add'){ const id=nowId(); const base={ id, name:(state.assetSelection?.name || (state.currentType||'BLOCK').toUpperCase()), type:state.currentType||'block', x:p.x, y:p.y, w:48, h:48, r:0, tags:[], behavior:'' }; if ((state.currentType==='sprite'||state.currentType==='tile') && state.assetSelection){ base.src=state.assetSelection.url; if (state.currentType==='tile'){ base.w=64;base.h=64; } } state.entities.push(base); state.selectedId=id; recordHistory('add '+(base.name||base.type)); syncProps(); draw(); return; } const hit=hitTest(p.x,p.y); if (hit){ state.selectedId=hit.id; syncProps(); draw(); if (state.tool==='move'){ dragging=true; dragId=hit.id; offset.x=p.x-hit.x; offset.y=p.y-hit.y; } } }); window.addEventListener('mousemove', (e)=>{ if(!dragging) return; let p=pointer(e,cvs); if ($('snapToGrid')?.checked){ const g=parseInt($('gridSize')?.value||'32',10)||32; p.x=Math.round(p.x/g)*g; p.y=Math.round(p.y/g)*g; } const ent=state.entities.find(e=>e.id===dragId); if(!ent) return; ent.x=p.x-offset.x; ent.y=p.y-offset.y; draw(); }); window.addEventListener('mouseup', ()=>{ if(dragging){ recordHistory('move'); } dragging=false; dragId=null; }); function grid(ctx){ ctx.strokeStyle='rgba(88,166,255,0.08)'; ctx.lineWidth=1; const step=parseInt($('gridSize')?.value||'32',10)||32; for(let x=0;x<cvs.width;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cvs.height); ctx.stroke(); } for(let y=0;y<cvs.height;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cvs.width,y); ctx.stroke(); } }
    function draw(){ ctx.clearRect(0,0,cvs.width,cvs.height); grid(ctx); state.entities.forEach(ent=>{ ctx.save(); ctx.translate(ent.x, ent.y); ctx.rotate(ent.r||0); if (ent.src){ const img=getImage(ent.src); if (img && img.complete){ ctx.drawImage(img, 0, 0, ent.w, ent.h); } else { ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(0,0,ent.w,ent.h); } } else { ctx.fillStyle = ent.id===state.selectedId? 'rgba(88,166,255,0.35)' : 'rgba(255,255,255,0.12)'; ctx.fillRect(0,0, ent.w, ent.h); ctx.strokeStyle = '#58a6ff'; ctx.strokeRect(0,0, ent.w, ent.h); } ctx.fillStyle='#e6edf3'; ctx.font='12px system-ui'; ctx.fillText(ent.name||ent.type, 4, 14); ctx.restore(); }); }
    state._draw = draw; draw(); }

  function initTools(){ const map={ 'tool-select':'select','tool-add':'add','tool-move':'move' }; Object.entries(map).forEach(([id,tool])=>{ const b=$(id); if(b){ b.onclick=()=>{ state.tool=tool; }; }}); }

  function syncProps(){ const e = state.entities.find(x=>x.id===state.selectedId); if(!e) return; $('prop-name') && ($('prop-name').value=e.name||''); $('prop-type') && ($('prop-type').value=e.type||''); $('prop-tags') && ($('prop-tags').value=(e.tags||[]).join(',')); $('prop-behavior') && ($('prop-behavior').value=e.behavior||''); }
  function applyProps(){ const e = state.entities.find(x=>x.id===state.selectedId); if(!e) return; const before=JSON.stringify(e); if ($('prop-name')) e.name=$('prop-name').value; if ($('prop-type')) e.type=$('prop-type').value; if ($('prop-tags')) e.tags=($('prop-tags').value||'').split(',').map(s=>s.trim()).filter(Boolean); if ($('prop-behavior')) e.behavior=$('prop-behavior').value; if (before!==JSON.stringify(e)) recordHistory('props'); state._draw && state._draw(); }
  function initPropBindings(){ ['prop-name','prop-type','prop-tags','prop-behavior'].forEach(id=>{ const el=$(id); if(el) el.addEventListener('input', ()=>applyProps()); }); if ($('prop-type')){ const types=['tree','chest','enemy','path','sprite','tile','npc','trigger','overlay','zoneLink']; $('prop-type').innerHTML = types.map(t=>`<option value="${t}">${t}</option>`).join(''); }
  }

  // Asset whitelist and index
  async function loadWhitelist(paths){ const set=new Set(); for (const p of paths||[]){ try { const json = await fetch(resolveUrl(p)).then(r=>r.json()); collectAssets(json, set); } catch {} } state.whitelist = set; renderAssetList(); }
  function collectAssets(json, set){ try { if (Array.isArray(json?.sprites)) json.sprites.forEach(s=>{ if (s.url) set.add(s.url); }); if (Array.isArray(json?.tiles)) json.tiles.forEach(s=>{ if (s.url) set.add(s.url); }); if (Array.isArray(json?.assets)) json.assets.forEach(a=>{ if (a.url) set.add(a.url); }); } catch {}
  }
  function renderAssetList(){ const el=$('assetList'); if(!el) return; el.innerHTML=''; [...state.whitelist].slice(0,200).forEach(url=>{ const row=document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='6px'; const img=new Image(); img.src=url; img.width=20; img.height=20; img.style.objectFit='contain'; const b=document.createElement('button'); b.className='btn'; b.textContent=url.split('/').pop(); b.onclick=()=>{ state.currentType = url.match(/\.png|\.jpg|\.gif|\.webp/i)? 'sprite':'tile'; state.assetSelection = { name:b.textContent, url }; }; row.appendChild(img); row.appendChild(b); el.appendChild(row); }); }

  // Export and validation
  function exportManifest(){ return { version:1, kind:'remix-manifest', entities: state.entities.map(e=>({ id:e.id, name:e.name, type:e.type, x:e.x, y:e.y, w:e.w, h:e.h, r:e.r||0, tags:e.tags||[], behavior:e.behavior||'', src:e.src||null })) }; }
  function validateManifest(man){ const warnings=[]; const whitelist=state.whitelist; (man.entities||[]).forEach(e=>{ if (e.src && !whitelist.has(e.src)){ warnings.push(`Unregistered asset: ${e.src}`); } }); // AssetManifestPure minimal shape: version number and entities array with required fields
    if (typeof man.version!=='number') warnings.push('Manifest.version must be a number'); if (!Array.isArray(man.entities)) warnings.push('Manifest.entities must be an array'); return { ok: warnings.length===0, warnings } }

  // Save handler
  function save(){ const man = exportManifest(); const v = validateManifest(man); const pre = $('exportPreview'); if (pre) pre.textContent = JSON.stringify({ manifest: man, warnings: v.warnings }, null, 2); try { download('remix.manifest.json', JSON.stringify(man, null, 2)); } catch {} if (typeof state.config.onSave==='function'){ try { state.config.onSave(man); } catch {} } if (v.warnings.length){ console.warn('[RemixCore] Validation warnings:', v.warnings); }
  }

  // Utilities
  function resolveUrl(p){ try { const a=document.createElement('a'); a.href=p; return a.href; } catch { return p; } }
  const __imgCache = new Map(); function getImage(src){ if (__imgCache.has(src)) return __imgCache.get(src); const img=new Image(); img.src=src; __imgCache.set(src,img); return img; }
  function download(name, content){ const blob=new Blob([content], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

  function bootstrap(opts){ state.config.onSave = opts && opts.onSave; initPalette(opts && opts.palette || []); initTools(); initCanvas(); initPropBindings(); if (Array.isArray(opts?.assetWhitelistPaths)){ loadWhitelist(opts.assetWhitelistPaths); }
    // expose minimal API
    updateStatus('ready'); }

  function updateStatus(msg){ const s=$('status'); if(s) s.textContent = msg; }

  // Public API
  global.RemixCore = { bootstrap, undo, redo, save, exportManifest, validateManifest };
})(window);


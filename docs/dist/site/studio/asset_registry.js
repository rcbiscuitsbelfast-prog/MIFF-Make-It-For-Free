// Simple in-memory asset registry (can be persisted to localStorage)
const registry = { sprites: [], animations: [], entities: [], templates: [] };

export function addSprite({ name, dataUrl, tags=[], zone }){ const id='spr_'+Date.now(); registry.sprites.push({ id, name, dataUrl, tags, zone }); save(); return id; }
export function addAnimation({ name, json, tags=[], zone }){ const id='anim_'+Date.now(); registry.animations.push({ id, name, json, tags, zone }); save(); return id; }
export function addEntityTemplate({ name, type, props={}, tags=[], zone }){ const id='tpl_'+Date.now(); registry.templates.push({ id, name, type, props, tags, zone }); save(); return id; }
export function listAssets(){ return JSON.parse(JSON.stringify(registry)); }
export function findByTag(tag){ const r=listAssets(); return { sprites: r.sprites.filter(x=>x.tags?.includes(tag)), animations: r.animations.filter(x=>x.tags?.includes(tag)), templates: r.templates.filter(x=>x.tags?.includes(tag)) } }

function save(){ try { localStorage.setItem('miff_asset_registry', JSON.stringify(registry)); } catch {} }
function load(){ try { const s=localStorage.getItem('miff_asset_registry'); if (s){ const d=JSON.parse(s); ['sprites','animations','entities','templates'].forEach(k=>{ if (Array.isArray(d[k])) registry[k]=d[k]; }); } } catch {} }
load();

// Prompt hooks (simple parser examples)
export function runPrompt(p){ const t=p.toLowerCase(); if (t.startsWith('add npc')){ const m=/add npc named '([^']+)' to (\w+)/i.exec(p); if(m){ const name=m[1]; const zone=m[2]; const id = addEntityTemplate({ name, type:'npc', props:{}, tags:['npc'], zone }); return { ok:true, id }; } }
  if (t.startsWith('create animation')){ const m=/create animation '([^']+)' with (\d+) keyframes/i.exec(p); if(m){ const name=m[1]; const n=parseInt(m[2],10)||0; const json={ fps:8, frames: Array.from({length:n}).map(()=>({ index:0, data:'' })) }; const id=addAnimation({ name, json, tags:['anim'] }); return { ok:true, id }; } }
  if (t.startsWith('export scene')){ return { ok:true, action:'export-scene' }; }
  return { ok:false, error:'Unrecognized prompt' };
}

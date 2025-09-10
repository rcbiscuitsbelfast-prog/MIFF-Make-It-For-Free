import { subscribe as gsSubscribe, getState as gsGetState } from '../state/game_state.js';

export function init(opts = {}){
  const s = gsGetState ? gsGetState() : { activeQuest: { title:'', description:'', status:'' } };
  return { state: { title: opts.title || 'Quest Log', entries: opts.entries || [], active: s.activeQuest }, el: null, style: opts.style || null, _unsub: null };
}

export function render(ctx, style){
  const root = document.createElement('div'); root.className='miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const s = style || ctx.style || {};
  if (s){ panel.style.fontFamily = s.fontFamily||''; panel.style.fontSize = s.fontSize||''; panel.style.color = s.color||''; panel.style.background = s.background||''; panel.style.borderRadius = s.borderRadius||''; panel.style.padding = s.padding||''; }
  const h = document.createElement('h3'); h.className='title'; h.textContent=ctx.state.title; panel.appendChild(h);
  const ul = document.createElement('ul'); ul.className='list';
  for (const e of ctx.state.entries){ const li = document.createElement('li'); li.textContent = e; ul.appendChild(li); }
  const active = document.createElement('div'); active.className='active-quest';
  function paintActive(){
    const a = ctx.state.active || { title:'', description:'', status:'' };
    active.innerHTML = `<div><strong>${a.title||''}</strong></div><div style="opacity:.8;font-size:12px">${a.description||''}</div><div style="opacity:.8;font-size:12px">${a.status||''}</div>`;
  }
  paintActive();
  panel.appendChild(ul);
  panel.appendChild(active);
  root.appendChild(panel);
  ctx.el=root;
  try { ctx._unsub = gsSubscribe((st)=>{ ctx.state.active = st.activeQuest || ctx.state.active; paintActive(); }); } catch {}
  return root;
}

export function update(ctx, data){ if (data?.entries){ ctx.state.entries = data.entries.slice(); const ul = ctx.el?.querySelector('.list'); if (ul){ ul.innerHTML = ''; for (const e of ctx.state.entries){ const li=document.createElement('li'); li.textContent=e; ul.appendChild(li);} } } }

export function destroy(ctx){ try { ctx._unsub && ctx._unsub(); } catch {} ctx._unsub=null; ctx.el?.remove?.(); ctx.el=null; }


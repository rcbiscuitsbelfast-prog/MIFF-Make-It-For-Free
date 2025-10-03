export function init(opts = {}){
  return { state: { speaker: opts.speaker || 'NPC', text: opts.text || '' }, el: null, style: opts.style || null };
}

export function render(ctx, style){
  const root = document.createElement('div'); root.className='miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const s = style || ctx.style || {};
  if (s){ panel.style.fontFamily = s.fontFamily||''; panel.style.fontSize = s.fontSize||''; panel.style.color = s.color||''; panel.style.background = s.background||''; panel.style.borderRadius = s.borderRadius||''; panel.style.padding = s.padding||''; }
  const h = document.createElement('h3'); h.className='title'; h.textContent=ctx.state.speaker; panel.appendChild(h);
  const p = document.createElement('p'); p.textContent = ctx.state.text; panel.appendChild(p);
  root.appendChild(panel); ctx.el = root; return root;
}

export function update(ctx, data){ if (data?.speaker){ const h=ctx.el?.querySelector('.title'); if (h) h.textContent=data.speaker; ctx.state.speaker=data.speaker; } if (data?.text!=null){ const p=ctx.el?.querySelector('p'); if (p) p.textContent=data.text; ctx.state.text=data.text; } }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


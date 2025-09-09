export function init(opts = {}){
  return { state: { title: opts.title || 'Main Menu', buttons: opts.buttons || [{ label:'Start', id:'start' }, { label:'Credits', id:'credits' }] }, el: null, onAction: opts.onAction || (()=>{}) };
}

export function render(ctx){
  const root = document.createElement('div');
  root.className = 'miff-ui overlay';
  const panel = document.createElement('div');
  panel.className = 'panel';
  const h = document.createElement('h3'); h.className = 'title'; h.textContent = ctx.state.title; panel.appendChild(h);
  const btnRow = document.createElement('div');
  for (const b of ctx.state.buttons){ const btn = document.createElement('button'); btn.className='btn'; btn.textContent=b.label; btn.onclick=()=>ctx.onAction(b.id); btnRow.appendChild(btn); }
  panel.appendChild(btnRow);
  root.appendChild(panel);
  ctx.el = root; return root;
}

export function update(ctx, data){ if (data?.title) { ctx.state.title = data.title; const h = ctx.el?.querySelector('.title'); if (h) h.textContent = data.title; } }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el = null; }


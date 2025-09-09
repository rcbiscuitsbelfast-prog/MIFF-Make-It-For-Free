export function init(opts = {}){
  return { state: { title: opts.title || 'Paused' }, el: null, onResume: opts.onResume || (()=>{}), onRestart: opts.onRestart || (()=>{}), style: opts.style || null };
}

export function render(ctx, style){
  const root = document.createElement('div'); root.className='miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const s = style || ctx.style || {};
  if (s){ panel.style.fontFamily = s.fontFamily||''; panel.style.fontSize = s.fontSize||''; panel.style.color = s.color||''; panel.style.background = s.background||''; panel.style.borderRadius = s.borderRadius||''; panel.style.padding = s.padding||''; }
  const h = document.createElement('h3'); h.className='title'; h.textContent=ctx.state.title; panel.appendChild(h);
  const row = document.createElement('div');
  const resume = document.createElement('button'); resume.className='btn'; resume.textContent='Resume'; resume.onclick=()=>ctx.onResume(); row.appendChild(resume);
  const restart = document.createElement('button'); restart.className='btn secondary'; restart.textContent='Restart'; restart.onclick=()=>ctx.onRestart(); row.appendChild(restart);
  panel.appendChild(row); root.appendChild(panel); ctx.el=root; return root;
}

export function update(ctx, data){ if (data?.title){ ctx.state.title = data.title; const h=ctx.el?.querySelector('.title'); if (h) h.textContent=data.title; } }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


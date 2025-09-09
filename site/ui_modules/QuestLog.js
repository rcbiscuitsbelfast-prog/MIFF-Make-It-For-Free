export function init(opts = {}){
  return { state: { title: opts.title || 'Quest Log', entries: opts.entries || [] }, el: null };
}

export function render(ctx){
  const root = document.createElement('div'); root.className='miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const h = document.createElement('h3'); h.className='title'; h.textContent=ctx.state.title; panel.appendChild(h);
  const ul = document.createElement('ul'); ul.className='list';
  for (const e of ctx.state.entries){ const li = document.createElement('li'); li.textContent = e; ul.appendChild(li); }
  panel.appendChild(ul); root.appendChild(panel); ctx.el=root; return root;
}

export function update(ctx, data){ if (data?.entries){ ctx.state.entries = data.entries.slice(); const ul = ctx.el?.querySelector('.list'); if (ul){ ul.innerHTML = ''; for (const e of ctx.state.entries){ const li=document.createElement('li'); li.textContent=e; ul.appendChild(li);} } } }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


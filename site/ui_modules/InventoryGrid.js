export function init(opts = {}){
  const size = opts.size || 12;
  return { state: { title: opts.title || 'Inventory', items: new Array(size).fill(null) }, el: null };
}

export function render(ctx){
  const root = document.createElement('div'); root.className='miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const h = document.createElement('h3'); h.className='title'; h.textContent=ctx.state.title; panel.appendChild(h);
  const grid = document.createElement('div'); grid.className='grid';
  for (let i=0;i<ctx.state.items.length;i++){ const cell=document.createElement('div'); cell.className='cell'; cell.textContent = ctx.state.items[i]?.label || ''; grid.appendChild(cell); }
  panel.appendChild(grid); root.appendChild(panel); ctx.el=root; return root;
}

export function update(ctx, data){ if (data?.items){ ctx.state.items = data.items.slice(); const cells = ctx.el?.querySelectorAll('.cell'); if (cells){ for (let i=0;i<cells.length;i++){ cells[i].textContent = ctx.state.items[i]?.label || ''; } } } }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


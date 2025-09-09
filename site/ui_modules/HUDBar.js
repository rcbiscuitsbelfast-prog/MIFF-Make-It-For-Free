export function init(opts = {}){
  return { state: { inputMode: opts.inputMode || 'Keyboard', info: opts.info || '' }, el: null };
}

export function render(ctx){
  const root = document.createElement('div'); root.className='miff-ui hud';
  const span = document.createElement('span'); span.textContent = `Input: ${ctx.state.inputMode}${ctx.state.info? ' | '+ctx.state.info : ''}`; root.appendChild(span);
  ctx.el = root; return root;
}

export function update(ctx, data){ if (data?.inputMode){ ctx.state.inputMode = data.inputMode; } if (data?.info!=null){ ctx.state.info = data.info; } const span=ctx.el?.querySelector('span'); if (span) span.textContent = `Input: ${ctx.state.inputMode}${ctx.state.info? ' | '+ctx.state.info : ''}`; }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


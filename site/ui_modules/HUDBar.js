export function init(opts = {}){
  return { state: { inputMode: opts.inputMode || 'Keyboard', info: opts.info || '' }, el: null, style: opts.style || null };
}

export function render(ctx, style){
  const root = document.createElement('div'); root.className='miff-ui hud';
  const s = style || ctx.style || {};
  if (s){ root.style.fontFamily = s.fontFamily||''; root.style.fontSize = s.fontSize||''; root.style.color = s.color||''; }
  const span = document.createElement('span'); span.textContent = `Input: ${ctx.state.inputMode}${ctx.state.info? ' | '+ctx.state.info : ''}`; root.appendChild(span);
  ctx.el = root; return root;
}

export function update(ctx, data){ if (data?.inputMode){ ctx.state.inputMode = data.inputMode; } if (data?.info!=null){ ctx.state.info = data.info; } const span=ctx.el?.querySelector('span'); if (span) span.textContent = `Input: ${ctx.state.inputMode}${ctx.state.info? ' | '+ctx.state.info : ''}`; }

export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


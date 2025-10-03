import { subscribe as gsSubscribe, getState as gsGetState } from '../state/game_state.js';

export function init(opts = {}){
  const s = gsGetState ? gsGetState() : { inputMode: opts.inputMode || 'Keyboard', progress: { value:0, total:0 } };
  return { 
    state: { inputMode: s.inputMode || opts.inputMode || 'Keyboard', info: opts.info || '', progress: s.progress || { value:0, total:0 } }, 
    el: null, 
    style: opts.style || null,
    _unsub: null
  };
}

export function render(ctx, style){
  const root = document.createElement('div'); root.className='miff-ui hud';
  const s = style || ctx.style || {};
  if (s){ root.style.fontFamily = s.fontFamily||''; root.style.fontSize = s.fontSize||''; root.style.color = s.color||''; }
  const line = document.createElement('div');
  const span = document.createElement('span');
  const meter = document.createElement('div'); meter.className = 'miff-meter';
  const bar = document.createElement('div'); bar.className = 'miff-meter-bar'; meter.appendChild(bar);
  line.appendChild(span);
  root.appendChild(line);
  root.appendChild(meter);
  ctx.el = root;
  // initial paint
  paint(ctx);
  // subscribe to game state
  try {
    ctx._unsub = gsSubscribe((st)=>{
      ctx.state.inputMode = st.inputMode || ctx.state.inputMode;
      ctx.state.progress = st.progress || ctx.state.progress;
      paint(ctx);
    });
  } catch {}
  return root;
}

export function update(ctx, data){ 
  if (data?.inputMode){ ctx.state.inputMode = data.inputMode; }
  if (data?.info!=null){ ctx.state.info = data.info; }
  if (data?.progress){ ctx.state.progress = data.progress; }
  paint(ctx);
}

export function destroy(ctx){ try { ctx._unsub && ctx._unsub(); } catch {} ctx._unsub=null; ctx.el?.remove?.(); ctx.el=null; }

function paint(ctx){
  const span=ctx.el?.querySelector('span');
  if (!span) return;
  const { value, total, label } = ctx.state.progress || { value:0, total:0, label:'' };
  const progText = total ? `Progress ${value}/${total}` : (label || '');
  span.textContent = `Input: ${ctx.state.inputMode}${ctx.state.info? ' | '+ctx.state.info : ''}${progText? ' | '+progText : ''}`;
  const bar = ctx.el?.querySelector('.miff-meter-bar');
  if (bar){ const pct = total>0 ? Math.max(0, Math.min(100, Math.round((value/total)*100))) : 0; bar.style.width = pct + '%'; }
}


import { UI_STYLES } from './style_presets.js';

export function init(opts = {}){
  // opts: { presets?: string[] | object[], initial?: string, children?: any, onChange?: fn, style?: object, _ui?: { setDefaultStyle, useModule, updateModule } }
  const presetKeys = (opts.presets && Array.isArray(opts.presets))
    ? opts.presets.map(p => (typeof p === 'string' ? p : p.key)).filter(Boolean)
    : Object.keys(UI_STYLES);
  const initialKey = opts.initial && presetKeys.includes(opts.initial) ? opts.initial : (localStorage.getItem('miff_ui_style') || presetKeys[0] || 'default');
  return { state: { presetKeys, current: initialKey }, el: null, children: opts.children || null, onChange: opts.onChange || null, style: opts.style || null, _ui: opts._ui };
}

export function render(ctx){
  const root = document.createElement('div');
  root.className = 'miff-ui overlay';
  const panel = document.createElement('div'); panel.className='panel';
  const h = document.createElement('h3'); h.className='title'; h.textContent='Choose UI Style'; panel.appendChild(h);
  const sel = document.createElement('select');
  for (const k of ctx.state.presetKeys){ const opt=document.createElement('option'); opt.value=k; opt.textContent=k; if (k===ctx.state.current) opt.selected=true; sel.appendChild(opt); }
  sel.onchange = () => applyStylePreset(ctx, sel.value);
  panel.appendChild(sel);
  root.appendChild(panel);
  ctx.el = root;
  // Apply initial
  applyStylePreset(ctx, ctx.state.current);
  // Optionally mount child component immediately beneath selector
  if (ctx.children && ctx._ui && ctx._ui.useModule){
    const childContainer = document.createElement('div'); childContainer.style.marginTop = '12px'; panel.appendChild(childContainer);
    // Create a temporary HUD target for wrapping demo (or IntroModal replacement)
    try { ctx._ui.useModule('HUD', ctx.children, { style: UI_STYLES[ctx.state.current] }); } catch {}
  }
  return root;
}

function applyStylePreset(ctx, key){
  ctx.state.current = key;
  localStorage.setItem('miff_ui_style', key);
  const preset = UI_STYLES[key] || UI_STYLES.default;
  try { ctx._ui && ctx._ui.setDefaultStyle && ctx._ui.setDefaultStyle(preset); } catch {}
  if (typeof ctx.onChange === 'function') ctx.onChange(key, preset);
}

export function update(){ /* no-op */ }
export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }


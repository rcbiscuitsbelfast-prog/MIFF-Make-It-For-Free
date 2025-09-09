import { UI_STYLES } from './style_presets.js';
import { setCurrentStyle, getCurrentKey } from './style_context.js';

export function init(opts = {}){
  // opts: { presets?: string[] | object[], initial?: string, children?: any, onChange?: fn, style?: object, _ui?: { setDefaultStyle, useModule, updateModule } }
  const presetKeys = (opts.presets && Array.isArray(opts.presets))
    ? opts.presets.map(p => (typeof p === 'string' ? p : p.key)).filter(Boolean)
    : Object.keys(UI_STYLES);
  const storageKey = (typeof localStorage!=='undefined' && localStorage.getItem('miff_ui_style')) || null;
  const initialKey = opts.initial && presetKeys.includes(opts.initial) ? opts.initial : (storageKey || getCurrentKey() || presetKeys[0] || 'default');
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
  try {
    setCurrentStyle(key);
    ctx._ui && ctx._ui.setDefaultStyle && ctx._ui.setDefaultStyle(preset);
  } catch {}
  if (typeof ctx.onChange === 'function') ctx.onChange(key, preset);
}

export function update(){ /* no-op */ }
export function destroy(ctx){ ctx.el?.remove?.(); ctx.el=null; }

// Component wrapping: returns a composite module that shows StyleSelector and renders the child
export function wrap(childrenModule, presets){
  return {
    init(opts = {}){
      const presetKeys = (presets && Array.isArray(presets))
        ? presets.map(p => (typeof p === 'string' ? p : p.key)).filter(Boolean)
        : Object.keys(UI_STYLES);
      const storageKey = (typeof localStorage!=='undefined' && localStorage.getItem('miff_ui_style')) || null;
      const initialKey = storageKey || presetKeys[0] || 'default';
      return { state: { presetKeys, current: initialKey }, el: null, child: { mod: childrenModule, ctx: null, node: null }, _ui: opts._ui };
    },
    render(ctx){
      const root = document.createElement('div'); root.className = 'miff-ui overlay';
      const panel = document.createElement('div'); panel.className='panel';
      const h = document.createElement('h3'); h.className='title'; h.textContent='Choose UI Style'; panel.appendChild(h);
      const sel = document.createElement('select');
      for (const k of ctx.state.presetKeys){ const opt=document.createElement('option'); opt.value=k; opt.textContent=k; if (k===ctx.state.current) opt.selected=true; sel.appendChild(opt); }
      sel.onchange = () => { setCurrentStyle(sel.value); ctx._ui && ctx._ui.setDefaultStyle && ctx._ui.setDefaultStyle(UI_STYLES[sel.value]||UI_STYLES.default); // also re-render child inside wrapper
        if (ctx.child.node){ try{ ctx.child.mod.destroy?.(ctx.child.ctx); }catch{} ctx.child.node.remove(); ctx.child.node=null; }
        const cctx = ctx.child.mod.init?.({ style: UI_STYLES[sel.value]||UI_STYLES.default, _ui: ctx._ui });
        const cnode = ctx.child.mod.render?.(cctx, UI_STYLES[sel.value]||UI_STYLES.default);
        if (cnode){ childMount.appendChild(cnode); ctx.child.ctx=cctx; ctx.child.node=cnode; }
      };
      panel.appendChild(sel);
      const childMount = document.createElement('div'); childMount.style.marginTop = '12px'; panel.appendChild(childMount);
      // initial child render
      const s = UI_STYLES[ctx.state.current] || UI_STYLES.default;
      const cctx = ctx.child.mod.init?.({ style: s, _ui: ctx._ui });
      const cnode = ctx.child.mod.render?.(cctx, s);
      if (cnode){ childMount.appendChild(cnode); ctx.child.ctx=cctx; ctx.child.node=cnode; }
      root.appendChild(panel); ctx.el=root; return root;
    },
    update(){},
    destroy(ctx){ try { if (ctx?.child?.mod && ctx.child.ctx) ctx.child.mod.destroy?.(ctx.child.ctx); } catch {} ctx.el?.remove?.(); ctx.el=null; }
  };
}


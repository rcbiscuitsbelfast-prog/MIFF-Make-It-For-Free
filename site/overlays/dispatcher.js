// MIFF Shared Overlay Dispatcher
// Consumes a minimal UI orchestration spec to show IntroModal, PlayHUD, GameOverModal, LoreModal

export function createOverlayDispatcher(rootEl) {
  const state = { nodes: {}, modules: {}, inputMode: 'Keyboard', style: null };
  function el(tag, className, html){ const e=document.createElement(tag); if (className) e.className=className; if (html) e.innerHTML=html; return e; }
  function attach(node){ rootEl.appendChild(node); return node; }
  function ensureUIStyles(){ if (document.getElementById('miff-ui-styles')) return; const link=document.createElement('link'); link.id='miff-ui-styles'; link.rel='stylesheet'; link.href='../../ui_modules/style.css'; document.head.appendChild(link); }
  function applyStyle(node, style){ if (!node || !style) return; node.style.fontFamily = style.fontFamily || node.style.fontFamily; node.style.fontSize = style.fontSize || node.style.fontSize; node.style.color = style.color || node.style.color; node.style.background = style.background || node.style.background; node.style.borderRadius = style.borderRadius || node.style.borderRadius; node.style.padding = style.padding || node.style.padding; }
  function mountInto(container, mod, opts){ try { ensureUIStyles(); const enhancedOpts = { ...(opts||{}), _ui: { setDefaultStyle, useModule, updateModule } }; const ctx = mod.init?.(enhancedOpts); const node = mod.render?.(ctx, enhancedOpts?.style || state.style); if (node){ node.classList?.add('miff-ui-mounted'); applyStyle(node, enhancedOpts?.style || state.style); container.appendChild(node); } return { ctx, mod, node, opts: enhancedOpts }; } catch (e){ console.error('[Dispatcher] Failed to mount UI module:', e); return null; } }
  function unmountModule(target){ const m = state.modules[target]; if (!m) return; try { m.mod.destroy?.(m.ctx); } catch {} if (m.node?.remove) m.node.remove(); delete state.modules[target]; }
  function containerFor(target){ if (target==='IntroModal') return document.getElementById('miffIntro'); if (target==='LoreModal') return document.getElementById('miffLore'); if (target==='GameOverModal') return document.getElementById('miffGameOver'); if (target==='HUD') return rootEl; return null; }
  function useModule(target, mod, opts){
    if (target==='IntroModal' && !document.getElementById('miffIntro')) showIntro(opts && opts.introFallback || {});
    if (target==='LoreModal' && !document.getElementById('miffLore')) showLore(opts && opts.loreFallback || {});
    if (target==='GameOverModal' && !document.getElementById('miffGameOver')) showGameOver(opts && opts.gameOverFallback || {});
    const container = containerFor(target) || rootEl;
    unmountModule(target);
    const mounted = mountInto(container, mod, opts);
    if (mounted) state.modules[target] = mounted;
  }
  function updateModule(target, data){ const m = state.modules[target]; if (!m) return; try { if (data && data.style && m.node) applyStyle(m.node, data.style); m.mod.update?.(m.ctx, data); } catch(e){ console.warn('[Dispatcher] update failed:', e); } }
  function setInputMode(mode){ state.inputMode = mode; updateModule('HUD', { inputMode: mode }); }
  function setDefaultStyle(style){ state.style = style || state.style; // re-render all modules to apply new style thoroughly
    Object.keys(state.modules).forEach(key => { const m = state.modules[key]; if (!m) return; const target = key; const container = containerFor(target) || rootEl; try { const prev = state.modules[target]; if (prev){ try{ prev.mod.destroy?.(prev.ctx); }catch{} if (prev.node?.remove) prev.node.remove(); }
      const remounted = mountInto(container, m.mod, { ...(m.opts||{}), style: state.style }); state.modules[target] = remounted; } catch(e){ console.warn('[Dispatcher] remount failed for', key, e); } }); }

  function showIntro(opts){
    if (state.nodes.intro) state.nodes.intro.remove();
    const box = el('div', 'miff-overlay miff-tile-bg miff-fade-in');
    box.id='miffIntro';
    box.appendChild(el('h3', '', opts?.title || 'Welcome'));
    box.appendChild(el('p', '', opts?.message || 'Press Start to begin.'));
    if (opts?.variants && Array.isArray(opts.variants) && opts.variants.length){
      const label = el('div','', '<strong>Character:</strong>');
      const sel = el('select','', '');
      sel.style.margin = '6px 0 10px 0';
      for (const v of opts.variants){ const o=document.createElement('option'); o.value=v.value; o.textContent=v.label; sel.appendChild(o); }
      sel.onchange = ()=>{ opts.onVariantChange && opts.onVariantChange(sel.value); };
      box.appendChild(label); box.appendChild(sel);
    }
    const row = el('div','');
    const start = el('button', 'miff-btn', 'Start');
    start.onclick = ()=>{ hide('intro'); opts?.onStart && opts.onStart(); };
    const credits = el('button', 'miff-btn secondary', 'Credits');
    credits.onclick = ()=>{ showLore(opts?.lore || { title:'Credits', text:'KayKit/CC0 assets. MIFF Framework.' }); };
    const remix = el('a','miff-btn secondary','Remix');
    remix.href = '../../contrib/remix-packs/README.md';
    row.appendChild(start);
    row.appendChild(credits);
    row.appendChild(remix);
    box.appendChild(row);
    state.nodes.intro = attach(box);
  }

  function showHUD(opts){
    if (state.nodes.hud) state.nodes.hud.remove();
    const hud = el('div','', '');
    hud.id='miffHUD';
    hud.style.position='absolute'; hud.style.left='10px'; hud.style.bottom='8px'; hud.style.color='#d0d7de'; hud.style.fontSize='14px';
    const row = el('div','');
    const parts=[];
    if (opts?.progress != null) parts.push(`Progress: ${opts.progress}`);
    if (opts?.inventory) parts.push(`Inventory: ${(opts.inventory||[]).join(', ')||'(empty)'}`);
    if (opts?.inputMode) parts.push(`Input: ${opts.inputMode}`);
    if (opts?.loadingText) parts.push(opts.loadingText);
    const span = el('span','', parts.join('  |  '));
    row.appendChild(span);
    if (opts?.fullscreenToggle){
      const btn = el('button','miff-btn','Fullscreen');
      btn.style.marginLeft = '10px';
      btn.onclick = ()=>{ if (window.__miffToggleFullscreen) window.__miffToggleFullscreen(); };
      row.appendChild(btn);
    }
    hud.appendChild(row);
    state.nodes.hud = attach(hud);
    updateModule('HUD', { inputMode: opts?.inputMode, info: opts?.progress!=null? `Progress ${opts.progress}` : undefined });
    if (!state._hudLogged){ console.log('[UI] HUDBar rendered'); state._hudLogged = true; }
    try { console.log('[UI] Overlay z-index:', hud.style.zIndex || '(none)'); } catch {}
  }

  function showGameOver(opts){
    if (state.nodes.gameover) state.nodes.gameover.remove();
    const box = el('div', 'miff-overlay miff-tile-bg miff-fade-in');
    box.id='miffGameOver';
    box.appendChild(el('h3','', opts?.title || 'Game Over'));
    box.appendChild(el('p','', opts?.message || 'Try again or remix.'));
    const row = el('div','');
    const restart = el('button','miff-btn','Restart');
    restart.onclick = ()=>{ hide('gameover'); opts?.onRestart && opts.onRestart(); };
    row.appendChild(restart);
    if (opts?.links && Array.isArray(opts.links)){
      opts.links.forEach(link => { const linkEl = el('a','miff-btn secondary', link.label); linkEl.href = link.href; linkEl.target = '_blank'; row.appendChild(linkEl); });
    } else {
      const remix = el('a','miff-btn secondary','Remix Packs'); remix.href='../../contrib/remix-packs/README.md'; row.appendChild(remix);
    }
    box.appendChild(row);
    state.nodes.gameover = attach(box);
  }

  function showLore(opts){
    if (state.nodes.lore) state.nodes.lore.remove();
    const box = el('div','miff-overlay miff-tile-bg miff-fade-in');
    box.id='miffLore';
    box.appendChild(el('h3','', opts?.title || 'Lore'));
    box.appendChild(el('p','', opts?.text || ''));
    const close = el('button','miff-btn','Close');
    close.onclick = ()=> hide('lore');
    box.appendChild(close);
    state.nodes.lore = attach(box);
  }

  function hide(kind){ const id = kind==='intro'?'miffIntro' : kind==='hud'?'miffHUD' : kind==='gameover'?'miffGameOver':'miffLore'; const n = document.getElementById(id); if (n) n.remove(); state.nodes[kind]=null; }

  console.log('[UI] Overlay DOM attached');
  return { showIntro, showHUD, showGameOver, showLore, hide, useModule, updateModule, setInputMode, setDefaultStyle };
}
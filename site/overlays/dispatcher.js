// MIFF Shared Overlay Dispatcher
// Consumes a minimal UI orchestration spec to show IntroModal, PlayHUD, GameOverModal, LoreModal

export function createOverlayDispatcher(rootEl) {
  const state = { nodes: {} };
  function el(tag, className, html){ const e=document.createElement(tag); if (className) e.className=className; if (html) e.innerHTML=html; return e; }
  function attach(node){ rootEl.appendChild(node); return node; }

  function showIntro(opts){
    if (state.nodes.intro) state.nodes.intro.remove();
    const box = el('div', 'miff-overlay miff-tile-bg miff-fade-in');
    box.id='miffIntro';
    box.appendChild(el('h3', '', opts?.title || 'Welcome'));
    box.appendChild(el('p', '', opts?.message || 'Press Start to begin.'));
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
    hud.innerHTML = `Progress: ${opts?.progress ?? 0}  |  Inventory: ${(opts?.inventory||[]).join(', ')||'(empty)'}  |  Input: ${opts?.inputMode||'Keyboard'}`;
    state.nodes.hud = attach(hud);
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
    const remix = el('a','miff-btn secondary','Remix Packs');
    remix.href='../../contrib/remix-packs/README.md';
    row.appendChild(restart); row.appendChild(remix);
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

  return { showIntro, showHUD, showGameOver, showLore, hide };
}
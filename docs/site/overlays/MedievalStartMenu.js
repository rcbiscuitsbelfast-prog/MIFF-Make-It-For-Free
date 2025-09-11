// MIFF Medieval Start Menu (simple, zone-agnostic)
export function injectMedievalMenu(zoneName){
  const existing = document.querySelector('.start-menu.medieval');
  if (existing) return;
  const menu = document.createElement('div');
  menu.className = 'start-menu medieval';
  menu.innerHTML = `
    <h1>${zoneName}</h1>
    <div class="buttons">
      <button id="start-btn">Begin Quest</button>
      <button id="load-btn">Load Game</button>
      <button id="options-btn">Options</button>
      <button id="tutorial-btn">How to Play</button>
      <button id="remix-btn">Remix This</button>
    </div>
  `;
  document.body.appendChild(menu);
  const start = document.getElementById('start-btn');
  const load = document.getElementById('load-btn');
  const options = document.getElementById('options-btn');
  const remix = document.getElementById('remix-btn');
  if (start) start.onclick = async () => { try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'new' } })); } catch {} try { const el=document.documentElement; if (!document.fullscreenElement){ await (el.requestFullscreen?.()); setTimeout(()=>{ try { document.dispatchEvent(new Event('fullscreenchange')); } catch {} }, 50); } } catch {} try { window.miffOverlay && window.miffOverlay.cleanup && window.miffOverlay.cleanup(); } catch {} menu.remove(); console.log('[StartMenu] Game started'); };
  if (load) load.onclick = () => { try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'load' } })); console.log('[Menu] load requested'); } catch {} };
  if (options) options.onclick = () => { try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'options' } })); console.log('[Menu] options requested'); } catch {} };
  const repo = 'https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free';
  if (remix) remix.onclick = () => window.open(repo, '_blank');
  try { console.log('[Layout] medieval menu scaled for mobile'); } catch {}
}
try { window.injectMedievalMenu = injectMedievalMenu; } catch {}


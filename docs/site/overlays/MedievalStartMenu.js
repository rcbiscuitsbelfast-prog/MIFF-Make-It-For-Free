// MIFF Medieval Start Menu (simple, zone-agnostic)
export function injectMedievalMenu(zoneName){
  const existing = document.querySelector('.start-menu.medieval');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.className = 'start-menu medieval';
  menu.innerHTML = `
    <h1>${zoneName}</h1>
    <div class="buttons">
      <button id="start-btn">Begin Quest</button>
      <button id="tutorial-btn">How to Play</button>
      <button id="remix-btn">Remix This</button>
    </div>
  `;
  document.body.appendChild(menu);
  const start = document.getElementById('start-btn');
  const remix = document.getElementById('remix-btn');
  if (start) start.onclick = () => { try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'new' } })); } catch {} menu.remove(); console.log('[StartMenu] Game started'); };
  const repo = 'https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free';
  if (remix) remix.onclick = () => window.open(repo, '_blank');
}
try { window.injectMedievalMenu = injectMedievalMenu; } catch {}


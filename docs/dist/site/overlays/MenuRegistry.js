// MIFF Menu Registry — maps zones to menu themes and provides safe injection
import { injectMedievalMenu } from './MedievalStartMenu.js';

const MenuRegistry = {
  spirit: 'medieval',
  toppler: 'medieval',
  grove: 'medieval',
  arcade: 'neon'
};

export function getMenuType(zone){
  return MenuRegistry[zone] || 'neon';
}

export function injectMenu(menuType, zoneName){
  try { if (window.miffOverlay && window.miffOverlay.cleanup) { window.miffOverlay.cleanup(); console.log('[Overlay] cleaned up'); } } catch {}
  if (document.querySelector('.start-menu')) return;
  try {
    if (menuType === 'medieval') {
      injectMedievalMenu(zoneName);
      console.log('[Menu] medieval injected for', zoneName);
      return;
    }
    // Fallback: build a minimal generic start menu
    const menu = document.createElement('div');
    menu.className = 'start-menu theme-modern';
    const inner = document.createElement('div');
    inner.className = 'start-menu-inner';
    inner.innerHTML = `<div class="start-title">${zoneName||'Start'}</div>
      <div class="start-actions"><button class="start-btn primary" id="start-generic">Start</button></div>`;
    menu.appendChild(inner);
    document.body.appendChild(menu);
    const btn = document.getElementById('start-generic');
    btn && (btn.onclick = () => { menu.remove(); document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'new' } })); });
    console.log('[Menu] generic injected for', zoneName);
  } catch (e) { console.warn('[Menu] injection failed', e); }
}

try { window.miffMenuRegistry = { getMenuType, injectMenu }; } catch {}


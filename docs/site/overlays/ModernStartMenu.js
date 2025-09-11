// MIFF Modern Start Menu (sleek + cute)
export function injectModernMenu(zoneName){
  const existing = document.querySelector('.start-menu.modern');
  if (existing) return;
  const menu = document.createElement('div');
  menu.className = 'start-menu modern';
  menu.innerHTML = `
    <div class="modern-card">
      <h1>${zoneName}</h1>
      <p class="tag">Made by MIFF</p>
      <div class="buttons">
        <button id="modern-start">Start</button>
        <button id="modern-options">Options</button>
        <button id="modern-credits">Credits</button>
      </div>
    </div>
  `;
  document.body.appendChild(menu);
  const start = document.getElementById('modern-start');
  const options = document.getElementById('modern-options');
  const credits = document.getElementById('modern-credits');
  if (start) start.onclick = async () => { try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action: 'new' } })); } catch {} try { const el=document.documentElement; if (!document.fullscreenElement){ await (el.requestFullscreen?.()); setTimeout(()=>{ try { document.dispatchEvent(new Event('fullscreenchange')); } catch {} }, 50); } } catch {} try { window.miffOverlay?.cleanup?.(); } catch {} menu.remove(); };
  if (options) options.onclick = () => {
    const html = `<h2>Options</h2><p><label><input type='checkbox' id='opt-audio'/> Audio</label></p>`;
    try { window.miffOverlay?.show?.('options', html); } catch {}
    setTimeout(()=>{
      const cb = document.getElementById('opt-audio');
      if (cb) { cb.checked = !document.miffAudioMuted; cb.onchange = ()=>{ document.miffAudioMuted = !cb.checked; }; }
    }, 0);
  };
  if (credits) credits.onclick = () => { try { window.miffOverlay?.show?.('credits', `<h2>Credits</h2><p>MIFF Framework · CC0 assets</p>`); } catch {} };
}
try { window.injectModernMenu = injectModernMenu; } catch {}


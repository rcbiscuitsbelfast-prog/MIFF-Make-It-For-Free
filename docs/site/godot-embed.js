export function embedGodot({ zone, path }){
  const container = document.getElementById('gameContainer') || document.body;
  // Clear existing
  try { while (container.firstChild) container.removeChild(container.firstChild); } catch {}
  // Iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'godot-frame';
  iframe.src = path;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  Object.assign(iframe.style, { position: 'absolute', inset: '0', width: '100vw', height: '100vh', border: 'none' });
  container.appendChild(iframe);
  // Remix bar
  const bar = document.createElement('div');
  bar.className = 'remix-bar';
  bar.innerHTML = `<button>Remix This</button>`;
  Object.assign(bar.style, { position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '8px', zIndex: '1000' });
  bar.querySelector('button').onclick = () => window.open('https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free','_blank');
  container.appendChild(bar);
  // Fullscreen on tap
  bar.querySelector('button').insertAdjacentHTML('afterend', ' <button id="fs-btn">Fullscreen</button>');
  const fsBtn = document.getElementById('fs-btn');
  fsBtn.onclick = async () => { try { const el=document.documentElement; if (!document.fullscreenElement){ await (el.requestFullscreen?.()); } else { await (document.exitFullscreen?.()); } } catch {} };
  // HUD hydration listener (in case OverlayManager not loaded yet)
  try {
    window.addEventListener('message', (event) => {
      if (event && event.data && event.data.type === 'godot-ready'){
        try { window.miffOverlay && window.miffOverlay.showHUD && window.miffOverlay.showHUD(event.data.zone || zone || 'zone'); } catch {}
      }
    });
  } catch {}
  // Basic load/error feedback
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;top:0.5rem;left:0.5rem;z-index:1000;background:rgba(0,0,0,0.5);color:#fff;padding:4px 8px;border-radius:6px;font:12px system-ui';
  status.textContent = 'Loading Godot…';
  container.appendChild(status);
  iframe.addEventListener('load', ()=>{ status.textContent = 'Godot loaded'; setTimeout(()=>status.remove(), 1000); });
  iframe.addEventListener('error', ()=>{ status.textContent = 'Failed to load Godot'; });
}


// MIFF Persistent Overlay Manager
// window.miffOverlay.show(name, htmlString|Node) & .remove(name)

const __miffOverlays = {};

export function showOverlay(name, content){
  try { if (__miffOverlays[name]) { __miffOverlays[name].remove(); delete __miffOverlays[name]; } } catch {}
  const div = document.createElement('div');
  div.className = 'overlay';
  if (typeof content === 'string') div.innerHTML = content;
  else if (content instanceof Node) div.appendChild(content);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => removeOverlay(name);
  div.appendChild(closeBtn);

  document.body.appendChild(div);
  __miffOverlays[name] = div;
  try { console.log('[Overlay] ' + name + ' shown'); } catch {}
}

export function showHUD(zone){
  const html = `<div class="overlay"><h2>${zone} HUD</h2><p>Overlay hydrated.</p><button class="close" onclick="window.miffOverlay.remove('hud')">Close</button></div>`;
  showOverlay('hud', html);
}

export function removeOverlay(name){
  const el = __miffOverlays[name];
  if (el && el.remove) el.remove();
  delete __miffOverlays[name];
  try { console.log('[Overlay] ' + name + ' removed'); } catch {}
}

// Global helper
export function cleanup(){
  try { Object.keys(__miffOverlays).forEach(k=>{ try{ __miffOverlays[k].remove?.(); }catch{} delete __miffOverlays[k]; }); console.log('[Overlay] cleaned up'); } catch {}
}

try { window.miffOverlay = { show: showOverlay, remove: removeOverlay, cleanup, showHUD }; } catch {}

// Listen for Godot ready events
try {
  window.addEventListener('message', (event) => {
    const allowed = [location.origin].filter(Boolean);
    if (allowed.length && event.origin && !allowed.includes(event.origin)) return;
    if (event && event.data && event.data.type === 'godot-ready'){
      try { showHUD(event.data.zone || 'zone'); console.log(`[Overlay] HUD hydrated for ${event.data.zone||'zone'}`); parent?.postMessage?.({ type:'scene-hydrated', zone: event.data.zone||'zone' }, '*'); } catch {}
    }
  });
} catch {}


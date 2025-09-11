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

export function removeOverlay(name){
  const el = __miffOverlays[name];
  if (el && el.remove) el.remove();
  delete __miffOverlays[name];
  try { console.log('[Overlay] ' + name + ' removed'); } catch {}
}

// Global helper
try { window.miffOverlay = { show: showOverlay, remove: removeOverlay }; } catch {}


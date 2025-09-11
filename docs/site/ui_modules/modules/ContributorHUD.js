// Contributor HUD — shows FPS, input mode, and zone
export function init(opts){
  return { fps: 0, last: 0, input: (opts && opts.inputMode) || 'Keyboard', zone: (opts && opts.zone) || '', style: (opts && opts.style) || null };
}
export function render(ctx, style){
  const el = document.createElement('div');
  el.className = 'miff-ui miff-contrib-hud panel';
  el.style.position = 'absolute';
  el.style.right = '10px';
  el.style.bottom = '60px';
  el.style.minWidth = '200px';
  el.innerHTML = `
    <div class="title">Contributor HUD</div>
    <div class="row"><strong>Zone</strong>: <span data-f="zone">-</span></div>
    <div class="row"><strong>Input</strong>: <span data-f="input">-</span></div>
    <div class="row"><strong>FPS</strong>: <span data-f="fps">-</span></div>
  `;
  return el;
}
export function update(state, data){
  try {
    const root = document.querySelector('.miff-contrib-hud');
    if (!root) return;
    if (data && data.inputMode) state.input = data.inputMode;
    if (data && data.zone) state.zone = data.zone;
    const fpsNode = root.querySelector('[data-f="fps"]');
    const inputNode = root.querySelector('[data-f="input"]');
    const zoneNode = root.querySelector('[data-f="zone"]');
    if (fpsNode && typeof data?.fps === 'number') fpsNode.textContent = String(Math.round(data.fps));
    if (inputNode) inputNode.textContent = state.input;
    if (zoneNode) zoneNode.textContent = state.zone || document.body.getAttribute('data-zone') || '';
  } catch {}
}
export function destroy(){
  try { document.querySelectorAll('.miff-contrib-hud').forEach(n=>n.remove()); } catch {}
}


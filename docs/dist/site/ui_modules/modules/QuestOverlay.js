// Quest Overlay — persistent quest panel
export function init(opts){ return { title: (opts && opts.title) || 'Quest', lines: (opts && opts.lines) || [] }; }
export function render(ctx){
  const el = document.createElement('div');
  el.className = 'miff-ui miff-quest panel';
  el.style.position = 'absolute';
  el.style.left = '10px';
  el.style.top = '10px';
  el.style.maxWidth = '280px';
  el.innerHTML = `
    <div class="title">${ctx.title}</div>
    <ul class="list" data-f="list"></ul>
  `;
  const list = el.querySelector('[data-f="list"]');
  ctx.lines.forEach(line => { const li=document.createElement('li'); li.textContent = line; list.appendChild(li); });
  return el;
}
export function update(ctx, data){
  if (!data) return;
  const root = document.querySelector('.miff-quest');
  if (!root) return;
  if (Array.isArray(data.lines)){
    const list = root.querySelector('[data-f="list"]');
    if (list){ list.innerHTML = ''; data.lines.forEach(line => { const li=document.createElement('li'); li.textContent = line; list.appendChild(li); }); }
  }
}
export function destroy(){ try { document.querySelectorAll('.miff-quest').forEach(n=>n.remove()); } catch {} }


// Remix Badge — persistent corner badge with Remix link
export function init(opts){ return { url: (opts && opts.url) || 'https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free' }; }
export function render(ctx){
  const el = document.createElement('a');
  el.className = 'miff-ui miff-remix-badge';
  el.href = ctx.url; el.target = '_blank';
  el.style.position = 'absolute';
  el.style.right = '10px';
  el.style.top = '10px';
  el.style.zIndex = '10001';
  el.style.textDecoration = 'none';
  el.innerHTML = '<span class="badge">Remix</span>';
  return el;
}
export function update(){ }
export function destroy(){ try { document.querySelectorAll('.miff-remix-badge').forEach(n=>n.remove()); } catch {} }


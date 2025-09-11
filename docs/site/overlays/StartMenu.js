// MIFF Neon Arcade Start Menu (mobile-optimized)
// Exposes: window.miffShowStartMenu(options)

function ensureArcadeFonts(){
  try {
    if (!document.getElementById('miff-arcade-fonts')){
      const link = document.createElement('link');
      link.id = 'miff-arcade-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Cinzel:wght@600&display=swap';
      document.head.appendChild(link);
    }
  } catch {}
}

export function showStartMenu(opts){
  const options = opts || {};
  const themeClass = options.themeClass || 'theme-sci-fi';
  const title = options.title || 'NEON ARCADE';
  const subtitle = options.subtitle || 'Tap to Begin';

  ensureArcadeFonts();

  // Remove existing
  if (window.MIFF_DISABLE_ARCADE_UI) return;
  const existing = document.querySelector('.start-menu');
  if (existing) return;

  const menu = document.createElement('div');
  menu.className = `start-menu ${themeClass}`;
  menu.innerHTML = `
    <div class="start-menu-inner">
      <div class="start-title">${title}</div>
      <div class="start-subtitle">${subtitle}</div>
      <div class="start-actions">
        <button class="start-btn primary" data-action="new">NEW GAME</button>
        <button class="start-btn" data-action="load">LOAD GAME</button>
        <button class="start-btn" data-action="tutorial">TUTORIAL</button>
        <button class="start-btn remix" data-action="remix">REMIX THIS</button>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  // Zone-specific theme class injection on <body>
  try {
    const zonePage = (window.location.pathname.split('/').pop() || '').replace('.html','');
    if (zonePage){ document.body.classList.add(`theme-${zonePage}`); }
  } catch {}

  const handle = async (action) => {
    try { document.dispatchEvent(new CustomEvent('miff:start-menu:action', { detail: { action } })); } catch {}
    if (typeof options.onAction === 'function') options.onAction(action);
    if (action === 'new') {
      try { const el = document.documentElement; if (!document.fullscreenElement){ await (el.requestFullscreen?.()); setTimeout(()=>{ try { document.dispatchEvent(new Event('fullscreenchange')); } catch {} }, 50); } } catch {}
      if (typeof options.onStart === 'function') options.onStart();
      menu.remove();
      return;
    }
    if (action === 'remix'){
      const url = options.remixUrl || 'https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free';
      try { window.open(url, '_blank'); } catch {}
      return;
    }
  };

  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    handle(btn.getAttribute('data-action'));
  });

  // Accessibility: enter/space triggers NEW GAME
  menu.tabIndex = 0;
  menu.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); handle('new'); }
  });
}

// Global helper
try { window.miffShowStartMenu = showStartMenu; } catch {}


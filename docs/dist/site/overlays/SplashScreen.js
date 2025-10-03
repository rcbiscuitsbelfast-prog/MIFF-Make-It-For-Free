// MIFF Neon Arcade Splash Screen (mobile-optimized)
// Exposes: window.miffShowSplash(options), window.miffStartSequence(options)

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

function showSplashInternal(opts){
  const options = opts || {};
  const duration = typeof options.duration === 'number' ? options.duration : 2000;
  const title = options.title || 'ARCADE';
  const subtitle = options.subtitle || '';
  const themeClass = options.themeClass || 'theme-sci-fi';

  ensureArcadeFonts();

  // Prevent duplicate splash
  const existing = document.querySelector('.splash-screen');
  if (existing) existing.remove();

  const splash = document.createElement('div');
  splash.className = `splash-screen ${themeClass}`;
  splash.setAttribute('role', 'dialog');
  splash.setAttribute('aria-live', 'polite');
  splash.innerHTML = `
    <div class="splash-content">
      <h1 class="splash-title">${title}</h1>
      ${subtitle ? `<div class="splash-subtitle">${subtitle}</div>` : ''}
    </div>
  `;
  document.body.appendChild(splash);

  try { document.dispatchEvent(new CustomEvent('miff:splash:shown', { detail: { title } })); } catch {}

  const done = () => {
    try { document.dispatchEvent(new CustomEvent('miff:splash:dismissed', { detail: { title } })); } catch {}
    splash.remove();
    if (typeof options.onDone === 'function') {
      options.onDone();
    } else if (typeof window.miffShowStartMenu === 'function' && !window.MIFF_DISABLE_ARCADE_UI) {
      window.miffShowStartMenu(options.startMenu || {});
    } else {
      try { document.dispatchEvent(new CustomEvent('miff:show-start-menu')); } catch {}
    }
  };

  if (duration > 0) setTimeout(done, duration);
  else done();
}

export function showSplash(options){
  showSplashInternal(options);
}

export function startSequence(options){
  showSplashInternal(options);
}

// Global helpers for zones/HTML
try {
  window.miffShowSplash = showSplash;
  window.miffStartSequence = startSequence;
} catch {}


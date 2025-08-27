// Standalone Toppler loader
// Exposes mountToppler() and auto-mounts when DOM is ready

export async function mountToppler() {
  // Lazy import the module which mounts into #app
  await import('./dist/index.js');
}

if (typeof window !== 'undefined') {
  // @ts-ignore - expose for remixers
  window.mountToppler = mountToppler;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const app = document.getElementById('app');
        if (app) {
          const s = getComputedStyle(app);
          console.log('[Toppler Debug] #app styles', { width: s.width, height: s.height, display: s.display });
        }
      } catch {}
      mountToppler();
    });
  } else {
    mountToppler();
  }
}

// Standalone loader for Toppler
// Provides mountToppler() for external embedding without Sampler

window.mountToppler = function mountToppler() {
  let app = document.getElementById('app');
  if (!app) {
    app = document.createElement('div');
    app.id = 'app';
    app.style.width = '360px';
    app.style.height = '640px';
    app.style.margin = '24px auto';
    app.style.border = '1px solid #333';
    document.body.appendChild(app);
  }

  // If the Toppler module has already mounted, nothing to do
  if (window.TopplerStandalone && window.TopplerStandalone.scene) return;

  // Otherwise, wait until the module bootstraps itself
  const start = Date.now();
  const timeoutMs = 5000;
  (function waitForScene() {
    if (window.TopplerStandalone && window.TopplerStandalone.scene) return;
    if (Date.now() - start > timeoutMs) {
      console.warn('[Toppler] Scene not initialized yet. Ensure dist/index.js is included as a module.');
      return;
    }
    requestAnimationFrame(waitForScene);
  })();
};


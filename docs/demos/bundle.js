// Bundled Toppler Game - All dependencies included
// This avoids dynamic import issues on mobile/local servers

console.log('[Bundle] Bundle script executing...');

var TopplerBundle = (() => {
  // ResourceLoader
  function loadResources(manifest) {
    const entries = Object.entries(manifest);
    return new Promise((resolve) => {
      const out = {};
      let pending = entries.length;
      if (pending === 0) return resolve(out);
      for (const [key, src] of entries) {
        const img = new Image();
        img.onload = () => { 
          out[key] = img; 
          if (--pending === 0) resolve(out); 
        };
        img.onerror = () => {
          // Resolve with a 1x1 transparent pixel to avoid hard failures
          const fallback = new Image();
          fallback.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
          out[key] = fallback;
          if (--pending === 0) resolve(out);
        };
        img.src = src;
      }
    });
  }

  // GameBootstrap
  function createGameLauncher(options) {
    const { scene, containerId, cssPath, autostart = false, onStart, onLoop, onStop } = options;
    let canvas = null;
    let rafId = null;
    let lastTs = 0;

    function ensureContainer() {
      const container = document.getElementById(containerId);
      if (!container) throw new Error(`#${containerId} container missing`);
      return container;
    }

    function ensureCanvas(container) {
      console.log('[GameBootstrap Debug] Ensuring canvas in container:', container.id);
      let c = container.querySelector('canvas');
      if (!c) {
        console.log('[GameBootstrap Debug] Creating new canvas element');
        c = document.createElement('canvas');
        c.id = 'game-canvas';
        container.appendChild(c);
        console.log('[GameBootstrap Debug] Canvas appended to container');
      } else {
        console.log('[GameBootstrap Debug] Found existing canvas');
      }
      // Use scene config dimensions instead of getSize method
      const size = { width: scene.config?.width || 360, height: scene.config?.height || 640 };
      console.log('[GameBootstrap Debug] Setting canvas size:', size);
      c.width = size.width;
      c.height = size.height;
      console.log('[GameBootstrap Debug] Canvas dimensions:', c.width, 'x', c.height);
      return c;
    }

    function injectCSS() {
      if (!cssPath) return;
      if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href.includes(cssPath))) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      document.head.appendChild(link);
    }

    const loop = (ts) => {
      if (!canvas) {
        console.warn('[GameBootstrap Debug] Loop called but canvas is null');
        return;
      }
      const delta = lastTs ? (ts - lastTs) : 16;
      lastTs = ts;
      scene.update(delta);
      scene.render();
      onLoop?.(delta);
      rafId = requestAnimationFrame(loop);
    };

    function start() {
      console.log('[GameBootstrap Debug] start() called');
      const container = ensureContainer();
      console.log('[GameBootstrap Debug] Container found:', container.id);
      canvas = ensureCanvas(container);
      console.log('[GameBootstrap Debug] Canvas created:', canvas.id, canvas.width, 'x', canvas.height);
      injectCSS();
      console.log('[GameBootstrap Debug] CSS injected');
      console.log('[GameBootstrap Debug] Calling scene.mount() with canvas');
      scene.mount(canvas);
      console.log('[GameBootstrap Debug] Scene mounted');
      onStart?.();
      if (autostart) {
        console.log('[GameBootstrap Debug] Autostart enabled, calling run()');
        run();
      } else {
        console.log('[GameBootstrap Debug] Autostart disabled, creating start button');
        const btn = document.createElement('button');
        btn.textContent = 'Start';
        btn.onclick = () => { btn.remove(); run(); };
        container.appendChild(btn);
      }
    }

    function run() {
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      onStop?.();
      if (scene.destroy) scene.destroy();
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null;
    }

    return { start, stop };
  }

  // TopplerScene
  class TopplerScene {
    constructor(config = {}) {
      this.player = { x: 0, y: 0, width: 30, height: 30 };
      this.platforms = [];
      this.velocityY = 0;
      this.animationId = null;
      this.hasStartedLoop = false;
      
      this.config = {
        theme: config.theme ?? 'classic',
        width: config.width ?? 360,
        height: config.height ?? 640,
        gravity: config.gravity ?? 0.6,
        jumpForce: config.jumpForce ?? 15,
        winHeight: config.winHeight ?? 560,
        failHeight: config.failHeight ?? -100
      };
      
      this.state = {
        isPlaying: true,
        isWon: false,
        isFailed: false,
        currentHeight: 0,
        maxHeight: 0,
        attempts: 0,
        startTime: Date.now(),
        theme: this.config.theme
      };
    }

    update(delta) {
      // No-op for now. Can be extended with platform/player tick logic later.
    }

    mount(canvas) {
      console.log('[TopplerScene Debug] mount() called with canvas:', canvas.id, canvas.width, 'x', canvas.height);
      
      // Store the canvas reference
      this.canvas = canvas;
      console.log('[TopplerScene Debug] Canvas stored in this.canvas');
      
      // Get the 2D context and store it
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[TopplerScene Debug] Failed to get 2D context in mount()');
        return;
      }
      this.ctx = ctx;
      console.log('[TopplerScene Debug] 2D context stored in this.ctx');
      
      // Initialize player position
      this.player.x = (this.config.width - this.player.width) / 2;
      this.player.y = this.config.height - this.player.height - 8;
      console.log('[TopplerScene Debug] Player positioned at:', this.player.x, this.player.y);
      
      // Initialize platforms
      this.platforms = Array.from({ length: 8 }).map((_, i) => ({
        x: 40 + ((i % 2) * 160),
        y: this.config.height - 80 - i * 70,
        width: 120,
        height: 16
      }));
      console.log('[TopplerScene Debug] Platforms initialized:', this.platforms.length);
      
      console.log('[TopplerScene Debug] mount() complete');
    }

    render() {
      console.log('[TopplerScene Debug] render() called - frame:', performance.now().toFixed(0));
      
      // Check if canvas exists
      if (!this.canvas) {
        console.warn('[TopplerScene Debug] Canvas is null, cannot render');
        return;
      }
      
      console.log('[TopplerScene Debug] Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
      
      // Access the 2D rendering context
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        console.error('[TopplerScene Debug] Failed to get 2D context');
        return;
      }
      
      console.log('[TopplerScene Debug] Got 2D context, drawing...');

      // Clear the canvas each frame
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Fill background with a bright red color to ensure visibility
      ctx.fillStyle = "#ff0000"; // Bright red
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      console.log('[TopplerScene Debug] Drew red background');

      // Draw a cyan rectangle in the center
      ctx.fillStyle = "#00ffff"; // Cyan
      ctx.fillRect(100, 100, 200, 200);
      console.log('[TopplerScene Debug] Drew cyan rectangle');

      // Draw debug text to confirm render loop is active
      ctx.fillStyle = "#ffffff"; // White
      ctx.font = "20px monospace";
      ctx.fillText("TopplerScene: render() active", 20, 40);
      console.log('[TopplerScene Debug] Drew white text');

      // Draw frame count or timestamp for diagnostics
      ctx.fillStyle = "#ffff00"; // Yellow
      ctx.fillText(`Frame: ${performance.now().toFixed(0)}`, 20, 70);
      
      // Draw canvas info
      ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 20, 100);
      
      console.log('[TopplerScene Debug] Render complete');
    }

    getState() { return { ...this.state }; }
    getPlayer() { return { ...this.player }; }
    getPlatforms() { return this.platforms.map(p => ({ ...p })); }
    
    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  // Main bootstrap function
  async function bootstrap() {
    try {
      console.log('[Toppler Debug] Bootstrap starting...');
      console.log('[Toppler Debug] URL search:', window.location.search);
      console.log('[Toppler Debug] Autostart enabled:', window.location.search.includes('autostart=1'));
      
      const assets = await loadResources({});
      console.log('[Toppler Debug] Assets loaded:', Object.keys(assets));
      
      const scene = new TopplerScene({ assets, width: 360, height: 640 });
      console.log('[Toppler Debug] Scene created');
      
      const launcher = createGameLauncher({
        scene: scene,
        containerId: 'app',
        autostart: window.location.search.includes('autostart=1'),
        onStart: () => console.log('[Toppler Debug] Game starting'),
        onLoop: (delta) => {},
        onStop: () => console.log('[Toppler Debug] Game stopped')
      });
      
      console.log('[Toppler Debug] Launcher created, calling start()...');
      launcher.start();
      console.log('[Toppler Debug] Launcher started');
      
      window.TopplerStandalone = { scene, launcher };
      console.log('[Toppler Debug] Bootstrap complete');
    } catch (error) {
      console.error('[Toppler Debug] Bootstrap error:', error);
      
      // Fallback: create a simple canvas and draw something
      console.log('[Toppler Debug] Attempting fallback rendering...');
      const app = document.getElementById('app');
      if (app) {
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 640;
        canvas.id = 'fallback-canvas';
        app.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f00';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#0ff';
          ctx.fillRect(80, 220, 200, 200);
          ctx.fillStyle = '#fff';
          ctx.font = '20px monospace';
          ctx.fillText('TopplerScene: fallback render', 20, 40);
          console.log('[Toppler Debug] Fallback rendering complete');
        }
      }
    }
  }

  return {
    bootstrap,
    TopplerScene,
    createGameLauncher,
    loadResources
  };
})();

// Error handling for bundle
window.addEventListener('error', (e) => {
    console.error('[Bundle Error]', e.message, 'at', e.filename, 'line', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('[Bundle Promise Error]', e.reason);
});

// Auto-start the bundled game
(function() {
    console.log('[Bundle] Auto-starting Toppler...');
    console.log('[Bundle] Document ready state:', document.readyState);
    console.log('[Bundle] URL:', window.location.href);
    
    // Check for autostart parameter
    const autostart = window.location.search.includes('autostart=1');
    console.log('[Bundle] Autostart enabled:', autostart);
    
    // Start the game when DOM is ready
    function startGame() {
        console.log('[Bundle] Starting game...');
        try {
            if (typeof TopplerBundle !== 'undefined') {
                console.log('[Bundle] TopplerBundle found:', Object.keys(TopplerBundle));
                if (TopplerBundle.bootstrap) {
                    console.log('[Bundle] Calling TopplerBundle.bootstrap()...');
                    TopplerBundle.bootstrap();
                } else {
                    console.error('[Bundle] TopplerBundle.bootstrap not found');
                }
            } else {
                console.error('[Bundle] TopplerBundle is undefined');
            }
        } catch (error) {
            console.error('[Bundle] Error starting game:', error);
        }
    }
    
    if (document.readyState === 'loading') {
        console.log('[Bundle] DOM loading, adding event listener');
        document.addEventListener('DOMContentLoaded', startGame);
    } else {
        console.log('[Bundle] DOM already ready, starting immediately');
        startGame();
    }
})();

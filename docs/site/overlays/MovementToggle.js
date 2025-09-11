// MIFF Movement Toggle - Virtual D-pad for mobile and desktop
// Creates a floating movement control that works with touch and keyboard

export function createMovementToggle() {
  // Remove existing toggle if present
  const existing = document.querySelector('.movement-toggle');
  if (existing) existing.remove();

  const toggle = document.createElement('div');
  toggle.className = 'movement-toggle';
  toggle.innerHTML = `
    <div class="movement-dpad">
      <button class="movement-btn movement-up" data-key="ArrowUp">↑</button>
      <div class="movement-row">
        <button class="movement-btn movement-left" data-key="ArrowLeft">←</button>
        <button class="movement-btn movement-center" data-key="Space">●</button>
        <button class="movement-btn movement-right" data-key="ArrowRight">→</button>
      </div>
      <button class="movement-btn movement-down" data-key="ArrowDown">↓</button>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .movement-toggle {
      position: fixed;
      bottom: 4vh;
      left: 4vw;
      z-index: 10000;
      width: min(18vw, 96px);
      height: min(18vw, 96px);
      pointer-events: auto;
      user-select: none;
    }
    
    .movement-dpad {
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2px;
      width: 100%;
      height: 100%;
    }
    
    .movement-row {
      display: contents;
    }
    
    .movement-btn {
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: #e6edf3;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.1s;
      touch-action: manipulation;
    }
    
    .movement-btn:active,
    .movement-btn.active {
      background: rgba(88, 166, 255, 0.8);
      border-color: #58a6ff;
      transform: scale(0.95);
    }
    
    .movement-up { grid-row: 1; grid-column: 2; }
    .movement-left { grid-row: 2; grid-column: 1; }
    .movement-center { grid-row: 2; grid-column: 2; }
    .movement-right { grid-row: 2; grid-column: 3; }
    .movement-down { grid-row: 3; grid-column: 2; }
    
    @media screen and (orientation: landscape) {
      .movement-toggle { bottom: 4vh; left: 4vw; }
    }
    
    @media screen and (orientation: portrait) {
      .movement-toggle { bottom: 6vh; left: 6vw; }
    }
  `;
  
  if (!document.querySelector('style[data-movement-toggle]')) {
    style.setAttribute('data-movement-toggle', 'true');
    document.head.appendChild(style);
  }

  // Track active keys
  const activeKeys = new Set();
  
  // Button event handlers
  const buttons = toggle.querySelectorAll('.movement-btn');
  buttons.forEach(btn => {
    const key = btn.dataset.key;
    
    // Touch/click handlers
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btn.classList.add('active');
      activeKeys.add(key);
      triggerKeyEvent(key, 'keydown');
    });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      btn.classList.remove('active');
      activeKeys.delete(key);
      triggerKeyEvent(key, 'keyup');
    });
    
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      btn.classList.add('active');
      activeKeys.add(key);
      triggerKeyEvent(key, 'keydown');
    });
    
    btn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      btn.classList.remove('active');
      activeKeys.delete(key);
      triggerKeyEvent(key, 'keyup');
    });
    
    // Prevent context menu
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // Keyboard event simulation
  function triggerKeyEvent(key, type) {
    const event = new KeyboardEvent(type, {
      key: key,
      code: key,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    activeKeys.forEach(key => triggerKeyEvent(key, 'keyup'));
  });

  document.body.appendChild(toggle);
  console.log('[MovementToggle] Created virtual D-pad');
  
  return toggle;
}

// Auto-create on all devices for now
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(createMovementToggle, 1000); // Delay to let other UI load first
  });
}
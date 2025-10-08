/**
 * Mobile-First Touch Controls for RenderWorld Hub
 * Built by R.C. Biscuits for mobile-first game development
 */

class MobileTouchSystem {
  constructor(canvas, gameSystem) {
    this.canvas = canvas;
    this.game = gameSystem;
    this.touches = new Map();
    this.gestures = {
      tap: { threshold: 150, radius: 30 },
      hold: { threshold: 800 },
      swipe: { minDistance: 50, maxTime: 300 },
      pinch: { minDistance: 10 }
    };
    
    this.virtualJoystick = null;
    this.actionButtons = new Map();
    this.setupTouchInterface();
    this.bindTouchEvents();
    
    console.log('📱 Mobile touch system initialized');
  }

  setupTouchInterface() {
    this.createVirtualJoystick();
    this.createActionButtons();
    this.createMobileHUD();
  }

  createVirtualJoystick() {
    // Virtual joystick container
    const joystickArea = document.createElement('div');
    joystickArea.id = 'virtual-joystick';
    joystickArea.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Joystick knob
    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'virtual-joystick-knob';
    joystickKnob.style.cssText = `
      width: 50px;
      height: 50px;
      background: rgba(0, 212, 255, 0.8);
      border-radius: 50%;
      transition: all 0.1s ease;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    `;

    joystickArea.appendChild(joystickKnob);
    document.body.appendChild(joystickArea);

    this.virtualJoystick = {
      area: joystickArea,
      knob: joystickKnob,
      center: { x: 60, y: 60 },
      active: false,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      vector: { x: 0, y: 0 }
    };

    console.log('🕹️ Virtual joystick created');
  }

  createActionButtons() {
    const buttonConfigs = [
      {
        id: 'spirit-lens-btn',
        label: '🔮',
        action: 'spiritLens',
        position: { bottom: '20px', right: '20px' },
        size: '60px'
      },
      {
        id: 'interact-btn', 
        label: '💬',
        action: 'interact',
        position: { bottom: '90px', right: '20px' },
        size: '50px'
      },
      {
        id: 'jump-btn',
        label: '⬆️',
        action: 'jump', 
        position: { bottom: '20px', right: '90px' },
        size: '50px'
      },
      {
        id: 'menu-btn',
        label: '⚙️',
        action: 'menu',
        position: { top: '20px', right: '20px' },
        size: '45px'
      }
    ];

    buttonConfigs.forEach(config => {
      const button = document.createElement('div');
      button.id = config.id;
      button.textContent = config.label;
      button.style.cssText = `
        position: fixed;
        ${Object.entries(config.position).map(([key, val]) => `${key}: ${val}`).join('; ')};
        width: ${config.size};
        height: ${config.size};
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        z-index: 1000;
        user-select: none;
        cursor: pointer;
        transition: all 0.2s ease;
      `;

      // Button press effects
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(0.9)';
        button.style.background = 'rgba(0, 212, 255, 0.8)';
        this.handleActionButton(config.action, 'start');
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(1)';
        button.style.background = 'rgba(0, 0, 0, 0.7)';
        this.handleActionButton(config.action, 'end');
      });

      document.body.appendChild(button);
      this.actionButtons.set(config.action, button);
    });

    console.log('🎮 Action buttons created:', this.actionButtons.size);
  }

  createMobileHUD() {
    // Mobile-specific HUD elements
    const mobileHUD = document.createElement('div');
    mobileHUD.id = 'mobile-hud';
    mobileHUD.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      z-index: 999;
      font-family: 'JetBrains Mono', monospace;
      color: white;
      font-size: 12px;
    `;

    // Status indicators
    const statusLeft = document.createElement('div');
    statusLeft.id = 'status-left';
    statusLeft.innerHTML = `
      <div>📍 <span id="position-display">0, 0</span></div>
      <div id="spirit-lens-status">🔮 Available</div>
    `;

    const statusRight = document.createElement('div');
    statusRight.id = 'status-right';
    statusRight.style.textAlign = 'right';
    statusRight.innerHTML = `
      <div>⚡ <span id="fps-display">60</span> FPS</div>
      <div id="interaction-hint"></div>
    `;

    mobileHUD.appendChild(statusLeft);
    mobileHUD.appendChild(statusRight);
    document.body.appendChild(mobileHUD);

    console.log('📱 Mobile HUD created');
  }

  bindTouchEvents() {
    // Prevent default touch behaviors
    document.body.style.touchAction = 'none';
    this.canvas.style.touchAction = 'none';

    // Touch event listeners
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Joystick-specific events
    this.virtualJoystick.area.addEventListener('touchstart', this.handleJoystickStart.bind(this), { passive: false });
    this.virtualJoystick.area.addEventListener('touchmove', this.handleJoystickMove.bind(this), { passive: false });
    this.virtualJoystick.area.addEventListener('touchend', this.handleJoystickEnd.bind(this), { passive: false });

    console.log('👆 Touch events bound');
  }

  handleTouchStart(event) {
    event.preventDefault();
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = {
        id: touch.identifier,
        startTime: Date.now(),
        startPos: { x: touch.clientX, y: touch.clientY },
        currentPos: { x: touch.clientX, y: touch.clientY },
        moved: false
      };
      
      this.touches.set(touch.identifier, touchData);
    });

    // Multi-touch gesture detection
    if (event.touches.length === 2) {
      this.handlePinchStart(event.touches);
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (!touchData) return;

      const currentPos = { x: touch.clientX, y: touch.clientY };
      const distance = Math.hypot(
        currentPos.x - touchData.startPos.x,
        currentPos.y - touchData.startPos.y
      );

      touchData.currentPos = currentPos;
      touchData.moved = distance > this.gestures.tap.radius;
    });

    // Handle pinch zoom
    if (event.touches.length === 2) {
      this.handlePinchMove(event.touches);
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (!touchData) return;

      const duration = Date.now() - touchData.startTime;
      const distance = Math.hypot(
        touchData.currentPos.x - touchData.startPos.x,
        touchData.currentPos.y - touchData.startPos.y
      );

      // Gesture recognition
      if (!touchData.moved && duration < this.gestures.tap.threshold) {
        this.handleTap(touchData.startPos);
      } else if (!touchData.moved && duration > this.gestures.hold.threshold) {
        this.handleLongPress(touchData.startPos);
      } else if (touchData.moved && duration < this.gestures.swipe.maxTime && distance > this.gestures.swipe.minDistance) {
        this.handleSwipe(touchData.startPos, touchData.currentPos, duration);
      }

      this.touches.delete(touch.identifier);
    });
  }

  handleJoystickStart(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const rect = this.virtualJoystick.area.getBoundingClientRect();
    
    this.virtualJoystick.active = true;
    this.virtualJoystick.startPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  handleJoystickMove(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.virtualJoystick.active || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const rect = this.virtualJoystick.area.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    const deltaX = currentX - centerX;
    const deltaY = currentY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const maxDistance = 50; // Maximum knob distance from center
    
    if (distance <= maxDistance) {
      this.virtualJoystick.currentPos = { x: currentX, y: currentY };
    } else {
      // Constrain to circle boundary
      const angle = Math.atan2(deltaY, deltaX);
      this.virtualJoystick.currentPos = {
        x: centerX + Math.cos(angle) * maxDistance,
        y: centerY + Math.sin(angle) * maxDistance
      };
    }
    
    // Update knob visual position
    this.virtualJoystick.knob.style.transform = `translate(${
      this.virtualJoystick.currentPos.x - centerX
    }px, ${
      this.virtualJoystick.currentPos.y - centerY
    }px)`;
    
    // Calculate normalized vector (-1 to 1)
    this.virtualJoystick.vector = {
      x: (this.virtualJoystick.currentPos.x - centerX) / maxDistance,
      y: (this.virtualJoystick.currentPos.y - centerY) / maxDistance
    };
    
    // Send movement input to game
    this.game.handleMobileMovement(this.virtualJoystick.vector);
  }

  handleJoystickEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.virtualJoystick.active = false;
    this.virtualJoystick.vector = { x: 0, y: 0 };
    
    // Reset knob to center
    this.virtualJoystick.knob.style.transform = 'translate(0px, 0px)';
    
    // Stop movement
    this.game.handleMobileMovement({ x: 0, y: 0 });
  }

  handleTap(position) {
    // Convert screen position to game world position
    const gamePos = this.screenToWorld(position);
    this.game.handleTap(gamePos);
    
    // Visual feedback
    this.showTapEffect(position);
    console.log('👆 Tap at', position);
  }

  handleLongPress(position) {
    const gamePos = this.screenToWorld(position);
    this.game.handleLongPress(gamePos);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    console.log('👆 Long press at', position);
  }

  handleSwipe(startPos, endPos, duration) {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const distance = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Determine swipe direction
    let direction;
    const absAngle = Math.abs(angle);
    if (absAngle < Math.PI / 4) direction = 'right';
    else if (absAngle > 3 * Math.PI / 4) direction = 'left';
    else if (angle > 0) direction = 'down';
    else direction = 'up';
    
    this.game.handleSwipe(direction, distance, duration);
    console.log('👆 Swipe', direction, distance);
  }

  handlePinchStart(touches) {
    if (touches.length !== 2) return;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    this.pinchData = {
      startDistance: Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      ),
      startCenter: {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }
    };
  }

  handlePinchMove(touches) {
    if (!this.pinchData || touches.length !== 2) return;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const scale = currentDistance / this.pinchData.startDistance;
    this.game.handlePinchZoom(scale);
  }

  handleActionButton(action, phase) {
    switch (action) {
      case 'spiritLens':
        if (phase === 'start') {
          this.game.useSpiritLens();
        }
        break;
      case 'interact':
        if (phase === 'start') {
          this.game.interact();
        }
        break;
      case 'jump':
        if (phase === 'start') {
          this.game.jump();
        }
        break;
      case 'menu':
        if (phase === 'start') {
          this.game.toggleMenu();
        }
        break;
    }
  }

  screenToWorld(screenPos) {
    // Convert screen coordinates to game world coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenPos.x - rect.left) / rect.width;
    const y = (screenPos.y - rect.top) / rect.height;
    
    return {
      x: (x - 0.5) * 20, // Adjust for your world scale
      y: (y - 0.5) * 20
    };
  }

  showTapEffect(position) {
    // Create visual tap effect
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: fixed;
      left: ${position.x - 15}px;
      top: ${position.y - 15}px;
      width: 30px;
      height: 30px;
      background: rgba(0, 212, 255, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 2000;
      animation: tapEffect 0.3s ease-out forwards;
    `;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
      document.body.removeChild(effect);
    }, 300);
  }

  updateHUD(gameState) {
    // Update mobile HUD with current game state
    const posDisplay = document.getElementById('position-display');
    const spiritLensStatus = document.getElementById('spirit-lens-status');
    const fpsDisplay = document.getElementById('fps-display');
    const interactionHint = document.getElementById('interaction-hint');
    
    if (posDisplay && gameState.player) {
      const pos = gameState.player.position;
      posDisplay.textContent = `${Math.round(pos.x)}, ${Math.round(pos.z)}`;
    }
    
    if (spiritLensStatus && gameState.player) {
      spiritLensStatus.textContent = gameState.player.holdingSpiritLens ? 
        '🔮 Held' : '🔮 Available';
    }
    
    if (fpsDisplay && gameState.game) {
      fpsDisplay.textContent = gameState.game.fps || '60';
    }
    
    // Show interaction hints
    if (interactionHint) {
      const hints = this.getInteractionHints(gameState);
      interactionHint.textContent = hints;
    }
  }

  getInteractionHints(gameState) {
    if (!gameState.player) return '';
    
    const player = gameState.player.position;
    const hints = [];
    
    // Check Spirit Lens proximity
    if (!gameState.player.holdingSpiritLens && gameState.world.spiritLens.active) {
      const lens = gameState.world.spiritLens.position;
      const distance = Math.hypot(player.x - lens.x, player.z - lens.z);
      if (distance < 3) {
        hints.push('🔮 Spirit Lens');
      }
    }
    
    // Check NPC proximity
    Object.values(gameState.world.npcs || {}).forEach(npc => {
      const distance = Math.hypot(player.x - npc.position.x, player.z - npc.position.z);
      if (distance < 4) {
        hints.push('💬 ' + npc.id);
      }
    });
    
    // Check portal proximity
    Object.entries(gameState.world.portals || {}).forEach(([key, portal]) => {
      const distance = Math.hypot(player.x - portal.position.x, player.z - portal.position.z);
      if (distance < 5) {
        hints.push('🚪 ' + key);
      }
    });
    
    return hints.length > 0 ? hints.join(' • ') : '';
  }
}

// CSS for mobile tap effects
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
  @keyframes tapEffect {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2); opacity: 0; }
  }

  @media (max-width: 768px) {
    #instructions {
      display: none; /* Hide desktop instructions on mobile */
    }
    
    #crosshair {
      display: none; /* Hide crosshair on mobile */
    }
  }

  /* Prevent text selection on touch */
  .mobile-control {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
`;
document.head.appendChild(mobileStyles);

// Integration helper for existing RenderWorld system
class MobileGameBridge {
  constructor(gameSystem) {
    this.game = gameSystem;
    this.touchSystem = new MobileTouchSystem(
      document.getElementById('render-canvas'),
      this
    );
    
    console.log('🌉 Mobile bridge created');
  }

  // Handle mobile-specific input events
  handleMobileMovement(vector) {
    // Convert joystick input to game movement
    const speed = 0.1;
    this.game.state.player.velocity.x = vector.x * speed;
    this.game.state.player.velocity.z = vector.y * speed;
  }

  handleTap(worldPos) {
    // Handle tap interactions (NPC dialogue, item pickup, etc.)
    this.game.handleClick(worldPos);
  }

  handleLongPress(worldPos) {
    // Handle long press (context menu, special actions)
    this.game.showContextMenu(worldPos);
  }

  handleSwipe(direction, distance, duration) {
    // Handle swipe gestures (quick actions, navigation)
    switch (direction) {
      case 'up':
        this.game.jump();
        break;
      case 'down':
        this.game.crouch();
        break;
      case 'left':
      case 'right':
        this.game.quickTurn(direction);
        break;
    }
  }

  handlePinchZoom(scale) {
    // Handle pinch-to-zoom (camera control)
    this.game.adjustCameraZoom(scale);
  }

  useSpiritLens() {
    this.game.useSpiritLens();
  }

  interact() {
    this.game.interact();
  }

  jump() {
    this.game.jump();
  }

  toggleMenu() {
    this.game.togglePause();
  }

  update(gameState) {
    // Update mobile HUD with current game state
    this.touchSystem.updateHUD(gameState);
  }
}

// Export for integration
if (typeof window !== 'undefined') {
  window.MobileTouchSystem = MobileTouchSystem;
  window.MobileGameBridge = MobileGameBridge;
}

export { MobileTouchSystem, MobileGameBridge };

console.log('📱 Mobile-first touch controls loaded!');
console.log('🎮 Features: Virtual joystick, action buttons, gesture recognition, mobile HUD');

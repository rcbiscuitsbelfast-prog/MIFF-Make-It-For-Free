// MIFF Sampler Browser Entry Point
// Engine-agnostic, remix-safe, modular game framework demo

import { validateOverlinkZone, checkOverlinkZoneHealth, safeOverlinkZoneCall } from './validation/overlinkZoneValidator';

// Browser-safe interface for OverlinkZone (avoids Node.js dependencies)
interface BrowserOverlinkZone {
  id: string;
  mount: (container: HTMLElement) => void;
  unmount: () => void;
  activateTheme: (theme: string) => void;
  getCurrentTheme: () => string;
  getAudioPlaybackState: () => { isPlaying: boolean; currentTheme: string | null };
  setAudioVolume: (volume: number) => void;
  getBadgePreview: () => string;
  getContributorBadges: (contributorId: string) => any[];
  isRemixSafe: () => boolean;
  getRemixMetadata: () => any;
  getCurrentZone: () => string;
  switchZone: (zoneId: string) => boolean;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  getDebugState: () => any;
}

// Game state
interface GameState {
  currentZone: string;
  remixMode: boolean;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isRunning: boolean;
  lastTime: number;
}

// Initialize game state
const gameState: GameState = {
  currentZone: 'synth_nexus',
  remixMode: false,
  canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
  ctx: null as any,
  isRunning: false,
  lastTime: 0
};

// Zone configurations
const zones = {
  synth_nexus: {
    name: 'Synth Nexus',
    description: 'Central hub connecting all game zones',
    color: '#00ff00',
    elements: [
      { id: 'btn_toppler', x: 200, y: 200, width: 120, height: 60, text: 'Toppler', color: '#ff0000' },
      { id: 'btn_spirit_tamer', x: 400, y: 200, width: 120, height: 60, text: 'Spirit Tamer', color: '#0000ff' },
      { id: 'btn_witcher_grove', x: 300, y: 300, width: 120, height: 60, text: 'Witcher Grove', color: '#ffff00' },
      { id: 'btn_overlink', x: 300, y: 400, width: 120, height: 60, text: 'OverlinkPure', color: '#ff00ff' }
    ]
  },
  toppler: {
    name: 'Toppler Demo',
    description: 'Physics-based platformer with modular systems',
    color: '#ff0000',
    elements: [
      { id: 'platform', x: 100, y: 500, width: 600, height: 20, color: '#666666' },
      { id: 'player', x: 50, y: 450, width: 20, height: 20, color: '#ff0000' },
      { id: 'btn_back', x: 700, y: 50, width: 80, height: 30, text: '← Back', color: '#00ff00' }
    ]
  },
  spirit_tamer: {
    name: 'Spirit Tamer Demo',
    description: 'Rhythm-based spirit collection game',
    color: '#0000ff',
    elements: [
      { id: 'spirit', x: 400, y: 300, width: 30, height: 30, color: '#00ffff' },
      { id: 'rhythm_bar', x: 200, y: 500, width: 400, height: 20, color: '#666666' },
      { id: 'btn_back', x: 700, y: 50, width: 80, height: 30, text: '← Back', color: '#00ff00' }
    ]
  },
  witcher_grove: {
    name: 'Witcher Grove Demo',
    description: 'Open-world exploration with quest systems',
    color: '#ffff00',
    elements: [
      { id: 'tree', x: 300, y: 200, width: 40, height: 80, color: '#228b22' },
      { id: 'quest_marker', x: 500, y: 300, width: 20, height: 20, color: '#ffd700' },
      { id: 'btn_back', x: 700, y: 50, width: 80, height: 30, text: '← Back', color: '#00ff00' }
    ]
  },
  overlink: {
    name: 'OverlinkPure Zone',
    description: 'Meta-zone with themes, audio, and badge systems',
    color: '#ff00ff',
    elements: [
      { id: 'theme_selector', x: 200, y: 200, width: 120, height: 60, text: 'Themes', color: '#00ffff' },
      { id: 'audio_controls', x: 400, y: 200, width: 120, height: 60, text: 'Audio', color: '#ff8800' },
      { id: 'badge_system', x: 300, y: 300, width: 120, height: 60, text: 'Badges', color: '#ff0088' },
      { id: 'btn_back', x: 700, y: 50, width: 80, height: 30, text: '← Back', color: '#00ff00' }
    ]
  }
};

// Initialize canvas context
function initCanvas() {
  if (!gameState.canvas) {
    console.error('Canvas not found');
    return false;
  }
  
  const ctx = gameState.canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get 2D context');
    return false;
  }
  
  gameState.ctx = ctx;
  
  // Set canvas size to match container
  const container = document.getElementById('gameContainer');
  if (container) {
    gameState.canvas.width = container.clientWidth;
    gameState.canvas.height = container.clientHeight;
  }
  
  return true;
}

// Draw zone elements
function drawZone(zoneId: string) {
  const zone = zones[zoneId as keyof typeof zones];
  if (!zone) return;
  
  const ctx = gameState.ctx;
  const canvas = gameState.canvas;
  
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw zone background
  ctx.fillStyle = zone.color + '20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw zone title
  ctx.fillStyle = zone.color;
  ctx.font = 'bold 32px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(zone.name, canvas.width / 2, 80);
  
  // Draw zone description
  ctx.font = '16px Courier New';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(zone.description, canvas.width / 2, 120);
  
  // Draw zone elements
  zone.elements.forEach(element => {
    ctx.fillStyle = element.color;
    ctx.fillRect(element.x, element.y, element.width, element.height);
    
    if (element.text) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(element.text, element.x + element.width / 2, element.y + element.height / 2 + 5);
    }
  });
}

// Handle mouse/touch events
function handleInteraction(x: number, y: number) {
  const zone = zones[gameState.currentZone as keyof typeof zones];
  if (!zone) return;
  
  zone.elements.forEach(element => {
    if (x >= element.x && x <= element.x + element.width &&
        y >= element.y && y <= element.y + element.height) {
      
      if (element.id === 'btn_back') {
        gameState.currentZone = 'synth_nexus';
        updateUI();
        return;
      }
      
      if (element.id === 'btn_toppler') {
        gameState.currentZone = 'toppler';
        updateUI();
        return;
      }
      
      if (element.id === 'btn_spirit_tamer') {
        gameState.currentZone = 'spirit_tamer';
        updateUI();
        return;
      }
      
      if (element.id === 'btn_witcher_grove') {
        gameState.currentZone = 'witcher_grove';
        updateUI();
        return;
      }
      
      if (element.id === 'btn_overlink') {
        gameState.currentZone = 'overlink';
        updateUI();
        return;
      }
      
      // Handle other element interactions
      console.log(`Interacted with: ${element.id}`);
    }
  });
}

// Update UI elements
function updateUI() {
  const zone = zones[gameState.currentZone as keyof typeof zones];
  if (!zone) return;
  
  const currentZoneElement = document.getElementById('currentZone');
  const remixStatusElement = document.getElementById('remixStatus');
  
  if (currentZoneElement) {
    currentZoneElement.textContent = zone.name;
  }
  
  if (remixStatusElement) {
    remixStatusElement.textContent = gameState.remixMode ? 'On' : 'Off';
  }
  
  // Update remix toggle button
  const remixToggle = document.getElementById('remixToggle') as HTMLButtonElement;
  if (remixToggle) {
    remixToggle.textContent = gameState.remixMode ? 'Disable Remix Mode' : 'Enable Remix Mode';
  }
}

// Game loop
function gameLoop(currentTime: number) {
  if (!gameState.isRunning) return;
  
  const deltaTime = currentTime - gameState.lastTime;
  gameState.lastTime = currentTime;
  
  // Draw current zone
  drawZone(gameState.currentZone);
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Initialize mobile controls
function initMobileControls() {
  const mobileBtns = document.querySelectorAll('.mobileBtn');
  
  mobileBtns.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Convert screen coordinates to canvas coordinates
      const canvasRect = gameState.canvas.getBoundingClientRect();
      const canvasX = x - canvasRect.left;
      const canvasY = y - canvasRect.top;
      
      handleInteraction(canvasX, canvasY);
    });
  });
}

// Initialize keyboard controls
function initKeyboardControls() {
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        // Handle up movement
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        // Handle down movement
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        // Handle left movement
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        // Handle right movement
        break;
      case 'Enter':
      case ' ':
        // Handle action
        break;
    }
  });
}

// Initialize mouse controls
function initMouseControls() {
  gameState.canvas.addEventListener('click', (e) => {
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleInteraction(x, y);
  });
}

// Initialize remix toggle
function initRemixToggle() {
  const remixToggle = document.getElementById('remixToggle');
  if (remixToggle) {
    remixToggle.addEventListener('click', () => {
      gameState.remixMode = !gameState.remixMode;
      updateUI();
      
      // Update OverlinkZone remix mode if available using safe access
      const remixStatus = safeOverlinkZoneCall('isRemixSafe', false);
      console.log('Remix mode toggled:', gameState.remixMode, 'Remix safe:', remixStatus);
      
      // Log remix metadata if available
      const metadata = safeOverlinkZoneCall('getRemixMetadata', null);
      if (metadata) {
        console.log('📋 Remix metadata:', metadata);
      }
    });
  }
}

// Initialize loading screen
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.getElementById('loadingProgress');
  
  if (loadingScreen && loadingProgress) {
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Hide loading screen after a short delay
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          startGame();
        }, 500);
      }
      
      loadingProgress.style.width = progress + '%';
    }, 100);
  }
}

// Start the game
function startGame() {
  if (!initCanvas()) {
    console.error('Failed to initialize canvas');
    return;
  }
  
  // Initialize controls
  initMobileControls();
  initKeyboardControls();
  initMouseControls();
  initRemixToggle();
  
  // Update UI
  updateUI();
  
  // Start game loop
  gameState.isRunning = true;
  gameState.lastTime = performance.now();
  requestAnimationFrame(gameLoop);
  
  console.log('MIFF Sampler started successfully');
}

// Initialize OverlinkZone if available
async function initOverlinkZone() {
  try {
    // This would create an instance of OverlinkZone for integration
    // For now, we'll just log that it's available
    console.log('OverlinkZone module available for integration');
    
    // Make it available globally for testing with enhanced structure
    window.overlinkZone = {
      // Core identification
      id: 'miff-sampler-overlink',
      
      // Core functionality
      mount: (container: HTMLElement) => {
        console.log('Mounting overlinkZone to container:', container);
        // Implementation would mount the zone to the container
      },
      unmount: () => {
        console.log('Unmounting overlinkZone');
        // Implementation would clean up the zone
      },
      
      // Theme management
      activateTheme: (theme: string) => console.log('Theme activated:', theme),
      getCurrentTheme: () => 'neonGrid',
      
      // Audio management
      getAudioPlaybackState: () => ({ isPlaying: false, currentTheme: null }),
      setAudioVolume: (volume: number) => console.log('Audio volume set to:', volume),
      
      // Badge system
      getBadgePreview: () => 'Badge system available',
      getContributorBadges: (contributorId: string) => [
        { type: 'Remix Pioneer', level: 'Gold' },
        { type: 'Asset Auditor', level: 'Silver' }
      ],
      
      // Remix safety
      isRemixSafe: () => true,
      getRemixMetadata: () => ({
        license: 'MIT',
        remixDepth: 1,
        contributor: 'miff_team'
      }),
      
      // Zone management
      getCurrentZone: () => gameState.currentZone,
      switchZone: (zoneId: string) => {
        if (zones[zoneId as keyof typeof zones]) {
          gameState.currentZone = zoneId;
          updateUI();
          return true;
        }
        return false;
      },
      
      // Debug and development
      enableDebugMode: () => console.log('Debug mode enabled'),
      disableDebugMode: () => console.log('Debug mode disabled'),
      getDebugState: () => ({
        debugMode: false,
        currentZone: gameState.currentZone,
        remixMode: gameState.remixMode
      })
    };
    
    // Validate the overlinkZone after initialization
    const validation = validateOverlinkZone();
    if (validation.isValid) {
      console.log('✅ OverlinkZone validation passed');
      
      // Log health status
      const health = checkOverlinkZoneHealth();
      console.log('🏥 OverlinkZone health check:', health);
      
      // Log any warnings or suggestions
      if (validation.warnings.length > 0) {
        console.log('⚠️ Validation warnings:', validation.warnings);
      }
      if (validation.suggestions.length > 0) {
        console.log('💡 Suggestions:', validation.suggestions);
      }
    } else {
      console.warn('⚠️ OverlinkZone validation failed:', validation.errors);
      console.log('💡 Suggestions:', validation.suggestions);
    }
    
  } catch (error) {
    console.log('OverlinkZone not available:', error);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('MIFF Sampler initializing...');
  
  // Initialize OverlinkZone
  await initOverlinkZone();
  
  // Start loading sequence
  initLoadingScreen();
});

// Export for module usage
export { gameState, zones, drawZone, handleInteraction };
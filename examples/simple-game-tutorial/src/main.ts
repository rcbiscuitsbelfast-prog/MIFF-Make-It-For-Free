/**
 * Simple Game Tutorial - Main Entry Point
 * 
 * Main entry point for the simple game tutorial.
 * This demonstrates how to use the MIFF Framework to create a complete game.
 */

import { GameManager } from './GameManager';
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

// Initialize logger
const logger = new StructuredLogger({ module: 'Main' });

// Game configuration
const gameConfig = {
  width: 800,
  height: 600,
  gravity: 0.5,
  playerSpeed: 5,
  maxItems: 10,
  debugMode: true
};

// Main game instance
let game: GameManager | null = null;

/**
 * Initialize and start the game
 */
async function startGame(): Promise<void> {
  try {
    logger.info('Starting Simple Game Tutorial...');
    
    // Create game instance
    game = new GameManager(gameConfig);
    
    // Initialize game
    await game.initialize();
    
    // Start game
    game.start();
    
    logger.info('Game started successfully');
    
  } catch (error) {
    logger.error('Failed to start game', { error: error.message });
    throw error;
  }
}

/**
 * Stop the game
 */
function stopGame(): void {
  if (game) {
    game.stop();
    logger.info('Game stopped');
  }
}

/**
 * Handle keyboard input
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (game) {
    game.handleInput(event.key, true);
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (game) {
    game.handleInput(event.key, false);
  }
}

/**
 * Update game display
 */
function updateDisplay(): void {
  if (!game) {
    return;
  }

  const stats = game.getStats();
  
  // Update score display
  const scoreElement = document.getElementById('score');
  if (scoreElement) {
    scoreElement.textContent = `Score: ${stats.score}`;
  }
  
  // Update level display
  const levelElement = document.getElementById('level');
  if (levelElement) {
    levelElement.textContent = `Level: ${stats.level}`;
  }
  
  // Update time display
  const timeElement = document.getElementById('time');
  if (timeElement) {
    timeElement.textContent = `Time: ${Math.floor(stats.timeElapsed / 1000)}s`;
  }
  
  // Update item count
  const itemsElement = document.getElementById('items');
  if (itemsElement) {
    itemsElement.textContent = `Items: ${stats.itemCount}`;
  }
}

/**
 * Game loop
 */
function gameLoop(): void {
  updateDisplay();
  requestAnimationFrame(gameLoop);
}

/**
 * Initialize the application
 */
async function initialize(): Promise<void> {
  try {
    logger.info('Initializing Simple Game Tutorial...');
    
    // Setup event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Setup control buttons
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');
    
    if (startButton) {
      startButton.addEventListener('click', startGame);
    }
    
    if (stopButton) {
      stopButton.addEventListener('click', stopGame);
    }
    
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (game) {
          game.reset();
        }
      });
    }
    
    // Start game loop
    gameLoop();
    
    logger.info('Application initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize application', { error: error.message });
    throw error;
  }
}

/**
 * Cleanup function
 */
function cleanup(): void {
  logger.info('Cleaning up application...');
  
  // Remove event listeners
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  
  // Stop game if running
  if (game) {
    game.stop();
    game = null;
  }
  
  logger.info('Application cleaned up');
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Handle page load
window.addEventListener('load', () => {
  initialize().catch(error => {
    logger.error('Failed to initialize application', { error: error.message });
    console.error('Failed to initialize application:', error);
  });
});

// Export for testing
export { startGame, stopGame, game };
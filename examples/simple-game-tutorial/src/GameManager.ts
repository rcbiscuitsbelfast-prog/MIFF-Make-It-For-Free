/**
 * Simple Game Tutorial - Game Manager
 * 
 * Main game controller that manages the game state, entities, and game loop.
 * This is a complete implementation for the MIFF Framework tutorial.
 */

import { EventBus } from '../../../miff/pure/EventBusPure/index';
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';
import { Player } from './Player';
import { Item } from './Item';
import { Physics } from './Physics';

export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  playerSpeed: number;
  maxItems: number;
  debugMode: boolean;
}

export interface GameState {
  isRunning: boolean;
  score: number;
  level: number;
  timeElapsed: number;
  player: Player;
  items: Item[];
  physics: Physics;
}

export class GameManager {
  private logger: StructuredLogger;
  private eventBus: EventBus;
  private config: GameConfig;
  private state: GameState;
  private gameLoop: number | null = null;
  private lastTime: number = 0;

  constructor(config: Partial<GameConfig> = {}) {
    this.logger = new StructuredLogger({ module: 'GameManager' });
    this.eventBus = new EventBus();
    
    this.config = {
      width: 800,
      height: 600,
      gravity: 0.5,
      playerSpeed: 5,
      maxItems: 10,
      debugMode: false,
      ...config
    };

    this.state = {
      isRunning: false,
      score: 0,
      level: 1,
      timeElapsed: 0,
      player: new Player(100, 100, this.eventBus),
      items: [],
      physics: new Physics(this.config.gravity)
    };

    this.setupEventListeners();
  }

  /**
   * Initialize the game
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing game...');
      
      // Initialize player
      await this.state.player.initialize();
      
      // Initialize physics
      await this.state.physics.initialize();
      
      // Create initial items
      this.createInitialItems();
      
      this.logger.info('Game initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize game', { error: error.message });
      throw error;
    }
  }

  /**
   * Start the game
   */
  start(): void {
    if (this.state.isRunning) {
      this.logger.warn('Game is already running');
      return;
    }

    this.logger.info('Starting game...');
    
    this.state.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
    
    this.eventBus.emit('game:started', { score: this.state.score, level: this.state.level });
  }

  /**
   * Stop the game
   */
  stop(): void {
    if (!this.state.isRunning) {
      this.logger.warn('Game is not running');
      return;
    }

    this.logger.info('Stopping game...');
    
    this.state.isRunning = false;
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    
    this.eventBus.emit('game:stopped', { 
      score: this.state.score, 
      level: this.state.level,
      timeElapsed: this.state.timeElapsed
    });
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (!this.state.isRunning) {
      return;
    }

    this.logger.info('Pausing game...');
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    
    this.eventBus.emit('game:paused', { score: this.state.score });
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (!this.state.isRunning) {
      return;
    }

    this.logger.info('Resuming game...');
    
    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
    
    this.eventBus.emit('game:resumed', { score: this.state.score });
  }

  /**
   * Reset the game
   */
  reset(): void {
    this.logger.info('Resetting game...');
    
    this.stop();
    
    this.state.score = 0;
    this.state.level = 1;
    this.state.timeElapsed = 0;
    this.state.items = [];
    
    // Reset player
    this.state.player.reset();
    
    // Create initial items
    this.createInitialItems();
    
    this.eventBus.emit('game:reset', { score: this.state.score, level: this.state.level });
  }

  /**
   * Main game update loop
   */
  private update(currentTime: number): void {
    if (!this.state.isRunning) {
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.state.timeElapsed += deltaTime;

    // Update game systems
    this.updatePlayer(deltaTime);
    this.updateItems(deltaTime);
    this.updatePhysics(deltaTime);
    this.checkCollisions();
    this.updateLevel();

    // Continue game loop
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
  }

  /**
   * Update player
   */
  private updatePlayer(deltaTime: number): void {
    this.state.player.update(deltaTime);
  }

  /**
   * Update items
   */
  private updateItems(deltaTime: number): void {
    for (let i = this.state.items.length - 1; i >= 0; i--) {
      const item = this.state.items[i];
      item.update(deltaTime);
      
      // Remove items that have fallen off screen
      if (item.y > this.config.height + 50) {
        this.state.items.splice(i, 1);
      }
    }
  }

  /**
   * Update physics
   */
  private updatePhysics(deltaTime: number): void {
    this.state.physics.update(deltaTime);
  }

  /**
   * Check for collisions
   */
  private checkCollisions(): void {
    // Check player-item collisions
    for (let i = this.state.items.length - 1; i >= 0; i--) {
      const item = this.state.items[i];
      
      if (this.isColliding(this.state.player, item)) {
        this.collectItem(item, i);
      }
    }
  }

  /**
   * Check if two entities are colliding
   */
  private isColliding(entity1: any, entity2: any): boolean {
    return entity1.x < entity2.x + entity2.width &&
           entity1.x + entity1.width > entity2.x &&
           entity1.y < entity2.y + entity2.height &&
           entity1.y + entity1.height > entity2.y;
  }

  /**
   * Collect an item
   */
  private collectItem(item: Item, index: number): void {
    this.state.score += item.value;
    this.state.items.splice(index, 1);
    
    this.logger.info('Item collected', { 
      itemType: item.type, 
      value: item.value, 
      score: this.state.score 
    });
    
    this.eventBus.emit('item:collected', { 
      item, 
      score: this.state.score 
    });
  }

  /**
   * Update level based on score
   */
  private updateLevel(): void {
    const newLevel = Math.floor(this.state.score / 100) + 1;
    
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
      this.logger.info('Level up!', { level: this.state.level });
      
      this.eventBus.emit('level:up', { 
        level: this.state.level,
        score: this.state.score
      });
      
      // Spawn more items for higher levels
      this.spawnItems(this.state.level);
    }
  }

  /**
   * Create initial items
   */
  private createInitialItems(): void {
    for (let i = 0; i < 5; i++) {
      this.spawnItem();
    }
  }

  /**
   * Spawn items based on level
   */
  private spawnItems(level: number): void {
    const itemCount = Math.min(level * 2, this.config.maxItems);
    
    for (let i = 0; i < itemCount; i++) {
      this.spawnItem();
    }
  }

  /**
   * Spawn a single item
   */
  private spawnItem(): void {
    if (this.state.items.length >= this.config.maxItems) {
      return;
    }

    const x = Math.random() * (this.config.width - 20);
    const y = -50; // Start above screen
    const type = Math.random() > 0.5 ? 'coin' : 'gem';
    const value = type === 'coin' ? 10 : 25;
    
    const item = new Item(x, y, type, value, this.eventBus);
    this.state.items.push(item);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.on('player:jump', (data) => {
      this.logger.debug('Player jumped', data);
    });
    
    this.eventBus.on('player:move', (data) => {
      this.logger.debug('Player moved', data);
    });
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Get game configuration
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * Handle input
   */
  handleInput(key: string, pressed: boolean): void {
    this.state.player.handleInput(key, pressed);
  }

  /**
   * Get game statistics
   */
  getStats(): {
    score: number;
    level: number;
    timeElapsed: number;
    itemCount: number;
    isRunning: boolean;
  } {
    return {
      score: this.state.score,
      level: this.state.level,
      timeElapsed: this.state.timeElapsed,
      itemCount: this.state.items.length,
      isRunning: this.state.isRunning
    };
  }

  /**
   * Destroy the game
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying game...');
    
    this.stop();
    
    await this.state.player.destroy();
    await this.state.physics.destroy();
    
    this.state.items = [];
    this.eventBus.clearOldEvents();
    
    this.logger.info('Game destroyed');
  }
}

export default GameManager;
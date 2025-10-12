/**
 * Simple Game Tutorial - Player
 * 
 * Player entity with movement, jumping, and physics.
 * This is a complete implementation for the MIFF Framework tutorial.
 */

import { EventBus } from '../../../miff/pure/EventBusPure/index';
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface PlayerConfig {
  width: number;
  height: number;
  jumpPower: number;
  maxSpeed: number;
  friction: number;
}

export class Player {
  private logger: StructuredLogger;
  private eventBus: EventBus;
  private config: PlayerConfig;
  
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public isOnGround: boolean = false;
  public isJumping: boolean = false;
  public isMoving: boolean = false;
  public direction: 'left' | 'right' | 'none' = 'none';
  
  private keys: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(x: number, y: number, eventBus: EventBus, config?: Partial<PlayerConfig>) {
    this.logger = new StructuredLogger({ module: 'Player' });
    this.eventBus = eventBus;
    
    this.x = x;
    this.y = y;
    
    this.config = {
      width: 32,
      height: 32,
      jumpPower: 12,
      maxSpeed: 5,
      friction: 0.8,
      ...config
    };
    
    this.width = this.config.width;
    this.height = this.config.height;
  }

  /**
   * Initialize the player
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Player already initialized');
      return;
    }

    try {
      this.logger.info('Initializing player...');
      
      // Setup input handling
      this.setupInputHandling();
      
      this.isInitialized = true;
      this.logger.info('Player initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize player', { error: error.message });
      throw error;
    }
  }

  /**
   * Update the player
   */
  update(deltaTime: number): void {
    if (!this.isInitialized) {
      return;
    }

    this.handleMovement();
    this.applyPhysics(deltaTime);
    this.updateState();
  }

  /**
   * Handle player movement
   */
  private handleMovement(): void {
    const wasMoving = this.isMoving;
    this.isMoving = false;
    this.direction = 'none';

    // Horizontal movement
    if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) {
      this.velocityX = Math.max(this.velocityX - 0.5, -this.config.maxSpeed);
      this.direction = 'left';
      this.isMoving = true;
    } else if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) {
      this.velocityX = Math.min(this.velocityX + 0.5, this.config.maxSpeed);
      this.direction = 'right';
      this.isMoving = true;
    } else {
      // Apply friction
      this.velocityX *= this.config.friction;
    }

    // Jumping
    if ((this.keys.has(' ') || this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has('W')) && this.isOnGround) {
      this.jump();
    }

    // Emit movement event if state changed
    if (this.isMoving !== wasMoving) {
      this.eventBus.emit('player:move', {
        x: this.x,
        y: this.y,
        velocityX: this.velocityX,
        velocityY: this.velocityY,
        direction: this.direction,
        isMoving: this.isMoving
      });
    }
  }

  /**
   * Apply physics to the player
   */
  private applyPhysics(deltaTime: number): void {
    // Apply gravity
    this.velocityY += 0.5; // Gravity constant
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Simple ground collision (assuming ground is at y = 500)
    if (this.y >= 500 - this.height) {
      this.y = 500 - this.height;
      this.velocityY = 0;
      this.isOnGround = true;
      this.isJumping = false;
    } else {
      this.isOnGround = false;
    }
    
    // Keep player within screen bounds
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
    } else if (this.x > 800 - this.width) {
      this.x = 800 - this.width;
      this.velocityX = 0;
    }
  }

  /**
   * Update player state
   */
  private updateState(): void {
    // Update jumping state
    if (this.velocityY < 0) {
      this.isJumping = true;
    }
  }

  /**
   * Make the player jump
   */
  private jump(): void {
    if (!this.isOnGround) {
      return;
    }

    this.velocityY = -this.config.jumpPower;
    this.isOnGround = false;
    this.isJumping = true;
    
    this.logger.debug('Player jumped');
    
    this.eventBus.emit('player:jump', {
      x: this.x,
      y: this.y,
      velocityY: this.velocityY
    });
  }

  /**
   * Handle input
   */
  handleInput(key: string, pressed: boolean): void {
    if (pressed) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }
  }

  /**
   * Setup input handling
   */
  private setupInputHandling(): void {
    // This would typically be set up with actual DOM event listeners
    // For this tutorial, we'll handle it through the handleInput method
    this.logger.debug('Input handling setup complete');
  }

  /**
   * Reset the player
   */
  reset(): void {
    this.x = 100;
    this.y = 100;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = false;
    this.isJumping = false;
    this.isMoving = false;
    this.direction = 'none';
    this.keys.clear();
    
    this.logger.info('Player reset');
  }

  /**
   * Get player position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get player velocity
   */
  getVelocity(): { x: number; y: number } {
    return { x: this.velocityX, y: this.velocityY };
  }

  /**
   * Get player state
   */
  getState(): {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    isOnGround: boolean;
    isJumping: boolean;
    isMoving: boolean;
    direction: string;
  } {
    return {
      x: this.x,
      y: this.y,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      isOnGround: this.isOnGround,
      isJumping: this.isJumping,
      isMoving: this.isMoving,
      direction: this.direction
    };
  }

  /**
   * Check if player is colliding with another entity
   */
  isCollidingWith(other: { x: number; y: number; width: number; height: number }): boolean {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }

  /**
   * Destroy the player
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying player...');
    
    this.keys.clear();
    this.isInitialized = false;
    
    this.logger.info('Player destroyed');
  }
}

export default Player;
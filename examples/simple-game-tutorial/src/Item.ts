/**
 * Simple Game Tutorial - Item
 * 
 * Collectible item entity with physics and animation.
 * This is a complete implementation for the MIFF Framework tutorial.
 */

import { EventBus } from '../../../miff/pure/EventBusPure/index';
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface ItemConfig {
  width: number;
  height: number;
  fallSpeed: number;
  rotationSpeed: number;
  bounceHeight: number;
  bounceSpeed: number;
}

export type ItemType = 'coin' | 'gem' | 'powerup' | 'health';

export class Item {
  private logger: StructuredLogger;
  private eventBus: EventBus;
  private config: ItemConfig;
  
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: ItemType;
  public value: number;
  public rotation: number = 0;
  public bounceOffset: number = 0;
  public isCollected: boolean = false;
  public isVisible: boolean = true;
  
  private isInitialized: boolean = false;
  private bounceTime: number = 0;

  constructor(
    x: number, 
    y: number, 
    type: ItemType, 
    value: number, 
    eventBus: EventBus, 
    config?: Partial<ItemConfig>
  ) {
    this.logger = new StructuredLogger({ module: 'Item' });
    this.eventBus = eventBus;
    
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value;
    
    this.config = {
      width: 16,
      height: 16,
      fallSpeed: 2,
      rotationSpeed: 0.1,
      bounceHeight: 5,
      bounceSpeed: 0.05,
      ...config
    };
    
    this.width = this.config.width;
    this.height = this.config.height;
  }

  /**
   * Initialize the item
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Item already initialized');
      return;
    }

    try {
      this.logger.info('Initializing item...', { type: this.type, value: this.value });
      
      this.isInitialized = true;
      this.logger.info('Item initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize item', { error: error.message });
      throw error;
    }
  }

  /**
   * Update the item
   */
  update(deltaTime: number): void {
    if (!this.isInitialized || this.isCollected) {
      return;
    }

    this.updatePhysics(deltaTime);
    this.updateAnimation(deltaTime);
  }

  /**
   * Update item physics
   */
  private updatePhysics(deltaTime: number): void {
    // Fall down
    this.y += this.config.fallSpeed;
    
    // Apply bounce animation
    this.bounceTime += deltaTime * this.config.bounceSpeed;
    this.bounceOffset = Math.sin(this.bounceTime) * this.config.bounceHeight;
  }

  /**
   * Update item animation
   */
  private updateAnimation(deltaTime: number): void {
    // Rotate the item
    this.rotation += this.config.rotationSpeed;
    
    // Keep rotation within 0-2π range
    if (this.rotation >= Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }
  }

  /**
   * Collect the item
   */
  collect(): void {
    if (this.isCollected) {
      return;
    }

    this.isCollected = true;
    this.isVisible = false;
    
    this.logger.info('Item collected', { type: this.type, value: this.value });
    
    this.eventBus.emit('item:collected', {
      type: this.type,
      value: this.value,
      x: this.x,
      y: this.y
    });
  }

  /**
   * Get item position (including bounce offset)
   */
  getPosition(): { x: number; y: number } {
    return { 
      x: this.x, 
      y: this.y + this.bounceOffset 
    };
  }

  /**
   * Get item state
   */
  getState(): {
    x: number;
    y: number;
    type: ItemType;
    value: number;
    rotation: number;
    isCollected: boolean;
    isVisible: boolean;
  } {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
      value: this.value,
      rotation: this.rotation,
      isCollected: this.isCollected,
      isVisible: this.isVisible
    };
  }

  /**
   * Check if item is colliding with another entity
   */
  isCollidingWith(other: { x: number; y: number; width: number; height: number }): boolean {
    if (this.isCollected || !this.isVisible) {
      return false;
    }

    const pos = this.getPosition();
    return pos.x < other.x + other.width &&
           pos.x + this.width > other.x &&
           pos.y < other.y + other.height &&
           pos.y + this.height > other.y;
  }

  /**
   * Get item color based on type
   */
  getColor(): string {
    switch (this.type) {
      case 'coin':
        return '#FFD700'; // Gold
      case 'gem':
        return '#FF69B4'; // Hot pink
      case 'powerup':
        return '#00FF00'; // Green
      case 'health':
        return '#FF0000'; // Red
      default:
        return '#FFFFFF'; // White
    }
  }

  /**
   * Get item display name
   */
  getDisplayName(): string {
    switch (this.type) {
      case 'coin':
        return 'Coin';
      case 'gem':
        return 'Gem';
      case 'powerup':
        return 'Power-up';
      case 'health':
        return 'Health';
      default:
        return 'Item';
    }
  }

  /**
   * Reset the item
   */
  reset(): void {
    this.rotation = 0;
    this.bounceOffset = 0;
    this.bounceTime = 0;
    this.isCollected = false;
    this.isVisible = true;
    
    this.logger.info('Item reset', { type: this.type });
  }

  /**
   * Destroy the item
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying item...', { type: this.type });
    
    this.isCollected = true;
    this.isVisible = false;
    this.isInitialized = false;
    
    this.logger.info('Item destroyed');
  }
}

export default Item;
/**
 * Simple Game Tutorial - Physics
 * 
 * Basic physics system for gravity and collision detection.
 * This is a complete implementation for the MIFF Framework tutorial.
 */

import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface PhysicsConfig {
  gravity: number;
  airResistance: number;
  groundLevel: number;
  screenWidth: number;
  screenHeight: number;
}

export interface PhysicsEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  mass: number;
  isStatic: boolean;
  isOnGround: boolean;
}

export class Physics {
  private logger: StructuredLogger;
  private config: PhysicsConfig;
  private entities: Map<string, PhysicsEntity> = new Map();
  private isInitialized: boolean = false;

  constructor(config?: Partial<PhysicsConfig>) {
    this.logger = new StructuredLogger({ module: 'Physics' });
    
    this.config = {
      gravity: 0.5,
      airResistance: 0.99,
      groundLevel: 500,
      screenWidth: 800,
      screenHeight: 600,
      ...config
    };
  }

  /**
   * Initialize the physics system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Physics system already initialized');
      return;
    }

    try {
      this.logger.info('Initializing physics system...');
      
      this.isInitialized = true;
      this.logger.info('Physics system initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize physics system', { error: error.message });
      throw error;
    }
  }

  /**
   * Update the physics system
   */
  update(deltaTime: number): void {
    if (!this.isInitialized) {
      return;
    }

    this.updateEntities(deltaTime);
    this.checkCollisions();
    this.checkBoundaries();
  }

  /**
   * Add an entity to the physics system
   */
  addEntity(id: string, entity: PhysicsEntity): void {
    this.entities.set(id, entity);
    this.logger.debug('Entity added to physics system', { id });
  }

  /**
   * Remove an entity from the physics system
   */
  removeEntity(id: string): void {
    this.entities.delete(id);
    this.logger.debug('Entity removed from physics system', { id });
  }

  /**
   * Get an entity from the physics system
   */
  getEntity(id: string): PhysicsEntity | undefined {
    return this.entities.get(id);
  }

  /**
   * Update all entities
   */
  private updateEntities(deltaTime: number): void {
    for (const [id, entity] of this.entities) {
      if (entity.isStatic) {
        continue;
      }

      // Apply gravity
      entity.velocityY += this.config.gravity;
      
      // Apply air resistance
      entity.velocityX *= this.config.airResistance;
      entity.velocityY *= this.config.airResistance;
      
      // Update position
      entity.x += entity.velocityX;
      entity.y += entity.velocityY;
      
      // Check ground collision
      if (entity.y >= this.config.groundLevel - entity.height) {
        entity.y = this.config.groundLevel - entity.height;
        entity.velocityY = 0;
        entity.isOnGround = true;
      } else {
        entity.isOnGround = false;
      }
    }
  }

  /**
   * Check for collisions between entities
   */
  private checkCollisions(): void {
    const entityArray = Array.from(this.entities.entries());
    
    for (let i = 0; i < entityArray.length; i++) {
      for (let j = i + 1; j < entityArray.length; j++) {
        const [id1, entity1] = entityArray[i];
        const [id2, entity2] = entityArray[j];
        
        if (this.isColliding(entity1, entity2)) {
          this.handleCollision(id1, entity1, id2, entity2);
        }
      }
    }
  }

  /**
   * Check if two entities are colliding
   */
  private isColliding(entity1: PhysicsEntity, entity2: PhysicsEntity): boolean {
    return entity1.x < entity2.x + entity2.width &&
           entity1.x + entity1.width > entity2.x &&
           entity1.y < entity2.y + entity2.height &&
           entity1.y + entity1.height > entity2.y;
  }

  /**
   * Handle collision between two entities
   */
  private handleCollision(id1: string, entity1: PhysicsEntity, id2: string, entity2: PhysicsEntity): void {
    // Simple collision response - separate entities
    const overlapX = Math.min(
      entity1.x + entity1.width - entity2.x,
      entity2.x + entity2.width - entity1.x
    );
    const overlapY = Math.min(
      entity1.y + entity1.height - entity2.y,
      entity2.y + entity2.height - entity1.y
    );
    
    if (overlapX < overlapY) {
      // Separate horizontally
      const separation = overlapX / 2;
      if (entity1.x < entity2.x) {
        entity1.x -= separation;
        entity2.x += separation;
      } else {
        entity1.x += separation;
        entity2.x -= separation;
      }
      
      // Exchange horizontal momentum
      const tempVelX = entity1.velocityX;
      entity1.velocityX = entity2.velocityX;
      entity2.velocityX = tempVelX;
    } else {
      // Separate vertically
      const separation = overlapY / 2;
      if (entity1.y < entity2.y) {
        entity1.y -= separation;
        entity2.y += separation;
      } else {
        entity1.y += separation;
        entity2.y -= separation;
      }
      
      // Exchange vertical momentum
      const tempVelY = entity1.velocityY;
      entity1.velocityY = entity2.velocityY;
      entity2.velocityY = tempVelY;
    }
    
    this.logger.debug('Collision handled', { entity1: id1, entity2: id2 });
  }

  /**
   * Check screen boundaries
   */
  private checkBoundaries(): void {
    for (const [id, entity] of this.entities) {
      // Left boundary
      if (entity.x < 0) {
        entity.x = 0;
        entity.velocityX = 0;
      }
      
      // Right boundary
      if (entity.x + entity.width > this.config.screenWidth) {
        entity.x = this.config.screenWidth - entity.width;
        entity.velocityX = 0;
      }
      
      // Top boundary
      if (entity.y < 0) {
        entity.y = 0;
        entity.velocityY = 0;
      }
      
      // Bottom boundary (ground)
      if (entity.y + entity.height > this.config.groundLevel) {
        entity.y = this.config.groundLevel - entity.height;
        entity.velocityY = 0;
        entity.isOnGround = true;
      }
    }
  }

  /**
   * Apply force to an entity
   */
  applyForce(id: string, forceX: number, forceY: number): void {
    const entity = this.entities.get(id);
    if (!entity || entity.isStatic) {
      return;
    }
    
    entity.velocityX += forceX / entity.mass;
    entity.velocityY += forceY / entity.mass;
    
    this.logger.debug('Force applied', { id, forceX, forceY });
  }

  /**
   * Set entity velocity
   */
  setVelocity(id: string, velocityX: number, velocityY: number): void {
    const entity = this.entities.get(id);
    if (!entity) {
      return;
    }
    
    entity.velocityX = velocityX;
    entity.velocityY = velocityY;
    
    this.logger.debug('Velocity set', { id, velocityX, velocityY });
  }

  /**
   * Get entity velocity
   */
  getVelocity(id: string): { x: number; y: number } | null {
    const entity = this.entities.get(id);
    if (!entity) {
      return null;
    }
    
    return { x: entity.velocityX, y: entity.velocityY };
  }

  /**
   * Check if entity is on ground
   */
  isOnGround(id: string): boolean {
    const entity = this.entities.get(id);
    return entity ? entity.isOnGround : false;
  }

  /**
   * Get physics configuration
   */
  getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  /**
   * Update physics configuration
   */
  updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Physics configuration updated', newConfig);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Map<string, PhysicsEntity> {
    return new Map(this.entities);
  }

  /**
   * Get entity count
   */
  getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Clear all entities
   */
  clearEntities(): void {
    this.entities.clear();
    this.logger.info('All entities cleared from physics system');
  }

  /**
   * Destroy the physics system
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying physics system...');
    
    this.entities.clear();
    this.isInitialized = false;
    
    this.logger.info('Physics system destroyed');
  }
}

export default Physics;
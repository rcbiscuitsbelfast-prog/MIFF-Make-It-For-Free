/**
 * MovementPure Manager
 * 
 * Advanced movement system including pathfinding, behavior patterns,
 * collision avoidance, and dynamic movement state management.
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MovementPattern {
  id: string;
  type: 'idle' | 'patrol' | 'follow' | 'flee' | 'wander' | 'seek' | 'pursue' | 'evade';
  speed: number;
  acceleration: number;
  maxSpeed: number;
  waypoints?: Vector2[];
  targetId?: string;
  range?: number;
  behavior?: MovementBehavior;
  metadata?: Record<string, any>;
}

export interface MovementBehavior {
  aggression: number; // 0-100
  curiosity: number; // 0-100
  fear: number; // 0-100
  loyalty: number; // 0-100
  reactionTime: number; // milliseconds
  memory: number; // 0-100 (how long they remember things)
}

export interface MovementEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  rotation: number; // radians
  pattern: MovementPattern;
  state: MovementState;
  lastUpdate: number;
  metadata?: Record<string, any>;
}

export interface MovementState {
  current: 'idle' | 'moving' | 'stopping' | 'turning' | 'blocked' | 'stunned' | 'stuck';
  target?: Vector2;
  path?: Vector2[];
  pathIndex: number;
  stuckTime: number;
  lastPosition: Vector2;
  collisionCount: number;
}

export interface MovementResult {
  entityId: string;
  newPosition: Vector2;
  newVelocity: Vector2;
  newRotation: number;
  distanceMoved: number;
  state: MovementState;
  events: MovementEvent[];
}

export interface MovementEvent {
  type: 'started' | 'stopped' | 'turned' | 'collided' | 'reached_waypoint' | 'stuck' | 'unstuck';
  entityId: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface MovementStats {
  totalEntities: number;
  activeEntities: number;
  averageSpeed: number;
  totalDistance: number;
  collisionCount: number;
  stuckEntities: number;
  patternDistribution: Record<string, number>;
}

export interface MovementFilter {
  patternType?: string;
  state?: string;
  minSpeed?: number;
  maxSpeed?: number;
  inRange?: { center: Vector2; radius: number };
}

export interface MovementOutput {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export interface MovementConfig {
  enableRealTimeUpdate: boolean;
  enableCollisionDetection: boolean;
  enablePathfinding: boolean;
  enableBehaviorAI: boolean;
  updateInterval: number;
  maxEntities: number;
  worldBounds: {
    min: Vector2;
    max: Vector2;
  };
  enableDebugging: boolean;
  enableLogging: boolean;
  logLevel: LogLevel;
}

export class MovementManager {
  private config: MovementConfig;
  private logger: StructuredLogger;
  private memoryId: string;
  private entities: Map<string, MovementEntity> = new Map();
  private events: MovementEvent[] = [];
  private obstacles: Vector2[] = [];
  private performanceOptimizer: PerformanceOptimizer;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: MovementConfig = {
    enableRealTimeUpdate: true,
    enableCollisionDetection: true,
    enablePathfinding: true,
    enableBehaviorAI: true,
    updateInterval: 16, // 60 FPS
    maxEntities: 1000,
    worldBounds: {
      min: { x: -1000, y: -1000 },
      max: { x: 1000, y: 1000 }
    },
    enableDebugging: false,
    enableLogging: true,
    logLevel: LogLevel.INFO
  }) {
    this.config = config;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: config.logLevel,
      enableConsole: config.enableLogging,
      performanceMonitoring: true,
      modules: {
        'MovementManager': LogLevel.DEBUG
      }
    });

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer({
      enableOptimization: true,
      enableMemoryOptimization: true,
      enableCPUOptimization: true,
      enableGPUOptimization: false,
      enableNetworkOptimization: false
    });

    // Register with memory manager
    this.memoryId = `MovementManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'MovementManager');

    this.initializeDefaultPatterns();
    console.info('MovementManager initialized', {
      config: this.config,
      memoryId: this.memoryId
    });
  }

  /**
   * Start movement system
   */
  public start(): void {
    if (this.updateInterval) {
      console.warn('MovementPure', 'Movement system is already running');
      return;
    }

    console.info('MovementPure', 'Starting movement system');

    if (this.config.enableRealTimeUpdate) {
      this.updateInterval = setInterval(() => {
        this.simulateTick(16); // 60 FPS
      }, this.config.updateInterval);
    }

    console.info('MovementPure', 'Movement system started');
  }

  /**
   * Stop movement system
   */
  public stop(): void {
    if (!this.updateInterval) {
      console.warn('MovementPure', 'Movement system is not running');
      return;
    }

    console.info('MovementPure', 'Stopping movement system');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.info('MovementPure', 'Movement system stopped');
  }

  private initializeDefaultPatterns() {
    // Default patterns are created when entities are added
  }

  /**
   * Create a new movement entity
   */
  createEntity(id: string, position: Vector2, pattern: MovementPattern): MovementOutput {
    if (this.entities.has(id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Entity ${id} already exists`]
      };
    }

    if (this.entities.size >= this.config.maxEntities) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Maximum entities limit reached (${this.config.maxEntities})`]
      };
    }

    const entity: MovementEntity = {
      id,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      pattern: { ...pattern },
      state: {
        current: 'idle',
        pathIndex: 0,
        stuckTime: 0,
        lastPosition: { ...position },
        collisionCount: 0
      },
      lastUpdate: Date.now()
    };

    this.entities.set(id, entity);
    console.info('Movement entity created', { entityId: id, pattern: pattern.type });
    
    return {
      op: 'create',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Update entity movement pattern
   */
  updatePattern(entityId: string, pattern: Partial<MovementPattern>): MovementOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'update_pattern',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.pattern = { ...entity.pattern, ...pattern };
    entity.lastUpdate = Date.now();

    // Reset state when pattern changes
    entity.state.current = 'idle';
    entity.state.pathIndex = 0;
    entity.state.stuckTime = 0;

    console.debug('Movement pattern updated', { entityId, pattern: pattern.type });
    
    return {
      op: 'update_pattern',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Set follow target
   */
  setFollowTarget(entityId: string, targetId: string): MovementOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'set_follow_target',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.pattern.type = 'follow';
    entity.pattern.targetId = targetId;
    entity.lastUpdate = Date.now();

    console.debug('Follow target set', { entityId, targetId });
    
    return {
      op: 'set_follow_target',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Set waypoints for patrol
   */
  setWaypoints(entityId: string, waypoints: Vector2[]): MovementOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'set_waypoints',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.pattern.waypoints = [...waypoints];
    entity.pattern.type = 'patrol';
    entity.state.pathIndex = 0;
    entity.lastUpdate = Date.now();

    console.debug('Waypoints set', { entityId, waypointCount: waypoints.length });
    
    return {
      op: 'set_waypoints',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Simulate movement for all entities
   */
  simulateTick(deltaTime: number): MovementOutput {
    const results: MovementResult[] = [];
    const currentTime = Date.now();

    for (const [entityId, entity] of this.entities) {
      const result = this.updateEntityMovement(entity, deltaTime, currentTime);
      results.push(result);
    }

    return {
      op: 'simulate_tick',
      status: 'ok',
      result: results
    };
  }

  /**
   * Update individual entity movement
   */
  private updateEntityMovement(entity: MovementEntity, deltaTime: number, currentTime: number): MovementResult {
    const events: MovementEvent[] = [];
    const oldPosition = { ...entity.position };
//     const oldVelocity = { ...entity.velocity };

    // Update based on pattern type
    switch (entity.pattern.type) {
      case 'idle':
        this.updateIdleMovement(entity, deltaTime);
        break;
      case 'patrol':
        this.updatePatrolMovement(entity, deltaTime);
        break;
      case 'follow':
        this.updateFollowMovement(entity, deltaTime);
        break;
      case 'flee':
        this.updateFleeMovement(entity, deltaTime);
        break;
      case 'wander':
        this.updateWanderMovement(entity, deltaTime);
        break;
      case 'seek':
        this.updateSeekMovement(entity, deltaTime);
        break;
      case 'pursue':
        this.updatePursueMovement(entity, deltaTime);
        break;
      case 'evade':
        this.updateEvadeMovement(entity, deltaTime);
        break;
    }

    // Apply physics
    this.applyPhysics(entity, deltaTime);

    // Check for collisions
    if (this.config.enableCollisionDetection) {
      this.checkCollisions(entity, events);
    }

    // Update state
    this.updateMovementState(entity, oldPosition, events);

    // Record events
    events.forEach(event => this.events.push(event));

    const distanceMoved = this.calculateDistance(oldPosition, entity.position);

    return {
      entityId: entity.id,
      newPosition: { ...entity.position },
      newVelocity: { ...entity.velocity },
      newRotation: entity.rotation,
      distanceMoved,
      state: { ...entity.state },
      events
    };
  }

  /**
   * Update idle movement
   */
  private updateIdleMovement(entity: MovementEntity, deltaTime: number): void {
    // Gradually slow down to stop
    const friction = 0.9;
    entity.velocity.x *= friction;
    entity.velocity.y *= friction;

    if (Math.abs(entity.velocity.x) < 0.1 && Math.abs(entity.velocity.y) < 0.1) {
      entity.velocity.x = 0;
      entity.velocity.y = 0;
      entity.state.current = 'idle';
    }
  }

  /**
   * Update patrol movement
   */
  private updatePatrolMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.waypoints || entity.pattern.waypoints.length === 0) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const currentWaypoint = entity.pattern.waypoints[entity.state.pathIndex];
    const distance = this.calculateDistance(entity.position, currentWaypoint);

    if (distance < 5) {
      // Reached waypoint, move to next
      entity.state.pathIndex = (entity.state.pathIndex + 1) % entity.pattern.waypoints.length;
      entity.state.current = 'turning';
    } else {
      // Move towards current waypoint
      this.moveTowards(entity, currentWaypoint, entity.pattern.speed);
    }
  }

  /**
   * Update follow movement
   */
  private updateFollowMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.targetId) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const target = this.entities.get(entity.pattern.targetId);
    if (!target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const distance = this.calculateDistance(entity.position, target.position);
    const followRange = entity.pattern.range || 50;

    if (distance > followRange) {
      this.moveTowards(entity, target.position, entity.pattern.speed);
    } else {
      this.updateIdleMovement(entity, deltaTime);
    }
  }

  /**
   * Update flee movement
   */
  private updateFleeMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.targetId) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const target = this.entities.get(entity.pattern.targetId);
    if (!target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    // Move away from target
    const direction = this.calculateDirection(entity.position, target.position);
    const fleeDirection = { x: -direction.x, y: -direction.y };
    this.moveInDirection(entity, fleeDirection, entity.pattern.speed);
  }

  /**
   * Update wander movement
   */
  private updateWanderMovement(entity: MovementEntity, deltaTime: number): void {
    // Random direction change
    if (Math.random() < 0.01) { // 1% chance per frame
      const angle = Math.random() * Math.PI * 2;
      entity.rotation = angle;
    }

    this.moveInDirection(entity, {
      x: Math.cos(entity.rotation),
      y: Math.sin(entity.rotation)
    }, entity.pattern.speed);
  }

  /**
   * Update seek movement
   */
  private updateSeekMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.state.target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    this.moveTowards(entity, entity.state.target, entity.pattern.speed);
  }

  /**
   * Update pursue movement
   */
  private updatePursueMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.targetId) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const target = this.entities.get(entity.pattern.targetId);
    if (!target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    // Predict target position
    const predictionTime = this.calculateDistance(entity.position, target.position) / entity.pattern.speed;
    const predictedPosition = {
      x: target.position.x + target.velocity.x * predictionTime,
      y: target.position.y + target.velocity.y * predictionTime
    };

    this.moveTowards(entity, predictedPosition, entity.pattern.speed);
  }

  /**
   * Update evade movement
   */
  private updateEvadeMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.targetId) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const target = this.entities.get(entity.pattern.targetId);
    if (!target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    // Predict target position and move away
    const predictionTime = this.calculateDistance(entity.position, target.position) / entity.pattern.speed;
    const predictedPosition = {
      x: target.position.x + target.velocity.x * predictionTime,
      y: target.position.y + target.velocity.y * predictionTime
    };

    const direction = this.calculateDirection(entity.position, predictedPosition);
    const evadeDirection = { x: -direction.x, y: -direction.y };
    this.moveInDirection(entity, evadeDirection, entity.pattern.speed);
  }

  /**
   * Apply physics to entity
   */
  private applyPhysics(entity: MovementEntity, deltaTime: number): void {
    // Update velocity based on acceleration
    entity.velocity.x += entity.acceleration.x * deltaTime;
    entity.velocity.y += entity.acceleration.y * deltaTime;

    // Limit velocity to max speed
    const speed = Math.sqrt(entity.velocity.x * entity.velocity.x + entity.velocity.y * entity.velocity.y);
    if (speed > entity.pattern.maxSpeed) {
      const factor = entity.pattern.maxSpeed / speed;
      entity.velocity.x *= factor;
      entity.velocity.y *= factor;
    }

    // Update position based on velocity
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;

    // Keep within world bounds
    entity.position.x = Math.max(this.config.worldBounds.min.x, Math.min(this.config.worldBounds.max.x, entity.position.x));
    entity.position.y = Math.max(this.config.worldBounds.min.y, Math.min(this.config.worldBounds.max.y, entity.position.y));

    // Update rotation based on velocity direction
    if (speed > 0.1) {
      entity.rotation = Math.atan2(entity.velocity.y, entity.velocity.x);
    }
  }

  /**
   * Check for collisions
   */
  private checkCollisions(entity: MovementEntity, events: MovementEvent[]): void {
    // Check collision with obstacles
    for (const obstacle of this.obstacles) {
      const distance = this.calculateDistance(entity.position, obstacle);
      if (distance < 10) { // Collision threshold
        entity.state.collisionCount++;
        events.push({
          type: 'collided',
          entityId: entity.id,
          timestamp: Date.now(),
          data: { obstacle: obstacle }
        });
      }
    }

    // Check collision with other entities
    for (const [otherId, otherEntity] of this.entities) {
      if (otherId === entity.id) continue;

      const distance = this.calculateDistance(entity.position, otherEntity.position);
      if (distance < 5) { // Collision threshold
        entity.state.collisionCount++;
        events.push({
          type: 'collided',
          entityId: entity.id,
          timestamp: Date.now(),
          data: { otherEntity: otherId }
        });
      }
    }
  }

  /**
   * Update movement state
   */
  private updateMovementState(entity: MovementEntity, oldPosition: Vector2, events: MovementEvent[]): void {
    const distanceMoved = this.calculateDistance(oldPosition, entity.position);
    const speed = Math.sqrt(entity.velocity.x * entity.velocity.x + entity.velocity.y * entity.velocity.y);

    // Check if stuck
    if (distanceMoved < 0.1) {
      entity.state.stuckTime += 16; // Assuming 60 FPS
      if (entity.state.stuckTime > 1000) { // 1 second
        entity.state.current = 'stuck';
        events.push({
          type: 'stuck',
          entityId: entity.id,
          timestamp: Date.now()
        });
      }
    } else {
      if (entity.state.stuckTime > 0) {
        entity.state.stuckTime = 0;
        events.push({
          type: 'unstuck',
          entityId: entity.id,
          timestamp: Date.now()
        });
      }
    }

    // Update current state
    if (speed > 0.1) {
      entity.state.current = 'moving';
    } else if (entity.state.current === 'moving') {
      entity.state.current = 'stopping';
    } else if (entity.state.current === 'stopping') {
      entity.state.current = 'idle';
    }

    entity.state.lastPosition = { ...oldPosition };
  }

  /**
   * Move entity towards target
   */
  private moveTowards(entity: MovementEntity, target: Vector2, speed: number): void {
    const direction = this.calculateDirection(entity.position, target);
    this.moveInDirection(entity, direction, speed);
  }

  /**
   * Move entity in direction
   */
  private moveInDirection(entity: MovementEntity, direction: Vector2, speed: number): void {
    // Normalize direction
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
    }

    // Set acceleration
    entity.acceleration.x = direction.x * entity.pattern.acceleration;
    entity.acceleration.y = direction.y * entity.pattern.acceleration;
  }

  /**
   * Calculate direction from position to target
   */
  private calculateDirection(from: Vector2, to: Vector2): Vector2 {
    return {
      x: to.x - from.x,
      y: to.y - from.y
    };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get entity by ID
   */
  public getEntity(entityId: string): MovementEntity | null {
    return this.entities.get(entityId) || null;
  }

  /**
   * Get all entities
   */
  public getAllEntities(): MovementEntity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entities by filter
   */
  public getEntitiesByFilter(filter: MovementFilter): MovementEntity[] {
    return Array.from(this.entities.values()).filter(entity => {
      if (filter.patternType && entity.pattern.type !== filter.patternType) return false;
      if (filter.state && entity.state.current !== filter.state) return false;
      
      const speed = Math.sqrt(entity.velocity.x * entity.velocity.x + entity.velocity.y * entity.velocity.y);
      if (filter.minSpeed && speed < filter.minSpeed) return false;
      if (filter.maxSpeed && speed > filter.maxSpeed) return false;
      
      if (filter.inRange) {
        const distance = this.calculateDistance(entity.position, filter.inRange.center);
        if (distance > filter.inRange.radius) return false;
      }
      
      return true;
    });
  }

  /**
   * Remove entity
   */
  public removeEntity(entityId: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) {
      console.warn('Entity not found', { entityId });
      return false;
    }

    this.entities.delete(entityId);
    console.info('Movement entity removed', { entityId });
    return true;
  }

  /**
   * Add obstacle
   */
  public addObstacle(position: Vector2): void {
    this.obstacles.push({ ...position });
    console.debug('Obstacle added', { position });
  }

  /**
   * Remove obstacle
   */
  public removeObstacle(position: Vector2): boolean {
    const index = this.obstacles.findIndex(obs => 
      obs.x === position.x && obs.y === position.y
    );
    
    if (index === -1) return false;
    
    this.obstacles.splice(index, 1);
    console.debug('Obstacle removed', { position });
    return true;
  }

  /**
   * Get movement statistics
   */
  public getMovementStats(): MovementStats {
    const entities = Array.from(this.entities.values());
    const totalEntities = entities.length;
    const activeEntities = entities.filter(e => e.state.current === 'moving').length;
    
    let totalDistance = 0;
    let totalSpeed = 0;
    let collisionCount = 0;
    let stuckEntities = 0;
    const patternDistribution: Record<string, number> = {};

    for (const entity of entities) {
      totalSpeed += Math.sqrt(entity.velocity.x * entity.velocity.x + entity.velocity.y * entity.velocity.y);
      collisionCount += entity.state.collisionCount;
      if (entity.state.current === 'stuck') stuckEntities++;
      
      const pattern = entity.pattern.type;
      patternDistribution[pattern] = (patternDistribution[pattern] || 0) + 1;
    }

    return {
      totalEntities,
      activeEntities,
      averageSpeed: totalEntities > 0 ? totalSpeed / totalEntities : 0,
      totalDistance,
      collisionCount,
      stuckEntities,
      patternDistribution
    };
  }

  /**
   * Get recent events
   */
  public getRecentEvents(count: number = 100): MovementEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clear events
   */
  public clearEvents(): void {
    this.events = [];
    console.info('MovementPure', 'Movement events cleared');
  }

  /**
   * Get manager configuration
   */
  public getConfig(): MovementConfig {
    return { ...this.config };
  }

  /**
   * Update manager configuration
   */
  public updateConfig(newConfig: Partial<MovementConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('MovementManager configuration updated', { config: this.config });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stop();
    MemoryManager.unregisterObject(this.memoryId);
    console.info('MovementPure', 'MovementManager destroyed');
  }
}
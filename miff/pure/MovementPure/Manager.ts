/**
 * MovementPure Manager
 * 
 * Advanced movement system including pathfinding, behavior patterns,
 * collision avoidance, and dynamic movement state management.
 */

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
  current: 'idle' | 'moving' | 'stopping' | 'turning' | 'blocked' | 'stunned';
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
  result?: MovementEntity | MovementEntity[] | MovementResult | MovementStats;
  issues?: string[];
}

export class MovementManager {
  private entities: Map<string, MovementEntity> = new Map();
  private events: MovementEvent[] = [];
  private obstacles: Vector2[] = [];
  private worldBounds: { min: Vector2; max: Vector2 } = {
    min: { x: -1000, y: -1000 },
    max: { x: 1000, y: 1000 }
  };

  constructor() {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.initializeDefaultPatterns();
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
    const oldVelocity = { ...entity.velocity };

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
    this.checkCollisions(entity, events);

    // Update state
    this.updateMovementState(entity, oldPosition, events);

    // Record events
    events.forEach((event: any) => this.events.push(event));

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
    const direction = this.calculateDirection(target.position, entity.position);
    entity.velocity.x = direction.x * entity.pattern.speed;
    entity.velocity.y = direction.y * entity.pattern.speed;
  }

  /**
   * Update wander movement
   */
  private updateWanderMovement(entity: MovementEntity, deltaTime: number): void {
    // If entity is not moving, give it an initial random direction
    const currentSpeed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
    if (currentSpeed < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      entity.velocity.x = Math.cos(angle) * entity.pattern.speed;
      entity.velocity.y = Math.sin(angle) * entity.pattern.speed;
    }
    // Random direction changes
    else if (Math.random() < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      entity.velocity.x = Math.cos(angle) * entity.pattern.speed;
      entity.velocity.y = Math.sin(angle) * entity.pattern.speed;
    }
  }

  /**
   * Update seek movement
   */
  private updateSeekMovement(entity: MovementEntity, deltaTime: number): void {
    if (!entity.pattern.target) {
      this.updateIdleMovement(entity, deltaTime);
      return;
    }

    const distance = this.calculateDistance(entity.position, entity.pattern.target);
    const arrivalThreshold = 0.1; // Stop when within 0.1 units of target

    if (distance > arrivalThreshold) {
      // Check if we would overshoot the target
      const maxDistanceThisTick = entity.pattern.speed * deltaTime;
      if (distance <= maxDistanceThisTick) {
        // Move directly to target to avoid overshooting
        entity.velocity.x = (entity.pattern.target.x - entity.position.x) / deltaTime;
        entity.velocity.y = (entity.pattern.target.y - entity.position.y) / deltaTime;
      } else {
        this.moveTowards(entity, entity.pattern.target, entity.pattern.speed);
      }
    } else {
      // Stop when reached target
      entity.velocity.x = 0;
      entity.velocity.y = 0;
    }
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
    const predictedPosition = this.predictPosition(target, deltaTime);
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

    // Predict where target will be and move away
    const predictedPosition = this.predictPosition(target, deltaTime);
    const direction = this.calculateDirection(predictedPosition, entity.position);
    entity.velocity.x = direction.x * entity.pattern.speed;
    entity.velocity.y = direction.y * entity.pattern.speed;
  }

  /**
   * Apply physics to entity
   */
  private applyPhysics(entity: MovementEntity, deltaTime: number): void {
    // Update position
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;

    // Apply acceleration
    entity.velocity.x += entity.acceleration.x * deltaTime;
    entity.velocity.y += entity.acceleration.y * deltaTime;

    // Limit speed
    const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
    if (speed > entity.pattern.maxSpeed) {
      entity.velocity.x = (entity.velocity.x / speed) * entity.pattern.maxSpeed;
      entity.velocity.y = (entity.velocity.y / speed) * entity.pattern.maxSpeed;
    }

    // Update rotation
    if (speed > 0.1) {
      entity.rotation = Math.atan2(entity.velocity.y, entity.velocity.x);
    }

    // Keep within world bounds
    entity.position.x = Math.max(this.worldBounds.min.x, Math.min(this.worldBounds.max.x, entity.position.x));
    entity.position.y = Math.max(this.worldBounds.min.y, Math.min(this.worldBounds.max.y, entity.position.y));
  }

  /**
   * Check for collisions
   */
  private checkCollisions(entity: MovementEntity, events: MovementEvent[]): void {
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      const distance = this.calculateDistance(entity.position, obstacle);
      if (distance < 10) {
        entity.state.collisionCount++;
        events.push({
          type: 'collided',
          entityId: entity.id,
          timestamp: new Date(),
          data: { obstacle }
        });
      }
    }

    // Check entity collisions
    for (const [otherId, other] of this.entities) {
      if (otherId === entity.id) continue;

      const distance = this.calculateDistance(entity.position, other.position);
      if (distance < 20) {
        entity.state.collisionCount++;
        events.push({
          type: 'collided',
          entityId: entity.id,
          timestamp: new Date(),
          data: { otherEntity: otherId }
        });
      }
    }
  }

  /**
   * Update movement state
   */
  private updateMovementState(entity: MovementEntity, oldPosition: Vector2, events: MovementEvent[]): void {
    const distance = this.calculateDistance(oldPosition, entity.position);
    const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);

    // Check if stuck
    if (distance < 0.1) {
      entity.state.stuckTime += 1;
      if (entity.state.stuckTime > 60) { // 1 second at 60fps
        entity.state.current = 'stuck';
        events.push({
          type: 'stuck',
          entityId: entity.id,
          timestamp: new Date()
        });
      }
    } else {
      if (entity.state.stuckTime > 0) {
        events.push({
          type: 'unstuck',
          entityId: entity.id,
          timestamp: new Date()
        });
      }
      entity.state.stuckTime = 0;
    }

    // Update state based on movement
    if (speed > 0.1) {
      entity.state.current = 'moving';
    } else {
      entity.state.current = 'idle';
    }

    entity.state.lastPosition = { ...oldPosition };
    entity.lastUpdate = Date.now();
  }

  /**
   * Move entity towards target
   */
  private moveTowards(entity: MovementEntity, target: Vector2, speed: number): void {
    const direction = this.calculateDirection(entity.position, target);
    entity.velocity.x = direction.x * speed;
    entity.velocity.y = direction.y * speed;
  }

  /**
   * Calculate direction from one point to another
   */
  private calculateDirection(from: Vector2, to: Vector2): Vector2 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0 };
    
    return { x: dx / distance, y: dy / distance };
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
   * Predict entity position
   */
  private predictPosition(entity: MovementEntity, deltaTime: number): Vector2 {
    return {
      x: entity.position.x + entity.velocity.x * deltaTime,
      y: entity.position.y + entity.velocity.y * deltaTime
    };
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: string): MovementOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: entity
    };
  }

  /**
   * List all entities
   */
  listEntities(filter?: MovementFilter): MovementOutput {
    let entities = Array.from(this.entities.values());

    if (filter) {
      entities = entities.filter((entity: any) => {
        if (filter.patternType && entity.pattern.type !== filter.patternType) return false;
        if (filter.state && entity.state.current !== filter.state) return false;
        if (filter.minSpeed !== undefined) {
          const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
          if (speed < filter.minSpeed) return false;
        }
        if (filter.maxSpeed !== undefined) {
          const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
          if (speed > filter.maxSpeed) return false;
        }
        if (filter.inRange) {
          const distance = this.calculateDistance(entity.position, filter.inRange.center);
          if (distance > filter.inRange.radius) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: entities
    };
  }

  /**
   * Get movement statistics
   */
  getMovementStats(): MovementOutput {
    const entities = Array.from(this.entities.values());
    const stats: MovementStats = {
      totalEntities: entities.length,
      activeEntities: entities.filter((e: any) => e.state.current === 'moving').length,
      averageSpeed: 0,
      totalDistance: 0,
      collisionCount: entities.reduce((sum, e) => sum + e.state.collisionCount, 0),
      stuckEntities: entities.filter((e: any) => e.state.current === 'stuck').length,
      patternDistribution: {}
    };

    if (entities.length > 0) {
      const totalSpeed = entities.reduce((sum, e) => {
        const speed = Math.sqrt(e.velocity.x ** 2 + e.velocity.y ** 2);
        return sum + speed;
      }, 0);
      stats.averageSpeed = totalSpeed / entities.length;
    }

    // Calculate pattern distribution
    entities.forEach((entity: any) => {
      const type = entity.pattern.type;
      stats.patternDistribution[type!] = (stats.patternDistribution[type!] || 0) + 1;
    });

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Add obstacle
   */
  addObstacle(position: Vector2): MovementOutput {
    this.obstacles.push({ ...position });
    return {
      op: 'add_obstacle',
      status: 'ok',
      result: { position, totalObstacles: this.obstacles.length }
    };
  }

  /**
   * Remove entity
   */
  removeEntity(entityId: string): MovementOutput {
    if (!this.entities.has(entityId)) {
      return {
        op: 'remove',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    this.entities.delete(entityId);
    return {
      op: 'remove',
      status: 'ok'
    };
  }

  /**
   * Export movement data
   */
  exportMovement(format: 'json' | 'manifest' | 'summary' | 'events' = 'json'): MovementOutput {
    const entities = Array.from(this.entities.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: { entities, total: entities.length }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.movement.export.v1',
            entities,
            events: this.events.slice(-100), // Last 100 events
            obstacles: this.obstacles,
            worldBounds: this.worldBounds,
            exportedAt: Date.now().toISOString(),
            total: entities.length
          }
        };
      
      case 'summary':
        const stats = this.getMovementStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            entities: entities.map((entity: any) => ({
              id: entity.id,
              position: entity.position,
              pattern: entity.pattern.type,
              state: entity.state.current,
              speed: Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2)
            }))
          }
        };
      
      case 'events':
        return {
          op: 'export',
          status: 'ok',
          result: {
            events: this.events,
            total: this.events.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset all movement data
   */
  resetMovement(): MovementOutput {
    this.entities.clear();
    this.events = [];
    this.obstacles = [];
    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'All movement data reset' }
    };
  }
}
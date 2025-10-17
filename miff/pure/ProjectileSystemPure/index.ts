// ProjectileSystemPure - Advanced projectile simulation with physics integration

export type Vec2 = { x: number; y: number };

export type Projectile = { 
  id: string; 
  position: Vec2; 
  velocity: Vec2; 
  ttl: number; // time to live in seconds
  damage?: number;
  radius?: number; // collision radius
  mass?: number; // for physics calculations
  gravity?: Vec2; // per-projectile gravity override
  friction?: number; // air resistance
  bounces?: number; // remaining bounces
  restitution?: number; // bounce factor
  tags?: string[]; // for filtering and identification
  ownerId?: string; // who fired this projectile
  type?: 'bullet' | 'arrow' | 'fireball' | 'rocket' | 'beam';
};

export type ProjectileWorld = {
  projectiles: Projectile[];
  defaultGravity?: Vec2;
  defaultFriction?: number;
  bounds?: { min: Vec2; max: Vec2 }; // world boundaries
  timeStep?: number;
};

export type ListOutput = { op: 'list'; ids: string[]; count: number; activeProjectiles: number };
export type StepOutput = { op: 'step'; dt: number; updated: Projectile[]; expired: string[]; outOfBounds: string[] };
export type CreateOutput = { op: 'create'; status: 'ok' | 'error'; projectile?: Projectile; issues?: string[] };
export type RemoveOutput = { op: 'remove'; status: 'ok' | 'error'; removed: boolean };
export type DumpOutput = { op: 'dump'; projectile?: Projectile };
export type ClearOutput = { op: 'clear'; status: 'ok'; removed: number };
export type AnalyticsOutput = { 
  op: 'analytics'; 
  totalProjectiles: number; 
  averageVelocity: number; 
  totalKineticEnergy: number;
  typeDistribution: Record<string, number>;
  averageTTL: number;
};
export type ExportOutput = { op: 'export'; status: 'ok' | 'error'; format: string; data?: any; issues?: string[] };
export type CollisionCheckOutput = { 
  op: 'collisionCheck'; 
  collisions: Array<{ projectileId: string; targetId: string; point: Vec2; normal: Vec2 }> 
};

export class ProjectileManager {
  private projectiles = new Map<string, Projectile>();
  private defaultGravity: Vec2 = { x: 0, y: -9.8 };
  private defaultFriction = 0.01;
  private bounds = { min: { x: -100, y: -100 }, max: { x: 100, y: 100 } };
  private timeStep = 1/60;
  private simulationTime = 0;

  load(world: ProjectileWorld): void {
    this.projectiles.clear();
    this.defaultGravity = world.defaultGravity || { x: 0, y: -9.8 };
    this.defaultFriction = world.defaultFriction ?? 0.01;
    this.bounds = world.bounds || { min: { x: -100, y: -100 }, max: { x: 100, y: 100 } };
    this.timeStep = world.timeStep ?? 1/60;
    
    for (const p of world.projectiles) {
      this.projectiles.set(p.id, JSON.parse(JSON.stringify(p)));
    }
  }

  list(): ListOutput {
    const activeCount = Array.from(this.projectiles.values()).filter((p: any) => p.ttl > 0).length;
    return {
      op: 'list',
      ids: Array.from(this.projectiles.keys()),
      count: this.projectiles.size,
      activeProjectiles: activeCount
    };
  }

  create(projectile: Projectile): CreateOutput {
    if (this.projectiles.has(projectile.id)) {
      return { op: 'create', status: 'error', issues: [`Projectile ${projectile.id} already exists`] };
    }
    
    // Validate projectile
    const issues: string[] = [];
    if (projectile.ttl <= 0) issues.push('TTL must be positive');
    if (projectile.mass && projectile.mass <= 0) issues.push('Mass must be positive');
    if (projectile.radius && projectile.radius <= 0) issues.push('Radius must be positive');
    if (projectile.damage && projectile.damage < 0) issues.push('Damage cannot be negative');
    if (projectile.friction && (projectile.friction < 0 || projectile.friction > 1)) issues.push('Friction must be between 0 and 1');
    if (projectile.restitution && (projectile.restitution < 0 || projectile.restitution > 1)) issues.push('Restitution must be between 0 and 1');
    
    if (issues.length > 0) return { op: 'create', status: 'error', issues };
    
    // Set defaults
    const fullProjectile: Projectile = {
      mass: 1,
      radius: 0.1,
      damage: 10,
      friction: this.defaultFriction,
      bounces: 0,
      restitution: 0.5,
      type: 'bullet',
      ...projectile
    };
    
    this.projectiles.set(projectile.id, JSON.parse(JSON.stringify(fullProjectile)));
    return { op: 'create', status: 'ok', projectile: fullProjectile };
  }

  remove(id: string): RemoveOutput {
    const removed = this.projectiles.delete(id);
    return { op: 'remove', status: 'ok', removed };
  }

  clear(): ClearOutput {
    const count = this.projectiles.size;
    this.projectiles.clear();
    return { op: 'clear', status: 'ok', removed: count };
  }

  step(dt: number): StepOutput {
    this.simulationTime += dt;
    const updated: Projectile[] = [];
    const expired: string[] = [];
    const outOfBounds: string[] = [];
    
    for (const [id, projectile] of this.projectiles) {
      // Update TTL
      projectile.ttl = Math.max(0, projectile.ttl - dt);
      
      if (projectile.ttl <= 0) {
        expired.push(id);
        continue;
      }
      
      // Apply physics
      const gravity = projectile.gravity ?? this.defaultGravity;
      const friction = projectile.friction ?? this.defaultFriction;
      const mass = projectile.mass ?? 1;
      
      // Apply gravity
      projectile.velocity.x += gravity.x * dt;
      projectile.velocity.y += gravity.y * dt;
      
      // Apply friction/air resistance
      const damping = Math.max(0, 1 - friction * dt);
      projectile.velocity.x *= damping;
      projectile.velocity.y *= damping;
      
      // Update position
      projectile.position.x += projectile.velocity.x * dt;
      projectile.position.y += projectile.velocity.y * dt;
      
      // Check bounds
      if (projectile.position.x < this.bounds.min.x || projectile.position.x > this.bounds.max.x ||
          projectile.position.y < this.bounds.min.y || projectile.position.y > this.bounds.max.y) {
        
        if (projectile.bounces && projectile.bounces > 0) {
          // Handle bouncing off world bounds
          if (projectile.position.x < this.bounds.min.x || projectile.position.x > this.bounds.max.x) {
            projectile.velocity.x *= -(projectile.restitution ?? 0.5);
            projectile.position.x = Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, projectile.position.x));
          }
          if (projectile.position.y < this.bounds.min.y || projectile.position.y > this.bounds.max.y) {
            projectile.velocity.y *= -(projectile.restitution ?? 0.5);
            projectile.position.y = Math.max(this.bounds.min.y, Math.min(this.bounds.max.y, projectile.position.y));
          }
          projectile.bounces--;
        } else {
          outOfBounds.push(id);
          continue;
        }
      }
      
      // Round for deterministic output
      projectile.position = this.roundVec(projectile.position);
      projectile.velocity = this.roundVec(projectile.velocity);
      projectile.ttl = this.round(projectile.ttl);
      
      updated.push(JSON.parse(JSON.stringify(projectile)));
    }
    
    // Remove expired and out-of-bounds projectiles
    for (const id of [...expired, ...outOfBounds]) {
      this.projectiles.delete(id);
    }
    
    return { op: 'step', dt, updated, expired, outOfBounds };
  }

  dump(id: string): DumpOutput {
    const projectile = this.projectiles.get(id);
    return { op: 'dump', projectile: projectile ? JSON.parse(JSON.stringify(projectile)) : undefined };
  }

  analytics(): AnalyticsOutput {
    const projectiles = Array.from(this.projectiles.values());
    let totalVelocity = 0;
    let totalKineticEnergy = 0;
    let totalTTL = 0;
    const typeDistribution: Record<string, number> = {};
    
    for (const p of projectiles) {
      const speed = Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
      totalVelocity += speed;
      totalKineticEnergy += 0.5 * (p.mass ?? 1) * speed * speed;
      totalTTL += p.ttl;
      
      const type = p.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    }
    
    return {
      op: 'analytics',
      totalProjectiles: projectiles.length,
      averageVelocity: this.round(projectiles.length > 0 ? totalVelocity / length: 0),
      totalKineticEnergy: this.round(totalKineticEnergy),
      typeDistribution,
      averageTTL: this.round(projectiles.length > 0 ? totalTTL / length: 0)
    };
  }

  export(format: string): ExportOutput {
    try {
      const world: ProjectileWorld = {
        projectiles: Array.from(this.projectiles.values()),
        defaultGravity: this.defaultGravity,
        defaultFriction: this.defaultFriction,
        bounds: this.bounds,
        timeStep: this.timeStep
      };
      
      let data: any;
      
      switch (format.toLowerCase()) {
        case 'json':
          data = world;
          break;
        case 'manifest':
          data = {
            schema: 'ProjectileWorld',
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: world,
            metadata: {
              simulationTime: this.simulationTime,
              projectileCount: this.projectiles.size,
              analytics: this.analytics()
            }
          };
          break;
        case 'summary':
          data = {
            summary: 'Projectile System Summary',
            projectiles: this.projectiles.size,
            bounds: this.bounds,
            simulationTime: this.simulationTime,
            analytics: this.analytics()
          };
          break;
        default:
          return { op: 'export', status: 'error', format, issues: [`Unsupported format: ${format}`] };
      }
      
      return { op: 'export', status: 'ok', format, data };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { op: 'export', status: 'error', format, issues: [String(error)] };
    }
  }

  checkCollisions(targets: Array<{ id: string; position: Vec2; radius: number }>): CollisionCheckOutput {
    const collisions: Array<{ projectileId: string; targetId: string; point: Vec2; normal: Vec2 }> = [];
    
    for (const [pid, projectile] of this.projectiles) {
      const pRadius = projectile.radius ?? 0.1;
      
      for (const target of targets) {
        const dx = target.position.x - projectile.position.x;
        const dy = target.position.y - projectile.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const totalRadius = pRadius + target.radius;
        
        if (distance < totalRadius) {
          const normal = distance > 0 
            ? { x: dx / distance, y: dy / distance }
            : { x: 1, y: 0 };
          
          collisions.push({
            projectileId: pid,
            targetId: target.id,
            point: this.roundVec({
              x: projectile.position.x + normal.x * pRadius,
              y: projectile.position.y + normal.y * pRadius
            }),
            normal: this.roundVec(normal)
          });
        }
      }
    }
    
    return { op: 'collisionCheck', collisions };
  }

  private round(n: number): number { return Math.round(n * 1000) / 1000; }
  private roundVec(v: Vec2): Vec2 { return { x: this.round(v.x), y: this.round(v.y) }; }
}

// Legacy function for backward compatibility
export function step(world: { dt: number; projectiles: Projectile[] }): { op:'projectiles.step'; status:'ok'; updated: Projectile[] } {
  const manager = new ProjectileManager();
  manager.load({ projectiles: world.projectiles });
  const result = manager.step(world.dt);
  return { op: 'projectiles.step', status: 'ok', updated: result.updated };
}


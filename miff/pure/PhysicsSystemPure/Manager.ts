export type Vector2 = { x: number; y: number };

export type Force = {
  id: string;
  vector: Vector2;
  duration?: number; // seconds, undefined = permanent
  bodyId?: string; // if undefined, applies to all bodies
};

export type Constraint = {
  id: string;
  type: 'spring' | 'distance' | 'pin';
  bodyA: string;
  bodyB?: string; // undefined for pin constraints
  restLength?: number; // for distance/spring constraints
  stiffness?: number; // for spring constraints (0-1)
  damping?: number; // for spring constraints (0-1)
  anchorPoint?: Vector2; // for pin constraints
};

export type Body = {
  id: string;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  gravity?: Vector2; // per-body gravity override
  friction?: number; // linear damping coefficient per second (0..1)
  restitution?: number; // bounce factor (0-1)
  isStatic?: boolean; // immovable bodies
  shape?: 'circle' | 'box';
  radius?: number; // for circle bodies
  width?: number; // for box bodies
  height?: number; // for box bodies
};

export type PhysicsWorld = {
  bodies: Body[];
  forces: Force[];
  constraints: Constraint[];
  defaultGravity?: Vector2;
  defaultFriction?: number;
  timeStep?: number; // preferred physics timestep
  maxVelocity?: number; // velocity cap to prevent instability
};

export type ListOutput = { op: 'list'; ids: string[]; bodies: number; forces: number; constraints: number };
export type StepOutput = { op: 'step'; dt: number; updated: Array<{ id: string; position: Vector2; velocity: Vector2; energy: number }> };
export type DumpOutput = { op: 'dump'; body: Body | undefined };
export type CreateOutput = { op: 'create'; status: 'ok' | 'error'; body?: Body; issues?: string[] };
export type AddForceOutput = { op: 'addForce'; status: 'ok' | 'error'; force?: Force; issues?: string[] };
export type AddConstraintOutput = { op: 'addConstraint'; status: 'ok' | 'error'; constraint?: Constraint; issues?: string[] };
export type RemoveForceOutput = { op: 'removeForce'; status: 'ok' | 'error'; removed: boolean };
export type RemoveConstraintOutput = { op: 'removeConstraint'; status: 'ok' | 'error'; removed: boolean };
export type AnalyticsOutput = { op: 'analytics'; totalEnergy: number; averageVelocity: number; bodyCount: number; forceCount: number; constraintCount: number };
export type ExportOutput = { op: 'export'; status: 'ok' | 'error'; format: string; data?: any; issues?: string[] };

export class PhysicsManager {
  private bodies = new Map<string, Body>();
  private forces = new Map<string, Force>();
  private constraints = new Map<string, Constraint>();
  private defaultGravity: Vector2 = { x: 0, y: -9.8 };
  private defaultFriction = 0.1;
  private timeStep = 1/60; // 60 FPS
  private maxVelocity = 100;
  private simulationTime = 0;

  load(world: PhysicsWorld): void {
    this.bodies.clear();
    this.forces.clear();
    this.constraints.clear();
    this.defaultGravity = world.defaultGravity || { x: 0, y: -9.8 };
    this.defaultFriction = world.defaultFriction ?? 0.1;
    this.timeStep = world.timeStep ?? 1/60;
    this.maxVelocity = world.maxVelocity ?? 100;
    
    for (const b of world.bodies) {
      this.bodies.set(b.id, JSON.parse(JSON.stringify(b)));
    }
    for (const f of world.forces || []) {
      this.forces.set(f.id, JSON.parse(JSON.stringify(f)));
    }
    for (const c of world.constraints || []) {
      this.constraints.set(c.id, JSON.parse(JSON.stringify(c)));
    }
  }

  list(): ListOutput { 
    return { 
      op: 'list', 
      ids: Array.from(this.bodies.keys()),
      bodies: this.bodies.size,
      forces: this.forces.size,
      constraints: this.constraints.size
    }; 
  }

  create(body: Body): CreateOutput {
    if (this.bodies.has(body.id)) return { op: 'create', status: 'error', issues: [`Body ${body.id} already exists`] };
    
    // Validate body properties
    const issues: string[] = [];
    if (body.mass <= 0) issues.push('Mass must be positive');
    if (body.friction && (body.friction < 0 || body.friction > 1)) issues.push('Friction must be between 0 and 1');
    if (body.restitution && (body.restitution < 0 || body.restitution > 1)) issues.push('Restitution must be between 0 and 1');
    
    if (issues.length > 0) return { op: 'create', status: 'error', issues };
    
    this.bodies.set(body.id, JSON.parse(JSON.stringify(body)));
    return { op: 'create', status: 'ok', body };
  }

  addForce(force: Force): AddForceOutput {
    if (this.forces.has(force.id)) return { op: 'addForce', status: 'error', issues: [`Force ${force.id} already exists`] };
    
    // Validate force
    const issues: string[] = [];
    if (force.bodyId && !this.bodies.has(force.bodyId)) issues.push(`Body ${force.bodyId} not found`);
    if (force.duration && force.duration <= 0) issues.push('Duration must be positive');
    
    if (issues.length > 0) return { op: 'addForce', status: 'error', issues };
    
    this.forces.set(force.id, JSON.parse(JSON.stringify(force)));
    return { op: 'addForce', status: 'ok', force };
  }

  addConstraint(constraint: Constraint): AddConstraintOutput {
    if (this.constraints.has(constraint.id)) return { op: 'addConstraint', status: 'error', issues: [`Constraint ${constraint.id} already exists`] };
    
    // Validate constraint
    const issues: string[] = [];
    if (!this.bodies.has(constraint.bodyA)) issues.push(`Body ${constraint.bodyA} not found`);
    if (constraint.bodyB && !this.bodies.has(constraint.bodyB)) issues.push(`Body ${constraint.bodyB} not found`);
    if (constraint.type === 'spring' && (!constraint.stiffness || constraint.stiffness <= 0)) issues.push('Spring constraint requires positive stiffness');
    if (constraint.type === 'distance' && (!constraint.restLength || constraint.restLength <= 0)) issues.push('Distance constraint requires positive rest length');
    
    if (issues.length > 0) return { op: 'addConstraint', status: 'error', issues };
    
    this.constraints.set(constraint.id, JSON.parse(JSON.stringify(constraint)));
    return { op: 'addConstraint', status: 'ok', constraint };
  }

  removeForce(id: string): RemoveForceOutput {
    const removed = this.forces.delete(id);
    return { op: 'removeForce', status: 'ok', removed };
  }

  removeConstraint(id: string): RemoveConstraintOutput {
    const removed = this.constraints.delete(id);
    return { op: 'removeConstraint', status: 'ok', removed };
  }

  step(dt: number): StepOutput {
    this.simulationTime += dt;
    const updated: Array<{ id: string; position: Vector2; velocity: Vector2; energy: number }> = [];
    
    // Update forces (remove expired ones)
    for (const [id, force] of this.forces) {
      if (force.duration !== undefined) {
        force.duration -= dt;
        if (force.duration <= 0) {
          this.forces.delete(id);
        }
      }
    }
    
    for (const [id, body] of this.bodies) {
      if (body.isStatic) {
        updated.push({ 
          id, 
          position: this.roundVec(body.position), 
          velocity: this.roundVec(body.velocity),
          energy: 0
        });
        continue;
      }
      
      const g = body.gravity ?? this.defaultGravity;
      const f = body.friction ?? this.defaultFriction;
      
      // Calculate total force on this body
      let totalForce = { x: g.x * body.mass, y: g.y * body.mass };
      
      // Apply external forces
      for (const force of this.forces.values()) {
        if (!force.bodyId || force.bodyId === id) {
          totalForce.x += force.vector.x;
          totalForce.y += force.vector.y;
        }
      }
      
      // Apply constraint forces
      for (const constraint of this.constraints.values()) {
        if (constraint.bodyA === id || constraint.bodyB === id) {
          const constraintForce = this.calculateConstraintForce(constraint, id);
          totalForce.x += constraintForce.x;
          totalForce.y += constraintForce.y;
        }
      }
      
      // Integrate acceleration to velocity (F = ma, so a = F/m)
      const acceleration = { x: totalForce.x / body.mass, y: totalForce.y / body.mass };
      let vx = body.velocity.x + acceleration.x * dt;
      let vy = body.velocity.y + acceleration.y * dt;
      
      // Apply friction/damping
      const damping = Math.max(0, 1 - f * dt);
      vx *= damping;
      vy *= damping;
      
      // Clamp velocity to prevent instability
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > this.maxVelocity) {
        const scale = this.maxVelocity / speed;
        vx *= scale;
        vy *= scale;
      }
      
      // Integrate velocity to position
      const px = body.position.x + vx * dt;
      const py = body.position.y + vy * dt;
      
      body.velocity = { x: vx, y: vy };
      body.position = { x: px, y: py };
      
      // Calculate kinetic energy
      const kineticEnergy = 0.5 * body.mass * (vx * vx + vy * vy);
      
      updated.push({ 
        id, 
        position: this.roundVec(body.position), 
        velocity: this.roundVec(body.velocity),
        energy: this.round(kineticEnergy)
      });
    }
    
    return { op: 'step', dt, updated };
  }

  analytics(): AnalyticsOutput {
    let totalEnergy = 0;
    let totalVelocity = 0;
    
    for (const body of this.bodies.values()) {
      const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
      totalVelocity += speed;
      totalEnergy += 0.5 * body.mass * speed * speed;
    }
    
    return {
      op: 'analytics',
      totalEnergy: this.round(totalEnergy),
      averageVelocity: this.round(this.bodies.size > 0 ? totalVelocity / this.bodies.size : 0),
      bodyCount: this.bodies.size,
      forceCount: this.forces.size,
      constraintCount: this.constraints.size
    };
  }

  export(format: string): ExportOutput {
    try {
      const world: PhysicsWorld = {
        bodies: Array.from(this.bodies.values()),
        forces: Array.from(this.forces.values()),
        constraints: Array.from(this.constraints.values()),
        defaultGravity: this.defaultGravity,
        defaultFriction: this.defaultFriction,
        timeStep: this.timeStep,
        maxVelocity: this.maxVelocity
      };
      
      let data: any;
      
      switch (format.toLowerCase()) {
        case 'json':
          data = world;
          break;
        case 'manifest':
          data = {
            schema: 'PhysicsWorld',
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: world,
            metadata: {
              simulationTime: this.simulationTime,
              bodyCount: this.bodies.size,
              forceCount: this.forces.size,
              constraintCount: this.constraints.size
            }
          };
          break;
        case 'summary':
          data = {
            summary: 'Physics World Summary',
            bodies: this.bodies.size,
            forces: this.forces.size,
            constraints: this.constraints.size,
            totalEnergy: this.analytics().totalEnergy,
            averageVelocity: this.analytics().averageVelocity,
            simulationTime: this.simulationTime
          };
          break;
        default:
          return { op: 'export', status: 'error', format, issues: [`Unsupported format: ${format}`] };
      }
      
      return { op: 'export', status: 'ok', format, data };
    } catch (error) {
      return { op: 'export', status: 'error', format, issues: [String(error)] };
    }
  }

  dump(id: string): DumpOutput {
    const body = this.bodies.get(id);
    return { op: 'dump', body: body ? JSON.parse(JSON.stringify(this.roundBody(body))) : undefined };
  }

  private calculateConstraintForce(constraint: Constraint, bodyId: string): Vector2 {
    const bodyA = this.bodies.get(constraint.bodyA)!;
    const bodyB = constraint.bodyB ? this.bodies.get(constraint.bodyB) : null;
    
    switch (constraint.type) {
      case 'spring': {
        if (!bodyB) return { x: 0, y: 0 };
        
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const restLength = constraint.restLength || 1;
        const stiffness = constraint.stiffness || 0.1;
        const damping = constraint.damping || 0.1;
        
        if (distance === 0) return { x: 0, y: 0 };
        
        const displacement = distance - restLength;
        const forceDirection = { x: dx / distance, y: dy / distance };
        
        // Spring force
        const springForce = displacement * stiffness;
        
        // Damping force
        const relativeVelocity = {
          x: bodyB.velocity.x - bodyA.velocity.x,
          y: bodyB.velocity.y - bodyA.velocity.y
        };
        const dampingForce = damping * (relativeVelocity.x * forceDirection.x + relativeVelocity.y * forceDirection.y);
        
        const totalForce = springForce + dampingForce;
        
        // Apply force in opposite directions for each body
        const force = {
          x: totalForce * forceDirection.x,
          y: totalForce * forceDirection.y
        };
        
        return bodyId === constraint.bodyA ? force : { x: -force.x, y: -force.y };
      }
      
      case 'distance': {
        if (!bodyB) return { x: 0, y: 0 };
        
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const restLength = constraint.restLength || 1;
        
        if (distance === 0 || Math.abs(distance - restLength) < 0.01) return { x: 0, y: 0 };
        
        const forceDirection = { x: dx / distance, y: dy / distance };
        const correction = (distance - restLength) * 0.5; // Simple constraint correction
        
        const force = {
          x: correction * forceDirection.x,
          y: correction * forceDirection.y
        };
        
        return bodyId === constraint.bodyA ? force : { x: -force.x, y: -force.y };
      }
      
      case 'pin': {
        if (bodyId !== constraint.bodyA) return { x: 0, y: 0 };
        
        const anchor = constraint.anchorPoint || { x: 0, y: 0 };
        const dx = anchor.x - bodyA.position.x;
        const dy = anchor.y - bodyA.position.y;
        
        // Simple spring-like force to anchor point
        const stiffness = 10; // Strong pin constraint
        return { x: dx * stiffness, y: dy * stiffness };
      }
      
      default:
        return { x: 0, y: 0 };
    }
  }

  private round(n: number): number { return Math.round(n * 100) / 100; }
  private roundVec(v: Vector2): Vector2 { return { x: this.round(v.x), y: this.round(v.y) }; }
  private roundBody(b: Body): Body {
    return {
      ...b,
      position: this.roundVec(b.position),
      velocity: this.roundVec(b.velocity),
    };
  }
}
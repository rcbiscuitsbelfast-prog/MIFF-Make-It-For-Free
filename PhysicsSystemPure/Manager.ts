export type Vector2 = { x: number; y: number };

export type Body = {
  id: string;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  gravity?: Vector2; // per-body gravity override
  friction?: number; // linear damping coefficient per second (0..1)
};

export type PhysicsWorld = {
  bodies: Body[];
  defaultGravity?: Vector2;
  defaultFriction?: number;
};

export type ListOutput = { op: 'list'; ids: string[] };
export type StepOutput = { op: 'step'; dt: number; updated: Array<{ id: string; position: Vector2; velocity: Vector2 }> };
export type DumpOutput = { op: 'dump'; body: Body | undefined };
export type CreateOutput = { op: 'create'; status: 'ok' | 'error'; body?: Body; issues?: string[] };

export class PhysicsManager {
  private bodies = new Map<string, Body>();
  private defaultGravity: Vector2 = { x: 0, y: 0 };
  private defaultFriction = 0;

  load(world: PhysicsWorld): void {
    this.bodies.clear();
    this.defaultGravity = world.defaultGravity || { x: 0, y: 0 };
    this.defaultFriction = world.defaultFriction ?? 0;
    for (const b of world.bodies) {
      this.bodies.set(b.id, JSON.parse(JSON.stringify(b)));
    }
  }

  list(): ListOutput { return { op: 'list', ids: Array.from(this.bodies.keys()) }; }

  create(body: Body): CreateOutput {
    if (this.bodies.has(body.id)) return { op: 'create', status: 'error', issues: [`Body ${body.id} already exists`] };
    this.bodies.set(body.id, JSON.parse(JSON.stringify(body)));
    return { op: 'create', status: 'ok', body };
  }

  step(dt: number): StepOutput {
    const updated: Array<{ id: string; position: Vector2; velocity: Vector2 }> = [];
    for (const [id, body] of this.bodies) {
      const g = body.gravity ?? this.defaultGravity;
      const f = body.friction ?? this.defaultFriction;

      // Integrate velocity with gravity
      const vx = body.velocity.x + g.x * dt;
      const vy = body.velocity.y + g.y * dt;

      // Apply simple linear damping (friction), clamped to non-negative scale
      const damping = Math.max(0, 1 - f * dt);
      const vxd = vx * damping;
      const vyd = vy * damping;

      // Integrate position
      const px = body.position.x + vxd * dt;
      const py = body.position.y + vyd * dt;

      body.velocity = { x: vxd, y: vyd };
      body.position = { x: px, y: py };

      updated.push({ id, position: this.roundVec(body.position), velocity: this.roundVec(body.velocity) });
    }
    return { op: 'step', dt, updated };
  }

  dump(id: string): DumpOutput {
    const body = this.bodies.get(id);
    return { op: 'dump', body: body ? JSON.parse(JSON.stringify(this.roundBody(body))) : undefined };
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
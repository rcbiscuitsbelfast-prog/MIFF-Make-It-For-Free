export type Vec2 = { x: number; y: number };

export type AABB = { id: string; min: Vec2; max: Vec2; isTrigger?: boolean };

export type Collision = { a: string; b: string; overlap: Vec2 };
export type Trigger = { a: string; b: string };

export type ListOutput = { op: 'list'; ids: string[] };
export type CheckOutput = { op: 'check'; collisions: Collision[]; triggers: Trigger[] };
export type ResolveOutput = { op: 'resolve'; resolved: Array<{ id: string; min: Vec2; max: Vec2 }>; collisions: Collision[] };
export type DumpOutput = { op: 'dump'; box?: AABB };

export class CollisionManager {
  private boxes = new Map<string, AABB>();

  load(boxes: AABB[]): void {
    this.boxes.clear();
    for (const b of boxes) this.boxes.set(b.id, JSON.parse(JSON.stringify(b)));
  }

  list(): ListOutput { return { op: 'list', ids: Array.from(this.boxes.keys()) }; }

  upsert(box: AABB) { this.boxes.set(box.id, JSON.parse(JSON.stringify(box))); }

  dump(id: string): DumpOutput { return { op: 'dump', box: this.boxes.get(id) ? JSON.parse(JSON.stringify(this.boxes.get(id))) : undefined }; }

  check(): CheckOutput {
    const ids = Array.from(this.boxes.keys());
    const collisions: Collision[] = [];
    const triggers: Trigger[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = this.boxes.get(ids[i])!;
        const b = this.boxes.get(ids[j])!;
        const ov = this.computeOverlap(a, b);
        if (ov) {
          if (a.isTrigger || b.isTrigger) triggers.push({ a: a.id, b: b.id });
          else collisions.push({ a: a.id, b: b.id, overlap: ov });
        }
      }
    }
    return { op: 'check', collisions, triggers };
  }

  resolve(): ResolveOutput {
    const result = this.check();
    const resolved: Array<{ id: string; min: Vec2; max: Vec2 }> = [];
    // Simple separation: move second box of each collision by overlap along smallest axis
    for (const c of result.collisions) {
      const b = this.boxes.get(c.b)!;
      const dx = c.overlap.x;
      const dy = c.overlap.y;
      if (dx < dy) {
        // resolve along x
        const sign = this.center(this.boxes.get(c.b)!).x >= this.center(this.boxes.get(c.a)!).x ? 1 : -1;
        b.min.x += dx * sign;
        b.max.x += dx * sign;
      } else {
        // resolve along y
        const sign = this.center(this.boxes.get(c.b)!).y >= this.center(this.boxes.get(c.a)!).y ? 1 : -1;
        b.min.y += dy * sign;
        b.max.y += dy * sign;
      }
      resolved.push({ id: b.id, min: this.roundVec(b.min), max: this.roundVec(b.max) });
    }
    return { op: 'resolve', resolved, collisions: result.collisions };
  }

  private computeOverlap(a: AABB, b: AABB): Vec2 | undefined {
    const ox = Math.max(0, Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x));
    const oy = Math.max(0, Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y));
    if (ox > 0 && oy > 0) return this.roundVec({ x: ox, y: oy });
    return undefined;
  }

  private center(b: AABB): Vec2 { return { x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2 }; }
  private round(n: number): number { return Math.round(n * 100) / 100; }
  private roundVec(v: Vec2): Vec2 { return { x: this.round(v.x), y: this.round(v.y) }; }
}
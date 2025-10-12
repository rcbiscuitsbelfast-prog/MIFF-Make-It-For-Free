export type Vec2 = { x: number; y: number };

export type AABB = { 
  id: string; 
  min: Vec2; 
  max: Vec2; 
  isTrigger?: boolean;
  layer?: number; // collision layer (0-31)
  mask?: number; // collision mask (0-31)
  velocity?: Vec2; // for continuous collision detection
  tags?: string[]; // for filtering
};

export type Circle = {
  id: string;
  center: Vec2;
  radius: number;
  isTrigger?: boolean;
  layer?: number;
  mask?: number;
  velocity?: Vec2;
  tags?: string[];
};

export type CollisionShape = AABB | Circle;

export type Collision = { 
  a: string; 
  b: string; 
  overlap: Vec2; 
  normal: Vec2; 
  depth: number;
  point: Vec2;
};

export type Trigger = { 
  a: string; 
  b: string; 
  point: Vec2;
};

export type SpatialGrid = {
  cellSize: number;
  bounds: AABB;
  cells: Map<string, Set<string>>;
};

export type ListOutput = { op: 'list'; ids: string[]; aabbs: number; circles: number; spatialCells: number };
export type CheckOutput = { op: 'check'; collisions: Collision[]; triggers: Trigger[]; broadPhaseTests: number; narrowPhaseTests: number };
export type ResolveOutput = { op: 'resolve'; resolved: Array<{ id: string; min?: Vec2; max?: Vec2; center?: Vec2 }>; collisions: Collision[] };
export type DumpOutput = { op: 'dump'; shape?: CollisionShape };
export type UpsertOutput = { op: 'upsert'; status: 'ok' | 'error'; id: string; issues?: string[] };
export type RemoveOutput = { op: 'remove'; status: 'ok' | 'error'; removed: boolean };
export type AnalyticsOutput = { op: 'analytics'; totalShapes: number; activeCells: number; averageShapesPerCell: number; collisionTests: number };
export type ExportOutput = { op: 'export'; status: 'ok' | 'error'; format: string; data?: any; issues?: string[] };
export type ClearOutput = { op: 'clear'; status: 'ok'; removed: number };

export class CollisionManager {
  private aabbs = new Map<string, AABB>();
  private circles = new Map<string, Circle>();
  private spatialGrid: SpatialGrid;
  private collisionTests = 0;

  constructor(cellSize: number = 4, worldBounds: AABB = { id: 'world', min: { x: -100, y: -100 }, max: { x: 100, y: 100 } }) {
    this.spatialGrid = {
      cellSize,
      bounds: worldBounds,
      cells: new Map()
    };
  }

  load(shapes: CollisionShape[]): void {
    this.aabbs.clear();
    this.circles.clear();
    this.spatialGrid.cells.clear();
    
    for (const shape of shapes) {
      if (this.isAABB(shape)) {
        this.aabbs.set(shape.id, PerformanceOptimizer.optimizeObjectCloning(shape, true).result);
        this.addToSpatialGrid(shape.id, shape);
      } else if (this.isCircle(shape)) {
        this.circles.set(shape.id, PerformanceOptimizer.optimizeObjectCloning(shape, true).result);
        this.addToSpatialGrid(shape.id, shape);
      }
    }
  }

  list(): ListOutput { 
    return { 
      op: 'list', 
      ids: [...this.aabbs.keys(), ...this.circles.keys()],
      aabbs: this.aabbs.size,
      circles: this.circles.size,
      spatialCells: this.spatialGrid.cells.size
    }; 
  }

  upsert(shape: CollisionShape): UpsertOutput {
    try {
      // Remove from old spatial position if exists
      this.removeFromSpatialGrid(shape.id);
      
      // Validate shape
      const issues: string[] = [];
      if (this.isAABB(shape)) {
        if (shape.min.x >= shape.max.x) issues.push('AABB min.x must be less than max.x');
        if (shape.min.y >= shape.max.y) issues.push('AABB min.y must be less than max.y');
        if (shape.layer !== undefined && (shape.layer < 0 || shape.layer > 31)) issues.push('Layer must be 0-31');
        if (shape.mask !== undefined && (shape.mask < 0 || shape.mask > 31)) issues.push('Mask must be 0-31');
      } else if (this.isCircle(shape)) {
        if (shape.radius <= 0) issues.push('Circle radius must be positive');
        if (shape.layer !== undefined && (shape.layer < 0 || shape.layer > 31)) issues.push('Layer must be 0-31');
        if (shape.mask !== undefined && (shape.mask < 0 || shape.mask > 31)) issues.push('Mask must be 0-31');
      }
      
      if (issues.length > 0) return { op: 'upsert', status: 'error', id: shape.id, issues };
      
      // Add to appropriate collection
      if (this.isAABB(shape)) {
        this.aabbs.set(shape.id, PerformanceOptimizer.optimizeObjectCloning(shape, true).result);
      } else {
        this.circles.set(shape.id, PerformanceOptimizer.optimizeObjectCloning(shape, true).result);
      }
      
      // Add to spatial grid
      this.addToSpatialGrid(shape.id, shape);
      
      return { op: 'upsert', status: 'ok', id: shape.id };
    } catch (error) {
      return { op: 'upsert', status: 'error', id: shape.id, issues: [String(error)] };
    }
  }

  remove(id: string): RemoveOutput {
    const hadAABB = this.aabbs.delete(id);
    const hadCircle = this.circles.delete(id);
    this.removeFromSpatialGrid(id);
    
    return { op: 'remove', status: 'ok', removed: hadAABB || hadCircle };
  }

  clear(): ClearOutput {
    const count = this.aabbs.size + this.circles.size;
    this.aabbs.clear();
    this.circles.clear();
    this.spatialGrid.cells.clear();
    return { op: 'clear', status: 'ok', removed: count };
  }

  dump(id: string): DumpOutput { 
    const aabb = this.aabbs.get(id);
    const circle = this.circles.get(id);
    const shape = aabb || circle;
    return { op: 'dump', shape: shape ? PerformanceOptimizer.optimizeObjectCloning(shape, true).result : undefined }; 
  }

  check(filterTags?: string[]): CheckOutput {
    this.collisionTests = 0;
    const collisions: Collision[] = [];
    const triggers: Trigger[] = [];
    let broadPhaseTests = 0;
    let narrowPhaseTests = 0;
    
    // Get all shape pairs from spatial grid
    const testedPairs = new Set<string>();
    
    for (const cellShapes of this.spatialGrid.cells.values()) {
      const shapeIds = Array.from(cellShapes);
      broadPhaseTests += shapeIds.length * (shapeIds.length - 1) / 2;
      
      for (let i = 0; i < shapeIds.length; i++) {
        for (let j = i + 1; j < shapeIds.length; j++) {
          const idA = shapeIds[i];
          const idB = shapeIds[j];
          const pairKey = idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
          
          if (testedPairs.has(pairKey)) continue;
          testedPairs.add(pairKey);
          
          const shapeA = this.aabbs.get(idA) || this.circles.get(idA);
          const shapeB = this.aabbs.get(idB) || this.circles.get(idB);
          
          if (!shapeA || !shapeB) continue;
          
          // Layer/mask filtering
          if (!this.shouldCollide(shapeA, shapeB)) continue;
          
          // Tag filtering
          if (filterTags && !this.hasMatchingTags(shapeA, filterTags) && !this.hasMatchingTags(shapeB, filterTags)) continue;
          
          narrowPhaseTests++;
          const collision = this.detectCollision(shapeA, shapeB);
          
          if (collision) {
            if (shapeA.isTrigger || shapeB.isTrigger) {
              triggers.push({ 
                a: shapeA.id, 
                b: shapeB.id, 
                point: collision.point 
              });
            } else {
              collisions.push(collision);
            }
          }
        }
      }
    }
    
    return { op: 'check', collisions, triggers, broadPhaseTests, narrowPhaseTests };
  }

  resolve(): ResolveOutput {
    const result = this.check();
    const resolved: Array<{ id: string; min?: Vec2; max?: Vec2; center?: Vec2 }> = [];
    
    // Resolve collisions with proper physics
    for (const collision of result.collisions) {
      const shapeA = this.aabbs.get(collision.a) || this.circles.get(collision.a);
      const shapeB = this.aabbs.get(collision.b) || this.circles.get(collision.b);
      
      if (!shapeA || !shapeB) continue;
      
      // Calculate separation vector
      const separation = {
        x: collision.normal.x * collision.depth * 0.5,
        y: collision.normal.y * collision.depth * 0.5
      };
      
      // Move shapes apart
      if (this.isAABB(shapeA)) {
        shapeA.min.x -= separation.x;
        shapeA.min.y -= separation.y;
        shapeA.max.x -= separation.x;
        shapeA.max.y -= separation.y;
        this.updateSpatialGrid(shapeA.id, shapeA);
        resolved.push({ 
          id: shapeA.id, 
          min: this.roundVec(shapeA.min), 
          max: this.roundVec(shapeA.max) 
        });
      } else if (this.isCircle(shapeA)) {
        shapeA.center.x -= separation.x;
        shapeA.center.y -= separation.y;
        this.updateSpatialGrid(shapeA.id, shapeA);
        resolved.push({ 
          id: shapeA.id, 
          center: this.roundVec(shapeA.center) 
        });
      }
      
      if (this.isAABB(shapeB)) {
        shapeB.min.x += separation.x;
        shapeB.min.y += separation.y;
        shapeB.max.x += separation.x;
        shapeB.max.y += separation.y;
        this.updateSpatialGrid(shapeB.id, shapeB);
        resolved.push({ 
          id: shapeB.id, 
          min: this.roundVec(shapeB.min), 
          max: this.roundVec(shapeB.max) 
        });
      } else if (this.isCircle(shapeB)) {
        shapeB.center.x += separation.x;
        shapeB.center.y += separation.y;
        this.updateSpatialGrid(shapeB.id, shapeB);
        resolved.push({ 
          id: shapeB.id, 
          center: this.roundVec(shapeB.center) 
        });
      }
    }
    
    return { op: 'resolve', resolved, collisions: result.collisions };
  }

  analytics(): AnalyticsOutput {
    let totalShapesInCells = 0;
    for (const cellShapes of this.spatialGrid.cells.values()) {
      totalShapesInCells += cellShapes.size;
    }
    
    return {
      op: 'analytics',
      totalShapes: this.aabbs.size + this.circles.size,
      activeCells: this.spatialGrid.cells.size,
      averageShapesPerCell: this.round(this.spatialGrid.cells.size > 0 ? totalShapesInCells / this.spatialGrid.cells.size : 0),
      collisionTests: this.collisionTests
    };
  }

  export(format: string): ExportOutput {
    try {
      const allShapes: CollisionShape[] = [
        ...Array.from(this.aabbs.values()),
        ...Array.from(this.circles.values())
      ];
      
      let data: any;
      
      switch (format.toLowerCase()) {
        case 'json':
          data = { shapes: allShapes, spatialGrid: this.spatialGrid };
          break;
        case 'manifest':
          data = {
            schema: 'CollisionWorld',
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: { shapes: allShapes },
            metadata: {
              totalShapes: allShapes.length,
              aabbs: this.aabbs.size,
              circles: this.circles.size,
              spatialCells: this.spatialGrid.cells.size,
              cellSize: this.spatialGrid.cellSize
            }
          };
          break;
        case 'summary':
          data = {
            summary: 'Collision System Summary',
            totalShapes: allShapes.length,
            aabbs: this.aabbs.size,
            circles: this.circles.size,
            spatialCells: this.spatialGrid.cells.size,
            cellSize: this.spatialGrid.cellSize,
            worldBounds: this.spatialGrid.bounds,
            analytics: this.analytics()
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

  private isAABB(shape: CollisionShape): shape is AABB {
    return 'min' in shape && 'max' in shape;
  }

  private isCircle(shape: CollisionShape): shape is Circle {
    return 'center' in shape && 'radius' in shape;
  }

  private shouldCollide(a: CollisionShape, b: CollisionShape): boolean {
    // Default layers and masks
    const layerA = a.layer ?? 0;
    const maskA = a.mask ?? 0xFFFFFFFF;
    const layerB = b.layer ?? 0;
    const maskB = b.mask ?? 0xFFFFFFFF;
    
    // Check if A's mask includes B's layer and vice versa
    return (maskA & (1 << layerB)) !== 0 && (maskB & (1 << layerA)) !== 0;
  }

  private hasMatchingTags(shape: CollisionShape, tags: string[]): boolean {
    if (!shape.tags || shape.tags.length === 0) return false;
    return shape.tags.some(tag => tags.includes(tag));
  }

  private detectCollision(a: CollisionShape, b: CollisionShape): Collision | null {
    this.collisionTests++;
    
    if (this.isAABB(a) && this.isAABB(b)) {
      return this.aabbVsAABB(a, b);
    } else if (this.isCircle(a) && this.isCircle(b)) {
      return this.circleVsCircle(a, b);
    } else if (this.isAABB(a) && this.isCircle(b)) {
      return this.aabbVsCircle(a, b);
    } else if (this.isCircle(a) && this.isAABB(b)) {
      const collision = this.aabbVsCircle(b, a);
      if (collision) {
        // Swap A and B in the result
        return {
          a: collision.b,
          b: collision.a,
          overlap: collision.overlap,
          normal: { x: -collision.normal.x, y: -collision.normal.y },
          depth: collision.depth,
          point: collision.point
        };
      }
    }
    
    return null;
  }

  private aabbVsAABB(a: AABB, b: AABB): Collision | null {
    const overlapX = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
    const overlapY = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
    
    if (overlapX <= 0 || overlapY <= 0) return null;
    
    // Determine collision normal and depth
    let normal: Vec2;
    let depth: number;
    
    if (overlapX < overlapY) {
      depth = overlapX;
      normal = { x: this.center(a).x < this.center(b).x ? -1 : 1, y: 0 };
    } else {
      depth = overlapY;
      normal = { x: 0, y: this.center(a).y < this.center(b).y ? -1 : 1 };
    }
    
    const point = {
      x: Math.max(a.min.x, b.min.x) + Math.min(a.max.x, b.max.x) / 2,
      y: Math.max(a.min.y, b.min.y) + Math.min(a.max.y, b.max.y) / 2
    };
    
    return {
      a: a.id,
      b: b.id,
      overlap: this.roundVec({ x: overlapX, y: overlapY }),
      normal: this.roundVec(normal),
      depth: this.round(depth),
      point: this.roundVec(point)
    };
  }

  private circleVsCircle(a: Circle, b: Circle): Collision | null {
    const dx = b.center.x - a.center.x;
    const dy = b.center.y - a.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = a.radius + b.radius;
    
    if (distance >= totalRadius) return null;
    
    const depth = totalRadius - distance;
    const normal = distance > 0 
      ? { x: dx / distance, y: dy / distance }
      : { x: 1, y: 0 }; // Default normal if circles are at same position
    
    const point = {
      x: a.center.x + normal.x * a.radius,
      y: a.center.y + normal.y * a.radius
    };
    
    return {
      a: a.id,
      b: b.id,
      overlap: this.roundVec({ x: depth, y: depth }),
      normal: this.roundVec(normal),
      depth: this.round(depth),
      point: this.roundVec(point)
    };
  }

  private aabbVsCircle(aabb: AABB, circle: Circle): Collision | null {
    // Find closest point on AABB to circle center
    const closestX = Math.max(aabb.min.x, Math.min(circle.center.x, aabb.max.x));
    const closestY = Math.max(aabb.min.y, Math.min(circle.center.y, aabb.max.y));
    
    const dx = circle.center.x - closestX;
    const dy = circle.center.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance >= circle.radius) return null;
    
    const depth = circle.radius - distance;
    const normal = distance > 0 
      ? { x: dx / distance, y: dy / distance }
      : { x: 0, y: -1 }; // Default normal if circle center is inside AABB
    
    const point = { x: closestX, y: closestY };
    
    return {
      a: aabb.id,
      b: circle.id,
      overlap: this.roundVec({ x: depth, y: depth }),
      normal: this.roundVec(normal),
      depth: this.round(depth),
      point: this.roundVec(point)
    };
  }

  private getCellKey(x: number, y: number): string {
    return `${Math.floor(x / this.spatialGrid.cellSize)},${Math.floor(y / this.spatialGrid.cellSize)}`;
  }

  private addToSpatialGrid(id: string, shape: CollisionShape): void {
    const bounds = this.getShapeBounds(shape);
    const minCellX = Math.floor(bounds.min.x / this.spatialGrid.cellSize);
    const minCellY = Math.floor(bounds.min.y / this.spatialGrid.cellSize);
    const maxCellX = Math.floor(bounds.max.x / this.spatialGrid.cellSize);
    const maxCellY = Math.floor(bounds.max.y / this.spatialGrid.cellSize);
    
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        const key = `${x},${y}`;
        if (!this.spatialGrid.cells.has(key)) {
          this.spatialGrid.cells.set(key, new Set());
        }
        this.spatialGrid.cells.get(key)!.add(id);
      }
    }
  }

  private removeFromSpatialGrid(id: string): void {
    for (const [key, cell] of this.spatialGrid.cells) {
      cell.delete(id);
      if (cell.size === 0) {
        this.spatialGrid.cells.delete(key);
      }
    }
  }

  private updateSpatialGrid(id: string, shape: CollisionShape): void {
    this.removeFromSpatialGrid(id);
    this.addToSpatialGrid(id, shape);
  }

  private getShapeBounds(shape: CollisionShape): AABB {
    if (this.isAABB(shape)) {
      return { id: shape.id, min: shape.min, max: shape.max };
    } else {
      return {
        id: shape.id,
        min: { x: shape.center.x - shape.radius, y: shape.center.y - shape.radius },
        max: { x: shape.center.x + shape.radius, y: shape.center.y + shape.radius }
      };
    }
  }

  private center(aabb: AABB): Vec2 { 
    return { x: (aabb.min.x + aabb.max.x) / 2, y: (aabb.min.y + aabb.max.y) / 2 }; 
  }
  
  private round(n: number): number { 
    return Math.round(n * 1000) / 1000; 
  }
  
  private roundVec(v: Vec2): Vec2 { 
    return { x: this.round(v.x), y: this.round(v.y) }; 
  }
}
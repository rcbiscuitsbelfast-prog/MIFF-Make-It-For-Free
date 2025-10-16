export type GestureType = 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate';

export interface TouchEventLike {
  time: number;
  points: { x: number; y: number }[];
  type: 'down' | 'move' | 'up';
}

export interface Gesture {
  type: GestureType;
  at: number;
  data?: Record<string, unknown>;
}

export class TouchGestureManager {
  private buffer: TouchEventLike[] = [];
  private lastTapAt = 0;

  feed(ev: TouchEventLike): void {
    this.buffer.push(ev);
  }

  analyze(): Gesture[] {
    const gestures: Gesture[] = [];
    const evs = this.buffer.slice();
    this.buffer = [];
    if (!evs.length) return gestures;

    // Split into segments from down..up to avoid cross-gesture bleed
    const segments: TouchEventLike[][] = [];
    let current: TouchEventLike[] = [];
    for (const e of evs) {
      if (e.type === 'down') {
        if (current.length) segments.push(current);
        current = [e!];
      } else if (e.type === 'move') {
        current.push(e);
      } else if (e.type === 'up') {
        current.push(e);
        segments.push(current);
        current = [];
      } else {
        current.push(e);
      }
    }
    if (current.length) segments.push(current);

    for (const seg of segments) {
      const down = seg.find(e => e.type === 'down');
      const up = [...seg].reverse().find(e => e.type === 'up');
      if (down && up) {
        const duration = up.time - down.time;
        const start = down.points[0];
        const end = up.points[0] ?? start;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy);
        if (duration < 180 && dist < 8) {
          const now = up.time;
          if (now - this.lastTapAt < 300) {
            gestures.push({ type: 'doubleTap', at: now });
            this.lastTapAt = 0;
          } else {
            gestures.push({ type: 'tap', at: now });
            this.lastTapAt = now;
          }
        } else if (duration >= 500 && dist < 12) {
          gestures.push({ type: 'longPress', at: up.time });
        } else if (dist >= 20) {
          const angle = Math.atan2(dy, dx);
          gestures.push({ type: 'swipe', at: up.time, data: { dx, dy, angle } });
        }
      }

      // Pinch detection for this segment
      const multi = seg.filter((e: any) => e.points.length >= 2);
      if (multi.length >= 2) {
        const first = multi[0];
        const last = multi[multi.length - 1];
        const d0 = Math.hypot(first.points[0].x - first.points[1].x, first.points[0].y - first.points[1].y);
        const d1 = Math.hypot(last.points[0].x - last.points[1].x, last.points[0].y - last.points[1].y);
        if (Math.abs(d1 - d0) > 10) {
          gestures.push({ type: 'pinch', at: last.time, data: { scale: d1 / Math.max(1, d0) } });
        }
      }
    }

    return gestures;
  }
}


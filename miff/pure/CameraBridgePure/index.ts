// CameraBridgePure - simple camera follow/lerp (engine-agnostic)

export type Vec2 = { x: number; y: number };
export type Camera = { x: number; y: number; zoom?: number };

export function follow(cam: Camera, target: Vec2, alpha=1): Camera {
  const x = round(cam.x + (target.x - cam.x) * alpha);
  const y = round(cam.y + (target.y - cam.y) * alpha);
  return { x, y, zoom: cam.zoom };
}

function round(n:number){ return Math.round(n*100)/100; }


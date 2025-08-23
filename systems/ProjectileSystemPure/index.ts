// ProjectileSystemPure - deterministic projectile updates

export type Vec2 = { x: number; y: number };
export type Projectile = { id: string; pos: Vec2; vel: Vec2; ttl: number };
export type World = { dt: number; projectiles: Projectile[] };

export function step(world: World): { op:'projectiles.step'; status:'ok'; updated: Projectile[] }{
  const dt = world.dt;
  const updated = world.projectiles.map(p=>{
    const nx = round(p.pos.x + p.vel.x * dt);
    const ny = round(p.pos.y + p.vel.y * dt);
    return { ...p, pos: { x: nx, y: ny }, ttl: Math.max(0, round(p.ttl - dt)) };
  });
  return { op:'projectiles.step', status:'ok', updated };
}

function round(n:number){ return Math.round(n*100)/100; }


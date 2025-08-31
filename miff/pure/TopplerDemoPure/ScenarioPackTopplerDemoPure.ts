// TopplerDemoPure — Scenario Pack (Remix-Safe)
// Validates integration of PhysicsSystemPure, CollisionSystemPure, TimeSystemPure
// Schema: Pure JSON outputs, deterministic, engine-agnostic

import { PhysicsManager, PhysicsWorld, Body, Vector2 } from '../PhysicsSystemPure/Manager';
import { CollisionManager, AABB } from '../CollisionSystemPure/Manager';
import { TimeManager } from '../TimeSystemPure/Manager';

export type ScenarioState = {
  t: number;
  position: Vector2;
  velocity: Vector2;
  collided: boolean;
};

export type ScenarioOutput = {
  op: 'scenario';
  status: 'ok' | 'error';
  name: 'TopplerDemoPure';
  timeline: ScenarioState[];
  issues: string[];
};

export interface ScenarioConfig {
  dt?: number; // seconds per step
  total?: number; // total seconds
}

function round(n: number): number { return Math.round(n * 100) / 100; }
function roundVec(v: Vector2): Vector2 { return { x: round(v.x), y: round(v.y) }; }

/**
 * runScenario — Simulate a falling block colliding with a static platform over time.
 * Deterministic, remix-safe, and ready for golden fixtures.
 */
export function runScenario(cfg: ScenarioConfig = {}): ScenarioOutput {
  const dt = cfg.dt ?? 0.1;
  const total = cfg.total ?? 1.0;
  const physics = new PhysicsManager();
  const collisions = new CollisionManager();
  const time = new TimeManager();

  // World: gravity downward along +Y (screen-down convention). No friction.
  const world: PhysicsWorld = {
    defaultGravity: { x: 0, y: 9.81 },
    defaultFriction: 0,
    bodies: [
      {
        id: 'block',
        position: { x: 0, y: -1.5 }, // center above platform
        velocity: { x: 0, y: 0 },
        mass: 1
      } as Body
    ]
  };
  physics.load(world);

  // Platform AABB (static). Wide platform spanning x, at y ∈ [0, 0.5].
  const platform: AABB = { id: 'platform', min: { x: -5, y: 0 }, max: { x: 5, y: 0.5 } };
  collisions.load([platform]);

  // Helper to sync the dynamic block to collision AABB
  const half = 0.25; // block half-size (0.5x0.5) to match fixture capture
  function upsertBlockBox(center: Vector2): void {
    const box: AABB = {
      id: 'block',
      min: { x: center.x - half, y: center.y - half },
      max: { x: center.x + half, y: center.y + half }
    };
    collisions.upsert(box);
  }

  function centerFromBox(aabb: AABB): Vector2 {
    return { x: (aabb.min.x + aabb.max.x) / 2, y: (aabb.min.y + aabb.max.y) / 2 };
  }

  // Capture states at key times
  const captureAt = new Set([0, 0.5, 1.0].map(v => round(v)));
  const timeline: ScenarioState[] = [];
  const issues: string[] = [];
  let grounded = false;

  // Initial state capture
  const initialDump = physics.dump('block');
  upsertBlockBox(initialDump.body!.position);
  timeline.push({ t: 0, position: initialDump.body!.position, velocity: initialDump.body!.velocity, collided: false });

  // Sim loop
  let t = 0;
  while (round(t + dt) <= round(total + 1e-9)) {
    // Advance time and physics
    time.tick(dt);
    const step = physics.step(dt);
    t = round(time.now());

    // Update collision box for block from physics position
    const blockDump = physics.dump('block');
    const center = blockDump.body!.position;
    upsertBlockBox(center);

    // Check collision and resolve penetration; reflect into physics state (simple support)
    const check = collisions.check();
    let collided = false;
    for (const c of check.collisions) {
      if ((c.a === 'platform' && c.b === 'block') || (c.b === 'platform' && c.a === 'block')) {
        collided = true;
      }
    }
    if (collided) {
      const resolved = collisions.resolve();
      const blockBox = resolved.resolved.find(r => r.id === 'block');
      if (blockBox) {
        // Snap to platform top and rest: center.y = 0, vy = 0
        const bd = physics.dump('block').body!;
        bd.position = { x: round(bd.position.x), y: 0 };
        bd.velocity = { x: round(bd.velocity.x), y: 0 };
        grounded = true;
        upsertBlockBox(bd.position);
      }
    }
    // Maintain rest if grounded and still in contact zone
    else if (grounded) {
      const bd = physics.dump('block').body!;
      // Keep snapped to platform top and cancel vertical motion
      bd.position = { x: round(bd.position.x), y: 0 };
      bd.velocity = { x: round(bd.velocity.x), y: 0 };
      upsertBlockBox(bd.position);
      // Keep grounded for this fixed scenario (no external forces to release)
    }

    if (captureAt.has(t)) {
      const d = physics.dump('block').body!;
      timeline.push({ t, position: d.position, velocity: d.velocity, collided });
    }
  }

  return { op: 'scenario', status: 'ok', name: 'TopplerDemoPure', timeline, issues };
}

// Remix Hooks
// - extendScenario(init): inject alternative gravity, sizes, or restitution (keep deterministic)
// - onCapture(state): observe timeline captures for custom analytics
// - adaptRender(payloadBuilder): map states to RenderPayloadPure frames (out-of-tree)
// - injectInput(script): scripted inputs to alter timing in a repeatable way


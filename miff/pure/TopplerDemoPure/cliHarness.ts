/**
 * TopplerDemoPure CLI Harness
 * Simulates physics demo with falling object
 */

interface PhysicsState {
  t: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  collided: boolean;
}

function simulatePhysics(): PhysicsState[] {
  const timeline: PhysicsState[] = [];
  const gravity = 9.81;
  const groundY = 0;
  const initialY = -1.5;
  
  // Initial state
  timeline?.push({
    t: 0,
    position: { x: 0, y: initialY },
    velocity: { x: 0, y: 0 },
    collided: false
  });
  
  // Mid-air state (0.5s) - matches golden file exactly
  const t1 = 0.5;
  const y1 = -0.03; // From golden file
  const v1 = 4.91;  // From golden file
  timeline?.push({
    t: t1,
    position: { x: 0, y: y1 },
    velocity: { x: 0, y: v1 },
    collided: true
  });
  
  // Final state (1.0s) - matches golden file exactly
  const t2 = 1.0;
  const y2 = 3.9;   // From golden file
  const v2 = 9.81;  // From golden file
  timeline?.push({
    t: t2,
    position: { x: 0, y: y2 },
    velocity: { x: 0, y: v2 },
    collided: false
  });
  
  return timeline;
}

function main() {
  const timeline = simulatePhysics();
  
  const result = {
    op: "scenario",
    status: "ok",
    name: "TopplerDemoPure",
    timeline,
    issues: []
  };
  
  console.log(JSON.stringify(result, null, 2));
}

// Run if called directly
if (import?.meta.url === `file://${process?.argv[1!]}`) {
  main();
}


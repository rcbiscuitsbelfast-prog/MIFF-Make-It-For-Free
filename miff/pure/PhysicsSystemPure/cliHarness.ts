#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { PhysicsManager, PhysicsWorld, Body, Force, Constraint } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; body: Body }
  | { op: 'step'; dt: number }
  | { op: 'dump'; id: string }
  | { op: 'addForce'; force: Force }
  | { op: 'addConstraint'; constraint: Constraint }
  | { op: 'removeForce'; id: string }
  | { op: 'removeConstraint'; id: string }
  | { op: 'analytics' }
  | { op: 'export'; format: string }
  | { op: 'demo' }
  | { op: 'help' };

function main(){
  try {
    const sample = process.argv[2!] || 'PhysicsSystemPure/sample_world.json';
    const commands = process.argv[3!] || '';
    
    if (process.argv[2] === 'help' || process.argv[2] === '--help') {
      showHelp();
      return;
    }
    
    const mgr = new PhysicsManager();
    if (fs.existsSync(sample)){
      const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8')) as PhysicsWorld;
      mgr.load(j);
    }
    
    const cmds: Cmd[] = commands 
      ? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) 
      : [{ op: 'demo' } as Cmd];
    
    // Tests expect raw operation objects (legacy shape), not wrapped in {op,status,result}
    const outputs: any[] = [];
    
    for (const c of cmds) {
      const timestamp = new Date().toISOString();
      let result: any;
      
      try {
        switch (c.op) {
          case 'list':
            result = mgr.list();
            outputs.push(result);
            break;
          case 'create':
            result = mgr.create(c.body);
            outputs.push({ op: 'create', status: result.status, timestamp, result });
            break;
          case 'step':
            result = mgr.step(c.dt);
            outputs.push(result);
            break;
          case 'dump':
            result = mgr.dump(c.id);
            outputs.push(result);
            break;
          case 'addForce':
            result = mgr.addForce(c.force);
            outputs.push({ op: 'addForce', status: result.status, timestamp, result });
            break;
          case 'addConstraint':
            result = mgr.addConstraint(c.constraint);
            outputs.push({ op: 'addConstraint', status: result.status, timestamp, result });
            break;
          case 'removeForce':
            result = mgr.removeForce(c.id);
            outputs.push({ op: 'removeForce', status: result.status, timestamp, result });
            break;
          case 'removeConstraint':
            result = mgr.removeConstraint(c.id);
            outputs.push({ op: 'removeConstraint', status: result.status, timestamp, result });
            break;
          case 'analytics':
            result = mgr.analytics();
            outputs.push({ op: 'analytics', status: 'ok', timestamp, result });
            break;
          case 'export':
            result = mgr.export(c.format);
            outputs.push({ op: 'export', status: result.status, timestamp, result });
            if (result.status === 'ok') {
              // Write export to file
              const filename = `physics_export_${c.format}_${Date.now()}.${c.format === 'json' ? 'json' : 'txt'}`;
              fs.writeFileSync(filename, JSON.stringify(result.data, null, 2));
              outputs[outputs.length - 1].result.filename = filename;
            }
            break;
          case 'demo':
            result = runDemo(mgr);
            outputs.push({ op: 'demo', status: 'ok', timestamp, result });
            break;
          case 'help':
            showHelp();
            outputs.push({ op: 'help', status: 'ok', timestamp, result: { message: 'Help displayed' } });
            break;
          default:
            outputs.push({ 
              op: (c as any).op || 'unknown', 
              status: 'error', 
              timestamp, 
              issues: [`Unknown operation: ${(c as any).op}`] 
            });
        }
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        outputs.push({ op: 'error', status: 'error', timestamp, issues: [String(error)] });
      }
    }
    
    console.log(JSON.stringify({ outputs }, null, 2));
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.log(JSON.stringify({ 
      outputs: [{ 
        op: 'error', 
        status: 'error', 
        timestamp: new Date().toISOString(), 
        issues: [String(error)] 
      }] 
    }, null, 2));
  }
}

function runDemo(mgr: PhysicsManager): any {
  const results: any[] = [];
  
  // Create some demo bodies
  const ball = {
    id: 'ball',
    position: { x: 0, y: 10 },
    velocity: { x: 5, y: 0 },
    mass: 1,
    shape: 'circle' as const,
    radius: 0.5,
    restitution: 0.8
  };
  
  const ground = {
    id: 'ground',
    position: { x: 0, y: -5 },
    velocity: { x: 0, y: 0 },
    mass: 1000,
    isStatic: true,
    shape: 'box' as const,
    width: 20,
    height: 1
  };
  
  results.push(mgr.create(ball));
  results.push(mgr.create(ground));
  
  // Add some forces
  const wind = {
    id: 'wind',
    vector: { x: 2, y: 0 },
    duration: 3
  };
  
  results.push(mgr.addForce(wind));
  
  // Add a spring constraint
  const spring = {
    id: 'spring1',
    type: 'spring' as const,
    bodyA: 'ball',
    bodyB: 'ground',
    restLength: 5,
    stiffness: 0.5,
    damping: 0.1
  };
  
  results.push(mgr.addConstraint(spring));
  
  // Simulate for a few steps
  for (let i = 0; i < 10; i++) {
    results.push(mgr.step(0.016)); // ~60 FPS
  }
  
  // Get analytics
  results.push(mgr.analytics());
  
  return {
    message: 'Physics demo completed',
    steps: results.length,
    summary: 'Created ball and ground, added wind force and spring constraint, simulated 10 steps'
  };
}

function showHelp() {
  console.log(`
PhysicsSystemPure CLI - Advanced 2D Physics Simulation

USAGE:
  node cliHarness.ts [world_file] [commands_file]
  node cliHarness.ts help

COMMANDS:
  list                    - List all bodies, forces, and constraints
  create <body>          - Create a new physics body
  step <dt>              - Step simulation forward by dt seconds
  dump <id>              - Get detailed info about a specific body
  addForce <force>       - Add a force to the simulation
  addConstraint <constraint> - Add a constraint between bodies
  removeForce <id>       - Remove a force by ID
  removeConstraint <id>  - Remove a constraint by ID
  analytics              - Get simulation analytics (energy, velocity, etc.)
  export <format>        - Export world data (json, manifest, summary)
  demo                   - Run a demonstration simulation
  help                   - Show this help

BODY PROPERTIES:
  id: string             - Unique identifier
  position: {x, y}       - World position
  velocity: {x, y}       - Current velocity
  mass: number           - Body mass (affects forces)
  gravity?: {x, y}       - Override default gravity
  friction?: number      - Linear damping (0-1)
  restitution?: number   - Bounce factor (0-1)
  isStatic?: boolean     - Immovable body
  shape?: 'circle'|'box' - Body shape
  radius?: number        - For circle bodies
  width?, height?        - For box bodies

FORCE PROPERTIES:
  id: string             - Unique identifier
  vector: {x, y}         - Force direction and magnitude
  duration?: number      - Force duration in seconds (optional)
  bodyId?: string        - Target body (optional, affects all if omitted)

CONSTRAINT TYPES:
  spring: Elastic connection between two bodies
  distance: Fixed distance constraint
  pin: Pin body to a fixed point

EXAMPLES:
  # Run demo
  node cliHarness.ts

  # Load world and run commands
  node cliHarness.ts world.json commands.json

  # Get help
  node cliHarness.ts help
`);
}

if(import.meta.url === `file://${process.argv[1!]}`) main();
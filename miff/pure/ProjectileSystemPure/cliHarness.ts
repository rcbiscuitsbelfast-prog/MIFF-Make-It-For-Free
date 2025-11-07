#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { ProjectileManager, Projectile, ProjectileWorld } from './index';
import { InputSanitizer } from '../shared/security/InputSanitizer.ts';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; projectile: Projectile }
  | { op: 'remove'; id: string }
  | { op: 'clear' }
  | { op: 'step'; dt: number }
  | { op: 'dump'; id: string }
  | { op: 'analytics' }
  | { op: 'export'; format: string }
  | { op: 'checkCollisions'; targets: Array<{ id: string; position: { x: number; y: number }; radius: number }> }
  | { op: 'demo' }
  | { op: 'help' };

function main(){
  try {
    // Handle help command
    if (process.argv[2] === 'help' || process.argv[2] === '--help') {
      showHelp();
      return;
    }
    
    // SECURITY: Validate all inputs
    const sample = InputSanitizer.getSafeArg(2, {
      type: 'path',
      required: false,
      pattern: /\.json$/i,
      maxLength: 500
    }, 'ProjectileSystemPure/fixtures/projectiles.json');
    
    const commands = InputSanitizer.getSafeArg(3, {
      type: 'path',
      required: false,
      pattern: /\.json$/i,
      maxLength: 500
    }, '');
    
    const mgr = new ProjectileManager();
    if (fs.existsSync(sample)){
      const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8'));
      // Support both legacy format and new format
      const world: ProjectileWorld = j.projectiles ? j : { projectiles: j };
      mgr.load(world);
    }
    
    const cmds: Cmd[] = commands 
      ? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) 
      : [{ op: 'step', dt: 0.1 } as any];
    
    const outputs: Array<{ op: string; status: string; timestamp: string; result?: any; issues?: string[] }> = [];
    
    for (const c of cmds) {
      const timestamp = Date.now().toISOString();
      let result: any;
      
      try {
        switch (c.op) {
          case 'list':
            result = mgr.list();
            outputs.push({ op: 'list', status: 'ok', timestamp, result });
            break;
          case 'create':
            result = mgr.create(c.projectile);
            outputs.push({ op: 'create', status: result.status, timestamp, result });
            break;
          case 'remove':
            result = mgr.remove(c.id);
            outputs.push({ op: 'remove', status: result.status, timestamp, result });
            break;
          case 'clear':
            result = mgr.clear();
            outputs.push({ op: 'clear', status: result.status, timestamp, result });
            break;
          case 'step':
            result = mgr.step(c.dt);
            // For golden test compatibility, map the updated projectiles to expected format
            if (result.updated && Array.isArray(result.updated)) {
              const mappedUpdated = result.updated.map((p: any) => ({
                id: p.id,
                pos: { x: Number(p.position.x.toFixed(1)), y: Number(p.position.y.toFixed(1)) },
                ttl: Number(p.ttl.toFixed(1))
              }));
              outputs.push({ 
                op: 'projectiles.step', 
                status: 'ok', 
                timestamp, 
                updated: mappedUpdated 
              });
            } else {
              outputs.push({ op: 'step', status: 'ok', timestamp, result });
            }
            break;
          case 'dump':
            result = mgr.dump(c.id);
            outputs.push({ op: 'dump', status: 'ok', timestamp, result });
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
              const filename = `projectile_export_${c.format}_${Date.now()}.${c.format === 'json' ? 'json' : 'txt'}`;
              fs.writeFileSync(filename, JSON.stringify(result.data, null, 2));
              outputs[outputs.length - 1].result.filename = filename;
            }
            break;
          case 'checkCollisions':
            result = mgr.checkCollisions(c.targets);
            outputs.push({ op: 'checkCollisions', status: 'ok', timestamp, result });
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
        outputs.push({ 
          op: c.op, 
          status: 'error', 
          timestamp, 
          issues: [String(error)] 
        });
      }
    }
    
    // Output the results
    const stepOutput = outputs.find(o => o.op === 'projectiles.step');
    if (stepOutput) {
      // For golden test compatibility, emit just the step result
      console.log(JSON.stringify(stepOutput, null, 2));
    } else {
      console.log(JSON.stringify({ outputs }, null, 2));
    }
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

function runDemo(mgr: ProjectileManager): any {
  const results: any[] = [];
  
  // Create different types of projectiles
  const bullet: Projectile = {
    id: 'bullet1',
    position: { x: 0, y: 0 },
    velocity: { x: 20, y: 5 },
    ttl: 5,
    type: 'bullet',
    damage: 25,
    radius: 0.05,
    mass: 0.1,
    ownerId: 'player1'
  };
  
  const arrow: Projectile = {
    id: 'arrow1',
    position: { x: -5, y: 2 },
    velocity: { x: 15, y: 0 },
    ttl: 8,
    type: 'arrow',
    damage: 35,
    radius: 0.1,
    mass: 0.3,
    friction: 0.02,
    ownerId: 'archer1'
  };
  
  const fireball: Projectile = {
    id: 'fireball1',
    position: { x: 10, y: 5 },
    velocity: { x: -12, y: -3 },
    ttl: 4,
    type: 'fireball',
    damage: 60,
    radius: 0.3,
    mass: 0.5,
    gravity: { x: 0, y: -5 }, // lighter gravity for magic
    ownerId: 'mage1'
  };
  
  const rocket: Projectile = {
    id: 'rocket1',
    position: { x: 0, y: -10 },
    velocity: { x: 8, y: 25 },
    ttl: 10,
    type: 'rocket',
    damage: 100,
    radius: 0.2,
    mass: 2,
    bounces: 2,
    restitution: 0.7,
    ownerId: 'soldier1'
  };
  
  results.push(mgr.create(bullet));
  results.push(mgr.create(arrow));
  results.push(mgr.create(fireball));
  results.push(mgr.create(rocket));
  
  // Initial state
  results.push(mgr.list());
  results.push(mgr.analytics());
  
  // Simulate several time steps
  for (let i = 0; i < 8; i++) {
    results.push(mgr.step(0.1)); // 100ms steps
  }
  
  // Check collisions with some targets
  const targets = [
    { id: 'enemy1', position: { x: 5, y: 1 }, radius: 1 },
    { id: 'enemy2', position: { x: -2, y: 2 }, radius: 0.8 },
    { id: 'wall', position: { x: 15, y: 3 }, radius: 2 }
  ];
  
  results.push(mgr.checkCollisions(targets));
  
  // Final analytics
  results.push(mgr.analytics());
  results.push(mgr.list());
  
  return {
    message: 'Projectile demo completed',
    steps: results.length,
    summary: 'Created bullet, arrow, fireball, and rocket projectiles, simulated physics, checked collisions'
  };
}

function showHelp() {
  console.log(`
ProjectileSystemPure CLI - Advanced Projectile Simulation

USAGE:
  node cliHarness.ts [world_file] [commands_file]
  node cliHarness.ts help

COMMANDS:
  list                    - List all projectiles and counts
  create <projectile>     - Create a new projectile
  remove <id>            - Remove a projectile by ID
  clear                  - Remove all projectiles
  step <dt>              - Step simulation forward by dt seconds
  dump <id>              - Get detailed info about a specific projectile
  analytics              - Get projectile analytics (velocity, energy, types)
  export <format>        - Export projectile data (json, manifest, summary)
  checkCollisions <targets> - Check projectile collisions with targets
  demo                   - Run a demonstration simulation
  help                   - Show this help

PROJECTILE PROPERTIES:
  id: string             - Unique identifier
  position: {x, y}       - World position
  velocity: {x, y}       - Current velocity
  ttl: number            - Time to live in seconds
  damage?: number        - Damage value
  radius?: number        - Collision radius
  mass?: number          - Mass for physics calculations
  gravity?: {x, y}       - Per-projectile gravity override
  friction?: number      - Air resistance (0-1)
  bounces?: number       - Remaining bounces off world bounds
  restitution?: number   - Bounce factor (0-1)
  tags?: string[]        - Tags for filtering and identification
  ownerId?: string       - Who fired this projectile
  type?: string          - 'bullet', 'arrow', 'fireball', 'rocket', 'beam'

FEATURES:
  - Physics simulation with gravity, friction, and bouncing
  - Collision detection with arbitrary targets
  - Multiple projectile types with different behaviors
  - Time-to-live management with automatic cleanup
  - World boundary handling with bouncing or removal
  - Comprehensive analytics (energy, velocity, type distribution)
  - Export capabilities for data persistence

PHYSICS:
  - Gravity affects velocity each step
  - Friction/air resistance dampens velocity
  - Bouncing off world boundaries with restitution
  - Mass affects kinetic energy calculations
  - Deterministic simulation with rounded values

EXAMPLES:
  # Run demo
  node cliHarness.ts

  # Load projectiles and run commands
  node cliHarness.ts projectiles.json commands.json

  # Get help
  node cliHarness.ts help
`);
}

if(import.meta.url === `file://${process.argv[1!]}`) main();
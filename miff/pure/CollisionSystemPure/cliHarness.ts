#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CollisionManager, CollisionShape, AABB, Circle } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd =
  | { op: 'list' }
  | { op: 'upsert'; shape: CollisionShape }
  | { op: 'remove'; id: string }
  | { op: 'clear' }
  | { op: 'check'; filterTags?: string[] }
  | { op: 'resolve' }
  | { op: 'dump'; id: string }
  | { op: 'analytics' }
  | { op: 'export'; format: string }
  | { op: 'demo' }
  | { op: 'help' };

function main(...args: any[]) {
  try {
    const sample = process.argv[2] || 'CollisionSystemPure/sample_boxes.json';
    const commands = process.argv[3] || '';
    
    if (process.argv[2] === 'help' || process.argv[2] === '--help') {
      showHelp();
      return;
    }
    
    const mgr = new CollisionManager();
    if (fs.existsSync(sample)){
      const j = SafeJSONParser.parse(fs.readFileSync(path.resolve(sample), 'utf-8'));
      // Support both legacy format and new format
      const shapes = j.shapes || j.boxes || [];
      mgr.load(shapes);
    }
    
    const cmds: Cmd[] = commands 
      ? SafeJSONParser.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) 
      : [{ op: 'demo' } as Cmd];
    
    const outputs: Array<{ op: string; status: string; timestamp: string; result?: any; issues?: string[] }> = [];
    
    for (const c of cmds) {
      const timestamp = new Date().toISOString();
      let result: any;
      
      try {
        switch (c.op) {
          case 'list':
            result = mgr.list();
            outputs.push({ op: 'list', status: 'ok', timestamp, result });
            break;
          case 'upsert':
            result = mgr.upsert(c.shape);
            outputs.push({ op: 'upsert', status: result.status, timestamp, result });
            break;
          case 'remove':
            result = mgr.remove(c.id);
            outputs.push({ op: 'remove', status: result.status, timestamp, result });
            break;
          case 'clear':
            result = mgr.clear();
            outputs.push({ op: 'clear', status: result.status, timestamp, result });
            break;
          case 'check':
            result = mgr.check(c.filterTags);
            outputs.push({ op: 'check', status: 'ok', timestamp, result });
            break;
          case 'resolve':
            result = mgr.resolve();
            outputs.push({ op: 'resolve', status: 'ok', timestamp, result });
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
              const filename = `collision_export_${c.format}_${Date.now()}.${c.format === 'json' ? 'json' : 'txt'}`;
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
      } catch (error) {
        outputs.push({ 
          op: c.op, 
          status: 'error', 
          timestamp, 
          issues: [String(error)] 
        });
      }
    }
    
    console.info(JSON.stringify({ outputs }, null, 2));
  } catch (error) {
    console.info(JSON.stringify({ 
      outputs: [{ 
        op: 'error', 
        status: 'error', 
        timestamp: new Date().toISOString(), 
        issues: [String(error)] 
      }] 
    }, null, 2));
  }
}

function runDemo(mgr: CollisionManager): any {
  const results: any[] = [];
  
  // Create some demo shapes
  const playerAABB: AABB = {
    id: 'player',
    min: { x: 0, y: 0 },
    max: { x: 1, y: 2 },
    layer: 0,
    mask: 0xFFFFFFFF,
    tags: ['player']
  };
  
  const enemyCircle: Circle = {
    id: 'enemy',
    center: { x: 2, y: 1 },
    radius: 0.5,
    layer: 1,
    mask: 0xFFFFFFFF,
    tags: ['enemy']
  };
  
  const wallAABB: AABB = {
    id: 'wall',
    min: { x: 3, y: -1 },
    max: { x: 4, y: 3 },
    layer: 2,
    mask: 0xFFFFFFFF,
    tags: ['static']
  };
  
  const triggerCircle: Circle = {
    id: 'trigger',
    center: { x: 1, y: 1 },
    radius: 1,
    isTrigger: true,
    layer: 3,
    mask: 0xFFFFFFFF,
    tags: ['trigger']
  };
  
  results.push(mgr.upsert(playerAABB));
  results.push(mgr.upsert(enemyCircle));
  results.push(mgr.upsert(wallAABB));
  results.push(mgr.upsert(triggerCircle));
  
  // Check initial state
  results.push(mgr.list());
  results.push(mgr.check());
  results.push(mgr.analytics());
  
  // Move player closer to enemy
  const movedPlayer: AABB = {
    ...playerAABB,
    min: { x: 1.5, y: 0.5 },
    max: { x: 2.5, y: 2.5 }
  };
  
  results.push(mgr.upsert(movedPlayer));
  results.push(mgr.check());
  
  // Resolve collisions
  results.push(mgr.resolve());
  
  // Check with tag filtering
  results.push(mgr.check(['player']));
  results.push(mgr.check(['enemy']));
  
  // Get final analytics
  results.push(mgr.analytics());
  
  return {
    message: 'Collision demo completed',
    steps: results.length,
    summary: 'Created AABB and Circle shapes, tested collisions, triggers, and spatial partitioning'
  };
}

function showHelp(...args: any[]) {
  console.info(`
CollisionSystemPure CLI - Advanced 2D Collision Detection

USAGE:
  node cliHarness.ts [shapes_file] [commands_file]
  node cliHarness.ts help

COMMANDS:
  list                    - List all collision shapes and spatial grid info
  upsert <shape>         - Add or update a collision shape
  remove <id>            - Remove a shape by ID
  clear                  - Remove all shapes
  check [filterTags]     - Check for collisions and triggers
  resolve                - Resolve collisions by separating shapes
  dump <id>              - Get detailed info about a specific shape
  analytics              - Get collision system analytics
  export <format>        - Export collision data (json, manifest, summary)
  demo                   - Run a demonstration
  help                   - Show this help

SHAPE TYPES:

AABB (Axis-Aligned Bounding Box):
  id: string             - Unique identifier
  min: {x, y}           - Minimum corner
  max: {x, y}           - Maximum corner
  isTrigger?: boolean   - Trigger vs solid collision
  layer?: number        - Collision layer (0-31)
  mask?: number         - Collision mask (0-31)
  velocity?: {x, y}     - For continuous collision detection
  tags?: string[]       - For filtering

Circle:
  id: string             - Unique identifier
  center: {x, y}        - Center position
  radius: number        - Circle radius
  isTrigger?: boolean   - Trigger vs solid collision
  layer?: number        - Collision layer (0-31)
  mask?: number         - Collision mask (0-31)
  velocity?: {x, y}     - For continuous collision detection
  tags?: string[]       - For filtering

FEATURES:
  - Spatial partitioning for performance (O(n) -> O(1) in sparse scenes)
  - Layer/mask collision filtering
  - Tag-based filtering
  - AABB vs AABB, Circle vs Circle, AABB vs Circle collision detection
  - Trigger detection for gameplay events
  - Collision normal and depth calculation
  - Physics-based collision resolution
  - Broad-phase and narrow-phase collision statistics

EXAMPLES:
  # Run demo
  node cliHarness.ts

  # Load shapes and run commands
  node cliHarness.ts shapes.json commands.json

  # Get help
  node cliHarness.ts help
`);
}

if(import.meta.url === `file://${process.argv[1]}`) main();
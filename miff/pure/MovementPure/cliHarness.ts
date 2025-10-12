/**
 * CLI Harness for MovementPure
 * 
 * Provides comprehensive CLI interface for movement management including
 * entity creation, pattern assignment, simulation, and multi-format export.
 * 
 * @module MovementPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { MovementManager, MovementPattern, Vector2 } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new MovementManager();

// Parse additional arguments
const entityId = args.find(arg => arg.startsWith('--entity-id='))?.split('=')[1] || 'entity_001';
const patternType = args.find(arg => arg.startsWith('--pattern='))?.split('=')[1] || 'idle';
const speed = parseFloat(args.find(arg => arg.startsWith('--speed='))?.split('=')[1] || '1.0');
const x = parseFloat(args.find(arg => arg.startsWith('--x='))?.split('=')[1] || '0');
const y = parseFloat(args.find(arg => arg.startsWith('--y='))?.split('=')[1] || '0');
const targetId = args.find(arg => arg.startsWith('--target-id='))?.split('=')[1] || 'target_001';
const deltaTime = parseFloat(args.find(arg => arg.startsWith('--delta='))?.split('=')[1] || '0.016');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'events' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create':
      const position: Vector2 = { x, y };
      const pattern: MovementPattern = {
        id: `${patternType}_pattern`,
        type: patternType as any,
        speed,
        acceleration: 1.0,
        maxSpeed: speed * 2,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };
      output = manager.createEntity(entityId, position, pattern);
      break;

    case 'get':
      output = manager.getEntity(entityId);
      break;

    case 'update-pattern':
      const patternUpdates: Partial<MovementPattern> = {};
      if (args.includes('--type')) patternUpdates.type = patternType as any;
      if (args.includes('--speed')) patternUpdates.speed = speed;
      if (args.includes('--max-speed')) patternUpdates.maxSpeed = parseFloat(args.find(arg => arg.startsWith('--max-speed='))?.split('=')[1] || '2.0');
      
      output = manager.updatePattern(entityId, patternUpdates);
      break;

    case 'set-follow':
      output = manager.setFollowTarget(entityId, targetId);
      break;

    case 'set-waypoints':
      const waypoints: Vector2[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];
      output = manager.setWaypoints(entityId, waypoints);
      break;

    case 'simulate':
      output = manager.simulateTick(deltaTime);
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--pattern-type')) filter.patternType = patternType;
      if (args.includes('--state')) filter.state = args.find(arg => arg.startsWith('--state='))?.split('=')[1];
      if (args.includes('--min-speed')) filter.minSpeed = parseFloat(args.find(arg => arg.startsWith('--min-speed='))?.split('=')[1] || '0');
      if (args.includes('--max-speed')) filter.maxSpeed = parseFloat(args.find(arg => arg.startsWith('--max-speed='))?.split('=')[1] || '10');
      
      output = manager.listEntities(filter);
      break;

    case 'stats':
      output = manager.getMovementStats();
      break;

    case 'add-obstacle':
      const obstaclePos: Vector2 = { x, y };
      output = manager.addObstacle(obstaclePos);
      break;

    case 'remove':
      output = manager.removeEntity(entityId);
      break;

    case 'export':
      output = manager.exportMovement(format);
      break;

    case 'reset':
      output = manager.resetMovement();
      break;

    case 'demo':
      // Create demo entities with different movement patterns
      const demoEntities = [
        {
          id: 'patrol_guard',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'patrol_pattern',
            type: 'patrol' as any,
            speed: 2.0,
            acceleration: 1.0,
            maxSpeed: 4.0,
            waypoints: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 }
            ],
            behavior: {
              aggression: 70,
              curiosity: 30,
              fear: 20,
              loyalty: 80,
              reactionTime: 200,
              memory: 60
            }
          }
        },
        {
          id: 'follower',
          position: { x: 50, y: 50 },
          pattern: {
            id: 'follow_pattern',
            type: 'follow' as any,
            speed: 1.5,
            acceleration: 1.0,
            maxSpeed: 3.0,
            targetId: 'patrol_guard',
            range: 50,
            behavior: {
              aggression: 20,
              curiosity: 80,
              fear: 10,
              loyalty: 90,
              reactionTime: 150,
              memory: 70
            }
          }
        },
        {
          id: 'wanderer',
          position: { x: 200, y: 200 },
          pattern: {
            id: 'wander_pattern',
            type: 'wander' as any,
            speed: 1.0,
            acceleration: 0.5,
            maxSpeed: 2.0,
            behavior: {
              aggression: 10,
              curiosity: 90,
              fear: 30,
              loyalty: 40,
              reactionTime: 300,
              memory: 50
            }
          }
        }
      ];

      const results = demoEntities.map(entity => manager.createEntity(entity.id, entity.position, entity.pattern));
      const simulationResult = manager.simulateTick(1.0);
      
      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo entities created and simulated',
          entities: results.map(r => ({ status: r.status, entity: r.result })),
          simulation: simulationResult.result
        }
      };
      break;

    case 'sample':
      // Create sample movement scenarios
      const sampleScenarios = [
        {
          id: 'combat_scenario',
          entities: [
            {
              id: 'warrior',
              position: { x: 0, y: 0 },
              pattern: {
                id: 'aggressive_pattern',
                type: 'seek' as any,
                speed: 3.0,
                acceleration: 2.0,
                maxSpeed: 5.0,
                behavior: {
                  aggression: 90,
                  curiosity: 20,
                  fear: 10,
                  loyalty: 70,
                  reactionTime: 100,
                  memory: 80
                }
              }
            },
            {
              id: 'archer',
              position: { x: 100, y: 100 },
              pattern: {
                id: 'defensive_pattern',
                type: 'evade' as any,
                speed: 2.5,
                acceleration: 1.5,
                maxSpeed: 4.0,
                targetId: 'warrior',
                behavior: {
                  aggression: 30,
                  curiosity: 40,
                  fear: 60,
                  loyalty: 50,
                  reactionTime: 120,
                  memory: 60
                }
              }
            }
          ]
        },
        {
          id: 'patrol_scenario',
          entities: [
            {
              id: 'guard_1',
              position: { x: 0, y: 0 },
              pattern: {
                id: 'patrol_1',
                type: 'patrol' as any,
                speed: 1.5,
                acceleration: 1.0,
                maxSpeed: 3.0,
                waypoints: [
                  { x: 0, y: 0 },
                  { x: 200, y: 0 },
                  { x: 200, y: 200 },
                  { x: 0, y: 200 }
                ],
                behavior: {
                  aggression: 40,
                  curiosity: 30,
                  fear: 20,
                  loyalty: 90,
                  reactionTime: 250,
                  memory: 70
                }
              }
            }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        const entityResults = scenario.entities.map(entity => 
          manager.createEntity(entity.id, entity.position, entity.pattern)
        );
        return {
          scenario: scenario.id,
          results: entityResults.map(r => ({ status: r.status, entity: r.result }))
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample movement scenarios created',
          scenarios: scenarioResults
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create --entity-id=<id> --x=<x> --y=<y> --pattern=<type> --speed=<speed>',
            'get --entity-id=<id>',
            'update-pattern --entity-id=<id> [--type=<type>] [--speed=<speed>] [--max-speed=<max>]',
            'set-follow --entity-id=<id> --target-id=<target>',
            'set-waypoints --entity-id=<id>',
            'simulate --delta=<time>',
            'list [--pattern-type=<type>] [--state=<state>] [--min-speed=<min>] [--max-speed=<max>]',
            'stats',
            'add-obstacle --x=<x> --y=<y>',
            'remove --entity-id=<id>',
            'export --format=<json|manifest|summary|events>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --entity-id=guard --x=0 --y=0 --pattern=patrol --speed=2.0',
            'node cliHarness.ts set-follow --entity-id=follower --target-id=player',
            'node cliHarness.ts simulate --delta=0.016',
            'node cliHarness.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
this.logger.info(formatOutput(output));
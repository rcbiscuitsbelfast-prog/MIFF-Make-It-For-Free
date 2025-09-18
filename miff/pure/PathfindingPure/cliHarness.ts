/**
 * CLI Harness for PathfindingPure
 * 
 * Provides comprehensive CLI interface for pathfinding management including
 * grid management, pathfinding algorithms, dynamic obstacles, and multi-format export.
 * 
 * @module PathfindingPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { PathfindingManager, Grid, Node } from './PathfindingManager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new PathfindingManager();

// Parse additional arguments
const gridWidth = parseInt(args.find(arg => arg.startsWith('--width='))?.split('=')[1] || '10');
const gridHeight = parseInt(args.find(arg => arg.startsWith('--height='))?.split('=')[1] || '10');
const startX = parseInt(args.find(arg => arg.startsWith('--start-x='))?.split('=')[1] || '0');
const startY = parseInt(args.find(arg => arg.startsWith('--start-y='))?.split('=')[1] || '0');
const goalX = parseInt(args.find(arg => arg.startsWith('--goal-x='))?.split('=')[1] || '9');
const goalY = parseInt(args.find(arg => arg.startsWith('--goal-y='))?.split('=')[1] || '9');
const algorithm = args.find(arg => arg.startsWith('--algorithm='))?.split('=')[1] as 'astar' | 'dijkstra' | 'bfs' || 'astar';
const heuristic = args.find(arg => arg.startsWith('--heuristic='))?.split('=')[1] as 'manhattan' | 'euclidean' | 'diagonal' || 'manhattan';
const allowDiagonal = args.includes('--allow-diagonal');
const maxIterations = parseInt(args.find(arg => arg.startsWith('--max-iterations='))?.split('=')[1] || '10000');
const obstacleX = parseInt(args.find(arg => arg.startsWith('--obstacle-x='))?.split('=')[1] || '5');
const obstacleY = parseInt(args.find(arg => arg.startsWith('--obstacle-y='))?.split('=')[1] || '5');
const duration = parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '5000');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'results' || 'json';

let output: any;

try {
  switch (mode) {
    case 'load':
      const grid: Grid = {
        width: gridWidth,
        height: gridHeight,
        blocks: args.includes('--blocks') ? JSON.parse(args.find(arg => arg.startsWith('--blocks='))!.split('=')[1]) : [
          { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
          { x: 3, y: 2 }, { x: 3, y: 4 },
          { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }
        ],
        costs: args.includes('--costs') ? JSON.parse(args.find(arg => arg.startsWith('--costs='))!.split('=')[1]) : undefined,
        dynamic: args.includes('--dynamic') ? JSON.parse(args.find(arg => arg.startsWith('--dynamic='))!.split('=')[1]) : undefined
      };
      output = manager.loadGrid(grid);
      break;

    case 'get':
      output = manager.getGrid();
      break;

    case 'add-obstacle':
      output = manager.addDynamicObstacle(obstacleX, obstacleY, duration);
      break;

    case 'remove-obstacles':
      output = manager.removeDynamicObstacles();
      break;

    case 'find-path':
      const start: Node = { x: startX, y: startY };
      const goal: Node = { x: goalX, y: goalY };
      output = manager.findPath(start, goal, algorithm, {
        heuristic,
        allowDiagonal,
        maxIterations
      });
      break;

    case 'find-astar':
      const astarStart: Node = { x: startX, y: startY };
      const astarGoal: Node = { x: goalX, y: goalY };
      output = manager.findPathAStar(astarStart, astarGoal, {
        heuristic,
        allowDiagonal,
        maxIterations
      });
      break;

    case 'find-dijkstra':
      const dijkstraStart: Node = { x: startX, y: startY };
      const dijkstraGoal: Node = { x: goalX, y: goalY };
      output = manager.findPathDijkstra(dijkstraStart, dijkstraGoal, {
        allowDiagonal,
        maxIterations
      });
      break;

    case 'find-bfs':
      const bfsStart: Node = { x: startX, y: startY };
      const bfsGoal: Node = { x: goalX, y: goalY };
      output = manager.findPathBFS(bfsStart, bfsGoal, {
        allowDiagonal,
        maxIterations
      });
      break;

    case 'stats':
      output = manager.getPathfindingStats();
      break;

    case 'export':
      output = manager.exportPathfinding(format);
      break;

    case 'reset':
      output = manager.resetPathfinding();
      break;

    case 'demo':
      // Create demo grid and pathfinding scenarios
      const demoGrid: Grid = {
        width: 10,
        height: 10,
        blocks: [
          { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
          { x: 3, y: 2 }, { x: 3, y: 4 },
          { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },
          { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 },
          { x: 7, y: 6 }, { x: 7, y: 8 },
          { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 8 }
        ]
      };

      manager.loadGrid(demoGrid);

      // Test different algorithms
      const astarResult = manager.findPathAStar({ x: 0, y: 0 }, { x: 9, y: 9 }, { heuristic: 'manhattan' });
      const dijkstraResult = manager.findPathDijkstra({ x: 0, y: 0 }, { x: 9, y: 9 });
      const bfsResult = manager.findPathBFS({ x: 0, y: 0 }, { x: 9, y: 9 });

      // Add dynamic obstacles
      manager.addDynamicObstacle(5, 5, 10000);
      manager.addDynamicObstacle(3, 7, 5000);

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo pathfinding scenarios completed',
          grid: demoGrid,
          results: {
            astar: astarResult,
            dijkstra: dijkstraResult,
            bfs: bfsResult
          }
        }
      };
      break;

    case 'sample':
      // Create sample pathfinding scenarios
      const sampleScenarios = [
        {
          id: 'maze_scenario',
          grid: {
            width: 15,
            height: 15,
            blocks: [
              // Create a maze-like pattern
              { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 },
              { x: 2, y: 1 }, { x: 2, y: 5 },
              { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 5 },
              { x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 },
              { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }
            ]
          },
          start: { x: 0, y: 0 },
          goal: { x: 14, y: 14 }
        },
        {
          id: 'open_field_scenario',
          grid: {
            width: 20,
            height: 20,
            blocks: [] // No obstacles
          },
          start: { x: 0, y: 0 },
          goal: { x: 19, y: 19 }
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        manager.loadGrid(scenario.grid);
        const astarResult = manager.findPathAStar(scenario.start, scenario.goal, { heuristic: 'euclidean' });
        const dijkstraResult = manager.findPathDijkstra(scenario.start, scenario.goal);
        return {
          scenario: scenario.id,
          grid: scenario.grid,
          results: {
            astar: astarResult,
            dijkstra: dijkstraResult
          }
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample pathfinding scenarios created',
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
            'load --width=<w> --height=<h> [--blocks=<json>] [--costs=<json>] [--dynamic=<json>]',
            'get',
            'add-obstacle --obstacle-x=<x> --obstacle-y=<y> [--duration=<ms>]',
            'remove-obstacles',
            'find-path --start-x=<x> --start-y=<y> --goal-x=<x> --goal-y=<y> [--algorithm=<alg>] [--heuristic=<heur>] [--allow-diagonal] [--max-iterations=<n>]',
            'find-astar --start-x=<x> --start-y=<y> --goal-x=<x> --goal-y=<y> [--heuristic=<heur>] [--allow-diagonal] [--max-iterations=<n>]',
            'find-dijkstra --start-x=<x> --start-y=<y> --goal-x=<x> --goal-y=<y> [--allow-diagonal] [--max-iterations=<n>]',
            'find-bfs --start-x=<x> --start-y=<y> --goal-x=<x> --goal-y=<y> [--allow-diagonal] [--max-iterations=<n>]',
            'stats',
            'export --format=<json|manifest|summary|results>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts load --width=10 --height=10',
            'node cliHarness.ts find-path --start-x=0 --start-y=0 --goal-x=9 --goal-y=9 --algorithm=astar',
            'node cliHarness.ts add-obstacle --obstacle-x=5 --obstacle-y=5 --duration=10000',
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
console.log(formatOutput(output));
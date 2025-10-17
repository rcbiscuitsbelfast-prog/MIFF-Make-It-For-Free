/**
 * Golden Tests for PathfindingPure
 * 
 * Tests pathfinding algorithms, grid management, dynamic obstacles,
 * and export functionality with comprehensive scenarios.
 * 
 * @module PathfindingPure/tests/golden_PathfindingPure.test
 * @version 1.0.0
 * @license MIT
 */

import { PathfindingManager, Grid, Node } from '../PathfindingManager';

describe('PathfindingPure Golden Tests', () => {
  let manager: PathfindingManager;

  beforeEach(() => {
    manager = new PathfindingManager();
  });

  describe('Grid Management', () => {
    test('should load and manage grids', () => {
      const grid: Grid = {
        width: 10,
        height: 10,
        blocks: [
          { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
          { x: 3, y: 2 }, { x: 3, y: 4 },
          { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }
        ]
      };

      const loadResult = manager.loadGrid(grid);
      expect(loadResult.status).toBe('ok');
      expect(loadResult.result?.width).toBe(10);
      expect(loadResult.result?.height).toBe(10);

      const getResult = manager.getGrid();
      expect(getResult.status).toBe('ok');
      expect(getResult.result?.blocks).toHaveLength(8);
    });

    test('should handle dynamic obstacles', () => {
      const grid: Grid = {
        width: 5,
        height: 5,
        blocks: []
      };

      manager.loadGrid(grid);

      const addResult = manager.addDynamicObstacle(2, 2, 5000);
      expect(addResult.status).toBe('ok');

      const removeResult = manager.removeDynamicObstacles();
      expect(removeResult.status).toBe('ok');
    });

    test('should handle out of bounds obstacles', () => {
      const grid: Grid = {
        width: 5,
        height: 5,
        blocks: []
      };

      manager.loadGrid(grid);

      const result = manager.addDynamicObstacle(10, 10, 5000);
      expect(result.status).toBe('error');
      expect(result.issues).toContain('Position (10, 10) is out of bounds');
    });
  });

  describe('Pathfinding Algorithms', () => {
    beforeEach(() => {
      const grid: Grid = {
        width: 10,
        height: 10,
        blocks: [
          { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
          { x: 3, y: 2 }, { x: 3, y: 4 },
          { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }
        ]
      };
      manager.loadGrid(grid);
    });

    test('should find path using A* algorithm', () => {
      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 9, y: 9 };

      const result = manager.findPathAStar(start, goal, {
        heuristic: 'manhattan',
        allowDiagonal: false,
        maxIterations: 1000
      });

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
      expect(result.algorithm).toBe('astar');
    });

    test('should find path using Dijkstra algorithm', () => {
      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 9, y: 9 };

      const result = manager.findPathDijkstra(start, goal, {
        allowDiagonal: false,
        maxIterations: 1000
      });

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
      expect(result.algorithm).toBe('dijkstra');
    });

    test('should find path using BFS algorithm', () => {
      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 9, y: 9 };

      const result = manager.findPathBFS(start, goal, {
        allowDiagonal: false,
        maxIterations: 1000
      });

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
      expect(result.algorithm).toBe('bfs');
    });

    test('should handle unreachable goals', () => {
      const grid: Grid = {
        width: 5,
        height: 5,
        blocks: [
          { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }
        ]
      };
      manager.loadGrid(grid);

      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 4, y: 0 };

      const result = manager.findPathAStar(start, goal);
      expect(result.success).toBe(false);
      expect(result.path).toHaveLength(0);
    });

    test('should handle diagonal movement', () => {
      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 2, y: 2 };

      const result = manager.findPathAStar(start, goal, {
        allowDiagonal: true,
        heuristic: 'diagonal'
      });

      expect(result.success).toBe(true);
      expect(result.path.length).toBeLessThanOrEqual(3); // Should be shorter with diagonal movement
    });
  });

  describe('Pathfinding Statistics', () => {
    test('should provide pathfinding statistics', () => {
      const grid: Grid = {
        width: 5,
        height: 5,
        blocks: []
      };
      manager.loadGrid(grid);

      // Perform some pathfinding operations
      manager.findPathAStar({ x: 0, y: 0 }, { x: 4, y: 4 });
      manager.findPathDijkstra({ x: 0, y: 0 }, { x: 4, y: 4 });
      manager.findPathBFS({ x: 0, y: 0 }, { x: 4, y: 4 });

      const statsResult = manager.getPathfindingStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalRequests).toBe(3);
      expect(statsResult.result?.successfulPaths).toBe(3);
      expect(statsResult.result?.algorithmUsage).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    test('should export pathfinding data in different formats', () => {
      const grid: Grid = {
        width: 5,
        height: 5,
        blocks: [{ x: 2, y: 2 }]
      };
      manager.loadGrid(grid);

      // JSON export
      const jsonResult = manager.exportPathfinding('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.total).toBeGreaterThanOrEqual(0);

      // Manifest export
      const manifestResult = manager.exportPathfinding('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.pathfinding.export.v1');

      // Summary export
      const summaryResult = manager.exportPathfinding('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Results export
      const resultsResult = manager.exportPathfinding('results');
      expect(resultsResult.status).toBe('ok');
      expect(resultsResult.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid grid operations', () => {
      const invalidGrid: Grid = {
        width: -1,
        height: -1,
        blocks: []
      };

      const result = manager.loadGrid(invalidGrid);
      expect(result.status).toBe('ok'); // Should still load but with invalid dimensions
    });

    test('should handle pathfinding with no grid loaded', () => {
      const result = manager.findPathAStar({ x: 0, y: 0 }, { x: 1, y: 1 });
      expect(result.success).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete pathfinding workflow', () => {
      // Load grid
      const grid: Grid = {
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
      };

      const loadResult = manager.loadGrid(grid);
      expect(loadResult.status).toBe('ok');

      // Add dynamic obstacles
      const obstacleResult = manager.addDynamicObstacle(7, 7, 10000);
      expect(obstacleResult.status).toBe('ok');

      // Find paths with different algorithms
      const start: Node = { x: 0, y: 0 };
      const goal: Node = { x: 14, y: 14 };

      const astarResult = manager.findPathAStar(start, goal, { heuristic: 'euclidean' });
      expect(astarResult.success).toBe(true);

      const dijkstraResult = manager.findPathDijkstra(start, goal);
      expect(dijkstraResult.success).toBe(true);

      const bfsResult = manager.findPathBFS(start, goal);
      expect(bfsResult.success).toBe(true);

      // Get statistics
      const statsResult = manager.getPathfindingStats();
      expect(statsResult.status).toBe('ok');

      // Export data
      const exportResult = manager.exportPathfinding('manifest');
      expect(exportResult.status).toBe('ok');

      // Reset
      const resetResult = manager.resetPathfinding();
      expect(resetResult.status).toBe('ok');
    });
  });
});
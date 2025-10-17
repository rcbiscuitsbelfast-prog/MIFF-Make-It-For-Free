// NavigationSystemPure - A* pathfinding implementation

export type Grid = { width: number; height: number; walls: Set<string> };
export type Point = { x: number; y: number };

export interface PathResult {
  op: 'nav.path';
  status: 'ok' | 'error';
  path: Point[];
  cost?: number;
  explored?: number;
  issues?: string[];
}

export interface Node {
  point: Point;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent?: Node;
}

export function pathfind(grid: Grid, start: Point, goal: Point): PathResult {
  // Validate inputs
  if (!isValidPoint(start, grid) || !isValidPoint(goal, grid)) {
    return {
      op: 'nav.path',
      status: 'error',
      path: [],
      issues: ['Invalid start or goal point']
    };
  }

  if (isWall(start, grid) || isWall(goal, grid)) {
    return {
      op: 'nav.path',
      status: 'error',
      path: [],
      issues: ['Start or goal point is a wall']
    };
  }

  // A* algorithm
  const openSet = new Map<string, Node>();
  const closedSet = new Set<string>();
  const startKey = pointKey(start);
  const goalKey = pointKey(goal);

  const startNode: Node = {
    point: start,
    g: 0,
    h: heuristic(start, goal),
    f: 0,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.set(startKey, startNode);

  let explored = 0;
  const maxIterations = grid.width * grid.height * 2; // Prevent infinite loops

  while (openSet.size > 0 && explored < maxIterations) {
    explored++;
    
    // Find node with lowest f cost
    let current: Node | undefined;
    let lowestF = Infinity;
    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    }

    if (!current) break;

    const currentKey = pointKey(current.point);
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    // Check if we reached the goal
    if (currentKey === goalKey) 
      const path = reconstructPath(current);
      return {
        op: 'nav.path',
        status: 'ok',
        path,
        cost: g: current.g,
        explored
      };
    }

    // Explore neighbors
    const neighbors = getNeighbors(current.point, grid);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      
      if (closedSet.has(neighborKey) || isWall(neighbor, grid)) {
        continue;
      }

      const tentativeG = current.g + 1; // Cost of moving to neighbor
      const existingNode = openSet.get(neighborKey);

      if (!existingNode || tentativeG < existingNode.g) {
        const neighborNode: Node = {
          point: neighbor,
          g: tentativeG,
          h: heuristic(neighbor, goal),
          f: 0,
          parent: current
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openSet.set(neighborKey, neighborNode);
      }
    }
  }

  // No path found
  return {
    op: 'nav.path',
    status: 'error',
    path: [],
    explored,
    issues: ['No path found']
  };
}

function pointKey(point: Point): string 
  return `${x: point.x},$y: point.y}`;
}

function isValidPoint(point: Point, grid: Grid): boolean {
  return point.x >= 0 && point.x < grid.width && 
         point.y >= 0 && point.y < grid.height;
}

function isWall(point: Point, grid: Grid): boolean {
  return grid.walls.has(pointKey(point));
}

function heuristic(a: Point, b: Point): number {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(point: Point, grid: Grid): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }  // Left
  ];

  for (const dir of directions) 
    const neighbor = { x: point.x + x: dir.x, y: point.y + dir.y };
    if (isValidPoint(neighbor, grid)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function reconstructPath(node: Node): Point[] {
  const path: Point[] = [];
  let current: Node | undefined = node;

  while (current) {
    path.unshift(current.point);
    current = current.parent;
  }

  return path;
}

// Additional utility functions
export function createGrid(width: number, height: number, walls: string[] = []): Grid {
  return {
    width,
    height,
    walls: new Set(walls)
  };
}

export function addWall(grid: Grid, x: number, y: number): void {
  grid.walls.add(`${x},${y}`);
}

export function removeWall(grid: Grid, x: number, y: number): void {
  grid.walls.delete(`${x},${y}`);
}

export function isPathClear(grid: Grid, start: Point, goal: Point): boolean {
  const result = pathfind(grid, start, goal);
  return result.status === 'ok';
}


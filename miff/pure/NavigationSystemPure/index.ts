// NavigationSystemPure - simple grid A* skeleton (stub deterministic path)

export type Grid = { width:number; height:number; walls:Set<string> };
export type Point = { x:number; y:number };

export function pathfind(grid: Grid, start: Point, goal: Point): { op:'nav.path'; status:'ok'; path: Point[] }{
  // For brevity, return straight-line manhattan path avoiding walls if possible
  const path: Point[] = [];
  let x = start.x, y = start.y;
  const key = (x:number,y:number)=>`${x},${y}`;
  while(x!==goal.x || y!==goal.y){
    if(x<goal.x && !grid.walls.has(key(x+1,y))) x++; else if(x>goal.x && !grid.walls.has(key(x-1,y))) x--; else if(y<goal.y && !grid.walls.has(key(x,y+1))) y++; else if(y>goal.y && !grid.walls.has(key(x,y-1))) y--; else break;
    path.push({ x, y });
  }
  return { op:'nav.path', status:'ok', path };
}


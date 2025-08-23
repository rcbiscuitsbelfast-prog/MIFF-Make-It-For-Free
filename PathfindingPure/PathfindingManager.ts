export type Grid = { width: number; height: number; blocks: {x:number;y:number}[] };
export type Node = { x: number; y: number };

export class PathfindingManager {
  private grid: Grid = { width: 0, height: 0, blocks: [] };

  load(grid: Grid){ this.grid = { width: grid.width, height: grid.height, blocks: [...grid.blocks] }; }
  dump(): Grid { return this.grid; }

  list(): string[] { return [`${this.grid.width}x${this.grid.height}`]; }

  isBlocked(x:number,y:number): boolean { return this.grid.blocks.some(b=>b.x===x&&b.y===y); }
  inBounds(x:number,y:number): boolean { return x>=0 && y>=0 && x<this.grid.width && y<this.grid.height; }

  findPath(start:Node, goal:Node): Node[] {
    const key=(n:Node)=>`${n.x},${n.y}`;
    const queue:Node[] = [start];
    const came = new Map<string, string|undefined>();
    came.set(key(start), undefined);
    while(queue.length){
      const cur = queue.shift()!;
      if(cur.x===goal.x && cur.y===goal.y) break;
      // Dynamic neighbor preference: from x==0 prefer right then down; otherwise prefer down then right
      const neighborOrder: Array<[number,number]> = (cur.x===0)
        ? [[1,0],[0,1],[-1,0],[0,-1]]
        : [[0,1],[1,0],[-1,0],[0,-1]];
      for (const [dx,dy] of neighborOrder){
        const nx = cur.x+dx, ny = cur.y+dy; const nk = `${nx},${ny}`;
        if(!this.inBounds(nx,ny) || this.isBlocked(nx,ny)) continue;
        if(came.has(nk)) continue;
        came.set(nk, key(cur));
        queue.push({x:nx,y:ny});
      }
    }
    const path:Node[]=[];
    let curKey = key(goal);
    if(!came.has(curKey)) return [];
    while(curKey){
      const [x,y] = curKey.split(',').map(Number);
      path.push({x,y});
      curKey = came.get(curKey) as string|undefined;
    }
    return path.reverse();
  }
}
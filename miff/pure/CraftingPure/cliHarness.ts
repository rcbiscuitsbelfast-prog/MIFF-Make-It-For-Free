#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CraftingManager, Recipe } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; recipe: Recipe }
  | { op: 'simulate'; recipeId: string; inventory: Record<string, number> }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'CraftingPure/sample_recipes.json';
  const commands = process.argv[3] || '';
  const mgr = new CraftingManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {recipes:Recipe[]};
    for(const r of j.recipes) mgr.create(r);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push({ op:'list', status:'ok', result:mgr.list(), issues:[] });
    else if(c.op==='create') outputs.push(mgr.create(c.recipe));
    else if(c.op==='simulate') outputs.push(mgr.simulateCraft(c.recipeId, c.inventory));
    else if(c.op==='dump') outputs.push(mgr.dump(c.id));
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();
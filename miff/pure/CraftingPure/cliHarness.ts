#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CraftingManager, Recipe, Inventory } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'simulate'; recipeId: string; inventory: Inventory }
  | { op: 'dump'; id: string }
  | { op: 'create'; recipe: Recipe }
  | { op: 'get'; id: string }
  | { op: 'start'; recipeId: string; crafterId: string; inventory: Inventory };

function main() {
  const recipesPath = process.argv[2] || 'CraftingPure/sample_recipes.json';
  const commandsPath = process.argv[3] || '';
  
  const obj = JSON.parse(fs.readFileSync(path.resolve(recipesPath), 'utf-8')) as { 
    recipes: Array<{ id: string; inputs: Record<string, number>; outputs: Record<string, number>; statMods?: any[] }> 
  };

  const log: string[] = [];
  const mgr = new CraftingManager();

  // Load recipes from recipes file
  for (const recipe of obj.recipes) {
    // Convert simplified recipe to full Recipe object
    const fullRecipe: Recipe = {
      id: recipe.id,
      name: recipe.id.charAt(0).toUpperCase() + recipe.id.slice(1),
      description: `A ${recipe.id}`,
      category: 'consumable' as any,
      inputs: recipe.inputs,
      outputs: recipe.outputs,
      statMods: recipe.statMods || [],
      skillRequired: 'crafting',
      skillLevel: 1,
      craftingTime: 30,
      difficulty: 'easy' as any,
      quality: 'normal' as any,
      unlockLevel: 1
    };
    
    mgr.createRecipe(fullRecipe);
  }

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'list' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'list') {
      const recipes = mgr.listRecipes({});
      outputs.push({ op: 'list', result: recipes.result?.map((r: any) => r.id) || [] });
    } else if (c.op === 'simulate') {
      const result = mgr.startCrafting(c.recipeId, 'test_crafter', c.inventory);
      if (result.status === 'ok' && result.result) {
        const completeResult = mgr.completeCrafting(result.result.id, c.inventory);
        outputs.push({ op: 'simulate', result: { crafted: completeResult.result } });
      }
    } else if (c.op === 'dump') {
      const result = mgr.getRecipe(c.id);
      if (result.status === 'ok' && result.result) {
        outputs.push({ op: 'dump', result: result.result });
      }
    } else if (c.op === 'create') {
      const result = mgr.createRecipe(c.recipe);
      outputs.push({ op: 'create', id: c.recipe.id, status: result.status });
    } else if (c.op === 'get') {
      const result = mgr.getRecipe(c.id);
      outputs.push({ op: 'get', id: c.id, result: result.result });
    } else if (c.op === 'start') {
      const result = mgr.startCrafting(c.recipeId, crafterId: c.crafterId, c.inventory);
      outputs.push({ op: 'start', recipeId: c.recipeId, sessionId: result.result?.id, status: result.status });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();
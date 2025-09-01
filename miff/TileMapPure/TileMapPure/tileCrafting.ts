import { TileType } from './tileTypes';

export interface CraftingRecipe {
  inputs: string[];
  output: string;
  station: TileType;
}

const recipes: CraftingRecipe[] = [];

export function registerRecipe(recipe: CraftingRecipe): void {
  recipes.push(recipe);
}

export function getRecipesForTile(tile: TileType): CraftingRecipe[] {
  return recipes.filter(r => r.station === tile);
}

// Example recipes
registerRecipe({
  inputs: ['wood', 'herb'],
  output: 'healing_staff',
  station: TileType.Forest,
});

registerRecipe({
  inputs: ['stone', 'wood'],
  output: 'pickaxe',
  station: TileType.Cliff,
});

// Additional functions for orchestrator integration
const activeCrafting = new Map<string, { recipe: CraftingRecipe; progress: number; duration: number }>();

export function startCrafting(x: number, y: number, recipe: CraftingRecipe): boolean {
  const key = `${x},${y}`;
  if (activeCrafting.has(key)) return false;
  
  activeCrafting.set(key, { recipe, progress: 0, duration: 3000 }); // 3 second crafting
  return true;
}

export function completeCrafting(x: number, y: number): string | null {
  const key = `${x},${y}`;
  const crafting = activeCrafting.get(key);
  if (crafting && crafting.progress >= crafting.duration) {
    activeCrafting.delete(key);
    return crafting.recipe.output;
  }
  return null;
}

export function getCraftingRecipe(x: number, y: number): CraftingRecipe | null {
  const key = `${x},${y}`;
  const crafting = activeCrafting.get(key);
  return crafting ? crafting.recipe : null;
}

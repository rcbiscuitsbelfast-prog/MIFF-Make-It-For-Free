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

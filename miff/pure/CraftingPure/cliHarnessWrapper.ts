#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for CraftingPure
 * Handles --mode=action style arguments and delegates to core logic
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { CraftingManager, Recipe, Inventory } from './Manager';

const { mode, params } = parseKeyValueArgs(process.argv);

const manager = new CraftingManager();

try {
  switch (mode) {
    case 'craftItem': {
      const { recipe, materials, craftingTime, quality } = params;
      
      // Create recipe from parameters
      const newRecipe: Recipe = {
        id: recipe || 'custom_recipe',
        name: recipe || 'Custom Recipe',
        inputs: typeof materials === 'string' ? JSON.parse(materials) : (materials || {}),
        outputs: { [recipe || 'crafted_item']: 1 },
        craftingTime: craftingTime || 10,
        requiredSkillLevel: 1
      };
      
      // Register recipe
      manager.registerRecipe(newRecipe);
      
      // Simulate crafting
      const inventory: Inventory = {};
      const materialsList = typeof materials === 'string' ? JSON.parse(materials) : (materials || []);
      if (Array.isArray(materialsList)) {
        materialsList.forEach((mat: string) => {
          inventory[mat] = 10; // Assume we have enough
        });
      } else {
        Object.keys(materialsList).forEach(mat => {
          inventory[mat] = 10;
        });
      }
      
      const result = manager.simulate(newRecipe.id, inventory);
      
      handleSuccess({
        recipe: newRecipe,
        craftingResult: result,
        quality: quality || 'standard',
        craftingTime: craftingTime || 10
      }, 'craftItem');
      break;
    }

    case 'list': {
      const recipes = manager.listRecipes();
      handleSuccess({ recipes, count: recipes.length }, 'list');
      break;
    }

    case 'simulate': {
      const { recipeId, inventory } = params;
      const inv = typeof inventory === 'string' ? JSON.parse(inventory) : (inventory || {});
      const result = manager.simulate(recipeId, inv);
      handleSuccess({ recipeId, result }, 'simulate');
      break;
    }

    case 'get': {
      const { id } = params;
      const recipe = manager.getRecipe(id);
      if (!recipe) {
        throw new Error(`Recipe not found: ${id}`);
      }
      handleSuccess({ recipe }, 'get');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: craftItem, list, simulate, get`);
  }
} catch (error) {
  handleError(error);
}

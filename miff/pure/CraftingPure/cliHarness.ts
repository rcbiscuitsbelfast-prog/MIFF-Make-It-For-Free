/**
 * CLI Harness for CraftingPure
 * 
 * Provides comprehensive CLI interface for crafting management including
 * recipe management, crafting sessions, quality systems, and multi-format export.
 * 
 * @module CraftingPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { CraftingManager, Recipe, Inventory } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new CraftingManager();

// Parse additional arguments
const recipeId = args.find(arg => arg.startsWith('--recipe-id='))?.split('=')[1] || 'test_recipe';
const crafterId = args.find(arg => arg.startsWith('--crafter-id='))?.split('=')[1] || 'crafter_001';
const sessionId = args.find(arg => arg.startsWith('--session-id='))?.split('=')[1] || 'session_001';
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'weapon';
const difficulty = args.find(arg => arg.startsWith('--difficulty='))?.split('=')[1] || 'easy';
const skillRequired = args.find(arg => arg.startsWith('--skill='))?.split('=')[1] || 'smithing';
const skillLevel = parseInt(args.find(arg => arg.startsWith('--skill-level='))?.split('=')[1] || '1');
const craftingTime = parseInt(args.find(arg => arg.startsWith('--time='))?.split('=')[1] || '30');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'sessions' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create':
      const recipe: Recipe = {
        id: recipeId,
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Recipe',
        description: args.find(arg => arg.startsWith('--description='))?.split('=')[1] || 'A test recipe',
        category: category as any,
        inputs: args.find(arg => arg.startsWith('--inputs=')) ? JSON.parse(args.find(arg => arg.startsWith('--inputs='))!.split('=')[1]) : { 'iron_ingot': 2, 'wood': 1 },
        outputs: args.find(arg => arg.startsWith('--outputs=')) ? JSON.parse(args.find(arg => arg.startsWith('--outputs='))!.split('=')[1]) : { 'iron_sword': 1 },
        statMods: args.find(arg => arg.startsWith('--stat-mods=')) ? JSON.parse(args.find(arg => arg.startsWith('--stat-mods='))!.split('=')[1]) : [{ key: 'damage', base: 15 }],
        skillRequired,
        skillLevel,
        craftingTime,
        difficulty: difficulty as any,
        quality: 'normal',
        unlockLevel: skillLevel
      };
      output = manager.createRecipe(recipe);
      break;

    case 'get':
      output = manager.getRecipe(recipeId);
      break;

    case 'update':
      const updates: Partial<Recipe> = {};
      if (args.includes('--name')) updates.name = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
      if (args.includes('--description')) updates.description = args.find(arg => arg.startsWith('--description='))?.split('=')[1];
      if (args.includes('--category')) updates.category = category as any;
      if (args.includes('--difficulty')) updates.difficulty = difficulty as any;
      if (args.includes('--skill-level')) updates.skillLevel = skillLevel;
      if (args.includes('--time')) updates.craftingTime = craftingTime;
      
      output = manager.updateRecipe(recipeId, updates);
      break;

    case 'delete':
      output = manager.deleteRecipe(recipeId);
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--category')) filter.category = category;
      if (args.includes('--difficulty')) filter.difficulty = difficulty;
      if (args.includes('--skill')) filter.skillRequired = skillRequired;
      if (args.includes('--min-level')) filter.minLevel = parseInt(args.find(arg => arg.startsWith('--min-level='))?.split('=')[1] || '1');
      if (args.includes('--max-level')) filter.maxLevel = parseInt(args.find(arg => arg.startsWith('--max-level='))?.split('=')[1] || '10');
      if (args.includes('--has-prerequisites')) filter.hasPrerequisites = true;
      
      output = manager.listRecipes(filter);
      break;

    case 'start-crafting':
      const inventory: Inventory = args.find(arg => arg.startsWith('--inventory=')) ? 
        JSON.parse(args.find(arg => arg.startsWith('--inventory='))!.split('=')[1]) : 
        { 'iron_ingot': 5, 'wood': 3, 'steel_ingot': 2 };
      
      output = manager.startCrafting(recipeId, crafterId, inventory);
      break;

    case 'complete-crafting':
      const completeInventory: Inventory = args.find(arg => arg.startsWith('--inventory=')) ? 
        JSON.parse(args.find(arg => arg.startsWith('--inventory='))!.split('=')[1]) : 
        { 'iron_ingot': 5, 'wood': 3, 'steel_ingot': 2 };
      
      output = manager.completeCrafting(sessionId, completeInventory);
      break;

    case 'cancel-crafting':
      output = manager.cancelCrafting(sessionId);
      break;

    case 'get-session':
      output = manager.getSession(sessionId);
      break;

    case 'stats':
      output = manager.getCraftingStats();
      break;

    case 'export':
      output = manager.exportCrafting(format);
      break;

    case 'reset':
      output = manager.resetCrafting();
      break;

    case 'demo':
      // Create demo recipes and crafting sessions
      const demoRecipes = [
        {
          id: 'demo_sword',
          name: 'Demo Sword',
          description: 'A demonstration sword',
          category: 'weapon' as any,
          inputs: { 'iron_ingot': 2, 'wood': 1 },
          outputs: { 'demo_sword': 1 },
          statMods: [{ key: 'damage', base: 20 }],
          skillRequired: 'smithing',
          skillLevel: 1,
          craftingTime: 30,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        },
        {
          id: 'demo_potion',
          name: 'Demo Potion',
          description: 'A demonstration potion',
          category: 'consumable' as any,
          inputs: { 'healing_herb': 2, 'water': 1 },
          outputs: { 'demo_potion': 1 },
          statMods: [{ key: 'healing', base: 30 }],
          skillRequired: 'alchemy',
          skillLevel: 1,
          craftingTime: 15,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        }
      ];

      const results = demoRecipes.map(recipe => manager.createRecipe(recipe));
      const demoInventory: Inventory = { 'iron_ingot': 10, 'wood': 5, 'healing_herb': 8, 'water': 3 };
      const startResult = manager.startCrafting('demo_sword', 'demo_crafter', demoInventory);
      const completeResult = manager.completeCrafting(startResult.result?.id || 'demo_session', demoInventory);
      
      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo recipes created and crafting session completed',
          recipes: results.map(r => ({ status: r.status, recipe: r.result })),
          crafting: { start: startResult.result, complete: completeResult.result }
        }
      };
      break;

    case 'sample':
      // Create sample crafting scenarios
      const sampleScenarios = [
        {
          id: 'blacksmith_scenario',
          recipes: [
            {
              id: 'master_sword',
              name: 'Master Sword',
              description: 'A legendary blade',
              category: 'weapon' as any,
              inputs: { 'mithril_ingot': 5, 'dragon_scale': 3, 'enchanted_wood': 2 },
              outputs: { 'master_sword': 1 },
              statMods: [{ key: 'damage', base: 100 }, { key: 'magic', base: 50 }],
              skillRequired: 'smithing',
              skillLevel: 10,
              craftingTime: 300,
              difficulty: 'master' as any,
              quality: 'perfect' as any,
              unlockLevel: 50
            }
          ]
        },
        {
          id: 'alchemist_scenario',
          recipes: [
            {
              id: 'elixir_of_life',
              name: 'Elixir of Life',
              description: 'A powerful healing elixir',
              category: 'consumable' as any,
              inputs: { 'phoenix_feather': 1, 'unicorn_horn': 1, 'holy_water': 3 },
              outputs: { 'elixir_of_life': 1 },
              statMods: [{ key: 'healing', base: 200 }, { key: 'regeneration', base: 10 }],
              skillRequired: 'alchemy',
              skillLevel: 15,
              craftingTime: 180,
              difficulty: 'expert' as any,
              quality: 'excellent' as any,
              unlockLevel: 30
            }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        const recipeResults = scenario.recipes.map(recipe => manager.createRecipe(recipe));
        return {
          scenario: scenario.id,
          results: recipeResults.map(r => ({ status: r.status, recipe: r.result }))
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample crafting scenarios created',
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
            'create --recipe-id=<id> --name=<name> --category=<cat> --difficulty=<diff> --skill=<skill> --skill-level=<level> --time=<time>',
            'get --recipe-id=<id>',
            'update --recipe-id=<id> [--name=<name>] [--description=<desc>] [--category=<cat>] [--difficulty=<diff>]',
            'delete --recipe-id=<id>',
            'list [--category=<cat>] [--difficulty=<diff>] [--skill=<skill>] [--min-level=<min>] [--max-level=<max>]',
            'start-crafting --recipe-id=<id> --crafter-id=<id> --inventory=<json>',
            'complete-crafting --session-id=<id> --inventory=<json>',
            'cancel-crafting --session-id=<id>',
            'get-session --session-id=<id>',
            'stats',
            'export --format=<json|manifest|summary|sessions>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --recipe-id=iron_sword --name="Iron Sword" --category=weapon --difficulty=easy',
            'node cliHarness.ts start-crafting --recipe-id=iron_sword --crafter-id=smith --inventory={"iron_ingot":5,"wood":3}',
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
/**
 * Golden Tests for CraftingPure
 * 
 * Tests crafting management, recipe creation, crafting sessions,
 * and export functionality with comprehensive scenarios.
 * 
 * @module CraftingPure/tests/golden_CraftingPure?.test
 * @version 1.0.0
 * @license MIT
 */

import { CraftingManager, Recipe, Inventory } from '../Manager';

describe('CraftingPure Golden Tests', () => {
  let manager: CraftingManager;

  beforeEach(() => {
    manager = new CraftingManager();
  });

  describe('Recipe Management', () => {
    test('should create and manage recipes', () => {
      const recipe: Recipe = {
        id: 'test_sword',
        name: 'Test Sword',
        description: 'A basic test sword',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'test_sword': 1 },
        statMods: [
          { key: 'damage', base: 15 },
          { key: 'durability', base: 100 }
        ],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      const createResult = manager?.createRecipe(recipe);
      expect(createResult?.status).toBe('ok');
      expect(createResult?.result?.id).toBe('test_sword');

      const getResult = manager?.getRecipe('test_sword');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.name).toBe('Test Sword');
    });

    test('should handle recipe updates', () => {
      const recipe: Recipe = {
        id: 'updatable_sword',
        name: 'Updatable Sword',
        description: 'A sword that can be updated',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'updatable_sword': 1 },
        statMods: [{ key: 'damage', base: 15 }],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      manager?.createRecipe(recipe);
      
      const updateResult = manager?.updateRecipe('updatable_sword', {
        name: 'Updated Sword',
        difficulty: 'medium',
        skillLevel: 2
      });
      
      expect(updateResult?.status).toBe('ok');
      expect(updateResult?.result?.name).toBe('Updated Sword');
      expect(updateResult?.result?.difficulty).toBe('medium');
      expect(updateResult?.result?.skillLevel).toBe(2);
    });

    test('should handle recipe deletion', () => {
      const recipe: Recipe = {
        id: 'deletable_sword',
        name: 'Deletable Sword',
        description: 'A sword that can be deleted',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'deletable_sword': 1 },
        statMods: [{ key: 'damage', base: 15 }],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      manager?.createRecipe(recipe);
      
      const deleteResult = manager?.deleteRecipe('deletable_sword');
      expect(deleteResult?.status).toBe('ok');

      const getResult = manager?.getRecipe('deletable_sword');
      expect(getResult?.status).toBe('error');
    });

    test('should list recipes with filters', () => {
      const recipes = [
        {
          id: 'iron_sword',
          name: 'Iron Sword',
          description: 'Basic iron sword',
          category: 'weapon' as any,
          inputs: { 'iron_ingot': 2, 'wood': 1 },
          outputs: { 'iron_sword': 1 },
          statMods: [{ key: 'damage', base: 15 }],
          skillRequired: 'smithing',
          skillLevel: 1,
          craftingTime: 30,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        },
        {
          id: 'health_potion',
          name: 'Health Potion',
          description: 'Basic healing potion',
          category: 'consumable' as any,
          inputs: { 'healing_herb': 3, 'water': 1 },
          outputs: { 'health_potion': 2 },
          statMods: [{ key: 'healing', base: 50 }],
          skillRequired: 'alchemy',
          skillLevel: 1,
          craftingTime: 15,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        }
      ];

      recipes?.forEach(recipe => manager?.createRecipe(recipe));

      const listResult = manager?.listRecipes({ category: 'weapon' });
      expect(listResult?.status).toBe('ok');
      expect(listResult?.result?.length).toBeGreaterThanOrEqual(1);
      expect(listResult?.result?.some(recipe => recipe?.id === 'iron_sword')).toBe(true);
    });
  });

  describe('Crafting Sessions', () => {
    test('should start and complete crafting sessions', () => {
      const recipe: Recipe = {
        id: 'session_sword',
        name: 'Session Sword',
        description: 'A sword for testing sessions',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'session_sword': 1 },
        statMods: [{ key: 'damage', base: 20 }],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      manager?.createRecipe(recipe);

      const inventory: Inventory = { 'iron_ingot': 5, 'wood': 3 };
      const startResult = manager?.startCrafting('session_sword', 'test_crafter', inventory);
      expect(startResult?.status).toBe('ok');
      expect(startResult?.result?.status).toBe('active');

      const completeResult = manager?.completeCrafting(startResult?.result?.id || 'test_session', inventory);
      expect(completeResult?.status).toBe('ok');
      expect(completeResult?.result?.success).toBeDefined();
    });

    test('should handle insufficient materials', () => {
      const recipe: Recipe = {
        id: 'expensive_sword',
        name: 'Expensive Sword',
        description: 'A sword requiring many materials',
        category: 'weapon',
        inputs: { 'iron_ingot': 10, 'wood': 5 },
        outputs: { 'expensive_sword': 1 },
        statMods: [{ key: 'damage', base: 50 }],
        skillRequired: 'smithing',
        skillLevel: 3,
        craftingTime: 60,
        difficulty: 'medium',
        quality: 'good',
        unlockLevel: 5
      };

      manager?.createRecipe(recipe);

      const insufficientInventory: Inventory = { 'iron_ingot': 2, 'wood': 1 };
      const startResult = manager?.startCrafting('expensive_sword', 'test_crafter', insufficientInventory);
      expect(startResult?.status).toBe('error');
      expect(startResult?.issues).toContain('Insufficient iron_ingot: need 10, have 2');
    });

    test('should cancel crafting sessions', () => {
      const recipe: Recipe = {
        id: 'cancellable_sword',
        name: 'Cancellable Sword',
        description: 'A sword that can be cancelled',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'cancellable_sword': 1 },
        statMods: [{ key: 'damage', base: 15 }],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      manager?.createRecipe(recipe);

      const inventory: Inventory = { 'iron_ingot': 5, 'wood': 3 };
      const startResult = manager?.startCrafting('cancellable_sword', 'test_crafter', inventory);
      expect(startResult?.status).toBe('ok');

      const cancelResult = manager?.cancelCrafting(startResult?.result?.id || 'test_session');
      expect(cancelResult?.status).toBe('ok');
      expect(cancelResult?.result?.status).toBe('cancelled');
    });
  });

  describe('Crafting Statistics', () => {
    test('should provide crafting statistics', () => {
      const recipes = [
        {
          id: 'stat_sword',
          name: 'Stat Sword',
          description: 'A sword for statistics',
          category: 'weapon' as any,
          inputs: { 'iron_ingot': 2, 'wood': 1 },
          outputs: { 'stat_sword': 1 },
          statMods: [{ key: 'damage', base: 15 }],
          skillRequired: 'smithing',
          skillLevel: 1,
          craftingTime: 30,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        },
        {
          id: 'stat_potion',
          name: 'Stat Potion',
          description: 'A potion for statistics',
          category: 'consumable' as any,
          inputs: { 'healing_herb': 2, 'water': 1 },
          outputs: { 'stat_potion': 1 },
          statMods: [{ key: 'healing', base: 30 }],
          skillRequired: 'alchemy',
          skillLevel: 1,
          craftingTime: 15,
          difficulty: 'easy' as any,
          quality: 'normal' as any,
          unlockLevel: 1
        }
      ];

      recipes?.forEach(recipe => manager?.createRecipe(recipe));

      const statsResult = manager?.getCraftingStats();
      expect(statsResult?.status).toBe('ok');
      expect(statsResult?.result?.totalRecipes).toBeGreaterThanOrEqual(2);
      expect(statsResult?.result?.recipesByCategory).toBeDefined();
      expect(statsResult?.result?.difficultyDistribution).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    test('should export crafting data in different formats', () => {
      const recipe: Recipe = {
        id: 'export_sword',
        name: 'Export Sword',
        description: 'A sword for export testing',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'export_sword': 1 },
        statMods: [{ key: 'damage', base: 25 }],
        skillRequired: 'smithing',
        skillLevel: 2,
        craftingTime: 45,
        difficulty: 'medium',
        quality: 'good',
        unlockLevel: 3
      };

      manager?.createRecipe(recipe);

      // JSON export
      const jsonResult = manager?.exportCrafting('json');
      expect(jsonResult?.status).toBe('ok');
      expect(jsonResult?.result?.total).toBeGreaterThanOrEqual(1);

      // Manifest export
      const manifestResult = manager?.exportCrafting('manifest');
      expect(manifestResult?.status).toBe('ok');
      expect(manifestResult?.result?.schema).toBe('miff?.crafting.export?.v1');

      // Summary export
      const summaryResult = manager?.exportCrafting('summary');
      expect(summaryResult?.status).toBe('ok');
      expect(summaryResult?.result?.summary).toBeDefined();

      // Sessions export
      const sessionsResult = manager?.exportCrafting('sessions');
      expect(sessionsResult?.status).toBe('ok');
      expect(sessionsResult?.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid recipe operations', () => {
      const getResult = manager?.getRecipe('nonexistent');
      expect(getResult?.status).toBe('error');
      expect(getResult?.issues).toContain('Recipe nonexistent not found');

      const updateResult = manager?.updateRecipe('nonexistent', { name: 'Updated' });
      expect(updateResult?.status).toBe('error');
      expect(updateResult?.issues).toContain('Recipe nonexistent not found');
    });

    test('should handle invalid crafting operations', () => {
      const startResult = manager?.startCrafting('nonexistent', 'crafter', {});
      expect(startResult?.status).toBe('error');
      expect(startResult?.issues).toContain('Recipe nonexistent not found');

      const completeResult = manager?.completeCrafting('nonexistent_session', {});
      expect(completeResult?.status).toBe('error');
      expect(completeResult?.issues).toContain('Crafting session nonexistent_session not found');
    });

    test('should handle duplicate recipe creation', () => {
      const recipe: Recipe = {
        id: 'duplicate_sword',
        name: 'Duplicate Sword',
        description: 'A sword that will be duplicated',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'duplicate_sword': 1 },
        statMods: [{ key: 'damage', base: 15 }],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      };

      manager?.createRecipe(recipe);
      const duplicateResult = manager?.createRecipe(recipe);
      expect(duplicateResult?.status).toBe('error');
      expect(duplicateResult?.issues).toContain('Recipe duplicate_sword already exists');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete crafting workflow', () => {
      // Create recipe
      const recipe: Recipe = {
        id: 'workflow_sword',
        name: 'Workflow Sword',
        description: 'A sword for testing complete workflow',
        category: 'weapon',
        inputs: { 'iron_ingot': 3, 'wood': 2 },
        outputs: { 'workflow_sword': 1 },
        statMods: [
          { key: 'damage', base: 30 },
          { key: 'durability', base: 120 }
        ],
        skillRequired: 'smithing',
        skillLevel: 2,
        craftingTime: 45,
        difficulty: 'medium',
        quality: 'good',
        unlockLevel: 3
      };

      const createResult = manager?.createRecipe(recipe);
      expect(createResult?.status).toBe('ok');

      // Start crafting
      const inventory: Inventory = { 'iron_ingot': 10, 'wood': 5 };
      const startResult = manager?.startCrafting('workflow_sword', 'workflow_crafter', inventory);
      expect(startResult?.status).toBe('ok');

      // Complete crafting
      const completeResult = manager?.completeCrafting(startResult?.result?.id || 'workflow_session', inventory);
      expect(completeResult?.status).toBe('ok');

      // Get statistics
      const statsResult = manager?.getCraftingStats();
      expect(statsResult?.status).toBe('ok');

      // Export data
      const exportResult = manager?.exportCrafting('manifest');
      expect(exportResult?.status).toBe('ok');

      // List recipes
      const listResult = manager?.listRecipes();
      expect(listResult?.status).toBe('ok');
      expect(listResult?.result?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
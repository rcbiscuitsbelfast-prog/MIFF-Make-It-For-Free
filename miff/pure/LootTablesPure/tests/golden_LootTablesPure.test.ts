/**
 * Golden Tests for LootTablesPure
 * 
 * Tests loot table management, weighted rolling, statistics,
 * and export functionality with comprehensive scenarios.
 * 
 * @module LootTablesPure/tests/golden_LootTablesPure?.test
 * @version 1.0.0
 * @license MIT
 */

import { LootTablesManager, LootTable, LootEntry } from '../Manager';

describe('LootTablesPure Golden Tests', () => {
  let manager: LootTablesManager;

  beforeEach(() => {
    manager = new LootTablesManager();
  });

  describe('Loot Table Management', () => {
    test('should create and manage loot tables', () => {
      const table: LootTable = {
        id: 'test_table',
        name: 'Test Loot Table',
        entries: [
          {
            id: 'test_item',
            weight: 50,
            rarity: 'common',
            statRolls: [{ key: 'value', min: 1, max: 10 }]
          }
        ],
        maxRolls: 2,
        metadata: { description: 'A test loot table' }
      };

      const createResult = manager?.createTable(table);
      expect(createResult?.status).toBe('ok');
      expect(createResult?.result?.id).toBe('test_table');

      const getResult = manager?.getTable('test_table');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.name).toBe('Test Loot Table');
    });

    test('should handle table updates', () => {
      const updateResult = manager?.updateTable('basic_enemy_drops', { 
        name: 'Updated Basic Drops',
        maxRolls: 5
      });
      expect(updateResult?.status).toBe('ok');
      expect(updateResult?.result?.name).toBe('Updated Basic Drops');
      expect(updateResult?.result?.maxRolls).toBe(5);
    });

    test('should handle table deletion', () => {
      const deleteResult = manager?.deleteTable('basic_enemy_drops');
      expect(deleteResult?.status).toBe('ok');

      const getResult = manager?.getTable('basic_enemy_drops');
      expect(getResult?.status).toBe('error');
    });
  });

  describe('Loot Rolling', () => {
    test('should roll loot from tables', () => {
      const rollResult = manager?.rollLoot('basic_enemy_drops', 2);
      expect(rollResult?.status).toBe('ok');
      expect(rollResult?.result?.drops).toBeDefined();
      expect(rollResult?.result?.drops?.length).toBeGreaterThan(0);
      expect(rollResult?.result?.totalValue).toBeGreaterThan(0);
    });

    test('should handle guaranteed drops', () => {
      const rollResult = manager?.rollLoot('boss_drops', 1);
      expect(rollResult?.status).toBe('ok');
      expect(rollResult?.result?.drops).toBeDefined();
      // Boss drops should include guaranteed boss_essence
      const hasBossEssence = rollResult?.result?.drops?.some(drop => drop?.id === 'boss_essence');
      expect(hasBossEssence).toBe(true);
    });

    test('should respect max rolls', () => {
      const rollResult = manager?.rollLoot('basic_enemy_drops', 10); // More than maxRolls
      expect(rollResult?.status).toBe('ok');
      expect(rollResult?.result?.drops?.length).toBeLessThanOrEqual(3); // maxRolls is 3
    });

    test('should use seeds for deterministic results', () => {
      const roll1 = manager?.rollLoot('basic_enemy_drops', 1, 12345);
      const roll2 = manager?.rollLoot('basic_enemy_drops', 1, 12345);
      
      expect(roll1?.status).toBe('ok');
      expect(roll2?.status).toBe('ok');
      expect(roll1?.result?.drops[0!]?.id).toBe(roll2?.result?.drops[0!]?.id);
    });
  });

  describe('Loot Table Filtering', () => {
    test('should filter tables by rarity', () => {
      const listResult = manager?.listTables({ rarity: 'rare' });
      expect(listResult?.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });

    test('should filter tables by weight range', () => {
      const listResult = manager?.listTables({ minWeight: 10, maxWeight: 50 });
      expect(listResult?.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });

    test('should filter tables by conditions', () => {
      const listResult = manager?.listTables({ hasConditions: false });
      expect(listResult?.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });
  });

  describe('Loot Statistics', () => {
    test('should provide loot statistics', () => {
      const statsResult = manager?.getLootStats();
      expect(statsResult?.status).toBe('ok');
      expect(statsResult?.result?.totalTables).toBeGreaterThan(0);
      expect(statsResult?.result?.totalEntries).toBeGreaterThan(0);
      expect(statsResult?.result?.averageWeight).toBeGreaterThan(0);
      expect(statsResult?.result?.rarityDistribution).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    test('should export tables in different formats', () => {
      // JSON export
      const jsonResult = manager?.exportTables('json');
      expect(jsonResult?.status).toBe('ok');
      expect(jsonResult?.result?.total).toBeGreaterThan(0);

      // Manifest export
      const manifestResult = manager?.exportTables('manifest');
      expect(manifestResult?.status).toBe('ok');
      expect(manifestResult?.result?.schema).toBe('miff?.loot.export?.v1');

      // Summary export
      const summaryResult = manager?.exportTables('summary');
      expect(summaryResult?.status).toBe('ok');
      expect(summaryResult?.result?.summary).toBeDefined();

      // Rolls export
      const rollsResult = manager?.exportTables('rolls');
      expect(rollsResult?.status).toBe('ok');
      expect(rollsResult?.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid table operations', () => {
      const getResult = manager?.getTable('nonexistent');
      expect(getResult?.status).toBe('error');
      expect(getResult?.issues).toContain('Loot table nonexistent not found');

      const rollResult = manager?.rollLoot('nonexistent', 1);
      expect(rollResult?.status).toBe('error');
      expect(rollResult?.issues).toContain('Loot table nonexistent not found');
    });

    test('should handle duplicate table creation', () => {
      const table: LootTable = {
        id: 'basic_enemy_drops',
        name: 'Duplicate Table',
        entries: [
          {
            id: 'test_item',
            weight: 50,
            rarity: 'common'
          }
        ]
      };

      const createResult = manager?.createTable(table);
      expect(createResult?.status).toBe('error');
      expect(createResult?.issues).toContain('Loot table basic_enemy_drops already exists');
    });

    test('should validate table structure', () => {
      const invalidTable: LootTable = {
        id: '',
        name: '',
        entries: []
      };

      const createResult = manager?.createTable(invalidTable);
      expect(createResult?.status).toBe('error');
      expect(createResult?.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete loot workflow', () => {
      // Create table
      const table: LootTable = {
        id: 'workflow_table',
        name: 'Workflow Test Table',
        entries: [
          {
            id: 'common_item',
            weight: 70,
            rarity: 'common',
            statRolls: [{ key: 'value', min: 1, max: 5 }]
          },
          {
            id: 'rare_item',
            weight: 20,
            rarity: 'rare',
            statRolls: [
              { key: 'power', min: 10, max: 20 },
              { key: 'durability', min: 50, max: 100 }
            ]
          },
          {
            id: 'epic_item',
            weight: 10,
            rarity: 'epic',
            statRolls: [
              { key: 'special_power', min: 50, max: 100 }
            ]
          }
        ],
        maxRolls: 3,
        guaranteedDrops: ['common_item'],
        metadata: { description: 'Workflow test table' }
      };

      const createResult = manager?.createTable(table);
      expect(createResult?.status).toBe('ok');

      // Roll loot
      const rollResult = manager?.rollLoot('workflow_table', 2);
      expect(rollResult?.status).toBe('ok');
      expect(rollResult?.result?.drops?.length).toBeGreaterThan(0);

      // Get stats
      const statsResult = manager?.getLootStats();
      expect(statsResult?.status).toBe('ok');

      // Export
      const exportResult = manager?.exportTables('manifest');
      expect(exportResult?.status).toBe('ok');

      // List tables
      const listResult = manager?.listTables();
      expect(listResult?.status).toBe('ok');
      expect(listResult?.result?.length).toBeGreaterThan(0);
    });
  });
});
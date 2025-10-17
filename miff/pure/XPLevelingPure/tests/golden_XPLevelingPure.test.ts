/**
 * Golden Tests for XPLevelingPure
 * 
 * Tests XP and leveling management, entity creation, skill progression,
 * and export functionality with comprehensive scenarios.
 * 
 * @module XPLevelingPure/tests/golden_XPLevelingPure?.test
 * @version 1.0.0
 * @license MIT
 */

import { XPLevelingManager, XPCurve } from '../Manager';

describe('XPLevelingPure Golden Tests', () => {
  let manager: XPLevelingManager;

  beforeEach(() => {
    manager = new XPLevelingManager();
  });

  describe('Entity Management', () => {
    test('should create and manage XP entities', () => {
      const createResult = manager?.createEntity('test_entity', 'standard', 1);
      expect(createResult?.status).toBe('ok');
      expect(createResult?.result?.id).toBe('test_entity');
      expect(createResult?.result?.level).toBe(1);
      expect(createResult?.result?.xp).toBe(0);

      const getResult = manager?.getLevel('test_entity');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.id).toBe('test_entity');
    });

    test('should handle duplicate entity creation', () => {
      manager?.createEntity('duplicate_test', 'standard', 1);
      const duplicateResult = manager?.createEntity('duplicate_test', 'standard', 1);
      expect(duplicateResult?.status).toBe('error');
      expect(duplicateResult?.issues).toContain('Entity duplicate_test already exists');
    });

    test('should handle invalid curve creation', () => {
      const invalidResult = manager?.createEntity('invalid_entity', 'nonexistent_curve', 1);
      expect(invalidResult?.status).toBe('error');
      expect(invalidResult?.issues).toContain('XP curve nonexistent_curve not found');
    });
  });

  describe('XP Management', () => {
    test('should add XP to entities', () => {
      manager?.createEntity('xp_entity', 'standard', 1);
      
      const addResult = manager?.addXP('xp_entity', 100);
      expect(addResult?.status).toBe('ok');
      expect(addResult?.result?.totalXp).toBe(100);
      expect(addResult?.result?.level).toBe(2); // Leveled up from 1 to 2
    });

    test('should check for level ups', () => {
      manager?.createEntity('level_entity', 'standard', 1);
      manager?.addXP('level_entity', 1000); // Should be enough for level up
      
      const checkResult = manager?.checkLevelUp('level_entity');
      expect(checkResult?.status).toBe('ok');
      expect(checkResult?.result?.canLevelUp).toBe(true);
    });

    test('should force level ups', () => {
      manager?.createEntity('force_entity', 'standard', 1);
      manager?.addXP('force_entity', 1000);
      
      const forceResult = manager?.forceLevelUp('force_entity');
      expect(forceResult?.status).toBe('ok');
      expect(forceResult?.result?.newLevel).toBeGreaterThan(1);
      expect(forceResult?.result?.statBoosts).toBeDefined();
    });
  });

  describe('Skill Management', () => {
    test('should set and get skill levels', () => {
      manager?.createEntity('skill_entity', 'standard', 1);
      
      const setResult = manager?.setSkillLevel('skill_entity', 'combat', 5);
      expect(setResult?.status).toBe('ok');
      expect(setResult?.result?.skills?.get('combat')).toBe(5);

      const getResult = manager?.getSkillLevel('skill_entity', 'combat');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.level).toBe(5);
    });

    test('should handle skill level updates', () => {
      manager?.createEntity('skill_update_entity', 'standard', 1);
      manager?.setSkillLevel('skill_update_entity', 'magic', 3);
      
      const updateResult = manager?.setSkillLevel('skill_update_entity', 'magic', 7);
      expect(updateResult?.status).toBe('ok');
      expect(updateResult?.result?.skills?.get('magic')).toBe(7);
    });
  });

  describe('Stat Management', () => {
    test('should set and get stat values', () => {
      manager?.createEntity('stat_entity', 'standard', 1);
      
      const setResult = manager?.setStat('stat_entity', 'strength', 15);
      expect(setResult?.status).toBe('ok');
      expect(setResult?.result?.stats?.get('strength')).toBe(15);

      const getResult = manager?.getStat('stat_entity', 'strength');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.value).toBe(15);
    });

    test('should handle stat value updates', () => {
      manager?.createEntity('stat_update_entity', 'standard', 1);
      manager?.setStat('stat_update_entity', 'intelligence', 10);
      
      const updateResult = manager?.setStat('stat_update_entity', 'intelligence', 20);
      expect(updateResult?.status).toBe('ok');
      expect(updateResult?.result?.stats?.get('intelligence')).toBe(20);
    });
  });

  describe('Entity Filtering and Queries', () => {
    test('should filter entities by level range', () => {
      const entities = [
        { id: 'low_level', curveId: 'standard', initialLevel: 1 },
        { id: 'mid_level', curveId: 'standard', initialLevel: 5 },
        { id: 'high_level', curveId: 'standard', initialLevel: 10 }
      ];

      entities?.forEach(entity => {
        manager?.createEntity(entity?.id, entity?.curveId, entity?.initialLevel);
      });

      const filterResult = manager?.listEntities({ minLevel: 3, maxLevel: 8 });
      expect(filterResult?.status).toBe('ok');
      expect(filterResult?.result?.length).toBe(1);
      expect(filterResult?.result?.[0!].id).toBe('mid_level');
    });

    test('should filter entities by skill level', () => {
      const entities = [
        { id: 'low_skill', curveId: 'standard', initialLevel: 1 },
        { id: 'high_skill', curveId: 'standard', initialLevel: 1 }
      ];

      entities?.forEach(entity => {
        manager?.createEntity(entity?.id, entity?.curveId, entity?.initialLevel);
      });

      manager?.setSkillLevel('high_skill', 'combat', 10);
      manager?.setSkillLevel('low_skill', 'combat', 2);

      const filterResult = manager?.listEntities({ hasSkill: 'combat', minSkillLevel: 5 });
      expect(filterResult?.status).toBe('ok');
      expect(filterResult?.result?.length).toBe(1);
      expect(filterResult?.result?.[0!].id).toBe('high_skill');
    });

    test('should filter entities by XP range', () => {
      const entities = [
        { id: 'low_xp', curveId: 'standard', initialLevel: 1 },
        { id: 'high_xp', curveId: 'standard', initialLevel: 1 }
      ];

      entities?.forEach(entity => {
        manager?.createEntity(entity?.id, entity?.curveId, entity?.initialLevel);
      });

      manager?.addXP('high_xp', 1000);
      manager?.addXP('low_xp', 100);

      const filterResult = manager?.listEntities({ minXp: 500 });
      expect(filterResult?.status).toBe('ok');
      expect(filterResult?.result?.length).toBe(1);
      expect(filterResult?.result?.[0!].id).toBe('high_xp');
    });
  });

  describe('XP Statistics', () => {
    test('should provide XP statistics', () => {
      const entities = [
        { id: 'stat_entity_1', curveId: 'standard', initialLevel: 1 },
        { id: 'stat_entity_2', curveId: 'fast', initialLevel: 5 },
        { id: 'stat_entity_3', curveId: 'slow', initialLevel: 1 }
      ];

      entities?.forEach(entity => {
        manager?.createEntity(entity?.id, entity?.curveId, entity?.initialLevel);
      });

      // Add XP to some entities
      manager?.addXP('stat_entity_1', 500);
      manager?.addXP('stat_entity_2', 200);
      manager?.addXP('stat_entity_3', 1000);

      // Set some skills
      manager?.setSkillLevel('stat_entity_1', 'combat', 3);
      manager?.setSkillLevel('stat_entity_2', 'magic', 5);
      manager?.setSkillLevel('stat_entity_3', 'stealth', 2);

      const statsResult = manager?.getXPStats();
      expect(statsResult?.status).toBe('ok');
      expect(statsResult?.result?.totalEntities).toBe(3);
      expect(statsResult?.result?.averageLevel).toBeGreaterThan(0);
      expect(statsResult?.result?.totalXp).toBeGreaterThan(0);
      expect(statsResult?.result?.levelDistribution).toBeDefined();
      expect(statsResult?.result?.skillDistribution).toBeDefined();
    });
  });

  describe('XP Curve Management', () => {
    test('should create custom XP curves', () => {
      const customCurve: XPCurve = {
        id: 'custom_curve',
        name: 'Custom Curve',
        description: 'A custom XP curve for testing',
        maxLevel: 50,
        baseXp: 50,
        growthRate: 1.05,
        levels: [], // Will be generated
        metadata: { type: 'custom' }
      };

      const createResult = manager?.createCurve(customCurve);
      expect(createResult?.status).toBe('ok');
      expect(createResult?.result?.id).toBe('custom_curve');

      const getResult = manager?.getCurve('custom_curve');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.name).toBe('Custom Curve');
    });

    test('should handle duplicate curve creation', () => {
      const curve: XPCurve = {
        id: 'duplicate_curve',
        name: 'Duplicate Curve',
        description: 'A curve that will be duplicated',
        maxLevel: 30,
        baseXp: 30,
        growthRate: 1.1,
        levels: [],
        metadata: { type: 'duplicate' }
      };

      manager?.createCurve(curve);
      const duplicateResult = manager?.createCurve(curve);
      expect(duplicateResult?.status).toBe('error');
      expect(duplicateResult?.issues).toContain('XP curve duplicate_curve already exists');
    });
  });

  describe('Export Functionality', () => {
    test('should export XP data in different formats', () => {
      manager?.createEntity('export_entity', 'standard', 1);
      manager?.addXP('export_entity', 500);
      manager?.setSkillLevel('export_entity', 'combat', 3);
      manager?.setStat('export_entity', 'strength', 15);

      // JSON export
      const jsonResult = manager?.exportXP('json');
      expect(jsonResult?.status).toBe('ok');
      expect(jsonResult?.result?.total).toBeGreaterThanOrEqual(1);

      // Manifest export
      const manifestResult = manager?.exportXP('manifest');
      expect(manifestResult?.status).toBe('ok');
      expect(manifestResult?.result?.schema).toBe('miff?.xp.export?.v1');

      // Summary export
      const summaryResult = manager?.exportXP('summary');
      expect(summaryResult?.status).toBe('ok');
      expect(summaryResult?.result?.summary).toBeDefined();

      // History export
      const historyResult = manager?.exportXP('history');
      expect(historyResult?.status).toBe('ok');
      expect(historyResult?.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid entity operations', () => {
      const getResult = manager?.getLevel('nonexistent');
      expect(getResult?.status).toBe('error');
      expect(getResult?.issues).toContain('Entity nonexistent not found');

      const addResult = manager?.addXP('nonexistent', 100);
      expect(addResult?.status).toBe('error');
      expect(addResult?.issues).toContain('Entity nonexistent not found');
    });

    test('should handle invalid skill operations', () => {
      manager?.createEntity('skill_test', 'standard', 1);

      const getResult = manager?.getSkillLevel('skill_test', 'nonexistent_skill');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.level).toBe(0); // Default value for non-existent skill
    });

    test('should handle invalid stat operations', () => {
      manager?.createEntity('stat_test', 'standard', 1);

      const getResult = manager?.getStat('stat_test', 'nonexistent_stat');
      expect(getResult?.status).toBe('ok');
      expect(getResult?.result?.value).toBe(0); // Default value for non-existent stat
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete XP workflow', () => {
      // Create entity
      const createResult = manager?.createEntity('workflow_entity', 'standard', 1);
      expect(createResult?.status).toBe('ok');

      // Add XP and check for level up
      manager?.addXP('workflow_entity', 1000);
      const checkResult = manager?.checkLevelUp('workflow_entity');
      expect(checkResult?.status).toBe('ok');

      // Force level up if possible
      const forceResult = manager?.forceLevelUp('workflow_entity');
      if (forceResult?.status === 'ok') {
        expect(forceResult?.result?.newLevel).toBeGreaterThan(1);
      }

      // Set skills and stats
      manager?.setSkillLevel('workflow_entity', 'combat', 5);
      manager?.setSkillLevel('workflow_entity', 'magic', 3);
      manager?.setStat('workflow_entity', 'strength', 20);
      manager?.setStat('workflow_entity', 'intelligence', 15);

      // Get statistics
      const statsResult = manager?.getXPStats();
      expect(statsResult?.status).toBe('ok');

      // Export data
      const exportResult = manager?.exportXP('manifest');
      expect(exportResult?.status).toBe('ok');

      // List entities
      const listResult = manager?.listEntities();
      expect(listResult?.status).toBe('ok');
      expect(listResult?.result?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
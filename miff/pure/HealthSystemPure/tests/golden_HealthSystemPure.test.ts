/**
 * Golden Tests for HealthSystemPure
 * 
 * Tests health management, damage/healing, shields, regeneration,
 * and export functionality with comprehensive scenarios.
 * 
 * @module HealthSystemPure/tests/golden_HealthSystemPure.test
 * @version 1.0.0
 * @license MIT
 */

import { HealthSystemManager, Shield, RegenerationEffect } from '../Manager';

describe('HealthSystemPure Golden Tests', () => {
  let manager: HealthSystemManager;

  beforeEach(() => {
    manager = new HealthSystemManager();
  });

  describe('Entity Management', () => {
    test('should create and manage health entities', () => {
      const createResult = manager.createEntity('test_entity', 100, {
        currentHp: 80,
        immunities: ['poison'],
        resistances: { fire: 50 }
      });
      expect(createResult.status).toBe('ok');
      expect(createResult.result?.id).toBe('test_entity');
      expect(createResult.result?.maxHp).toBe(100);
      expect(createResult.result?.currentHp).toBe(80);

      const getResult = manager.getEntity('test_entity');
      expect(getResult.status).toBe('ok');
      expect(getResult.result?.immunities).toContain('poison');
      expect(getResult.result?.resistances.fire).toBe(50);
    });

    test('should handle duplicate entity creation', () => {
      manager.createEntity('duplicate_test', 100);
      const duplicateResult = manager.createEntity('duplicate_test', 100);
      expect(duplicateResult.status).toBe('error');
      expect(duplicateResult.issues).toContain('Entity duplicate_test already exists');
    });
  });

  describe('Damage and Healing', () => {
    test('should apply damage to entities', () => {
      manager.createEntity('damage_entity', 100);
      
      const damageResult = manager.applyDamage('damage_entity', 30, {
        damageType: 'physical',
        source: 'sword'
      });
      expect(damageResult.status).toBe('ok');
      expect(damageResult.result?.currentHp).toBe(70);
    });

    test('should apply healing to entities', () => {
      manager.createEntity('heal_entity', 100, { currentHp: 50 });
      
      const healResult = manager.applyHealing('heal_entity', 30, {
        source: 'potion'
      });
      expect(healResult.status).toBe('ok');
      expect(healResult.result?.currentHp).toBe(80);
    });

    test('should handle immunities', () => {
      manager.createEntity('immune_entity', 100, {
        immunities: ['poison']
      });
      
      const damageResult = manager.applyDamage('immune_entity', 50, {
        damageType: 'poison',
        source: 'poison_cloud'
      });
      expect(damageResult.status).toBe('ok');
      expect(damageResult.result?.currentHp).toBe(100); // Should not take damage
    });

    test('should handle resistances', () => {
      manager.createEntity('resistant_entity', 100, {
        resistances: { fire: 50 }
      });
      
      const damageResult = manager.applyDamage('resistant_entity', 40, {
        damageType: 'fire',
        source: 'fireball'
      });
      expect(damageResult.status).toBe('ok');
      expect(damageResult.result?.currentHp).toBe(80); // Should take 50% damage
    });
  });

  describe('Shields', () => {
    test('should add and manage shields', () => {
      manager.createEntity('shield_entity', 100);
      
      const shield: Shield = {
        id: 'test_shield',
        type: 'physical',
        amount: 25,
        maxAmount: 25,
        absorption: 100,
        duration: 30
      };
      
      const addResult = manager.addShield('shield_entity', shield);
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.shields).toHaveLength(1);
      expect(addResult.result?.shields[0].amount).toBe(25);
    });

    test('should absorb damage with shields', () => {
      manager.createEntity('shield_absorb_entity', 100);
      
      const shield: Shield = {
        id: 'absorb_shield',
        type: 'physical',
        amount: 20,
        maxAmount: 20,
        absorption: 100,
        duration: -1
      };
      
      manager.addShield('shield_absorb_entity', shield);
      
      const damageResult = manager.applyDamage('shield_absorb_entity', 15, {
        damageType: 'physical'
      });
      expect(damageResult.status).toBe('ok');
      expect(damageResult.result?.currentHp).toBe(100); // Shield should absorb all damage
      expect(damageResult.result?.shields[0].amount).toBe(5); // Shield should be reduced
    });
  });

  describe('Regeneration', () => {
    test('should add regeneration effects', () => {
      manager.createEntity('regen_entity', 100, { currentHp: 50 });
      
      const regeneration: RegenerationEffect = {
        id: 'test_regen',
        type: 'hp',
        amount: 5,
        duration: 10,
        interval: 1,
        lastTick: new Date(),
        expiresAt: new Date() + 10000
      };
      
      const addResult = manager.addRegeneration('regen_entity', regeneration);
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.regeneration).toHaveLength(1);
    });
  });

  describe('Health Statistics', () => {
    test('should provide health statistics', () => {
      const entities = [
        { id: 'stats_entity_1', maxHp: 100, currentHp: 80 },
        { id: 'stats_entity_2', maxHp: 150, currentHp: 120 },
        { id: 'stats_entity_3', maxHp: 80, currentHp: 0 } // Dead
      ];

      entities.forEach(entity => 
        manager.createEntity(id: entity.id, maxHp: entity.maxHp,  currentHp: currentHp: entity.currentHp});
      });

      // Apply some damage and healing
      manager.applyDamage('stats_entity_1', 20, { source: 'damage' });
      manager.applyHealing('stats_entity_2', 30, { source: 'healing' });

      const statsResult = manager.getHealthStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalEntities).toBe(3);
      expect(statsResult.result?.aliveEntities).toBe(2);
      expect(statsResult.result?.deadEntities).toBe(1);
    });
  });

  describe('Export Functionality', () => {
    test('should export health data in different formats', () => {
      manager.createEntity('export_entity', 100, { currentHp: 75 });
      manager.applyDamage('export_entity', 25, { source: 'test' });

      // JSON export
      const jsonResult = manager.exportHealth('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.total).toBeGreaterThanOrEqual(1);

      // Manifest export
      const manifestResult = manager.exportHealth('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.health.export.v1');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid entity operations', () => {
      const getResult = manager.getEntity('nonexistent');
      expect(getResult.status).toBe('error');
      expect(getResult.issues).toContain('Entity nonexistent not found');

      const damageResult = manager.applyDamage('nonexistent', 10);
      expect(damageResult.status).toBe('error');
      expect(damageResult.issues).toContain('Entity nonexistent not found');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete health workflow', () => {
      // Create entities with different health states
      const entities = [
        {
          id: 'warrior',
          maxHp: 150,
          currentHp: 120,
          immunities: ['poison'],
          resistances: { fire: 50 }
        },
        {
          id: 'mage',
          maxHp: 80,
          currentHp: 60,
          immunities: ['magical'],
          resistances: { ice: 75 }
        }
      ];

      entities.forEach(entity => 
        manager.createEntity(id: entity.id, maxHp: entity.maxHp, 
          currentHp: currentHp: entity.currentHp,
          immunities: entity.immunities,
          resistances: entity.resistances
        });
      });

      // Apply damage with different types
      manager.applyDamage('warrior', 30, { damageType: 'magical', source: 'spell' });
      manager.applyDamage('mage', 20, { damageType: 'physical', source: 'sword' });

      // Apply healing
      manager.applyHealing('mage', 15, { source: 'potion' });

      // Get statistics
      const statsResult = manager.getHealthStats();
      expect(statsResult.status).toBe('ok');

      // Export data
      const exportResult = manager.exportHealth('manifest');
      expect(exportResult.status).toBe('ok');

      // List entities
      const listResult = manager.listEntities();
      expect(listResult.status).toBe('ok');
      expect(listResult.result?.length).toBe(2);

      // Reset
      const resetResult = manager.resetHealth();
      expect(resetResult.status).toBe('ok');
    });
  });
});
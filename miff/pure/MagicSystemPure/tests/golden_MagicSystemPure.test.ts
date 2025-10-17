/**
 * MIFF MagicSystemPure Golden Tests
 *
 * Comprehensive test suite for the MagicSystemPure module
 * Tests spell casting, mana management, elemental interactions, and integration
 */

import { MagicSystemPure, SpellDefinition, ManaPool } from '../index';
import { EventBus } from '../../EventsPure/index';
import { HealthSystemPure } from '../../HealthSystemPure/index';
import { CombatPure } from '../../CombatPure/index';
import { RNGPure } from '../../RNGPure/index';

// Mock classes for testing
class MockEventBus {
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    const handlers = this?.events.get(event) || [];
    handlers?.forEach(handler => handler(data: any));
  }

  on(event: string, handler: Function) {
    if (!this?.events.has(event)) {
      this?.events.set(event, []);
    }
    this?.events.get(event)!.push(handler);
  }
}

class MockHealthSystem {
  private entities: Map<string, { hp: number; maxHp: number }> = new Map();

  createEntity(entityId: string, options: { maxHp: number; currentHp?: number }) {
    this?.entities.set(entityId, {
      hp: options?.currentHp || options?.maxHp,
      maxHp: options?.maxHp
    });
  }

  damageEntity(entityId: string, damage: number) {
    const entity = this?.entities.get(entityId);
    if (entity) {
      entity.hp = Math.max(0, entity.hp - damage);
    }
  }

  healEntity(entityId: string, healing: number) {
    const entity = this?.entities.get(entityId);
    if (entity) {
      entity.hp = Math.min(entity.maxHp, entity.hp + healing);
    }
  }

  getEntity(entityId: string) {
    return this?.entities.get(entityId);
  }
}

class MockCombatSystem {
  // Mock implementation
}

class MockRNG {
  private values: number[] = [];
  private index = 0;

  setNextFloat(value: number) {
    this?.values?.push(value: any);
  }

  nextFloat(): number {
    if (this?.values.length > 0) {
      return this?.values[this?.index++] || 0.5;
    }
    return Math.random();
  }
}

describe('MagicSystemPure Golden Tests', () => {
  let magicSystem: MagicSystemPure;
  let eventBus: MockEventBus;
  let healthSystem: MockHealthSystem;
  let combatSystem: MockCombatSystem;
  let rng: MockRNG;

  const TEST_CASTER = 'test-mage';
  const TEST_TARGET = 'test-target';

  beforeEach(() => {
    eventBus = new MockEventBus();
    healthSystem = new MockHealthSystem();
    combatSystem = new MockCombatSystem();
    rng = new MockRNG();

    magicSystem = new MagicSystemPure(eventBus as any, healthSystem as any, combatSystem as any, rng as any);

    // Create test entities
    magicSystem?.createManaPool(TEST_CASTER, 100);
    healthSystem?.createEntity(TEST_TARGET, { maxHp: 100, currentHp: 80 });

    // Reset RNG mock
    rng = new MockRNG();
    (magicSystem as any).rng = rng;
  });

  describe('Core Magic System', () => {
    test('should initialize with basic elements and spell schools', () => {
      const elements = magicSystem?.getAllElements();
      const schools = magicSystem?.getAllSpellSchools();

      expect(elements?.length).toBeGreaterThan(0);
      expect(schools?.length).toBeGreaterThan(0);

      // Check for core elements
      const fireElement = magicSystem?.getElement('fire');
      expect(fireElement).toBeDefined();
      expect(fireElement?.name).toBe('fire');
      expect(fireElement?.strengths).toContain('nature');
      expect(fireElement?.weaknesses).toContain('water');
    });

    test('should create and manage mana pools', () => {
      const manaPool = magicSystem?.getManaPool(TEST_CASTER);
      expect(manaPool).toBeDefined();
      expect(manaPool?.current).toBe(100);
      expect(manaPool?.maximum).toBe(100);
      expect(manaPool?.regenerationRate).toBe(5);
    });

    test('should regenerate mana over time', () => {
      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      manaPool?.current = 50; // Set to half

      // Simulate time passing
      const now = new Date();
      manaPool?.lastRegeneration = now - 2000; // 2 seconds ago

      magicSystem?.updateManaPool(TEST_CASTER);

      expect(manaPool?.current).toBeGreaterThan(50); // Should have regenerated
    });
  });

  describe('Spell System', () => {
    test('should return spell definitions', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      expect(spells?.length).toBeGreaterThan(0);

      const firstSpell = spells[0!];
      expect(firstSpell?.id).toBeDefined();
      expect(firstSpell?.name).toBeDefined();
      expect(firstSpell?.manaCost).toBeGreaterThan(0);
    });

    test('should get spells by school', () => {
      const fireSpells = magicSystem?.getSpellsBySchool('fire');
      const arcaneSpells = magicSystem?.getSpellsBySchool('arcane');

      expect(Array.isArray(fireSpells)).toBe(true);
      expect(Array.isArray(arcaneSpells)).toBe(true);
    });

    test('should unlock spells for casters', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length > 0) {
        const spellId = spells[0!].id;

        const success = magicSystem?.unlockSpell(TEST_CASTER, spellId);
        expect(success).toBe(true);

        const casterSpells = magicSystem?.getSpellsForCaster(TEST_CASTER);
        expect(casterSpells?.length).toBe(1);
        expect(casterSpells[0!].definition?.id).toBe(spellId);
      }
    });

    test('should not cast spells without learning them first', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length > 0) {
        const spellId = spells[0!].id;

        const result = magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);
        expect(result?.success).toBe(false);
        expect(result?.failureReason).toContain('not unlocked');
      }
    });
  });

  describe('Spell Casting', () => {
    test('should successfully cast learned spells', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) {
        console.warn('No spells available for testing');
        return;
      }

      const spellId = spells[0!].id;
      magicSystem?.unlockSpell(TEST_CASTER, spellId);

      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      const initialMana = manaPool?.current;

      const result = magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);

      expect(result?.success).toBe(true);
      expect(manaPool?.current).toBeLessThan(initialMana); // Mana should be consumed
      expect(result?.manaSpent).toBeGreaterThan(0);
    });

    test('should fail casting with insufficient mana', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      const spellId = spells[0!].id;
      magicSystem?.unlockSpell(TEST_CASTER, spellId);

      // Set mana to 0
      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      manaPool?.current = 0;

      const result = magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);

      expect(result?.success).toBe(false);
      expect(result?.failureReason).toContain('Insufficient mana');
    });

    test('should handle spell cooldowns', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      const spellId = spells[0!].id;
      magicSystem?.unlockSpell(TEST_CASTER, spellId);

      // Cast spell
      const result1 = magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);
      expect(result1?.success).toBe(true);

      // Try to cast immediately again (should fail due to cooldown)
      const result2 = magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);
      expect(result2?.success).toBe(false);
      expect(result2?.failureReason).toContain('cooldown');
    });

    test('should apply damage effects to targets', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      const damageSpell = spells?.find(s => s?.effects.some(e => e?.type === 'damage'));

      if (!damageSpell) {
        console.warn('No damage spells available for testing');
        return;
      }

      magicSystem?.unlockSpell(TEST_CASTER, damageSpell?.id);
      const initialHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;

      const result = magicSystem?.castSpell(TEST_CASTER, damageSpell?.id, [TEST_TARGET!]);

      if (result?.success) {
        const finalHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;
        expect(finalHealth).toBeLessThan(initialHealth);
        expect(result?.damageDealt).toBeGreaterThan(0);
      }
    });

    test('should apply healing effects to targets', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      const healSpell = spells?.find(s => s?.effects.some(e => e?.type === 'heal'));

      if (!healSpell) {
        console.warn('No healing spells available for testing');
        return;
      }

      // First damage the target
      healthSystem?.damageEntity(TEST_TARGET, 30);
      const damagedHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;

      magicSystem?.unlockSpell(TEST_CASTER, healSpell?.id);
      const result = magicSystem?.castSpell(TEST_CASTER, healSpell?.id, [TEST_TARGET!]);

      if (result?.success) {
        const healedHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;
        expect(healedHealth).toBeGreaterThan(damagedHealth);
        expect(result?.healingDone).toBeGreaterThan(0);
      }
    });
  });

  describe('Elemental System', () => {
    test('should provide elemental information', () => {
      const fireElement = magicSystem?.getElement('fire');
      expect(fireElement).toBeDefined();
      expect(fireElement?.color).toBe('#FF4500');
      expect(fireElement?.strengths).toContain('nature');
      expect(fireElement?.weaknesses).toContain('water');
    });

    test('should handle elemental interactions', () => {
      const fireElement = magicSystem?.getElement('fire')!;
      const waterElement = magicSystem?.getElement('water')!;

      // Fire should be strong against nature
      expect(fireElement?.strengths).toContain('nature');

      // Water should be strong against fire
      expect(waterElement?.strengths).toContain('fire');
    });

    test('should allow setting elemental affinities', () => {
      magicSystem?.setElementalAffinity(TEST_CASTER, 'fire', 1.5);

      const affinity = magicSystem?.getElementalAffinity(TEST_CASTER, 'fire');
      expect(affinity).toBe(1.5);
    });

    test('should clamp elemental affinities to reasonable ranges', () => {
      magicSystem?.setElementalAffinity(TEST_CASTER, 'fire', 0.05); // Too low
      magicSystem?.setElementalAffinity(TEST_CASTER, 'water', 3.0); // Too high

      const fireAffinity = magicSystem?.getElementalAffinity(TEST_CASTER, 'fire');
      const waterAffinity = magicSystem?.getElementalAffinity(TEST_CASTER, 'water');

      expect(fireAffinity).toBeGreaterThanOrEqual(0.1);
      expect(waterAffinity).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Spell Schools', () => {
    test('should provide spell school information', () => {
      const fireSchool = magicSystem?.getSpellSchool('fire');
      expect(fireSchool).toBeDefined();
      expect(fireSchool?.name).toBe('fire');
      expect(fireSchool?.icon).toBe('🔥');
      expect(fireSchool?.baseSpells).toBeDefined();
    });

    test('should allow setting spell school modifiers', () => {
      magicSystem?.setSpellSchoolModifier(TEST_CASTER, 'fire', 1.2);

      const modifier = magicSystem?.getSpellSchoolModifier(TEST_CASTER, 'fire');
      expect(modifier).toBe(1.2);
    });
  });

  describe('Mana Management', () => {
    test('should handle mana pool limits', () => {
      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      manaPool?.current = manaPool?.maximum + 10; // Try to overfill

      magicSystem?.updateManaPool(TEST_CASTER);
      expect(manaPool?.current).toBeLessThanOrEqual(manaPool?.maximum);
    });

    test('should prevent negative mana', () => {
      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      manaPool?.current = -10; // Set to negative

      magicSystem?.updateManaPool(TEST_CASTER);
      expect(manaPool?.current).toBeGreaterThanOrEqual(0);
    });

    test('should allow setting mana regeneration rate', () => {
      const manaPool = magicSystem?.getManaPool(TEST_CASTER)!;
      manaPool?.regenerationRate = 0; // Disable regeneration

      magicSystem?.updateManaPool(TEST_CASTER);
      expect(manaPool?.current).toBe(manaPool?.maximum); // Should not change
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with HealthSystemPure for damage and healing', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      // Find damage and healing spells
      const damageSpell = spells?.find(s => s?.effects.some(e => e?.type === 'damage'));
      const healSpell = spells?.find(s => s?.effects.some(e => e?.type === 'heal'));

      if (!damageSpell || !healSpell) {
        console.warn('Damage or healing spells not available');
        return;
      }

      // Learn spells
      magicSystem?.unlockSpell(TEST_CASTER, damageSpell?.id);
      magicSystem?.unlockSpell(TEST_CASTER, healSpell?.id);

      // Damage target
      const initialHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;
      magicSystem?.castSpell(TEST_CASTER, damageSpell?.id, [TEST_TARGET!]);

      const damagedHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;
      expect(damagedHealth).toBeLessThan(initialHealth);

      // Heal target
      magicSystem?.castSpell(TEST_CASTER, healSpell?.id, [TEST_TARGET!]);
      const healedHealth = healthSystem?.getEntity(TEST_TARGET)?.hp || 0;
      expect(healedHealth).toBeGreaterThan(damagedHealth);
    });

    test('should emit events for spell casting', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      const spellId = spells[0!].id;
      magicSystem?.unlockSpell(TEST_CASTER, spellId);

      let eventEmitted = false;
      eventBus?.on('magic:spell-cast', (data: any) => {
        eventEmitted = true;
        expect(data?.casterId).toBe(TEST_CASTER);
        expect(data?.spellId).toBe(spellId);
        expect(data?.manaSpent).toBeGreaterThan(0);
      });

      magicSystem?.castSpell(TEST_CASTER, spellId, [TEST_TARGET!]);

      // Event should have been emitted
      expect(eventEmitted).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple casters efficiently', () => {
      const startTime = performance?.now();

      // Create multiple casters
      for (let i = 0; i < 100; i++) {
        const casterId = `caster-${i}`;
        magicSystem?.createManaPool(casterId, 100);
        magicSystem?.updateManaPool(casterId);
      }

      const endTime = performance?.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast
    });

    test('should handle many spells without memory leaks', () => {
      const initialMemory = process?.memoryUsage().heapUsed;

      // Create many spells
      for (let i = 0; i < 1000; i++) {
        const spellId = `test-spell-${i}`;
        const spellDef: SpellDefinition = {
          id: spellId,
          name: `Test Spell ${i}`,
          description: 'A test spell',
          manaCost: 10,
          cooldown: 1000,
          castTime: 1000,
          levelRequirement: 1,
          school: 'arcane',
          primaryElement: 'arcane',
          secondaryElements: [],
          effects: [{
            type: 'damage',
            magnitude: 10,
            element: 'arcane',
            description: 'Test damage',
            target: 'single',
            range: 10
          }],
          visualEffect: 'test',
          soundEffect: 'test',
          icon: 'test',
          isPassive: false,
          prerequisites: [],
          upgrades: []
        };

        // Add to system (would normally go through registration)
        magicSystem?.getAllSpellDefinitions().push(spellDef);
      }

      const finalMemory = process?.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not have excessive memory usage
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid spell IDs gracefully', () => {
      const result = magicSystem?.castSpell(TEST_CASTER, 'invalid-spell', [TEST_TARGET!]);

      expect(result?.success).toBe(false);
      expect(result?.failureReason).toContain('not unlocked');
    });

    test('should handle null targets gracefully', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      const spellId = spells[0!].id;
      magicSystem?.unlockSpell(TEST_CASTER, spellId);

      const result = magicSystem?.castSpell(TEST_CASTER, spellId, []);

      expect(result?.success).toBe(true); // Should not fail due to empty targets
    });

    test('should handle missing mana pools', () => {
      const result = magicSystem?.castSpell('nonexistent-caster', 'any-spell', [TEST_TARGET!]);

      expect(result?.success).toBe(false);
      expect(result?.failureReason).toContain('not unlocked'); // Will fail at spell lookup first
    });
  });

  describe('Advanced Features', () => {
    test('should support spell upgrades', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      const upgradableSpell = spells?.find(s => s?.upgrades.length > 0);

      if (upgradableSpell) {
        magicSystem?.unlockSpell(TEST_CASTER, upgradableSpell?.id);

        // This would test the upgrade system
        // For now, just verify the structure exists
        expect(upgradableSpell?.upgrades).toBeDefined();
      }
    });

    test('should support prerequisites', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      const prerequisiteSpell = spells?.find(s => s?.prerequisites.length > 0);

      if (prerequisiteSpell) {
        // Verify prerequisite structure
        expect(prerequisiteSpell?.prerequisites).toBeDefined();
        expect(Array.isArray(prerequisiteSpell.prerequisites)).toBe(true);
      }
    });

    test('should support custom spell effects', () => {
      const spells = magicSystem?.getAllSpellDefinitions();
      if (spells?.length === 0) return;

      const spell = spells[0!];
      expect(spell?.effects).toBeDefined();
      expect(Array.isArray(spell.effects)).toBe(true);
      expect(spell?.effects.length).toBeGreaterThan(0);
    });
  });
});
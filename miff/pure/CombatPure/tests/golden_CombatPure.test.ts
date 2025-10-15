/**
 * CombatPure Golden Tests
 *
 * Comprehensive tests for the CombatPure battle system core.
 * Tests cover type effectiveness, damage calculation, combat mechanics, and battle resolution.
 */

  TypeEffectiveness,
  MoveData,
  MoveCategory,
  SpiritInstance,
  DamageCalculator,
  BattleEngine,
  CombatUtils,
  ICombatant,
  IBattleAction,
  ActionSource,
  IRNGProvider
} from '../index';

// Mock RNG provider for testing
class MockRNGProvider implements IRNGProvider {
  private values: number[] = [];
  private boolValues: boolean[] = [];
  private currentIndex = 0;
  private boolIndex = 0;

  setNextFloat(value: number): void {
    this.values.push(value);
  }

  setNextBool(value: boolean): void {
    this.boolValues.push(value);
  }

  nextFloat(min: number, max: number): number {
    if (this.values.length > this.currentIndex) {
      const value = this.values[this.currentIndex];
      this.currentIndex++;
      return Math.max(min, Math.min(max, value));
    }
    return (min + max) / 2; // Default to midpoint
  }

  nextBool(probability: number): boolean {
    if (this.boolValues.length > this.boolIndex) {
      const value = this.boolValues[this.boolIndex];
      this.boolIndex++;
      return value;
    }
    return Math.random() < probability;
  }

  reset(): void {
    this.currentIndex = 0;
    this.boolIndex = 0;
  }
}

describe('CombatPure Golden Tests', () => {
  describe('TypeEffectiveness Basic Functionality', () => {
    test('should create type effectiveness with default chart', () => {
      const typeChart = new TypeEffectiveness();
      expect(typeChart.getMultiplier('neutral', 'neutral')).toBe(1.0);
      expect(typeChart.getMultiplier('water', 'fire')).toBe(2.0);
      expect(typeChart.getMultiplier('fire', 'water')).toBe(0.5);
    });

    test('should create type effectiveness with custom chart', () => {
      const customChart = {
        'fire': { 'water': 0.25, 'grass': 2.0 },
        'water': { 'fire': 2.0, 'grass': 0.5 }
      };

      const typeChart = new TypeEffectiveness(customChart);
      expect(typeChart.getMultiplier('fire', 'water')).toBe(0.25);
      expect(typeChart.getMultiplier('fire', 'grass')).toBe(2.0);
      expect(typeChart.getMultiplier('water', 'fire')).toBe(2.0);
    });

    test('should handle case-insensitive lookups', () => {
      const typeChart = new TypeEffectiveness();
      expect(typeChart.getMultiplier('WATER', 'FIRE')).toBe(2.0);
      expect(typeChart.getMultiplier('Fire', 'Water')).toBe(0.5);
    });

    test('should handle unknown types', () => {
      const typeChart = new TypeEffectiveness();
      expect(typeChart.getMultiplier('unknown', 'fire')).toBe(1.0);
      expect(typeChart.getMultiplier('fire', 'unknown')).toBe(1.0);
    });

    test('should set and get multipliers correctly', () => {
      const typeChart = new TypeEffectiveness();

      typeChart.setMultiplier('electric', 'water', 2.0);
      expect(typeChart.getMultiplier('electric', 'water')).toBe(2.0);

      typeChart.setMultiplier('electric', 'water', 0.5);
      expect(typeChart.getMultiplier('electric', 'water')).toBe(0.5);
    });

    test('should export and import chart correctly', () => {
      const originalChart = new TypeEffectiveness();
      originalChart.setMultiplier('custom', 'target', 1.5);

      const exported = originalChart.exportChart();
      const importedChart = new TypeEffectiveness(exported);

      expect(importedChart.getMultiplier('custom', 'target')).toBe(1.5);
      expect(importedChart.getMultiplier('water', 'fire')).toBe(2.0); // Default chart preserved
    });

    test('should get attack and defense types correctly', () => {
      const typeChart = new TypeEffectiveness();
      const attackTypes = typeChart.getAttackTypes();
      const defenseTypes = typeChart.getDefenseTypes('water');

      expect(attackTypes.length).toBeGreaterThan(0);
      expect(attackTypes).toContain('water');
      expect(attackTypes).toContain('fire');
      expect(defenseTypes.length).toBeGreaterThan(0);
      expect(defenseTypes).toContain('fire');
      expect(defenseTypes).toContain('nature');
    });
  });

  describe('MoveData Basic Functionality', () => {
    test('should create move with default values', () => {
      const move = new MoveData();
      expect(move.moveId).toBe('');
      expect(move.name).toBe('');
      expect(move.category).toBe(MoveCategory.STATUS);
      expect(move.power).toBe(0);
      expect(move.accuracy).toBe(1.0);
      expect(move.cost).toBe(0);
      expect(move.typeTag).toBe('neutral');
    });

    test('should create move with custom values', () => {
      const move = new MoveData(
        'fire_blast',
        'Fire Blast',
        MoveCategory.SPECIAL,
        110,
        0.85,
        10,
        'fire',
        'burn',
        'fire_blast_animation'
      );

      expect(move.moveId).toBe('fire_blast');
      expect(move.name).toBe('Fire Blast');
      expect(move.category).toBe(MoveCategory.SPECIAL);
      expect(move.power).toBe(110);
      expect(move.accuracy).toBe(0.85);
      expect(move.cost).toBe(10);
      expect(move.typeTag).toBe('fire');
      expect(move.statusEffectId).toBe('burn');
      expect(move.animationTag).toBe('fire_blast_animation');
    });

    test('should enforce constraints on values', () => {
      const move = new MoveData('test', 'Test', MoveCategory.PHYSICAL, -10, -0.5, -5, 'test');
      expect(move.power).toBe(0); // Negative power clamped to 0
      expect(move.accuracy).toBe(0); // Negative accuracy clamped to 0
      expect(move.cost).toBe(0); // Negative cost clamped to 0
    });

    test('should identify move categories correctly', () => {
      const statusMove = new MoveData('heal', 'Heal', MoveCategory.STATUS, 0, 1.0, 0, 'neutral');
      const physicalMove = new MoveData('tackle', 'Tackle', MoveCategory.PHYSICAL, 40, 1.0, 0, 'normal');
      const specialMove = new MoveData('fireball', 'Fireball', MoveCategory.SPECIAL, 90, 0.9, 10, 'fire');

      expect(statusMove.isStatusMove).toBe(true);
      expect(statusMove.isPhysicalAttack).toBe(false);
      expect(statusMove.isSpecialAttack).toBe(false);
      expect(statusMove.canDealDamage).toBe(false);

      expect(physicalMove.isPhysicalAttack).toBe(true);
      expect(physicalMove.canDealDamage).toBe(true);

      expect(specialMove.isSpecialAttack).toBe(true);
      expect(specialMove.canDealDamage).toBe(true);
    });

    test('should generate move summary correctly', () => {
      const statusMove = new MoveData('heal', 'Heal', MoveCategory.STATUS, 0, 1.0, 0, 'neutral');
      const damageMove = new MoveData('tackle', 'Tackle', MoveCategory.PHYSICAL, 40, 0.95, 5, 'normal');

      expect(statusMove.getSummary()).toBe('Heal (status, 100% accuracy)');
      expect(damageMove.getSummary()).toBe('Tackle (physical, 40 power, 95% accuracy, 5 cost)');
    });

    test('should clone correctly', () => {
      const original = new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 110, 0.85, 10, 'fire', 'burn');
      const clone = original.clone();

      expect(clone.moveId).toBe(original.moveId);
      expect(clone.name).toBe(original.name);
      expect(clone.category).toBe(original.category);
      expect(clone.power).toBe(original.power);
      expect(clone.accuracy).toBe(original.accuracy);
      expect(clone.cost).toBe(original.cost);
      expect(clone.typeTag).toBe(original.typeTag);
      expect(clone.statusEffectId).toBe(original.statusEffectId);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validMove = new MoveData('test', 'Test Move', MoveCategory.PHYSICAL, 40, 0.9, 5, 'fire');
      expect(validMove.validate()).toHaveLength(0);

      // Test with empty ID and name - these should fail validation
      const invalidMove = new MoveData('', '', MoveCategory.PHYSICAL, -10, -0.5, -5, 'fire');
      const errors = invalidMove.validate();
      expect(errors).toContain('Move ID cannot be empty');
      expect(errors).toContain('Move name cannot be empty');
      // Note: Other values are clamped by constructor, so they become valid
      // expect(errors).toContain('Move power cannot be negative');
      // expect(errors).toContain('Move accuracy must be between 0 and 1');
      // expect(errors).toContain('Move cost cannot be negative');
    });
  });

  describe('SpiritInstance Basic Functionality', () => {
    test('should create spirit with default values', () => {
      const spirit = new SpiritInstance('0', 'Test Spirit', 'neutral', { hp: 100, maxHp: 100, atk: 10, def: 5, spd: 10 });
      expect(spirit.id).toBe('0');
      expect(spirit.name).toBe('Test Spirit');
      expect(spirit.team).toBe('neutral');
      expect(spirit.level).toBe(1);
      expect(spirit.currentHP).toBe(100);
      expect(spirit.maxHP).toBe(100);
      expect(spirit.resourcePoints).toBe(10);
    });

    test('should create spirit with custom values', () => {
      const spirit = new SpiritInstance('1', 'Ember', 'fire', { hp: 85, maxHp: 100, atk: 30, def: 60, spd: 40 }, ['fire_blast', 'tackle'], 'fire', 20, 'ember', 15, 50, ['burning'], ['fire_resistance']);
      expect(spirit.id).toBe('1');
      expect(spirit.spiritId).toBe('ember');
      expect(spirit.name).toBe('Ember');
      expect(spirit.typeTag).toBe('fire');
      expect(spirit.level).toBe(15);
      expect(spirit.currentHP).toBe(85);
      expect(spirit.maxHP).toBe(100);
      expect(spirit.resourcePoints).toBe(20);
    });

    test('should enforce constraints on values', () => {
      const spirit = new SpiritInstance('1', 'Test', 'neutral', { hp: 150, maxHp: 0, atk: -5, def: -20, spd: -15 }, [], 'neutral', -5, 'test', 0, -10, [], []);
      expect(spirit.level).toBe(1); // Level clamped to minimum
      expect(spirit.currentHP).toBe(1); // HP clamped to maxHP (which is clamped to 1)
      expect(spirit.maxHP).toBe(1); // Max HP clamped to minimum
      expect(spirit.resourcePoints).toBe(0); // Resource points clamped to 0
    });

    test('should calculate effective stats correctly', () => {
      const spirit = new SpiritInstance('1', 'Test', 'neutral', { hp: 80, maxHp: 100, atk: 15, def: 25, spd: 18 }, ['tackle'], 'neutral', 10, 'test', 10, 20, [], []);
      spirit.attackMultiplier = 1.5;
      spirit.defenseMultiplier = 0.8;
      spirit.specialAttackMultiplier = 1.2;
      spirit.specialDefenseMultiplier = 0.9;

      expect(spirit.getEffectiveAttack()).toBe(22); // 15 * 1.5 = 22.5 → 22 (floored)
      expect(spirit.getEffectiveDefense()).toBe(20); // 25 * 0.8 = 20
      expect(spirit.getEffectiveSpecialAttack()).toBe(18); // 15 * 1.2 = 18 (specialAtk falls back to atk)
      expect(spirit.getEffectiveSpecialDefense()).toBe(22); // 25 * 0.9 = 22.5 → 22 (specialDef falls back to def)
    });

    test('should determine health status correctly', () => {
      const fullHealth = new SpiritInstance('1', 'Test1', 'neutral', { hp: 100, maxHp: 100, atk: 10, def: 10, spd: 10 });
      const lowHealth = new SpiritInstance('2', 'Test2', 'neutral', { hp: 25, maxHp: 100, atk: 10, def: 10, spd: 10 });
      const criticalHealth = new SpiritInstance('3', 'Test3', 'neutral', { hp: 10, maxHp: 100, atk: 10, def: 10, spd: 10 }); // 10% HP = critical
      const koSpirit = new SpiritInstance('4', 'Test4', 'neutral', { hp: 0, maxHp: 100, atk: 10, def: 10, spd: 10 });

      expect(fullHealth.isFullHealth).toBe(true);
      expect(fullHealth.isLowHealth).toBe(false);
      expect(fullHealth.isCritical).toBe(false);
      expect(fullHealth.isKO).toBe(false);
      expect(fullHealth.healthStatus).toBe('full');

      expect(lowHealth.isLowHealth).toBe(true);
      expect(lowHealth.isCritical).toBe(false);
      expect(lowHealth.healthStatus).toBe('low');

      expect(criticalHealth.isCritical).toBe(true);
      expect(criticalHealth.healthStatus).toBe('critical');

      expect(koSpirit.isKO).toBe(true);
      expect(koSpirit.healthStatus).toBe('ko');
    });

    test('should calculate health percentage correctly', () => {
      const spirit1 = new SpiritInstance('1', 'test1', 'neutral', { hp: 75, maxHp: 100, atk: 10, def: 10, spd: 10 });
      const spirit2 = new SpiritInstance('2', 'test2', 'neutral', { hp: 0, maxHp: 100, atk: 10, def: 10, spd: 10 });

      expect(spirit1.healthPercentage).toBe(75);
      expect(spirit2.healthPercentage).toBe(0);
    });

    test('should handle damage correctly', () => {
      const spirit = new SpiritInstance('1', 'test', 'neutral', { hp: 80, maxHp: 100, atk: 10, def: 10, spd: 10 });

      const damage1 = spirit.takeDamage(30);
      expect(damage1).toBe(30);
      expect(spirit.currentHP).toBe(50);

      const damage2 = spirit.takeDamage(100); // Overkill
      expect(damage2).toBe(50);
      expect(spirit.currentHP).toBe(0);
    });

    test('should handle healing correctly', () => {
      const spirit = new SpiritInstance('1', 'test', 'neutral', { hp: 30, maxHp: 100, atk: 10, def: 10, spd: 10 });

      const heal1 = spirit.heal(25);
      expect(heal1).toBe(25);
      expect(spirit.currentHP).toBe(55);

      const heal2 = spirit.heal(100); // Overheal
      expect(heal2).toBe(45);
      expect(spirit.currentHP).toBe(100);
    });

    test('should handle resource consumption correctly', () => {
      const spirit = new SpiritInstance('1', 'test', 'neutral', { hp: 80, maxHp: 100, atk: 10, def: 10, spd: 10 }, [], undefined, 20);

      expect(spirit.consumeResource(5)).toBe(true);
      expect(spirit.resourcePoints).toBe(15);

      expect(spirit.consumeResource(20)).toBe(false); // Not enough resources
      expect(spirit.resourcePoints).toBe(15);

      const restored = spirit.restoreResource(10);
      expect(restored).toBe(5); // Only 5 can be restored (20 max - 15 current)
      expect(spirit.resourcePoints).toBe(20); // Back to max
    });

    test('should generate combat summary correctly', () => {
      const spirit = new SpiritInstance('1', 'ember', 'fire', { hp: 85, maxHp: 100, atk: 50, def: 30, spd: 60 }, ['tackle'], 'fire', 20);
      spirit.attackMultiplier = 1.2;

      const summary = spirit.getCombatSummary();
      expect(summary).toContain('ember'); // Name is lowercase
      expect(summary).toContain('HP: 85/100');
      expect(summary).toContain('[fire]'); // Type tag
      expect(summary).toContain('Lv.1'); // Level
    });

    test('should clone correctly', () => {
      const original = new SpiritInstance('1', 'ember', 'fire', { hp: 85, maxHp: 100, atk: 50, def: 30, spd: 60 }, ['tackle'], 'fire', 20);
      original.attackMultiplier = 1.5;
      original.currentHP = 70; // Modify after creation

      const clone = original.clone();

      expect(clone.id).toBe(original.id);
      expect(clone.spiritId).toBe(original.spiritId);
      expect(clone.name).toBe(original.name);
      expect(clone.typeTag).toBe(original.typeTag);
      expect(clone.level).toBe(original.level);
      expect(clone.currentHP).toBe(original.currentHP); // Modified value preserved
      expect(clone.attackMultiplier).toBe(original.attackMultiplier);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validSpirit = new SpiritInstance('100', 'test', 'neutral', { hp: 80, maxHp: 100, atk: 20, def: 15, spd: 25 });
      expect(validSpirit.validate()).toHaveLength(0);

      // Test validation directly - create a valid spirit and modify its name
      const testSpirit = new SpiritInstance('101', 'test', 'neutral', { hp: 150, maxHp: 0, atk: 20, def: 15, spd: 25 });
      (testSpirit as any).name = ''; // Force empty name after construction
      const errors = testSpirit.validate();
      expect(errors).toContain('Spirit name cannot be empty');
    });
  });

  describe('DamageCalculator Basic Functionality', () => {
    let typeChart: TypeEffectiveness;
    let damageCalculator: DamageCalculator;
    let rng: MockRNGProvider;
    let attacker: SpiritInstance;
    let defender: SpiritInstance;
    let move: MoveData;

    beforeEach(() => {
      typeChart = new TypeEffectiveness();
      rng = new MockRNGProvider();
      damageCalculator = new DamageCalculator(typeChart, rng);

      attacker = new SpiritInstance('1', 'attacker', 'neutral', { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 40 }, [], 'fire');
      defender = new SpiritInstance('2', 'defender', 'neutral', { hp: 100, maxHp: 100, atk: 30, def: 40, spd: 35 }, [], 'water');
      move = new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 90, 1.0, 10, 'fire');
    });

    test('should calculate damage for physical attacks', () => {
      const physicalMove = new MoveData('tackle', 'Tackle', MoveCategory.PHYSICAL, 40, 1.0, 0, 'normal');
      rng.setNextFloat(1.0); // Max variance
      rng.setNextBool(false); // No critical hit

      const result = damageCalculator.calculateDamage(physicalMove, attacker, defender, false);

      expect(result.damage).toBeGreaterThan(0);
      expect(result.damage).toBeLessThan(100);
    });

    test('should calculate damage for special attacks', () => {
      rng.setNextFloat(1.0); // Max variance
      rng.setNextBool(false); // No critical hit

      const result = damageCalculator.calculateDamage(move, attacker, defender, false);

      // Fire should be super effective against water
      expect(result.damage).toBeGreaterThan(0);
    });

    test('should handle critical hits', () => {
      rng.setNextFloat(1.0); // Max variance
      rng.setNextBool(true); // Critical hit

      const result = damageCalculator.calculateDamage(move, attacker, defender, true);

      expect(result.damage).toBeGreaterThan(0);
      expect(result.isCritical).toBe(true);
    });

    test('should handle type effectiveness', () => {
      // Fire vs Water should be super effective (2x)
      const fireMove = new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 40, 1.0, 0, 'fire');
      rng.setNextFloat(1.0);
      rng.setNextBool(false);

      const fireResult = damageCalculator.calculateDamage(fireMove, attacker, defender, false);

      // Water vs Fire should be not very effective (0.5x)
      const waterMove = new MoveData('water_blast', 'Water Blast', MoveCategory.SPECIAL, 40, 1.0, 0, 'water');
      const waterAttacker = new SpiritInstance('3', 'water_attacker', 'neutral', { hp: 100, maxHp: 100, atk: 40, def: 35, spd: 50 }, [], 'water');
      const fireDefender = new SpiritInstance('4', 'fire_defender', 'neutral', { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 40 }, [], 'fire');

      const waterResult = damageCalculator.calculateDamage(waterMove, waterAttacker, fireDefender, false);

      expect(fireResult.damage).toBeLessThan(waterResult.damage); // Fire vs Water (0.5x) should be less than Water vs Fire (2.0x)
      expect(fireResult.effectiveness).toBe(0.5); // Fire vs Water - not very effective
      expect(waterResult.effectiveness).toBe(2.0); // Water vs Fire - super effective
    });

    test('should handle status moves', () => {
      const statusMove = new MoveData('heal', 'Heal', MoveCategory.STATUS, 0, 1.0, 0, 'neutral');

      const result = damageCalculator.calculateDamage(statusMove, attacker, defender, false);
      expect(result.damage).toBe(0);
    });

    test('should check move execution feasibility', () => {
      const cheapMove = new MoveData('tackle', 'Tackle', MoveCategory.PHYSICAL, 40, 1.0, 5, 'normal');
      const expensiveMove = new MoveData('ultimate', 'Ultimate', MoveCategory.SPECIAL, 100, 1.0, 50, 'neutral');

      expect(damageCalculator.canExecuteMove(cheapMove, attacker).canExecute).toBe(true);
      expect(damageCalculator.canExecuteMove(expensiveMove, attacker).canExecute).toBe(false);
    });

    test('should get move effectiveness correctly', () => {
      const fireMove = new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 40, 1.0, 0, 'fire');
      const waterMove = new MoveData('water_blast', 'Water Blast', MoveCategory.SPECIAL, 40, 1.0, 0, 'water');

      expect(damageCalculator.getMoveEffectiveness(fireMove, defender)).toBe(0.5); // Fire vs Water - not very effective
      expect(damageCalculator.getMoveEffectiveness(waterMove, defender)).toBe(1.0); // Water vs Water
    });

    test('should calculate expected damage correctly', () => {
      const expectedDamage = damageCalculator.calculateExpectedDamage(move, attacker, defender);
      expect(expectedDamage).toBeGreaterThan(0);
      expect(expectedDamage).toBeLessThan(100);
    });

    test('should trigger damage computed callback', () => {
      let callbackCalled = false;
      let breakdownData: any = null;

      damageCalculator.setDamageCallback((damage, attacker, defender) => {
        callbackCalled = true;
        breakdownData = damage; // The callback receives just the damage value
      });

      rng.setNextFloat(1.0);
      rng.setNextBool(false);

      damageCalculator.calculateDamage(move, attacker, defender, false);

      expect(callbackCalled).toBe(true);
      expect(breakdownData).not.toBeNull();
      expect(breakdownData).toBeGreaterThan(0); // The callback receives just the damage value
    });
  });

  describe('BattleEngine Basic Functionality', () => {
    let engine: BattleEngine;
    let playerCombatant: ICombatant;
    let enemyCombatant: ICombatant;

    beforeEach(() => {
      engine = new BattleEngine();

      playerCombatant = {
        id: 'player1',
        name: 'Player Spirit',
        team: 'player',
        typeTag: 'fire',
        stats: {
          hp: 100,
          maxHp: 100,
          atk: 50,
          def: 30,
          spd: 40,
          specialAtk: 60,
          specialDef: 35,
          level: 10
        }
      };

      enemyCombatant = {
        id: 'enemy1',
        name: 'Enemy Spirit',
        team: 'enemy',
        typeTag: 'water',
        stats: {
          hp: 80,
          maxHp: 80,
          atk: 40,
          def: 35,
          spd: 35,
          specialAtk: 45,
          specialDef: 40,
          level: 10
        }
      };
    });

    test('should create battle engine with empty state', () => {
      expect(engine.combatants).toEqual({});
      expect(engine.order).toHaveLength(0);
      expect(engine.queue).toHaveLength(0);
      expect(engine.isBattleOver).toBe(false);
    });

    test('should add combatants correctly', () => {
      engine.addCombatant(playerCombatant);
      expect(Object.keys(engine.combatants)).toHaveLength(1);
      expect(engine.combatants['player1']).toBe(playerCombatant);

      engine.addCombatant(enemyCombatant);
      expect(Object.keys(engine.combatants)).toHaveLength(2);
    });

    test('should reject duplicate combatants', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(playerCombatant); // Should warn but not add duplicate

      expect(Object.keys(engine.state.combatants)).toHaveLength(1);
    });

    test('should get combatants correctly', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      expect(engine.getCombatant('player1')).toBe(playerCombatant);
      expect(engine.getCombatant('nonexistent')).toBeNull();

      const allCombatants = engine.getAllCombatants();
      expect(allCombatants).toHaveLength(2);

      const playerTeam = engine.getCombatantsByTeam('player');
      expect(playerTeam).toHaveLength(1);
      expect(playerTeam[0].id).toBe('player1');

      const enemyTeam = engine.getCombatantsByTeam('enemy');
      expect(enemyTeam).toHaveLength(1);
      expect(enemyTeam[0].id).toBe('enemy1');
    });

    test('should remove combatants correctly', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      const removed = engine.removeCombatant('player1');
      expect(removed).toBe(true);
      expect(Object.keys(engine.combatants)).toHaveLength(1);
      expect(engine.combatants['enemy1']).toBe(enemyCombatant);

      const notRemoved = engine.removeCombatant('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should rebuild turn order by speed', () => {
      const fastSpirit: ICombatant = {
        ...playerCombatant,
        id: 'fast',
        name: 'Fast Spirit',
        stats: { ...playerCombatant.stats, spd: 100 }
      };

      const slowSpirit: ICombatant = {
        ...enemyCombatant,
        id: 'slow',
        name: 'Slow Spirit',
        stats: { ...enemyCombatant.stats, spd: 20 }
      };

      engine.addCombatant(slowSpirit);
      engine.addCombatant(fastSpirit);

      engine.rebuildOrder();

      expect(engine.order).toEqual(['fast', 'slow']); // Fast first
    });

    test('should enqueue and process actions', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      const action: IBattleAction = {
        actorId: 'player1',
        targetId: 'enemy1',
        moveId: 'attack',
        priority: 0,
        speed: 40,
        source: ActionSource.PLAYER,
        type: 'attack'
      };

      engine.enqueueAction(action);
      expect(engine.queue).toHaveLength(1);

      engine.processNextAction();
      expect(engine.queue).toHaveLength(0);
    });

    test('should handle battle victory conditions', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      // KO the enemy
      const enemy = engine.getCombatant('enemy1')!;
      enemy.stats.hp = 0;
      enemy.status = { ko: true };

      engine.checkVictory();

      expect(engine.isBattleOver).toBe(true);
      expect(engine.winnerTeam).toBe('player');
    });

    test('should start and end battles correctly', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      engine.startBattle();
      expect(engine.phase).toBe('select_action');
      expect(engine.turnNumber).toBe(1);

      engine.endBattle();
      expect(engine.phase).toBe('battle_end');
      expect(engine.isBattleOver).toBe(true);
    });

    test('should get battle status correctly', () => {
      engine.addCombatant(playerCombatant);
      engine.addCombatant(enemyCombatant);

      const initialStatus = engine.getBattleStatus();
      expect(initialStatus.winner).toBeNull();
      expect(engine.isBattleOver).toBe(false);

      // KO enemy
      const enemy = engine.getCombatant('enemy1')!;
      enemy.stats.hp = 0;
      enemy.status = { ko: true };

      engine.checkVictory();
      const finalStatus = engine.getBattleStatus();
      expect(finalStatus.winner).toBe('player');
      expect(engine.isBattleOver).toBe(true);
    });
  });

  describe('CombatUtils', () => {
    test('should create standard move data', () => {
      const move = CombatUtils.createStandardMove('tackle', 'Tackle', MoveCategory.PHYSICAL, 40, 'normal');

      expect(move.moveId).toBe('tackle');
      expect(move.name).toBe('Tackle');
      expect(move.category).toBe(MoveCategory.PHYSICAL);
      expect(move.power).toBe(40);
      expect(move.typeTag).toBe('normal');
    });

    test('should create standard spirit instance', () => {
      const spirit = CombatUtils.createStandardSpirit('1', 'Test Spirit', 15, 100, 50, 40, 35);

      expect(spirit.id).toBe('1');
      expect(spirit.name).toBe('Test Spirit');
      expect(spirit.level).toBe(15);
      expect(spirit.currentHP).toBe(100);
      expect(spirit.maxHP).toBe(100);
      expect(spirit.attack).toBe(50);
      expect(spirit.defense).toBe(40);
      expect(spirit.specialAttack).toBe(50);
      expect(spirit.specialDefense).toBe(40);
    });

    test('should calculate level modifier correctly', () => {
      expect(CombatUtils.calculateLevelModifier(10, 10)).toBe(1.0); // Even match
      expect(CombatUtils.calculateLevelModifier(10, 15)).toBe(0.75); // Weaker
      expect(CombatUtils.calculateLevelModifier(10, 20)).toBe(0.5); // Much weaker
      expect(CombatUtils.calculateLevelModifier(15, 10)).toBe(1.25); // Stronger
      expect(CombatUtils.calculateLevelModifier(20, 10)).toBe(1.5); // Much stronger
    });

    test('should calculate critical hit chance correctly', () => {
      expect(CombatUtils.calculateCritChance(0.0625, 0)).toBe(0.0625); // Base crit
      expect(CombatUtils.calculateCritChance(0.0625, 0.1)).toBe(0.1625); // With bonus
      expect(CombatUtils.calculateCritChance(0.0625, 1)).toBe(1.0); // Max crit
    });

    test('should calculate hit chance correctly', () => {
      expect(CombatUtils.calculateHitChance(1.0, 1.0, 1.0)).toBe(0); // 100% evasion = never hits
      expect(CombatUtils.calculateHitChance(0.8, 1.0, 0.0)).toBe(0.8); // Move accuracy (no evasion)
      expect(CombatUtils.calculateHitChance(1.0, 0.9, 0.0)).toBe(0.9); // Attacker accuracy (no evasion)
      expect(CombatUtils.calculateHitChance(1.0, 1.0, 0.15)).toBe(0.85); // Defender evasion (15% evasion = 85% hit chance)
      expect(CombatUtils.calculateHitChance(0.8, 0.9, 0.15)).toBeCloseTo(0.612, 3); // All factors
    });

    test('should get category and source names correctly', () => {
      expect(CombatUtils.getDamageCategoryName(MoveCategory.STATUS)).toBe('Status');
      expect(CombatUtils.getDamageCategoryName(MoveCategory.PHYSICAL)).toBe('Physical');
      expect(CombatUtils.getDamageCategoryName(MoveCategory.SPECIAL)).toBe('Special');

      expect(CombatUtils.getActionSourceName(ActionSource.PLAYER)).toBe('Player');
      expect(CombatUtils.getActionSourceName(ActionSource.AI)).toBe('AI');
      expect(CombatUtils.getActionSourceName(ActionSource.ENGINE)).toBe('Engine');
    });

    test('should validate combatant data correctly', () => {
      const validCombatant: ICombatant = {
        id: 'test',
        name: 'Test Spirit',
        team: 'player',
        typeTag: 'fire',
        stats: {
          hp: 100,
          maxHp: 100,
          atk: 50,
          def: 30,
          spd: 40,
          specialAtk: 60,
          specialDef: 35,
          level: 10
        },
        moves: ['tackle', 'fire_blast']
      };

      const invalidCombatant: ICombatant = {
        id: '',
        name: '',
        team: '',
        typeTag: 'fire',
        stats: {
          hp: 150,
          maxHp: 0,
          atk: 50,
          def: 30,
          spd: 40,
          specialAtk: 60,
          specialDef: 35,
          level: 0
        }
      };

      expect(CombatUtils.validateCombatant(validCombatant)).toHaveLength(0);
      const errors = CombatUtils.validateCombatant(invalidCombatant);
      expect(errors).toContain('Combatant ID cannot be empty');
      expect(errors).toContain('Combatant name cannot be empty');
      expect(errors).toContain('Combatant team cannot be empty');
      expect(errors).toContain('Max HP must be greater than 0');
      expect(errors).toContain('Current HP cannot exceed max HP');
      expect(errors).toContain('Level must be at least 1');
    });

    test('should validate move data correctly', () => {
      const validMove: any = {
        moveId: 'test_move',
        name: 'Test Move',
        category: MoveCategory.PHYSICAL,
        power: 40,
        accuracy: 0.9,
        cost: 5,
        typeTag: 'fire'
      };

      const invalidMove: any = {
        moveId: '',
        name: '',
        category: MoveCategory.PHYSICAL,
        power: -10,
        accuracy: -0.5,
        cost: -5,
        typeTag: 'fire'
      };

      expect(CombatUtils.validateMoveData(validMove)).toHaveLength(0);
      const errors = CombatUtils.validateMoveData(invalidMove);
      expect(errors).toContain('Move ID cannot be empty');
      expect(errors).toContain('Move name cannot be empty');
      expect(errors).toContain('Move power cannot be negative');
      expect(errors).toContain('Move accuracy must be between 0 and 1');
      expect(errors).toContain('Move cost cannot be negative');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete combat workflow', () => {
      const engine = new BattleEngine();

      // Add combatants
      const player: ICombatant = {
        id: 'player',
        name: 'Hero',
        team: 'player',
        typeTag: 'fire',
        stats: {
          hp: 100,
          maxHp: 100,
          atk: 50,
          def: 30,
          spd: 40,
          specialAtk: 60,
          specialDef: 35,
          level: 10
        }
      };

      const enemy: ICombatant = {
        id: 'enemy',
        name: 'Goblin',
        team: 'enemy',
        typeTag: 'neutral',
        stats: {
          hp: 60,
          maxHp: 60,
          atk: 30,
          def: 25,
          spd: 35,
          specialAtk: 35,
          specialDef: 30,
          level: 8
        }
      };

      engine.addCombatant(player);
      engine.addCombatant(enemy);

      // Start battle
      engine.startBattle();
      expect(engine.phase).toBe('select_action');
      expect(engine.turnNumber).toBe(1);

      // Create attack action
      const attackAction: IBattleAction = {
        actorId: 'player',
        targetId: 'enemy',
        moveId: 'fire_blast',
        priority: 0,
        speed: 40,
        source: ActionSource.PLAYER,
        type: 'attack'
      };

      // Process attack
      engine.enqueueAction(attackAction);
      engine.processNextAction();

      // Check results
      const updatedEnemy = engine.getCombatant('enemy')!;
      expect(updatedEnemy.stats.hp).toBeLessThan(60); // Should have taken damage

      // Check victory condition
      engine.checkVictory();
      expect(engine.isBattleOver).toBe(false); // Enemy not defeated yet
    });

    test('should handle multi-combatant battles', () => {
      const engine = new BattleEngine();

      // Add multiple combatants per team
      const player1: ICombatant = {
        id: 'player1',
        name: 'Warrior',
        team: 'player',
        typeTag: 'fire',
        stats: { hp: 120, maxHp: 120, atk: 60, def: 35, spd: 45, specialAtk: 40, specialDef: 30, level: 15 }
      };

      const player2: ICombatant = {
        id: 'player2',
        name: 'Mage',
        team: 'player',
        typeTag: 'water',
        stats: { hp: 80, maxHp: 80, atk: 35, def: 25, spd: 35, specialAtk: 70, specialDef: 45, level: 12 }
      };

      const enemy1: ICombatant = {
        id: 'enemy1',
        name: 'Orc',
        team: 'enemy',
        typeTag: 'neutral',
        stats: { hp: 100, maxHp: 100, atk: 55, def: 40, spd: 30, specialAtk: 30, specialDef: 35, level: 14 }
      };

      const enemy2: ICombatant = {
        id: 'enemy2',
        name: 'Archer',
        team: 'enemy',
        typeTag: 'nature',
        stats: { hp: 70, maxHp: 70, atk: 45, def: 25, spd: 50, specialAtk: 50, specialDef: 30, level: 13 }
      };

      engine.addCombatant(player1);
      engine.addCombatant(player2);
      engine.addCombatant(enemy1);
      engine.addCombatant(enemy2);

      // Verify turn order (by speed: Archer 50, Warrior 45, Mage 35, Orc 30)
      expect(engine.order).toEqual(['enemy2', 'player1', 'player2', 'enemy1']);

      // Test team-based queries
      const playerTeam = engine.getCombatantsByTeam('player');
      expect(playerTeam).toHaveLength(2);

      const enemyTeam = engine.getCombatantsByTeam('enemy');
      expect(enemyTeam).toHaveLength(2);

      const livingPlayers = engine.getLivingCombatantsByTeam('player');
      expect(livingPlayers).toHaveLength(2);
    });

    test('should handle damage calculation integration', () => {
      const engine = new BattleEngine();
      const typeChart = new TypeEffectiveness();
      const damageCalculator = new DamageCalculator(typeChart);
      const rng = new MockRNGProvider();

      // Add combatants with different types
      const fireSpirit: ICombatant = {
        id: 'fire',
        name: 'Fire Spirit',
        team: 'player',
        typeTag: 'fire',
        stats: { hp: 100, maxHp: 100, atk: 40, def: 30, spd: 40, specialAtk: 50, specialDef: 35, level: 10 }
      };

      const waterSpirit: ICombatant = {
        id: 'water',
        name: 'Water Spirit',
        team: 'enemy',
        typeTag: 'water',
        stats: { hp: 100, maxHp: 100, atk: 30, def: 40, spd: 35, specialAtk: 45, specialDef: 45, level: 10 }
      };

      engine.addCombatant(fireSpirit);
      engine.addCombatant(waterSpirit);

      // Create fire attack (should be NOT VERY effective against water - 0.5x)
      const fireMove = new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 40, 1.0, 10, 'fire');

      // Calculate damage
      const attackerInstance = engine['combatantToSpiritInstance'](fireSpirit);
      const defenderInstance = engine['combatantToSpiritInstance'](waterSpirit);

      rng.setNextFloat(1.0); // Max variance
      rng.setNextBool(false); // No critical

      const damageResult = damageCalculator.calculateDamage(fireMove, attackerInstance, defenderInstance);

      // Fire vs Water should be NOT VERY effective (0.5x) - scaled damage calculation
      expect(damageResult.damage).toBeLessThan(20); // Scaled: 40 power * 50 specialAtk / 50 * 0.5 effectiveness * 0.69 defense modifier

      // Apply damage through engine
      const attackAction: IBattleAction = {
        actorId: 'fire',
        targetId: 'water',
        moveId: 'fire_blast',
        priority: 0,
        speed: 40,
        source: ActionSource.PLAYER,
        type: 'attack'
      };

      engine.enqueueAction(attackAction);
      engine.processNextAction();

      // Check damage was applied
      const updatedWater = engine.getCombatant('water')!;
      expect(updatedWater.stats.hp).toBeLessThan(100);
    });

    test('should handle battle victory scenarios', () => {
      const engine = new BattleEngine();

      // Add multiple combatants
      const player1: ICombatant = {
        id: 'player1',
        name: 'Player 1',
        team: 'player',
        typeTag: 'fire',
        stats: { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 40, specialAtk: 60, specialDef: 35, level: 10 }
      };

      const player2: ICombatant = {
        id: 'player2',
        name: 'Player 2',
        team: 'player',
        typeTag: 'water',
        stats: { hp: 80, maxHp: 80, atk: 40, def: 35, spd: 35, specialAtk: 55, specialDef: 40, level: 10 }
      };

      const enemy1: ICombatant = {
        id: 'enemy1',
        name: 'Enemy 1',
        team: 'enemy',
        typeTag: 'neutral',
        stats: { hp: 60, maxHp: 60, atk: 35, def: 25, spd: 30, specialAtk: 40, specialDef: 30, level: 8 }
      };

      const enemy2: ICombatant = {
        id: 'enemy2',
        name: 'Enemy 2',
        team: 'enemy',
        typeTag: 'nature',
        stats: { hp: 50, maxHp: 50, atk: 30, def: 30, spd: 25, specialAtk: 35, specialDef: 35, level: 8 }
      };

      engine.addCombatant(player1);
      engine.addCombatant(player2);
      engine.addCombatant(enemy1);
      engine.addCombatant(enemy2);

      // KO all enemies
      const enemy1Combatant = engine.getCombatant('enemy1')!;
      const enemy2Combatant = engine.getCombatant('enemy2')!;

      enemy1Combatant.stats.hp = 0;
      enemy1Combatant.status = { ko: true };

      enemy2Combatant.stats.hp = 0;
      enemy2Combatant.status = { ko: true };

      engine.checkVictory();

      expect(engine.isBattleOver).toBe(true);
      expect(engine.getBattleStatus().winner).toBe('player');

      // Test player KO scenario
      engine.endBattle(); // Reset
      engine.startBattle();

      const player1Combatant = engine.getCombatant('player1')!;
      const player2Combatant = engine.getCombatant('player2')!;

      player1Combatant.stats.hp = 0;
      player1Combatant.status = { ko: true };

      player2Combatant.stats.hp = 0;
      player2Combatant.status = { ko: true };

      engine.checkVictory();

      expect(engine.isBattleOver).toBe(true);
      expect(engine.getBattleStatus().winner).toBeNull(); // No winner when all combatants are KO'd
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many combatants efficiently', () => {
      const engine = new BattleEngine();

      const startTime = performance.now();

      // Add many combatants
      for (let i = 0; i < 100; i++) {
        const combatant: ICombatant = {
          id: `combatant_${i}`,
          name: `Combatant ${i}`,
          team: i % 2 === 0 ? 'team1' : 'team2',
          typeTag: 'neutral',
          stats: {
            hp: 100,
            maxHp: 100,
            atk: 30 + i,
            def: 25 + i,
            spd: 20 + (i % 50), // Vary speed
            specialAtk: 35 + i,
            specialDef: 30 + i,
            level: 10 + Math.floor(i / 10)
          }
        };

        engine.addCombatant(combatant);
      }

      const endTime = performance.now();

      expect(engine.getAllCombatants()).toHaveLength(100);
      expect(engine.order).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    test('should handle rapid action processing efficiently', () => {
      const engine = new BattleEngine();
      const rng = new MockRNGProvider();

      // Add test combatants
      const attacker: ICombatant = {
        id: 'attacker',
        name: 'Attacker',
        team: 'player',
        typeTag: 'fire',
        stats: { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 40, specialAtk: 60, specialDef: 35, level: 10 }
      };

      const defender: ICombatant = {
        id: 'defender',
        name: 'Defender',
        team: 'enemy',
        typeTag: 'water',
        stats: { hp: 100, maxHp: 100, atk: 40, def: 35, spd: 35, specialAtk: 45, specialDef: 40, level: 10 }
      };

      engine.addCombatant(attacker);
      engine.addCombatant(defender);

      const startTime = performance.now();

      // Process many actions
      for (let i = 0; i < 1000; i++) {
        const action: IBattleAction = {
          actorId: 'attacker',
          targetId: 'defender',
          moveId: 'attack',
          priority: 0,
          speed: 40,
          source: ActionSource.PLAYER,
          type: 'attack'
        };

        engine.enqueueAction(action);
        engine.processNextAction();
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
      expect(engine.queue).toHaveLength(0); // All actions processed
    });

    test('should handle complex calculations efficiently', () => {
      const typeChart = new TypeEffectiveness();
      const damageCalculator = new DamageCalculator(typeChart);
      const rng = new MockRNGProvider();

      // Create many spirit instances with correct constructor parameters
      const spirits: SpiritInstance[] = [];
      for (let i = 0; i < 50; i++) {
        const stats: Stats = {
          hp: 100 + i,
          maxHp: 100 + i,
          atk: 50 + i,
          def: 40 + i,
          spd: 30 + i,
          specialAtk: 45 + i,
          specialDef: 35 + i
        };

        spirits.push(new SpiritInstance(
          `spirit_${i}`,                    // id
          `Spirit ${i}`,                    // name
          'neutral',                        // team
          stats,                            // stats
          [`move_${i}`],                   // moves
          'neutral',                        // typeTag
          20 + i,                           // resourcePoints
          `spirit_id_${i}`,                 // spiritId
          10 + Math.floor(i / 5),           // level
          100 + i,                          // experience
          [`effect_${i}`],                  // statusEffects
          [`ability_${i}`]                  // abilities
        ));
      }

      const moves: MoveData[] = [];
      for (let i = 0; i < 20; i++) {
        moves.push(new MoveData(
          `move_${i}`,
          `Move ${i}`,
          i % 3 === 0 ? MoveCategory.STATUS : (i % 3 === 1 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL),
          30 + i,
          0.8 + (i * 0.01),
          i * 2,
          'neutral'
        ));
      }

      const startTime = performance.now();

      // Perform many damage calculations
      for (let i = 0; i < 500; i++) {
        const attacker = spirits[i % spirits.length];
        const defender = spirits[(i + 1) % spirits.length];
        const move = moves[i % moves.length];

        rng.setNextFloat(1.0);
        rng.setNextBool(false);

        damageCalculator.calculateDamage(move, attacker, defender, false);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
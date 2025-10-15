/**
 * EffectsPure Golden Tests
 *
 * Comprehensive tests for the EffectsPure effects management system.
 * Tests cover effects, managers, resolvers, aggregators, and integration scenarios.
 */

  EffectManager,
  BattleEffect,
  ActiveEffect,
  EffectResolver,
  StatModifierAggregator,
  EffectEvent,
  EffectResolution,
  EffectUtils,
  EffectType,
  EffectTrigger,
  TargetStat,
  ModifierType,
  EffectPhase,
  EffectApplicationResult,
  EffectRemovalReason,
  IEntityContext,
  IBattleEffect,
  IActiveEffect,
  IStatModifierAggregator
} from '../index';

// Mock Entity Context for testing
class MockEntityContext implements IEntityContext {
  private entityStats = new Map<string, Map<string, number>>();
  private entityImmunities = new Map<string, string[]>();
  private currentPhase: EffectPhase = EffectPhase.PRE_TURN;
  private aliveEntities = new Set<string>();

  constructor(...args: any[]) {
    this.aliveEntities.add('player');
    this.aliveEntities.add('enemy');
  }

  getEntityStat(entityId: string, stat: TargetStat): number {
    const stats = this.entityStats.get(entityId) || new Map();
    return stats.get(stat) || 100; // Default to 100 for most stats
  }

  setEntityStat(entityId: string, stat: TargetStat, value: number): void {
    if (!this.entityStats.has(entityId)) {
      this.entityStats.set(entityId, new Map());
    }
    this.entityStats.get(entityId)?.set(stat, Math.max(0, value));
  }

  hasImmunity(entityId: string, immunityTag: string): boolean {
    const immunities = this.entityImmunities.get(entityId) || [];
    return immunities.includes(immunityTag);
  }

  getEntityImmunities(entityId: string): string[] {
    return this.entityImmunities.get(entityId) || [];
  }

  isEntityAlive(entityId: string): boolean {
    return this.aliveEntities.has(entityId);
  }

  getCurrentPhase(): EffectPhase {
    return this.currentPhase;
  }

  setCurrentPhase(phase: EffectPhase): void {
    this.currentPhase = phase;
  }

  addImmunity(entityId: string, immunityTag: string): void {
    if (!this.entityImmunities.has(entityId)) {
      this.entityImmunities.set(entityId, []);
    }
    const immunities = this.entityImmunities.get(entityId)!;
    if (!immunities.includes(immunityTag)) {
      immunities.push(immunityTag);
    }
  }

  removeImmunity(entityId: string, immunityTag: string): void {
    if (this.entityImmunities.has(entityId)) {
      const immunities = this.entityImmunities.get(entityId)!;
      const index = immunities.indexOf(immunityTag);
      if (index >= 0) {
        immunities.splice(index, 1);
      }
    }
  }

  killEntity(entityId: string): void {
    this.aliveEntities.delete(entityId);
  }

  reviveEntity(entityId: string): void {
    this.aliveEntities.add(entityId);
  }

  setEntityHp(entityId: string, hp: number): void {
    this.setEntityStat(entityId, TargetStat.HP, hp);
  }

  setEntityAtk(entityId: string, atk: number): void {
    this.setEntityStat(entityId, TargetStat.ATK, atk);
  }

  getEntityAtk(entityId: string): number {
    return this.getEntityStat(entityId, TargetStat.ATK);
  }
}

describe('EffectsPure Golden Tests', () => {
  describe('BattleEffect Basic Functionality', () => {
    test('should create effect with default values', () => {
      const effect = new BattleEffect('test_001', 'Test Effect', 'Test description');
      expect(effect.effectId).toBe('test_001');
      expect(effect.name).toBe('Test Effect');
      expect(effect.description).toBe('Test description');
      expect(effect.effectType).toBe(EffectType.STAT_MODIFIER);
      expect(effect.targetStat).toBe(TargetStat.CUSTOM);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(0);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(0);
      expect(effect.stackable).toBe(true);
      expect(effect.maxStacks).toBe(5);
      expect(effect.refreshOnStack).toBe(true);
      expect(effect.triggers).toBe(EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE);
    });

    test('should create stat modifier effect', () => {
      const effect = BattleEffect.statModifier(
        'strength_boost',
        'Strength Boost',
        'Increases attack power',
        TargetStat.ATK,
        ModifierType.FLAT,
        15,
        0,
        3
      );

      expect(effect.effectId).toBe('strength_boost');
      expect(effect.name).toBe('Strength Boost');
      expect(effect.effectType).toBe(EffectType.STAT_MODIFIER);
      expect(effect.targetStat).toBe(TargetStat.ATK);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(15);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(3);
      expect(effect.stackable).toBe(true);
      expect(effect.maxStacks).toBe(5);
      expect(effect.refreshOnStack).toBe(true);
    });

    test('should create damage over time effect', () => {
      const effect = BattleEffect.damageOverTime(
        'poison',
        'Poison',
        'Deals damage over time',
        10,
        0,
        5
      );

      expect(effect.effectId).toBe('poison');
      expect(effect.name).toBe('Poison');
      expect(effect.effectType).toBe(EffectType.DAMAGE_OVER_TIME);
      expect(effect.targetStat).toBe(TargetStat.HP);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(10);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(5);
      expect(effect.stackable).toBe(false);
      expect(effect.maxStacks).toBe(1);
      expect(effect.refreshOnStack).toBe(false);
    });

    test('should create heal effect', () => {
      const effect = BattleEffect.heal(
        'regeneration',
        'Regeneration',
        'Slowly restores health',
        8,
        0,
        10
      );

      expect(effect.effectId).toBe('regeneration');
      expect(effect.name).toBe('Regeneration');
      expect(effect.effectType).toBe(EffectType.HEAL);
      expect(effect.targetStat).toBe(TargetStat.HP);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(8);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(10);
    });

    test('should create stun effect', () => {
      const effect = BattleEffect.stun(
        'stun',
        'Stun',
        'Prevents actions',
        0,
        2
      );

      expect(effect.effectId).toBe('stun');
      expect(effect.name).toBe('Stun');
      expect(effect.effectType).toBe(EffectType.STUN);
      expect(effect.targetStat).toBe(TargetStat.CUSTOM);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(0);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(2);
    });

    test('should create shield effect', () => {
      const effect = BattleEffect.shield(
        'shield',
        'Magic Shield',
        'Absorbs damage',
        25,
        0,
        3
      );

      expect(effect.effectId).toBe('shield');
      expect(effect.name).toBe('Magic Shield');
      expect(effect.effectType).toBe(EffectType.SHIELD);
      expect(effect.targetStat).toBe(TargetStat.HP);
      expect(effect.modifierType).toBe(ModifierType.FLAT);
      expect(effect.value).toBe(25);
      expect(effect.durationSeconds).toBe(0);
      expect(effect.durationTurns).toBe(3);
    });

    test('should check triggers correctly', () => {
      const effect = BattleEffect.create(
        'test',
        'Test',
        'Test',
        EffectType.STAT_MODIFIER,
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        0,
        0,
        true,
        1,
        false,
        EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
      );

      expect(effect.hasTrigger(EffectTrigger.ON_APPLY)).toBe(true);
      expect(effect.hasTrigger(EffectTrigger.ON_REMOVE)).toBe(true);
      expect(effect.hasTrigger(EffectTrigger.ON_TICK)).toBe(false);
      expect(effect.hasTrigger(EffectTrigger.ON_HIT)).toBe(false);
    });

    test('should get effect description correctly', () => {
      const statEffect = BattleEffect.statModifier(
        'atk_boost',
        'Attack Boost',
        'Increases attack',
        TargetStat.ATK,
        ModifierType.PERCENT,
        0.25,
        0,
        0
      );

      const dotEffect = BattleEffect.damageOverTime(
        'poison',
        'Poison',
        'Deals poison damage',
        15,
        0,
        0
      );

      const healEffect = BattleEffect.heal(
        'regen',
        'Regeneration',
        'Restores health',
        10,
        0,
        0
      );

      expect(statEffect.getEffectDescription()).toContain('Attack Boost');
      expect(statEffect.getEffectDescription()).toContain('25%');
      expect(statEffect.getEffectDescription()).toContain('ATK');

      expect(dotEffect.getEffectDescription()).toContain('Poison');
      expect(dotEffect.getEffectDescription()).toContain('15 damage');

      expect(healEffect.getEffectDescription()).toContain('Regeneration');
      expect(healEffect.getEffectDescription()).toContain('10 healing');
    });

    test('should get duration description correctly', () => {
      const timeEffect = new BattleEffect('time', 'Time', 'Time-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 30, 0);
      const turnEffect = new BattleEffect('turn', 'Turn', 'Turn-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 5);
      const permanentEffect = new BattleEffect('perm', 'Permanent', 'Permanent', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0);

      expect(timeEffect.getDurationDescription()).toBe('30s');
      expect(turnEffect.getDurationDescription()).toBe('5 turns');
      expect(permanentEffect.getDurationDescription()).toBe('permanent');
    });

    test('should validate correctly', () => {
      const validEffect = BattleEffect.statModifier('valid', 'Valid', 'Valid effect', TargetStat.ATK, ModifierType.FLAT, 10, 0, 3);
      expect(validEffect.validate()).toHaveLength(0);

      const invalidEffect = new BattleEffect('', '', '', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 1, -5, -3);
      const errors = invalidEffect.validate();
      expect(errors).toContain('Effect ID cannot be empty');
      expect(errors).toContain('Effect name cannot be empty');
      expect(errors).toContain('Effect description cannot be empty');
      expect(errors).toContain('Duration seconds cannot be negative');
      expect(errors).toContain('Duration turns cannot be negative');
    });

    test('should clone correctly', () => {
      const original = BattleEffect.damageOverTime('poison', 'Poison', 'Poison effect', 10, 0, 5);
      const clone = original.clone();

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.effectId).toBe(original.effectId);
      expect(clone.name).toBe(original.name);
      expect(clone.value).toBe(original.value);
    });

    test('should convert to/from JSON correctly', () => {
      const original = BattleEffect.create(
        'custom_effect',
        'Custom Effect',
        'Custom effect description',
        EffectType.STAT_MODIFIER,
        TargetStat.ATK,
        ModifierType.PERCENT,
        0.25,
        30,
        5,
        true,
        3,
        true,
        EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
      );

      const jsonData = original.toJSON();
      const reconstructed = BattleEffect.fromJSON(jsonData);

      expect(reconstructed.effectId).toBe(original.effectId);
      expect(reconstructed.name).toBe(original.name);
      expect(reconstructed.effectType).toBe(original.effectType);
      expect(reconstructed.targetStat).toBe(original.targetStat);
      expect(reconstructed.modifierType).toBe(original.modifierType);
      expect(reconstructed.value).toBe(original.value);
      expect(reconstructed.durationSeconds).toBe(original.durationSeconds);
      expect(reconstructed.durationTurns).toBe(original.durationTurns);
      expect(reconstructed.stackable).toBe(original.stackable);
      expect(reconstructed.maxStacks).toBe(original.maxStacks);
      expect(reconstructed.refreshOnStack).toBe(original.refreshOnStack);
      expect(reconstructed.triggers).toBe(original.triggers);
    });
  });

  describe('ActiveEffect Basic Functionality', () => {
    test('should create active effect with default values', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      expect(activeEffect.effect).toBe(effect);
      expect(activeEffect.entityId).toBe('player');
      expect(activeEffect.stacks).toBe(1);
      expect(activeEffect.remainingSeconds).toBe(0);
      expect(activeEffect.remainingTurns).toBe(0);
      expect(activeEffect.appliedTime).toBeDefined();
      expect(activeEffect.lastTickTime).toBeDefined();
    });

    test('should create active effect with custom values', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10, 60, 5);
      const activeEffect = new ActiveEffect(effect, 'player', 2, 30, 3);

      expect(activeEffect.stacks).toBe(2);
      expect(activeEffect.remainingSeconds).toBe(30);
      expect(activeEffect.remainingTurns).toBe(3);
    });

    test('should check expiration correctly', () => {
      const timeEffect = BattleEffect.create('time', 'Time', 'Time-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 0);
      const turnEffect = BattleEffect.create('turn', 'Turn', 'Turn-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 5);
      const permanentEffect = BattleEffect.create('perm', 'Permanent', 'Permanent', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0);

      const timeActive = new ActiveEffect(timeEffect, 'player', 1, 0, 0);
      const turnActive = new ActiveEffect(turnEffect, 'player', 1, 0, 0);
      const permActive = new ActiveEffect(permanentEffect, 'player', 1, 0, 0);

      expect(timeActive.isExpired()).toBe(true);
      expect(turnActive.isExpired()).toBe(true);
      expect(permActive.isExpired()).toBe(false);
    });

    test('should tick correctly', () => {
      const effect = BattleEffect.create('time', 'Time', 'Time-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 0);
      const activeEffect = new ActiveEffect(effect, 'player', 1, 10, 0);

      expect(activeEffect.remainingSeconds).toBe(10);

      activeEffect.tick(2.5);
      expect(activeEffect.remainingSeconds).toBe(7.5);

      activeEffect.tick(3.0);
      expect(activeEffect.remainingSeconds).toBe(4.5);
    });

    test('should advance turns correctly', () => {
      const effect = BattleEffect.create('turn', 'Turn', 'Turn-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 5);
      const activeEffect = new ActiveEffect(effect, 'player', 1, 0, 5);

      expect(activeEffect.remainingTurns).toBe(5);

      activeEffect.advanceTurn();
      expect(activeEffect.remainingTurns).toBe(4);

      activeEffect.advanceTurn();
      activeEffect.advanceTurn();
      expect(activeEffect.remainingTurns).toBe(2);
    });

    test('should handle stacking correctly', () => {
      const effect = BattleEffect.create('stackable', 'Stackable', 'Stackable effect', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0, true, 3);
      const activeEffect = new ActiveEffect(effect, 'player', 1, 0, 0);

      expect(activeEffect.canStack()).toBe(true);
      expect(activeEffect.stacks).toBe(1);

      expect(activeEffect.addStack()).toBe(true);
      expect(activeEffect.stacks).toBe(2);

      expect(activeEffect.addStack()).toBe(true);
      expect(activeEffect.stacks).toBe(3);

      expect(activeEffect.canStack()).toBe(false); // Max stacks reached

      expect(activeEffect.addStack()).toBe(false); // Should not stack
      expect(activeEffect.stacks).toBe(3);

      expect(activeEffect.removeStack()).toBe(2);
      expect(activeEffect.canStack()).toBe(true);
    });

    test('should refresh duration on stack', () => {
      const effect = BattleEffect.create('refresh', 'Refresh', 'Refreshes on stack', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 5, true, 3, true);
      const activeEffect = new ActiveEffect(effect, 'player', 1, 5, 2); // 5 seconds, 2 turns remaining

      activeEffect.addStack();

      expect(activeEffect.stacks).toBe(2);
      expect(activeEffect.remainingSeconds).toBe(10); // Refreshed
      expect(activeEffect.remainingTurns).toBe(5);   // Refreshed
    });

    test('should calculate duration percentage correctly', () => {
      const timeEffect = BattleEffect.create('time', 'Time', 'Time-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 0);
      const timeActive = new ActiveEffect(timeEffect, 'player', 1, 10, 0);
      timeActive.tick(4);
      expect(timeActive.getDurationPercentage()).toBe(0.6); // 6/10 remaining

      const turnEffect = BattleEffect.create('turn', 'Turn', 'Turn-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 5);
      const turnActive = new ActiveEffect(turnEffect, 'player', 1, 0, 5);
      turnActive.advanceTurn();
      expect(turnActive.getDurationPercentage()).toBe(0.8); // 4/5 remaining

      const permanentEffect = BattleEffect.create('perm', 'Permanent', 'Permanent', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0);
      const permActive = new ActiveEffect(permanentEffect, 'player', 1, 0, 0);
      expect(permActive.getDurationPercentage()).toBe(1); // Permanent
    });

    test('should get summary correctly', () => {
      const effect = BattleEffect.create('test', 'Test Effect', 'Test', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 5);
      const activeEffect = new ActiveEffect(effect, 'player', 2, 5, 2);

      const summary = activeEffect.getSummary();
      expect(summary).toContain('Test Effect');
      expect(summary).toContain('x2');
    });

    test('should clone correctly', () => {
      const effect = BattleEffect.create('test', 'Test', 'Test', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 5);
      const original = new ActiveEffect(effect, 'player', 2, 8, 3);

      const clone = original.clone();
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.effect).toEqual(original.effect);
      expect(clone.effect).not.toBe(original.effect);
      expect(clone.stacks).toBe(original.stacks);
      expect(clone.remainingSeconds).toBe(original.remainingSeconds);
      expect(clone.remainingTurns).toBe(original.remainingTurns);
    });
  });

  describe('StatModifierAggregator Basic Functionality', () => {
    test('should create aggregator with default values', () => {
      const aggregator = new StatModifierAggregator();
      expect(aggregator.getAdditiveModifiers()).toHaveLength(0);
      expect(aggregator.getMultiplicativeModifiers()).toHaveLength(0);
    });

    test('should add modifiers correctly', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, 10, false);        // +10 additive flat
      aggregator.add(ModifierType.PERCENT, 0.25, false);   // +25% additive percent
      aggregator.add(ModifierType.FLAT, 5, true);         // +5 multiplicative flat
      aggregator.add(ModifierType.PERCENT, 0.15, true);    // +15% multiplicative percent

      const additive = aggregator.getAdditiveModifiers();
      const multiplicative = aggregator.getMultiplicativeModifiers();

      expect(additive).toHaveLength(2);
      expect(multiplicative).toHaveLength(2);

      expect(additive.some(m => m.type === ModifierType.FLAT && m.value === 10)).toBe(true);
      expect(additive.some(m => m.type === ModifierType.PERCENT && m.value === 0.25)).toBe(true);
      expect(multiplicative.some(m => m.type === ModifierType.FLAT && m.value === 5)).toBe(true);
      expect(multiplicative.some(m => m.type === ModifierType.PERCENT && m.value === 0.15)).toBe(true);
    });

    test('should apply modifiers correctly', () => {
      const aggregator = new StatModifierAggregator();

      // Base value: 100
      // Additive: +10 flat, +25% = 100 + 10 = 110, * 1.25 = 137.5
      // Multiplicative: +5 flat, +15% = 137.5 + 5 = 142.5, * 1.15 = 163.875
      aggregator.add(ModifierType.FLAT, 10, false);
      aggregator.add(ModifierType.PERCENT, 0.25, false);
      aggregator.add(ModifierType.FLAT, 5, true);
      aggregator.add(ModifierType.PERCENT, 0.15, true);

      const result = aggregator.apply(100);
      expect(result).toBeCloseTo(163.875, 1);
    });

    test('should handle only additive modifiers', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, 20, false);
      aggregator.add(ModifierType.PERCENT, 0.5, false);

      const result = aggregator.apply(100);
      expect(result).toBeCloseTo(180, 1); // 100 + 20 = 120, then 120 * (1 + 0.5) = 180
    });

    test('should handle only multiplicative modifiers', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, 30, true);
      aggregator.add(ModifierType.PERCENT, 0.2, true);

      const result = aggregator.apply(100);
      expect(result).toBeCloseTo(156, 1); // 100 + 30 = 130, then 130 * (1 + 0.2) = 156
    });

    test('should handle negative modifiers', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, -10, false);
      aggregator.add(ModifierType.PERCENT, -0.25, false);
      aggregator.add(ModifierType.FLAT, 5, true);
      aggregator.add(ModifierType.PERCENT, -0.1, true);

      const result = aggregator.apply(100);
      expect(result).toBeCloseTo(65.25, 1); // Let me calculate step by step:
      // 100 + (-10) = 90
      // 90 * (1 + (-0.25)) = 90 * 0.75 = 67.5
      // 67.5 + 5 = 72.5
      // 72.5 * (1 + (-0.1)) = 72.5 * 0.9 = 65.25
    });

    test('should ensure non-negative result', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, -150, false); // Would reduce to -50
      aggregator.add(ModifierType.PERCENT, -1.0, false); // Would reduce to 0

      const result = aggregator.apply(100);
      expect(result).toBe(0); // Should not go below 0
    });

    test('should clear correctly', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, 10, false);
      aggregator.add(ModifierType.PERCENT, 0.25, true);

      expect(aggregator.getAdditiveModifiers()).toHaveLength(1);
      expect(aggregator.getMultiplicativeModifiers()).toHaveLength(1);

      aggregator.clear();

      expect(aggregator.getAdditiveModifiers()).toHaveLength(0);
      expect(aggregator.getMultiplicativeModifiers()).toHaveLength(0);
    });

    test('should get total additive and multiplicative correctly', () => {
      const aggregator = new StatModifierAggregator();

      aggregator.add(ModifierType.FLAT, 10, false);
      aggregator.add(ModifierType.FLAT, -5, false);
      aggregator.add(ModifierType.PERCENT, 0.25, false);
      aggregator.add(ModifierType.PERCENT, -0.1, false);

      aggregator.add(ModifierType.FLAT, 15, true);
      aggregator.add(ModifierType.PERCENT, 0.2, true);

      const totalAdditive = aggregator.getTotalAdditive();
      const totalMultiplicative = aggregator.getTotalMultiplicative();

      expect(totalAdditive).toBe(5); // 10 - 5 = flat additive values only
      expect(totalMultiplicative).toBe(1.2); // 1 * 1.2 = multiplicative percent only
    });

    test('should clone correctly', () => {
      const original = new StatModifierAggregator();

      original.add(ModifierType.FLAT, 10, false);
      original.add(ModifierType.PERCENT, 0.25, true);

      const clone = original.clone();

      expect(clone.getAdditiveModifiers()).toHaveLength(1);
      expect(clone.getMultiplicativeModifiers()).toHaveLength(1);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);

      // Modifying clone should not affect original
      clone.add(ModifierType.FLAT, 5, false);
      expect(original.getAdditiveModifiers()).toHaveLength(1);
      expect(clone.getAdditiveModifiers()).toHaveLength(2);
    });
  });

  describe('EffectEvent Basic Functionality', () => {
    test('should create applied event', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const event = EffectEvent.applied('player', effect, activeEffect, EffectPhase.PRE_TURN);

      expect(event.type).toBe('applied');
      expect(event.entityId).toBe('player');
      expect(event.effect).toBe(effect);
      expect(event.activeEffect).toBe(activeEffect);
      expect(event.phase).toBe(EffectPhase.PRE_TURN);
      expect(event.timestamp).toBeDefined();
    });

    test('should create refreshed event', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const event = EffectEvent.refreshed('player', effect, activeEffect, EffectPhase.SELECT_ACTION);

      expect(event.type).toBe('refreshed');
      expect(event.entityId).toBe('player');
      expect(event.phase).toBe(EffectPhase.SELECT_ACTION);
    });

    test('should create expired event', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const event = EffectEvent.expired('player', effect, activeEffect, EffectPhase.END_TURN);

      expect(event.type).toBe('expired');
      expect(event.entityId).toBe('player');
      expect(event.phase).toBe(EffectPhase.END_TURN);
    });

    test('should create removed event', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const event = EffectEvent.removed('player', effect, activeEffect, EffectPhase.RESOLVE_ACTION);

      expect(event.type).toBe('removed');
      expect(event.entityId).toBe('player');
      expect(event.phase).toBe(EffectPhase.RESOLVE_ACTION);
    });

    test('should create tick event', () => {
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const event = EffectEvent.tick('player', effect, activeEffect, EffectPhase.PRE_TURN);

      expect(event.type).toBe('tick');
      expect(event.entityId).toBe('player');
      expect(event.phase).toBe(EffectPhase.PRE_TURN);
    });
  });

  describe('EffectResolution Basic Functionality', () => {
    test('should create resolution with default values', () => {
      const resolution = EffectResolution.create();

      expect(resolution.resolvedEffects).toHaveLength(0);
      expect(resolution.appliedEffects).toHaveLength(0);
      expect(resolution.expiredEffects).toHaveLength(0);
      expect(resolution.statChanges.size).toBe(0);
      expect(resolution.events).toHaveLength(0);
      expect(resolution.shouldContinue).toBe(true);
    });

    test('should add resolved effects', () => {
      const resolution = EffectResolution.create();
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      resolution.addResolvedEffect(activeEffect);

      expect(resolution.resolvedEffects).toHaveLength(1);
      expect(resolution.resolvedEffects[0]).toBe(activeEffect);
    });

    test('should add applied effects', () => {
      const resolution = EffectResolution.create();
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      resolution.addAppliedEffect(activeEffect, EffectApplicationResult.APPLIED);

      expect(resolution.appliedEffects).toHaveLength(1);
      expect(resolution.appliedEffects[0].effect).toBe(activeEffect);
      expect(resolution.appliedEffects[0].result).toBe(EffectApplicationResult.APPLIED);
    });

    test('should add expired effects', () => {
      const resolution = EffectResolution.create();
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      resolution.addExpiredEffect(activeEffect, EffectRemovalReason.EXPIRED);

      expect(resolution.expiredEffects).toHaveLength(1);
      expect(resolution.expiredEffects[0].effect).toBe(activeEffect);
      expect(resolution.expiredEffects[0].reason).toBe(EffectRemovalReason.EXPIRED);
    });

    test('should add stat changes', () => {
      const resolution = EffectResolution.create();

      resolution.addStatChange(TargetStat.ATK, 15);
      resolution.addStatChange(TargetStat.DEF, -5);
      resolution.addStatChange(TargetStat.ATK, 10); // Should accumulate

      expect(resolution.statChanges.get(TargetStat.ATK)).toBe(25);
      expect(resolution.statChanges.get(TargetStat.DEF)).toBe(-5);
    });

    test('should add events', () => {
      const resolution = EffectResolution.create();
      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');
      const event = EffectEvent.applied('player', effect, activeEffect, EffectPhase.PRE_TURN);

      resolution.addEvent(event);

      expect(resolution.events).toHaveLength(1);
      expect(resolution.events[0]).toBe(event);
    });

    test('should get total stat changes', () => {
      const resolution = EffectResolution.create();

      resolution.addStatChange(TargetStat.ATK, 15);
      resolution.addStatChange(TargetStat.DEF, -5);
      resolution.addStatChange(TargetStat.HP, 25);

      const totalChanges = resolution.getTotalStatChanges();

      expect(totalChanges[TargetStat.ATK]).toBe(15);
      expect(totalChanges[TargetStat.DEF]).toBe(-5);
      expect(totalChanges[TargetStat.HP]).toBe(25);
    });

    test('should check effect status', () => {
      const resolution = EffectResolution.create();

      expect(resolution.hasAppliedEffects()).toBe(false);
      expect(resolution.hasExpiredEffects()).toBe(false);

      const effect = BattleEffect.statModifier('test', 'Test', 'Test', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      resolution.addAppliedEffect(activeEffect, EffectApplicationResult.APPLIED);
      resolution.addExpiredEffect(activeEffect, EffectRemovalReason.EXPIRED);

      expect(resolution.hasAppliedEffects()).toBe(true);
      expect(resolution.hasExpiredEffects()).toBe(true);
      expect(resolution.getAppliedCount()).toBe(1);
      expect(resolution.getExpiredCount()).toBe(1);
    });
  });

  describe('EffectResolver Basic Functionality', () => {
    let effectResolver: EffectResolver;
    let entityContext: MockEntityContext;

    beforeEach(() => {
      effectResolver = new EffectResolver();
      entityContext = new MockEntityContext();
    });

    test('should create resolver', () => {
      expect(effectResolver).toBeDefined();
    });

    test('should resolve queue correctly', () => {
      const effect1 = BattleEffect.statModifier('boost1', 'Boost 1', 'First boost', TargetStat.ATK, ModifierType.FLAT, 10);
      const effect2 = BattleEffect.statModifier('boost2', 'Boost 2', 'Second boost', TargetStat.ATK, ModifierType.FLAT, 15);
      const effect3 = BattleEffect.statModifier('debuff', 'Debuff', 'Attack debuff', TargetStat.ATK, ModifierType.FLAT, -5);

      const activeEffect1 = new ActiveEffect(effect1, 'player');
      const activeEffect2 = new ActiveEffect(effect2, 'player');
      const activeEffect3 = new ActiveEffect(effect3, 'player');

      const effects = [activeEffect1, activeEffect2, activeEffect3];
      const resolvedEffects = effectResolver.resolveQueue(EffectPhase.PRE_TURN, effects, []);

      expect(resolvedEffects).toHaveLength(3);
      expect(resolvedEffects).toContain(activeEffect1);
      expect(resolvedEffects).toContain(activeEffect2);
      expect(resolvedEffects).toContain(activeEffect3);
    });

    test('should handle immunity correctly', () => {
      entityContext.addImmunity('player', 'fire_immune');

      const fireEffect = BattleEffect.damageOverTime('fire_damage', 'Fire Damage', 'Burns over time', 10);
      const poisonEffect = BattleEffect.damageOverTime('poison', 'Poison', 'Poison damage', 5);

      const fireActive = new ActiveEffect(fireEffect, 'player');
      const poisonActive = new ActiveEffect(poisonEffect, 'player');

      const effects = [fireActive, poisonActive];
      const resolvedEffects = effectResolver.resolveQueue(EffectPhase.PRE_TURN, effects, ['fire_immune']);

      expect(resolvedEffects).toHaveLength(1);
      expect(resolvedEffects[0]).toBe(poisonActive); // Fire effect should be filtered out due to immunity
    });

    test('should handle cleanse effects', () => {
      const cleanseEffect = BattleEffect.create('cleanse', 'Cleanse', 'Removes debuffs', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0);
      const debuffEffect = BattleEffect.statModifier('debuff', 'Debuff', 'Attack debuff', TargetStat.ATK, ModifierType.FLAT, -10);
      const buffEffect = BattleEffect.statModifier('buff', 'Buff', 'Attack buff', TargetStat.ATK, ModifierType.FLAT, 10);

      const cleanseActive = new ActiveEffect(cleanseEffect, 'player');
      const debuffActive = new ActiveEffect(debuffEffect, 'player');
      const buffActive = new ActiveEffect(buffEffect, 'player');

      const effects = [cleanseActive, debuffActive, buffActive];
      const resolvedEffects = effectResolver.resolveQueue(EffectPhase.END_TURN, effects, []);

      expect(resolvedEffects).toHaveLength(2);
      expect(resolvedEffects).toContain(cleanseActive);
      expect(resolvedEffects).toContain(buffActive);
      expect(resolvedEffects).not.toContain(debuffActive); // Should be cleansed
    });

    test('should resolve effect overwrites', () => {
      const effect1 = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10);
      const effect2 = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 15); // Same ID, higher value
      const effect3 = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 5);  // Same ID, lower value

      const activeEffect1 = new ActiveEffect(effect1, 'player');
      const activeEffect2 = new ActiveEffect(effect2, 'player');
      const activeEffect3 = new ActiveEffect(effect3, 'player');

      const effects = [activeEffect1, activeEffect2, activeEffect3];
      const resolvedEffects = effectResolver.resolveQueue(EffectPhase.PRE_TURN, effects, []);

      // Should keep only the effect with highest absolute value
      expect(resolvedEffects).toHaveLength(1);
      expect(resolvedEffects[0].effect.value).toBe(15);
    });

    test('should resolve effects with context', () => {
      const effect = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10);
      const activeEffect = new ActiveEffect(effect, 'player');

      const resolution = effectResolver.resolveEffects(EffectPhase.PRE_TURN, 'player', [activeEffect], entityContext);

      expect(resolution.resolvedEffects).toHaveLength(1);
      expect(resolution.statChanges.has(TargetStat.ATK)).toBe(true);
      expect(resolution.statChanges.get(TargetStat.ATK)).toBe(10);
      expect(resolution.events).toHaveLength(1);
      expect(resolution.events[0].type).toBe('tick');
    });
  });

  describe('EffectManager Basic Functionality', () => {
    let effectManager: EffectManager;
    let entityContext: MockEntityContext;

    beforeEach(() => {
      effectManager = new EffectManager();
      entityContext = new MockEntityContext();
    });

    test('should create manager', () => {
      expect(effectManager).toBeDefined();
      expect(effectManager.getTotalEffectCount()).toBe(0);
    });

    test('should apply effects correctly', () => {
      const effect = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10);

      const result = effectManager.applyEffect('player', effect);

      expect(result).toBe(EffectApplicationResult.APPLIED);
      expect(effectManager.getEffectCount('player')).toBe(1);
      expect(effectManager.hasEffect('player', 'boost')).toBe(true);
      expect(effectManager.getActiveEffects('player')).toHaveLength(1);
    });

    test('should handle effect stacking', () => {
      const effect = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10, 0, 0, true, 3);

      // Apply first effect
      const result1 = effectManager.applyEffect('player', effect);
      expect(result1).toBe(EffectApplicationResult.APPLIED);

      // Apply second effect (should stack)
      const result2 = effectManager.applyEffect('player', effect);
      expect(result2).toBe(EffectApplicationResult.REFRESHED);

      const effects = effectManager.getActiveEffects('player');
      expect(effects).toHaveLength(1);
      expect(effects[0].stacks).toBe(2);
    });

    test('should reject non-stackable effects', () => {
      const effect = BattleEffect.statModifier('unique', 'Unique', 'Unique effect', TargetStat.ATK, ModifierType.FLAT, 10, 0, 0, false, 1);

      // Apply first effect
      const result1 = effectManager.applyEffect('player', effect);
      expect(result1).toBe(EffectApplicationResult.APPLIED);

      // Try to apply second effect (should be rejected)
      const result2 = effectManager.applyEffect('player', effect);
      expect(result2).toBe(EffectApplicationResult.REJECTED);

      expect(effectManager.getEffectCount('player')).toBe(1);
    });

    test('should remove effects correctly', () => {
      const effect = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10);

      effectManager.applyEffect('player', effect);
      expect(effectManager.hasEffect('player', 'boost')).toBe(true);

      const removed = effectManager.removeEffect('player', 'boost');
      expect(removed).toBe(true);
      expect(effectManager.hasEffect('player', 'boost')).toBe(false);
      expect(effectManager.getEffectCount('player')).toBe(0);
    });

    test('should handle multiple entities', () => {
      const effect1 = BattleEffect.statModifier('boost1', 'Boost 1', 'First boost', TargetStat.ATK, ModifierType.FLAT, 10);
      const effect2 = BattleEffect.statModifier('boost2', 'Boost 2', 'Second boost', TargetStat.DEF, ModifierType.FLAT, 5);

      effectManager.applyEffect('player', effect1);
      effectManager.applyEffect('enemy', effect2);

      expect(effectManager.getEffectCount('player')).toBe(1);
      expect(effectManager.getEffectCount('enemy')).toBe(1);
      expect(effectManager.getTotalEffectCount()).toBe(2);

      expect(effectManager.getEffectsByType('player', EffectType.STAT_MODIFIER)).toHaveLength(1);
      expect(effectManager.getEffectsByType('enemy', EffectType.STAT_MODIFIER)).toHaveLength(1);
    });

    test('should update effects correctly', () => {
      const effect = BattleEffect.damageOverTime('poison', 'Poison', 'Poison damage', 10, 0, 5);
      effectManager.applyEffect('player', effect);

      const resolution = effectManager.updateEffects(1.0, entityContext);

      expect(resolution.resolvedEffects).toHaveLength(1);
      expect(resolution.events).toHaveLength(1);
      expect(resolution.events[0].type).toBe('tick');
      expect(resolution.statChanges.has(TargetStat.HP)).toBe(true);
      expect(resolution.statChanges.get(TargetStat.HP)).toBe(-10);
    });

    test('should clear effects correctly', () => {
      const effect1 = BattleEffect.statModifier('boost', 'Boost', 'Attack boost', TargetStat.ATK, ModifierType.FLAT, 10);
      const effect2 = BattleEffect.statModifier('debuff', 'Debuff', 'Defense debuff', TargetStat.DEF, ModifierType.FLAT, -5);

      effectManager.applyEffect('player', effect1);
      effectManager.applyEffect('player', effect2);
      effectManager.applyEffect('enemy', effect1);

      expect(effectManager.getEffectCount('player')).toBe(2);
      expect(effectManager.getEffectCount('enemy')).toBe(1);

      effectManager.clearEffects('player');

      expect(effectManager.getEffectCount('player')).toBe(0);
      expect(effectManager.getEffectCount('enemy')).toBe(1);

      effectManager.clearAllEffects();

      expect(effectManager.getEffectCount('player')).toBe(0);
      expect(effectManager.getEffectCount('enemy')).toBe(0);
      expect(effectManager.getTotalEffectCount()).toBe(0);
    });
  });

  describe('EffectUtils Basic Functionality', () => {
    test('should create default entity context', () => {
      const context = EffectUtils.createDefaultEntityContext();

      expect(context.getEntityStat('player', TargetStat.HP)).toBe(100);
      expect(context.getEntityStat('player', TargetStat.ATK)).toBe(100);
      expect(context.hasImmunity('player', 'test')).toBe(false);
      expect(context.getEntityImmunities('player')).toHaveLength(0);
      expect(context.isEntityAlive('player')).toBe(true);
      expect(context.getCurrentPhase()).toBe(EffectPhase.PRE_TURN);
    });

    test('should validate battle effects', () => {
      const validEffect = BattleEffect.statModifier('valid', 'Valid', 'Valid effect', TargetStat.ATK, ModifierType.FLAT, 10);
      expect(EffectUtils.validateBattleEffect(validEffect)).toHaveLength(0);

      const invalidEffect = new BattleEffect('', '', '', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, -5, -3);
      const errors = EffectUtils.validateBattleEffect(invalidEffect);
      expect(errors).toContain('Effect ID cannot be empty');
      expect(errors).toContain('Effect name cannot be empty');
      expect(errors).toContain('Effect description cannot be empty');
      expect(errors).toContain('Duration seconds cannot be negative');
      expect(errors).toContain('Duration turns cannot be negative');
    });

    test('should create stat modifier aggregator', () => {
      const aggregator = EffectUtils.createStatModifierAggregator();

      expect(aggregator.getAdditiveModifiers()).toHaveLength(0);
      expect(aggregator.getMultiplicativeModifiers()).toHaveLength(0);

      aggregator.add(ModifierType.FLAT, 10, false);
      expect(aggregator.getAdditiveModifiers()).toHaveLength(1);
    });

    test('should calculate effect duration', () => {
      const timeEffect = BattleEffect.create('time', 'Time', 'Time-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 10, 0);
      const turnEffect = BattleEffect.create('turn', 'Turn', 'Turn-based', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 5);
      const permanentEffect = BattleEffect.create('perm', 'Permanent', 'Permanent', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0);

      expect(EffectUtils.calculateEffectDuration(timeEffect)).toBe(10000); // 10 seconds * 1000
      expect(EffectUtils.calculateEffectDuration(turnEffect)).toBe(10000); // 5 turns * 2000ms per turn
      expect(EffectUtils.calculateEffectDuration(permanentEffect)).toBe(0); // Permanent
    });

    test('should check phase triggers', () => {
      const effect = BattleEffect.create('test', 'Test', 'Test', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0, 0, 0, false, 1, false, EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE);

      expect(EffectUtils.shouldTriggerOnPhase(effect, EffectPhase.PRE_TURN)).toBe(true);
      expect(EffectUtils.shouldTriggerOnPhase(effect, EffectPhase.SELECT_ACTION)).toBe(false);
      expect(EffectUtils.shouldTriggerOnPhase(effect, EffectPhase.RESOLVE_ACTION)).toBe(false);
      expect(EffectUtils.shouldTriggerOnPhase(effect, EffectPhase.END_TURN)).toBe(true);
    });

    test('should get effect priority', () => {
      const stunEffect = BattleEffect.stun('stun', 'Stun', 'Stun effect', 0, 2);
      const shieldEffect = BattleEffect.shield('shield', 'Shield', 'Shield effect', 25, 0, 3);
      const healEffect = BattleEffect.heal('heal', 'Heal', 'Heal effect', 10, 0, 5);
      const dotEffect = BattleEffect.damageOverTime('dot', 'DoT', 'Damage over time', 5, 0, 10);
      const statEffect = BattleEffect.statModifier('stat', 'Stat', 'Stat modifier', TargetStat.ATK, ModifierType.FLAT, 10);
      const customEffect = BattleEffect.create('custom', 'Custom', 'Custom effect', EffectType.CUSTOM, TargetStat.CUSTOM, ModifierType.FLAT, 0);

      expect(EffectUtils.getEffectPriority(stunEffect)).toBe(100); // Highest
      expect(EffectUtils.getEffectPriority(shieldEffect)).toBe(90);
      expect(EffectUtils.getEffectPriority(healEffect)).toBe(80);
      expect(EffectUtils.getEffectPriority(dotEffect)).toBe(70);
      expect(EffectUtils.getEffectPriority(statEffect)).toBe(50);
      expect(EffectUtils.getEffectPriority(customEffect)).toBe(25); // Lowest
    });

    test('should sort effects by priority', () => {
      const effects = [
        new ActiveEffect(BattleEffect.statModifier('low', 'Low', 'Low priority', TargetStat.ATK, ModifierType.FLAT, 10), 'player'),
        new ActiveEffect(BattleEffect.stun('high', 'High', 'High priority', 0, 2), 'player'),
        new ActiveEffect(BattleEffect.heal('medium', 'Medium', 'Medium priority', 10), 'player')
      ];

      const sorted = EffectUtils.sortEffectsByPriority(effects);

      expect(sorted[0].effect.name).toBe('High'); // Stun - highest priority
      expect(sorted[1].effect.name).toBe('Medium'); // Heal - medium priority
      expect(sorted[2].effect.name).toBe('Low'); // Stat modifier - lowest priority
    });

    test('should filter effects by type', () => {
      const effects = [
        new ActiveEffect(BattleEffect.statModifier('stat', 'Stat', 'Stat effect', TargetStat.ATK, ModifierType.FLAT, 10), 'player'),
        new ActiveEffect(BattleEffect.damageOverTime('dot', 'DoT', 'DoT effect', 5), 'player'),
        new ActiveEffect(BattleEffect.heal('heal', 'Heal', 'Heal effect', 10), 'player'),
        new ActiveEffect(BattleEffect.statModifier('stat2', 'Stat2', 'Another stat effect', TargetStat.DEF, ModifierType.FLAT, 5), 'player')
      ];

      const statEffects = EffectUtils.filterEffectsByType(effects, EffectType.STAT_MODIFIER);
      const dotEffects = EffectUtils.filterEffectsByType(effects, EffectType.DAMAGE_OVER_TIME);
      const healEffects = EffectUtils.filterEffectsByType(effects, EffectType.HEAL);

      expect(statEffects).toHaveLength(2);
      expect(dotEffects).toHaveLength(1);
      expect(healEffects).toHaveLength(1);
    });

    test('should filter effects by stat', () => {
      const effects = [
        new ActiveEffect(BattleEffect.statModifier('atk', 'ATK Boost', 'ATK boost', TargetStat.ATK, ModifierType.FLAT, 10), 'player'),
        new ActiveEffect(BattleEffect.statModifier('def', 'DEF Boost', 'DEF boost', TargetStat.DEF, ModifierType.FLAT, 5), 'player'),
        new ActiveEffect(BattleEffect.statModifier('spd', 'SPD Boost', 'SPD boost', TargetStat.SPD, ModifierType.FLAT, 8), 'player'),
        new ActiveEffect(BattleEffect.heal('heal', 'Heal', 'Heal effect', 10), 'player')
      ];

      const atkEffects = EffectUtils.filterEffectsByStat(effects, TargetStat.ATK);
      const defEffects = EffectUtils.filterEffectsByStat(effects, TargetStat.DEF);
      const spdEffects = EffectUtils.filterEffectsByStat(effects, TargetStat.SPD);

      expect(atkEffects).toHaveLength(1);
      expect(defEffects).toHaveLength(1);
      expect(spdEffects).toHaveLength(1);
    });

    test('should get stat modifying effects', () => {
      const effects = [
        new ActiveEffect(BattleEffect.statModifier('stat1', 'Stat 1', 'Stat effect 1', TargetStat.ATK, ModifierType.FLAT, 10), 'player'),
        new ActiveEffect(BattleEffect.damageOverTime('dot', 'DoT', 'DoT effect', 5), 'player'),
        new ActiveEffect(BattleEffect.statModifier('stat2', 'Stat 2', 'Stat effect 2', TargetStat.DEF, ModifierType.FLAT, 5), 'player'),
        new ActiveEffect(BattleEffect.heal('heal', 'Heal', 'Heal effect', 10), 'player')
      ];

      const statEffects = EffectUtils.getStatModifyingEffects(effects);

      expect(statEffects).toHaveLength(2);
      expect(statEffects[0].effect.effectType).toBe(EffectType.STAT_MODIFIER);
      expect(statEffects[1].effect.effectType).toBe(EffectType.STAT_MODIFIER);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete effect workflow', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();

      // Set up initial stats
      entityContext.setEntityHp('player', 100);
      entityContext.setEntityAtk('player', 50);
      entityContext.setEntityStat('player', TargetStat.DEF, 30);
      entityContext.setEntityStat('player', TargetStat.SPD, 40);

      // Create various effects
      const strengthBoost = BattleEffect.statModifier(
        'strength_boost',
        'Strength Boost',
        'Increases attack power',
        TargetStat.ATK,
        ModifierType.FLAT,
        15,
        0,
        3
      );

      const defenseBoost = BattleEffect.statModifier(
        'defense_boost',
        'Defense Boost',
        'Increases defense',
        TargetStat.DEF,
        ModifierType.PERCENT,
        0.25,
        0,
        2
      );

      const poison = BattleEffect.damageOverTime(
        'poison',
        'Poison',
        'Deals damage over time',
        10,
        0,
        5
      );

      const regeneration = BattleEffect.heal(
        'regeneration',
        'Regeneration',
        'Slowly restores health',
        5,
        0,
        10
      );

      // Apply effects
      expect(effectManager.applyEffect('player', strengthBoost)).toBe(EffectApplicationResult.APPLIED);
      expect(effectManager.applyEffect('player', defenseBoost)).toBe(EffectApplicationResult.APPLIED);
      expect(effectManager.applyEffect('enemy', poison)).toBe(EffectApplicationResult.APPLIED);
      expect(effectManager.applyEffect('enemy', regeneration)).toBe(EffectApplicationResult.APPLIED);

      expect(effectManager.getEffectCount('player')).toBe(2);
      expect(effectManager.getEffectCount('enemy')).toBe(2);

      // Update effects (simulate game loop)
      const resolution = effectManager.updateEffects(1.0, entityContext);

      expect(resolution.resolvedEffects).toHaveLength(4);
      expect(resolution.statChanges.has(TargetStat.ATK)).toBe(true);
      expect(resolution.statChanges.has(TargetStat.DEF)).toBe(true);
      expect(resolution.statChanges.has(TargetStat.HP)).toBe(true);
      expect(resolution.statChanges.get(TargetStat.ATK)).toBe(15);
      expect(resolution.statChanges.get(TargetStat.DEF)).toBe(7.5); // 25% of 30
      expect(resolution.statChanges.get(TargetStat.HP)).toBe(-5); // Poison damage - heal

      // Check stat changes applied
      expect(entityContext.getEntityAtk('player')).toBe(65); // 50 + 15
      expect(entityContext.getEntityStat('player', TargetStat.DEF)).toBe(37.5); // 30 * 1.25
    });

    test('should handle effect stacking and refresh', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();

      const stackableEffect = BattleEffect.statModifier(
        'might',
        'Might',
        'Increases all damage',
        TargetStat.ATK,
        ModifierType.PERCENT,
        0.1, // +10% per stack
        0,
        0,
        true, // stackable
        5     // max 5 stacks
      );

      // Apply multiple stacks
      expect(effectManager.applyEffect('player', stackableEffect)).toBe(EffectApplicationResult.APPLIED);
      expect(effectManager.applyEffect('player', stackableEffect)).toBe(EffectApplicationResult.REFRESHED);
      expect(effectManager.applyEffect('player', stackableEffect)).toBe(EffectApplicationResult.REFRESHED);

      const effects = effectManager.getActiveEffects('player');
      expect(effects).toHaveLength(1);
      expect(effects[0].stacks).toBe(3);

      // Update effects
      const resolution = effectManager.updateEffects(1.0, entityContext);
      expect(resolution.statChanges.has(TargetStat.ATK)).toBe(true);
      expect(resolution.statChanges.get(TargetStat.ATK)).toBe(30); // 10% * 3 stacks = 30%
    });

    test('should handle effect immunity', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();

      entityContext.addImmunity('player', 'fire_immune');

      const fireEffect = BattleEffect.damageOverTime(
        'fire_damage',
        'Fire Damage',
        'Burns over time',
        5 // damagePerTick
      );

      const poisonEffect = BattleEffect.damageOverTime(
        'poison',
        'Poison',
        'Deals poison damage',
        3 // damagePerTick
      );

      // Apply both effects
      effectManager.applyEffect('player', fireEffect);
      effectManager.applyEffect('player', poisonEffect);

      // Update effects
      const resolution = effectManager.updateEffects(1.0, entityContext);

      // Should only process poison (fire should be immune)
      expect(resolution.statChanges.has(TargetStat.HP)).toBe(true);
      expect(resolution.statChanges.get(TargetStat.HP)).toBe(-5); // Only poison damage
    });

    test('should handle complex stat calculations', () => {
      const aggregator = new StatModifierAggregator();

      // Complex stat calculation
      aggregator.add(ModifierType.FLAT, 20, false);        // +20
      aggregator.add(ModifierType.PERCENT, 0.5, false);    // +50%
      aggregator.add(ModifierType.FLAT, 10, true);        // +10
      aggregator.add(ModifierType.PERCENT, 0.25, true);    // +25%

      const baseValue = 100;
      const result = aggregator.apply(baseValue);

      // Calculation: 100 + 20 = 120, * 1.5 = 180, + 10 = 190, * 1.25 = 237.5
      expect(result).toBeCloseTo(237.5, 1);
    });

    test('should handle effect resolution with multiple phases', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();

      const preTurnEffect = BattleEffect.statModifier(
        'pre_turn_boost',
        'Pre-turn Boost',
        'Boosts at start of turn',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        0,
        0,
        false,
        1
      );

      const endTurnEffect = BattleEffect.heal(
        'end_turn_heal',
        'End-turn Heal',
        'Heals at end of turn',
        15
      );

      effectManager.applyEffect('player', preTurnEffect);
      effectManager.applyEffect('player', endTurnEffect);

      // Test pre-turn phase
      entityContext.setCurrentPhase(EffectPhase.PRE_TURN);
      const preTurnResolution = effectManager.updateEffects(0, entityContext);
      expect(preTurnResolution.statChanges.has(TargetStat.ATK)).toBe(true);
      expect(preTurnResolution.statChanges.get(TargetStat.ATK)).toBe(10);

      // Test end-turn phase
      entityContext.setCurrentPhase(EffectPhase.END_TURN);
      const endTurnResolution = effectManager.updateEffects(0, entityContext);
      expect(endTurnResolution.statChanges.has(TargetStat.HP)).toBe(true);
      expect(endTurnResolution.statChanges.get(TargetStat.HP)).toBe(15);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many effects efficiently', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();
      const startTime = performance.now();

      // Create many effects
      for (let i = 0; i < 1000; i++) {
        const effect = BattleEffect.statModifier(
          `effect_${i}`,
          `Effect ${i}`,
          `Effect ${i} description`,
          TargetStat.ATK,
          ModifierType.FLAT,
          5,
          0,
          0
        );

        effectManager.applyEffect('player', effect);
      }

      const endTime = performance.now();

      expect(effectManager.getEffectCount('player')).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should be reasonably fast
    });

    test('should handle effect updates efficiently', () => {
      const effectManager = new EffectManager();
      const entityContext = new MockEntityContext();

      // Create many effects
      for (let i = 0; i < 100; i++) {
        const effect = BattleEffect.statModifier(
          `effect_${i}`,
          `Effect ${i}`,
          `Effect ${i} description`,
          TargetStat.ATK,
          ModifierType.FLAT,
          5,
          0,
          0
        );

        effectManager.applyEffect('player', effect);
      }

      const startTime = performance.now();

      // Update effects many times
      for (let i = 0; i < 100; i++) {
        effectManager.updateEffects(0.1, entityContext);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle stat calculations efficiently', () => {
      const aggregator = new StatModifierAggregator();
      const startTime = performance.now();

      // Add many modifiers
      for (let i = 0; i < 1000; i++) {
        aggregator.add(ModifierType.FLAT, 1, false);
        aggregator.add(ModifierType.PERCENT, 0.01, true);
      }

      // Apply many times
      for (let i = 0; i < 1000; i++) {
        aggregator.apply(100);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });
});
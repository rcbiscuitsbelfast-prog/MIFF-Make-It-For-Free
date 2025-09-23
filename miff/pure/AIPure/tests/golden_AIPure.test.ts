/**
 * AIPure Golden Tests
 *
 * Comprehensive tests for the AIPure AI management system.
 * Tests cover policy creation, AI decision making, battle simulation, and integration scenarios.
 */

import {
  AIManager,
  AIPolicy,
  BattleAI,
  AIUtils,
  ActionSource,
  TypeEffectiveness,
  MoveData,
  MoveCategory,
  SpiritInstance,
  DamageCalculator,
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

// Mock Spirit Instance for testing
class MockSpiritInstance implements SpiritInstance {
  public id: string;
  public name: string;
  public level: number;
  public attack: number;
  public defense: number;
  public specialAttack: number;
  public specialDefense: number;
  public maxHP: number;
  public currentHP: number;
  public resourcePoints: number;
  public typeTag: string;
  public attackMultiplier: number = 1.0;
  public defenseMultiplier: number = 1.0;
  public specialAttackMultiplier: number = 1.0;
  public specialDefenseMultiplier: number = 1.0;
  public critChanceBonus: number = 0.0;
  public syncLevel?: number;

  constructor(
    id: string,
    name: string,
    typeTag: string = 'neutral',
    level: number = 10,
    hp: number = 100,
    attack: number = 50,
    defense: number = 40,
    specialAttack: number = 55,
    specialDefense: number = 45,
    resourcePoints: number = 20,
    syncLevel?: number
  ) {
    this.id = id;
    this.name = name;
    this.typeTag = typeTag;
    this.level = level;
    this.maxHP = hp;
    this.currentHP = hp;
    this.attack = attack;
    this.defense = defense;
    this.specialAttack = specialAttack;
    this.specialDefense = specialDefense;
    this.resourcePoints = resourcePoints;
    this.syncLevel = syncLevel;
  }

  takeDamage(amount: number): void {
    this.currentHP = Math.max(0, this.currentHP - amount);
  }

  heal(amount: number): void {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }
}

describe('AIPure Golden Tests', () => {
  describe('AIPolicy Basic Functionality', () => {
    test('should create policy with default values', () => {
      const policy = new AIPolicy();
      expect(policy.policyId).toBe('default');
      expect(policy.aggression).toBe(1.0);
      expect(policy.caution).toBe(1.0);
      expect(policy.efficiency).toBe(1.0);
      expect(policy.overrideRules).toHaveLength(0);
    });

    test('should create policy with custom values', () => {
      const policy = new AIPolicy('custom', 1.5, 0.8, 1.2, ['test_rule']);
      expect(policy.policyId).toBe('custom');
      expect(policy.aggression).toBe(1.5);
      expect(policy.caution).toBe(0.8);
      expect(policy.efficiency).toBe(1.2);
      expect(policy.overrideRules).toEqual(['test_rule']);
    });

    test('should enforce constraints on values', () => {
      const policy = new AIPolicy('test', -1, 3, 1.5, []);
      expect(policy.aggression).toBe(0); // Clamped to minimum
      expect(policy.caution).toBe(2); // Clamped to maximum
      expect(policy.efficiency).toBe(1.5); // Within range
    });

    test('should identify policy types correctly', () => {
      const aggressive = AIPolicy.aggressive('aggro');
      const cautious = AIPolicy.cautious('cautious');
      const efficient = AIPolicy.efficient('efficient');
      const defensive = AIPolicy.defensive('defensive');
      const balanced = AIPolicy.balanced('balanced');
      const random = AIPolicy.random('random');

      expect(aggressive.isAggressive).toBe(true);
      expect(cautious.isCautious).toBe(true);
      expect(efficient.isEfficient).toBe(true);
      expect(balanced.isAggressive).toBe(false);
      expect(balanced.isCautious).toBe(false);
      expect(balanced.isEfficient).toBe(false);

      // Random policy should have varied values
      expect(random.aggression).toBeGreaterThan(0.4);
      expect(random.aggression).toBeLessThan(1.6);
      expect(random.caution).toBeGreaterThan(0.4);
      expect(random.caution).toBeLessThan(1.6);
      expect(random.efficiency).toBeGreaterThan(0.4);
      expect(random.efficiency).toBeLessThan(1.6);
    });

    test('should validate correctly', () => {
      const validPolicy = new AIPolicy('valid', 1.0, 1.0, 1.0);
      expect(validPolicy.validate()).toHaveLength(0);

      const invalidPolicy = new AIPolicy('', -1, 3, 1.5);
      const errors = invalidPolicy.validate();
      expect(errors).toContain('Policy ID cannot be empty');
      expect(errors).toContain('Aggression must be between 0 and 2');
      expect(errors).toContain('Caution must be between 0 and 2');
    });

    test('should generate policy summary correctly', () => {
      const policy = new AIPolicy('test', 1.2, 0.8, 1.5);
      expect(policy.getSummary()).toBe('test (Agg: 1.2, Cau: 0.8, Eff: 1.5)');
    });

    test('should clone correctly', () => {
      const original = new AIPolicy('original', 1.5, 0.8, 1.2, ['rule1', 'rule2']);
      const clone = original.clone();

      expect(clone.policyId).toBe(original.policyId);
      expect(clone.aggression).toBe(original.aggression);
      expect(clone.caution).toBe(original.caution);
      expect(clone.efficiency).toBe(original.efficiency);
      expect(clone.overrideRules).toEqual(original.overrideRules);
      expect(clone).not.toBe(original);
    });

    test('should manage override rules correctly', () => {
      const policy = new AIPolicy('test');

      policy.addOverrideRule('force_heal', 'heal:0.3');
      expect(policy.hasOverrideRule('force_heal')).toBe(true);
      expect(policy.getOverrideRule('force_heal')).toBe('heal:0.3');

      policy.addOverrideRule('prefer_fire', 'fire_blast');
      expect(policy.overrideRules).toHaveLength(2);

      const removed = policy.removeOverrideRule('force_heal');
      expect(removed).toBe(true);
      expect(policy.hasOverrideRule('force_heal')).toBe(false);
      expect(policy.overrideRules).toHaveLength(1);
    });
  });

  describe('AIManager Basic Functionality', () => {
    let aiManager: AIManager;
    let testPolicy: AIPolicy;

    beforeEach(() => {
      aiManager = new AIManager();
      testPolicy = new AIPolicy('test_policy', 1.2, 0.8, 1.5);
    });

    test('should create manager with type effectiveness', () => {
      expect(aiManager).toBeDefined();
      expect(aiManager.getPolicyCount()).toBe(0);
    });

    test('should register policies correctly', () => {
      const registered = aiManager.registerPolicy(testPolicy);
      expect(registered).toBe(true);
      expect(aiManager.getPolicyCount()).toBe(1);
      expect(aiManager.hasPolicy('test_policy')).toBe(true);
    });

    test('should reject invalid policies', () => {
      const invalidPolicy = new AIPolicy('', -1, 3);
      const registered = aiManager.registerPolicy(invalidPolicy);
      expect(registered).toBe(false);
      expect(aiManager.getPolicyCount()).toBe(0);
    });

    test('should get and retrieve policies correctly', () => {
      aiManager.registerPolicy(testPolicy);

      const retrieved = aiManager.getPolicy('test_policy');
      expect(retrieved).toBe(testPolicy);

      const nonExistent = aiManager.getPolicy('nonexistent');
      expect(nonExistent).toBeNull();
    });

    test('should get all policies correctly', () => {
      const policy1 = new AIPolicy('policy1');
      const policy2 = new AIPolicy('policy2');

      aiManager.registerPolicy(policy1);
      aiManager.registerPolicy(policy2);

      const allPolicies = aiManager.getAllPolicies();
      expect(allPolicies).toHaveLength(2);
      expect(allPolicies.map(p => p.policyId)).toEqual(['policy1', 'policy2']);
    });

    test('should remove policies correctly', () => {
      aiManager.registerPolicy(testPolicy);

      const removed = aiManager.removePolicy('test_policy');
      expect(removed).toBe(true);
      expect(aiManager.getPolicyCount()).toBe(0);
      expect(aiManager.hasPolicy('test_policy')).toBe(false);

      const notRemoved = aiManager.removePolicy('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should update policies correctly', () => {
      aiManager.registerPolicy(testPolicy);

      const updates = {
        aggression: 1.8,
        caution: 1.2
      };

      const updated = aiManager.updatePolicy('test_policy', updates);
      expect(updated).toBe(true);

      const updatedPolicy = aiManager.getPolicy('test_policy');
      expect(updatedPolicy?.aggression).toBe(1.8);
      expect(updatedPolicy?.caution).toBe(1.2);
      expect(updatedPolicy?.efficiency).toBe(1.5); // Unchanged
    });

    test('should reject invalid updates', () => {
      aiManager.registerPolicy(testPolicy);

      const invalidUpdates = {
        policyId: '',
        aggression: -1,
        caution: 3
      };

      const updated = aiManager.updatePolicy('test_policy', invalidUpdates);
      expect(updated).toBe(false);
    });

    test('should create standard policies', () => {
      aiManager.createStandardPolicies();
      expect(aiManager.getPolicyCount()).toBe(5);
      expect(aiManager.hasPolicy('balanced')).toBe(true);
      expect(aiManager.hasPolicy('aggressive')).toBe(true);
      expect(aiManager.hasPolicy('cautious')).toBe(true);
      expect(aiManager.hasPolicy('efficient')).toBe(true);
      expect(aiManager.hasPolicy('defensive')).toBe(true);
    });
  });

  describe('BattleAI Basic Functionality', () => {
    let aiManager: AIManager;
    let policy: AIPolicy;
    let ai: BattleAI;
    let rng: MockRNGProvider;

    beforeEach(() => {
      aiManager = new AIManager();
      policy = AIPolicy.balanced('test');
      aiManager.registerPolicy(policy);
      ai = aiManager.getAI('test');
      rng = new MockRNGProvider();
    });

    test('should create AI with policy', () => {
      expect(ai).toBeDefined();
      expect(ai.getPolicy()).toBe(policy);
    });

    test('should handle null inputs', () => {
      const action = ai.selectAction(null as any, null as any, [], rng);
      expect(action.moveId).toBe('wait');
      expect(action.type).toBe('defend');
    });

    test('should handle empty move list', () => {
      const spirit = new MockSpiritInstance('1', 'Test Spirit');
      const opponent = new MockSpiritInstance('2', 'Opponent Spirit');

      const action = ai.selectAction(spirit, opponent, [], rng);
      expect(action.moveId).toBe('wait');
    });

    test('should prefer type-advantaged moves', () => {
      const fireSpirit = new MockSpiritInstance('1', 'Fire Spirit', 'fire', 15, 100, 50, 40, 60, 45, 20);
      const waterSpirit = new MockSpiritInstance('2', 'Water Spirit', 'water', 15, 100, 40, 45, 55, 50, 20);

      const moves = [
        new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
        new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
      ];

      // Fire should be super effective against water
      const action = ai.selectAction(fireSpirit, waterSpirit, moves, rng);
      expect(action.moveId).toBe('fire_blast'); // Should prefer type advantage
    });

    test('should consider move accuracy', () => {
      const spirit = new MockSpiritInstance('1', 'Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 20);
      const opponent = new MockSpiritInstance('2', 'Opponent', 'neutral', 15, 100, 40, 45, 55, 50, 20);

      const moves = [
        new MoveData('high_power_low_acc', 'High Power Low Acc', MoveCategory.SPECIAL, 80, 0.7, 10, 'neutral'),
        new MoveData('low_power_high_acc', 'Low Power High Acc', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
      ];

      // Cautious AI should prefer high accuracy
      const cautiousPolicy = AIPolicy.cautious('cautious');
      aiManager.registerPolicy(cautiousPolicy);
      const cautiousAI = aiManager.getAI('cautious');

      const action = cautiousAI.selectAction(spirit, opponent, moves, rng);
      expect(action.moveId).toBe('low_power_high_acc'); // Should prefer accuracy
    });

    test('should consider resource costs', () => {
      const spirit = new MockSpiritInstance('1', 'Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 5); // Low resources
      const opponent = new MockSpiritInstance('2', 'Opponent', 'neutral', 15, 100, 40, 45, 55, 50, 20);

      const moves = [
        new MoveData('expensive_move', 'Expensive Move', MoveCategory.SPECIAL, 60, 0.9, 15, 'neutral'),
        new MoveData('cheap_move', 'Cheap Move', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
      ];

      // Efficient AI should prefer low cost
      const efficientPolicy = AIPolicy.efficient('efficient');
      aiManager.registerPolicy(efficientPolicy);
      const efficientAI = aiManager.getAI('efficient');

      const action = efficientAI.selectAction(spirit, opponent, moves, rng);
      expect(action.moveId).toBe('cheap_move'); // Should prefer low cost
    });

    test('should handle HP-based decisions', () => {
      const lowHpSpirit = new MockSpiritInstance('1', 'Low HP Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 20);
      lowHpSpirit.currentHP = 25; // Low HP

      const opponent = new MockSpiritInstance('2', 'Opponent', 'neutral', 15, 100, 40, 45, 55, 50, 20);

      const moves = [
        new MoveData('attack_move', 'Attack Move', MoveCategory.PHYSICAL, 60, 0.9, 8, 'neutral'),
        new MoveData('heal_move', 'Heal Move', MoveCategory.STATUS, 0, 1.0, 5, 'neutral')
      ];

      const action = ai.selectAction(lowHpSpirit, opponent, moves, rng);
      expect(action.moveId).toBe('heal_move'); // Should prefer healing when low on HP
    });

    test('should handle sync level advantages', () => {
      const highSyncSpirit = new MockSpiritInstance('1', 'High Sync Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 20, 70);
      const lowSyncSpirit = new MockSpiritInstance('2', 'Low Sync Spirit', 'neutral', 15, 100, 40, 45, 55, 50, 20, 30);

      const moves = [
        new MoveData('regular_move', 'Regular Move', MoveCategory.PHYSICAL, 50, 0.9, 5, 'neutral'),
        new MoveData('sync_move', 'Sync Move', MoveCategory.SPECIAL, 60, 0.85, 8, 'neutral')
      ];

      const action = ai.selectAction(highSyncSpirit, lowSyncSpirit, moves, rng);
      expect(action.moveId).toBe('sync_move'); // Should prefer higher power with sync advantage
    });
  });

  describe('AIUtils Basic Functionality', () => {
    test('should create standard policies', () => {
      const policies = AIUtils.createStandardPolicies();

      expect(policies).toHaveLength(5);
      expect(policies.some(p => p.policyId === 'balanced')).toBe(true);
      expect(policies.some(p => p.policyId === 'aggressive')).toBe(true);
      expect(policies.some(p => p.policyId === 'cautious')).toBe(true);
      expect(policies.some(p => p.policyId === 'efficient')).toBe(true);
      expect(policies.some(p => p.policyId === 'defensive')).toBe(true);
    });

    test('should create adaptive policy based on spirit stats', () => {
      const highAttackSpirit = new MockSpiritInstance('1', 'High Attack', 'fire', 15, 100, 80, 40, 20, 60, 20);
      const lowHpSpirit = new MockSpiritInstance('2', 'Low HP', 'water', 15, 100, 50, 40, 60, 45, 20);
      lowHpSpirit.currentHP = 25;

      const adaptive1 = AIUtils.createAdaptivePolicy(highAttackSpirit);
      const adaptive2 = AIUtils.createAdaptivePolicy(lowHpSpirit);

      expect(adaptive1.aggression).toBeGreaterThan(1.0); // High attack = aggressive
      expect(adaptive2.caution).toBeGreaterThan(1.0); // Low HP = cautious
    });

    test('should create boss policy based on level difference', () => {
      const strongBossPolicy = AIUtils.createBossPolicy(20, 10); // Much stronger
      const equalBossPolicy = AIUtils.createBossPolicy(15, 15); // Equal
      const weakBossPolicy = AIUtils.createBossPolicy(10, 20); // Weaker

      expect(strongBossPolicy.caution).toBeGreaterThan(1.0); // Stronger = cautious
      expect(equalBossPolicy.caution).toBeGreaterThan(1.0); // Equal = cautious
      expect(weakBossPolicy.aggression).toBeGreaterThan(1.0); // Weaker = aggressive
    });

    test('should create scenario policies', () => {
      const earlyGame = AIUtils.createScenarioPolicy('early_game');
      const midGame = AIUtils.createScenarioPolicy('mid_game');
      const lateGame = AIUtils.createScenarioPolicy('late_game');
      const boss = AIUtils.createScenarioPolicy('boss');
      const pvp = AIUtils.createScenarioPolicy('pvp');

      expect(earlyGame.aggression).toBeGreaterThan(1.0); // Early game = aggressive
      expect(midGame.caution).toBeGreaterThan(1.0); // Mid game = cautious
      expect(lateGame.efficiency).toBeGreaterThan(1.0); // Late game = efficient
      expect(boss.caution).toBeGreaterThan(1.0); // Boss = cautious
      expect(pvp.aggression).toBeGreaterThan(1.0); // PvP = aggressive
    });

    test('should compare policies correctly', () => {
      const policy1 = new AIPolicy('policy1', 1.0, 1.0, 1.0);
      const policy2 = new AIPolicy('policy2', 1.5, 0.5, 1.2);

      const comparison = AIUtils.comparePolicies(policy1, policy2);

      expect(comparison.aggressionDiff).toBe(0.5);
      expect(comparison.cautionDiff).toBe(0.5);
      expect(comparison.efficiencyDiff).toBe(0.2);
      expect(comparison.totalDifference).toBe(1.2);
    });

    test('should get behavior description correctly', () => {
      const aggressive = AIPolicy.aggressive('aggro');
      const cautious = AIPolicy.cautious('cautious');
      const efficient = AIPolicy.efficient('efficient');
      const balanced = AIPolicy.balanced('balanced');

      expect(AIUtils.getBehaviorDescription(aggressive)).toContain('aggressive');
      expect(AIUtils.getBehaviorDescription(cautious)).toContain('cautious');
      expect(AIUtils.getBehaviorDescription(efficient)).toContain('efficient');
      expect(AIUtils.getBehaviorDescription(balanced)).toContain('balanced');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete AI workflow', () => {
      const aiManager = new AIManager();

      // Register multiple policies
      aiManager.createStandardPolicies();

      // Create spirits with different characteristics
      const fireSpirit = new MockSpiritInstance('fire', 'Fire Spirit', 'fire', 15, 100, 60, 35, 70, 40, 25, 30);
      const waterSpirit = new MockSpiritInstance('water', 'Water Spirit', 'water', 15, 100, 45, 50, 65, 55, 25, 25);
      const damagedSpirit = new MockSpiritInstance('damaged', 'Damaged Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 20);
      damagedSpirit.currentHP = 30; // Low HP

      // Create moves
      const moves = [
        new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
        new MoveData('water_burst', 'Water Burst', MoveCategory.SPECIAL, 55, 0.95, 6, 'water'),
        new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral'),
        new MoveData('heal', 'Heal', MoveCategory.STATUS, 0, 1.0, 5, 'neutral')
      ];

      const mockRNG = new MockRNGProvider();

      // Test different AI types
      const aggressiveAI = aiManager.getAI('aggressive');
      const cautiousAI = aiManager.getAI('cautious');
      const balancedAI = aiManager.getAI('balanced');

      // Aggressive should prefer fire_blast vs water (type advantage)
      const aggressiveAction = aggressiveAI.selectAction(fireSpirit, waterSpirit, moves, mockRNG);
      expect(aggressiveAction.moveId).toBe('fire_blast');

      // Cautious should prefer basic_strike (high accuracy)
      const cautiousAction = cautiousAI.selectAction(fireSpirit, waterSpirit, moves, mockRNG);
      expect(cautiousAction.moveId).toBe('basic_strike');

      // Damaged spirit should prefer healing
      const damagedAction = balancedAI.selectAction(damagedSpirit, waterSpirit, moves, mockRNG);
      expect(damagedAction.moveId).toBe('heal');
    });

    test('should handle policy overrides', () => {
      const aiManager = new AIManager();
      const policy = new AIPolicy('override_test', 1.0, 1.0, 1.0);

      // Add override rules
      policy.addOverrideRule('force_move_if_hp_below', 'heal:0.3');
      policy.addOverrideRule('prefer_move_if_type_advantage', 'fire_blast');

      aiManager.registerPolicy(policy);
      const ai = aiManager.getAI('override_test');

      const spirit = new MockSpiritInstance('1', 'Spirit', 'fire', 15, 100, 50, 40, 60, 45, 20);
      const opponent = new MockSpiritInstance('2', 'Opponent', 'water', 15, 100, 40, 45, 55, 50, 20);

      const moves = [
        new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
        new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral'),
        new MoveData('heal', 'Heal', MoveCategory.STATUS, 0, 1.0, 5, 'neutral')
      ];

      // Test type advantage override
      const typeAction = ai.selectAction(spirit, opponent, moves, new MockRNGProvider());
      expect(typeAction.moveId).toBe('fire_blast'); // Should prefer fire vs water

      // Test HP-based override (low HP spirit)
      spirit.currentHP = 25; // 25% HP
      const lowHpAction = ai.selectAction(spirit, opponent, moves, new MockRNGProvider());
      expect(lowHpAction.moveId).toBe('heal'); // Should force heal when HP below 30%
    });

    test('should handle adaptive policy creation', () => {
      const aiManager = new AIManager();

      // Create spirits with different characteristics
      const spirits = [
        new MockSpiritInstance('high_attack', 'High Attack', 'fire', 15, 100, 80, 40, 20, 60, 20), // High attack
        new MockSpiritInstance('low_hp', 'Low HP', 'water', 15, 100, 50, 40, 60, 45, 20), // Low HP
        new MockSpiritInstance('high_defense', 'High Defense', 'earth', 15, 100, 45, 70, 50, 75, 20), // High defense
        new MockSpiritInstance('balanced', 'Balanced', 'neutral', 15, 100, 50, 50, 50, 50, 20) // Balanced
      ];

      spirits.forEach(spirit => {
        const adaptivePolicy = AIUtils.createAdaptivePolicy(spirit);
        aiManager.registerPolicy(adaptivePolicy);
      });

      // Test that adaptive policies reflect spirit characteristics
      const highAttackPolicy = aiManager.getPolicy('adaptive_high_attack');
      const lowHpPolicy = aiManager.getPolicy('adaptive_low_hp');
      const highDefensePolicy = aiManager.getPolicy('adaptive_high_defense');
      const balancedPolicy = aiManager.getPolicy('adaptive_balanced');

      expect(highAttackPolicy?.aggression).toBeGreaterThan(1.0); // High attack = aggressive
      expect(lowHpPolicy?.caution).toBeGreaterThan(1.0); // Low HP = cautious
      expect(highDefensePolicy?.aggression).toBeLessThan(1.0); // High defense = defensive
      expect(balancedPolicy?.efficiency).toBeGreaterThan(1.0); // Balanced = efficient
    });

    test('should handle battle simulation', () => {
      const aiManager = new AIManager();
      aiManager.createStandardPolicies();

      // Create two spirits
      const spirit1 = new MockSpiritInstance('1', 'Spirit 1', 'fire', 15, 100, 50, 40, 60, 45, 20);
      const spirit2 = new MockSpiritInstance('2', 'Spirit 2', 'water', 15, 100, 45, 45, 55, 50, 20);

      // Create moves
      const moves = [
        new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
        new MoveData('water_burst', 'Water Burst', MoveCategory.SPECIAL, 55, 0.95, 6, 'water'),
        new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
      ];

      const ai1 = aiManager.getAI('aggressive');
      const ai2 = aiManager.getAI('cautious');
      const mockRNG = new MockRNGProvider();

      // Simulate a few turns
      let turn = 1;
      const maxTurns = 10;

      while (spirit1.currentHP > 0 && spirit2.currentHP > 0 && turn <= maxTurns) {
        // Spirit 1 attacks
        const action1 = ai1.selectAction(spirit1, spirit2, moves, mockRNG);
        const move1 = moves.find(m => m.moveId === action1.moveId);
        if (move1) {
          const damageCalculator = new DamageCalculator(new TypeEffectiveness());
          mockRNG.setNextFloat(1.0);
          mockRNG.setNextBool(false);
          const damage = damageCalculator.calculateDamage(spirit1, spirit2, move1, mockRNG);
          spirit2.takeDamage(damage);
        }

        if (spirit2.currentHP <= 0) {
          expect(spirit2.currentHP).toBe(0);
          break;
        }

        // Spirit 2 attacks
        const action2 = ai2.selectAction(spirit2, spirit1, moves, mockRNG);
        const move2 = moves.find(m => m.moveId === action2.moveId);
        if (move2) {
          const damageCalculator = new DamageCalculator(new TypeEffectiveness());
          mockRNG.setNextFloat(1.0);
          mockRNG.setNextBool(false);
          const damage = damageCalculator.calculateDamage(spirit2, spirit1, move2, mockRNG);
          spirit1.takeDamage(damage);
        }

        if (spirit1.currentHP <= 0) {
          expect(spirit1.currentHP).toBe(0);
          break;
        }

        turn++;
      }

      // One spirit should be defeated
      expect(spirit1.currentHP === 0 || spirit2.currentHP === 0).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many policies efficiently', () => {
      const aiManager = new AIManager();
      const startTime = performance.now();

      // Create and register many policies
      for (let i = 0; i < 1000; i++) {
        const policy = new AIPolicy(
          `policy_${i}`,
          0.5 + Math.random(),
          0.5 + Math.random(),
          0.5 + Math.random(),
          []
        );
        aiManager.registerPolicy(policy);
      }

      const endTime = performance.now();

      expect(aiManager.getPolicyCount()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should handle rapid AI decisions efficiently', () => {
      const aiManager = new AIManager();
      aiManager.createStandardPolicies();

      const spirit = new MockSpiritInstance('1', 'Test Spirit', 'fire', 15, 100, 50, 40, 60, 45, 20);
      const opponent = new MockSpiritInstance('2', 'Opponent', 'water', 15, 100, 40, 45, 55, 50, 20);

      const moves = Array.from({ length: 50 }, (_, i) => new MoveData(
        `move_${i}`,
        `Move ${i}`,
        i % 3 === 0 ? MoveCategory.STATUS : (i % 3 === 1 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL),
        30 + i,
        0.8 + (i * 0.004),
        i,
        'neutral'
      ));

      const ai = aiManager.getAI('balanced');
      const mockRNG = new MockRNGProvider();

      const startTime = performance.now();

      // Make many decisions
      for (let i = 0; i < 1000; i++) {
        ai.selectAction(spirit, opponent, moves, mockRNG);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle complex policy comparisons efficiently', () => {
      const aiManager = new AIManager();
      const policies: AIPolicy[] = [];

      // Create many policies
      for (let i = 0; i < 500; i++) {
        const policy = new AIPolicy(
          `complex_policy_${i}`,
          0.5 + Math.random(),
          0.5 + Math.random(),
          0.5 + Math.random(),
          i % 2 === 0 ? [`rule_${i}`] : []
        );
        policies.push(policy);
        aiManager.registerPolicy(policy);
      }

      const referencePolicy = AIPolicy.balanced('reference');

      const startTime = performance.now();

      // Compare all policies to reference
      for (let i = 0; i < 100; i++) {
        const policy = policies[i];
        AIUtils.comparePolicies(referencePolicy, policy);
        AIUtils.getBehaviorDescription(policy);
        policy.validate();
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
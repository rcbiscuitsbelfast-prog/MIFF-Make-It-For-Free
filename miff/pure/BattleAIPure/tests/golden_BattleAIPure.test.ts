/**
 * BattleAIPure Golden Tests
 *
 * Comprehensive tests for the BattleAIPure battle AI management system.
 * Tests cover profile creation, AI decision making, threat assessment, and integration scenarios.
 */

import {
  AIControllerManager,
  AIDecisionProfile,
  BattleAIController,
  BattleAIUtils,
  AIDecisionStyle,
  ThreatLevel,
  MoveCategory,
  ISpiritInstance,
  IAIDecisionProfile,
  IBattleAIController,
  IAIControllerManager
} from '../index';

// Mock Spirit Instance for testing
class MockSpiritInstance implements ISpiritInstance {
  public id: string;
  public name: string;
  public level: number;
  public typeTag: string;
  public maxHP: number;
  public currentHP: number;
  public attack: number;
  public defense: number;
  public specialAttack: number;
  public specialDefense: number;
  public speed: number;
  public statusEffects: string[];
  public knownMoves: string[];

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
    speed: number = 35
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
    this.speed = speed;
    this.statusEffects = [];
    this.knownMoves = [];
  }

  isFainted(): boolean {
    return this.currentHP <= 0;
  }

  getEffectiveStats(): {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  } {
    return {
      attack: this.attack,
      defense: this.defense,
      specialAttack: this.specialAttack,
      specialDefense: this.specialDefense,
      speed: this.speed
    };
  }

  takeDamage(amount: number): void {
    this.currentHP = Math.max(0, this.currentHP - amount);
  }

  heal(amount: number): void {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  addStatusEffect(effect: string): void {
    if (!this.statusEffects.includes(effect)) {
      this.statusEffects.push(effect);
    }
  }

  removeStatusEffect(effect: string): void {
    this.statusEffects = this.statusEffects.filter(s => s !== effect);
  }
}

describe('BattleAIPure Golden Tests', () => {
  describe('AIDecisionProfile Basic Functionality', () => {
    test('should create profile with default values', () => {
      const profile = new AIDecisionProfile();
      expect(profile.profileID).toBe('default');
      expect(profile.style).toBe(AIDecisionStyle.BALANCED);
      expect(profile.movePriorityWeights[MoveCategory.DAMAGE]).toBe(1.0);
      expect(profile.movePriorityWeights[MoveCategory.HEALING]).toBe(0.5);
      expect(profile.movePriorityWeights[MoveCategory.SUPPORT]).toBe(0.6);
      expect(profile.preferredTypes).toHaveLength(0);
    });

    test('should create profile with custom values', () => {
      const profile = new AIDecisionProfile('custom', AIDecisionStyle.AGGRESSIVE, {
        [MoveCategory.DAMAGE]: 1.5,
        [MoveCategory.HEALING]: 0.3,
        [MoveCategory.SUPPORT]: 0.8
      }, ['fire', 'electric']);

      expect(profile.profileID).toBe('custom');
      expect(profile.style).toBe(AIDecisionStyle.AGGRESSIVE);
      expect(profile.movePriorityWeights[MoveCategory.DAMAGE]).toBe(1.5);
      expect(profile.movePriorityWeights[MoveCategory.HEALING]).toBe(0.3);
      expect(profile.movePriorityWeights[MoveCategory.SUPPORT]).toBe(0.8);
      expect(profile.preferredTypes).toEqual(['fire', 'electric']);
    });

    test('should enforce weight constraints', () => {
      const profile = new AIDecisionProfile('test', AIDecisionStyle.BALANCED, {
        [MoveCategory.DAMAGE]: -1,
        [MoveCategory.HEALING]: 3,
        [MoveCategory.SUPPORT]: 1.5
      });

      expect(profile.movePriorityWeights[MoveCategory.DAMAGE]).toBe(0); // Clamped to minimum
      expect(profile.movePriorityWeights[MoveCategory.HEALING]).toBe(2); // Clamped to maximum
      expect(profile.movePriorityWeights[MoveCategory.SUPPORT]).toBe(1.5); // Within range
    });

    test('should identify decision styles correctly', () => {
      const aggressive = AIDecisionProfile.aggressive('aggro');
      const defensive = AIDecisionProfile.defensive('defensive');
      const balanced = AIDecisionProfile.balanced('balanced');
      const trickster = AIDecisionProfile.trickster('trickster');

      expect(aggressive.isAggressive).toBe(true);
      expect(defensive.isDefensive).toBe(true);
      expect(balanced.isBalanced).toBe(true);
      expect(trickster.isTrickster).toBe(true);
    });

    test('should validate correctly', () => {
      const validProfile = new AIDecisionProfile('valid', AIDecisionStyle.BALANCED);
      expect(validProfile.validate({})).toHaveLength(0);

      const invalidProfile = new AIDecisionProfile('', AIDecisionStyle.AGGRESSIVE, {
        [MoveCategory.DAMAGE]: -1,
        [MoveCategory.HEALING]: 3
      }, ['']);

      const errors = invalidProfile.validate({});
      expect(errors).toContain('Profile ID cannot be empty');
      expect(errors).toContain('damage weight must be between 0 and 2');
      expect(errors).toContain('healing weight must be between 0 and 2');
      expect(errors).toContain('Preferred types cannot contain empty strings');
    });

    test('should generate profile summary correctly', () => {
      const profile = new AIDecisionProfile('test_profile', AIDecisionStyle.AGGRESSIVE, {}, ['fire']);
      expect(profile.getSummary()).toBe('test_profile (aggressive) (1 preferred types)');
    });

    test('should clone correctly', () => {
      const original = new AIDecisionProfile('original', AIDecisionStyle.DEFENSIVE, {
        [MoveCategory.DAMAGE]: 0.8,
        [MoveCategory.HEALING]: 1.2
      }, ['water', 'ice']);

      const clone = original.clone();

      expect(clone.profileID).toBe(original.profileID);
      expect(clone.style).toBe(original.style);
      expect(clone.movePriorityWeights).toEqual(original.movePriorityWeights);
      expect(clone.preferredTypes).toEqual(original.preferredTypes);
      expect(clone).not.toBe(original);
    });

    test('should manage preferred types correctly', () => {
      const profile = new AIDecisionProfile('test');

      profile.addPreferredType('fire');
      expect(profile.isTypePreferred('fire')).toBe(true);
      expect(profile.preferredTypes).toHaveLength(1);

      profile.addPreferredType('water');
      expect(profile.preferredTypes).toHaveLength(2);

      const removed = profile.removePreferredType('fire');
      expect(removed).toBe(true);
      expect(profile.isTypePreferred('fire')).toBe(false);
      expect(profile.preferredTypes).toHaveLength(1);

      const notRemoved = profile.removePreferredType('electric');
      expect(notRemoved).toBe(false);
    });

    test('should get move weights correctly', () => {
      const profile = new AIDecisionProfile('test', AIDecisionStyle.BALANCED, {
        [MoveCategory.DAMAGE]: 1.5,
        [MoveCategory.HEALING]: 0.8,
        [MoveCategory.SUPPORT]: 1.2
      });

      expect(profile.getMoveWeight(MoveCategory.DAMAGE)).toBe(1.5);
      expect(profile.getMoveWeight(MoveCategory.HEALING)).toBe(0.8);
      expect(profile.getMoveWeight(MoveCategory.SUPPORT)).toBe(1.2);
      expect(profile.getMoveWeight('unknown')).toBe(0.5); // Default weight
    });

    test('should set move weights correctly', () => {
      const profile = new AIDecisionProfile('test');

      profile.setMoveWeight(MoveCategory.DAMAGE, 1.8);
      profile.setMoveWeight(MoveCategory.HEALING, 0.2);
      profile.setMoveWeight('unknown', 1.5);

      expect(profile.getMoveWeight(MoveCategory.DAMAGE)).toBe(1.8);
      expect(profile.getMoveWeight(MoveCategory.HEALING)).toBe(0.2);
      expect(profile.getMoveWeight('unknown')).toBe(1.5);
    });

    test('should get style description correctly', () => {
      const aggressive = AIDecisionProfile.aggressive('aggro');
      const defensive = AIDecisionProfile.defensive('defensive');
      const balanced = AIDecisionProfile.balanced('balanced');
      const trickster = AIDecisionProfile.trickster('trickster');

      expect(aggressive.getStyleDescription()).toContain('Focuses on high damage moves');
      expect(defensive.getStyleDescription()).toContain('Prioritizes healing and protection');
      expect(balanced.getStyleDescription()).toContain('Balanced approach');
      expect(trickster.getStyleDescription()).toContain('Prefers support and utility moves');
    });

    test('should handle type advantages correctly', () => {
      const profile = new AIDecisionProfile('test', AIDecisionStyle.BALANCED, {}, ['fire', 'electric']);

      // Fire vs Water should be advantage
      expect(profile.getTypeAdvantageBonus('fire', 'water')).toBeGreaterThan(0);

      // Electric vs Water should be advantage
      expect(profile.getTypeAdvantageBonus('electric', 'water')).toBeGreaterThan(0);

      // Fire vs Fire should be neutral
      expect(profile.getTypeAdvantageBonus('fire', 'fire')).toBe(0);

      // Unknown type should be neutral
      expect(profile.getTypeAdvantageBonus('unknown', 'water')).toBe(0);
    });
  });

  describe('AIControllerManager Basic Functionality', () => {
    let aiManager: AIControllerManager;
    let testProfile: AIDecisionProfile;

    beforeEach(() => {
      aiManager = new AIControllerManager();
      testProfile = new AIDecisionProfile('test_profile', AIDecisionStyle.AGGRESSIVE);
    });

    test('should create manager with standard profiles', () => {
      expect(aiManager).toBeDefined();
      expect(aiManager.getProfileCount()).toBe(4); // balanced, aggressive, defensive, trickster
    });

    test('should register profiles correctly', () => {
      const registered = aiManager.registerProfile(testProfile);
      expect(registered).toBe(true);
      expect(aiManager.getProfileCount()).toBe(5);
      expect(aiManager.hasProfile('test_profile')).toBe(true);
    });

    test('should reject invalid profiles', () => {
      const invalidProfile = new AIDecisionProfile('', AIDecisionStyle.AGGRESSIVE);
      const registered = aiManager.registerProfile(invalidProfile);
      expect(registered).toBe(false);
      expect(aiManager.getProfileCount()).toBe(4);
    });

    test('should get and retrieve profiles correctly', () => {
      aiManager.registerProfile(testProfile);

      const retrieved = aiManager.getProfile('test_profile');
      expect(retrieved).toBe(testProfile);

      const nonExistent = aiManager.getProfile('nonexistent');
      expect(nonExistent).toBeNull();
    });

    test('should get all profiles correctly', () => {
      aiManager.registerProfile(testProfile);

      const allProfiles = aiManager.getAllProfiles();
      expect(allProfiles).toHaveLength(5);
      expect(allProfiles.some(p => p.profileID === 'test_profile')).toBe(true);
      expect(allProfiles.some(p => p.profileID === 'balanced')).toBe(true);
    });

    test('should remove profiles correctly', () => {
      aiManager.registerProfile(testProfile);

      const removed = aiManager.removeProfile('test_profile');
      expect(removed).toBe(true);
      expect(aiManager.getProfileCount()).toBe(4);
      expect(aiManager.hasProfile('test_profile')).toBe(false);

      const notRemoved = aiManager.removeProfile('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should update profiles correctly', () => {
      aiManager.registerProfile(testProfile);

      const updates = {
        style: AIDecisionStyle.DEFENSIVE,
        movePriorityWeights: {
          [MoveCategory.DAMAGE]: 0.5,
          [MoveCategory.HEALING]: 1.5
        }
      };

      const updated = aiManager.updateProfile('test_profile', updates);
      expect(updated).toBe(true);

      const updatedProfile = aiManager.getProfile('test_profile');
      expect(updatedProfile?.style).toBe(AIDecisionStyle.DEFENSIVE);
      expect(updatedProfile?.movePriorityWeights[MoveCategory.DAMAGE]).toBe(0.5);
      expect(updatedProfile?.movePriorityWeights[MoveCategory.HEALING]).toBe(1.5);
    });

    test('should reject invalid updates', () => {
      aiManager.registerProfile(testProfile);

      const invalidUpdates = {
        profileID: '',
        movePriorityWeights: {
          [MoveCategory.DAMAGE]: -1,
          [MoveCategory.HEALING]: 3
        }
      };

      const updated = aiManager.updateProfile('test_profile', invalidUpdates);
      expect(updated).toBe(false);
    });

    test('should get AI controllers correctly', () => {
      const ai = aiManager.getAIController('aggressive');
      expect(ai).toBeDefined();
      expect(ai.getDecisionProfile().style).toBe(AIDecisionStyle.AGGRESSIVE);

      const customAI = aiManager.getAIController('custom_profile');
      expect(customAI).toBeDefined();
      expect(customAI.getDecisionProfile().profileID).toBe('custom_profile');
    });

    test('should filter profiles by style', () => {
      const aggressiveProfiles = aiManager.getProfilesByStyle(AIDecisionStyle.AGGRESSIVE);
      const defensiveProfiles = aiManager.getProfilesByStyle(AIDecisionStyle.DEFENSIVE);

      expect(aggressiveProfiles).toHaveLength(1);
      expect(aggressiveProfiles[0].style).toBe(AIDecisionStyle.AGGRESSIVE);

      expect(defensiveProfiles).toHaveLength(1);
      expect(defensiveProfiles[0].style).toBe(AIDecisionStyle.DEFENSIVE);
    });

    test('should get profiles with type preferences', () => {
      const profileWithTypes = new AIDecisionProfile('with_types', AIDecisionStyle.BALANCED, {}, ['fire']);
      aiManager.registerProfile(profileWithTypes);

      const profilesWithTypes = aiManager.getProfilesWithTypePreferences();
      expect(profilesWithTypes).toHaveLength(1);
      expect(profilesWithTypes[0].profileID).toBe('with_types');
    });
  });

  describe('BattleAIController Basic Functionality', () => {
    let aiManager: AIControllerManager;
    let ai: IBattleAIController;
    let fireSpirit: MockSpiritInstance;
    let waterSpirit: MockSpiritInstance;

    beforeEach(() => {
      aiManager = new AIControllerManager();
      ai = aiManager.getAIController('balanced');

      fireSpirit = new MockSpiritInstance('fire', 'Fire Spirit', 'fire', 15, 100, 60, 35, 70, 40, 40);
      waterSpirit = new MockSpiritInstance('water', 'Water Spirit', 'water', 15, 100, 45, 50, 65, 55, 35);

      fireSpirit.knownMoves = ['fire_blast', 'basic_strike', 'heal'];
      waterSpirit.knownMoves = ['water_burst', 'basic_strike', 'heal'];
    });

    test('should create AI controller with profile', () => {
      expect(ai).toBeDefined();
      expect(ai.getDecisionProfile().style).toBe(AIDecisionStyle.BALANCED);
    });

    test('should handle null inputs', () => {
      const selectedMove = ai.selectMove(null as any, null as any);
      expect(selectedMove).toBeNull();
    });

    test('should handle spirits without moves', () => {
      const spiritWithoutMoves = new MockSpiritInstance('no_moves', 'No Moves Spirit');
      spiritWithoutMoves.knownMoves = [];

      const selectedMove = ai.selectMove(spiritWithoutMoves, waterSpirit);
      expect(selectedMove).toBeNull();
    });

    test('should prefer type-advantaged moves', () => {
      // Fire vs Water should be advantageous
      const selectedMove = ai.selectMove(fireSpirit, waterSpirit);
      expect(selectedMove).toBe('fire_blast'); // Should prefer type advantage
    });

    test('should consider threat levels', () => {
      const highThreatSpirit = new MockSpiritInstance('high_threat', 'High Threat', 'water', 20, 150, 80, 60, 90, 70, 50);
      const lowThreatSpirit = new MockSpiritInstance('low_threat', 'Low Threat', 'water', 5, 50, 30, 25, 35, 30, 25);

      const highThreatLevel = ai.evaluateThreatLevel(highThreatSpirit);
      const lowThreatLevel = ai.evaluateThreatLevel(lowThreatSpirit);

      expect(highThreatLevel).toBeGreaterThan(lowThreatLevel);
      expect(highThreatLevel).toBeGreaterThan(0.6);
      expect(lowThreatLevel).toBeLessThan(0.4);
    });

    test('should prefer healing when low on HP', () => {
      const lowHpSpirit = new MockSpiritInstance('low_hp', 'Low HP Spirit', 'fire', 15, 100, 60, 35, 70, 40, 40);
      lowHpSpirit.currentHP = 25; // 25% HP
      lowHpSpirit.knownMoves = ['fire_blast', 'basic_strike', 'heal'];

      const selectedMove = ai.selectMove(lowHpSpirit, waterSpirit);
      expect(selectedMove).toBe('heal'); // Should prefer healing when low HP
    });

    test('should consider status effects', () => {
      const statusSpirit = new MockSpiritInstance('status', 'Status Spirit', 'fire', 15, 100, 60, 35, 70, 40, 40);
      statusSpirit.addStatusEffect('burned');
      statusSpirit.addStatusEffect('poisoned');
      statusSpirit.knownMoves = ['fire_blast', 'basic_strike', 'heal'];

      const selectedMove = ai.selectMove(statusSpirit, waterSpirit);
      // Should consider status effects in decision making
      expect(['fire_blast', 'basic_strike', 'heal']).toContain(selectedMove);
    });

    test('should get preferred move types correctly', () => {
      const preferredTypes = ai.getPreferredMoveTypes();
      expect(preferredTypes.length).toBeGreaterThan(0);
      expect(preferredTypes.length).toBeLessThanOrEqual(2);
    });

    test('should handle fainted spirits', () => {
      const faintedSpirit = new MockSpiritInstance('fainted', 'Fainted Spirit');
      faintedSpirit.currentHP = 0;

      const selectedMove = ai.selectMove(faintedSpirit, waterSpirit);
      expect(selectedMove).toBeNull(); // Cannot make moves when fainted
    });

    test('should get threat level descriptions correctly', () => {
      const lowThreat = 0.2;
      const mediumThreat = 0.5;
      const highThreat = 0.7;
      const criticalThreat = 0.9;

      expect(ai.getThreatLevelDescription(lowThreat)).toBe(ThreatLevel.LOW);
      expect(ai.getThreatLevelDescription(mediumThreat)).toBe(ThreatLevel.MEDIUM);
      expect(ai.getThreatLevelDescription(highThreat)).toBe(ThreatLevel.HIGH);
      expect(ai.getThreatLevelDescription(criticalThreat)).toBe(ThreatLevel.CRITICAL);
    });

    test('should set and get decision profiles correctly', () => {
      const newProfile = AIDecisionProfile.aggressive('new_profile');
      ai.setDecisionProfile(newProfile);

      const retrievedProfile = ai.getDecisionProfile();
      expect(retrievedProfile.style).toBe(AIDecisionStyle.AGGRESSIVE);
      expect(retrievedProfile.profileID).toBe('new_profile');
    });

    test('should provide profile summaries correctly', () => {
      const summary = ai.getProfileSummary();
      expect(summary).toContain('balanced');
    });

    test('should identify AI types correctly', () => {
      expect(ai.isAggressive).toBe(false);
      expect(ai.isDefensive).toBe(false);
      expect(ai.isBalanced).toBe(true);
      expect(ai.isTrickster).toBe(false);

      const aggressiveAI = aiManager.getAIController('aggressive');
      expect(aggressiveAI.isAggressive).toBe(true);
      expect(aggressiveAI.isDefensive).toBe(false);
    });
  });

  describe('BattleAIUtils Basic Functionality', () => {
    test('should create standard profiles', () => {
      const profiles = BattleAIUtils.createStandardProfiles();

      expect(profiles).toHaveLength(4);
      expect(profiles.some(p => p.style === AIDecisionStyle.BALANCED)).toBe(true);
      expect(profiles.some(p => p.style === AIDecisionStyle.AGGRESSIVE)).toBe(true);
      expect(profiles.some(p => p.style === AIDecisionStyle.DEFENSIVE)).toBe(true);
      expect(profiles.some(p => p.style === AIDecisionStyle.TRICKSTER)).toBe(true);
    });

    test('should create adaptive profile based on spirit stats', () => {
      const highAttackSpirit = new MockSpiritInstance('high_attack', 'High Attack', 'fire', 15, 100, 80, 40, 20, 60, 40);
      const lowHpSpirit = new MockSpiritInstance('low_hp', 'Low HP', 'water', 15, 100, 50, 40, 60, 45, 40);
      lowHpSpirit.currentHP = 25;

      const adaptive1 = BattleAIUtils.createAdaptiveProfile(highAttackSpirit);
      const adaptive2 = BattleAIUtils.createAdaptiveProfile(lowHpSpirit);

      expect(adaptive1.isAggressive).toBe(true); // High attack = aggressive
      expect(adaptive2.isDefensive).toBe(true); // Low HP = defensive
    });

    test('should create boss profile based on level difference', () => {
      const strongBossProfile = BattleAIUtils.createBossProfile(20, 10); // Much stronger
      const equalBossProfile = BattleAIUtils.createBossProfile(15, 15); // Equal
      const weakBossProfile = BattleAIUtils.createBossProfile(10, 20); // Weaker

      expect(strongBossProfile.isDefensive).toBe(true); // Stronger = defensive
      expect(equalBossProfile.isBalanced).toBe(true); // Equal = balanced
      expect(weakBossProfile.isAggressive).toBe(true); // Weaker = aggressive
    });

    test('should create scenario profiles', () => {
      const earlyGame = BattleAIUtils.createScenarioProfile('early_game');
      const midGame = BattleAIUtils.createScenarioProfile('mid_game');
      const lateGame = BattleAIUtils.createScenarioProfile('late_game');
      const boss = BattleAIUtils.createScenarioProfile('boss');
      const pvp = BattleAIUtils.createScenarioProfile('pvp');
      const training = BattleAIUtils.createScenarioProfile('training');

      expect(earlyGame.isAggressive).toBe(true); // Early game = aggressive
      expect(midGame.isBalanced).toBe(true); // Mid game = balanced
      expect(lateGame.isDefensive).toBe(true); // Late game = defensive
      expect(boss.isBalanced).toBe(true); // Boss = balanced
      expect(pvp.isTrickster).toBe(true); // PvP = trickster
      expect(training.isDefensive).toBe(true); // Training = defensive
    });

    test('should compare profiles correctly', () => {
      const profile1 = new AIDecisionProfile('profile1', AIDecisionStyle.BALANCED);
      const profile2 = new AIDecisionProfile('profile2', AIDecisionStyle.AGGRESSIVE, {
        [MoveCategory.DAMAGE]: 1.5,
        [MoveCategory.HEALING]: 0.5
      }, ['fire']);

      const comparison = BattleAIUtils.compareProfiles(profile1, profile2);

      expect(comparison.styleMatch).toBe(false);
      expect(comparison.weightDifference).toBeGreaterThan(0);
      expect(comparison.typePreferencesMatch).toBe(false);
      expect(comparison.totalDifference).toBeGreaterThan(1);
    });

    test('should get behavior description correctly', () => {
      const aggressive = AIDecisionProfile.aggressive('aggro');
      const defensive = AIDecisionProfile.defensive('defensive');
      const balanced = AIDecisionProfile.balanced('balanced');
      const trickster = AIDecisionProfile.trickster('trickster');
      const withTypes = new AIDecisionProfile('with_types', AIDecisionStyle.BALANCED, {}, ['fire', 'water']);

      expect(BattleAIUtils.getBehaviorDescription(aggressive)).toContain('aggressive');
      expect(BattleAIUtils.getBehaviorDescription(defensive)).toContain('defensive');
      expect(BattleAIUtils.getBehaviorDescription(balanced)).toContain('balanced');
      expect(BattleAIUtils.getBehaviorDescription(trickster)).toContain('trickster');
      expect(BattleAIUtils.getBehaviorDescription(withTypes)).toContain('fire');
    });

    test('should get threat level descriptions correctly', () => {
      expect(BattleAIUtils.getThreatLevelDescription(0.1)).toContain('Low threat');
      expect(BattleAIUtils.getThreatLevelDescription(0.4)).toContain('Medium threat');
      expect(BattleAIUtils.getThreatLevelDescription(0.6)).toContain('High threat');
      expect(BattleAIUtils.getThreatLevelDescription(0.8)).toContain('Critical threat');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete AI workflow', () => {
      const aiManager = new AIControllerManager();

      // Register multiple profiles
      aiManager.createStandardProfiles();

      // Create spirits with different characteristics
      const fireSpirit = new MockSpiritInstance('fire', 'Fire Spirit', 'fire', 15, 100, 60, 35, 70, 40, 40);
      const waterSpirit = new MockSpiritInstance('water', 'Water Spirit', 'water', 15, 100, 45, 50, 65, 55, 35);
      const damagedSpirit = new MockSpiritInstance('damaged', 'Damaged Spirit', 'neutral', 15, 100, 50, 40, 60, 45, 40);
      damagedSpirit.currentHP = 30; // 30% HP

      // Assign moves
      fireSpirit.knownMoves = ['fire_blast', 'basic_strike', 'heal'];
      waterSpirit.knownMoves = ['water_burst', 'basic_strike', 'heal'];
      damagedSpirit.knownMoves = ['basic_strike', 'heal', 'protect'];

      // Test different AI types
      const aggressiveAI = aiManager.getAIController('aggressive');
      const defensiveAI = aiManager.getAIController('defensive');
      const balancedAI = aiManager.getAIController('balanced');

      // Aggressive should prefer fire_blast vs water (type advantage)
      const aggressiveAction = aggressiveAI.selectMove(fireSpirit, waterSpirit);
      expect(aggressiveAction).toBe('fire_blast');

      // Damaged spirit should prefer healing
      const damagedAction = balancedAI.selectMove(damagedSpirit, waterSpirit);
      expect(damagedAction).toBe('heal');

      // Check threat assessments
      const fireThreat = aggressiveAI.evaluateThreatLevel(waterSpirit);
      const waterThreat = defensiveAI.evaluateThreatLevel(fireSpirit);

      expect(fireThreat).toBeGreaterThan(0); // Water is threat to fire
      expect(waterThreat).toBeGreaterThan(0); // Fire is threat to water
    });

    test('should handle adaptive profile creation', () => {
      const aiManager = new AIControllerManager();

      // Create spirits with different characteristics
      const spirits = [
        new MockSpiritInstance('high_attack', 'High Attack', 'fire', 15, 100, 80, 40, 20, 60, 40), // High attack
        new MockSpiritInstance('low_hp', 'Low HP', 'water', 15, 100, 50, 40, 60, 45, 40), // Low HP
        new MockSpiritInstance('high_defense', 'High Defense', 'earth', 15, 100, 45, 70, 50, 75, 40), // High defense
        new MockSpiritInstance('balanced', 'Balanced', 'neutral', 15, 100, 50, 50, 50, 50, 40) // Balanced
      ];

      spirits.forEach(spirit => {
        const adaptiveProfile = BattleAIUtils.createAdaptiveProfile(spirit);
        aiManager.registerProfile(adaptiveProfile);
      });

      // Test that adaptive profiles reflect spirit characteristics
      const highAttackProfile = aiManager.getProfile('adaptive_high_attack');
      const lowHpProfile = aiManager.getProfile('adaptive_low_hp');
      const highDefenseProfile = aiManager.getProfile('adaptive_high_defense');
      const balancedProfile = aiManager.getProfile('adaptive_balanced');

      expect(highAttackProfile?.isAggressive).toBe(true); // High attack = aggressive
      expect(lowHpProfile?.isDefensive).toBe(true); // Low HP = defensive
      expect(highDefenseProfile?.isBalanced).toBe(true); // High defense = balanced
      expect(balancedProfile?.isBalanced).toBe(true); // Balanced = balanced
    });

    test('should handle battle simulation', () => {
      const aiManager = new AIControllerManager();
      aiManager.createStandardProfiles();

      // Create two spirits
      const spirit1 = new MockSpiritInstance('1', 'Spirit 1', 'fire', 15, 100, 50, 40, 60, 45, 40);
      const spirit2 = new MockSpiritInstance('2', 'Spirit 2', 'water', 15, 100, 45, 45, 55, 50, 35);

      // Assign moves
      spirit1.knownMoves = ['fire_blast', 'basic_strike', 'heal'];
      spirit2.knownMoves = ['water_burst', 'basic_strike', 'heal'];

      const ai1 = aiManager.getAIController('aggressive');
      const ai2 = aiManager.getAIController('defensive');

      // Simulate a few turns
      let turn = 1;
      const maxTurns = 10;

      while (!spirit1.isFainted() && !spirit2.isFainted() && turn <= maxTurns) {
        // Spirit 1 attacks
        const move1 = ai1.selectMove(spirit1, spirit2);
        expect(move1).toBeTruthy();

        // Spirit 2 attacks
        const move2 = ai2.selectMove(spirit2, spirit1);
        expect(move2).toBeTruthy();

        // Simulate damage (simplified)
        if (move1 === 'fire_blast') {
          spirit2.takeDamage(40); // Fire vs Water advantage
        } else if (move1 === 'basic_strike') {
          spirit2.takeDamage(25);
        }

        if (move2 === 'water_burst') {
          spirit1.takeDamage(35); // Water vs Fire advantage
        } else if (move2 === 'basic_strike') {
          spirit1.takeDamage(20);
        }

        if (spirit2.isFainted() || spirit1.isFainted()) {
          break;
        }

        turn++;
      }

      // One spirit should be defeated or battle should end
      expect(turn <= maxTurns + 1).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many profiles efficiently', () => {
      const aiManager = new AIControllerManager();
      const startTime = performance.now();

      // Create and register many profiles
      for (let i = 0; i < 1000; i++) {
        const profile = new AIDecisionProfile(
          `profile_${i}`,
          i % 4 === 0 ? AIDecisionStyle.AGGRESSIVE :
          i % 4 === 1 ? AIDecisionStyle.DEFENSIVE :
          i % 4 === 2 ? AIDecisionStyle.BALANCED : AIDecisionStyle.TRICKSTER,
          {
            [MoveCategory.DAMAGE]: 0.5 + Math.random(),
            [MoveCategory.HEALING]: 0.5 + Math.random(),
            [MoveCategory.SUPPORT]: 0.5 + Math.random()
          },
          i % 3 === 0 ? [`type_${i % 5}`] : []
        );
        aiManager.registerProfile(profile);
      }

      const endTime = performance.now();

      expect(aiManager.getProfileCount()).toBe(1004); // 1000 + 4 standard
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should handle rapid AI decisions efficiently', () => {
      const aiManager = new AIControllerManager();
      aiManager.createStandardProfiles();

      const spirit = new MockSpiritInstance('1', 'Test Spirit', 'fire', 15, 100, 50, 40, 60, 45, 40);
      const opponent = new MockSpiritInstance('2', 'Opponent', 'water', 15, 100, 40, 45, 55, 50, 35);

      // Add many moves
      spirit.knownMoves = Array.from({ length: 50 }, (_, i) => `move_${i}`);
      opponent.knownMoves = Array.from({ length: 50 }, (_, i) => `move_${i}`);

      const ai = aiManager.getAIController('balanced');

      const startTime = performance.now();

      // Make many decisions
      for (let i = 0; i < 1000; i++) {
        ai.selectMove(spirit, opponent);
        ai.evaluateThreatLevel(opponent);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle complex profile comparisons efficiently', () => {
      const aiManager = new AIControllerManager();
      const profiles: AIDecisionProfile[] = [];

      // Create many profiles
      for (let i = 0; i < 500; i++) {
        const profile = new AIDecisionProfile(
          `complex_profile_${i}`,
          i % 4 === 0 ? AIDecisionStyle.AGGRESSIVE :
          i % 4 === 1 ? AIDecisionStyle.DEFENSIVE :
          i % 4 === 2 ? AIDecisionStyle.BALANCED : AIDecisionStyle.TRICKSTER,
          {
            [MoveCategory.DAMAGE]: 0.5 + Math.random(),
            [MoveCategory.HEALING]: 0.5 + Math.random(),
            [MoveCategory.SUPPORT]: 0.5 + Math.random()
          },
          i % 2 === 0 ? [`type_${i % 10}`] : []
        );
        profiles.push(profile);
        aiManager.registerProfile(profile);
      }

      const referenceProfile = AIDecisionProfile.balanced('reference');

      const startTime = performance.now();

      // Compare all profiles to reference
      for (let i = 0; i < 100; i++) {
        const profile = profiles[i];
        BattleAIUtils.compareProfiles(referenceProfile, profile);
        BattleAIUtils.getBehaviorDescription(profile);
        profile.validate({});
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
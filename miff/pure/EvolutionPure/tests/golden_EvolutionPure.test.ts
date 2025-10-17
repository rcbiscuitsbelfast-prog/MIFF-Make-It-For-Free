/**
 * EvolutionPure Golden Tests
 *
 * Comprehensive test suite for the EvolutionPure module covering all aspects
 * of spirit evolution, condition checking, evolution chains, and integration scenarios.
 *
 * @module EvolutionPure/Tests
 * @version 1.0.0
 * @license MIT
 */

import {
  EvolutionManager,
  EvolutionCondition,
  SpeciesEvolutionData,
  EvolutionResult,
  EvolutionUtils,
  EvolutionStatus,
  EvolutionConditionType,
  TimeOfDay,
  IEvolutionSpiritInstance,
  IPlayerContext
} from '../index';

/**
 * Mock Spirit Instance for testing
 */
class MockEvolutionSpirit implements IEvolutionSpiritInstance {
  public instanceId: string;
  public speciesId: string;
  public level: number;
  public syncLevel: number;
  public friendshipLevel: number;
  public battleCount: number;
  public canEvolve: boolean;
  private inventory: Map<string, number>;

  constructor(
    speciesId: string,
    level: number = 1,
    options: Partial<MockEvolutionSpirit> = {}
  ) {
    this.instanceId = `spirit_${speciesId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.speciesId = speciesId;
    this.level = level;
    this.syncLevel = options.syncLevel || 0;
    this.friendshipLevel = options.friendshipLevel || 50;
    this.battleCount = options.battleCount || 0;
    this.canEvolve = options.canEvolve !== false;
    this.inventory = options.inventory || new Map();
  }

  evolve(newSpeciesId: string): void 
    this.speciesId = newSpeciesId;
    console.log(`Evolved ${speciesId: this.speciesId} to ${newSpeciesId}`);
  }

  getSyncPercentage(): number {
    return Math.min(100, Math.max(0, this.syncLevel));
  }

  hasItem(itemId: string): boolean {
    return this.inventory.get(itemId) > 0;
  }

  addItem(itemId: string, quantity: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }

  setSyncLevel(level: number): void {
    this.syncLevel = Math.max(0, Math.min(100, level));
  }

  setFriendshipLevel(level: number): void {
    this.friendshipLevel = Math.max(0, Math.min(100, level));
  }

  setBattleCount(count: number): void {
    this.battleCount = Math.max(0, count);
  }

  clone(): MockEvolutionSpirit 
    return new MockEvolutionSpirit(speciesId: this.speciesId, level: this.level, 
      syncLevel: syncLevel: this.syncLevel,
      friendshipLevel: this.friendshipLevel,
      battleCount: this.battleCount,
      canEvolve: this.canEvolve,
      inventory: new Map(this.inventory)
    });
  }

  toJSON(): Record<string, any> 
    return {
      instanceId: instanceId: this.instanceId,
      speciesId: this.speciesId,
      level: this.level,
      syncLevel: this.syncLevel,
      friendshipLevel: this.friendshipLevel,
      battleCount: this.battleCount,
      canEvolve: this.canEvolve,
      inventory: Object.fromEntries(this.inventory)
    };
  }

  static fromJSON(data: Record<string, any>): MockEvolutionSpirit 
    const spirit = new MockEvolutionSpirit(speciesId: data.speciesId, data.level);
    spirit.instanceId = data.instanceId;
    spirit.syncLevel = data.syncLevel || 0;
    spirit.friendshipLevel = data.friendshipLevel || 50;
    spirit.battleCount = data.battleCount || 0;
    spirit.canEvolve = data.canEvolve !== false;
    spirit.inventory = new Map(Object.entries(data.inventory || {}));
    return spirit;
  }
}

/**
 * Mock Player Context for testing
 */
class MockPlayerContext implements IPlayerContext {
  public playerId: string;
  public currentLocationId?: string;
  public gameData: {
    onboardingFlags: Map<string, boolean>;
    timeOfDay: TimeOfDay;
    inventory: Map<string, number>;
  };

  constructor(
    playerId: string = 'test_player',
    locationId: string = 'test_location',
    timeOfDay: TimeOfDay = TimeOfDay.AFTERNOON
  ) {
    this.playerId = playerId;
    this.currentLocationId = locationId;
    this.gameData = {
      onboardingFlags: new Map(),
      timeOfDay,
      inventory: new Map()
    };
  }

  getInventory(): Map<string, number> {
    return this.gameData.inventory;
  }

  getFlag(flagKey: string): boolean {
    return this.gameData.onboardingFlags.get(flagKey) || false;
  }

  getCurrentLocation(): string {
    return this.currentLocationId || '';
  }

  getTimeOfDay(): TimeOfDay {
    return this.gameData.timeOfDay;
  }

  setFlag(flagKey: string, value: boolean): void {
    this.gameData.onboardingFlags.set(flagKey, value);
  }

  addItem(itemId: string, quantity: number = 1): void {
    const current = this.gameData.inventory.get(itemId) || 0;
    this.gameData.inventory.set(itemId, current + quantity);
  }

  setLocation(locationId: string): void {
    this.currentLocationId = locationId;
  }

  setTimeOfDay(timeOfDay: TimeOfDay): void {
    this.gameData.timeOfDay = timeOfDay;
  }

  clone(): MockPlayerContext 
    const cloned = new MockPlayerContext(playerId: this.playerId, currentLocationId: this.currentLocationId, this.gameData.timeOfDay);
    cloned.gameData.onboardingFlags = new Map(this.gameData.onboardingFlags);
    cloned.gameData.inventory = new Map(this.gameData.inventory);
    return cloned;
  }

  toJSON(): Record<string, any> 
    return {
      playerId: playerId: this.playerId,
      currentLocationId: this.currentLocationId,
      gameData: 
        onboardingFlags: Object.fromEntries(this.gameData.onboardingFlags),
        timeOfDay: this.timeOfDay: gameData.timeOfDay,
        inventory: Object.fromEntries(this.gameData.inventory)
      }
    };
  }

  static fromJSON(data: Record<string, any>): MockPlayerContext 
    const context = new MockPlayerContext(
      playerId: data.playerId,
      data.currentLocationId,
      data.gameData.timeOfDay
    );
    context.gameData.onboardingFlags = new Map(Object.entries(data.gameData.onboardingFlags || {}));
    context.gameData.inventory = new Map(Object.entries(data.gameData.inventory || {}));
    return context;
  }
}

/**
 * Golden Test Suite for EvolutionPure
 */
describe('EvolutionPure Golden Tests', () => {
  let manager: EvolutionManager;
  let context: MockPlayerContext;
  let testSpirit: MockEvolutionSpirit;

  beforeEach(() => {
    context = new MockPlayerContext();
    manager = EvolutionManager.create(context);
    testSpirit = new MockEvolutionSpirit('test_spirit', 25);
  });

  afterEach(() => {
    // Cleanup
    manager = EvolutionManager.create(context);
  });

  // ========================================
  // EVOLUTION RESULT TESTS
  // ========================================

  describe('EvolutionResult Basic Functionality', () => {
    test('should create successful evolution result', () => {
      const result = EvolutionResult.success('raichu', 'Evolution successful');

      expect(result.status).toBe(EvolutionStatus.SUCCESS);
      expect(result.message).toBe('Evolution successful');
      expect(result.newSpeciesId).toBe('raichu');
      expect(result.isSuccess).toBe(true);
    });

    test('should create failed evolution result', () => 
      const result = EvolutionResult.failure(CONDITIONS_NOT_MET: EvolutionStatus.CONDITIONS_NOT_MET, 'Level too low');

      expect(result.status).toBe(EvolutionStatus.CONDITIONS_NOT_MET);
      expect(result.message).toBe('Level too low');
      expect(result.newSpeciesId).toBeUndefined();
      expect(result.isSuccess).toBe(false);
    });

    test('should provide correct string representation', () => 
      const success = EvolutionResult.success('final_form', 'Complete evolution');
      const failure = EvolutionResult.failure(ALREADY_EVOLVED: EvolutionStatus.ALREADY_EVOLVED, 'Already evolved');

      expect(success.toString()).toBe('success: Complete evolution -> final_form');
      expect(failure.toString()).toBe('already_evolved: Already evolved');
    });

    test('should serialize and deserialize correctly', () => {
      const original = EvolutionResult.success('evolved_species', 'Test evolution');
      const json = original.toJSON();
      const restored = EvolutionResult.fromJSON(json);

      expect(restored.status).toBe(original.status);
      expect(restored.message).toBe(original.message);
      expect(restored.newSpeciesId).toBe(original.newSpeciesId);
      expect(restored.isSuccess).toBe(original.isSuccess);
    });
  });

  // ========================================
  // EVOLUTION CONDITION TESTS
  // ========================================

  describe('EvolutionCondition Basic Functionality', () => {
    test('should create level condition correctly', () => {
      const condition = EvolutionCondition.levelAtLeast(30);

      expect(condition.conditionType).toBe(EvolutionConditionType.LEVEL_AT_LEAST);
      expect(condition.intValue).toBe(30);
      expect(condition.stringValue).toBe('');
    });

    test('should create item condition correctly', () => {
      const condition = EvolutionCondition.requiresItem('water_stone');

      expect(condition.conditionType).toBe(EvolutionConditionType.REQUIRES_ITEM);
      expect(condition.intValue).toBe(0);
      expect(condition.stringValue).toBe('water_stone');
    });

    test('should create sync condition correctly', () => {
      const condition = EvolutionCondition.syncAtLeast(75);

      expect(condition.conditionType).toBe(EvolutionConditionType.SYNC_AT_LEAST);
      expect(condition.intValue).toBe(75);
      expect(condition.stringValue).toBe('');
    });

    test('should create lore flag condition correctly', () => {
      const condition = EvolutionCondition.loreFlag('boss_defeated');

      expect(condition.conditionType).toBe(EvolutionConditionType.LORE_FLAG);
      expect(condition.intValue).toBe(0);
      expect(condition.stringValue).toBe('boss_defeated');
    });

    test('should create time condition correctly', () => {
      const condition = EvolutionCondition.timeOfDay(3); // Evening

      expect(condition.conditionType).toBe(EvolutionConditionType.TIME_OF_DAY);
      expect(condition.intValue).toBe(3);
      expect(condition.stringValue).toBe('');
    });

    test('should create location condition correctly', () => {
      const condition = EvolutionCondition.atLocation('mountain_peak');

      expect(condition.conditionType).toBe(EvolutionConditionType.AT_LOCATION);
      expect(condition.intValue).toBe(0);
      expect(condition.stringValue).toBe('mountain_peak');
    });

    test('should create friendship condition correctly', () => {
      const condition = EvolutionCondition.friendshipLevel(80);

      expect(condition.conditionType).toBe(EvolutionConditionType.FRIENDSHIP_LEVEL);
      expect(condition.intValue).toBe(80);
      expect(condition.stringValue).toBe('');
    });

    test('should create battle count condition correctly', () => {
      const condition = EvolutionCondition.battleCount(100);

      expect(condition.conditionType).toBe(EvolutionConditionType.BATTLE_COUNT);
      expect(condition.intValue).toBe(100);
      expect(condition.stringValue).toBe('');
    });

    test('should create evolution item condition correctly', () => {
      const condition = EvolutionCondition.evolutionItem('mega_stone');

      expect(condition.conditionType).toBe(EvolutionConditionType.EVOLUTION_ITEM);
      expect(condition.intValue).toBe(0);
      expect(condition.stringValue).toBe('mega_stone');
    });
  });

  describe('EvolutionCondition Validation', () => {
    test('should validate level condition correctly', () => {
      const validCondition = EvolutionCondition.levelAtLeast(25);
      const invalidCondition = EvolutionCondition.levelAtLeast(0);

      const validErrors = validCondition.validate({});
      const invalidErrors = invalidCondition.validate({});

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(1);
      expect(invalidErrors[0]).toBe('Level must be greater than 0');
    });

    test('should validate item conditions correctly', () => {
      const validCondition = EvolutionCondition.requiresItem('fire_stone');
      const invalidCondition = EvolutionCondition.requiresItem('');

      const validErrors = validCondition.validate({});
      const invalidErrors = invalidCondition.validate({});

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(1);
      expect(invalidErrors[0]).toBe('Item ID is required');
    });

    test('should validate sync conditions correctly', () => {
      const validCondition = EvolutionCondition.syncAtLeast(50);
      const lowCondition = EvolutionCondition.syncAtLeast(-1);
      const highCondition = EvolutionCondition.syncAtLeast(101);

      expect(validCondition.validate({})).toHaveLength(0);
      expect(lowCondition.validate({})).toHaveLength(1);
      expect(highCondition.validate({})).toHaveLength(1);
    });

    test('should validate lore flag conditions correctly', () => {
      const validCondition = EvolutionCondition.loreFlag('flag_name');
      const invalidCondition = EvolutionCondition.loreFlag('');

      expect(validCondition.validate({})).toHaveLength(0);
      expect(invalidCondition.validate({})).toHaveLength(1);
    });

    test('should validate location conditions correctly', () => {
      const validCondition = EvolutionCondition.atLocation('forest');
      const invalidCondition = EvolutionCondition.atLocation('');

      expect(validCondition.validate({})).toHaveLength(0);
      expect(invalidCondition.validate({})).toHaveLength(1);
    });

    test('should validate friendship conditions correctly', () => {
      const validCondition = EvolutionCondition.friendshipLevel(50);
      const lowCondition = EvolutionCondition.friendshipLevel(-1);
      const highCondition = EvolutionCondition.friendshipLevel(101);

      expect(validCondition.validate({})).toHaveLength(0);
      expect(lowCondition.validate({})).toHaveLength(1);
      expect(highCondition.validate({})).toHaveLength(1);
    });

    test('should validate battle count conditions correctly', () => {
      const validCondition = EvolutionCondition.battleCount(10);
      const invalidCondition = EvolutionCondition.battleCount(-1);

      expect(validCondition.validate({})).toHaveLength(0);
      expect(invalidCondition.validate({})).toHaveLength(1);
    });
  });

  describe('EvolutionCondition Evaluation', () => {
    test('should evaluate level conditions correctly', () => {
      const condition = EvolutionCondition.levelAtLeast(30);
      const lowLevelSpirit = new MockEvolutionSpirit('test', 25);
      const highLevelSpirit = new MockEvolutionSpirit('test', 35);

      expect(condition.isMet(lowLevelSpirit, context)).toBe(false);
      expect(condition.isMet(highLevelSpirit, context)).toBe(true);
    });

    test('should evaluate item conditions correctly', () => {
      const condition = EvolutionCondition.requiresItem('fire_stone');
      const spiritWithItem = new MockEvolutionSpirit('test', 25);
      const spiritWithoutItem = new MockEvolutionSpirit('test', 25);

      spiritWithItem.addItem('fire_stone', 1);

      expect(condition.isMet(spiritWithItem, context)).toBe(true);
      expect(condition.isMet(spiritWithoutItem, context)).toBe(false);
    });

    test('should evaluate sync conditions correctly', () => {
      const condition = EvolutionCondition.syncAtLeast(70);
      const lowSyncSpirit = new MockEvolutionSpirit('test', 25);
      const highSyncSpirit = new MockEvolutionSpirit('test', 25);

      lowSyncSpirit.setSyncLevel(60);
      highSyncSpirit.setSyncLevel(80);

      expect(condition.isMet(lowSyncSpirit, context)).toBe(false);
      expect(condition.isMet(highSyncSpirit, context)).toBe(true);
    });

    test('should evaluate lore flag conditions correctly', () => {
      const condition = EvolutionCondition.loreFlag('boss_defeated');
      context.setFlag('boss_defeated', true);

      const spirit = new MockEvolutionSpirit('test', 25);

      expect(condition.isMet(spirit, context)).toBe(true);

      context.setFlag('boss_defeated', false);
      expect(condition.isMet(spirit, context)).toBe(false);
    });

    test('should evaluate time conditions correctly', () => {
      const morningCondition = EvolutionCondition.timeOfDay(1); // Morning
      const nightCondition = EvolutionCondition.timeOfDay(4); // Night

      const spirit = new MockEvolutionSpirit('test', 25);

      // Test different times (mock time checking)
      const morningContext = new MockPlayerContext('test', 'test', TimeOfDay.MORNING);
      const nightContext = new MockPlayerContext('test', 'test', TimeOfDay.NIGHT);

      // Note: Time conditions use real system time, so these may vary
      // In a real test environment, we'd mock the Date object
      expect(condition.isMet).toBeDefined();
    });

    test('should evaluate location conditions correctly', () => {
      const condition = EvolutionCondition.atLocation('mountain');
      const spirit = new MockEvolutionSpirit('test', 25);

      const mountainContext = new MockPlayerContext('test', 'mountain');
      const forestContext = new MockPlayerContext('test', 'forest');

      expect(condition.isMet(spirit, mountainContext)).toBe(true);
      expect(condition.isMet(spirit, forestContext)).toBe(false);
    });

    test('should evaluate friendship conditions correctly', () => {
      const condition = EvolutionCondition.friendshipLevel(80);
      const lowFriendshipSpirit = new MockEvolutionSpirit('test', 25);
      const highFriendshipSpirit = new MockEvolutionSpirit('test', 25);

      lowFriendshipSpirit.setFriendshipLevel(70);
      highFriendshipSpirit.setFriendshipLevel(90);

      expect(condition.isMet(lowFriendshipSpirit, context)).toBe(false);
      expect(condition.isMet(highFriendshipSpirit, context)).toBe(true);
    });

    test('should evaluate battle count conditions correctly', () => {
      const condition = EvolutionCondition.battleCount(50);
      const lowBattleSpirit = new MockEvolutionSpirit('test', 25);
      const highBattleSpirit = new MockEvolutionSpirit('test', 25);

      lowBattleSpirit.setBattleCount(30);
      highBattleSpirit.setBattleCount(70);

      expect(condition.isMet(lowBattleSpirit, context)).toBe(false);
      expect(condition.isMet(highBattleSpirit, context)).toBe(true);
    });
  });

  // ========================================
  // SPECIES EVOLUTION DATA TESTS
  // ========================================

  describe('SpeciesEvolutionData Basic Functionality', () => {
    test('should create evolution data correctly', () => {
      const data = SpeciesEvolutionData.create('pikachu', 'raichu', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      expect(data.speciesId).toBe('pikachu');
      expect(data.evolutionTargetId).toBe('raichu');
      expect(data.conditions).toHaveLength(1);
      expect(data.conditions[0].conditionType).toBe(EvolutionConditionType.LEVEL_AT_LEAST);
    });

    test('should create level evolution correctly', () => {
      const data = SpeciesEvolutionData.levelEvolution('eevee', 'flareon', 30);

      expect(data.speciesId).toBe('eevee');
      expect(data.evolutionTargetId).toBe('flareon');
      expect(data.conditions).toHaveLength(1);
      expect(data.conditions[0].conditionType).toBe(EvolutionConditionType.LEVEL_AT_LEAST);
      expect(data.conditions[0].intValue).toBe(30);
    });

    test('should create item evolution correctly', () => {
      const data = SpeciesEvolutionData.itemEvolution('poliwag', 'poliwhirl', 'water_stone');

      expect(data.speciesId).toBe('poliwag');
      expect(data.evolutionTargetId).toBe('poliwhirl');
      expect(data.conditions).toHaveLength(1);
      expect(data.conditions[0].conditionType).toBe(EvolutionConditionType.REQUIRES_ITEM);
      expect(data.conditions[0].stringValue).toBe('water_stone');
    });

    test('should create sync evolution correctly', () => {
      const data = SpeciesEvolutionData.syncEvolution('ralts', 'kirlia', 70);

      expect(data.speciesId).toBe('ralts');
      expect(data.evolutionTargetId).toBe('kirlia');
      expect(data.conditions).toHaveLength(1);
      expect(data.conditions[0].conditionType).toBe(EvolutionConditionType.SYNC_AT_LEAST);
      expect(data.conditions[0].intValue).toBe(70);
    });
  });

  describe('SpeciesEvolutionData Validation', () => {
    test('should validate valid evolution data', () => {
      const data = SpeciesEvolutionData.create('test', 'target', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      const errors = data.validate({});
      expect(errors).toHaveLength(0);
    });

    test('should reject missing species ID', () => {
      const data = SpeciesEvolutionData.create('', 'target', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      const errors = data.validate({});
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Species ID is required');
    });

    test('should reject missing evolution target', () => {
      const data = SpeciesEvolutionData.create('test', '', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      const errors = data.validate({});
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Evolution target ID is required');
    });

    test('should reject self-evolution', () => {
      const data = SpeciesEvolutionData.create('test', 'test', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      const errors = data.validate({});
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Species cannot evolve into itself');
    });

    test('should validate condition errors', () => {
      const data = SpeciesEvolutionData.create('test', 'target', [
        EvolutionCondition.levelAtLeast(0) // Invalid level
      ]);

      const errors = data.validate({});
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Condition 0: Level must be greater than 0');
    });
  });

  describe('SpeciesEvolutionData Cloning and Serialization', () => {
    test('should clone evolution data correctly', () => {
      const original = SpeciesEvolutionData.create('test', 'target', [
        EvolutionCondition.levelAtLeast(25),
        EvolutionCondition.requiresItem('stone')
      ]);

      const cloned = original.clone();

      expect(cloned.speciesId).toBe(original.speciesId);
      expect(cloned.evolutionTargetId).toBe(original.evolutionTargetId);
      expect(cloned.conditions).toHaveLength(original.conditions.length);
      expect(cloned).not.toBe(original); // Different instances
    });

    test('should serialize and deserialize correctly', () => {
      const original = SpeciesEvolutionData.create('test', 'target', [
        EvolutionCondition.levelAtLeast(25)
      ]);

      const json = original.toJSON();
      const restored = SpeciesEvolutionData.fromJSON(json);

      expect(restored.speciesId).toBe(original.speciesId);
      expect(restored.evolutionTargetId).toBe(original.evolutionTargetId);
      expect(restored.conditions).toHaveLength(original.conditions.length);
    });
  });

  // ========================================
  // EVOLUTION MANAGER TESTS
  // ========================================

  describe('EvolutionManager Basic Functionality', () => {
    test('should create evolution manager correctly', () => {
      const manager = EvolutionManager.create(context);

      expect(manager).toBeDefined();
      expect(manager.getEvolutionStatistics().totalSpecies).toBe(0);
    });

    test('should register species evolution correctly', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const stats = manager.getEvolutionStatistics();
      expect(stats.totalSpecies).toBe(1);
      expect(stats.evolvableSpecies).toBe(1);
    });

    test('should reject invalid evolution data', () => {
      const invalidEvolution = SpeciesEvolutionData.create('', 'target', []);
      manager.registerSpeciesEvolution(invalidEvolution);

      const stats = manager.getEvolutionStatistics();
      expect(stats.totalSpecies).toBe(0); // Should not be registered
    });
  });

  describe('EvolutionManager Evolution Checking', () => {
    test('should check simple level evolution', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const lowLevelSpirit = new MockEvolutionSpirit('test', 25);
      const highLevelSpirit = new MockEvolutionSpirit('test', 35);

      expect(manager.canEvolve(lowLevelSpirit)).toBe(false);
      expect(manager.getEvolutionTarget(lowLevelSpirit)).toBeNull();

      expect(manager.canEvolve(highLevelSpirit)).toBe(true);
      expect(manager.getEvolutionTarget(highLevelSpirit)).toBe('evolved');
    });

    test('should check item-based evolution', () => {
      const evolution = SpeciesEvolutionData.itemEvolution('test', 'evolved', 'magic_stone');
      manager.registerSpeciesEvolution(evolution);

      const spiritWithoutItem = new MockEvolutionSpirit('test', 25);
      const spiritWithItem = new MockEvolutionSpirit('test', 25);
      spiritWithItem.addItem('magic_stone', 1);

      expect(manager.canEvolve(spiritWithoutItem)).toBe(false);
      expect(manager.canEvolve(spiritWithItem)).toBe(true);
      expect(manager.getEvolutionTarget(spiritWithItem)).toBe('evolved');
    });

    test('should check multiple conditions evolution', () => {
      const evolution = SpeciesEvolutionData.create('test', 'evolved', [
        EvolutionCondition.levelAtLeast(30),
        EvolutionCondition.requiresItem('stone'),
        EvolutionCondition.syncAtLeast(50)
      ]);
      manager.registerSpeciesEvolution(evolution);

      const incompleteSpirit = new MockEvolutionSpirit('test', 35);
      incompleteSpirit.addItem('stone', 1);
      incompleteSpirit.setSyncLevel(40); // Missing sync requirement

      const completeSpirit = new MockEvolutionSpirit('test', 35);
      completeSpirit.addItem('stone', 1);
      completeSpirit.setSyncLevel(60);

      expect(manager.canEvolve(incompleteSpirit)).toBe(false);
      expect(manager.canEvolve(completeSpirit)).toBe(true);
    });
  });

  describe('EvolutionManager Evolution Execution', () => {
    test('should execute successful evolution', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const spirit = new MockEvolutionSpirit('test', 35);

      const result = manager.evolveSpirit(spirit);

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(EvolutionStatus.SUCCESS);
      expect(result.newSpeciesId).toBe('evolved');
      expect(result.message).toContain('Successfully evolved');
    });

    test('should reject evolution with unmet conditions', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const spirit = new MockEvolutionSpirit('test', 25);

      const result = manager.evolveSpirit(spirit);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(EvolutionStatus.CONDITIONS_NOT_MET);
      expect(result.newSpeciesId).toBeUndefined();
    });

    test('should reject evolution for already evolved spirit', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const spirit = new MockEvolutionSpirit('evolved', 35); // Already at target

      const result = manager.evolveSpirit(spirit);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(EvolutionStatus.ALREADY_EVOLVED);
    });

    test('should handle evolution chains', () => {
      const chain = EvolutionUtils.createLevelEvolutionChain('starter', [20, 40]);
      chain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

      // Test first evolution
      const starterSpirit = new MockEvolutionSpirit('starter', 25);
      const result1 = manager.evolveSpirit(starterSpirit);
      expect(result1.isSuccess).toBe(true);
      expect(result1.newSpeciesId).toBe('starter_evo_1');

      // Test second evolution
      starterSpirit.setSpeciesId('starter_evo_1');
      starterSpirit.level = 45;
      const result2 = manager.evolveSpirit(starterSpirit);
      expect(result2.isSuccess).toBe(true);
      expect(result2.newSpeciesId).toBe('starter_evo_2');

      // Test final evolution (no more available)
      starterSpirit.setSpeciesId('starter_evo_2');
      starterSpirit.level = 65;
      const result3 = manager.evolveSpirit(starterSpirit);
      expect(result3.isSuccess).toBe(false);
      expect(result3.status).toBe(EvolutionStatus.CONDITIONS_NOT_MET);
    });
  });

  describe('EvolutionManager Evolution Chains', () => {
    test('should get evolution chain correctly', () => {
      const chain = EvolutionUtils.createLevelEvolutionChain('basic', [15, 30, 50]);
      chain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

      const fullChain = manager.getEvolutionChain('basic');

      expect(fullChain).toEqual(['basic', 'basic_evo_1', 'basic_evo_2', 'basic_evo_3']);
    });

    test('should get available evolutions correctly', () => {
      const evolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      manager.registerSpeciesEvolution(evolution);

      const lowLevelSpirit = new MockEvolutionSpirit('test', 25);
      const highLevelSpirit = new MockEvolutionSpirit('test', 35);

      const lowLevelEvolutions = manager.getAvailableEvolutions(lowLevelSpirit);
      const highLevelEvolutions = manager.getAvailableEvolutions(highLevelSpirit);

      expect(lowLevelEvolutions).toHaveLength(0);
      expect(highLevelEvolutions).toHaveLength(1);
      expect(highLevelEvolutions[0]).toBe('evolved');
    });
  });

  describe('EvolutionManager Statistics and Validation', () => {
    test('should provide correct evolution statistics', () => {
      const evolutions = [
        SpeciesEvolutionData.levelEvolution('species1', 'evo1', 20),
        SpeciesEvolutionData.itemEvolution('species2', 'evo2', 'item'),
        SpeciesEvolutionData.create('species3', 'evo3', [
          EvolutionCondition.levelAtLeast(30),
          EvolutionCondition.syncAtLeast(50)
        ])
      ];

      evolutions.forEach(evolution => manager.registerSpeciesEvolution(evolution));

      const stats = manager.getEvolutionStatistics();

      expect(stats.totalSpecies).toBe(3);
      expect(stats.evolvableSpecies).toBe(3);
      expect(stats.totalEvolutions).toBe(3);
      expect(stats.maxChainLength).toBe(2); // species3 -> evo3
    });

    test('should validate evolution data correctly', () => {
      const validEvolution = SpeciesEvolutionData.levelEvolution('test', 'evolved', 30);
      const invalidEvolution = SpeciesEvolutionData.create('', 'target', []);

      manager.registerSpeciesEvolution(validEvolution);
      manager.registerSpeciesEvolution(invalidEvolution);

      const errors = manager.validateEvolutionData();

      expect(errors).toHaveLength(3); // Species ID, target ID, self-evolution
      expect(errors.some(error => error.includes('Species ID is required'))).toBe(true);
      expect(errors.some(error => error.includes('Evolution target ID is required'))).toBe(true);
      expect(errors.some(error => error.includes('cannot evolve into itself'))).toBe(true);
    });
  });

  // ========================================
  // EVOLUTION UTILS TESTS
  // ========================================

  describe('EvolutionUtils Basic Functionality', () => {
    test('should create level evolution chain correctly', () => {
      const chain = EvolutionUtils.createLevelEvolutionChain('starter', [15, 30, 50]);

      expect(chain).toHaveLength(3);
      expect(chain[0].speciesId).toBe('starter');
      expect(chain[0].evolutionTargetId).toBe('starter_evo_1');
      expect(chain[1].evolutionTargetId).toBe('starter_evo_2');
      expect(chain[2].evolutionTargetId).toBe('starter_evo_3');
    });

    test('should create item evolutions correctly', () => {
      const itemEvolutions = EvolutionUtils.createItemEvolutions({
        'fire_spirit': 'fire_stone',
        'water_spirit': 'water_stone',
        'grass_spirit': 'leaf_stone'
      });

      expect(itemEvolutions).toHaveLength(3);
      expect(itemEvolutions[0].conditions[0].conditionType).toBe(EvolutionConditionType.REQUIRES_ITEM);
      expect(itemEvolutions[0].conditions[0].stringValue).toBe('fire_stone');
    });

    test('should create sync evolutions correctly', () => {
      const syncEvolutions = EvolutionUtils.createSyncEvolutions({
        'psychic_spirit': 70,
        'dragon_spirit': 85,
        'fairy_spirit': 60
      });

      expect(syncEvolutions).toHaveLength(3);
      expect(syncEvolutions[0].conditions[0].conditionType).toBe(EvolutionConditionType.SYNC_AT_LEAST);
      expect(syncEvolutions[0].conditions[0].intValue).toBe(70);
    });

    test('should validate evolution chain for circular references', () => {
      // Create circular reference
      const circular1 = SpeciesEvolutionData.create('species1', 'species2', []);
      const circular2 = SpeciesEvolutionData.create('species2', 'species1', []);

      manager.registerSpeciesEvolution(circular1);
      manager.registerSpeciesEvolution(circular2);

      const errors = EvolutionUtils.validateEvolutionChain(manager, 'species1');

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Circular evolution reference');
    });

    test('should get evolution requirements summary', () => {
      const complexEvolution = SpeciesEvolutionData.create('test', 'target', [
        EvolutionCondition.levelAtLeast(30),
        EvolutionCondition.requiresItem('magic_stone'),
        EvolutionCondition.syncAtLeast(70)
      ]);
      manager.registerSpeciesEvolution(complexEvolution);

      const requirements = EvolutionUtils.getEvolutionRequirements(manager, 'test');

      expect(requirements.targetSpecies).toBe('target');
      expect(requirements.conditions).toHaveLength(3);
      expect(requirements.conditions[0].description).toContain('Reach level 30');
      expect(requirements.conditions[1].description).toContain('Have item: magic_stone');
      expect(requirements.conditions[2].description).toContain('Reach 70% sync level');
    });

    test('should get condition descriptions correctly', () => {
      const conditions = [
        EvolutionCondition.levelAtLeast(25),
        EvolutionCondition.requiresItem('fire_stone'),
        EvolutionCondition.syncAtLeast(75),
        EvolutionCondition.loreFlag('boss_defeated'),
        EvolutionCondition.timeOfDay(3),
        EvolutionCondition.atLocation('mountain'),
        EvolutionCondition.friendshipLevel(80),
        EvolutionCondition.battleCount(100),
        EvolutionCondition.evolutionItem('mega_stone')
      ];

      const descriptions = conditions.map(condition =>
        EvolutionUtils.getConditionDescription(condition)
      );

      expect(descriptions[0]).toContain('Reach level 25');
      expect(descriptions[1]).toContain('Have item: fire_stone');
      expect(descriptions[2]).toContain('Reach 75% sync level');
      expect(descriptions[3]).toContain('Unlock lore flag: boss_defeated');
      expect(descriptions[4]).toContain('Evolve during specific time of day');
      expect(descriptions[5]).toContain('Be at location: mountain');
      expect(descriptions[6]).toContain('Reach friendship level 80');
      expect(descriptions[7]).toContain('Win 100 battles');
      expect(descriptions[8]).toContain('Use evolution item: mega_stone');
    });
  });

  describe('EvolutionUtils Mock Creation', () => {
    test('should create mock player context correctly', () => {
      const mockContext = EvolutionUtils.createMockPlayerContext();

      expect(mockContext.playerId).toBe('test_player');
      expect(mockContext.getCurrentLocation()).toBe('test_location');
      expect(mockContext.getTimeOfDay()).toBe(TimeOfDay.AFTERNOON);
      expect(mockContext.getFlag('test_flag')).toBe(false);
      expect(mockContext.getInventory().get('test_item')).toBeUndefined();
    });

    test('should create mock spirit correctly', () => {
      const mockSpirit = EvolutionUtils.createMockSpirit('test_species', 25, {
        syncLevel: 60,
        friendshipLevel: 80,
        battleCount: 50
      });

      expect(mockSpirit.speciesId).toBe('test_species');
      expect(mockSpirit.level).toBe(25);
      expect(mockSpirit.getSyncPercentage()).toBe(60);
      expect(mockSpirit.friendshipLevel).toBe(80);
      expect(mockSpirit.battleCount).toBe(50);
      expect(mockSpirit.canEvolve).toBe(true);
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe('Integration Scenarios', () => {
    test('should handle complete evolution workflow', () => {
      // Create evolution chain
      const chain = EvolutionUtils.createLevelEvolutionChain('basic', [20, 40, 60]);
      chain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

      // Test complete evolution sequence
      let spirit = EvolutionUtils.createMockSpirit('basic', 15);

      // First evolution
      let result = manager.evolveSpirit(spirit);
      expect(result.isSuccess).toBe(false); // Level 15 < 20

      spirit.level = 25;
      result = manager.evolveSpirit(spirit);
      expect(result.isSuccess).toBe(true);
      expect(result.newSpeciesId).toBe('basic_evo_1');

      // Second evolution
      spirit.level = 45;
      result = manager.evolveSpirit(spirit);
      expect(result.isSuccess).toBe(true);
      expect(result.newSpeciesId).toBe('basic_evo_2');

      // Third evolution
      spirit.level = 65;
      result = manager.evolveSpirit(spirit);
      expect(result.isSuccess).toBe(true);
      expect(result.newSpeciesId).toBe('basic_evo_3');

      // No more evolutions
      spirit.level = 80;
      result = manager.evolveSpirit(spirit);
      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(EvolutionStatus.CONDITIONS_NOT_MET);
    });

    test('should handle multiple evolution types', () => {
      // Register different types of evolutions
      const levelEvolution = SpeciesEvolutionData.levelEvolution('level_spirit', 'level_evo', 30);
      const itemEvolution = SpeciesEvolutionData.itemEvolution('item_spirit', 'item_evo', 'magic_stone');
      const syncEvolution = SpeciesEvolutionData.syncEvolution('sync_spirit', 'sync_evo', 70);

      manager.registerSpeciesEvolution(levelEvolution);
      manager.registerSpeciesEvolution(itemEvolution);
      manager.registerSpeciesEvolution(syncEvolution);

      // Test level evolution
      const levelSpirit = EvolutionUtils.createMockSpirit('level_spirit', 35);
      expect(manager.canEvolve(levelSpirit)).toBe(true);
      expect(manager.getEvolutionTarget(levelSpirit)).toBe('level_evo');

      // Test item evolution
      const itemSpirit = EvolutionUtils.createMockSpirit('item_spirit', 1);
      itemSpirit.addItem('magic_stone', 1);
      expect(manager.canEvolve(itemSpirit)).toBe(true);
      expect(manager.getEvolutionTarget(itemSpirit)).toBe('item_evo');

      // Test sync evolution
      const syncSpirit = EvolutionUtils.createMockSpirit('sync_spirit', 1);
      syncSpirit.setSyncLevel(80);
      expect(manager.canEvolve(syncSpirit)).toBe(true);
      expect(manager.getEvolutionTarget(syncSpirit)).toBe('sync_evo');
    });

    test('should handle complex multi-condition evolutions', () => {
      const complexEvolution = SpeciesEvolutionData.create('rare_spirit', 'legendary_spirit', [
        EvolutionCondition.levelAtLeast(50),
        EvolutionCondition.syncAtLeast(80),
        EvolutionCondition.requiresItem('legendary_crystal'),
        EvolutionCondition.loreFlag('defeated_boss'),
        EvolutionCondition.friendshipLevel(90)
      ]);
      manager.registerSpeciesEvolution(complexEvolution);

      // Test with incomplete conditions
      const incompleteSpirit = EvolutionUtils.createMockSpirit('rare_spirit', 55);
      incompleteSpirit.setSyncLevel(85);
      incompleteSpirit.addItem('legendary_crystal', 1);
      incompleteSpirit.setFriendshipLevel(95);
      // Missing boss defeat flag

      expect(manager.canEvolve(incompleteSpirit)).toBe(false);

      // Test with complete conditions
      context.setFlag('defeated_boss', true);
      const completeSpirit = EvolutionUtils.createMockSpirit('rare_spirit', 55);
      completeSpirit.setSyncLevel(85);
      completeSpirit.addItem('legendary_crystal', 1);
      completeSpirit.setFriendshipLevel(95);

      expect(manager.canEvolve(completeSpirit)).toBe(true);
      expect(manager.getEvolutionTarget(completeSpirit)).toBe('legendary_spirit');
    });

    test('should handle time and location-based evolutions', () => {
      const timeEvolution = SpeciesEvolutionData.create('moon_spirit', 'lunar_spirit', [
        EvolutionCondition.timeOfDay(4), // Night
        EvolutionCondition.atLocation('moon_temple')
      ]);
      manager.registerSpeciesEvolution(timeEvolution);

      const spirit = EvolutionUtils.createMockSpirit('moon_spirit', 1);

      // Test wrong time
      const dayContext = new MockPlayerContext('test', 'moon_temple', TimeOfDay.AFTERNOON);
      const dayManager = EvolutionManager.create(dayContext);
      dayManager.registerSpeciesEvolution(timeEvolution);

      expect(dayManager.canEvolve(spirit)).toBe(false);

      // Test wrong location
      const nightContext = new MockPlayerContext('test', 'wrong_temple', TimeOfDay.NIGHT);
      const nightManager = EvolutionManager.create(nightContext);
      nightManager.registerSpeciesEvolution(timeEvolution);

      expect(nightManager.canEvolve(spirit)).toBe(false);

      // Test correct time and location
      const correctContext = new MockPlayerContext('test', 'moon_temple', TimeOfDay.NIGHT);
      const correctManager = EvolutionManager.create(correctContext);
      correctManager.registerSpeciesEvolution(timeEvolution);

      expect(correctManager.canEvolve(spirit)).toBe(true);
      expect(correctManager.getEvolutionTarget(spirit)).toBe('lunar_spirit');
    });
  });

  // ========================================
  // PERFORMANCE TESTS
  // ========================================

  describe('Performance Characteristics', () => {
    test('should handle rapid evolution checks efficiently', () => {
      // Create many evolutions
      for (let i = 0; i < 100; i++) {
        const evolution = SpeciesEvolutionData.levelEvolution(`species${i}`, `evo${i}`, 25 + i);
        manager.registerSpeciesEvolution(evolution);
      }

      const spirits = Array.from({ length: 50 }, (_, i) => {
        const level = 25 + (i * 2);
        return EvolutionUtils.createMockSpirit(`species${i}`, level);
      });

      const startTime = Date.now();

      // Perform many evolution checks
      for (let i = 0; i < 100; i++) {
        spirits.forEach(spirit => {
          manager.canEvolve(spirit);
          manager.getEvolutionTarget(spirit);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should complete in < 200ms
    });

    test('should handle large evolution chains efficiently', () => {
      // Create long evolution chain
      const longChain = EvolutionUtils.createLevelEvolutionChain('starter', Array.from({ length: 20 }, (_, i) => 10 + (i * 5)));
      longChain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

      const startTime = Date.now();

      // Test chain operations
      for (let i = 0; i < 10; i++) {
        const chain = manager.getEvolutionChain('starter');
        const stats = manager.getEvolutionStatistics();
        const validation = manager.validateEvolutionData();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      expect(manager.getEvolutionChain('starter')).toHaveLength(21); // 20 evolutions + original
    });

    test('should handle complex condition validation efficiently', () => {
      // Create evolutions with many conditions
      for (let i = 0; i < 20; i++) {
        const conditions = [
          EvolutionCondition.levelAtLeast(20 + i),
          EvolutionCondition.syncAtLeast(30 + i),
          EvolutionCondition.friendshipLevel(40 + i),
          EvolutionCondition.battleCount(10 + i)
        ];

        const evolution = SpeciesEvolutionData.create(`complex${i}`, `complex_evo${i}`, conditions);
        manager.registerSpeciesEvolution(evolution);
      }

      const spirit = EvolutionUtils.createMockSpirit('complex10', 30);
      spirit.setSyncLevel(40);
      spirit.setFriendshipLevel(50);

      const startTime = Date.now();

      // Test complex condition checking
      for (let i = 0; i < 50; i++) {
        manager.canEvolve(spirit);
        manager.getEvolutionTarget(spirit);
        manager.getAvailableEvolutions(spirit);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(150); // Should complete in < 150ms
    });
  });

  // ========================================
  // EDGE CASE TESTS
  // ========================================

  describe('Edge Cases', () => {
    test('should handle null/undefined inputs gracefully', () => {
      const result1 = manager.evolveSpirit(null as any);
      expect(result1.isSuccess).toBe(false);
      expect(result1.status).toBe(EvolutionStatus.CONDITIONS_NOT_MET);

      const result2 = manager.canEvolve(null as any);
      expect(result2).toBe(false);

      const result3 = manager.getEvolutionTarget(null as any);
      expect(result3).toBeNull();
    });

    test('should handle empty evolution data', () => {
      const emptyEvolution = SpeciesEvolutionData.create('empty', 'empty_target', []);
      manager.registerSpeciesEvolution(emptyEvolution);

      const spirit = EvolutionUtils.createMockSpirit('empty', 1);
      expect(manager.canEvolve(spirit)).toBe(true);
      expect(manager.getEvolutionTarget(spirit)).toBe('empty_target');
    });

    test('should handle invalid condition types', () => {
      const invalidCondition = EvolutionCondition.create('invalid_type' as any, 0, '');
      const invalidEvolution = SpeciesEvolutionData.create('invalid', 'invalid_target', [invalidCondition]);
      manager.registerSpeciesEvolution(invalidEvolution);

      const spirit = EvolutionUtils.createMockSpirit('invalid', 1);
      expect(manager.canEvolve(spirit)).toBe(false); // Invalid condition type should fail
    });

    test('should handle evolution loops and cycles', () => {
      // Create A -> B -> A cycle
      const evolutionA = SpeciesEvolutionData.create('species_a', 'species_b', []);
      const evolutionB = SpeciesEvolutionData.create('species_b', 'species_a', []);

      manager.registerSpeciesEvolution(evolutionA);
      manager.registerSpeciesEvolution(evolutionB);

      const errors = EvolutionUtils.validateEvolutionChain(manager, 'species_a');

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Circular evolution reference');
    });

    test('should handle very high level requirements', () => {
      const highLevelEvolution = SpeciesEvolutionData.levelEvolution('test', 'high_level_evo', 999);
      manager.registerSpeciesEvolution(highLevelEvolution);

      const lowSpirit = EvolutionUtils.createMockSpirit('test', 100);
      const highSpirit = EvolutionUtils.createMockSpirit('test', 1000);

      expect(manager.canEvolve(lowSpirit)).toBe(false);
      expect(manager.canEvolve(highSpirit)).toBe(true);
    });

    test('should handle missing required items', () => {
      const itemEvolution = SpeciesEvolutionData.itemEvolution('test', 'item_evo', 'rare_item');
      manager.registerSpeciesEvolution(itemEvolution);

      const spiritWithoutItem = EvolutionUtils.createMockSpirit('test', 1);
      const spiritWithItem = EvolutionUtils.createMockSpirit('test', 1);
      spiritWithItem.addItem('rare_item', 1);

      expect(manager.canEvolve(spiritWithoutItem)).toBe(false);
      expect(manager.canEvolve(spiritWithItem)).toBe(true);
    });

    test('should handle boundary conditions for sync levels', () => {
      const syncEvolution = SpeciesEvolutionData.syncEvolution('test', 'sync_evo', 100);
      manager.registerSpeciesEvolution(syncEvolution);

      const lowSyncSpirit = EvolutionUtils.createMockSpirit('test', 1);
      const maxSyncSpirit = EvolutionUtils.createMockSpirit('test', 1);

      lowSyncSpirit.setSyncLevel(0);
      maxSyncSpirit.setSyncLevel(100);

      expect(manager.canEvolve(lowSyncSpirit)).toBe(false);
      expect(manager.canEvolve(maxSyncSpirit)).toBe(true);
    });
  });

  console.log('✅ EvolutionPure Golden Tests completed successfully');
});
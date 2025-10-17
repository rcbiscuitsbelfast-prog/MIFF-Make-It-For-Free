/**
 * ChallengesPure Golden Tests
 *
 * Comprehensive tests for the ChallengesPure challenge management system.
 * Tests cover challenges, rulesets, results, managers, and integration scenarios.
 */

import {
  ChallengeManager,
  BattleChallenge,
  ChallengeResult,
  ChallengeRuleset,
  ChallengeUtils,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeOutcome,
  IChallengeFilter,
  IPlayerContext,
  IBattleChallenge,
  IChallengeRuleset,
  IChallengeResult
} from '../index';

// Mock Player Context for testing
class MockPlayerContext implements IPlayerContext {
  private questFlags = new Set<string>();
  private loreFlags = new Set<string>();
  private currentLocation = 'default_location';
  private playerLevel = 1;
  private completedChallenges = new Set<string>();
  private unlockedLocations = new Set<string>();
  private capturedSpirits = new Set<string>();

  hasQuestFlag(flagId: string): boolean {
    return this?.questFlags.has(flagId);
  }

  hasLoreFlag(flagId: string): boolean {
    return this?.loreFlags.has(flagId);
  }

  getCurrentLocationId(): string {
    return this?.currentLocation;
  }

  getPlayerLevel(): number {
    return this?.playerLevel;
  }

  getCompletedChallenges(): string[] {
    return Array.from(this.completedChallenges);
  }

  getUnlockedLocations(): string[] {
    return Array.from(this.unlockedLocations);
  }

  getCapturedSpirits(): string[] {
    return Array.from(this.capturedSpirits);
  }

  setQuestFlag(flagId: string): void {
    this?.questFlags.add(flagId);
  }

  setLoreFlag(flagId: string): void {
    this?.loreFlags.add(flagId);
  }

  setLocation(locationId: string): void {
    this?.currentLocation = locationId;
  }

  setPlayerLevel(level: number): void {
    this?.playerLevel = level;
  }

  completeChallenge(challengeId: string): void {
    this?.completedChallenges.add(challengeId);
  }

  unlockLocation(locationId: string): void {
    this?.unlockedLocations.add(locationId);
  }

  captureSpirit(spiritId: string): void {
    this?.capturedSpirits.add(spiritId);
  }
}

describe('ChallengesPure Golden Tests', () => {
  describe('ChallengeRuleset Basic Functionality', () => {
    test('should create ruleset with default values', () => {
      const ruleset = new ChallengeRuleset();
      expect(ruleset?.allowedSpiritTypes).toHaveLength(0);
      expect(ruleset?.turnLimit).toBe(0);
      expect(ruleset?.bannedItems).toHaveLength(0);
      expect(ruleset?.environmentTag).toBeUndefined();
    });

    test('should create ruleset with custom values', () => {
      const ruleset = new ChallengeRuleset(
        ['fire', 'water'],
        25,
        ['healing_potion', 'attack_boost'],
        'rain'
      );

      expect(ruleset?.allowedSpiritTypes).toEqual(['fire', 'water']);
      expect(ruleset?.turnLimit).toBe(25);
      expect(ruleset?.bannedItems).toEqual(['healing_potion', 'attack_boost']);
      expect(ruleset?.environmentTag).toBe('rain');
    });

    test('should create spirit restriction ruleset', () => {
      const ruleset = ChallengeRuleset?.spiritRestriction(['fire', 'water', 'earth']);
      expect(ruleset?.allowedSpiritTypes).toEqual(['fire', 'water', 'earth']);
      expect(ruleset?.turnLimit).toBe(0);
      expect(ruleset?.bannedItems).toHaveLength(0);
    });

    test('should create turn limit ruleset', () => {
      const ruleset = ChallengeRuleset?.turnLimit(30);
      expect(ruleset?.allowedSpiritTypes).toHaveLength(0);
      expect(ruleset?.turnLimit).toBe(30);
      expect(ruleset?.bannedItems).toHaveLength(0);
    });

    test('should create item ban ruleset', () => {
      const ruleset = ChallengeRuleset?.itemBan(['potion', 'elixir']);
      expect(ruleset?.allowedSpiritTypes).toHaveLength(0);
      expect(ruleset?.turnLimit).toBe(0);
      expect(ruleset?.bannedItems).toEqual(['potion', 'elixir']);
    });

    test('should create environmental ruleset', () => {
      const ruleset = ChallengeRuleset?.environmental('night');
      expect(ruleset?.allowedSpiritTypes).toHaveLength(0);
      expect(ruleset?.turnLimit).toBe(0);
      expect(ruleset?.bannedItems).toHaveLength(0);
      expect(ruleset?.environmentTag).toBe('night');
    });

    test('should check compliance correctly', () => {
      const ruleset = ChallengeRuleset?.create(
        ['fire', 'water'], // allowed types
        20,               // turn limit
        ['healing_potion'] // banned items
      );

      // Compliant party
      expect(ruleset?.isCompliant(['fire', 'water'], ['attack_boost'])).toBe(true);
      expect(ruleset?.isCompliant(['fire'], ['attack_boost', 'defense_boost'])).toBe(true);

      // Non-compliant: wrong spirit type
      expect(ruleset?.isCompliant(['earth', 'wind'], ['attack_boost'])).toBe(false);

      // Non-compliant: banned item
      expect(ruleset?.isCompliant(['fire'], ['healing_potion'])).toBe(false);

      // Non-compliant: both issues
      expect(ruleset?.isCompliant(['earth'], ['healing_potion'])).toBe(false);

      // No restrictions
      const openRuleset = new ChallengeRuleset();
      expect(openRuleset?.isCompliant(['any_spirit'], ['any_item'])).toBe(true);
    });

    test('should get description correctly', () => {
      const ruleset1 = new ChallengeRuleset();
      expect(ruleset1?.getDescription()).toBe('No special rules');

      const ruleset2 = ChallengeRuleset?.spiritRestriction(['fire']);
      expect(ruleset2?.getDescription()).toBe('Allowed spirits: fire');

      const ruleset3 = ChallengeRuleset?.turnLimit(25);
      expect(ruleset3?.getDescription()).toBe('Turn limit: 25');

      const ruleset4 = ChallengeRuleset?.itemBan(['potion']);
      expect(ruleset4?.getDescription()).toBe('Banned items: potion');

      const ruleset5 = ChallengeRuleset?.environmental('rain');
      expect(ruleset5?.getDescription()).toBe('Environment: rain');

      const ruleset6 = ChallengeRuleset?.create(
        ['fire', 'water'],
        30,
        ['potion', 'elixir'],
        'night'
      );
      expect(ruleset6?.getDescription()).toBe('Allowed spirits: fire, water; Turn limit: 30; Banned items: potion, elixir; Environment: night');
    });

    test('should validate correctly', () => {
      const validRuleset = ChallengeRuleset?.create(['fire'], 25, ['potion']);
      expect(validRuleset?.validate({})).toHaveLength(0);

      const invalidRuleset = ChallengeRuleset?.create([''], -5, ['']);
      const errors = invalidRuleset?.validate({});
      expect(errors).toContain('Turn limit cannot be negative');
      expect(errors).toContain('Allowed spirit types cannot contain empty strings');
      expect(errors).toContain('Banned items cannot contain empty strings');
    });

    test('should clone correctly', () => {
      const original = ChallengeRuleset?.create(['fire'], 25, ['potion'], 'rain');
      const clone = original?.clone();

      expect(clone).toEqual(original);
      expect(clone).not?.toBe(original);
      expect(clone?.allowedSpiritTypes).toEqual(original?.allowedSpiritTypes);
      expect(clone?.allowedSpiritTypes).not?.toBe(original?.allowedSpiritTypes);
    });

    test('should convert to/from JSON correctly', () => {
      const original = ChallengeRuleset?.create(['fire', 'water'], 30, ['potion'], 'night');
      const jsonData = original?.toJSON();
      const reconstructed = ChallengeRuleset?.fromJSON(jsonData);

      expect(reconstructed?.allowedSpiritTypes).toEqual(original?.allowedSpiritTypes);
      expect(reconstructed?.turnLimit).toBe(original?.turnLimit);
      expect(reconstructed?.bannedItems).toEqual(original?.bannedItems);
      expect(reconstructed?.environmentTag).toBe(original?.environmentTag);
    });
  });

  describe('ChallengeResult Basic Functionality', () => {
    test('should create result with default values', () => {
      const result = new ChallengeResult();
      expect(result?.outcome).toBe(ChallengeOutcome?.VICTORY);
      expect(result?.itemRewards).toEqual({});
      expect(result?.loreFlags).toHaveLength(0);
      expect(result?.syncChanges).toEqual({});
      expect(result?.completionTime).toBeUndefined();
      expect(result?.turnsTaken).toBeUndefined();
    });

    test('should create result with custom values', () => {
      const result = new ChallengeResult(
        ChallengeOutcome?.DEFEAT,
        { gold: 50 },
        ['flag1', 'flag2'],
        { spirit1: 10, spirit2: -5 },
        'Challenge failed due to timeout',
        1234567890,
        25
      );

      expect(result?.outcome).toBe(ChallengeOutcome?.DEFEAT);
      expect(result?.itemRewards).toEqual({ gold: 50 });
      expect(result?.loreFlags).toEqual(['flag1', 'flag2']);
      expect(result?.syncChanges).toEqual({ spirit1: 10, spirit2: -5 });
      expect(result?.message).toBe('Challenge failed due to timeout');
      expect(result?.completionTime).toBe(1234567890);
      expect(result?.turnsTaken).toBe(25);
    });

    test('should create victory result', () => {
      const result = ChallengeResult?.victory(
        { experience: 100, gold: 50 },
        ['victory_flag'],
        { fire_spirit: 15 },
        'Victory achieved!',
        30
      );

      expect(result?.outcome).toBe(ChallengeOutcome?.VICTORY);
      expect(result?.itemRewards).toEqual({ experience: 100, gold: 50 });
      expect(result?.loreFlags).toEqual(['victory_flag']);
      expect(result?.syncChanges).toEqual({ fire_spirit: 15 });
      expect(result?.message).toBe('Victory achieved!');
      expect(result?.completionTime).toBeDefined();
      expect(result?.turnsTaken).toBe(30);
    });

    test('should create defeat result', () => {
      const result = ChallengeResult?.defeat('Defeated by opponent', 20);
      expect(result?.outcome).toBe(ChallengeOutcome?.DEFEAT);
      expect(result?.message).toBe('Defeated by opponent');
      expect(result?.completionTime).toBeDefined();
      expect(result?.turnsTaken).toBe(20);
    });

    test('should create timeout result', () => {
      const result = ChallengeResult?.timeout(25, 'Time ran out');
      expect(result?.outcome).toBe(ChallengeOutcome?.TIMEOUT);
      expect(result?.message).toBe('Time ran out');
      expect(result?.completionTime).toBeDefined();
      expect(result?.turnsTaken).toBe(25);
    });

    test('should create forfeit result', () => {
      const result = ChallengeResult?.forfeit('Player surrendered', 15);
      expect(result?.outcome).toBe(ChallengeOutcome?.FORFEIT);
      expect(result?.message).toBe('Player surrendered');
      expect(result?.completionTime).toBeDefined();
      expect(result?.turnsTaken).toBe(15);
    });

    test('should get total reward value correctly', () => {
      const result = ChallengeResult?.victory(
        { experience: 100, gold: 50, items: 2 },
        [],
        {}
      );

      expect(result?.getTotalRewardValue()).toBe(152); // 100 + 50 + 2
    });

    test('should get description correctly', () => {
      const victoryResult = ChallengeResult?.victory({}, [], {}, 'Great victory!');
      expect(victoryResult?.getDescription()).toContain('Victory!');

      const defeatResult = ChallengeResult?.defeat('Failed challenge');
      expect(defeatResult?.getDescription()).toContain('Defeat!');

      const timeoutResult = ChallengeResult?.timeout(25);
      expect(timeoutResult?.getDescription()).toContain('Timeout!');

      const forfeitResult = ChallengeResult?.forfeit();
      expect(forfeitResult?.getDescription()).toContain('Forfeit!');
    });

    test('should convert to string correctly', () => {
      const result = ChallengeResult?.victory(
        { exp: 100, gold: 50 },
        ['victory_flag'],
        { spirit: 10 },
        'Victory!',
        25
      );

      const str = result?.toString();
      expect(str).toContain('victory');
      expect(str).toContain('exp: 100');
      expect(str).toContain('gold: 50');
      expect(str).toContain('victory_flag');
      expect(str).toContain('spirit +10');
      expect(str).toContain('25 turns');
    });

    test('should clone correctly', () => {
      const original = ChallengeResult?.victory(
        { gold: 100 },
        ['flag1'],
        { spirit1: 15 },
        'Victory!',
        30,
        { test: true }
      );

      const clone = original?.clone();
      expect(clone).toEqual(original);
      expect(clone).not?.toBe(original);
      expect(clone?.itemRewards).toEqual(original?.itemRewards);
      expect(clone?.itemRewards).not?.toBe(original?.itemRewards);
    });

    test('should convert to/from JSON correctly', () => {
      const original = ChallengeResult?.victory(
        { experience: 200, gold: 100 },
        ['victory_achieved'],
        { fire_spirit: 25, water_spirit: 10 },
        'Major victory!',
        35
      );

      const jsonData = original?.toJSON();
      const reconstructed = ChallengeResult?.fromJSON(jsonData);

      expect(reconstructed?.outcome).toBe(original?.outcome);
      expect(reconstructed?.itemRewards).toEqual(original?.itemRewards);
      expect(reconstructed?.loreFlags).toEqual(original?.loreFlags);
      expect(reconstructed?.syncChanges).toEqual(original?.syncChanges);
      expect(reconstructed?.message).toBe(original?.message);
      expect(reconstructed?.turnsTaken).toBe(original?.turnsTaken);
    });
  });

  describe('BattleChallenge Basic Functionality', () => {
    let playerContext: MockPlayerContext;

    beforeEach(() => {
      playerContext = new MockPlayerContext();
    });

    test('should create challenge with default values', () => {
      const challenge = new BattleChallenge('test_001', 'Test Challenge', 'Test description');
      expect(challenge?.challengeId).toBe('test_001');
      expect(challenge?.name).toBe('Test Challenge');
      expect(challenge?.description).toBe('Test description');
      expect(challenge?.category).toBe(ChallengeCategory?.MAIN_STORY);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.MEDIUM);
      expect(challenge?.status).toBe(ChallengeStatus?.LOCKED);
      expect(challenge?.priority).toBe(1);
      expect(challenge?.tags).toHaveLength(0);
    });

    test('should create challenge with custom values', () => {
      const ruleset = ChallengeRuleset?.spiritRestriction(['fire']);
      const challenge = new BattleChallenge(
        'test_002',
        'Fire Challenge',
        'A challenge focused on fire spirits',
        ['fire_spirit', 'flame_elemental'],
        ruleset,
        { experience: 200, gold: 100 },
        ChallengeCategory?.SPECIAL,
        ChallengeDifficulty?.HARD,
        25,
        8,
        ['fire', 'special'],
        ['fire_mastery'],
        'volcano',
        ['fire_lore_unlocked'],
        { fire_spirit: 20, flame_spirit: 15 }
      );

      expect(challenge?.challengeId).toBe('test_002');
      expect(challenge?.name).toBe('Fire Challenge');
      expect(challenge?.category).toBe(ChallengeCategory?.SPECIAL);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.HARD);
      expect(challenge?.status).toBe(ChallengeStatus?.LOCKED);
      expect(challenge?.priority).toBe(8);
      expect(challenge?.tags).toEqual(['fire', 'special']);
      expect(challenge?.opponentTeam).toEqual(['fire_spirit', 'flame_elemental']);
      expect(challenge?.requiredFlags).toEqual(['fire_mastery']);
      expect(challenge?.requiredLocationId).toBe('volcano');
      expect(challenge?.loreFlagsToSet).toEqual(['fire_lore_unlocked']);
      expect(challenge?.syncBoosts).toEqual({ fire_spirit: 20, flame_spirit: 15 });
    });

    test('should create tutorial challenge correctly', () => {
      const challenge = BattleChallenge?.tutorial(
        'tut_001',
        'First Steps',
        'Learn the basics of combat',
        ['training_dummy'],
        10
      );

      expect(challenge?.challengeId).toBe('tut_001');
      expect(challenge?.category).toBe(ChallengeCategory?.TUTORIAL);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.EASY);
      expect(challenge?.maxTurns).toBe(10);
      expect(challenge?.priority).toBe(10);
      expect(challenge?.rewards).toEqual({ experience: 100 });
    });

    test('should create main story challenge correctly', () => {
      const challenge = BattleChallenge?.mainStory(
        'story_001',
        'The Fire Guardian',
        'Defeat the guardian of flames',
        ['fire_guardian'],
        ['tutorial_complete']
      );

      expect(challenge?.challengeId).toBe('story_001');
      expect(challenge?.category).toBe(ChallengeCategory?.MAIN_STORY);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.MEDIUM);
      expect(challenge?.maxTurns).toBe(20);
      expect(challenge?.priority).toBe(8);
      expect(challenge?.requiredFlags).toEqual(['tutorial_complete']);
      expect(challenge?.rewards).toEqual({ experience: 500, gold: 100 });
    });

    test('should create boss challenge correctly', () => {
      const challenge = BattleChallenge?.boss(
        'boss_001',
        'Elder Dragon',
        'Face the legendary elder dragon',
        ['elder_dragon'],
        ['story_002_completed', 'player_level_10']
      );

      expect(challenge?.challengeId).toBe('boss_001');
      expect(challenge?.category).toBe(ChallengeCategory?.MAIN_STORY);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.HARD);
      expect(challenge?.maxTurns).toBe(30);
      expect(challenge?.priority).toBe(9);
      expect(challenge?.requiredFlags).toEqual(['story_002_completed', 'player_level_10']);
      expect(challenge?.rewards).toEqual({ experience: 1000, gold: 500, rare_item: 1 });
    });

    test('should create daily challenge correctly', () => {
      const challenge = BattleChallenge?.daily(
        'daily_001',
        'Daily Combat',
        'Daily combat training',
        ['random_opponent_1', 'random_opponent_2']
      );

      expect(challenge?.challengeId).toBe('daily_001');
      expect(challenge?.category).toBe(ChallengeCategory?.DAILY);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.MEDIUM);
      expect(challenge?.maxTurns).toBe(15);
      expect(challenge?.priority).toBe(5);
      expect(challenge?.rewards).toEqual({ experience: 200, gold: 50 });
    });

    test('should create achievement challenge correctly', () => {
      const challenge = BattleChallenge?.achievement(
        'ach_001',
        'Spirit Master',
        'Defeat 100 different spirits',
        ['spirit_master_100_defeated']
      );

      expect(challenge?.challengeId).toBe('ach_001');
      expect(challenge?.category).toBe(ChallengeCategory?.ACHIEVEMENT);
      expect(challenge?.difficulty).toBe(ChallengeDifficulty?.VARIES);
      expect(challenge?.maxTurns).toBe(0);
      expect(challenge?.priority).toBe(3);
      expect(challenge?.requiredFlags).toEqual(['spirit_master_100_defeated']);
      expect(challenge?.rewards).toEqual({ achievement_points: 10 });
    });

    test('should check availability correctly', () => {
      const challenge = BattleChallenge?.mainStory(
        'story_001',
        'Test Challenge',
        'Test description',
        ['opponent'],
        ['required_flag']
      );

      // Should not be available initially
      expect(challenge?.isAvailable(playerContext)).toBe(false);

      // Set required flag
      playerContext?.setQuestFlag('required_flag');
      expect(challenge?.isAvailable(playerContext)).toBe(true);

      // Test location requirement
      challenge?.requiredLocationId = 'specific_location';
      expect(challenge?.isAvailable(playerContext)).toBe(false);

      playerContext?.setLocation('specific_location');
      expect(challenge?.isAvailable(playerContext)).toBe(true);
    });

    test('should calculate estimated duration correctly', () => {
      const easyChallenge = BattleChallenge?.tutorial('easy', 'Easy', 'Easy challenge', ['opp'], 5);
      expect(easyChallenge?.getEstimatedDuration()).toBe(3); // 5 base * 1 opponent * 0.5 turns (5/10)

      const mediumChallenge = BattleChallenge?.mainStory('medium', 'Medium', 'Medium challenge', ['opp1', 'opp2'], ['flag']);
      expect(mediumChallenge?.getEstimatedDuration()).toBe(10); // 10 base * 1 opponent * 1.0 turns

      const hardChallenge = BattleChallenge?.boss('hard', 'Hard', 'Hard challenge', ['opp1', 'opp2', 'opp3'], ['flag']);
      expect(hardChallenge?.getEstimatedDuration()).toBe(23); // 15 base * 1.5 opponents * 1.0 turns

      const customChallenge = new BattleChallenge('custom', 'Custom', 'Custom', ['opp'], new ChallengeRuleset(), {}, ChallengeCategory?.MAIN_STORY, ChallengeDifficulty?.EXPERT, 50);
      expect(customChallenge?.getEstimatedDuration()).toBe(40); // 20 base * 1.0 opponents * 2.0 turns
    });

    test('should get completion percentage correctly', () => {
      const challenge = new BattleChallenge('test', 'Test', 'Test');

      challenge?.status = ChallengeStatus?.LOCKED;
      expect(challenge?.getCompletionPercentage()).toBe(0);

      challenge?.status = ChallengeStatus?.AVAILABLE;
      expect(challenge?.getCompletionPercentage()).toBe(50);

      challenge?.status = ChallengeStatus?.IN_PROGRESS;
      expect(challenge?.getCompletionPercentage()).toBe(75);

      challenge?.status = ChallengeStatus?.COMPLETED;
      expect(challenge?.getCompletionPercentage()).toBe(100);
    });

    test('should manage tags correctly', () => {
      const challenge = new BattleChallenge(
        'test',
        'Test',
        'Test',
        ['opp'],
        new ChallengeRuleset(),
        {},
        ChallengeCategory?.MAIN_STORY,
        ChallengeDifficulty?.MEDIUM,
        20,
        5,
        ['tag1', 'tag2']
      );

      expect(challenge?.hasTag('tag1')).toBe(true);
      expect(challenge?.hasTag('tag3')).toBe(false);

      expect(challenge?.hasAllTags(['tag1', 'tag2'])).toBe(true);
      expect(challenge?.hasAllTags(['tag1', 'tag3'])).toBe(false);

      expect(challenge?.hasAnyTag(['tag3', 'tag4'])).toBe(false);
      expect(challenge?.hasAnyTag(['tag1', 'tag3'])).toBe(true);

      challenge?.addTag('tag3');
      expect(challenge?.hasTag('tag3')).toBe(true);
      expect(challenge?.tags).toHaveLength(3);

      const removed = challenge?.removeTag('tag2');
      expect(removed).toBe(true);
      expect(challenge?.hasTag('tag2')).toBe(false);
      expect(challenge?.tags).toHaveLength(2);

      const notRemoved = challenge?.removeTag('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should get reward information correctly', () => {
      const challenge = BattleChallenge?.mainStory(
        'test',
        'Test Challenge',
        'Test description',
        ['opponent']
      );

      expect(challenge?.getRewardDescription()).toBe('experience: 500, gold: 100');

      challenge?.rewards = { experience: 1000, gold: 500, rare_item: 1 };
      expect(challenge?.getRewardDescription()).toBe('experience: 1000, gold: 500, rare_item: 1');

      challenge?.rewards = {};
      expect(challenge?.getRewardDescription()).toBe('No rewards');
    });

    test('should get total reward value correctly', () => {
      const challenge = BattleChallenge?.mainStory('test', 'Test', 'Test', ['opp']);
      expect(challenge?.getTotalRewardValue()).toBe(600); // 500 + 100

      challenge?.rewards = { exp: 1000, gold: 500, items: 3 };
      expect(challenge?.getTotalRewardValue()).toBe(1503); // 1000 + 500 + 3
    });

    test('should validate correctly', () => {
      const validChallenge = BattleChallenge?.tutorial('valid', 'Valid', 'Valid challenge', ['opp'], 10);
      expect(validChallenge?.validate({})).toHaveLength(0);

      const invalidChallenge = new BattleChallenge(
        '',
        '',
        '',
        [],
        new ChallengeRuleset([''], 0, ['']),
        {},
        ChallengeCategory?.MAIN_STORY,
        ChallengeDifficulty?.MEDIUM,
        -5,
        15
      );

      const errors = invalidChallenge?.validate({});
      expect(errors).toContain('Challenge ID cannot be empty');
      expect(errors).toContain('Challenge name cannot be empty');
      expect(errors).toContain('Challenge description cannot be empty');
      expect(errors).toContain('Challenge must have at least one opponent');
      expect(errors).toContain('Priority must be between 0 and 10');
      expect(errors).toContain('Max turns cannot be negative');
      expect(errors).toContain('Allowed spirit types cannot contain empty strings');
      expect(errors).toContain('Banned items cannot contain empty strings');
    });

    test('should clone correctly', () => {
      const original = BattleChallenge?.boss(
        'original',
        'Original Boss',
        'Original boss challenge',
        ['boss_opponent'],
        ['flag1', 'flag2']
      );

      original?.rewards = { exp: 2000, gold: 1000 };
      original?.tags = ['boss', 'hard'];
      original?.loreFlagsToSet = ['boss_defeated'];
      original?.syncBoosts = { boss_spirit: 50 };

      const clone = original?.clone();
      expect(clone).toEqual(original);
      expect(clone).not?.toBe(original);
      expect(clone?.opponentTeam).toEqual(original?.opponentTeam);
      expect(clone?.opponentTeam).not?.toBe(original?.opponentTeam);
      expect(clone?.rewards).toEqual(original?.rewards);
      expect(clone?.rewards).not?.toBe(original?.rewards);
    });

    test('should convert to/from JSON correctly', () => {
      const original = BattleChallenge?.boss(
        'boss_001',
        'Boss Challenge',
        'Challenging boss fight',
        ['elder_dragon'],
        ['story_completed', 'level_20']
      );

      original?.rewards = { exp: 3000, gold: 1500, legendary_item: 1 };
      original?.tags = ['boss', 'legendary'];
      original?.loreFlagsToSet = ['dragon_slayer'];
      original?.syncBoosts = { dragon_spirit: 100 };

      const jsonData = original?.toJSON();
      const reconstructed = BattleChallenge?.fromJSON(jsonData);

      expect(reconstructed).toEqual(original);
      expect(reconstructed?.status).toBe(ChallengeStatus?.LOCKED);
    });
  });

  describe('ChallengeManager Basic Functionality', () => {
    let challengeManager: ChallengeManager;
    let playerContext: MockPlayerContext;

    beforeEach(() => {
      challengeManager = new ChallengeManager();
      playerContext = new MockPlayerContext();
    });

    test('should create manager correctly', () => {
      expect(challengeManager).toBeDefined();
      expect(challengeManager?.getAllChallenges()).toHaveLength(0);
      expect(challengeManager?.getAllChallenges().filter(c => challengeManager?.isChallengeCompleted(c?.challengeId))).toHaveLength(0);
    });

    test('should register challenges correctly', () => {
      const challenge1 = BattleChallenge?.tutorial('tut_001', 'Tutorial 1', 'First tutorial', ['dummy']);
      const challenge2 = BattleChallenge?.mainStory('story_001', 'Story 1', 'First story', ['guardian']);

      expect(challengeManager?.registerChallenge(challenge1)).toBe(true);
      expect(challengeManager?.registerChallenge(challenge2)).toBe(true);
      expect(challengeManager?.getAllChallenges()).toHaveLength(2);

      // Test duplicate registration
      expect(challengeManager?.registerChallenge(challenge1)).toBe(true); // Should update existing
      expect(challengeManager?.getAllChallenges()).toHaveLength(2);
    });

    test('should reject invalid challenges', () => {
      const invalidChallenge = new BattleChallenge('', '', '', []);
      expect(challengeManager?.registerChallenge(invalidChallenge)).toBe(false);
      expect(challengeManager?.getAllChallenges()).toHaveLength(0);
    });

    test('should get challenges correctly', () => {
      const challenge1 = BattleChallenge?.tutorial('tut_001', 'Tutorial 1', 'First tutorial', ['dummy']);
      const challenge2 = BattleChallenge?.mainStory('story_001', 'Story 1', 'First story', ['guardian']);

      challengeManager?.registerChallenge(challenge1);
      challengeManager?.registerChallenge(challenge2);

      expect(challengeManager?.getChallenge('tut_001')).toBe(challenge1);
      expect(challengeManager?.getChallenge('story_001')).toBe(challenge2);
      expect(challengeManager?.getChallenge('nonexistent')).toBeNull();

      const allChallenges = challengeManager?.getAllChallenges();
      expect(allChallenges).toHaveLength(2);
      expect(allChallenges).toContain(challenge1);
      expect(allChallenges).toContain(challenge2);
    });

    test('should filter challenges correctly', () => {
      const challenge1 = BattleChallenge?.tutorial('tut_001', 'Tutorial 1', 'First tutorial', ['dummy']);
      const challenge2 = BattleChallenge?.mainStory('story_001', 'Story 1', 'First story', ['guardian']);
      const challenge3 = BattleChallenge?.daily('daily_001', 'Daily 1', 'Daily challenge', ['opponent']);

      challengeManager?.registerChallenge(challenge1);
      challengeManager?.registerChallenge(challenge2);
      challengeManager?.registerChallenge(challenge3);

      // Filter by category
      const tutorials = challengeManager?.getFilteredChallenges({
        category: ChallengeCategory?.TUTORIAL
      });
      expect(tutorials).toHaveLength(1);
      expect(tutorials[0!]).toBe(challenge1);

      // Filter by status
      const available = challengeManager?.getFilteredChallenges({
        status: ChallengeStatus?.AVAILABLE
      });
      expect(available).toHaveLength(3); // All are available by default

      // Filter by difficulty
      const medium = challengeManager?.getFilteredChallenges({
        difficulty: ChallengeDifficulty?.MEDIUM
      });
      expect(medium).toHaveLength(2); // tutorial is EASY, story and daily are MEDIUM

      // Filter by tags
      challenge2?.addTag('story');
      const storyTagged = challengeManager?.getFilteredChallenges({
        tags: ['story']
      });
      expect(storyTagged).toHaveLength(1);
      expect(storyTagged[0!]).toBe(challenge2);
    });

    test('should handle challenge lifecycle correctly', () => {
      const challenge = BattleChallenge?.tutorial('tut_001', 'Tutorial', 'Tutorial challenge', ['dummy']);
      challengeManager?.registerChallenge(challenge);

      // Check initial status
      expect(challengeManager?.getChallengeStatus('tut_001')).toBe(ChallengeStatus?.LOCKED);
      expect(challengeManager?.isChallengeCompleted('tut_001')).toBe(false);

      // Start challenge
      expect(challengeManager?.startChallenge('tut_001')).toBe(true);
      expect(challengeManager?.getChallengeStatus('tut_001')).toBe(ChallengeStatus?.IN_PROGRESS);

      // Complete challenge
      const result = ChallengeResult?.victory({ experience: 100 });
      expect(challengeManager?.completeChallenge('tut_001', result)).toBe(true);
      expect(challengeManager?.getChallengeStatus('tut_001')).toBe(ChallengeStatus?.COMPLETED);
      expect(challengeManager?.isChallengeCompleted('tut_001')).toBe(true);

      // Try to complete again (should fail)
      expect(challengeManager?.completeChallenge('tut_001', result)).toBe(false);
    });

    test('should provide correct statistics', () => {
      const challenge1 = BattleChallenge?.tutorial('tut_001', 'Tutorial 1', 'First tutorial', ['dummy']);
      const challenge2 = BattleChallenge?.mainStory('story_001', 'Story 1', 'First story', ['guardian']);
      const challenge3 = BattleChallenge?.boss('boss_001', 'Boss', 'Boss challenge', ['boss']);

      challengeManager?.registerChallenge(challenge1);
      challengeManager?.registerChallenge(challenge2);
      challengeManager?.registerChallenge(challenge3);

      // Complete some challenges
      challengeManager?.startChallenge('tut_001');
      challengeManager?.completeChallenge('tut_001', ChallengeResult?.victory({ exp: 100 }));

      challengeManager?.startChallenge('story_001');
      challengeManager?.completeChallenge('story_001', ChallengeResult?.victory({ exp: 500, gold: 100 }));

      const stats = challengeManager?.getStatistics();

      expect(stats?.totalChallenges).toBe(3);
      expect(stats?.completedChallenges).toBe(2);
      expect(stats?.availableChallenges).toBe(1); // boss is still available
      expect(stats?.lockedChallenges).toBe(0);
      expect(stats?.inProgressChallenges).toBe(0);

      expect(stats?.challengesByCategory[ChallengeCategory?.TUTORIAL]).toBe(1);
      expect(stats?.challengesByCategory[ChallengeCategory?.MAIN_STORY]).toBe(2);
      expect(stats?.challengesByDifficulty[ChallengeDifficulty?.EASY]).toBe(1);
      expect(stats?.challengesByDifficulty[ChallengeDifficulty?.MEDIUM]).toBe(1);
      expect(stats?.challengesByDifficulty[ChallengeDifficulty?.HARD]).toBe(1);

      expect(stats?.totalRewardsEarned.experience).toBe(600); // 100 + 500
      expect(stats?.totalRewardsEarned.gold).toBe(100);
    });

    test('should clear completed challenges correctly', () => {
      const challenge = BattleChallenge?.tutorial('tut_001', 'Tutorial', 'Tutorial challenge', ['dummy']);
      challengeManager?.registerChallenge(challenge);

      // Complete challenge
      challengeManager?.startChallenge('tut_001');
      challengeManager?.completeChallenge('tut_001', ChallengeResult?.victory({ exp: 100 }));

      expect(challengeManager?.isChallengeCompleted('tut_001')).toBe(true);

      // Clear completed challenges
      challengeManager?.clearCompletedChallenges();

      // Challenge should still exist but not be completed
      expect(challengeManager?.getChallenge('tut_001')).toBeDefined();
      expect(challengeManager?.isChallengeCompleted('tut_001')).toBe(false);
      expect(challengeManager?.getChallengeStatus('tut_001')).toBe(ChallengeStatus?.LOCKED);
    });
  });

  describe('ChallengeUtils Basic Functionality', () => {
    test('should create default player context', () => {
      const context = ChallengeUtils?.createDefaultPlayerContext();
      expect(context).toBeDefined();
      expect(context?.hasQuestFlag('test')).toBe(false);
      expect(context?.hasLoreFlag('test')).toBe(false);
      expect(context?.getCurrentLocationId()).toBe('default');
      expect(context?.getPlayerLevel()).toBe(1);
      expect(context?.getCompletedChallenges()).toHaveLength(0);
      expect(context?.getUnlockedLocations()).toHaveLength(0);
      expect(context?.getCapturedSpirits()).toHaveLength(0);
    });

    test('should create filters correctly', () => {
      const categoryFilter = ChallengeUtils?.createFilter.byCategory(ChallengeCategory?.TUTORIAL);
      expect(categoryFilter?.category).toBe(ChallengeCategory?.TUTORIAL);

      const difficultyFilter = ChallengeUtils?.createFilter.byDifficulty(ChallengeDifficulty?.HARD);
      expect(difficultyFilter?.difficulty).toBe(ChallengeDifficulty?.HARD);

      const completedFilter = ChallengeUtils?.createFilter.completedOnly();
      expect(completedFilter?.status).toBe(ChallengeStatus?.COMPLETED);

      const availableFilter = ChallengeUtils?.createFilter.availableOnly();
      expect(availableFilter?.status).toBe(ChallengeStatus?.AVAILABLE);

      const highPriorityFilter = ChallengeUtils?.createFilter.highPriority(7);
      expect(highPriorityFilter?.minPriority).toBe(7);

      const easyFilter = ChallengeUtils?.createFilter.easyOnly();
      expect(easyFilter?.difficulty).toBe(ChallengeDifficulty?.EASY);

      const hardOrAboveFilter = ChallengeUtils?.createFilter.hardOrAbove();
      expect(hardOrAboveFilter?.minDifficulty).toBe(ChallengeDifficulty?.HARD);

      const searchFilter = ChallengeUtils?.createFilter.search('fire');
      expect(searchFilter?.searchText).toBe('fire');
    });

    test('should validate challenges correctly', () => {
      const validChallenge = BattleChallenge?.tutorial('valid', 'Valid', 'Valid challenge', ['opp'], 10);
      expect(ChallengeUtils?.validateChallenge(validChallenge)).toHaveLength(0);

      const invalidChallenge = new BattleChallenge('', '', '', []);
      const errors = ChallengeUtils?.validateChallenge(invalidChallenge);
      expect(errors).toContain('Challenge ID cannot be empty');
      expect(errors).toContain('Challenge name cannot be empty');
      expect(errors).toContain('Challenge description cannot be empty');
      expect(errors).toContain('Challenge must have at least one opponent');
    });

    test('should calculate completion percentage correctly', () => {
      const progress1 = ChallengeUtils?.getCompletionPercentage(10, 5);
      expect(progress1?.percentage).toBe(50);
      expect(progress1?.remaining).toBe(5);

      const progress2 = ChallengeUtils?.getCompletionPercentage(0, 0);
      expect(progress2?.percentage).toBe(0);
      expect(progress2?.remaining).toBe(0);
    });

    test('should filter challenges correctly', () => {
      const challenges: IBattleChallenge[] = [
        new BattleChallenge('1', 'T1', 'Text1', ['opp1'], new ChallengeRuleset(), {}, ChallengeCategory?.MAIN_STORY, ChallengeDifficulty?.MEDIUM, 20, 8, ['important']),
        new BattleChallenge('2', 'T2', 'Text2', ['opp2'], new ChallengeRuleset(), {}, ChallengeCategory?.TUTORIAL, ChallengeDifficulty?.EASY, 10, 3, ['tutorial']),
        new BattleChallenge('3', 'T3', 'Text3', ['opp3'], new ChallengeRuleset(), {}, ChallengeCategory?.DAILY, ChallengeDifficulty?.HARD, 15, 6, ['daily', 'important']),
      ];

      const filtered = ChallengeUtils?.filterChallenges(challenges, {
        categories: [ChallengeCategory?.MAIN_STORY, ChallengeCategory?.DAILY],
        minPriority: 5,
        tags: ['important']
      });

      expect(filtered).toHaveLength(2);
      expect(filtered?.some(c => c?.challengeId === '1')).toBe(true);
      expect(filtered?.some(c => c?.challengeId === '3')).toBe(true);
      expect(filtered?.some(c => c?.challengeId === '2')).toBe(false);
    });

    test('should sort challenges correctly', () => {
      const challenges: IBattleChallenge[] = [
        new BattleChallenge('2', 'B Title', 'Text2', ['opp'], new ChallengeRuleset(), {}, ChallengeCategory?.MAIN_STORY, ChallengeDifficulty?.MEDIUM, 20, 3),
        new BattleChallenge('1', 'A Title', 'Text1', ['opp'], new ChallengeRuleset(), {}, ChallengeCategory?.MAIN_STORY, ChallengeDifficulty?.HARD, 20, 8),
        new BattleChallenge('3', 'C Title', 'Text3', ['opp'], new ChallengeRuleset(), {}, ChallengeCategory?.MAIN_STORY, ChallengeDifficulty?.EASY, 20, 5),
      ];

      const sortedByPriority = ChallengeUtils?.sortChallenges(challenges, 'priority');
      expect(sortedByPriority[0!].priority).toBe(8);
      expect(sortedByPriority[1!].priority).toBe(5);
      expect(sortedByPriority[2!].priority).toBe(3);

      const sortedByName = ChallengeUtils?.sortChallenges(challenges, 'name');
      expect(sortedByName[0!].name).toBe('A Title');
      expect(sortedByName[1!].name).toBe('B Title');
      expect(sortedByName[2!].name).toBe('C Title');

      const sortedByDifficulty = ChallengeUtils?.sortChallenges(challenges, 'difficulty');
      expect(ChallengeUtils?.getDifficultyLevel(sortedByDifficulty[0!].difficulty)).toBe(3); // HARD
      expect(ChallengeUtils?.getDifficultyLevel(sortedByDifficulty[1!].difficulty)).toBe(2); // MEDIUM
      expect(ChallengeUtils?.getDifficultyLevel(sortedByDifficulty[2!].difficulty)).toBe(1); // EASY
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete challenge workflow', () => {
      const challengeManager = new ChallengeManager();
      const playerContext = new MockPlayerContext();

      // Create challenges with dependencies
      const tutorial = BattleChallenge?.tutorial(
        'tutorial_001',
        'First Steps',
        'Learn the basics of spirit combat',
        ['training_dummy'],
        10
      );

      const story1 = BattleChallenge?.mainStory(
        'story_001',
        'The Fire Guardian',
        'Defeat the guardian of the ancient flames',
        ['fire_guardian'],
        ['tutorial_001_completed']
      );

      const story2 = BattleChallenge?.mainStory(
        'story_002',
        'Mountain Trial',
        'Prove your worth on the mountain peak',
        ['mountain_spirit', 'rock_elemental'],
        ['story_001_completed', 'mountain_peak']
      );

      const boss = BattleChallenge?.boss(
        'boss_001',
        'The Elder Dragon',
        'Face the legendary elder dragon in combat',
        ['elder_dragon'],
        ['story_002_completed', 'player_level_10']
      );

      // Register challenges
      challengeManager?.registerChallenge(tutorial);
      challengeManager?.registerChallenge(story1);
      challengeManager?.registerChallenge(story2);
      challengeManager?.registerChallenge(boss);

      expect(challengeManager?.getAllChallenges()).toHaveLength(4);

      // Check initial availability
      expect(tutorial?.isAvailable(playerContext)).toBe(true);
      expect(story1?.isAvailable(playerContext)).toBe(false);
      expect(story2?.isAvailable(playerContext)).toBe(false);
      expect(boss?.isAvailable(playerContext)).toBe(false);

      // Complete tutorial
      challengeManager?.startChallenge('tutorial_001');
      const tutorialResult = ChallengeResult?.victory({ experience: 100 }, ['tutorial_001_completed']);
      challengeManager?.completeChallenge('tutorial_001', tutorialResult);
      playerContext?.completeChallenge('tutorial_001');
      playerContext?.setQuestFlag('tutorial_001_completed');

      // Check availability after tutorial completion
      expect(story1?.isAvailable(playerContext)).toBe(true);
      expect(story2?.isAvailable(playerContext)).toBe(false); // Still need location
      expect(boss?.isAvailable(playerContext)).toBe(false);

      // Unlock location and complete story 1
      playerContext?.unlockLocation('mountain_peak');
      playerContext?.setLocation('mountain_peak');

      challengeManager?.startChallenge('story_001');
      const story1Result = ChallengeResult?.victory(
        { experience: 500, gold: 100 },
        ['story_001_completed', 'fire_guardian_defeated']
      );
      challengeManager?.completeChallenge('story_001', story1Result);
      playerContext?.completeChallenge('story_001');
      playerContext?.setQuestFlag('story_001_completed');
      playerContext?.setPlayerLevel(15);

      // Check availability after story 1 completion
      expect(story2?.isAvailable(playerContext)).toBe(true);
      expect(boss?.isAvailable(playerContext)).toBe(true);

      // Complete remaining challenges
      challengeManager?.startChallenge('story_002');
      const story2Result = ChallengeResult?.victory(
        { experience: 750, gold: 150 },
        ['story_002_completed']
      );
      challengeManager?.completeChallenge('story_002', story2Result);

      challengeManager?.startChallenge('boss_001');
      const bossResult = ChallengeResult?.victory(
        { experience: 2000, gold: 1000, legendary_item: 1 },
        ['boss_001_completed', 'dragon_slayer'],
        { fire_spirit: 50, dragon_spirit: 100 }
      );
      challengeManager?.completeChallenge('boss_001', bossResult);

      // Check final statistics
      const stats = challengeManager?.getStatistics();
      expect(stats?.totalChallenges).toBe(4);
      expect(stats?.completedChallenges).toBe(4);
      expect(stats?.totalRewardsEarned.experience).toBe(3350); // 100 + 500 + 750 + 2000
      expect(stats?.totalRewardsEarned.gold).toBe(1250); // 100 + 150 + 1000
    });

    test('should handle challenge rules enforcement', () => {
      const challengeManager = new ChallengeManager();

      // Create challenge with spirit restrictions and item bans
      const challenge = BattleChallenge?.create(
        'restricted_001',
        'Restricted Challenge',
        'Challenge with many restrictions',
        ['fire_spirit', 'water_spirit'],
        ChallengeRuleset?.create(
          ['fire', 'water'], // allowed spirit types
          25,               // turn limit
          ['healing_potion', 'attack_boost'], // banned items
          'rain'           // environment
        ),
        { experience: 500, gold: 200 },
        ChallengeCategory?.SPECIAL,
        ChallengeDifficulty?.HARD,
        25,
        8,
        ['restricted', 'special']
      );

      challengeManager?.registerChallenge(challenge);

      // Test ruleset compliance
      const ruleset = challenge?.ruleset;

      // Compliant party
      expect(ruleset?.isCompliant(['fire', 'water'], ['defense_boost'])).toBe(true);

      // Non-compliant: wrong spirit type
      expect(ruleset?.isCompliant(['earth', 'wind'], ['defense_boost'])).toBe(false);

      // Non-compliant: banned item
      expect(ruleset?.isCompliant(['fire'], ['healing_potion'])).toBe(false);

      // Non-compliant: both issues
      expect(ruleset?.isCompliant(['earth'], ['healing_potion'])).toBe(false);

      // Test challenge validation
      const errors = challenge?.validate({});
      expect(errors).toHaveLength(0); // Should be valid

      // Test invalid challenge
      const invalidChallenge = BattleChallenge?.create(
        'invalid',
        'Invalid',
        'Invalid challenge',
        ['opponent'],
        ChallengeRuleset?.create([''], 0, ['']),
        {},
        ChallengeCategory?.MAIN_STORY,
        ChallengeDifficulty?.MEDIUM,
        20,
        5
      );

      const validationErrors = invalidChallenge?.validate({});
      expect(validationErrors).toContain('Allowed spirit types cannot contain empty strings');
      expect(validationErrors).toContain('Banned items cannot contain empty strings');
    });

    test('should handle filtering and search', () => {
      const challengeManager = new ChallengeManager();

      // Create diverse challenges
      const challenges = [
        BattleChallenge?.tutorial('tut_001', 'Fire Tutorial', 'Learn fire combat', ['fire_dummy'], 10),
        BattleChallenge?.mainStory('story_001', 'Fire Guardian', 'Defeat fire guardian', ['fire_guardian'], ['tut_001_completed']),
        BattleChallenge?.daily('daily_001', 'Water Training', 'Water combat training', ['water_spirit']),
        BattleChallenge?.boss('boss_001', 'Water Boss', 'Water boss challenge', ['water_boss'], ['daily_001_completed']),
        BattleChallenge?.achievement('ach_001', 'Element Master', 'Master all elements', ['all_elements_mastered']),
      ];

      challenges?.forEach(challenge => challengeManager?.registerChallenge(challenge));

      // Test category filtering
      const tutorials = challengeManager?.getFilteredChallenges({
        category: ChallengeCategory?.TUTORIAL
      });
      expect(tutorials).toHaveLength(1);
      expect(tutorials[0!].challengeId).toBe('tut_001');

      // Test difficulty filtering
      const hardChallenges = challengeManager?.getFilteredChallenges({
        difficulty: ChallengeDifficulty?.HARD
      });
      expect(hardChallenges).toHaveLength(1);
      expect(hardChallenges[0!].challengeId).toBe('boss_001');

      // Test search
      const fireChallenges = challengeManager?.getFilteredChallenges({
        searchText: 'fire'
      });
      expect(fireChallenges).toHaveLength(2);

      const waterChallenges = challengeManager?.getFilteredChallenges({
        searchText: 'water'
      });
      expect(waterChallenges).toHaveLength(2);

      // Test tag filtering
      challenges[1!].addTag('fire');
      const fireTagged = challengeManager?.getFilteredChallenges({
        tags: ['fire']
      });
      expect(fireTagged).toHaveLength(1);
      expect(fireTagged[0!].challengeId).toBe('story_001');
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many challenges efficiently', () => {
      const challengeManager = new ChallengeManager();
      const startTime = performance?.now();

      // Create many challenges
      for (let i = 0; i < 1000; i++) {
        const challenge = BattleChallenge?.mainStory(
          `challenge_${i}`,
          `Challenge ${i}`,
          `Description for challenge ${i}`,
          [`opponent_${i % 10}`],
          i % 3 === 0 ? [`flag_${i % 5}`] : []
        );

        challengeManager?.registerChallenge(challenge);
      }

      const endTime = performance?.now();

      expect(challengeManager?.getAllChallenges()).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should be reasonably fast
    });

    test('should handle filtering efficiently', () => {
      const challengeManager = new ChallengeManager();

      // Create diverse challenges
      for (let i = 0; i < 1000; i++) {
        const categories = Object.values(ChallengeCategory);
        const difficulties = Object.values(ChallengeDifficulty);

        const challenge = BattleChallenge?.create(
          `challenge_${i}`,
          `Challenge ${i}`,
          `Description ${i}`,
          [`opponent_${i % 20}`],
          ChallengeRuleset?.create(
            [`spirit_${i % 5}`],
            i % 30,
            [`item_${i % 10}`]
          ),
          { exp: 100 + i, gold: 50 + (i % 10) },
          categories[i % categories?.length],
          difficulties[i % difficulties?.length],
          i % 25,
          i % 11,
          [`tag_${i % 10}`]
        );

        challengeManager?.registerChallenge(challenge);
      }

      const startTime = performance?.now();

      // Perform various filtering operations
      for (let i = 0; i < 100; i++) {
        challengeManager?.getFilteredChallenges({
          category: ChallengeCategory?.MAIN_STORY,
          minPriority: 5,
          tags: ['tag_0', 'tag_1'],
          searchText: 'Description'
        });

        challengeManager?.getFilteredChallenges({
          difficulty: ChallengeDifficulty?.HARD,
          limit: 50
        });

        challengeManager?.getStatistics();
      }

      const endTime = performance?.now();

      expect(endTime - startTime).toBeLessThan(500); // Should be reasonably fast
    });
  });
});
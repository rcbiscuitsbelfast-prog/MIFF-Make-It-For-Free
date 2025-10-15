/**
 * SyncPure Golden Tests
 *
 * Comprehensive tests for the SyncPure spirit synchronization system.
 * Tests cover sync management, event processing, challenges, and statistics.
 */


import {
  SyncManager,
  SyncEvent,
  SyncChallenge,
  SyncTrigger,
  SpiritSyncEntry,
  SyncUtils,
  ISyncEventData
} from '../index';

describe('SyncPure Golden Tests', () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    syncManager = new SyncManager({ enableEvents: false });
  });

  describe('SyncEvent Basic Functionality', () => {
    test('should create sync event with default values', () => {
      const event = new SyncEvent(SyncTrigger.BATTLE_WIN);
      expect(event.trigger).toBe(SyncTrigger.BATTLE_WIN);
      expect(event.magnitude).toBe(1);
      expect(event.tag).toBeUndefined();
      expect(event.loreUnlockID).toBeUndefined();
      expect(event.evolutionHint).toBeUndefined();
    });

    test('should create sync event with custom values', () => {
      const event = new SyncEvent(
        SyncTrigger.ITEM_USAGE,
        10,
        'rare_sword',
        'sword_lore',
        'sword_evolution'
      );

      expect(event.trigger).toBe(SyncTrigger.ITEM_USAGE);
      expect(event.magnitude).toBe(10);
      expect(event.tag).toBe('rare_sword');
      expect(event.loreUnlockID).toBe('sword_lore');
      expect(event.evolutionHint).toBe('sword_evolution');
    });

    test('should enforce non-negative magnitude', () => {
      const event = new SyncEvent(SyncTrigger.BATTLE_WIN, -5);
      expect(event.magnitude).toBe(0); // Should be clamped to 0
    });

    test('should create battle win events', () => {
      const event1 = SyncEvent.createBattleWin(1);
      const event2 = SyncEvent.createBattleWin(3);

      expect(event1.trigger).toBe(SyncTrigger.BATTLE_WIN);
      expect(event1.magnitude).toBe(10); // 10 * 1
      expect(event2.magnitude).toBe(30); // 10 * 3
      expect(event1.tag).toContain('battle_diff_1');
      expect(event2.tag).toContain('battle_diff_3');
    });

    test('should create item usage events', () => {
      const event1 = SyncEvent.createItemUsage('health_potion', 1);
      const event2 = SyncEvent.createItemUsage('legendary_weapon', 5);

      expect(event1.trigger).toBe(SyncTrigger.ITEM_USAGE);
      expect(event1.magnitude).toBe(5); // 5 * 1
      expect(event2.magnitude).toBe(40); // 5 * 8
      expect(event1.tag).toBe('health_potion');
      expect(event2.tag).toBe('legendary_weapon');
    });

    test('should create dialogue choice events', () => {
      const event1 = SyncEvent.createDialogueChoice('choice_1', 1);
      const event2 = SyncEvent.createDialogueChoice('choice_2', 2.5);

      expect(event1.trigger).toBe(SyncTrigger.DIALOGUE_CHOICE);
      expect(event1.magnitude).toBe(3); // 3 * 1
      expect(event2.magnitude).toBe(8); // 3 * 2.5 rounded
      expect(event1.tag).toBe('choice_1');
      expect(event2.tag).toBe('choice_2');
    });

    test('should create rhythm challenge events', () => {
      const event1 = SyncEvent.createRhythmChallenge(0.8, 1);
      const event2 = SyncEvent.createRhythmChallenge(0.95, 3);

      expect(event1.trigger).toBe(SyncTrigger.RHYTHM_CHALLENGE_SUCCESS);
      expect(event1.magnitude).toBe(12); // 15 * 0.8 * 1
      expect(event2.magnitude).toBe(43); // 15 * 0.95 * 3 rounded
      expect(event1.tag).toContain('rhythm_1');
      expect(event2.tag).toContain('rhythm_3');
    });

    test('should clone correctly', () => {
      const original = new SyncEvent(
        SyncTrigger.ITEM_USAGE,
        10,
        'test_item',
        'test_lore',
        'test_evolution'
      );

      const clone = original.clone();

      expect(clone.trigger).toBe(original.trigger);
      expect(clone.magnitude).toBe(original.magnitude);
      expect(clone.tag).toBe(original.tag);
      expect(clone.loreUnlockID).toBe(original.loreUnlockID);
      expect(clone.evolutionHint).toBe(original.evolutionHint);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validEvent = new SyncEvent(SyncTrigger.BATTLE_WIN, 10, 'test');
      expect(validEvent.validate()).toHaveLength(0);

      const invalidEvent = new SyncEvent(SyncTrigger.BATTLE_WIN, -5);
      const errors = invalidEvent.validate();
      expect(errors).toContain('Sync event magnitude cannot be negative');
    });

    test('should generate event summaries correctly', () => {
      const event1 = new SyncEvent(SyncTrigger.BATTLE_WIN, 15, 'boss_fight');
      const event2 = new SyncEvent(SyncTrigger.ITEM_USAGE, 25, 'legendary', 'unlock', 'evolve');

      expect(event1.getSummary()).toBe('battle_win (+15 sync) [boss_fight]');
      expect(event2.getSummary()).toBe('item_usage (+25 sync) [legendary] -> evolve');
    });
  });

  describe('SyncChallenge Basic Functionality', () => {
    test('should create challenge with default values', () => {
      const challenge = new SyncChallenge();
      expect(challenge.bpm).toBe(120);
      expect(challenge.difficulty).toBe(1);
      expect(challenge.stemID).toBe('');
    });

    test('should create challenge with custom values', () => {
      const challenge = new SyncChallenge(140, 3, 'boss_theme');
      expect(challenge.bpm).toBe(140);
      expect(challenge.difficulty).toBe(3);
      expect(challenge.stemID).toBe('boss_theme');
    });

    test('should enforce BPM constraints', () => {
      const lowBPM = new SyncChallenge(50, 1, 'test');
      const highBPM = new SyncChallenge(250, 1, 'test');

      expect(lowBPM.bpm).toBe(60); // Clamped to minimum
      expect(highBPM.bpm).toBe(200); // Clamped to maximum
    });

    test('should enforce difficulty constraints', () => {
      const lowDiff = new SyncChallenge(120, 0, 'test');
      const highDiff = new SyncChallenge(120, 4, 'test');

      expect(lowDiff.difficulty).toBe(1); // Clamped to minimum
      expect(highDiff.difficulty).toBe(3); // Clamped to maximum
    });

    test('should evaluate performance correctly', () => {
      const challenge = new SyncChallenge(120, 2, 'test');

      expect(challenge.evaluatePerformance(0.0)).toBe(0);   // 0% accuracy
      expect(challenge.evaluatePerformance(0.5)).toBe(8);   // 50% accuracy
      expect(challenge.evaluatePerformance(1.0)).toBe(15);  // 100% accuracy

      // Test different difficulties
      const easy = new SyncChallenge(120, 1, 'test');
      const normal = new SyncChallenge(120, 2, 'test');
      const hard = new SyncChallenge(120, 3, 'test');

      expect(easy.evaluatePerformance(1.0)).toBe(10);   // 10 * 1.0 * 1.0
      expect(normal.evaluatePerformance(1.0)).toBe(15); // 10 * 1.0 * 1.5
      expect(hard.evaluatePerformance(1.0)).toBe(20);   // 10 * 1.0 * 2.0
    });

    test('should get difficulty rating correctly', () => {
      const easy = new SyncChallenge(120, 1, 'test');
      const normal = new SyncChallenge(120, 2, 'test');
      const hard = new SyncChallenge(120, 3, 'test');

      expect(easy.getDifficultyRating()).toBe('Easy');
      expect(normal.getDifficultyRating()).toBe('Normal');
      expect(hard.getDifficultyRating()).toBe('Hard');
    });

    test('should get max potential sync correctly', () => {
      const challenge = new SyncChallenge(120, 2, 'test');
      expect(challenge.getMaxPotentialSync()).toBe(15); // Perfect performance
    });

    test('should get estimated sync correctly', () => {
      const challenge = new SyncChallenge(120, 2, 'test');

      expect(challenge.getEstimatedSync(0.5)).toBe(8);   // 50% accuracy
      expect(challenge.getEstimatedSync(0.85)).toBe(13); // 85% accuracy
    });

    test('should clone correctly', () => {
      const original = new SyncChallenge(140, 3, 'boss_theme');
      const clone = original.clone();

      expect(clone.bpm).toBe(original.bpm);
      expect(clone.difficulty).toBe(original.difficulty);
      expect(clone.stemID).toBe(original.stemID);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validChallenge = new SyncChallenge(120, 2, 'test_theme');
      expect(validChallenge.validate()).toHaveLength(0);

      const invalidChallenge = new SyncChallenge(50, 0, '');
      const errors = invalidChallenge.validate();
      expect(errors).toContain('BPM must be between 60 and 200');
      expect(errors).toContain('Difficulty must be between 1 and 3');
      expect(errors).toContain('Stem ID cannot be empty');
    });
  });

  describe('SpiritSyncEntry Basic Functionality', () => {
    test('should create entry with default values', () => {
      const entry = new SpiritSyncEntry('test_spirit');
      expect(entry.spiritId).toBe('test_spirit');
      expect(entry.currentLevel).toBe(0);
      expect(entry.thresholds).toHaveLength(0);
      expect(entry.totalEvents).toBe(0);
      expect(entry.totalSyncGained).toBe(0);
    });

    test('should create entry with custom values', () => {
      const entry = new SpiritSyncEntry('test_spirit', 25, [10, 50, 100]);
      expect(entry.spiritId).toBe('test_spirit');
      expect(entry.currentLevel).toBe(25);
      expect(entry.thresholds).toEqual([10, 50, 100]);
      expect(entry.totalEvents).toBe(0);
      expect(entry.totalSyncGained).toBe(0);
    });

    test('should calculate level up status correctly', () => {
      const entry1 = new SpiritSyncEntry('spirit1', 25, [10, 50, 100]);
      const entry2 = new SpiritSyncEntry('spirit2', 100, [10, 50, 100]);
      const entry3 = new SpiritSyncEntry('spirit3', 25, []);

      expect(entry1.canLevelUp).toBe(true);
      expect(entry2.canLevelUp).toBe(false); // At max level
      expect(entry3.canLevelUp).toBe(false); // No thresholds
    });

    test('should calculate next threshold correctly', () => {
      const entry1 = new SpiritSyncEntry('spirit1', 25, [10, 50, 100]);
      const entry2 = new SpiritSyncEntry('spirit2', 100, [10, 50, 100]);
      const entry3 = new SpiritSyncEntry('spirit3', 25, []);

      expect(entry1.nextThreshold).toBe(50);
      expect(entry2.nextThreshold).toBeNull(); // At max level
      expect(entry3.nextThreshold).toBeNull(); // No thresholds
    });

    test('should calculate sync to next level correctly', () => {
      const entry1 = new SpiritSyncEntry('spirit1', 25, [10, 50, 100]);
      const entry2 = new SpiritSyncEntry('spirit2', 100, [10, 50, 100]);
      const entry3 = new SpiritSyncEntry('spirit3', 25, []);

      expect(entry1.syncToNextLevel).toBe(25); // 50 - 25
      expect(entry2.syncToNextLevel).toBeNull(); // At max level
      expect(entry3.syncToNextLevel).toBeNull(); // No thresholds
    });

    test('should calculate level progress correctly', () => {
      const entry1 = new SpiritSyncEntry('spirit1', 25, [10, 50, 100]);
      const entry2 = new SpiritSyncEntry('spirit2', 60, [10, 50, 100]);
      const entry3 = new SpiritSyncEntry('spirit3', 100, [10, 50, 100]);

      expect(entry1.levelProgress).toBe(0.5); // (25-10)/(50-10) = 15/40 = 0.375 ≈ 0.38
      expect(entry2.levelProgress).toBe(1.0); // At threshold
      expect(entry3.levelProgress).toBe(1.0); // At max level
    });

    test('should add sync correctly', () => {
      const entry = new SpiritSyncEntry('test', 10, [20, 40]);

      const levelIncrease = entry.addSync(15);
      expect(levelIncrease).toBe(15);
      expect(entry.currentLevel).toBe(25);
      expect(entry.totalSyncGained).toBe(15);
      expect(entry.totalEvents).toBe(1);
    });

    test('should set sync level correctly', () => {
      const entry = new SpiritSyncEntry('test', 10, [20, 40]);

      const levelChange = entry.setSyncLevel(35);
      expect(levelChange).toBe(25);
      expect(entry.currentLevel).toBe(35);
    });

    test('should reset sync correctly', () => {
      const entry = new SpiritSyncEntry('test', 25, [10, 50]);

      const oldLevel = entry.resetSync();
      expect(oldLevel).toBe(25);
      expect(entry.currentLevel).toBe(0);
    });

    test('should manage thresholds correctly', () => {
      const entry = new SpiritSyncEntry('test', 10, [20, 40]);

      // Add threshold
      const added = entry.addThreshold(30);
      expect(added).toBe(true);
      expect(entry.thresholds).toEqual([20, 30, 40]);

      // Add duplicate threshold
      const duplicateAdded = entry.addThreshold(30);
      expect(duplicateAdded).toBe(false);
      expect(entry.thresholds).toEqual([20, 30, 40]);

      // Remove threshold
      const removed = entry.removeThreshold(30);
      expect(removed).toBe(true);
      expect(entry.thresholds).toEqual([20, 40]);

      // Remove non-existent threshold
      const notRemoved = entry.removeThreshold(100);
      expect(notRemoved).toBe(false);
    });

    test('should handle threshold removal with level adjustment', () => {
      const entry = new SpiritSyncEntry('test', 50, [10, 25, 50, 100]);

      // Remove threshold that current level exceeds
      entry.removeThreshold(25);
      expect(entry.currentLevel).toBe(50); // Should remain unchanged

      // Remove threshold above current level
      entry.removeThreshold(100);
      expect(entry.thresholds).toEqual([10, 50]);
      expect(entry.currentLevel).toBe(50); // Should remain unchanged
    });

    test('should clone correctly', () => {
      const original = new SpiritSyncEntry('test', 25, [10, 50, 100]);
      original.addSync(5); // Should not affect clone

      const clone = original.clone();

      expect(clone.spiritId).toBe(original.spiritId);
      expect(clone.currentLevel).toBe(original.currentLevel);
      expect(clone.thresholds).toEqual(original.thresholds);
      expect(clone.totalEvents).toBe(original.totalEvents);
      expect(clone.totalSyncGained).toBe(original.totalSyncGained);
      expect(clone).not.toBe(original);
      expect(clone.thresholds).not.toBe(original.thresholds); // Deep clone
    });

    test('should validate correctly', () => {
      const validEntry = new SpiritSyncEntry('test', 25, [10, 50, 100]);
      expect(validEntry.validate()).toHaveLength(0);

      const invalidEntry = new SpiritSyncEntry('', -10, [-5, 10]);
      const errors = invalidEntry.validate();
      expect(errors).toContain('Spirit ID cannot be empty');
      expect(errors).toContain('Current level cannot be negative');
      expect(errors).toContain('Thresholds cannot contain negative values');
    });
  });

  describe('SyncManager Basic Functionality', () => {
    test('should create manager with default configuration', () => {
      const manager = new SyncManager();
      expect(manager.getAllSpirits()).toHaveLength(0);
    });

    test('should create manager with custom configuration', () => {
      const manager = new SyncManager({
        defaultMaxLevel: 200,
        enableEvents: true,
        autoSave: true
      });

      expect(manager.getAllSpirits()).toHaveLength(0);
    });

    test('should get sync levels correctly', () => {
      expect(syncManager.getSyncLevel('nonexistent')).toBe(0);

      syncManager.increaseSync('test_spirit', 25);
      expect(syncManager.getSyncLevel('test_spirit')).toBe(25);
      expect(syncManager.getSyncLevel('nonexistent')).toBe(0);
    });

    test('should get sync entries correctly', () => {
      expect(syncManager.getSyncEntry('nonexistent')).toBeNull();

      syncManager.increaseSync('test_spirit', 25);
      const entry = syncManager.getSyncEntry('test_spirit');
      expect(entry).not.toBeNull();
      expect(entry?.spiritId).toBe('test_spirit');
      expect(entry?.currentLevel).toBe(25);
    });

    test('should increase sync correctly', () => {
      const levelIncrease = syncManager.increaseSync('test_spirit', 10);
      expect(levelIncrease).toBe(10);
      expect(syncManager.getSyncLevel('test_spirit')).toBe(10);
    });

    test('should process sync events correctly', () => {
      const event = new SyncEvent(SyncTrigger.BATTLE_WIN, 15);
      const levelIncrease = syncManager.processSyncEvent('test_spirit', event);

      expect(levelIncrease).toBe(15);
      expect(syncManager.getSyncLevel('test_spirit')).toBe(15);
    });

    test('should process multiple sync events correctly', () => {
      const events = [
        new SyncEvent(SyncTrigger.BATTLE_WIN, 10),
        new SyncEvent(SyncTrigger.ITEM_USAGE, 5, 'test_item', undefined, 'test_hint')
      ];

      const totalIncrease = syncManager.processSyncEvents('test_spirit', events);
      expect(totalIncrease).toBe(15);
      expect(syncManager.getSyncLevel('test_spirit')).toBe(15);
    });

    test('should reset sync correctly', () => {
      syncManager.increaseSync('test_spirit', 25);
      const oldLevel = syncManager.resetSync('test_spirit');

      expect(oldLevel).toBe(25);
      expect(syncManager.getSyncLevel('test_spirit')).toBe(0);
    });

    test('should set thresholds correctly', () => {
      const thresholds = [10, 25, 50];
      const success = syncManager.setThresholds('test_spirit', thresholds);

      expect(success).toBe(true);
      const entry = syncManager.getSyncEntry('test_spirit');
      expect(entry?.thresholds).toEqual([10, 25, 50]);
    });

    test('should get spirits by various criteria', () => {
      syncManager.increaseSync('spirit1', 10);
      syncManager.increaseSync('spirit2', 25);
      syncManager.increaseSync('spirit3', 30);

      expect(syncManager.getAllSpirits()).toHaveLength(3);
      expect(syncManager.getSpiritsAtLevel(10)).toEqual(['spirit1']);
      expect(syncManager.getSpiritsAtLevel(25)).toEqual(['spirit2']);
      expect(syncManager.getSpiritsAboveThreshold(20)).toEqual(['spirit2', 'spirit3']);
    });

    test('should get statistics correctly', () => {
      syncManager.increaseSync('spirit1', 10);
      syncManager.increaseSync('spirit2', 25);
      syncManager.increaseSync('spirit3', 30);

      const stats = syncManager.getStatistics();

      expect(stats.totalSyncEvents).toBe(3);
      expect(stats.totalSyncGained).toBe(65);
      expect(stats.averageSyncPerEvent).toBeCloseTo(21.67);
      expect(stats.highestSyncLevel).toBe(30);
      expect(stats.mostActiveSpirit).toBe('spirit3');
    });

    test('should handle event callbacks correctly', () => {
      const callbackCalls: Array<{ spiritId: string; newLevel: number; oldLevel: number }> = [];

      syncManager = new SyncManager({ enableEvents: true });
      syncManager.addSyncLevelChangedCallback((spiritId, newLevel, oldLevel) => {
        callbackCalls.push({ spiritId, newLevel, oldLevel });
      });

      syncManager.increaseSync('test_spirit', 25);

      expect(callbackCalls).toHaveLength(1);
      expect(callbackCalls[0].spiritId).toBe('test_spirit');
      expect(callbackCalls[0].oldLevel).toBe(0);
      expect(callbackCalls[0].newLevel).toBe(25);
    });

    test('should remove event callbacks correctly', () => {
      const callbackCalls: Array<{ spiritId: string; newLevel: number; oldLevel: number }> = [];

      const callback = (spiritId: string, newLevel: number, oldLevel: number) => {
        callbackCalls.push({ spiritId, newLevel, oldLevel });
      };

      syncManager = new SyncManager({ enableEvents: true });
      syncManager.addSyncLevelChangedCallback(callback);
      syncManager.removeSyncLevelChangedCallback(callback);

      syncManager.increaseSync('test_spirit', 25);

      expect(callbackCalls).toHaveLength(0); // Callback should have been removed
    });

    test('should clear all data correctly', () => {
      syncManager.increaseSync('spirit1', 10);
      syncManager.increaseSync('spirit2', 25);
      syncManager.setThresholds('spirit1', [10, 20]);

      syncManager.clear();

      expect(syncManager.getAllSpirits()).toHaveLength(0);
      expect(syncManager.getStatistics().totalSyncEvents).toBe(0);
    });

    test('should export and import data correctly', () => {
      syncManager.increaseSync('spirit1', 15);
      syncManager.setThresholds('spirit1', [10, 25, 50]);

      const exportedData = syncManager.exportData();
      expect(exportedData.spirit1.currentLevel).toBe(15);
      expect(exportedData.spirit1.thresholds).toEqual([10, 25, 50]);

      // Clear and import
      syncManager.clear();
      syncManager.importData(exportedData);

      expect(syncManager.getSyncLevel('spirit1')).toBe(15);
      const entry = syncManager.getSyncEntry('spirit1');
      expect(entry?.thresholds).toEqual([10, 25, 50]);
    });

    test('should get level up candidates correctly', () => {
      syncManager.increaseSync('spirit1', 10);
      syncManager.increaseSync('spirit2', 25);
      syncManager.setThresholds('spirit1', [20, 40]);
      syncManager.setThresholds('spirit2', [10, 30, 50]);

      const candidates = syncManager.getLevelUpCandidates();
      expect(candidates).toHaveLength(2);
      expect(candidates[0].spiritId).toBe('spirit2'); // 5 sync needed (30 - 25)
      expect(candidates[0].syncNeeded).toBe(5);
      expect(candidates[1].spiritId).toBe('spirit1'); // 10 sync needed (20 - 10)
      expect(candidates[1].syncNeeded).toBe(10);
    });
  });

  describe('SyncUtils', () => {
    test('should create standard thresholds correctly', () => {
      const thresholds = SyncUtils.createStandardThresholds(50);
      expect(thresholds).toEqual([10, 20, 30, 40, 50]);
    });

    test('should create exponential thresholds correctly', () => {
      const thresholds = SyncUtils.createExponentialThresholds(10, 100);
      expect(thresholds).toEqual([10, 15, 22, 33, 49, 73]); // 1.5x multiplier with floor
    });

    test('should calculate battle sync gain correctly', () => {
      expect(SyncUtils.calculateBattleSyncGain(10, 12, true, 1)).toBe(14); // (10 + 2*2) * 1 = 14
      expect(SyncUtils.calculateBattleSyncGain(10, 15, true, 2)).toBe(40); // (10 + 5*2) * 2 = 40
      expect(SyncUtils.calculateBattleSyncGain(10, 12, false, 1)).toBe(0); // No gain for loss
    });

    test('should calculate item sync gain correctly', () => {
      expect(SyncUtils.calculateItemSyncGain('common')).toBe(1);
      expect(SyncUtils.calculateItemSyncGain('uncommon')).toBe(2);
      expect(SyncUtils.calculateItemSyncGain('rare')).toBe(3);
      expect(SyncUtils.calculateItemSyncGain('epic')).toBe(5);
      expect(SyncUtils.calculateItemSyncGain('legendary')).toBe(8);
    });

    test('should calculate rhythm sync gain correctly', () => {
      expect(SyncUtils.calculateRhythmSyncGain(0.8, 1)).toBe(12); // 15 * 0.8 * 1.0 (difficulty multiplier)
      expect(SyncUtils.calculateRhythmSyncGain(0.9, 2)).toBe(20); // 15 * 0.9 * 1.5 (difficulty multiplier)
      expect(SyncUtils.calculateRhythmSyncGain(1.0, 3)).toBe(34); // 15 * 1.0 * 2.0 (difficulty multiplier)
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete sync workflow', () => {
      const syncManager = new SyncManager({ enableEvents: true });

      // Add spirit with initial sync
      syncManager.increaseSync('ember', 5);
      syncManager.setThresholds('ember', [10, 25, 50, 100]);

      // Process various sync events
      const events = [
        SyncEvent.createBattleWin(1),      // +10 sync → Level 15
        SyncEvent.createItemUsage('health_potion', 1),  // +5 sync → Level 20
        SyncEvent.createBattleWin(2),      // +20 sync → Level 40
        SyncEvent.createRhythmChallenge(0.9, 2),        // +27 sync → Level 67
        SyncEvent.createDialogueChoice('choice_1', 1.5) // +4.5 sync → Level 71.5
      ];

      let totalLevelIncrease = 0;
      events.forEach(event => {
        const levelIncrease = syncManager.processSyncEvent('ember', event);
        totalLevelIncrease += levelIncrease;
      });

      const finalLevel = syncManager.getSyncLevel('ember');
      expect(finalLevel).toBe(71); // Rounded down from 71.5

      const entry = syncManager.getSyncEntry('ember')!;
      expect(entry.totalEvents).toBe(5);
      expect(entry.totalSyncGained).toBe(66); // 10+5+20+27+4.5
      expect(totalLevelIncrease).toBe(66);
    });

    test('should handle multi-spirit sync competition', () => {
      const syncManager = new SyncManager({ enableEvents: true });

      // Add multiple spirits
      const spirits = ['ember', 'ripple', 'sprout'];
      spirits.forEach(spiritId => {
        syncManager.increaseSync(spiritId, 0);
        syncManager.setThresholds(spiritId, [10, 25, 50]);
      });

      // Simulate competition with different strategies
      const spiritEvents = {
        'ember': [
          SyncEvent.createBattleWin(1),    // Aggressive battle focus
          SyncEvent.createBattleWin(2),
          SyncEvent.createBattleWin(1)
        ],
        'ripple': [
          SyncEvent.createItemUsage('rare_crystal', 3),  // Item collection focus
          SyncEvent.createItemUsage('legendary_weapon', 5),
          SyncEvent.createRhythmChallenge(0.9, 2)
        ],
        'sprout': [
          SyncEvent.createDialogueChoice('choice_1', 2),  // Social focus
          SyncEvent.createDialogueChoice('choice_2', 1.5),
          SyncEvent.createBattleWin(1)
        ]
      };

      spirits.forEach(spiritId => {
        const events = spiritEvents[spiritId as keyof typeof spiritEvents];
        syncManager.processSyncEvents(spiritId, events);
      });

      // Check results
      const finalLevels = spirits.map(spiritId => syncManager.getSyncLevel(spiritId));
      expect(finalLevels).toHaveLength(3);

      const stats = syncManager.getStatistics();
      expect(stats.totalSyncEvents).toBe(9); // 3 spirits * 3 events each
      expect(stats.totalSyncGained).toBeGreaterThan(0);
      expect(stats.highestSyncLevel).toBe(Math.max(...finalLevels));
    });

    test('should handle sync challenge progression', () => {
      const syncManager = new SyncManager({ enableEvents: true });

      // Add spirit focused on rhythm challenges
      syncManager.increaseSync('musician', 0);
      syncManager.setThresholds('musician', [20, 50, 100, 200]);

      // Create challenges of increasing difficulty
      const challenges = [
        new SyncChallenge(100, 1, 'easy_theme'),
        new SyncChallenge(120, 2, 'normal_theme'),
        new SyncChallenge(140, 3, 'hard_theme')
      ];

      // Play challenges with improving accuracy
      const accuracies = [0.7, 0.85, 0.95];
      let totalSyncGained = 0;

      challenges.forEach((challenge, index) => {
        const syncGain = challenge.evaluatePerformance(accuracies[index]);
        const levelIncrease = syncManager.processSyncEvent(
          'musician',
          SyncEvent.createRhythmChallenge(accuracies[index], challenge.difficulty)
        );

        totalSyncGained += syncGain;
        log.info(`Challenge ${index + 1}: +${syncGain} sync (${(accuracies[index] * 100).toFixed(1)}% accuracy)`);
      });

      const finalLevel = syncManager.getSyncLevel('musician');
      expect(finalLevel).toBeGreaterThan(0);
      expect(finalLevel).toBeLessThan(200);

      const entry = syncManager.getSyncEntry('musician')!;
      expect(entry.totalEvents).toBe(3);
      expect(entry.totalSyncGained).toBeGreaterThan(0);
    });

    test('should handle sync event history and analysis', () => {
      const syncManager = new SyncManager({ enableEvents: true });

      syncManager.increaseSync('analyst', 0);
      syncManager.setThresholds('analyst', [10, 25, 50, 100, 200]);

      // Process various types of events
      const testEvents = [
        SyncEvent.createBattleWin(1),
        SyncEvent.createBattleWin(2),
        SyncEvent.createItemUsage('common_potion', 1),
        SyncEvent.createItemUsage('rare_gem', 3),
        SyncEvent.createRhythmChallenge(0.8, 1),
        SyncEvent.createRhythmChallenge(0.9, 2),
        SyncEvent.createDialogueChoice('choice_1', 1),
        SyncEvent.createDialogueChoice('choice_2', 2)
      ];

      testEvents.forEach((event, index) => {
        syncManager.processSyncEvent('analyst', event);
        log.info(`Event ${index + 1}: ${event.getSummary()}`);
      });

      // Analyze history
      const history = syncManager.getEventHistory();
      expect(history).toHaveLength(8);

      const stats = syncManager.getStatistics();
      expect(stats.totalSyncEvents).toBe(8);
      expect(stats.totalSyncGained).toBeGreaterThan(0);
      expect(stats.averageSyncPerEvent).toBeGreaterThan(0);

      // Check event data integrity
      history.forEach(eventData => {
        expect(eventData.spiritId).toBe('analyst');
        expect(eventData.event).toBeDefined();
        expect(eventData.timestamp).toBeGreaterThan(0);
        expect(eventData.previousLevel).toBeDefined();
        expect(eventData.newLevel).toBeGreaterThanOrEqual(eventData.previousLevel);
      });
    });

    test('should handle threshold-based progression', () => {
      const syncManager = new SyncManager({ enableEvents: true });

      // Add spirit with specific thresholds
      syncManager.increaseSync('progression_test', 0);
      syncManager.setThresholds('progression_test', [10, 30, 60, 100]);

      // Track level changes
      const levelChanges: Array<{ oldLevel: number; newLevel: number }> = [];
      syncManager.addSyncLevelChangedCallback((spiritId, newLevel, oldLevel) => {
        levelChanges.push({ oldLevel, newLevel });
      });

      // Add sync in increments that should trigger thresholds
      syncManager.increaseSync('progression_test', 10); // Should stay at level 10
      syncManager.increaseSync('progression_test', 20); // Should jump to level 30
      syncManager.increaseSync('progression_test', 30); // Should jump to level 60
      syncManager.increaseSync('progression_test', 40); // Should jump to level 100

      const finalLevel = syncManager.getSyncLevel('progression_test');
      expect(finalLevel).toBe(100);

      // Should have triggered level changes
      expect(levelChanges.length).toBeGreaterThan(0);

      const entry = syncManager.getSyncEntry('progression_test')!;
      expect(entry.currentLevel).toBe(100);
      expect(entry.canLevelUp).toBe(false); // At max level
      expect(entry.nextThreshold).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid sync events', () => {
      const invalidEvent = new SyncEvent(SyncTrigger.BATTLE_WIN, -10);

      const errors = invalidEvent.validate();
      expect(errors).toContain('Sync event magnitude cannot be negative');

      const levelIncrease = syncManager.processSyncEvent('test_spirit', invalidEvent);
      expect(levelIncrease).toBe(0); // Should not process invalid events
    });

    test('should handle invalid sync operations', () => {
      // Test negative sync increase
      const negativeIncrease = syncManager.increaseSync('test_spirit', -5);
      expect(negativeIncrease).toBe(0);

      // Test empty spirit ID
      const emptyIdIncrease = syncManager.increaseSync('', 10);
      expect(emptyIdIncrease).toBe(0);

      // Test invalid thresholds
      const invalidThresholds = syncManager.setThresholds('test_spirit', [-10, 0, 10]);
      expect(invalidThresholds).toBe(false);
    });

    test('should handle invalid challenge configurations', () => {
      const invalidChallenge = new SyncChallenge(50, 0, '');

      const errors = invalidChallenge.validate();
      expect(errors).toContain('BPM must be between 60 and 200');
      expect(errors).toContain('Difficulty must be between 1 and 3');
      expect(errors).toContain('Stem ID cannot be empty');

      // Should still evaluate (with clamped values)
      const syncGain = invalidChallenge.evaluatePerformance(0.8);
      expect(syncGain).toBeGreaterThanOrEqual(0);
    });

    test('should handle edge cases gracefully', () => {
      // Test with very large values
      const largeIncrease = syncManager.increaseSync('test_spirit', 10000);
      expect(largeIncrease).toBe(10000);

      // Test with very large thresholds
      const largeThresholds = syncManager.setThresholds('test_spirit', [1000000, 2000000]);
      expect(largeThresholds).toBe(true);

      // Test with null/undefined values
      const nullEvent = syncManager.processSyncEvent('test_spirit', null as any);
      expect(nullEvent).toBe(0);

      const undefinedEvent = syncManager.processSyncEvent('test_spirit', undefined as any);
      expect(undefinedEvent).toBe(0);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many spirits efficiently', () => {
      const startTime = performance.now();

      // Create many spirits
      for (let i = 0; i < 100; i++) {
        syncManager.increaseSync(`spirit_${i}`, Math.floor(Math.random() * 100));
        syncManager.setThresholds(`spirit_${i}`, SyncUtils.createStandardThresholds(100));
      }

      const endTime = performance.now();

      expect(syncManager.getAllSpirits()).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle many sync events efficiently', () => {
      syncManager.increaseSync('performance_test', 0);
      syncManager.setThresholds('performance_test', SyncUtils.createStandardThresholds(100));

      const startTime = performance.now();

      // Process many events
      for (let i = 0; i < 1000; i++) {
        const event = SyncEvent.createBattleWin(Math.floor(Math.random() * 3) + 1);
        syncManager.processSyncEvent('performance_test', event);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(syncManager.getStatistics().totalSyncEvents).toBe(1000);
    });

    test('should handle statistics calculation efficiently', () => {
      // Create many spirits with different sync levels
      for (let i = 0; i < 50; i++) {
        syncManager.increaseSync(`stat_spirit_${i}`, Math.floor(Math.random() * 50));
      }

      const startTime = performance.now();

      // Multiple statistics calculations
      for (let i = 0; i < 100; i++) {
        const stats = syncManager.getStatistics();
        const history = syncManager.getEventHistory();
        const candidates = syncManager.getLevelUpCandidates();
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });
  });
});
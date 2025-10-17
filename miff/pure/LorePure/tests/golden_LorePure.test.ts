/**
 * LorePure Golden Tests
 *
 * Comprehensive tests for the LorePure lore management system.
 * Tests cover lore entries, unlock conditions, filtering, statistics, and integration scenarios.
 */

import {
  LoreCodexManager,
  LoreEntry,
  LoreUnlockCondition,
  LoreUtils,
  LoreCategory,
  LoreConditionType,
  LoreUnlockState,
  ILoreFilter,
  IPlayerContext,
  ILoreEntry,
  ILoreUnlockCondition
} from '../index';

// Mock Player Context for testing
class MockPlayerContext implements IPlayerContext {
  private questFlags = new Set<string>();
  private capturedSpirits = new Set<string>();
  private visitedLocations = new Set<string>();
  private spiritSyncLevels = new Map<string, number>();

  hasQuestFlag(flagId: string): boolean {
    return this?.questFlags.has(flagId);
  }

  hasCapturedSpirit(spiritId: string): boolean {
    return this?.capturedSpirits.has(spiritId);
  }

  getSpiritSyncLevel(spiritId: string): number {
    return this?.spiritSyncLevels.get(spiritId) || 0;
  }

  hasVisitedLocation(locationId: string): boolean {
    return this?.visitedLocations.has(locationId);
  }

  getPlayerLevel(): number {
    return 10;
  }

  getCompletedQuests(): string[] {
    return Array.from(this.questFlags);
  }

  getUnlockedLocations(): string[] {
    return Array.from(this.visitedLocations);
  }

  getCapturedSpirits(): string[] {
    return Array.from(this.capturedSpirits);
  }

  setQuestFlag(flagId: string): void {
    this?.questFlags.add(flagId);
  }

  captureSpirit(spiritId: string): void {
    this?.capturedSpirits.add(spiritId);
  }

  setSyncLevel(spiritId: string, level: number): void {
    this?.spiritSyncLevels.set(spiritId, level);
  }

  visitLocation(locationId: string): void {
    this?.visitedLocations.add(locationId);
  }
}

describe('LorePure Golden Tests', () => {
  describe('LoreEntry Basic Functionality', () => {
    test('should create entry with default values', () => {
      const condition = LoreUnlockCondition?.alwaysTrue();
      const entry = new LoreEntry('test_001', 'Test Entry', 'Test text', condition);

      expect(entry?.loreId).toBe('test_001');
      expect(entry?.title).toBe('Test Entry');
      expect(entry?.text).toBe('Test text');
      expect(entry?.category).toBe(LoreCategory?.MAIN_STORY);
      expect(entry?.priority).toBe(1);
      expect(entry?.tags).toHaveLength(0);
      expect(entry?.unlockState).toBe(LoreUnlockState?.LOCKED);
      expect(entry?.syncThreshold).toBe(0);
    });

    test('should create entry with custom values', () => {
      const condition = LoreUnlockCondition?.spiritCaptured('fire_spirit');
      const entry = new LoreEntry(
        'test_002',
        'Fire Spirit Lore',
        'The fire spirit is known for its passionate nature.',
        condition,
        LoreCategory?.CHARACTER,
        8,
        ['fire', 'spirit', 'character'],
        'fire_spirit',
        'volcano',
        'fire_quest',
        15,
        { author: 'Game Designer', version: '1.0' }
      );

      expect(entry?.loreId).toBe('test_002');
      expect(entry?.title).toBe('Fire Spirit Lore');
      expect(entry?.category).toBe(LoreCategory?.CHARACTER);
      expect(entry?.priority).toBe(8);
      expect(entry?.tags).toEqual(['fire', 'spirit', 'character']);
      expect(entry?.relatedSpiritId).toBe('fire_spirit');
      expect(entry?.locationId).toBe('volcano');
      expect(entry?.questId).toBe('fire_quest');
      expect(entry?.syncThreshold).toBe(15);
      expect(entry?.metadata).toEqual({ author: 'Game Designer', version: '1.0' });
    });

    test('should create main story entry correctly', () => {
      const condition = LoreUnlockCondition?.alwaysTrue();
      const entry = LoreEntry?.mainStory(
        'story_001',
        'The Beginning',
        'In the beginning...',
        condition,
        10,
        ['beginning', 'story']
      );

      expect(entry?.loreId).toBe('story_001');
      expect(entry?.category).toBe(LoreCategory?.MAIN_STORY);
      expect(entry?.priority).toBe(10);
      expect(entry?.tags).toEqual(['beginning', 'story']);
    });

    test('should create character entry correctly', () => {
      const condition = LoreUnlockCondition?.spiritCaptured('hero');
      const entry = LoreEntry?.character(
        'char_001',
        'The Hero\'s Journey',
        'The hero\'s story...',
        'hero',
        condition,
        7,
        ['hero', 'journey']
      );

      expect(entry?.loreId).toBe('char_001');
      expect(entry?.category).toBe(LoreCategory?.CHARACTER);
      expect(entry?.relatedSpiritId).toBe('hero');
      expect(entry?.tags).toEqual(['hero', 'journey']);
    });

    test('should create world entry correctly', () => {
      const condition = LoreUnlockCondition?.locationVisited('mountain');
      const entry = LoreEntry?.world(
        'world_001',
        'The Mountain Peak',
        'The mountain stands tall...',
        'mountain',
        condition,
        5,
        ['mountain', 'peak']
      );

      expect(entry?.loreId).toBe('world_001');
      expect(entry?.category).toBe(LoreCategory?.WORLD);
      expect(entry?.locationId).toBe('mountain');
      expect(entry?.tags).toEqual(['mountain', 'peak']);
    });

    test('should calculate word count correctly', () => {
      const entry = new LoreEntry(
        'test_001',
        'Test',
        'This is a test entry with exactly ten words in the text content.',
        LoreUnlockCondition?.alwaysTrue()
      );

      expect(entry?.getWordCount()).toBe(10);
    });

    test('should calculate character count correctly', () => {
      const entry = new LoreEntry(
        'test_001',
        'Test',
        'This is a test.',
        LoreUnlockCondition?.alwaysTrue()
      );

      expect(entry?.getCharacterCount()).toBe(16); // "This is a test." with punctuation
    });

    test('should estimate reading time correctly', () => {
      const entry = new LoreEntry(
        'test_001',
        'Test',
        'Word '.repeat(200), // 200 words
        LoreUnlockCondition?.alwaysTrue()
      );

      expect(entry?.getReadingTimeEstimate(200)).toBe(1); // 200 words / 200 wpm = 1 minute
      expect(entry?.getReadingTimeEstimate(400)).toBe(1); // Should round up
      expect(entry?.getReadingTimeEstimate(100)).toBe(2); // 200 words / 100 wpm = 2 minutes
    });

    test('should generate summary correctly', () => {
      const shortEntry = new LoreEntry(
        'test_001',
        'Short Title',
        'Short text',
        LoreUnlockCondition?.alwaysTrue()
      );

      const longEntry = new LoreEntry(
        'test_002',
        'Long Title Name',
        'This is a very long text that should be truncated in the summary...',
        LoreUnlockCondition?.alwaysTrue()
      );

      expect(shortEntry?.getSummary()).toContain('Short Title');
      expect(longEntry?.getSummary()).toContain('...');
      expect(longEntry?.getSummary()).toContain('Long Title Name');
    });

    test('should manage tags correctly', () => {
      const entry = new LoreEntry(
        'test_001',
        'Test',
        'Text',
        LoreUnlockCondition?.alwaysTrue(),
        LoreCategory?.MAIN_STORY,
        1,
        ['tag1', 'tag2']
      );

      expect(entry?.hasTag('tag1')).toBe(true);
      expect(entry?.hasTag('tag3')).toBe(false);

      expect(entry?.hasAllTags(['tag1', 'tag2'])).toBe(true);
      expect(entry?.hasAllTags(['tag1', 'tag3'])).toBe(false);

      expect(entry?.hasAnyTag(['tag3', 'tag4'])).toBe(false);
      expect(entry?.hasAnyTag(['tag1', 'tag3'])).toBe(true);

      entry?.addTag('tag3');
      expect(entry?.hasTag('tag3')).toBe(true);
      expect(entry?.tags).toHaveLength(3);

      const removed = entry?.removeTag('tag2');
      expect(removed).toBe(true);
      expect(entry?.hasTag('tag2')).toBe(false);
      expect(entry?.tags).toHaveLength(2);

      const notRemoved = entry?.removeTag('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should handle unlock states correctly', () => {
      const condition = LoreUnlockCondition?.spiritCaptured('test_spirit');
      const entry = new LoreEntry('test_001', 'Test', 'Text', condition);
      const playerContext = new MockPlayerContext();

      // Initially locked
      expect(entry?.unlockState).toBe(LoreUnlockState?.LOCKED);
      expect(entry?.isUnlocked(playerContext)).toBe(false);

      // Unlock
      playerContext?.captureSpirit('test_spirit');
      expect(entry?.isUnlocked(playerContext)).toBe(true);
      expect(entry?.unlockState).toBe(LoreUnlockState?.UNLOCKED);
      expect(entry?.unlockTime).toBeDefined();

      // Mark as read
      entry?.markAsRead();
      expect(entry?.unlockState).toBe(LoreUnlockState?.READ);
      expect(entry?.readTime).toBeDefined();
      expect(entry?.isRead()).toBe(true);
    });

    test('should clone correctly', () => {
      const original = new LoreEntry(
        'test_001',
        'Test',
        'Text',
        LoreUnlockCondition?.spiritCaptured('spirit'),
        LoreCategory?.CHARACTER,
        5,
        ['tag1', 'tag2'],
        'spirit',
        'location',
        'quest',
        10,
        { test: true }
      );

      original?.unlockState = LoreUnlockState?.UNLOCKED;
      original?.unlockTime = 12345;

      const clone = original?.clone();

      expect(clone).toEqual(original);
      expect(clone).not?.toBe(original);
      expect(clone?.metadata).toEqual(original?.metadata);
      expect(clone?.metadata).not?.toBe(original?.metadata);
      expect(clone?.tags).toEqual(original?.tags);
      expect(clone?.tags).not?.toBe(original?.tags);
    });

    test('should convert to/from JSON correctly', () => {
      const original = new LoreEntry(
        'test_001',
        'Test Entry',
        'Test text content',
        LoreUnlockCondition?.spiritCaptured('spirit'),
        LoreCategory?.MAIN_STORY,
        7,
        ['test', 'json'],
        'spirit',
        'location',
        'quest',
        15,
        { version: '1.0' }
      );

      original?.unlockState = LoreUnlockState?.READ;
      original?.unlockTime = 12345;
      original?.readTime = 67890;

      const jsonData = original?.toJSON();
      const reconstructed = LoreEntry?.fromJSON(jsonData);

      expect(reconstructed).toEqual(original);
      expect(reconstructed?.unlockState).toBe(LoreUnlockState?.READ);
      expect(reconstructed?.unlockTime).toBe(12345);
      expect(reconstructed?.readTime).toBe(67890);
    });

    test('should validate correctly', () => {
      const validEntry = new LoreEntry(
        'test_001',
        'Valid Title',
        'Valid text content',
        LoreUnlockCondition?.alwaysTrue(),
        LoreCategory?.MAIN_STORY,
        5
      );

      const invalidEntry = new LoreEntry(
        '',
        '',
        '',
        LoreUnlockCondition?.spiritCaptured(''), // Invalid condition
        LoreCategory?.MAIN_STORY,
        15 // Invalid priority
      );

      expect(validEntry?.validate({})).toHaveLength(0);

      const errors = invalidEntry?.validate({});
      expect(errors).toContain('Lore ID cannot be empty');
      expect(errors).toContain('Title cannot be empty');
      expect(errors).toContain('Text cannot be empty');
      expect(errors).toContain('Priority must be between 0 and 10');
      expect(errors).toContain('String value required for this condition type');
    });
  });

  describe('LoreUnlockCondition Basic Functionality', () => {
    let playerContext: MockPlayerContext;

    beforeEach(() => {
      playerContext = new MockPlayerContext();
    });

    test('should create condition with default values', () => {
      const condition = new LoreUnlockCondition();
      expect(condition?.conditionType).toBe(LoreConditionType?.ALWAYS_TRUE);
      expect(condition?.stringValue).toBeUndefined();
      expect(condition?.intValue).toBe(0);
    });

    test('should create quest flag condition', () => {
      const condition = LoreUnlockCondition?.questFlag('quest_completed');
      expect(condition?.conditionType).toBe(LoreConditionType?.QUEST_FLAG);
      expect(condition?.stringValue).toBe('quest_completed');
      expect(condition?.intValue).toBe(0);
    });

    test('should create spirit captured condition', () => {
      const condition = LoreUnlockCondition?.spiritCaptured('fire_spirit');
      expect(condition?.conditionType).toBe(LoreConditionType?.SPIRIT_CAPTURED);
      expect(condition?.stringValue).toBe('fire_spirit');
      expect(condition?.intValue).toBe(0);
    });

    test('should create sync level condition', () => {
      const condition = LoreUnlockCondition?.syncLevel('water_spirit', 20);
      expect(condition?.conditionType).toBe(LoreConditionType?.SYNC_LEVEL_REACHED);
      expect(condition?.stringValue).toBe('water_spirit');
      expect(condition?.intValue).toBe(20);
    });

    test('should create location visited condition', () => {
      const condition = LoreUnlockCondition?.locationVisited('mountain_peak');
      expect(condition?.conditionType).toBe(LoreConditionType?.LOCATION_VISITED);
      expect(condition?.stringValue).toBe('mountain_peak');
      expect(condition?.intValue).toBe(0);
    });

    test('should create manual unlock condition', () => {
      const condition = LoreUnlockCondition?.manualUnlock();
      expect(condition?.conditionType).toBe(LoreConditionType?.MANUAL_UNLOCK);
      expect(condition?.stringValue).toBeUndefined();
      expect(condition?.intValue).toBe(0);
    });

    test('should create always true condition', () => {
      const condition = LoreUnlockCondition?.alwaysTrue();
      expect(condition?.conditionType).toBe(LoreConditionType?.ALWAYS_TRUE);
      expect(condition?.stringValue).toBeUndefined();
      expect(condition?.intValue).toBe(0);
    });

    test('should check quest flag condition correctly', () => {
      const condition = LoreUnlockCondition?.questFlag('tutorial_done');
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(false);

      playerContext?.setQuestFlag('tutorial_done');
      expect(condition?.isMet(playerContext, entry)).toBe(true);
    });

    test('should check spirit captured condition correctly', () => {
      const condition = LoreUnlockCondition?.spiritCaptured('forest_spirit');
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(false);

      playerContext?.captureSpirit('forest_spirit');
      expect(condition?.isMet(playerContext, entry)).toBe(true);
    });

    test('should check sync level condition correctly', () => {
      const condition = LoreUnlockCondition?.syncLevel('wind_spirit', 25);
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(false);

      playerContext?.setSyncLevel('wind_spirit', 20);
      expect(condition?.isMet(playerContext, entry)).toBe(false);

      playerContext?.setSyncLevel('wind_spirit', 30);
      expect(condition?.isMet(playerContext, entry)).toBe(true);
    });

    test('should check location visited condition correctly', () => {
      const condition = LoreUnlockCondition?.locationVisited('desert_oasis');
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(false);

      playerContext?.visitLocation('desert_oasis');
      expect(condition?.isMet(playerContext, entry)).toBe(true);
    });

    test('should check manual unlock condition correctly', () => {
      const condition = LoreUnlockCondition?.manualUnlock();
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(false);
    });

    test('should check always true condition correctly', () => {
      const condition = LoreUnlockCondition?.alwaysTrue();
      const entry = new LoreEntry('test', 'Test', 'Text', condition);

      expect(condition?.isMet(playerContext, entry)).toBe(true);
    });

    test('should get description correctly', () => {
      expect(LoreUnlockCondition?.questFlag('quest_id').getDescription())
        .toContain('Complete quest flag: quest_id');

      expect(LoreUnlockCondition?.spiritCaptured('spirit_id').getDescription())
        .toContain('Capture spirit: spirit_id');

      expect(LoreUnlockCondition?.syncLevel('spirit_id', 15).getDescription())
        .toContain('Reach sync level 15 with spirit: spirit_id');

      expect(LoreUnlockCondition?.locationVisited('location_id').getDescription())
        .toContain('Visit location: location_id');

      expect(LoreUnlockCondition?.manualUnlock().getDescription())
        .toContain('Manual unlock required');

      expect(LoreUnlockCondition?.alwaysTrue().getDescription())
        .toContain('Always available');
    });

    test('should validate correctly', () => {
      const validCondition = LoreUnlockCondition?.spiritCaptured('spirit');
      expect(validCondition?.validate({})).toHaveLength(0);

      const invalidCondition = LoreUnlockCondition?.spiritCaptured('');
      const errors = invalidCondition?.validate({});
      expect(errors).toHaveLength(1);
      expect(errors[0!]).toContain('String value required');
    });

    test('should clone correctly', () => {
      const original = LoreUnlockCondition?.syncLevel('test_spirit', 25);
      const clone = original?.clone();

      expect(clone).toEqual(original);
      expect(clone).not?.toBe(original);
      expect(clone?.stringValue).toBe(original?.stringValue);
      expect(clone?.intValue).toBe(original?.intValue);
    });

    test('should convert to/from JSON correctly', () => {
      const original = LoreUnlockCondition?.syncLevel('test_spirit', 25);
      const jsonData = original?.toJSON();
      const reconstructed = LoreUnlockCondition?.fromJSON(jsonData);

      expect(reconstructed?.conditionType).toBe(original?.conditionType);
      expect(reconstructed?.stringValue).toBe(original?.stringValue);
      expect(reconstructed?.intValue).toBe(original?.intValue);
    });
  });

  describe('LoreCodexManager Basic Functionality', () => {
    let loreManager: LoreCodexManager;
    let playerContext: MockPlayerContext;

    beforeEach(() => {
      loreManager = new LoreCodexManager();
      playerContext = new MockPlayerContext();
    });

    test('should create manager correctly', () => {
      expect(loreManager).toBeDefined();
      expect(loreManager?.getEntryCount()).toBe(0);
      expect(loreManager?.getUnlockedCount()).toBe(0);
      expect(loreManager?.getReadCount()).toBe(0);
    });

    test('should register lore entries correctly', () => {
      const entry1 = LoreEntry?.mainStory(
        'story_001',
        'Entry 1',
        'Text 1',
        LoreUnlockCondition?.alwaysTrue()
      );

      const entry2 = LoreEntry?.character(
        'char_001',
        'Entry 2',
        'Text 2',
        'spirit',
        LoreUnlockCondition?.spiritCaptured('spirit')
      );

      expect(loreManager?.registerLore(entry1)).toBe(true);
      expect(loreManager?.registerLore(entry2)).toBe(true);
      expect(loreManager?.getEntryCount()).toBe(2);

      // Test duplicate registration
      expect(loreManager?.registerLore(entry1)).toBe(true); // Should update existing
      expect(loreManager?.getEntryCount()).toBe(2);
    });

    test('should reject invalid entries', () => {
      const invalidEntry = new LoreEntry(
        '',
        '',
        '',
        LoreUnlockCondition?.spiritCaptured('') // Invalid condition
      );

      expect(loreManager?.registerLore(invalidEntry)).toBe(false);
      expect(loreManager?.getEntryCount()).toBe(0);
    });

    test('should get lore entries correctly', () => {
      const entry1 = LoreEntry?.mainStory('story_001', 'Entry 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      const entry2 = LoreEntry?.character('char_001', 'Entry 2', 'Text 2', LoreUnlockCondition?.alwaysTrue());

      loreManager?.registerLore(entry1);
      loreManager?.registerLore(entry2);

      expect(loreManager?.getLoreEntry('story_001')).toBe(entry1);
      expect(loreManager?.getLoreEntry('char_001')).toBe(entry2);
      expect(loreManager?.getLoreEntry('nonexistent')).toBeNull();

      const allEntries = loreManager?.getAllLoreEntries();
      expect(allEntries).toHaveLength(2);
      expect(allEntries).toContain(entry1);
      expect(allEntries).toContain(entry2);
    });

    test('should handle unlock operations correctly', () => {
      const entry = LoreEntry?.mainStory('story_001', 'Entry 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      loreManager?.registerLore(entry);

      expect(loreManager?.isLoreUnlocked('story_001')).toBe(false);
      expect(loreManager?.getUnlockedCount()).toBe(0);

      expect(loreManager?.unlockLore('story_001')).toBe(true);
      expect(loreManager?.isLoreUnlocked('story_001')).toBe(true);
      expect(loreManager?.getUnlockedCount()).toBe(1);

      expect(loreManager?.unlockLore('nonexistent')).toBe(false);
    });

    test('should handle read operations correctly', () => {
      const entry = LoreEntry?.mainStory('story_001', 'Entry 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      loreManager?.registerLore(entry);

      // Should fail to mark as read when locked
      expect(loreManager?.markLoreAsRead('story_001')).toBe(false);

      // Unlock first
      loreManager?.unlockLore('story_001');
      expect(loreManager?.markLoreAsRead('story_001')).toBe(true);
      expect(loreManager?.isLoreRead('story_001')).toBe(true);
      expect(loreManager?.getReadCount()).toBe(1);
    });

    test('should get filtered entries correctly', () => {
      const entry1 = LoreEntry?.mainStory('story_001', 'Story 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      const entry2 = LoreEntry?.character('char_001', 'Char 1', 'Text 2', LoreUnlockCondition?.alwaysTrue());
      const entry3 = LoreEntry?.world('world_001', 'World 1', 'Text 3', LoreUnlockCondition?.alwaysTrue());

      loreManager?.registerLore(entry1);
      loreManager?.registerLore(entry2);
      loreManager?.registerLore(entry3);

      // Unlock some entries
      loreManager?.unlockLore('story_001');
      loreManager?.unlockLore('char_001');
      loreManager?.markLoreAsRead('story_001');

      const filter: ILoreFilter = {
        category: LoreCategory?.MAIN_STORY,
        unlockState: LoreUnlockState?.UNLOCKED
      };

      const filtered = loreManager?.getFilteredLoreEntries(filter);
      expect(filtered).toHaveLength(1);
      expect(filtered[0!]).toBe(entry1);
    });

    test('should provide correct statistics', () => {
      const entry1 = LoreEntry?.mainStory('story_001', 'Story 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      const entry2 = LoreEntry?.character('char_001', 'Char 1', 'Text 2', LoreUnlockCondition?.alwaysTrue());
      const entry3 = LoreEntry?.world('world_001', 'World 1', 'Text 3', LoreUnlockCondition?.alwaysTrue());

      loreManager?.registerLore(entry1);
      loreManager?.registerLore(entry2);
      loreManager?.registerLore(entry3);

      loreManager?.unlockLore('story_001');
      loreManager?.unlockLore('char_001');
      loreManager?.markLoreAsRead('story_001');

      const stats = loreManager?.getStatistics();

      expect(stats?.totalEntries).toBe(3);
      expect(stats?.unlockedEntries).toBe(2);
      expect(stats?.readEntries).toBe(1);
      expect(stats?.entriesByCategory[LoreCategory?.MAIN_STORY]).toBe(1);
      expect(stats?.entriesByCategory[LoreCategory?.CHARACTER]).toBe(1);
      expect(stats?.entriesByCategory[LoreCategory?.WORLD]).toBe(1);
      expect(stats?.entriesByUnlockState[LoreUnlockState?.LOCKED]).toBe(1);
      expect(stats?.entriesByUnlockState[LoreUnlockState?.UNLOCKED]).toBe(1);
      expect(stats?.entriesByUnlockState[LoreUnlockState?.READ]).toBe(1);
    });

    test('should clear correctly', () => {
      const entry = LoreEntry?.mainStory('story_001', 'Entry 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      loreManager?.registerLore(entry);
      loreManager?.unlockLore('story_001');
      loreManager?.markLoreAsRead('story_001');

      expect(loreManager?.getEntryCount()).toBe(1);
      expect(loreManager?.getUnlockedCount()).toBe(1);
      expect(loreManager?.getReadCount()).toBe(1);

      loreManager?.clear();

      expect(loreManager?.getEntryCount()).toBe(0);
      expect(loreManager?.getUnlockedCount()).toBe(0);
      expect(loreManager?.getReadCount()).toBe(0);
    });

    test('should export and import correctly', () => {
      const entry1 = LoreEntry?.mainStory('story_001', 'Entry 1', 'Text 1', LoreUnlockCondition?.alwaysTrue());
      const entry2 = LoreEntry?.character('char_001', 'Entry 2', 'Text 2', LoreUnlockCondition?.alwaysTrue());

      loreManager?.registerLore(entry1);
      loreManager?.registerLore(entry2);
      loreManager?.unlockLore('story_001');
      loreManager?.markLoreAsRead('story_001');

      const jsonData = loreManager?.exportToJSON();
      expect(jsonData).toContain('story_001');
      expect(jsonData).toContain('char_001');

      const newManager = LoreCodexManager?.importFromJSON(jsonData);

      expect(newManager?.getEntryCount()).toBe(2);
      expect(newManager?.isLoreUnlocked('story_001')).toBe(true);
      expect(newManager?.isLoreRead('story_001')).toBe(true);
      expect(newManager?.isLoreUnlocked('char_001')).toBe(false);
    });
  });

  describe('LoreUtils Basic Functionality', () => {
    test('should create default player context', () => {
      const context = LoreUtils?.createDefaultPlayerContext();
      expect(context).toBeDefined();
      expect(context?.hasQuestFlag('test')).toBe(false);
      expect(context?.hasCapturedSpirit('test')).toBe(false);
      expect(context?.getSpiritSyncLevel('test')).toBe(0);
      expect(context?.hasVisitedLocation('test')).toBe(false);
      expect(context?.getPlayerLevel()).toBe(1);
    });

    test('should create filters correctly', () => {
      const categoryFilter = LoreUtils?.createFilter.byCategory(LoreCategory?.MAIN_STORY);
      expect(categoryFilter?.category).toBe(LoreCategory?.MAIN_STORY);

      const stateFilter = LoreUtils?.createFilter.byUnlockState(LoreUnlockState?.UNLOCKED);
      expect(stateFilter?.unlockState).toBe(LoreUnlockState?.UNLOCKED);

      const spiritFilter = LoreUtils?.createFilter.bySpirit('fire_spirit');
      expect(spiritFilter?.relatedSpiritId).toBe('fire_spirit');

      const locationFilter = LoreUtils?.createFilter.byLocation('mountain');
      expect(locationFilter?.locationId).toBe('mountain');

      const questFilter = LoreUtils?.createFilter.byQuest('main_quest');
      expect(questFilter?.questId).toBe('main_quest');

      const tagFilter = LoreUtils?.createFilter.byTag('important');
      expect(tagFilter?.tags).toEqual(['important']);

      const unlockedFilter = LoreUtils?.createFilter.unlockedOnly();
      expect(unlockedFilter?.unlockState).toBe(LoreUnlockState?.UNLOCKED);

      const lockedFilter = LoreUtils?.createFilter.lockedOnly();
      expect(lockedFilter?.unlockState).toBe(LoreUnlockState?.LOCKED);

      const readFilter = LoreUtils?.createFilter.readOnly();
      expect(readFilter?.unlockState).toBe(LoreUnlockState?.READ);

      const highPriorityFilter = LoreUtils?.createFilter.highPriority(7);
      expect(highPriorityFilter?.minPriority).toBe(7);

      const searchFilter = LoreUtils?.createFilter.search('fire');
      expect(searchFilter?.searchText).toBe('fire');
    });

    test('should validate lore entries correctly', () => {
      const validEntry = LoreEntry?.mainStory(
        'test_001',
        'Valid Title',
        'Valid text content',
        LoreUnlockCondition?.alwaysTrue()
      );

      const invalidEntry = LoreEntry?.mainStory(
        '',
        '',
        '',
        LoreUnlockCondition?.spiritCaptured('')
      );

      expect(LoreUtils?.validateLoreEntry(validEntry)).toHaveLength(0);

      const errors = LoreUtils?.validateLoreEntry(invalidEntry);
      expect(errors).toContain('Lore ID cannot be empty');
      expect(errors).toContain('Title cannot be empty');
      expect(errors).toContain('Text cannot be empty');
      expect(errors).toContain('String value required for this condition type');
    });

    test('should calculate reading progress correctly', () => {
      const progress1 = LoreUtils?.calculateReadingProgress(10, 5);
      expect(progress1?.percentage).toBe(50);
      expect(progress1?.remaining).toBe(5);

      const progress2 = LoreUtils?.calculateReadingProgress(0, 0);
      expect(progress2?.percentage).toBe(0);
      expect(progress2?.remaining).toBe(0);
    });

    test('should get category statistics correctly', () => {
      const entries: ILoreEntry[] = [
        new LoreEntry('1', 'T1', 'Text1', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY),
        new LoreEntry('2', 'T2', 'Text2', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.CHARACTER),
        new LoreEntry('3', 'T3', 'Text3', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY),
      ];

      const stats = LoreUtils?.getCategoryStatistics(entries);

      expect(stats[LoreCategory?.MAIN_STORY]).toBe(2);
      expect(stats[LoreCategory?.CHARACTER]).toBe(1);
      expect(stats[LoreCategory?.WORLD]).toBe(0);
    });

    test('should filter entries correctly', () => {
      const entries: ILoreEntry[] = [
        new LoreEntry('1', 'T1', 'Text1', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY, 8, ['important']),
        new LoreEntry('2', 'T2', 'Text2', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.CHARACTER, 3, ['character']),
        new LoreEntry('3', 'T3', 'Text3', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.WORLD, 6, ['world', 'important']),
      ];

      const filtered = LoreUtils?.filterEntries(entries, {
        categories: [LoreCategory?.MAIN_STORY, LoreCategory?.WORLD],
        minPriority: 5,
        tags: ['important']
      });

      expect(filtered).toHaveLength(2);
      expect(filtered?.some(e => e?.loreId === '1')).toBe(true);
      expect(filtered?.some(e => e?.loreId === '3')).toBe(true);
      expect(filtered?.some(e => e?.loreId === '2')).toBe(false);
    });

    test('should sort entries correctly', () => {
      const entries: ILoreEntry[] = [
        new LoreEntry('2', 'B Title', 'Text2', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY, 3),
        new LoreEntry('1', 'A Title', 'Text1', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY, 8),
        new LoreEntry('3', 'C Title', 'Text3', LoreUnlockCondition?.alwaysTrue(), LoreCategory?.MAIN_STORY, 5),
      ];

      const sortedByPriority = LoreUtils?.sortEntries(entries, 'priority');
      expect(sortedByPriority[0!].priority).toBe(8);
      expect(sortedByPriority[1!].priority).toBe(5);
      expect(sortedByPriority[2!].priority).toBe(3);

      const sortedByTitle = LoreUtils?.sortEntries(entries, 'title');
      expect(sortedByTitle[0!].title).toBe('A Title');
      expect(sortedByTitle[1!].title).toBe('B Title');
      expect(sortedByTitle[2!].title).toBe('C Title');
    });

    test('should get completion percentage correctly', () => {
      const completion = LoreUtils?.getCompletionPercentage(10, 6, 3);

      expect(completion?.unlocked).toBe(60);
      expect(completion?.read).toBe(50);
      expect(completion?.overall).toBeGreaterThan(50);
      expect(completion?.overall).toBeLessThan(70);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete lore workflow', () => {
      const loreManager = new LoreCodexManager();
      const playerContext = new MockPlayerContext();

      // Create lore entries
      const entry1 = LoreEntry?.mainStory(
        'story_001',
        'The Beginning',
        'In the beginning, there was darkness...',
        LoreUnlockCondition?.alwaysTrue(),
        10,
        ['beginning', 'story']
      );

      const entry2 = LoreEntry?.character(
        'char_001',
        'Fire Spirit',
        'The fire spirit is passionate and destructive...',
        'fire_spirit',
        LoreUnlockCondition?.spiritCaptured('fire_spirit'),
        8,
        ['fire', 'spirit', 'character']
      );

      const entry3 = LoreEntry?.world(
        'world_001',
        'Volcano',
        'The volcano is a place of great power...',
        'volcano',
        LoreUnlockCondition?.locationVisited('volcano'),
        6,
        ['volcano', 'fire', 'location']
      );

      // Register entries
      loreManager?.registerLore(entry1);
      loreManager?.registerLore(entry2);
      loreManager?.registerLore(entry3);

      expect(loreManager?.getEntryCount()).toBe(3);

      // Check initial state
      expect(loreManager?.isLoreUnlocked('story_001')).toBe(false);
      expect(loreManager?.isLoreUnlocked('char_001')).toBe(false);
      expect(loreManager?.isLoreUnlocked('world_001')).toBe(false);

      // Unlock first entry
      loreManager?.unlockLore('story_001');
      expect(loreManager?.isLoreUnlocked('story_001')).toBe(true);
      expect(loreManager?.getUnlockedCount()).toBe(1);

      // Mark as read
      loreManager?.markLoreAsRead('story_001');
      expect(loreManager?.isLoreRead('story_001')).toBe(true);
      expect(loreManager?.getReadCount()).toBe(1);

      // Capture spirit to unlock character entry
      playerContext?.captureSpirit('fire_spirit');
      expect(entry2?.isUnlocked(playerContext)).toBe(true);
      loreManager?.unlockLore('char_001');
      expect(loreManager?.getUnlockedCount()).toBe(2);

      // Visit location to unlock world entry
      playerContext?.visitLocation('volcano');
      expect(entry3?.isUnlocked(playerContext)).toBe(true);
      loreManager?.unlockLore('world_001');
      expect(loreManager?.getUnlockedCount()).toBe(3);

      // Check statistics
      const stats = loreManager?.getStatistics();
      expect(stats?.totalEntries).toBe(3);
      expect(stats?.unlockedEntries).toBe(3);
      expect(stats?.readEntries).toBe(1);
    });

    test('should handle filtering and search', () => {
      const loreManager = new LoreCodexManager();

      // Create diverse entries
      const entries = [
        LoreEntry?.mainStory('story_001', 'Fire Story', 'A story about fire...', LoreUnlockCondition?.alwaysTrue(), 8, ['fire', 'story']),
        LoreEntry?.character('char_001', 'Fire Character', 'Fire character description...', LoreUnlockCondition?.alwaysTrue(), 6, ['fire', 'character']),
        LoreEntry?.world('world_001', 'Water World', 'A world of water...', LoreUnlockCondition?.alwaysTrue(), 4, ['water', 'world']),
        LoreEntry?.mainStory('story_002', 'Water Story', 'A story about water...', LoreUnlockCondition?.alwaysTrue(), 7, ['water', 'story']),
      ];

      entries?.forEach(entry => loreManager?.registerLore(entry));

      // Test category filtering
      const mainStoryEntries = loreManager?.getFilteredLoreEntries({
        category: LoreCategory?.MAIN_STORY
      });
      expect(mainStoryEntries).toHaveLength(2);

      // Test tag filtering
      const fireEntries = loreManager?.getFilteredLoreEntries({
        tags: ['fire']
      });
      expect(fireEntries).toHaveLength(2);

      // Test priority filtering
      const highPriorityEntries = loreManager?.getFilteredLoreEntries({
        minPriority: 7
      });
      expect(highPriorityEntries).toHaveLength(2);

      // Test search
      const searchResults = loreManager?.getFilteredLoreEntries({
        searchText: 'fire'
      });
      expect(searchResults).toHaveLength(2);
      expect(searchResults?.some(e => e?.title.includes('Fire'))).toBe(true);
    });

    test('should handle export and import', () => {
      const originalManager = new LoreCodexManager();
      const playerContext = new MockPlayerContext();

      // Create and register entries
      const entry1 = LoreEntry?.mainStory('story_001', 'Story 1', 'Content 1', LoreUnlockCondition?.alwaysTrue());
      const entry2 = LoreEntry?.character('char_001', 'Char 1', 'Content 2', LoreUnlockCondition?.spiritCaptured('spirit'));

      originalManager?.registerLore(entry1);
      originalManager?.registerLore(entry2);

      // Unlock and read some entries
      originalManager?.unlockLore('story_001');
      originalManager?.markLoreAsRead('story_001');

      playerContext?.captureSpirit('spirit');
      originalManager?.unlockLore('char_001');

      // Export
      const jsonData = originalManager?.exportToJSON();
      expect(jsonData).toContain('story_001');
      expect(jsonData).toContain('char_001');
      expect(jsonData).toContain('unlocked');
      expect(jsonData).toContain('read');

      // Import
      const importedManager = LoreCodexManager?.importFromJSON(jsonData);

      expect(importedManager?.getEntryCount()).toBe(2);
      expect(importedManager?.isLoreUnlocked('story_001')).toBe(true);
      expect(importedManager?.isLoreRead('story_001')).toBe(true);
      expect(importedManager?.isLoreUnlocked('char_001')).toBe(true);
      expect(importedManager?.isLoreRead('char_001')).toBe(false);

      // Verify content integrity
      const importedEntry1 = importedManager?.getLoreEntry('story_001');
      const importedEntry2 = importedManager?.getLoreEntry('char_001');

      expect(importedEntry1?.title).toBe('Story 1');
      expect(importedEntry2?.title).toBe('Char 1');
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many entries efficiently', () => {
      const loreManager = new LoreCodexManager();
      const startTime = performance?.now();

      // Create many entries
      for (let i = 0; i < 1000; i++) {
        const entry = LoreEntry?.mainStory(
          `story_${i}`,
          `Story ${i}`,
          `Content for story ${i}`.repeat(10), // Make content longer
          i % 2 === 0 ? LoreUnlockCondition?.alwaysTrue() : LoreUnlockCondition?.spiritCaptured(`spirit_${i % 10}`),
          Math.floor(i / 100), // Priority 0-9
          [`tag_${i % 5}`, 'story']
        );

        loreManager?.registerLore(entry);
      }

      const endTime = performance?.now();

      expect(loreManager?.getEntryCount()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should handle filtering efficiently', () => {
      const loreManager = new LoreCodexManager();

      // Create diverse entries
      for (let i = 0; i < 1000; i++) {
        const categories = Object.values(LoreCategory);
        const category = categories[i % categories?.length];

        const entry = new LoreEntry(
          `entry_${i}`,
          `Title ${i}`,
          `Content ${i}`.repeat(5),
          i % 3 === 0 ? LoreUnlockCondition?.alwaysTrue() :
          i % 3 === 1 ? LoreUnlockCondition?.spiritCaptured(`spirit_${i % 20}`) :
          LoreUnlockCondition?.locationVisited(`location_${i % 15}`),
          category,
          i % 10,
          [`tag_${i % 10}`, 'test']
        );

        loreManager?.registerLore(entry);
      }

      const startTime = performance?.now();

      // Perform various filtering operations
      for (let i = 0; i < 100; i++) {
        loreManager?.getFilteredLoreEntries({
          category: LoreCategory?.MAIN_STORY,
          minPriority: 5,
          tags: ['tag_0', 'tag_1'],
          searchText: 'Content'
        });

        loreManager?.getFilteredLoreEntries({
          unlockState: LoreUnlockState?.LOCKED,
          limit: 50
        });

        loreManager?.getStatistics();
      }

      const endTime = performance?.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });
  });
});
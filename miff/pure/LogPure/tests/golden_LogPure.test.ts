/**
 * LogPure Golden Tests
 *
 * Comprehensive tests for the LogPure logging and debugging system.
 * Tests cover logging functionality, filtering, validation, export/import, and integration scenarios.
 */

import {
  BattleLogger,
  BattleLogEntry,
  BattleResult,
  BattleEffect,
  LogUtils,
  LogCategory,
  LogLevel,
  BattlePhase,
  LogOutputFormat,
  ILogFilter,
  IBattleAction,
  IBattleResult,
  IBattleEffect
} from '../index';

describe('LogPure Golden Tests', () => {
  describe('BattleLogEntry Basic Functionality', () => {
    test('should create entry with default values', () => {
      const entry = new BattleLogEntry();
      expect(entry.actorId).toBe(0);
      expect(entry.actionType).toBe('');
      expect(entry.targetId).toBe(0);
      expect(entry.result).toBe('');
      expect(entry.category).toBe(LogCategory.BATTLE);
      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.timestampUtc).toBeGreaterThan(0);
    });

    test('should create entry with custom values', () => {
      const entry = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        'Type advantage applied',
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3,
        { effectiveness: 2.0 }
      );

      expect(entry.actorId).toBe(1);
      expect(entry.actionType).toBe('fire_blast');
      expect(entry.targetId).toBe(2);
      expect(entry.result).toBe('success');
      expect(entry.category).toBe(LogCategory.BATTLE);
      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.debugNotes).toBe('Type advantage applied');
      expect(entry.phase).toBe(BattlePhase.RESOLVE_ACTION);
      expect(entry.damageDealt).toBe(45);
      expect(entry.statusApplied).toBe('burned');
      expect(entry.turnNumber).toBe(3);
      expect(entry.metadata).toEqual({ effectiveness: 2.0 });
    });

    test('should create phase entry correctly', () => {
      const phaseEntry = BattleLogEntry.createPhaseEntry(BattlePhase.PRE_TURN, 1);

      expect(phaseEntry.actorId).toBe(0);
      expect(phaseEntry.actionType).toBe('phase');
      expect(phaseEntry.targetId).toBe(0);
      expect(phaseEntry.result).toBe(BattlePhase.PRE_TURN);
      expect(phaseEntry.phase).toBe(BattlePhase.PRE_TURN);
      expect(phaseEntry.turnNumber).toBe(1);
      expect(phaseEntry.category).toBe(LogCategory.BATTLE);
      expect(phaseEntry.level).toBe(LogLevel.INFO);
    });

    test('should create action entry correctly', () => {
      const action: IBattleAction = {
        actorId: 1,
        targetId: 2,
        moveId: 'fire_blast',
        debugNotes: 'Test action'
      };

      const result: IBattleResult = BattleResult.withDamage(45);
      const actionEntry = BattleLogEntry.createActionEntry(action, result, 1);

      expect(actionEntry.actorId).toBe(1);
      expect(actionEntry.actionType).toBe('fire_blast');
      expect(actionEntry.targetId).toBe(2);
      expect(actionEntry.result).toBe('success');
      expect(actionEntry.damageDealt).toBe(45);
      expect(actionEntry.turnNumber).toBe(1);
      expect(actionEntry.debugNotes).toBe('Test action');
      expect(actionEntry.category).toBe(LogCategory.BATTLE);
      expect(actionEntry.level).toBe(LogLevel.INFO);
    });

    test('should create effect entry correctly', () => {
      const effect: IBattleEffect = BattleEffect.create(
        'burn',
        'Applied burn effect',
        1,
        2,
        { duration: 3 }
      );

      const effectEntry = BattleLogEntry.createEffectEntry(effect, 1);

      expect(effectEntry.actorId).toBe(1);
      expect(effectEntry.actionType).toBe('effect_burn');
      expect(effectEntry.targetId).toBe(2);
      expect(effectEntry.result).toBe('applied');
      expect(effectEntry.debugNotes).toBe('Applied burn effect');
      expect(effectEntry.turnNumber).toBe(1);
      expect(effectEntry.metadata).toEqual({ duration: 3 });
      expect(effectEntry.category).toBe(LogCategory.BATTLE);
      expect(effectEntry.level).toBe(LogLevel.DEBUG);
    });

    test('should create system entry correctly', () => {
      const systemEntry = BattleLogEntry.createSystemEntry(
        'System initialized',
        LogCategory.SYSTEM,
        LogLevel.INFO
      );

      expect(systemEntry.actorId).toBe(0);
      expect(systemEntry.actionType).toBe('system');
      expect(systemEntry.targetId).toBe(0);
      expect(systemEntry.result).toBe('System initialized');
      expect(systemEntry.category).toBe(LogCategory.SYSTEM);
      expect(systemEntry.level).toBe(LogLevel.INFO);
    });

    test('should generate formatted time correctly', () => {
      const entry = new BattleLogEntry();
      const formattedTime = entry.getFormattedTime();

      expect(formattedTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('should generate summary correctly', () => {
      const entry = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        'Debug info',
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3
      );

      const summary = entry.getSummary();
      expect(summary).toContain('fire_blast');
      expect(summary).toContain('resolve_action');
      expect(summary).toContain('45 dmg');
      expect(summary).toContain('burned');
      expect(summary).toContain('T3');
      expect(summary).toContain('success');
    });

    test('should match filters correctly', () => {
      const entry = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        undefined,
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3
      );

      // Should match category filter
      expect(entry.matchesFilter({ category: LogCategory.BATTLE })).toBe(true);
      expect(entry.matchesFilter({ category: LogCategory.SYSTEM })).toBe(false);

      // Should match level filter
      expect(entry.matchesFilter({ level: LogLevel.INFO })).toBe(true);
      expect(entry.matchesFilter({ level: LogLevel.ERROR })).toBe(false);

      // Should match actor filter
      expect(entry.matchesFilter({ actorId: 1 })).toBe(true);
      expect(entry.matchesFilter({ actorId: 2 })).toBe(false);

      // Should match turn filter
      expect(entry.matchesFilter({ turnNumber: 3 })).toBe(true);
      expect(entry.matchesFilter({ turnNumber: 1 })).toBe(false);

      // Should match time range filter
      const now = Date.now();
      expect(entry.matchesFilter({ startTime: now - 1000, endTime: now + 1000 })).toBe(true);
      expect(entry.matchesFilter({ startTime: now + 10000 })).toBe(false);
    });

    test('should clone correctly', () => {
      const original = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        'Debug info',
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3,
        { effectiveness: 2.0 }
      );

      const clone = original.clone();

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.metadata).toEqual(original.metadata);
      expect(clone.metadata).not.toBe(original.metadata);
    });

    test('should convert to/from JSON correctly', () => {
      const original = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        'Debug info',
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3,
        { effectiveness: 2.0 }
      );

      const jsonData = original.toJSON();
      const reconstructed = BattleLogEntry.fromJSON(jsonData);

      expect(reconstructed).toEqual(original);
      expect(reconstructed.metadata).toEqual(original.metadata);
    });
  });

  describe('BattleResult Basic Functionality', () => {
    test('should create success result', () => {
      const result = BattleResult.success(45, 'burned');
      expect(result.success).toBe(true);
      expect(result.damage).toBe(45);
      expect(result.statusApplied).toBe('burned');
      expect(result.summary).toBe('success');
    });

    test('should create failure result', () => {
      const result = BattleResult.failure();
      expect(result.success).toBe(false);
      expect(result.damage).toBeUndefined();
      expect(result.statusApplied).toBeUndefined();
      expect(result.summary).toBe('failed');
    });

    test('should create result with damage', () => {
      const result = BattleResult.withDamage(30);
      expect(result.success).toBe(true);
      expect(result.damage).toBe(30);
      expect(result.summary).toBe('success');
    });

    test('should create result with status', () => {
      const result = BattleResult.withStatus('poisoned');
      expect(result.success).toBe(true);
      expect(result.statusApplied).toBe('poisoned');
      expect(result.summary).toBe('success');
    });
  });

  describe('BattleEffect Basic Functionality', () => {
    test('should create effect with all parameters', () => {
      const effect = BattleEffect.create(
        'burn',
        'Applied burn effect',
        1,
        2,
        { duration: 3, intensity: 2 }
      );

      expect(effect.effectId).toBe('burn');
      expect(effect.description).toBe('Applied burn effect');
      expect(effect.sourceActorId).toBe(1);
      expect(effect.targetActorId).toBe(2);
      expect(effect.metadata).toEqual({ duration: 3, intensity: 2 });
    });

    test('should create effect with minimal parameters', () => {
      const effect = BattleEffect.create('heal');
      expect(effect.effectId).toBe('heal');
      expect(effect.description).toBeUndefined();
      expect(effect.sourceActorId).toBeUndefined();
      expect(effect.targetActorId).toBeUndefined();
      expect(effect.metadata).toBeUndefined();
    });
  });

  describe('BattleLogger Basic Functionality', () => {
    let logger: BattleLogger;

    beforeEach(() => {
      logger = new BattleLogger(1000); // Small capacity for testing
    });

    test('should create logger with capacity', () => {
      expect(logger).toBeDefined();
      expect(logger.getEntryCount()).toBe(0);
      expect(logger.getCurrentTurn()).toBe(0);
    });

    test('should log phase changes correctly', () => {
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      expect(logger.getEntryCount()).toBe(1);

      const entries = logger.getAllEntries();
      expect(entries[0!].actionType).toBe('phase');
      expect(entries[0!].result).toBe(BattlePhase.PRE_TURN);
      expect(entries[0!].turnNumber).toBe(1);
    });

    test('should log battle actions correctly', () => {
      const action: IBattleAction = {
        actorId: 1,
        targetId: 2,
        moveId: 'fire_blast',
        debugNotes: 'Type advantage'
      };

      const result = BattleResult.success(45, 'burned');
      logger.logAction(action, result);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actorId).toBe(1);
      expect(entries[0!].actionType).toBe('fire_blast');
      expect(entries[0!].targetId).toBe(2);
      expect(entries[0!].damageDealt).toBe(45);
      expect(entries[0!].statusApplied).toBe('burned');
      expect(entries[0!].debugNotes).toBe('Type advantage');
    });

    test('should log battle effects correctly', () => {
      const effect = BattleEffect.create('burn', 'Applied burn', 1, 2);
      logger.logEffect(effect);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actorId).toBe(1);
      expect(entries[0!].actionType).toBe('effect_burn');
      expect(entries[0!].targetId).toBe(2);
      expect(entries[0!].debugNotes).toBe('Applied burn');
    });

    test('should log system messages correctly', () => {
      logger.logSystem('Battle started', LogCategory.BATTLE, LogLevel.INFO);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actionType).toBe('system');
      expect(entries[0!].result).toBe('Battle started');
      expect(entries[0!].category).toBe(LogCategory.BATTLE);
      expect(entries[0!].level).toBe(LogLevel.INFO);
    });

    test('should log debug messages correctly', () => {
      logger.logDebug('Debug information', LogCategory.SYSTEM, 1, 2);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actionType).toBe('debug');
      expect(entries[0!].result).toBe('Debug information');
      expect(entries[0!].actorId).toBe(1);
      expect(entries[0!].targetId).toBe(2);
      expect(entries[0!].level).toBe(LogLevel.DEBUG);
    });

    test('should log warnings correctly', () => {
      logger.logWarning('Warning message', LogCategory.SYSTEM, 1, 2);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actionType).toBe('warning');
      expect(entries[0!].level).toBe(LogLevel.WARN);
    });

    test('should log errors correctly', () => {
      logger.logError('Error message', LogCategory.SYSTEM, 1, 2);

      expect(logger.getEntryCount()).toBe(1);
      const entries = logger.getAllEntries();
      expect(entries[0!].actionType).toBe('error');
      expect(entries[0!].level).toBe(LogLevel.ERROR);
    });

    test('should filter entries correctly', () => {
      // Add different types of entries
      logger.logSystem('System message', LogCategory.SYSTEM, LogLevel.INFO);
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      logger.logDebug('Debug message', LogCategory.SYSTEM, LogLevel.DEBUG);

      // Test category filter
      const systemEntries = logger.getFilteredEntries({ category: LogCategory.SYSTEM });
      expect(systemEntries).toHaveLength(2);

      // Test level filter
      const debugEntries = logger.getFilteredEntries({ level: LogLevel.DEBUG });
      expect(debugEntries).toHaveLength(1);

      // Test limit and offset
      const limitedEntries = logger.getFilteredEntries({ limit: 2, offset: 1 });
      expect(limitedEntries).toHaveLength(2);
    });

    test('should get entries by turn correctly', () => {
      logger.logPhaseChange(BattlePhase.PRE_TURN); // Turn 1
      logger.logPhaseChange(BattlePhase.SELECT_ACTION); // Turn 2

      const turn1Entries = logger.getEntriesByTurn(1);
      const turn2Entries = logger.getEntriesByTurn(2);

      expect(turn1Entries).toHaveLength(1);
      expect(turn2Entries).toHaveLength(1);
    });

    test('should get entries by category correctly', () => {
      logger.logSystem('System message', LogCategory.SYSTEM);
      logger.logPhaseChange(BattlePhase.PRE_TURN); // Category: BATTLE

      const systemEntries = logger.getEntriesByCategory(LogCategory.SYSTEM);
      const battleEntries = logger.getEntriesByCategory(LogCategory.BATTLE);

      expect(systemEntries).toHaveLength(1);
      expect(battleEntries).toHaveLength(1);
    });

    test('should get entries by level correctly', () => {
      logger.logSystem('Info message', LogCategory.SYSTEM, LogLevel.INFO);
      logger.logSystem('Debug message', LogCategory.SYSTEM, LogLevel.DEBUG);
      logger.logWarning('Warning message', LogCategory.SYSTEM, LogLevel.WARN);

      const infoEntries = logger.getEntriesByLevel(LogLevel.INFO);
      const debugEntries = logger.getEntriesByLevel(LogLevel.DEBUG);
      const warnEntries = logger.getEntriesByLevel(LogLevel.WARN);

      expect(infoEntries).toHaveLength(1);
      expect(debugEntries).toHaveLength(1);
      expect(warnEntries).toHaveLength(1);
    });

    test('should provide correct statistics', () => {
      // Add some entries
      logger.logSystem('System message', LogCategory.SYSTEM, LogLevel.INFO);
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      logger.logDebug('Debug message', LogCategory.SYSTEM, LogLevel.DEBUG);

      const stats = logger.getStatistics();

      expect(stats.totalEntries).toBe(3);
      expect(stats.entriesByCategory[LogCategory.SYSTEM]).toBe(2);
      expect(stats.entriesByCategory[LogCategory.BATTLE]).toBe(1);
      expect(stats.entriesByLevel[LogLevel.INFO]).toBe(1);
      expect(stats.entriesByLevel[LogLevel.DEBUG]).toBe(1);
      expect(stats.averageEntriesPerTurn).toBeGreaterThan(0);
    });

    test('should clear entries correctly', () => {
      logger.logSystem('Test message', LogCategory.SYSTEM);
      expect(logger.getEntryCount()).toBe(1);

      logger.clear();
      expect(logger.getEntryCount()).toBe(0);
      expect(logger.getCurrentTurn()).toBe(0);
    });

    test('should export to JSON correctly', () => {
      logger.logSystem('Test message', LogCategory.SYSTEM);
      const jsonExport = logger.exportToJSON();

      expect(jsonExport).toContain('Test message');
      expect(jsonExport).toContain(LogCategory.SYSTEM);

      const parsed = JSON.parse(jsonExport);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });

    test('should export to CSV correctly', () => {
      logger.logSystem('Test message', LogCategory.SYSTEM);
      const csvExport = logger.exportToCSV();

      expect(csvExport).toContain('timestampUtc');
      expect(csvExport).toContain('actorId');
      expect(csvExport).toContain('Test message');
    });

    test('should handle capacity limits correctly', () => {
      const smallLogger = new BattleLogger(2);

      smallLogger.logSystem('Message 1', LogCategory.SYSTEM);
      expect(smallLogger.getEntryCount()).toBe(1);

      smallLogger.logSystem('Message 2', LogCategory.SYSTEM);
      expect(smallLogger.getEntryCount()).toBe(2);

      smallLogger.logSystem('Message 3', LogCategory.SYSTEM);
      expect(smallLogger.getEntryCount()).toBe(2); // Should trim oldest
    });
  });

  describe('LogUtils Basic Functionality', () => {
    test('should format entry for console correctly', () => {
      const entry = new BattleLogEntry(
        1,
        'fire_blast',
        2,
        'success',
        LogCategory.BATTLE,
        LogLevel.INFO,
        'Debug info',
        BattlePhase.RESOLVE_ACTION,
        45,
        'burned',
        3
      );

      const formatted = LogUtils.formatEntryForConsole(entry);
      expect(formatted).toContain('ℹ️'); // Info icon
      expect(formatted).toContain('⚔️'); // Battle icon
      expect(formatted).toContain('fire_blast');
      expect(formatted).toContain('success');
    });

    test('should get level icons correctly', () => {
      expect(LogUtils.getLevelIcon(LogLevel.DEBUG)).toBe('🐛');
      expect(LogUtils.getLevelIcon(LogLevel.INFO)).toBe('ℹ️');
      expect(LogUtils.getLevelIcon(LogLevel.WARN)).toBe('⚠️');
      expect(LogUtils.getLevelIcon(LogLevel.ERROR)).toBe('❌');
      expect(LogUtils.getLevelIcon(LogLevel.CRITICAL)).toBe('🚨');
    });

    test('should get category icons correctly', () => {
      expect(LogUtils.getCategoryIcon(LogCategory.BATTLE)).toBe('⚔️');
      expect(LogUtils.getCategoryIcon(LogCategory.SYSTEM)).toBe('⚙️');
      expect(LogUtils.getCategoryIcon(LogCategory.AI)).toBe('🤖');
      expect(LogUtils.getCategoryIcon(LogCategory.PERFORMANCE)).toBe('📈');
      expect(LogUtils.getCategoryIcon(LogCategory.NETWORK)).toBe('🌐');
      expect(LogUtils.getCategoryIcon(LogCategory.VALIDATION)).toBe('✅');
    });

    test('should create filters correctly', () => {
      const categoryFilter = LogUtils.createFilter.byCategory(LogCategory.BATTLE);
      expect(categoryFilter.category).toBe(LogCategory.BATTLE);

      const levelFilter = LogUtils.createFilter.byLevel(LogLevel.ERROR);
      expect(levelFilter.level).toBe(LogLevel.ERROR);

      const actorFilter = LogUtils.createFilter.byActor(1);
      expect(actorFilter.actorId).toBe(1);

      const turnFilter = LogUtils.createFilter.byTurn(3);
      expect(turnFilter.turnNumber).toBe(3);

      const errorsOnlyFilter = LogUtils.createFilter.errorsOnly();
      expect(errorsOnlyFilter.level).toBe(LogLevel.ERROR);

      const warningsFilter = LogUtils.createFilter.warningsAndAbove();
      expect(warningsFilter.level).toBe(LogLevel.WARN);

      const battleFilter = LogUtils.createFilter.battleEventsOnly();
      expect(battleFilter.category).toBe(LogCategory.BATTLE);
    });

    test('should validate log entries correctly', () => {
      const validEntry = new BattleLogEntry(1, 'fire_blast', 2, 'success', LogCategory.BATTLE, LogLevel.INFO);
      const validErrors = LogUtils.validateLogEntry(validEntry);
      expect(validErrors).toHaveLength(0);

      const invalidEntry = new BattleLogEntry(0, '', 0, 'success', LogCategory.BATTLE, LogLevel.INFO);
      invalidEntry.timestampUtc = 0;
      const invalidErrors = LogUtils.validateLogEntry(invalidEntry);
      expect(invalidErrors).toContain('Action type cannot be empty');
      expect(invalidErrors).toContain('Timestamp must be valid');
    });

    test('should create performance entries correctly', () => {
      const perfEntry = LogUtils.createPerformanceEntry(
        'database_query',
        150,
        1,
        { query: 'SELECT * FROM spirits', rows: 42 }
      );

      expect(perfEntry.actionType).toBe('perf_database_query');
      expect(perfEntry.result).toBe('completed in 150ms');
      expect(perfEntry.actorId).toBe(1);
      expect(perfEntry.metadata?.operation).toBe('database_query');
      expect(perfEntry.metadata?.durationMs).toBe(150);
      expect(perfEntry.metadata?.rows).toBe(42);
    });

    test('should create validation entries correctly', () => {
      const successEntry = LogUtils.createValidationEntry(
        'battle_state',
        true,
        'All checks passed',
        0,
        { checks: ['hp_range', 'status_effects'] }
      );

      const failureEntry = LogUtils.createValidationEntry(
        'battle_state',
        false,
        'Invalid HP range',
        1
      );

      expect(successEntry.actionType).toBe('validation_battle_state');
      expect(successEntry.result).toBe('passed');
      expect(successEntry.level).toBe(LogLevel.INFO);
      expect(successEntry.metadata?.validationType).toBe('battle_state');

      expect(failureEntry.result).toBe('failed');
      expect(failureEntry.level).toBe(LogLevel.ERROR);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete battle logging workflow', () => {
      const logger = new BattleLogger();

      // Simulate complete battle
      logger.logSystem('Battle started', LogCategory.BATTLE, LogLevel.INFO);

      // Turn 1
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      logger.logPhaseChange(BattlePhase.SELECT_ACTION);

      const action1: IBattleAction = {
        actorId: 1,
        targetId: 2,
        moveId: 'fire_blast',
        debugNotes: 'Type advantage: fire > water'
      };

      const result1 = BattleResult.success(45, 'burned');
      logger.logAction(action1, result1);

      logger.logEffect(BattleEffect.create('burn', 'Applied burn for 3 turns', 1, 2, { duration: 3 }));

      // Turn 2
      logger.logPhaseChange(BattlePhase.RESOLVE_ACTION);
      logger.logPhaseChange(BattlePhase.TURN_END);

      const action2: IBattleAction = {
        actorId: 2,
        targetId: 1,
        moveId: 'water_burst',
        debugNotes: 'Type advantage: water > fire'
      };

      const result2 = BattleResult.success(35);
      logger.logAction(action2, result2);

      logger.logPhaseChange(BattlePhase.BATTLE_END);
      logger.logSystem('Battle completed', LogCategory.BATTLE, LogLevel.INFO);

      // Verify logging
      expect(logger.getEntryCount()).toBe(9);

      const stats = logger.getStatistics();
      expect(stats.totalEntries).toBe(9);
      expect(stats.entriesByCategory[LogCategory.BATTLE]).toBe(7);
      expect(stats.entriesByCategory[LogCategory.SYSTEM]).toBe(2);
      expect(stats.averageEntriesPerTurn).toBeGreaterThan(0);

      // Test filtering
      const battleEntries = logger.getFilteredEntries({ category: LogCategory.BATTLE });
      expect(battleEntries).toHaveLength(7);

      const actionEntries = logger.getFilteredEntries({ actionType: 'fire_blast' });
      expect(actionEntries).toHaveLength(1);
      expect(actionEntries[0!].damageDealt).toBe(45);
      expect(actionEntries[0!].statusApplied).toBe('burned');
    });

    test('should handle multi-turn battle scenarios', () => {
      const logger = new BattleLogger();

      for (let turn = 1; turn <= 3; turn++) {
        logger.logPhaseChange(BattlePhase.PRE_TURN);
        logger.logPhaseChange(BattlePhase.SELECT_ACTION);

        const action: IBattleAction = {
          actorId: 1,
          targetId: 2,
          moveId: `attack_${turn}`,
          debugNotes: `Turn ${turn} attack`
        };

        const result = BattleResult.success(30 + turn * 5);
        logger.logAction(action, result);

        logger.logPhaseChange(BattlePhase.RESOLVE_ACTION);
        logger.logPhaseChange(BattlePhase.TURN_END);
      }

      expect(logger.getEntryCount()).toBe(15); // 5 entries per turn
      expect(logger.getCurrentTurn()).toBe(3);

      // Test turn-based filtering
      const turn1Entries = logger.getEntriesByTurn(1);
      const turn2Entries = logger.getEntriesByTurn(2);
      const turn3Entries = logger.getEntriesByTurn(3);

      expect(turn1Entries).toHaveLength(5);
      expect(turn2Entries).toHaveLength(5);
      expect(turn3Entries).toHaveLength(5);

      // Verify damage progression
      expect(turn1Entries.find(e => e.actionType === 'attack_1')?.damageDealt).toBe(35);
      expect(turn2Entries.find(e => e.actionType === 'attack_2')?.damageDealt).toBe(40);
      expect(turn3Entries.find(e => e.actionType === 'attack_3')?.damageDealt).toBe(45);
    });

    test('should handle complex filtering scenarios', () => {
      const logger = new BattleLogger();

      // Add diverse entries
      logger.logSystem('Battle started', LogCategory.SYSTEM, LogLevel.INFO);
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      logger.logDebug('AI decision started', LogCategory.AI, LogLevel.DEBUG);

      const action1: IBattleAction = {
        actorId: 1,
        targetId: 2,
        moveId: 'fire_blast',
        debugNotes: 'Damage calculation complete'
      };

      logger.logAction(action1, BattleResult.success(45));
      logger.logWarning('High damage detected', LogCategory.BATTLE, LogLevel.WARN);
      logger.logError('Invalid target', LogCategory.VALIDATION, LogLevel.ERROR);

      // Test complex filters
      const systemEntries = logger.getFilteredEntries({
        category: LogCategory.SYSTEM,
        level: LogLevel.INFO
      });
      expect(systemEntries).toHaveLength(1);

      const errorEntries = logger.getFilteredEntries({
        level: LogLevel.ERROR
      });
      expect(errorEntries).toHaveLength(1);

      const actorEntries = logger.getFilteredEntries({
        actorId: 1
      });
      expect(actorEntries).toHaveLength(1);

      const warningsAndAbove = logger.getFilteredEntries({
        level: LogLevel.WARN
      });
      expect(warningsAndAbove).toHaveLength(2); // Warning + Error
    });

    test('should handle log export and import', () => {
      const originalLogger = new BattleLogger();

      // Add test data
      originalLogger.logSystem('Test battle log', LogCategory.SYSTEM, LogLevel.INFO);
      originalLogger.logPhaseChange(BattlePhase.PRE_TURN);

      const action: IBattleAction = {
        actorId: 1,
        targetId: 2,
        moveId: 'test_move',
        debugNotes: 'Test action for export/import'
      };

      originalLogger.logAction(action, BattleResult.success(25));

      // Export to JSON
      const jsonExport = originalLogger.exportToJSON();
      expect(jsonExport).toContain('Test battle log');
      expect(jsonExport).toContain('test_move');
      expect(jsonExport).toContain('25');

      // Import from JSON
      const importedLogger = BattleLogger.importFromJSON(jsonExport);

      expect(importedLogger.getEntryCount()).toBe(originalLogger.getEntryCount());
      expect(importedLogger.getCurrentTurn()).toBe(originalLogger.getCurrentTurn());

      const originalEntries = originalLogger.getAllEntries();
      const importedEntries = importedLogger.getAllEntries();

      expect(importedEntries).toHaveLength(originalEntries.length);

      // Verify entry content matches
      for (let i = 0; i < originalEntries.length; i++) {
        const original = originalEntries[i];
        const imported = importedEntries[i];

        expect(imported.actionType).toBe(original.actionType);
        expect(imported.result).toBe(original.result);
        expect(imported.category).toBe(original.category);
        expect(imported.level).toBe(original.level);
      }
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many entries efficiently', () => {
      const logger = new BattleLogger(5000); // Large capacity
      const startTime = performance.now();

      // Add many entries
      for (let i = 0; i < 1000; i++) {
        if (i % 4 === 0) {
          logger.logSystem(`System message ${i}`, LogCategory.SYSTEM, LogLevel.INFO);
        } else if (i % 4 === 1) {
          logger.logPhaseChange(BattlePhase.PRE_TURN);
        } else if (i % 4 === 2) {
          const action: IBattleAction = {
            actorId: i % 100,
            targetId: (i + 1) % 100,
            moveId: `move_${i % 10}`,
            debugNotes: `Action ${i}`
          };
          logger.logAction(action, BattleResult.success(i % 50));
        } else {
          logger.logDebug(`Debug ${i}`, LogCategory.SYSTEM, LogLevel.DEBUG);
        }
      }

      const endTime = performance.now();

      expect(logger.getEntryCount()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should handle rapid logging efficiently', () => {
      const logger = new BattleLogger();
      const startTime = performance.now();

      // Rapid logging
      for (let i = 0; i < 1000; i++) {
        logger.logSystem(`Message ${i}`, LogCategory.SYSTEM, LogLevel.INFO);
      }

      const endTime = performance.now();

      expect(logger.getEntryCount()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    test('should handle complex filtering efficiently', () => {
      const logger = new BattleLogger();

      // Add diverse entries
      for (let i = 0; i < 1000; i++) {
        const category = i % 6 === 0 ? LogCategory.SYSTEM :
                        i % 6 === 1 ? LogCategory.BATTLE :
                        i % 6 === 2 ? LogCategory.AI :
                        i % 6 === 3 ? LogCategory.PERFORMANCE :
                        i % 6 === 4 ? LogCategory.NETWORK : LogCategory.VALIDATION;

        const level = i % 5 === 0 ? LogLevel.DEBUG :
                     i % 5 === 1 ? LogLevel.INFO :
                     i % 5 === 2 ? LogLevel.WARN :
                     i % 5 === 3 ? LogLevel.ERROR : LogLevel.CRITICAL;

        const entry = new BattleLogEntry(
          i % 100,
          `action_${i % 10}`,
          (i + 1) % 100,
          `result_${i % 5}`,
          category,
          level,
          `Debug ${i}`,
          i % 4 === 0 ? BattlePhase.PRE_TURN : undefined,
          i % 50,
          i % 3 === 0 ? `status_${i % 5}` : undefined,
          Math.floor(i / 4),
          { metadata: i }
        );

        logger.entries.push(entry);
      }

      const startTime = performance.now();

      // Complex filtering operations
      for (let i = 0; i < 100; i++) {
        logger.getFilteredEntries({
          category: LogCategory.BATTLE,
          level: LogLevel.INFO,
          limit: 50,
          offset: i * 10
        });

        logger.getEntriesByCategory(LogCategory.SYSTEM);
        logger.getEntriesByLevel(LogLevel.ERROR);
        logger.getEntriesByTurn(i % 10);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });
  });
});
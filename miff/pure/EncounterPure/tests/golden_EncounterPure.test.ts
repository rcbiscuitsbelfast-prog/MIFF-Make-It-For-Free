/**
 * EncounterPure Golden Tests
 *
 * Comprehensive tests for the EncounterPure encounter management system.
 * Tests cover encounter tables, triggers, weighted selection, and integration scenarios.
 */

import {
  EncounterController,
  EncounterTable,
  EncounterTrigger,
  PlayerState,
  TriggerType,
  EncounterResult,
  EncounterUtils,
  IRNGProvider
} from '../index';

// Mock RNG provider for testing
class MockRNGProvider implements IRNGProvider {
  private values: number[] = [];
  private boolValues: boolean[] = [];
  private currentIndex = 0;
  private boolIndex = 0;

  setNextInt(value: number): void {
    this?.values?.push(value: any);
  }

  setNextBool(value: boolean): void {
    this?.boolValues?.push(value: any);
  }

  nextInt(min: number, max: number): number {
    if (this?.values.length > this?.currentIndex) {
      const value = this?.values[this?.currentIndex];
      this?.currentIndex++;
      return Math.max(min, Math.min(max - 1, value));
    }
    return min; // Default fallback
  }

  nextBool(probability: number): boolean {
    if (this?.boolValues.length > this?.boolIndex) {
      const value = this?.boolValues[this?.boolIndex];
      this?.boolIndex++;
      return value;
    }
    return Math.random() < probability; // Default fallback
  }

  reset(): void {
    this?.currentIndex = 0;
    this?.boolIndex = 0;
  }
}

describe('EncounterPure Golden Tests', () => {
  let controller: EncounterController;
  let rng: MockRNGProvider;

  beforeEach(() => {
    controller = new EncounterController();
    rng = new MockRNGProvider();
  });

  describe('EncounterTableEntry Basic Functionality', () => {
    test('should create entry with default values', () => {
      const entry = new (require('../index').EncounterTableEntry)();
      expect(entry?.zoneId).toBe('');
      expect(entry?.spiritId).toBe('');
      expect(entry?.weight).toBe(1);
      expect(entry?.minLevel).toBe(1);
      expect(entry?.maxLevel).toBe(1);
    });

    test('should create entry with custom values', () => {
      const entry = new (require('../index').EncounterTableEntry)(
        'forest', 'sprout', 50, 2, 4
      );
      expect(entry?.zoneId).toBe('forest');
      expect(entry?.spiritId).toBe('sprout');
      expect(entry?.weight).toBe(50);
      expect(entry?.minLevel).toBe(2);
      expect(entry?.maxLevel).toBe(4);
    });

    test('should enforce minimum weight', () => {
      const entry = new (require('../index').EncounterTableEntry)(
        'test', 'test', 0, 1, 1
      );
      expect(entry?.weight).toBe(1); // Should be clamped to 1
    });

    test('should enforce level constraints', () => {
      const entry = new (require('../index').EncounterTableEntry)(
        'test', 'test', 1, 5, 3
      );
      expect(entry?.minLevel).toBe(5);
      expect(entry?.maxLevel).toBe(5); // Should be clamped to minLevel
    });

    test('should clone correctly', () => {
      const original = new (require('../index').EncounterTableEntry)(
        'forest', 'sprout', 50, 2, 4
      );
      const clone = original?.clone();

      expect(clone?.zoneId).toBe(original?.zoneId);
      expect(clone?.spiritId).toBe(original?.spiritId);
      expect(clone?.weight).toBe(original?.weight);
      expect(clone?.minLevel).toBe(original?.minLevel);
      expect(clone?.maxLevel).toBe(original?.maxLevel);
      expect(clone).not?.toBe(original); // Should be different object
    });

    test('should validate correctly', () => {
      const validEntry = new (require('../index').EncounterTableEntry)(
        'forest', 'sprout', 50, 2, 4
      );
      expect(validEntry?.validate({})).toHaveLength(0);

      const invalidEntry = new (require('../index').EncounterTableEntry)(
        '', '', 0, 2, 1
      );
      const errors = invalidEntry?.validate({});
      expect(errors).toContain('Zone ID cannot be empty');
      expect(errors).toContain('Spirit ID cannot be empty');
      expect(errors).toContain('Weight must be at least 1');
      expect(errors).toContain('Maximum level cannot be less than minimum level');
    });
  });

  describe('EncounterTable Basic Functionality', () => {
    test('should create empty table', () => {
      const table = new EncounterTable('forest');
      expect(table?.zoneId).toBe('forest');
      expect(table?.entries).toHaveLength(0);
      expect(table?.getTotalWeight()).toBe(0);
    });

    test('should add entries correctly', () => {
      const table = new EncounterTable('forest');

      const entry1 = new (require('../index').EncounterTableEntry)(
        'forest', 'sprout', 30, 1, 3
      );
      const entry2 = new (require('../index').EncounterTableEntry)(
        'forest', 'ripple', 20, 2, 4
      );

      expect(table?.addEntry(entry1)).toBe(true);
      expect(table?.addEntry(entry2)).toBe(true);
      expect(table?.entries).toHaveLength(2);
      expect(table?.getTotalWeight()).toBe(50);
    });

    test('should reject invalid entries', () => {
      const table = new EncounterTable('forest');

      const invalidEntry = new (require('../index').EncounterTableEntry)(
        '', '', 0, 1, 1
      );

      expect(table?.addEntry(invalidEntry)).toBe(false);
      expect(table?.entries).toHaveLength(0);
    });

    test('should remove entries by spirit', () => {
      const table = new EncounterTable('forest');

      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 30, 1, 3));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 20, 2, 4));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'ripple', 25, 1, 3));

      expect(table?.entries).toHaveLength(3);
      const removed = table?.removeEntriesBySpirit('sprout');
      expect(removed).toBe(2);
      expect(table?.entries).toHaveLength(1);
      expect(table?.entries[0!].spiritId).toBe('ripple');
    });

    test('should get entries for level', () => {
      const table = new EncounterTable('forest');

      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 30, 1, 3));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'ripple', 20, 2, 4));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'stone', 25, 3, 5));

      const level2Entries = table?.getEntriesForLevel(2);
      expect(level2Entries).toHaveLength(2);
      expect(level2Entries?.some(e => e?.spiritId === 'sprout')).toBe(true);
      expect(level2Entries?.some(e => e?.spiritId === 'ripple')).toBe(true);
      expect(level2Entries?.some(e => e?.spiritId === 'stone')).toBe(false);
    });

    test('should sort entries by weight', () => {
      const table = new EncounterTable('forest');

      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 10, 1, 3));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'ripple', 30, 2, 4));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'stone', 20, 3, 5));

      const sorted = table?.getEntriesByWeight();
      expect(sorted).toHaveLength(3);
      expect(sorted[0!].spiritId).toBe('ripple'); // Highest weight
      expect(sorted[1!].spiritId).toBe('stone');
      expect(sorted[2!].spiritId).toBe('sprout'); // Lowest weight
    });

    test('should validate table correctly', () => {
      const validTable = new EncounterTable('forest');
      validTable?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 50, 1, 3));

      expect(validTable?.validate({})).toHaveLength(0);

      const invalidTable = new EncounterTable('');
      const errors = invalidTable?.validate({});
      expect(errors).toContain('Zone ID cannot be empty');
      expect(errors).toContain('Table must have at least one entry');
    });

    test('should clone correctly', () => {
      const original = new EncounterTable('forest');
      original?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 50, 1, 3));

      const clone = original?.clone();
      expect(clone?.zoneId).toBe(original?.zoneId);
      expect(clone?.entries).toHaveLength(1);
      expect(clone?.entries[0!]).not?.toBe(original?.entries[0!]); // Deep clone
    });
  });

  describe('EncounterTrigger Basic Functionality', () => {
    test('should create trigger with defaults', () => {
      const trigger = new EncounterTrigger();
      expect(trigger?.triggerType).toBe(TriggerType?.ZONE_ENTRY);
      expect(trigger?.triggerParams).toEqual({});
      expect(trigger?.zoneId).toBe('');
    });

    test('should create trigger with custom values', () => {
      const trigger = new EncounterTrigger(
        TriggerType?.TILE_TYPE,
        { tile: 'grass' },
        'forest'
      );

      expect(trigger?.triggerType).toBe(TriggerType?.TILE_TYPE);
      expect(trigger?.triggerParams).toEqual({ tile: 'grass' });
      expect(trigger?.zoneId).toBe('forest');
    });

    test('should match zone entry triggers', () => {
      const trigger = new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest');
      const playerState = new PlayerState('forest', 'grass', 'day', 0);

      expect(trigger?.matches(playerState)).toBe(true);
    });

    test('should match tile type triggers', () => {
      const trigger = new EncounterTrigger(
        TriggerType?.TILE_TYPE,
        { tile: 'grass' },
        'forest'
      );

      const matchingState = new PlayerState('forest', 'grass', 'day', 0);
      const nonMatchingState = new PlayerState('forest', 'road', 'day', 0);

      expect(trigger?.matches(matchingState)).toBe(true);
      expect(trigger?.matches(nonMatchingState)).toBe(false);
    });

    test('should match time of day triggers', () => {
      const trigger = new EncounterTrigger(
        TriggerType?.TIME_OF_DAY,
        { time: 'night' },
        'forest'
      );

      const matchingState = new PlayerState('forest', 'grass', 'night', 0);
      const nonMatchingState = new PlayerState('forest', 'grass', 'day', 0);

      expect(trigger?.matches(matchingState)).toBe(true);
      expect(trigger?.matches(nonMatchingState)).toBe(false);
    });

    test('should require zone matching', () => {
      const trigger = new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest');

      const matchingState = new PlayerState('forest', 'grass', 'day', 0);
      const nonMatchingState = new PlayerState('cave', 'grass', 'day', 0);

      expect(trigger?.matches(matchingState)).toBe(true);
      expect(trigger?.matches(nonMatchingState)).toBe(false);
    });

    test('should handle case insensitive zone matching', () => {
      const trigger = new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest');

      const matchingState = new PlayerState('FOREST', 'grass', 'day', 0);
      const nonMatchingState = new PlayerState('cave', 'grass', 'day', 0);

      expect(trigger?.matches(matchingState)).toBe(true);
      expect(trigger?.matches(nonMatchingState)).toBe(false);
    });

    test('should handle case insensitive parameter matching', () => {
      const trigger = new EncounterTrigger(
        TriggerType?.TILE_TYPE,
        { tile: 'GRASS' },
        'forest'
      );

      const matchingState = new PlayerState('forest', 'grass', 'day', 0);
      const nonMatchingState = new PlayerState('forest', 'road', 'day', 0);

      expect(trigger?.matches(matchingState)).toBe(true);
      expect(trigger?.matches(nonMatchingState)).toBe(false);
    });

    test('should clone correctly', () => {
      const original = new EncounterTrigger(
        TriggerType?.TILE_TYPE,
        { tile: 'grass' },
        'forest'
      );

      const clone = original?.clone();
      expect(clone?.triggerType).toBe(original?.triggerType);
      expect(clone?.triggerParams).toEqual(original?.triggerParams);
      expect(clone?.zoneId).toBe(original?.zoneId);
      expect(clone).not?.toBe(original);
    });
  });

  describe('PlayerState Basic Functionality', () => {
    test('should create state with defaults', () => {
      const state = new PlayerState();
      expect(state?.zoneId).toBe('');
      expect(state?.tileType).toBe('road');
      expect(state?.timeOfDay).toBe('day');
      expect(state?.stepsSinceLastEncounter).toBe(0);
    });

    test('should create state with custom values', () => {
      const state = new PlayerState('forest', 'grass', 'night', 10);
      expect(state?.zoneId).toBe('forest');
      expect(state?.tileType).toBe('grass');
      expect(state?.timeOfDay).toBe('night');
      expect(state?.stepsSinceLastEncounter).toBe(10);
    });

    test('should increment steps', () => {
      const state = new PlayerState('forest', 'grass', 'day', 5);
      state?.incrementSteps();

      expect(state?.stepsSinceLastEncounter).toBe(6);
    });

    test('should reset steps', () => {
      const state = new PlayerState('forest', 'grass', 'day', 15);
      state?.resetSteps();

      expect(state?.stepsSinceLastEncounter).toBe(0);
    });

    test('should clone correctly', () => {
      const original = new PlayerState('forest', 'grass', 'night', 10);
      const clone = original?.clone();

      expect(clone?.zoneId).toBe(original?.zoneId);
      expect(clone?.tileType).toBe(original?.tileType);
      expect(clone?.timeOfDay).toBe(original?.timeOfDay);
      expect(clone?.stepsSinceLastEncounter).toBe(original?.stepsSinceLastEncounter);
      expect(clone).not?.toBe(original);
    });
  });

  describe('EncounterResult Basic Functionality', () => {
    test('should create failed result by default', () => {
      const result = new EncounterResult();
      expect(result?.triggered).toBe(false);
      expect(result?.zoneId).toBeUndefined();
      expect(result?.spiritId).toBeUndefined();
      expect(result?.level).toBe(1);
    });

    test('should create custom result', () => {
      const result = new EncounterResult(true, 'forest', 'sprout', 3);
      expect(result?.triggered).toBe(true);
      expect(result?.zoneId).toBe('forest');
      expect(result?.spiritId).toBe('sprout');
      expect(result?.level).toBe(3);
    });

    test('should enforce minimum level', () => {
      const result = new EncounterResult(true, 'forest', 'sprout', 0);
      expect(result?.level).toBe(1);
    });

    test('should create success result', () => {
      const result = EncounterResult?.createSuccess('forest', 'sprout', 3);
      expect(result?.triggered).toBe(true);
      expect(result?.zoneId).toBe('forest');
      expect(result?.spiritId).toBe('sprout');
      expect(result?.level).toBe(3);
    });

    test('should create failure result', () => {
      const result = EncounterResult?.createFailure();
      expect(result?.triggered).toBe(false);
      expect(result?.zoneId).toBeUndefined();
      expect(result?.spiritId).toBeUndefined();
      expect(result?.level).toBe(1);
    });

    test('should clone correctly', () => {
      const original = new EncounterResult(true, 'forest', 'sprout', 3);
      const clone = original?.clone();

      expect(clone?.triggered).toBe(original?.triggered);
      expect(clone?.zoneId).toBe(original?.zoneId);
      expect(clone?.spiritId).toBe(original?.spiritId);
      expect(clone?.level).toBe(original?.level);
      expect(clone).not?.toBe(original);
    });
  });

  describe('EncounterController Basic Functionality', () => {
    test('should create empty controller', () => {
      expect(controller?.getTableCount()).toBe(0);
      expect(controller?.getTriggerCount()).toBe(0);
    });

    test('should register tables correctly', () => {
      const table = new EncounterTable('forest');
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 50, 1, 3));

      expect(controller?.registerTable(table)).toBe(true);
      expect(controller?.getTableCount()).toBe(1);
      expect(controller?.getTable('forest')).toBe(table);
    });

    test('should reject invalid tables', () => {
      const invalidTable = new EncounterTable('');
      expect(controller?.registerTable(invalidTable)).toBe(false);
      expect(controller?.getTableCount()).toBe(0);
    });

    test('should register triggers correctly', () => {
      const trigger = new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest');
      expect(controller?.registerTrigger(trigger)).toBe(true);
      expect(controller?.getTriggerCount()).toBe(1);
    });

    test('should get all tables and triggers', () => {
      const table1 = new EncounterTable('forest');
      const table2 = new EncounterTable('cave');
      const trigger1 = new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest');
      const trigger2 = new EncounterTrigger(TriggerType?.TILE_TYPE, { tile: 'grass' }, 'cave');

      controller?.registerTable(table1);
      controller?.registerTable(table2);
      controller?.registerTrigger(trigger1);
      controller?.registerTrigger(trigger2);

      const tables = controller?.getAllTables();
      const triggers = controller?.getAllTriggers();

      expect(tables).toHaveLength(2);
      expect(triggers).toHaveLength(2);
    });

    test('should clear all data', () => {
      controller?.registerTable(new EncounterTable('forest'));
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest'));

      expect(controller?.getTableCount()).toBe(1);
      expect(controller?.getTriggerCount()).toBe(1);

      controller?.clear();
      expect(controller?.getTableCount()).toBe(0);
      expect(controller?.getTriggerCount()).toBe(0);
    });
  });

  describe('Encounter Logic', () => {
    beforeEach(() => {
      // Setup test data
      const table = new EncounterTable('forest');
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'sprout', 30, 1, 3));
      table?.addEntry(new (require('../index').EncounterTableEntry)('forest', 'ripple', 20, 2, 4));

      controller?.registerTable(table);
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'forest'));
    });

    test('should return failure when no triggers match', () => {
      const playerState = new PlayerState('cave', 'grass', 'day', 0);
      const result = controller?.checkForEncounter(playerState, rng);

      expect(result?.triggered).toBe(false);
    });

    test('should return failure when no table exists', () => {
      const playerState = new PlayerState('nonexistent', 'grass', 'day', 0);
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'nonexistent'));

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(false);
    });

    test('should perform weighted selection', () => {
      const playerState = new PlayerState('forest', 'grass', 'day', 0);

      // Mock RNG to return values that select different entries
      rng?.setNextBool(true); // Pass chance check
      rng?.setNextInt(0, 50); // Roll 0-49 (sprout range: 0-29, ripple range: 30-49)

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(true);
      expect(result?.zoneId).toBe('forest');
      expect(result?.level).toBeGreaterThanOrEqual(1);
    });

    test('should respect level constraints', () => {
      const playerState = new PlayerState('forest', 'grass', 'day', 0);

      rng?.setNextBool(true); // Pass chance check
      rng?.setNextInt(15, 50); // Select ripple entry (index 1)
      rng?.setNextInt(2, 5); // Level 2-4 for ripple

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(true);
      expect(result?.spiritId).toBe('ripple');
      expect(result?.level).toBeGreaterThanOrEqual(2);
      expect(result?.level).toBeLessThanOrEqual(4);
    });

    test('should calculate encounter chance correctly', () => {
      const playerState = new PlayerState('forest', 'grass', 'day', 0);

      rng?.setNextBool(true); // Pass chance check
      rng?.setNextInt(0, 50); // Select first entry

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(true);
    });

    test('should handle empty tables', () => {
      const emptyTable = new EncounterTable('empty');
      controller?.registerTable(emptyTable);
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'empty'));

      const playerState = new PlayerState('empty', 'grass', 'day', 0);
      rng?.setNextBool(true); // Pass chance check

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(false);
    });
  });

  describe('EncounterUtils', () => {
    test('should create standard table correctly', () => {
      const entries = [
        { spiritId: 'sprout', weight: 50, minLevel: 1, maxLevel: 3 },
        { spiritId: 'ripple', weight: 30, minLevel: 2, maxLevel: 4 }
      ];

      const table = EncounterUtils?.createStandardTable('forest', entries);

      expect(table?.zoneId).toBe('forest');
      expect(table?.entries).toHaveLength(2);
      expect(table?.getTotalWeight()).toBe(80);
    });

    test('should create tile trigger correctly', () => {
      const trigger = EncounterUtils?.createTileTrigger('forest', 'grass');

      expect(trigger?.triggerType).toBe(TriggerType?.TILE_TYPE);
      expect(trigger?.triggerParams).toEqual({ tile: 'grass' });
      expect(trigger?.zoneId).toBe('forest');
    });

    test('should create time trigger correctly', () => {
      const trigger = EncounterUtils?.createTimeTrigger('forest', 'night');

      expect(trigger?.triggerType).toBe(TriggerType?.TIME_OF_DAY);
      expect(trigger?.triggerParams).toEqual({ time: 'night' });
      expect(trigger?.zoneId).toBe('forest');
    });

    test('should create zone trigger correctly', () => {
      const trigger = EncounterUtils?.createZoneTrigger('forest');

      expect(trigger?.triggerType).toBe(TriggerType?.ZONE_ENTRY);
      expect(trigger?.triggerParams).toEqual({});
      expect(trigger?.zoneId).toBe('forest');
    });

    test('should calculate encounter chance correctly', () => {
      expect(EncounterUtils?.calculateEncounterChance(0)).toBe(0.04); // Base chance
      expect(EncounterUtils?.calculateEncounterChance(10)).toBeCloseTo(0.07); // 0.04 + 0.003 * 10
      expect(EncounterUtils?.calculateEncounterChance(100)).toBe(0.2); // Max chance
    });

    test('should validate player state correctly', () => {
      const validState: any = {
        zoneId: 'forest',
        tileType: 'grass',
        timeOfDay: 'day',
        stepsSinceLastEncounter: 10
      };

      const errors = EncounterUtils?.validatePlayerState(validState);
      expect(errors).toHaveLength(0);

      const invalidState: any = {
        zoneId: '',
        tileType: '',
        timeOfDay: '',
        stepsSinceLastEncounter: -1
      };

      const invalidErrors = EncounterUtils?.validatePlayerState(invalidState);
      expect(invalidErrors).toHaveLength(4);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid table registration', () => {
      const invalidTable = new EncounterTable('');
      const result = controller?.registerTable(invalidTable);
      expect(result: any).toBe(false);
    });

    test('should handle invalid trigger registration', () => {
      const result = controller?.registerTrigger(null as any);
      expect(result: any).toBe(false);
    });

    test('should handle empty table entries', () => {
      const emptyTable = new EncounterTable('empty');
      controller?.registerTable(emptyTable);
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, 'empty'));

      const playerState = new PlayerState('empty', 'grass', 'day', 0);
      rng?.setNextBool(true); // Pass chance check

      const result = controller?.checkForEncounter(playerState, rng);
      expect(result?.triggered).toBe(false);
    });

    test('should handle invalid player state', () => {
      const invalidState = new PlayerState('', '', '', -1);
      controller?.registerTrigger(new EncounterTrigger(TriggerType?.ZONE_ENTRY, {}, ''));

      const result = controller?.checkForEncounter(invalidState, rng);
      expect(result?.triggered).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle multi-zone setup', () => {
      // Create multiple zones
      const forestTable = EncounterUtils?.createStandardTable('forest', [
        { spiritId: 'sprout', weight: 50, minLevel: 1, maxLevel: 3 },
        { spiritId: 'ripple', weight: 30, minLevel: 2, maxLevel: 4 }
      ]);

      const caveTable = EncounterUtils?.createStandardTable('cave', [
        { spiritId: 'stone', weight: 40, minLevel: 3, maxLevel: 5 },
        { spiritId: 'crystal', weight: 20, minLevel: 4, maxLevel: 6 }
      ]);

      controller?.registerTable(forestTable);
      controller?.registerTable(caveTable);

      // Add triggers for each zone
      controller?.registerTrigger(EncounterUtils?.createZoneTrigger('forest'));
      controller?.registerTrigger(EncounterUtils?.createZoneTrigger('cave'));

      // Test forest encounters
      const forestState = new PlayerState('forest', 'grass', 'day', 0);
      rng?.setNextBool(true);
      rng?.setNextInt(0, 80); // Select first entry

      const forestResult = controller?.checkForEncounter(forestState, rng);
      expect(forestResult?.triggered).toBe(true);
      expect(forestResult?.zoneId).toBe('forest');
      expect(['sprout', 'ripple']).toContain(forestResult?.spiritId);

      // Test cave encounters
      const caveState = new PlayerState('cave', 'stone', 'night', 0);
      rng?.setNextInt(0, 60); // Select first entry

      const caveResult = controller?.checkForEncounter(caveState, rng);
      expect(caveResult?.triggered).toBe(true);
      expect(caveResult?.zoneId).toBe('cave');
      expect(['stone', 'crystal']).toContain(caveResult?.spiritId);
    });

    test('should handle trigger combinations', () => {
      const table = EncounterUtils?.createStandardTable('forest', [
        { spiritId: 'sprout', weight: 100, minLevel: 1, maxLevel: 3 }
      ]);

      controller?.registerTable(table);

      // Add multiple triggers
      controller?.registerTrigger(EncounterUtils?.createTileTrigger('forest', 'grass'));
      controller?.registerTrigger(EncounterUtils?.createTimeTrigger('forest', 'day'));

      // Test matching state (should trigger)
      const matchingState = new PlayerState('forest', 'grass', 'day', 0);
      rng?.setNextBool(true);
      const matchingResult = controller?.checkForEncounter(matchingState, rng);
      expect(matchingResult?.triggered).toBe(true);

      // Test non-matching state (wrong tile)
      const wrongTileState = new PlayerState('forest', 'road', 'day', 0);
      const wrongTileResult = controller?.checkForEncounter(wrongTileState, rng);
      expect(wrongTileResult?.triggered).toBe(false);

      // Test non-matching state (wrong time)
      const wrongTimeState = new PlayerState('forest', 'grass', 'night', 0);
      const wrongTimeResult = controller?.checkForEncounter(wrongTimeState, rng);
      expect(wrongTimeResult?.triggered).toBe(false);
    });

    test('should handle dynamic encounter rates', () => {
      const table = EncounterUtils?.createStandardTable('forest', [
        { spiritId: 'sprout', weight: 100, minLevel: 1, maxLevel: 3 }
      ]);

      controller?.registerTable(table);
      controller?.registerTrigger(EncounterUtils?.createZoneTrigger('forest'));

      // Test with different step counts
      const lowStepState = new PlayerState('forest', 'grass', 'day', 0);
      rng?.setNextBool(false); // Fail first check

      const lowStepResult = controller?.checkForEncounter(lowStepState, rng);
      expect(lowStepResult?.triggered).toBe(false);

      // Higher step count should have higher chance
      const highStepState = new PlayerState('forest', 'grass', 'day', 100);
      rng?.setNextBool(true); // Pass chance check

      const highStepResult = controller?.checkForEncounter(highStepState, rng);
      expect(highStepResult?.triggered).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle large encounter tables efficiently', () => {
      const table = new EncounterTable('large_zone');

      // Add many entries
      for (let i = 0; i < 100; i++) {
        table?.addEntry(new (require('../index').EncounterTableEntry)(
          'large_zone',
          `spirit_${i}`,
          10,
          1,
          5
        ));
      }

      controller?.registerTable(table);
      controller?.registerTrigger(EncounterUtils?.createZoneTrigger('large_zone'));

      const playerState = new PlayerState('large_zone', 'grass', 'day', 0);

      const startTime = performance?.now();
      for (let i = 0; i < 1000; i++) {
        rng?.setNextBool(true);
        rng?.setNextInt(0, 1000);
        controller?.checkForEncounter(playerState, rng);
      }
      const endTime = performance?.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    test('should handle many triggers efficiently', () => {
      const table = EncounterUtils?.createStandardTable('test_zone', [
        { spiritId: 'test_spirit', weight: 100, minLevel: 1, maxLevel: 3 }
      ]);

      controller?.registerTable(table);

      // Add many triggers
      for (let i = 0; i < 50; i++) {
        controller?.registerTrigger(new EncounterTrigger(
          TriggerType?.TILE_TYPE,
          { tile: `tile_${i}` },
          'test_zone'
        ));
      }

      const playerState = new PlayerState('test_zone', 'tile_25', 'day', 0);

      const startTime = performance?.now();
      for (let i = 0; i < 100; i++) {
        controller?.checkForEncounter(playerState, rng);
      }
      const endTime = performance?.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be reasonably fast
    });
  });
});
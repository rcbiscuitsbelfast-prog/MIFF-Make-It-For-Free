/**
 * EncounterPure - Encounter Management System
 *
 * A comprehensive encounter management system for handling random encounters,
 * encounter tables, trigger conditions, and player state tracking. Supports
 * zone-based encounters, weighted selection, and level scaling for modular
 * gameplay systems.
 *
 * @module EncounterPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Trigger types for encounters
 */
export enum TriggerType {
  ZONE_ENTRY = 'zone_entry',
  TILE_TYPE = 'tile_type',
  TIME_OF_DAY = 'time_of_day'
}

/**
 * Entry in an encounter table with weight and level constraints
 */
export interface IEncounterTableEntry {
  zoneId: string;
  spiritId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
}

/**
 * Encounter table for a specific zone
 */
export interface IEncounterTable {
  zoneId: string;
  entries: IEncounterTableEntry[];
}

/**
 * Trigger condition for encounters
 */
export interface IEncounterTrigger {
  triggerType: TriggerType;
  triggerParams: Record<string, string>;
  zoneId: string;
}

/**
 * Player state for encounter checking
 */
export interface IPlayerState {
  zoneId: string;
  tileType: string;
  timeOfDay: string;
  stepsSinceLastEncounter: number;
}

/**
 * Result of an encounter check
 */
export interface IEncounterResult {
  triggered: boolean;
  zoneId?: string;
  spiritId?: string;
  level: number;
}

/**
 * Encounter table entry implementation
 */
export class EncounterTableEntry implements IEncounterTableEntry {
  public zoneId: string;
  public spiritId: string;
  public weight: number;
  public minLevel: number;
  public maxLevel: number;

  constructor(
    zoneId: string = '',
    spiritId: string = '',
    weight: number = 1,
    minLevel: number = 1,
    maxLevel: number = 1
  ) {
    this.zoneId = zoneId;
    this.spiritId = spiritId;
    this.weight = Math.max(1, weight);
    this.minLevel = Math.max(1, minLevel);
    this.maxLevel = Math.max(this.minLevel, maxLevel);
  }

  /**
   * Create a copy of this entry
   */
  clone(): EncounterTableEntry {
    return new EncounterTableEntry(
      this.zoneId,
      this.spiritId,
      this.weight,
      this.minLevel,
      this.maxLevel
    );
  }

  /**
   * Validate the entry data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID cannot be empty');
    }

    if (!this.spiritId || this.spiritId.trim() === '') {
      errors.push('Spirit ID cannot be empty');
    }

    if (this.weight < 1) {
      errors.push('Weight must be at least 1');
    }

    if (this.minLevel < 1) {
      errors.push('Minimum level must be at least 1');
    }

    if (this.maxLevel < this.minLevel) {
      errors.push('Maximum level cannot be less than minimum level');
    }

    return errors;
  }
}

/**
 * Encounter table implementation
 */
export class EncounterTable implements IEncounterTable {
  public zoneId: string;
  public entries: EncounterTableEntry[];

  constructor(zoneId: string = '', entries: EncounterTableEntry[] = []) {
    this.zoneId = zoneId;
    this.entries = [...entries];
  }

  /**
   * Add an entry to the table
   */
  addEntry(entry: EncounterTableEntry): boolean {
    const errors = entry.validate();
    if (errors.length > 0) {
      console.warn('Invalid encounter table entry:', errors);
      return false;
    }

    this.entries.push(entry);
    return true;
  }

  /**
   * Remove entries by spirit ID
   */
  removeEntriesBySpirit(spiritId: string): number {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter(entry => entry.spiritId !== spiritId);
    return initialLength - this.entries.length;
  }

  /**
   * Get total weight of all entries
   */
  getTotalWeight(): number {
    return this.entries.reduce((sum, entry) => sum + entry.weight, 0);
  }

  /**
   * Get entries for a specific level range
   */
  getEntriesForLevel(level: number): EncounterTableEntry[] {
    return this.entries.filter(entry =>
      level >= entry.minLevel && level <= entry.maxLevel
    );
  }

  /**
   * Get entries sorted by weight (descending)
   */
  getEntriesByWeight(): EncounterTableEntry[] {
    return [...this.entries].sort((a, b) => b.weight - a.weight);
  }

  /**
   * Validate the entire table
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID cannot be empty');
    }

    if (this.entries.length === 0) {
      errors.push('Table must have at least one entry');
    }

    this.entries.forEach((entry, index) => {
      const entryErrors = entry.validate();
      entryErrors.forEach(error => {
        errors.push(`Entry ${index}: ${error}`);
      });
    });

    return errors;
  }

  /**
   * Create a copy of this table
   */
  clone(): EncounterTable {
    return new EncounterTable(
      this.zoneId,
      this.entries.map(entry => entry.clone())
    );
  }
}

/**
 * Encounter trigger implementation
 */
export class EncounterTrigger implements IEncounterTrigger {
  public triggerType: TriggerType;
  public triggerParams: Record<string, string>;
  public zoneId: string;

  constructor(
    triggerType: TriggerType = TriggerType.ZONE_ENTRY,
    triggerParams: Record<string, string> = {},
    zoneId: string = ''
  ) {
    this.triggerType = triggerType;
    this.triggerParams = { ...triggerParams };
    this.zoneId = zoneId;
  }

  /**
   * Check if this trigger matches the player state
   */
  matches(playerState: IPlayerState): boolean {
    // Zone must match
    if (!this.zoneId || this.zoneId.toLowerCase() !== playerState.zoneId.toLowerCase()) {
      return false;
    }

    switch (this.triggerType) {
      case TriggerType.ZONE_ENTRY:
        return true;

      case TriggerType.TILE_TYPE:
        const tileParam = this.triggerParams['tile'];
        return tileParam && tileParam.toLowerCase() === playerState.tileType.toLowerCase();

      case TriggerType.TIME_OF_DAY:
        const timeParam = this.triggerParams['time'];
        return timeParam && timeParam.toLowerCase() === playerState.timeOfDay.toLowerCase();

      default:
        return false;
    }
  }

  /**
   * Create a copy of this trigger
   */
  clone(): EncounterTrigger {
    return new EncounterTrigger(
      this.triggerType,
      { ...this.triggerParams },
      this.zoneId
    );
  }
}

/**
 * Player state implementation
 */
export class PlayerState implements IPlayerState {
  public zoneId: string;
  public tileType: string;
  public timeOfDay: string;
  public stepsSinceLastEncounter: number;

  constructor(
    zoneId: string = '',
    tileType: string = 'road',
    timeOfDay: string = 'day',
    stepsSinceLastEncounter: number = 0
  ) {
    this.zoneId = zoneId;
    this.tileType = tileType;
    this.timeOfDay = timeOfDay;
    this.stepsSinceLastEncounter = Math.max(0, stepsSinceLastEncounter);
  }

  /**
   * Increment steps since last encounter
   */
  incrementSteps(): void {
    this.stepsSinceLastEncounter++;
  }

  /**
   * Reset steps since last encounter
   */
  resetSteps(): void {
    this.stepsSinceLastEncounter = 0;
  }

  /**
   * Create a copy of this state
   */
  clone(): PlayerState {
    return new PlayerState(
      this.zoneId,
      this.tileType,
      this.timeOfDay,
      this.stepsSinceLastEncounter
    );
  }
}

/**
 * Encounter result implementation
 */
export class EncounterResult implements IEncounterResult {
  public triggered: boolean;
  public zoneId?: string;
  public spiritId?: string;
  public level: number;

  constructor(triggered: boolean = false, zoneId?: string, spiritId?: string, level: number = 1) {
    this.triggered = triggered;
    this.zoneId = zoneId;
    this.spiritId = spiritId;
    this.level = Math.max(1, level);
  }

  /**
   * Create a successful encounter result
   */
  static createSuccess(zoneId: string, spiritId: string, level: number): EncounterResult {
    return new EncounterResult(true, zoneId, spiritId, level);
  }

  /**
   * Create a failed encounter result
   */
  static createFailure(): EncounterResult {
    return new EncounterResult(false);
  }

  /**
   * Create a copy of this result
   */
  clone(): EncounterResult {
    return new EncounterResult(
      this.triggered,
      this.zoneId,
      this.spiritId,
      this.level
    );
  }
}

/**
 * RNG provider interface (dependency)
 */
export interface IRNGProvider {
  nextInt(min: number, max: number): number;
  nextBool(probability: number): boolean;
}

/**
 * Encounter controller implementation
 */
export class EncounterController {
  private readonly _tablesByZone = new Map<string, EncounterTable>();
  private readonly _triggers: EncounterTrigger[] = [];

  /**
   * Register an encounter table for a zone
   */
  registerTable(table: EncounterTable): boolean {
    if (!table || !table.zoneId || table.zoneId.trim() === '') {
      console.warn('Invalid encounter table: missing or empty zone ID');
      return false;
    }

    const errors = table.validate();
    if (errors.length > 0) {
      console.warn('Invalid encounter table:', errors);
      return false;
    }

    this._tablesByZone.set(table.zoneId, table);
    return true;
  }

  /**
   * Register an encounter trigger
   */
  registerTrigger(trigger: EncounterTrigger): boolean {
    if (!trigger) {
      console.warn('Invalid encounter trigger: null or undefined');
      return false;
    }

    this._triggers.push(trigger);
    return true;
  }

  /**
   * Check for random encounters based on player state
   */
  checkForEncounter(playerState: IPlayerState, rng: IRNGProvider): IEncounterResult {
    // Find matching triggers
    const matchingTriggers = this._triggers.filter(trigger => trigger.matches(playerState));

    if (matchingTriggers.length === 0) {
      return EncounterResult.createFailure();
    }

    // Calculate encounter chance based on steps
    const chance = Math.max(0.04, Math.min(0.2, 0.04 + 0.003 * playerState.stepsSinceLastEncounter));

    if (!rng.nextBool(chance)) {
      return EncounterResult.createFailure();
    }

    // Get encounter table for the zone
    const table = this._tablesByZone.get(playerState.zoneId);
    if (!table || table.entries.length === 0) {
      return EncounterResult.createFailure();
    }

    // Perform weighted selection
    const totalWeight = table.getTotalWeight();
    if (totalWeight <= 0) {
      return EncounterResult.createFailure();
    }

    const roll = rng.nextInt(0, totalWeight);
    let accumulatedWeight = 0;

    for (const entry of table.entries) {
      accumulatedWeight += entry.weight;
      if (roll < accumulatedWeight) {
        // Found the selected entry
        const level = rng.nextInt(entry.minLevel, entry.maxLevel + 1);
        return EncounterResult.createSuccess(playerState.zoneId, entry.spiritId, level);
      }
    }

    // Fallback (should not happen)
    return EncounterResult.createFailure();
  }

  /**
   * Get encounter table for a zone
   */
  getTable(zoneId: string): EncounterTable | null {
    return this._tablesByZone.get(zoneId) || null;
  }

  /**
   * Get all registered tables
   */
  getAllTables(): EncounterTable[] {
    return Array.from(this._tablesByZone.values());
  }

  /**
   * Get all registered triggers
   */
  getAllTriggers(): readonly EncounterTrigger[] {
    return [...this._triggers];
  }

  /**
   * Clear all tables and triggers
   */
  clear(): void {
    this._tablesByZone.clear();
    this._triggers.length = 0;
  }

  /**
   * Get the number of registered tables
   */
  getTableCount(): number {
    return this._tablesByZone.size;
  }

  /**
   * Get the number of registered triggers
   */
  getTriggerCount(): number {
    return this._triggers.length;
  }
}

/**
 * Utility functions for common encounter operations
 */
export const EncounterUtils = {
  /**
   * Create a standard encounter table for a zone
   */
  createStandardTable(zoneId: string, entries: Array<{
    spiritId: string;
    weight: number;
    minLevel: number;
    maxLevel: number;
  }>): EncounterTable {
    const table = new EncounterTable(zoneId);
    entries.forEach(entryData => {
      const entry = new EncounterTableEntry(
        zoneId,
        entryData.spiritId,
        entryData.weight,
        entryData.minLevel,
        entryData.maxLevel
      );
      table.addEntry(entry);
    });
    return table;
  },

  /**
   * Create a tile-based trigger
   */
  createTileTrigger(zoneId: string, tileType: string): EncounterTrigger {
    return new EncounterTrigger(
      TriggerType.TILE_TYPE,
      { tile: tileType },
      zoneId
    );
  },

  /**
   * Create a time-based trigger
   */
  createTimeTrigger(zoneId: string, timeOfDay: string): EncounterTrigger {
    return new EncounterTrigger(
      TriggerType.TIME_OF_DAY,
      { time: timeOfDay },
      zoneId
    );
  },

  /**
   * Create a zone entry trigger
   */
  createZoneTrigger(zoneId: string): EncounterTrigger {
    return new EncounterTrigger(
      TriggerType.ZONE_ENTRY,
      {},
      zoneId
    );
  },

  /**
   * Calculate encounter chance based on steps
   */
  calculateEncounterChance(stepsSinceLast: number): number {
    return Math.max(0.04, Math.min(0.2, 0.04 + 0.003 * stepsSinceLast));
  },

  /**
   * Select random entry from weighted table
   */
  selectWeightedEntry<T>(entries: Array<{ item: T; weight: number }>, rng: IRNGProvider): T | null {
    if (entries.length === 0) return null;

    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) return null;

    const roll = rng.nextInt(0, totalWeight);
    let accumulatedWeight = 0;

    for (const entry of entries) {
      accumulatedWeight += entry.weight;
      if (roll < accumulatedWeight) {
        return entry.item;
      }
    }

    return null;
  },

  /**
   * Validate player state
   */
  validatePlayerState(state: IPlayerState): string[] {
    const errors: string[] = [];

    if (!state.zoneId || state.zoneId.trim() === '') {
      errors.push('Zone ID cannot be empty');
    }

    if (!state.tileType || state.tileType.trim() === '') {
      errors.push('Tile type cannot be empty');
    }

    if (!state.timeOfDay || state.timeOfDay.trim() === '') {
      errors.push('Time of day cannot be empty');
    }

    if (state.stepsSinceLastEncounter < 0) {
      errors.push('Steps since last encounter cannot be negative');
    }

    return errors;
  }
};

/**
 * Default encounter controller instance
 */
export const defaultEncounterController = new EncounterController();
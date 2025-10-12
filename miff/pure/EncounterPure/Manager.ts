/**
 * EncounterPure Manager - Encounter and Event System
 *
 * Advanced encounter management with:
 * - Random encounter generation
 * - Event triggering and management
 * - Probability calculations
 * - Encounter balancing
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
 */

// Enums
export enum TriggerType {
  ZONE_ENTRY = 'zone_entry',
  TILE_TYPE = 'tile_type',
  TIME_OF_DAY = 'time_of_day',
  PLAYER_LEVEL = 'player_level',
  RANDOM_CHANCE = 'random_chance'
}

// Interfaces
export interface IRNGProvider {
  nextInt(min: number, max: number): number;
  nextBool(probability: number): boolean;
}

export interface EncounterTableEntry {
  spiritId: string;
  name: string;
  level: number;
  weight: number;
  minLevel?: number;
  maxLevel?: number;
  conditions?: string[];
}

export interface EncounterTable {
  tableId: string;
  name: string;
  entries: EncounterTableEntry[];
  totalWeight: number;
}

export interface EncounterTrigger {
  triggerId: string;
  name: string;
  type: TriggerType;
  zone?: string;
  tileType?: string;
  timeOfDay?: string;
  minLevel?: number;
  maxLevel?: number;
  chance?: number;
  conditions?: Record<string, any>;
}

export interface PlayerState {
  currentZone: string;
  currentTileType: string;
  stepsSinceLastEncounter: number;
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  level: number;
  flags: Record<string, boolean>;
}

export interface EncounterResult {
  success: boolean;
  encounterId?: string;
  spiritId?: string;
  level?: number;
  message?: string;
  error?: string;
}

export interface EncounterConfig {
  baseEncounterRate: number;
  maxEncountersPerArea: number;
  enableRareEncounters: boolean;
  debugMode: boolean;
}

export interface Encounter {
  id: string;
  name: string;
  type: 'combat' | 'treasure' | 'event' | 'npc';
  probability: number;
  level: number;
  rewards: string[];
  requirements: string[];
  description: string;
}

export interface EncounterArea {
  id: string;
  name: string;
  encounters: Encounter[];
  baseLevel: number;
  maxLevel: number;
  encounterRate: number;
}

export class EncounterManager {
  private config: EncounterConfig;
  private areas: Map<string, EncounterArea> = new Map();
  private encounterHistory: string[] = [];
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<EncounterConfig> = {}) {
    this.config = {
      baseEncounterRate: 0.1,
      maxEncountersPerArea: 10,
      enableRareEncounters: true,
      debugMode: false,
      ...config
  
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'EncounterManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `EncounterManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'EncounterManager');
  };
  }

  /**
   * Initialize the encounter system
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.logger.info('EncounterManager', '[EncounterManager] Initializing encounter system...');
    
    // Initialize default areas
    this.initializeDefaultAreas();
    
    this.isInitialized = true;
    this.logger.info('EncounterManager', '[EncounterManager] Encounter system initialized successfully');
  }

  private initializeDefaultAreas(): void {
    const defaultAreas: EncounterArea[] = [
      {
        id: 'forest',
        name: 'Mystic Forest',
        encounters: [
          {
            id: 'forest_wolf',
            name: 'Forest Wolf',
            type: 'combat',
            probability: 0.4,
            level: 5,
            rewards: ['xp', 'wolf_fang'],
            requirements: [],
            description: 'A wild wolf appears!'
          },
          {
            id: 'forest_treasure',
            name: 'Hidden Treasure',
            type: 'treasure',
            probability: 0.1,
            level: 1,
            rewards: ['gold', 'potion'],
            requirements: [],
            description: 'You found a hidden treasure!'
          }
        ],
        baseLevel: 5,
        maxLevel: 10,
        encounterRate: 0.15
      },
      {
        id: 'cave',
        name: 'Dark Cave',
        encounters: [
          {
            id: 'cave_bat',
            name: 'Cave Bat',
            type: 'combat',
            probability: 0.6,
            level: 8,
            rewards: ['xp', 'bat_wing'],
            requirements: [],
            description: 'A bat swoops down!'
          }
        ],
        baseLevel: 8,
        maxLevel: 15,
        encounterRate: 0.2
      }
    ];

    for (const area of defaultAreas) {
      this.areas.set(area.id, area);
    }
  }

  /**
   * Add an encounter area
   */
  addArea(area: EncounterArea): boolean {
    if (!area.id || !area.name) {
      this.logger.error('EncounterManager', '[EncounterManager] Invalid area: missing required fields');
      return false;
    }

    this.areas.set(area.id, area);
    this.logger.info('EncounterManager', `[EncounterManager] Added area: ${area.name}`);
    return true;
  }

  /**
   * Get encounter area by ID
   */
  getArea(areaId: string): EncounterArea | undefined {
    return this.areas.get(areaId);
  }

  /**
   * Get all areas
   */
  getAreas(): EncounterArea[] {
    return Array.from(this.areas.values());
  }

  /**
   * Trigger a random encounter in an area
   */
  triggerEncounter(areaId: string, playerLevel: number = 1): Encounter | null {
    const area = this.areas.get(areaId);
    if (!area) {
      this.logger.warn('EncounterManager', `[EncounterManager] Area not found: ${areaId}`);
      return null;
    }

    // Check if encounter should trigger
    const roll = Math.random();
    if (roll > area.encounterRate) {
      return null;
    }

    // Filter encounters by level and requirements
    const availableEncounters = area.encounters.filter(encounter => {
      return encounter.level <= playerLevel + 5 && 
             encounter.level >= playerLevel - 2;
    });

    if (availableEncounters.length === 0) {
      return null;
    }

    // Select encounter based on probability
    const totalProbability = availableEncounters.reduce((sum, enc) => sum + enc.probability, 0);
    let random = Math.random() * totalProbability;

    for (const encounter of availableEncounters) {
      random -= encounter.probability;
      if (random <= 0) {
        this.encounterHistory.push(encounter.id);
        return encounter;
      }
    }

    return null;
  }

  /**
   * Get encounter history
   */
  getEncounterHistory(): string[] {
    return [...this.encounterHistory];
  }

  /**
   * Clear encounter history
   */
  clearHistory(): void {
    this.encounterHistory = [];
  }

  /**
   * Get encounter statistics
   */
  getStatistics(): Record<string, any> {
    const totalEncounters = this.encounterHistory.length;
    const encounterCounts = this.encounterHistory.reduce((counts, id) => {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalEncounters,
      encounterCounts,
      areasCount: this.areas.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Reset the encounter system
   */
  reset(): void {
    this.areas.clear();
    this.encounterHistory = [];
    this.isInitialized = false;
    this.logger.info('EncounterManager', '[EncounterManager] Encounter system reset');
  }

  /**
   * Dispose of the encounter system
   */
  dispose(): void {
    this.reset();
    this.logger.info('EncounterManager', '[EncounterManager] Encounter system disposed');
  }
}

/**
 * EncounterController - Main controller for encounter system
 */
export class EncounterController {
  private manager: EncounterManager;
  private rng: IRNGProvider;

  constructor(rng?: IRNGProvider) {
    this.manager = new EncounterManager();
    this.rng = rng || {
      nextInt: (min, max) => Math.floor(Math.random() * (max - min)) + min,
      nextBool: (probability) => Math.random() < probability
    };
  }

  /**
   * Initialize the encounter system
   */
  initialize(): void {
    this.manager.initialize();
  }

  /**
   * Process an encounter attempt
   */
  processEncounter(playerState: PlayerState): EncounterResult {
    this.manager.initialize();

    const area = this.manager.getArea(playerState.currentZone);
    if (!area) {
      return EncounterResult.failure(`Area not found: ${playerState.currentZone}`);
    }

    const encounter = this.manager.triggerEncounter(playerState.currentZone, playerState.level);
    if (!encounter) {
      return EncounterResult.failure('No encounter triggered');
    }

    return new EncounterResult(true, encounter.id, encounter.id, encounter.level, encounter.description);
  }

  /**
   * Get all available areas
   */
  getAreas(): any[] {
    return this.manager.getAreas();
  }

  /**
   * Get statistics
   */
  getStatistics(): Record<string, any> {
    return this.manager.getStatistics();
  }

  /**
   * Reset the system
   */
  reset(): void {
    this.manager.reset();
  }
}

/**
 * EncounterTable implementation
 */
export class EncounterTable {
  constructor(
    public tableId: string = '',
    public name: string = '',
    public entries: EncounterTableEntry[] = []
  ) {
    this.calculateTotalWeight();
  }

  private calculateTotalWeight(): void {
    this.totalWeight = this.entries.reduce((sum, entry) => sum + entry.weight, 0);
  }

  addEntry(entry: EncounterTableEntry): boolean {
    if (!entry.spiritId || entry.spiritId.trim() === '') {
      this.logger.warn('EncounterManager', 'Invalid entry: Spirit ID cannot be empty');
      return false;
    }

    if (entry.weight < 0) {
      this.logger.warn('EncounterManager', 'Invalid entry: Weight cannot be negative');
      return false;
    }

    this.entries.push(entry);
    this.calculateTotalWeight();
    return true;
  }

  removeEntry(spiritId: string): boolean {
    const index = this.entries.findIndex(entry => entry.spiritId === spiritId);
    if (index === -1) return false;

    this.entries.splice(index, 1);
    this.calculateTotalWeight();
    return true;
  }

  getEntriesForLevel(level: number): EncounterTableEntry[] {
    return this.entries.filter(entry => {
      const minLevel = entry.minLevel || 1;
      const maxLevel = entry.maxLevel || 100;
      return level >= minLevel && level <= maxLevel;
    });
  }

  sortByWeight(): void {
    this.entries.sort((a, b) => b.weight - a.weight);
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.tableId || this.tableId.trim() === '') {
      errors.push('Table ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Table name cannot be empty');
    }

    if (this.entries.length === 0) {
      errors.push('Table must have at least one entry');
    }

    return errors;
  }

  clone(): EncounterTable {
    return new EncounterTable(
      this.tableId,
      this.name,
      [...this.entries]
    );
  }
}

/**
 * EncounterTrigger implementation
 */
export class EncounterTrigger {
  constructor(
    public triggerId: string = '',
    public name: string = '',
    public type: TriggerType = TriggerType.ZONE_ENTRY,
    public zone?: string,
    public tileType?: string,
    public timeOfDay?: string,
    public minLevel?: number,
    public maxLevel?: number,
    public chance?: number
  ) {}

  matchesZone(zone: string): boolean {
    return this.type === TriggerType.ZONE_ENTRY && this.zone === zone;
  }

  matchesTileType(tileType: string): boolean {
    return this.type === TriggerType.TILE_TYPE && this.tileType === tileType;
  }

  matchesTimeOfDay(timeOfDay: string): boolean {
    return this.type === TriggerType.TIME_OF_DAY && this.timeOfDay === timeOfDay;
  }

  matchesLevel(level: number): boolean {
    if (!this.minLevel && !this.maxLevel) return true;
    const min = this.minLevel || 1;
    const max = this.maxLevel || 100;
    return level >= min && level <= max;
  }

  matches(playerState: PlayerState): boolean {
    switch (this.type) {
      case TriggerType.ZONE_ENTRY:
        return this.matchesZone(playerState.currentZone);
      case TriggerType.TILE_TYPE:
        return this.matchesTileType(playerState.currentTileType);
      case TriggerType.TIME_OF_DAY:
        return this.matchesTimeOfDay(playerState.timeOfDay);
      case TriggerType.PLAYER_LEVEL:
        return this.matchesLevel(playerState.level);
      case TriggerType.RANDOM_CHANCE:
        return Math.random() < (this.chance || 0.1);
      default:
        return false;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.triggerId || this.triggerId.trim() === '') {
      errors.push('Trigger ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Trigger name cannot be empty');
    }

    return errors;
  }

  clone(): EncounterTrigger {
    return new EncounterTrigger(
      this.triggerId,
      this.name,
      this.type,
      this.zone,
      this.tileType,
      this.timeOfDay,
      this.minLevel,
      this.maxLevel,
      this.chance
    );
  }
}

/**
 * PlayerState implementation
 */
export class PlayerState {
  constructor(
    public currentZone: string = 'default',
    public currentTileType: string = 'grass',
    public stepsSinceLastEncounter: number = 0,
    public timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' = 'morning',
    public level: number = 1,
    public flags: Record<string, boolean> = {}
  ) {}

  incrementSteps(): void {
    this.stepsSinceLastEncounter++;
  }

  resetSteps(): void {
    this.stepsSinceLastEncounter = 0;
  }

  setFlag(flag: string, value: boolean = true): void {
    this.flags[flag] = value;
  }

  hasFlag(flag: string): boolean {
    return this.flags[flag] || false;
  }

  clone(): PlayerState {
    return new PlayerState(
      this.currentZone,
      this.currentTileType,
      this.stepsSinceLastEncounter,
      this.timeOfDay,
      this.level,
      { ...this.flags }
    );
  }
}

/**
 * EncounterResult implementation
 */
export class EncounterResult {
  constructor(
    public success: boolean = false,
    public encounterId?: string,
    public spiritId?: string,
    public level?: number,
    public message?: string,
    public error?: string
  ) {}

  static success(spiritId: string, level: number, message: string = 'Encounter triggered!'): EncounterResult {
    return new EncounterResult(true, undefined, spiritId, level, message);
  }

  static failure(error: string = 'No encounter triggered'): EncounterResult {
    return new EncounterResult(false, undefined, undefined, undefined, undefined, error);
  }

  static custom(success: boolean, message: string, data?: any): EncounterResult {
    return new EncounterResult(success, data?.encounterId, data?.spiritId, data?.level, message, data?.error);
  }

  clone(): EncounterResult {
    return new EncounterResult(
      this.success,
      this.encounterId,
      this.spiritId,
      this.level,
      this.message,
      this.error
    );
  }
}

/**
 * EncounterUtils - Utility functions
 */
export class EncounterUtils {
  /**
   * Create a standard encounter table
   */
  static createStandardTable(): EncounterTable {
    const table = new EncounterTable('standard', 'Standard Encounters');

    table.addEntry({
      spiritId: 'fire_spirit',
      name: 'Fire Spirit',
      level: 5,
      weight: 100
    });

    table.addEntry({
      spiritId: 'water_spirit',
      name: 'Water Spirit',
      level: 5,
      weight: 100
    });

    return table;
  }

  /**
   * Create a tile-based trigger
   */
  static createTileTrigger(tileType: string, zone: string): EncounterTrigger {
    return new EncounterTrigger(
      `tile_${tileType}_${zone}`,
      `Tile Trigger: ${tileType}`,
      TriggerType.TILE_TYPE,
      zone,
      tileType
    );
  }

  /**
   * Create a time-based trigger
   */
  static createTimeTrigger(timeOfDay: string): EncounterTrigger {
    return new EncounterTrigger(
      `time_${timeOfDay}`,
      `Time Trigger: ${timeOfDay}`,
      TriggerType.TIME_OF_DAY,
      undefined,
      undefined,
      timeOfDay
    );
  }

  /**
   * Create a zone-based trigger
   */
  static createZoneTrigger(zone: string): EncounterTrigger {
    return new EncounterTrigger(
      `zone_${zone}`,
      `Zone Trigger: ${zone}`,
      TriggerType.ZONE_ENTRY,
      zone
    );
  }

  /**
   * Calculate encounter chance based on various factors
   */
  static calculateEncounterChance(
    baseRate: number,
    stepsSinceLast: number,
    areaMultiplier: number = 1.0,
    playerLevel: number = 1
  ): number {
    const stepMultiplier = Math.min(1.0, stepsSinceLast / 100);
    const levelAdjustment = Math.max(0.5, 1.0 - (playerLevel * 0.01));
    return Math.min(1.0, baseRate * stepMultiplier * areaMultiplier * levelAdjustment);
  }

  /**
   * Validate player state
   */
  static validatePlayerState(state: PlayerState): string[] {
    const errors: string[] = [];

    if (!state.currentZone || state.currentZone.trim() === '') {
      errors.push('Current zone cannot be empty');
    }

    if (!state.currentTileType || state.currentTileType.trim() === '') {
      errors.push('Current tile type cannot be empty');
    }

    if (state.stepsSinceLastEncounter < 0) {
      errors.push('Steps since last encounter cannot be negative');
    }

    if (state.level < 1) {
      errors.push('Player level must be at least 1');
    }

    return errors;
  }

  /**
   * Create default player state
   */
  static createDefaultPlayerState(): PlayerState {
    return new PlayerState();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.logger.info('EncounterManager', 'Destroying manager', {
      itemsCount: this.items.size
    });
    
    this.items.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
    
    // Unregister from memory manager
    MemoryManager.unregisterObject(this.memoryId);
    
    // Destroy logger
    this.logger.destroy();
  }
}

export default EncounterManager;
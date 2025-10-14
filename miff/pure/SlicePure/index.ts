import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * SlicePure - Overworld Battle Vertical Slice
 *
 * A comprehensive vertical slice demonstration showing a complete game loop:
 * overworld encounter generation → battle execution → logging and output.
 * This tool demonstrates how all the MIFF modules work together in practice.
 *
 * @module SlicePure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Action source enumeration
 */
export enum ActionSource {
  PLAYER = 'player',
  AI = 'ai',
  ENVIRONMENT = 'environment',
  SYSTEM = 'system'
}

/**
 * Move category enumeration
 */
export enum MoveCategory {
  PHYSICAL = 'physical',
  SPECIAL = 'special',
  STATUS = 'status'
}

/**
 * Trigger type enumeration
 */
export enum TriggerType {
  TILE_TYPE = 'tile_type',
  STEP_COUNT = 'step_count',
  TIME_BASED = 'time_based',
  RANDOM = 'random',
  ZONE_ENTRY = 'zone_entry'
}

/**
 * Time of day enumeration
 */
export enum TimeOfDay {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night'
}

/**
 * Player state interface
 */
export interface IPlayerState {
  zoneId: string;
  tileType: string;
  timeOfDay: TimeOfDay;
  stepsSinceLastEncounter: number;
  position: { x: number; y: number };
  weather: string;
  [key: string]: any;
}

/**
 * Encounter table entry interface
 */
export interface IEncounterTableEntry {
  zoneId: string;
  spiritId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
  conditions?: Record<string, any>;
  validate(): string[];
}

/**
 * Encounter table interface
 */
export interface IEncounterTable {
  zoneId: string;
  entries: IEncounterTableEntry[];
  totalWeight: number;
  validate(): string[];
  getRandomEntry(rng: IRNGProvider): IEncounterTableEntry | null;
}

/**
 * Encounter trigger interface
 */
export interface IEncounterTrigger {
  zoneId: string;
  triggerType: TriggerType;
  triggerParams: Record<string, any>;
  shouldTrigger(state: IPlayerState, rng: IRNGProvider): boolean;
  validate(): string[];
}

/**
 * Encounter result interface
 */
export interface IEncounterResult {
  triggered: boolean;
  zoneId?: string;
  spiritId?: string;
  level?: number;
  tableEntry?: IEncounterTableEntry;
  stepsUntilNext?: number;
}

/**
 * Encounter controller interface
 */
export interface IEncounterController {
  registerTable(table: IEncounterTable): void;
  registerTrigger(trigger: IEncounterTrigger): void;
  checkForEncounter(state: IPlayerState, rng: IRNGProvider): IEncounterResult;
  getEncounterRate(zoneId: string, state: IPlayerState): number;
  getAvailableSpirits(zoneId: string): string[];
  clearTables(): void;
  clearTriggers(): void;
}

/**
 * Spirit instance interface
 */
export interface ISpiritInstance {
  id: number;
  spiritId: string;
  name: string;
  typeTag: string;
  level: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  maxHp: number;
  currentHp: number;
  statusEffects: string[];
  isPlayerControlled: boolean;
  isAlive(): boolean;
  takeDamage(damage: number): number;
  heal(amount: number): number;
  addStatusEffect(effect: string): void;
  removeStatusEffect(effect: string): boolean;
  hasStatusEffect(effect: string): boolean;
  getEffectiveAttack(): number;
  getEffectiveDefense(): number;
  getEffectiveSpecialAttack(): number;
  getEffectiveSpecialDefense(): number;
  clone(): ISpiritInstance;
  toJSON(): Record<string, any>;
}

/**
 * Move data interface
 */
export interface IMoveData {
  moveId: string;
  name: string;
  description: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
  priority: number;
  statusEffectId?: string;
  effects: string[];
  target: 'single' | 'multiple' | 'all' | 'self' | 'field';
  contact: boolean;
  soundBased: boolean;
  punchBased: boolean;
  snatchable: boolean;
  gravityAffected: boolean;
  defrostsTarget: boolean;
  bites: boolean;
  pulses: boolean;
  ballistic: boolean;
  dance: boolean;
  wind: boolean;
  validate(): string[];
}

/**
 * Battle action interface
 */
export interface IBattleAction {
  actorId: number;
  targetId: number;
  moveId: string;
  priority: number;
  speed: number;
  source: ActionSource;
  metadata?: Record<string, any>;
  validate(): string[];
}

/**
 * Battle result interface
 */
export interface IBattleResult {
  success: boolean;
  damage: number;
  statusApplied?: string;
  criticalHit: boolean;
  effectiveness: number;
  messages: string[];
  metadata?: Record<string, any>;
}

/**
 * Battle phase enumeration
 */
export enum BattlePhase {
  START = 'start',
  SELECT_ACTION = 'select_action',
  EXECUTE_ACTION = 'execute_action',
  END_TURN = 'end_turn',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  FLEE = 'flee'
}

/**
 * Battle state interface
 */
export interface IBattleState {
  spirits: Map<number, ISpiritInstance>;
  currentTurn: number;
  phase: BattlePhase;
  weather: string;
  terrain: string;
  turnOrder: number[];
  actionQueue: IBattleAction[];
  log: IBattleLogEntry[];
  metadata: Record<string, any>;
  isComplete(): boolean;
  getWinner(): number | null;
  getLoser(): number | null;
  validate(): string[];
}

/**
 * Battle log entry interface
 */
export interface IBattleLogEntry {
  timestamp: Date;
  phase: BattlePhase;
  actorId?: number;
  targetId?: number;
  action?: string;
  result?: string;
  damage?: number;
  statusApplied?: string;
  metadata?: Record<string, any>;
  format(): string;
}

/**
 * RNG provider interface
 */
export interface IRNGProvider {
  nextInt(min?: number, max?: number): number;
  nextFloat(min?: number, max?: number): number;
  nextBoolean(chance?: number): boolean;
  shuffle<T>(array: T[]): T[];
  choose<T>(array: T[]): T;
  seed: number;
}

/**
 * Type effectiveness interface
 */
export interface ITypeEffectiveness {
  getMultiplier(attackingType: string, defendingType: string): number;
  isSuperEffective(attackingType: string, defendingType: string): boolean;
  isNotVeryEffective(attackingType: string, defendingType: string): boolean;
  isNeutral(attackingType: string, defendingType: string): boolean;
  isImmune(attackingType: string, defendingType: string): boolean;
  getEffectivenessDescription(attackingType: string, defendingType: string): string;
}

/**
 * Damage calculator interface
 */
export interface IDamageCalculator {
  calculateDamage(attacker: ISpiritInstance, target: ISpiritInstance, move: IMoveData, effectiveness?: number): IBattleResult;
  calculateCriticalHit(attacker: ISpiritInstance, move: IMoveData): boolean;
  calculateHitChance(attacker: ISpiritInstance, target: ISpiritInstance, move: IMoveData): boolean;
  applyDamage(target: ISpiritInstance, damage: number): IBattleResult;
  applyStatusEffect(target: ISpiritInstance, statusEffectId: string): IBattleResult;
}

/**
 * Battle logger interface
 */
export interface IBattleLogger {
  logPhaseChange(phase: BattlePhase): void;
  logAction(action: IBattleAction, result: IBattleResult): void;
  logDamage(actorId: number, targetId: number, damage: number, critical: boolean): void;
  logStatusApplied(actorId: number, targetId: number, statusEffect: string): void;
  logSpiritDefeated(spiritId: number): void;
  logBattleEnd(winner: number): void;
  getLog(): IBattleLogEntry[];
  exportLog(format: 'json' | 'text'): string;
  clearLog(): void;
}

/**
 * Battle loop controller interface
 */
export interface IBattleLoopController {
  executeTurn(
    seed: number,
    actionSelector: () => IBattleAction[],
    spiritProvider: (id: number) => ISpiritInstance | null,
    moveProvider: (id: string) => IMoveData | null,
    damageCalculator: IDamageCalculator
  ): IBattleResult;
  validateBattleState(): string[];
  getCurrentState(): IBattleState;
  resetBattle(): void;
}

/**
 * Player state implementation
 */
export class PlayerState implements IPlayerState {
  public zoneId: string;
  public tileType: string;
  public timeOfDay: TimeOfDay;
  public stepsSinceLastEncounter: number;
  public position: { x: number; y: number };
  public weather: string;

  constructor(
    zoneId: string = 'newhaven',
    tileType: string = 'grass',
    timeOfDay: TimeOfDay = TimeOfDay.DAY,
    stepsSinceLastEncounter: number = 0,
    position: { x: number; y: number } = { x: 0, y: 0 },
    weather: string = 'clear'
  ) {
    this.zoneId = zoneId;
    this.tileType = tileType;
    this.timeOfDay = timeOfDay;
    this.stepsSinceLastEncounter = stepsSinceLastEncounter;
    this.position = { ...position };
    this.weather = weather;
  }

  /**
   * Create player state
   */
  static create(
    zoneId?: string,
    tileType?: string,
    timeOfDay?: TimeOfDay,
    stepsSinceLastEncounter?: number,
    position?: { x: number; y: number },
    weather?: string
  ): PlayerState {
    return new PlayerState(zoneId, tileType, timeOfDay, stepsSinceLastEncounter, position, weather);
  }

  /**
   * Move player to new position
   */
  moveTo(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.stepsSinceLastEncounter++;
  }

  /**
   * Set time of day
   */
  setTimeOfDay(timeOfDay: TimeOfDay): void {
    this.timeOfDay = timeOfDay;
  }

  /**
   * Set weather
   */
  setWeather(weather: string): void {
    this.weather = weather;
  }

  /**
   * Reset encounter counter
   */
  resetEncounterCounter(): void {
    this.stepsSinceLastEncounter = 0;
  }

  /**
   * Get current time of day
   */
  getCurrentTimeOfDay(): TimeOfDay {
    return this.timeOfDay;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      zoneId: this.zoneId,
      tileType: this.tileType,
      timeOfDay: this.timeOfDay,
      stepsSinceLastEncounter: this.stepsSinceLastEncounter,
      position: this.position,
      weather: this.weather
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): PlayerState {
    return new PlayerState(
      data['zoneId'] || 'newhaven',
      data['tileType'] || 'grass',
      data['timeOfDay'] || TimeOfDay.DAY,
      data['stepsSinceLastEncounter'] || 0,
      data['position'] || { x: 0, y: 0 },
      data['weather'] || 'clear'
    );
  }

  /**
   * Clone player state
   */
  clone(): PlayerState {
    return PlayerState.fromJSON(this.toJSON());
  }
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
  public conditions?: Record<string, any>;

  constructor(
    zoneId: string,
    spiritId: string,
    weight: number = 1,
    minLevel: number = 1,
    maxLevel: number = 100,
    conditions?: Record<string, any>
  ) {
    this.zoneId = zoneId;
    this.spiritId = spiritId;
    this.weight = weight;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.conditions = conditions;
  }

  /**
   * Create encounter table entry
   */
  static create(
    zoneId: string,
    spiritId: string,
    weight?: number,
    minLevel?: number,
    maxLevel?: number,
    conditions?: Record<string, any>
  ): EncounterTableEntry {
    return new EncounterTableEntry(zoneId, spiritId, weight, minLevel, maxLevel, conditions);
  }

  /**
   * Validate entry
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID is required');
    }

    if (!this.spiritId || this.spiritId.trim() === '') {
      errors.push('Spirit ID is required');
    }

    if (this.weight <= 0) {
      errors.push('Weight must be positive');
    }

    if (this.minLevel < 1 || this.minLevel > 100) {
      errors.push('Min level must be between 1 and 100');
    }

    if (this.maxLevel < 1 || this.maxLevel > 100) {
      errors.push('Max level must be between 1 and 100');
    }

    if (this.minLevel > this.maxLevel) {
      errors.push('Min level cannot be greater than max level');
    }

    return errors;
  }

  /**
   * Get level range description
   */
  getLevelRangeDescription(): string {
    return `${this.minLevel}-${this.maxLevel}`;
  }

  /**
   * Check if level is in range
   */
  isLevelInRange(): boolean {
    return level >= this.minLevel && level <= this.maxLevel;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      zoneId: this.zoneId,
      spiritId: this.spiritId,
      weight: this.weight,
      minLevel: this.minLevel,
      maxLevel: this.maxLevel,
      conditions: this.conditions
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): EncounterTableEntry {
    return new EncounterTableEntry(
      data.zoneId,
      data.spiritId,
      data.weight,
      data.minLevel,
      data.maxLevel,
      data.conditions
    );
  }

  /**
   * Clone entry
   */
  clone(): EncounterTableEntry {
    return EncounterTableEntry.fromJSON(this.toJSON());
  }
}

/**
 * Encounter table implementation
 */
export class EncounterTable implements IEncounterTable {
  public zoneId: string;
  public entries: IEncounterTableEntry[];
  public totalWeight: number;

  constructor(zoneId: string, entries: IEncounterTableEntry[] = []) {
    this.zoneId = zoneId;
    this.entries = [...entries];
    this.totalWeight = this.calculateTotalWeight();
  }

  /**
   * Create encounter table
   */
  static create(zoneId: string, entries?: IEncounterTableEntry[]): EncounterTable {
    return new EncounterTable(zoneId, entries);
  }

  /**
   * Add entry
   */
  addEntry(): void {
    this.entries.push(entry);
    this.totalWeight = this.calculateTotalWeight();
  }

  /**
   * Remove entry
   */
  removeEntry(): boolean {
    const index = this.entries.findIndex(entry => entry.spiritId === spiritId);
    if (index >= 0) {
      this.entries.splice(index, 1);
      this.totalWeight = this.calculateTotalWeight();
      return true;
    }
    return false;
  }

  /**
   * Get random entry
   */
  getRandomEntry(rng: IRNGProvider): IEncounterTableEntry | null {
    if (this.entries.length === 0) return null;

    const roll = rng.nextInt(1, this.totalWeight);
    let currentWeight = 0;

    for (const entry of this.entries) {
      currentWeight += entry.weight;
      if (roll <= currentWeight) {
        return entry;
      }
    }

    return this.entries[this.entries.length - 1]; // Fallback
  }

  /**
   * Calculate total weight
   */
  private calculateTotalWeight(): number {
    return this.entries.reduce((sum, entry) => sum + entry.weight, 0);
  }

  /**
   * Validate table
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID is required');
    }

    if (this.entries.length === 0) {
      errors.push('Encounter table must have at least one entry');
    }

    this.entries.forEach((entry, index) => {
      const entryErrors = entry.validate();
      if (entryErrors.length > 0) {
        errors.push(`Entry ${index} (${entry.spiritId}): ${entryErrors.join(', ')}`);
      }
    });

    return errors;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      zoneId: this.zoneId,
      entries: this.entries.map(entry => (entry as EncounterTableEntry).toJSON()),
      totalWeight: this.totalWeight
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): EncounterTable {
    const entries = Array.isArray(data.entries) ? data.entries.map((entryData: any) => EncounterTableEntry.fromJSON(entryData)) : [];
    const table = new EncounterTable(data.zoneId, entries);
    table.totalWeight = data.totalWeight || 0;
    return table;
  }

  /**
   * Clone table
   */
  clone(): EncounterTable {
    return EncounterTable.fromJSON(this.toJSON());
  }
}

/**
 * Encounter trigger implementation
 */
export class EncounterTrigger implements IEncounterTrigger {
  public zoneId: string;
  public triggerType: TriggerType;
  public triggerParams: Record<string, any>;

  constructor(
    zoneId: string,
    triggerType: TriggerType,
    triggerParams: Record<string, any> = {}
  ) {
    this.zoneId = zoneId;
    this.triggerType = triggerType;
    this.triggerParams = { ...triggerParams };
  }

  /**
   * Create encounter trigger
   */
  static create(
    zoneId: string,
    triggerType: TriggerType,
    triggerParams?: Record<string, any>
  ): EncounterTrigger {
    return new EncounterTrigger(zoneId, triggerType, triggerParams);
  }

  /**
   * Create tile type trigger
   */
  static tileType(zoneId: string, tileType: string): EncounterTrigger {
    return new EncounterTrigger(zoneId, TriggerType.TILE_TYPE, { tile: tileType });
  }

  /**
   * Create step count trigger
   */
  static stepCount(zoneId: string, stepInterval: number): EncounterTrigger {
    return new EncounterTrigger(zoneId, TriggerType.STEP_COUNT, { interval: stepInterval });
  }

  /**
   * Create time-based trigger
   */
  static timeBased(zoneId: string, timeOfDay: TimeOfDay): EncounterTrigger {
    return new EncounterTrigger(zoneId, TriggerType.TIME_BASED, { timeOfDay });
  }

  /**
   * Create random trigger
   */
  static random(zoneId: string, probability: number): EncounterTrigger {
    return new EncounterTrigger(zoneId, TriggerType.RANDOM, { probability });
  }

  /**
   * Should trigger based on state and RNG
   */
  shouldTrigger(): boolean {
    switch (this.triggerType) {
      case TriggerType.TILE_TYPE:
        return state.tileType === this.triggerParams.tile;

      case TriggerType.STEP_COUNT:
        const interval = this.triggerParams.interval || 10;
        return state.stepsSinceLastEncounter >= interval;

      case TriggerType.TIME_BASED:
        return state.timeOfDay === this.triggerParams.timeOfDay;

      case TriggerType.RANDOM:
        const probability = this.triggerParams.probability || 0.1;
        return rng.nextFloat() < probability;

      case TriggerType.ZONE_ENTRY:
        return true; // Always trigger on zone entry

      default:
        return false;
    }
  }

  /**
   * Validate trigger
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID is required');
    }

    switch (this.triggerType) {
      case TriggerType.TILE_TYPE:
        if (!this.triggerParams.tile) {
          errors.push('Tile type trigger requires tile parameter');
        }
        break;

      case TriggerType.STEP_COUNT:
        if (!this.triggerParams.interval || this.triggerParams.interval <= 0) {
          errors.push('Step count trigger requires positive interval');
        }
        break;

      case TriggerType.TIME_BASED:
        if (!this.triggerParams.timeOfDay) {
          errors.push('Time-based trigger requires timeOfDay parameter');
        }
        break;

      case TriggerType.RANDOM:
        if (this.triggerParams.probability === undefined || this.triggerParams.probability < 0 || this.triggerParams.probability > 1) {
          errors.push('Random trigger requires probability between 0 and 1');
        }
        break;
    }

    return errors;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      zoneId: this.zoneId,
      triggerType: this.triggerType,
      triggerParams: this.triggerParams
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): EncounterTrigger {
    return new EncounterTrigger(
      data.zoneId,
      data.triggerType,
      data.triggerParams
    );
  }

  /**
   * Clone trigger
   */
  clone(): EncounterTrigger {
    return EncounterTrigger.fromJSON(this.toJSON());
  }
}

/**
 * Encounter result implementation
 */
export class EncounterResult implements IEncounterResult {
  public triggered: boolean;
  public zoneId?: string;
  public spiritId?: string;
  public level?: number;
  public tableEntry?: IEncounterTableEntry;
  public stepsUntilNext?: number;

  constructor(
    triggered: boolean,
    zoneId?: string,
    spiritId?: string,
    level?: number,
    tableEntry?: IEncounterTableEntry,
    stepsUntilNext?: number
  ) {
    this.triggered = triggered;
    this.zoneId = zoneId;
    this.spiritId = spiritId;
    this.level = level;
    this.tableEntry = tableEntry;
    this.stepsUntilNext = stepsUntilNext;
  }

  /**
   * Create triggered encounter
   */
  static triggered(
    zoneId: string,
    spiritId: string,
    level: number,
    tableEntry: IEncounterTableEntry,
    stepsUntilNext?: number
  ): EncounterResult {
    return new EncounterResult(true, zoneId, spiritId, level, tableEntry, stepsUntilNext);
  }

  /**
   * Create non-triggered encounter
   */
  static notTriggered(stepsUntilNext?: number): EncounterResult {
    return new EncounterResult(false, undefined, undefined, undefined, undefined, stepsUntilNext);
  }

  /**
   * Get encounter description
   */
  getDescription(): string {
    if (!this.triggered) {
      return 'No encounter';
    }

    return `Encounter with ${this.spiritId} (Level ${this.level}) in ${this.zoneId}`;
  }
}

/**
 * RNG provider implementation
 */
export class RNGProvider implements IRNGProvider {
  public seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Create RNG provider
   */
  static create(seed?: number): RNGProvider {
    return new RNGProvider(seed);
  }

  /**
   * Generate next integer
   */
  nextInt(): number {
    // Simple LCG (Linear Congruential Generator)
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rnd = this.seed / 233280;
    return Math.floor(rnd * (max - min + 1)) + min;
  }

  /**
   * Generate next float
   */
  nextFloat(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rnd = this.seed / 233280;
    return rnd * (max - min) + min;
  }

  /**
   * Generate boolean
   */
  nextBoolean(): boolean {
    return this.nextFloat() < chance;
  }

  /**
   * Shuffle array
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Choose random element from array
   */
  choose<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * Type effectiveness implementation
 */
export class TypeEffectiveness implements ITypeEffectiveness {
  private effectivenessMap: Map<string, Map<string, number>>;

  constructor() {
    this.effectivenessMap = this.initializeEffectivenessMap();
  }

  /**
   * Create type effectiveness
   */
  static create(): TypeEffectiveness {
    return new TypeEffectiveness();
  }

  /**
   * Initialize effectiveness map
   */
  private initializeEffectivenessMap(): Map<string, Map<string, number>> {
    const map = new Map<string, Map<string, number>>();

    // Fire type effectiveness
    const fire = new Map<string, number>();
    fire.set('grass', 2.0); // Super effective
    fire.set('water', 0.5); // Not very effective
    fire.set('fire', 0.5);  // Not very effective
    map.set('fire', fire);

    // Water type effectiveness
    const water = new Map<string, number>();
    water.set('fire', 2.0);   // Super effective
    water.set('grass', 0.5);  // Not very effective
    water.set('water', 0.5);  // Not very effective
    map.set('water', water);

    // Grass type effectiveness
    const grass = new Map<string, number>();
    grass.set('water', 2.0);  // Super effective
    grass.set('fire', 0.5);   // Not very effective
    grass.set('grass', 0.5);  // Not very effective
    map.set('grass', grass);

    // Electric type effectiveness
    const electric = new Map<string, number>();
    electric.set('water', 2.0); // Super effective
    electric.set('ground', 0.0); // No effect
    map.set('electric', electric);

    // Psychic type effectiveness
    const psychic = new Map<string, number>();
    psychic.set('fighting', 2.0); // Super effective
    psychic.set('poison', 2.0);   // Super effective
    psychic.set('psychic', 0.5);  // Not very effective
    map.set('psychic', psychic);

    // Ice type effectiveness
    const ice = new Map<string, number>();
    ice.set('grass', 2.0);  // Super effective
    ice.set('fire', 0.5);   // Not very effective
    ice.set('water', 0.5);  // Not very effective
    ice.set('ice', 0.5);    // Not very effective
    map.set('ice', ice);

    // Dragon type effectiveness
    const dragon = new Map<string, number>();
    dragon.set('dragon', 2.0); // Super effective
    map.set('dragon', dragon);

    // Dark type effectiveness
    const dark = new Map<string, number>();
    dark.set('psychic', 2.0); // Super effective
    dark.set('ghost', 2.0);   // Super effective
    dark.set('dark', 0.5);    // Not very effective
    map.set('dark', dark);

    // Fairy type effectiveness
    const fairy = new Map<string, number>();
    fairy.set('fighting', 2.0); // Super effective
    fairy.set('dragon', 2.0);   // Super effective
    fairy.set('poison', 0.5);   // Not very effective
    map.set('fairy', fairy);

    // Add default effectiveness for types not explicitly defined
    for (const type of ['normal', 'fighting', 'poison', 'ground', 'flying', 'bug', 'rock', 'ghost', 'steel', 'neutral']) {
      if (!map.has(type)) {
        map.set(type, new Map());
      }
    }

    return map;
  }

  /**
   * Get effectiveness multiplier
   */
  getMultiplier(): number {
    const typeMap = this.effectivenessMap.get(attackingType);
    if (typeMap) {
      return typeMap.get(defendingType) ?? 1.0;
    }
    return 1.0; // Neutral effectiveness
  }

  /**
   * Check if super effective
   */
  isSuperEffective(): boolean {
    return this.getMultiplier(attackingType, defendingType) > 1.0;
  }

  /**
   * Check if not very effective
   */
  isNotVeryEffective(): boolean {
    return this.getMultiplier(attackingType, defendingType) < 1.0 && this.getMultiplier(attackingType, defendingType) > 0.0;
  }

  /**
   * Check if neutral
   */
  isNeutral(): boolean {
    return this.getMultiplier(attackingType, defendingType) === 1.0;
  }

  /**
   * Check if immune
   */
  isImmune(): boolean {
    return this.getMultiplier(attackingType, defendingType) === 0.0;
  }

  /**
   * Get effectiveness description
   */
  getEffectivenessDescription(): string {
    const multiplier = this.getMultiplier(attackingType, defendingType);

    if (multiplier === 0.0) return 'No effect';
    if (multiplier === 0.5) return 'Not very effective';
    if (multiplier === 1.0) return 'Neutral';
    if (multiplier === 2.0) return 'Super effective';
    return `${multiplier}x effectiveness`;
  }
}

/**
 * Overworld battle slice tool - Main demonstration class
 */
export class OverworldBattleSliceTool {
  /**
   * Main demonstration method
   */
  static main(seed?: number): void {
    const rngSeed = seed ?? 12345;
    const rng = new RNGProvider(rngSeed);

    console.info(`🌱 Seed=${rngSeed} | Starting overworld battle slice demonstration...`);
    console.info('='.repeat(80));

    // 1) Setup Encounter table and triggers for Newhaven
    const encounterController = this.setupEncounterSystem();

    const playerState = new PlayerState('newhaven', 'grass', TimeOfDay.DAY, 0, { x: 0, y: 0 }, 'clear');

    console.info(`🗺️ Roaming in ${playerState.zoneId} on ${playerState.tileType} tiles...`);

    // 2) Roam until encounter
    const encounterResult = this.roamUntilEncounter(encounterController, playerState, rng, 50);

    if (!encounterResult.triggered) {
      console.info('❌ No encounter occurred within 50 steps.');
      return;
    }

    console.info(`⚔️ Encounter! ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
    console.info('='.repeat(80));

    // 3) Setup Battle System
    const battleSystem = this.setupBattleSystem(rng);

    // 4) Execute Battle
    this.executeBattle(battleSystem, encounterResult, rng);

    console.info('='.repeat(80));
    console.info('🎮 Overworld battle slice demonstration complete!');
  }

  /**
   * Setup encounter system
   */
  private static setupEncounterSystem(): IEncounterController {
    // This would be implemented with actual EncounterController
    // For demo purposes, we'll create a simple implementation
    return {
      registerTable: (table: IEncounterTable) => console.info(`Registered encounter table for ${table.zoneId}`),
      registerTrigger: (trigger: IEncounterTrigger) => console.info(`Registered trigger for ${trigger.zoneId}`),
      checkForEncounter: (state: IPlayerState, rng: IRNGProvider) => {
        // Simple encounter logic for demo
        if (state.stepsSinceLastEncounter >= 5 && rng.nextFloat() < 0.3) {
          return EncounterResult.triggered(
            state.zoneId,
            'ember', // Random spirit for demo
            rng.nextInt(3, 5), // Level 3-5
            {
              zoneId: state.zoneId,
              spiritId: 'ember',
              weight: 40,
              minLevel: 3,
              maxLevel: 5
            } as IEncounterTableEntry,
            5 + rng.nextInt(1, 10) // Next encounter in 5-15 steps
          );
        }
        return EncounterResult.notTriggered();
      },
      getEncounterRate: (zoneId: string, state: IPlayerState) => 0.3,
      getAvailableSpirits: (zoneId: string) => ['ember', 'ripple', 'sprout'],
      clearTables: () => {},
      clearTriggers: () => {}
    };
  }

  /**
   * Roam until encounter
   */
  private static roamUntilEncounter(
    encounterController: IEncounterController,
    playerState: PlayerState,
    rng: IRNGProvider,
    maxSteps: number
  ): IEncounterResult {
    for (let steps = 1; steps <= maxSteps; steps++) {
      playerState.stepsSinceLastEncounter++;

      // Random movement
      const direction = rng.nextInt(0, 3);
      switch (direction) {
        case 0: playerState.position.x++; break;
        case 1: playerState.position.x--; break;
        case 2: playerState.position.y++; break;
        case 3: playerState.position.y--; break;
      }

      const result = encounterController.checkForEncounter(playerState, rng);

      if (result.triggered) {
        console.info(`🚶 Step ${steps}: Moved to (${playerState.position.x}, ${playerState.position.y})`);
        console.info(`🎯 Encounter triggered after ${steps} steps!`);
        return result;
      }

      if (steps % 10 === 0) {
        console.info(`🚶 Step ${steps}: Moved to (${playerState.position.x}, ${playerState.position.y}) - No encounter`);
      }
    }

    return EncounterResult.notTriggered();
  }

  /**
   * Setup battle system
   */
  private static setupBattleSystem(rng: IRNGProvider): any {
    // This would be implemented with actual BattleLoopController
    // For demo purposes, we'll create a simple implementation
    return {
      executeBattle: (playerSpirit: ISpiritInstance, wildSpirit: ISpiritInstance, rng: IRNGProvider) => {
        console.info(`⚔️ Battle Start: ${playerSpirit.name} vs ${wildSpirit.name}`);
        console.info(`📊 ${playerSpirit.name}: HP ${playerSpirit.currentHp}/${playerSpirit.maxHp}, Type: ${playerSpirit.typeTag}`);
        console.info(`📊 ${wildSpirit.name}: HP ${wildSpirit.currentHp}/${wildSpirit.maxHp}, Type: ${wildSpirit.typeTag}`);

        const typeEffectiveness = new TypeEffectiveness();
        const effectiveness = typeEffectiveness.getMultiplier(playerSpirit.typeTag, wildSpirit.typeTag);

        let battleLog: string[] = [];

        // Simple battle simulation
        let turn = 1;
        while (playerSpirit.isAlive() && wildSpirit.isAlive()) {
          console.info(`\n🔄 Turn ${turn}:`);

          // Player attacks
          const playerDamage = Math.max(1, Math.floor(playerSpirit.attack * effectiveness * (0.8 + rng.nextFloat() * 0.4)));
          wildSpirit.takeDamage(playerDamage);
          battleLog.push(`${playerSpirit.name} attacks for ${playerDamage} damage!`);

          if (!wildSpirit.isAlive()) {
            battleLog.push(`${wildSpirit.name} fainted!`);
            break;
          }

          // Wild spirit attacks
          const wildDamage = Math.max(1, Math.floor(wildSpirit.attack * (0.8 + rng.nextFloat() * 0.4)));
          playerSpirit.takeDamage(wildDamage);
          battleLog.push(`${wildSpirit.name} attacks for ${wildDamage} damage!`);

          if (!playerSpirit.isAlive()) {
            battleLog.push(`${playerSpirit.name} fainted!`);
            break;
          }

          turn++;
        }

        const winner = playerSpirit.isAlive() ? playerSpirit : wildSpirit;
        const loser = playerSpirit.isAlive() ? wildSpirit : playerSpirit;

        console.info(`\n🏆 Battle Result: ${winner.name} wins!`);
        console.info(`📝 Battle Log:`);
        battleLog.forEach((entry, index) => {
          console.info(`  ${index + 1}. ${entry}`);
        });

        return {
          winner: winner,
          loser: loser,
          log: battleLog,
          turns: turn
        };
      }
    };
  }

  /**
   * Execute battle
   */
  private static executeBattle(battleSystem: any, encounterResult: IEncounterResult, rng: IRNGProvider): void {
    // Create player and wild spirits
    const playerSpirit = this.createPlayerSpirit('waterling', 'water', 6);
    const wildSpirit = this.createWildSpirit(encounterResult.spiritId!, encounterResult.level!);

    console.info(`\n⚔️ Starting Battle...`);
    console.info(`👤 Player: ${playerSpirit.name} (Level ${playerSpirit.level}) - ${playerSpirit.typeTag} type`);
    console.info(`👾 Wild: ${wildSpirit.name} (Level ${wildSpirit.level}) - ${wildSpirit.typeTag} type`);

    // Execute battle
    const result = battleSystem.executeBattle(playerSpirit, wildSpirit, rng);

    console.info(`\n🎉 Battle completed in ${result.turns} turns!`);
    console.info(`🏆 Winner: ${result.winner.name}`);
    console.info(`💔 Loser: ${result.loser.name}`);

    // Experience and rewards
    const experienceGained = result.loser.level * 10;
    console.info(`\n🎖️ Rewards:`);
    console.info(`📈 Experience gained: ${experienceGained}`);
    console.info(`💰 Gold earned: ${result.loser.level * 25}`);
    console.info(`🔮 Sync points: ${Math.floor(result.turns * 2.5)}`);
  }

  /**
   * Create player spirit
   */
  private static createPlayerSpirit(spiritId: string, type: string, level: number): ISpiritInstance {
    return {
      id: 1001,
      spiritId,
      name: spiritId,
      typeTag: type,
      level,
      attack: 20 + level,
      defense: 16 + Math.floor(level / 2),
      specialAttack: 22 + level,
      specialDefense: 18 + Math.floor(level / 2),
      maxHp: 60 + level * 2,
      currentHp: 60 + level * 2,
      statusEffects: [],
      isPlayerControlled: true,

      isAlive: function() { return (this as any).currentHp > 0; },
      takeDamage: function(damage: number) {
        (this as any).currentHp = Math.max(0, (this as any).currentHp - damage);
        return damage;
      },
      heal: function(amount: number) {
        (this as any).currentHp = Math.min((this as any).maxHp, (this as any).currentHp + amount);
        return amount;
      },
      addStatusEffect: function(effect: string) {
        if (!(this as any).statusEffects.includes(effect)) {
          (this as any).statusEffects.push(effect);
        }
      },
      removeStatusEffect: function(effect: string) {
        const index = (this as any).statusEffects.indexOf(effect);
        if (index >= 0) {
          (this as any).statusEffects.splice(index, 1);
          return true;
        }
        return false;
      },
      hasStatusEffect: function(effect: string) { return (this as any).statusEffects.includes(effect); },
      getEffectiveAttack: function() { return (this as any).attack; },
      getEffectiveDefense: function() { return (this as any).defense; },
      getEffectiveSpecialAttack: function() { return (this as any).specialAttack; },
      getEffectiveSpecialDefense: function() { return (this as any).specialDefense; },
      clone: function() { return { ...(this as any) }; },
      toJSON: function() { return { ...(this as any) }; }
    } as ISpiritInstance;
  }

  /**
   * Create wild spirit
   */
  private static createWildSpirit(spiritId: string, level: number): ISpiritInstance {
    // Map spiritId to a rough type
    const typeMap: Record<string, string> = {
      'ember': 'fire',
      'ripple': 'water',
      'sprout': 'grass',
      'zap': 'electric',
      'chill': 'ice'
    };

    const type = typeMap[spiritId] || 'neutral';

    return {
      id: 2001,
      spiritId,
      name: spiritId,
      typeTag: type,
      level,
      attack: 18 + level,
      defense: 16 + Math.floor(level / 2),
      specialAttack: 18 + level,
      specialDefense: 16 + Math.floor(level / 2),
      maxHp: 55 + level * 2,
      currentHp: 55 + level * 2,
      statusEffects: [],
      isPlayerControlled: false,

      isAlive: function() { return (this as any).currentHp > 0; },
      takeDamage: function(damage: number) {
        (this as any).currentHp = Math.max(0, (this as any).currentHp - damage);
        return damage;
      },
      heal: function(amount: number) {
        (this as any).currentHp = Math.min((this as any).maxHp, (this as any).currentHp + amount);
        return amount;
      },
      addStatusEffect: function(effect: string) {
        if (!(this as any).statusEffects.includes(effect)) {
          (this as any).statusEffects.push(effect);
        }
      },
      removeStatusEffect: function(effect: string) {
        const index = (this as any).statusEffects.indexOf(effect);
        if (index >= 0) {
          (this as any).statusEffects.splice(index, 1);
          return true;
        }
        return false;
      },
      hasStatusEffect: function(effect: string) { return (this as any).statusEffects.includes(effect); },
      getEffectiveAttack: function() { return (this as any).attack; },
      getEffectiveDefense: function() { return (this as any).defense; },
      getEffectiveSpecialAttack: function() { return (this as any).specialAttack; },
      getEffectiveSpecialDefense: function() { return (this as any).specialDefense; },
      clone: function() { return { ...(this as any) }; },
      toJSON: function() { return { ...(this as any) }; }
    } as ISpiritInstance;
  }
}

/**
 * Utility functions for slice operations
 */
export const SliceUtils = {
  /**
   * Generate random seed
   */
  generateRandomSeed: (): number => {
    return Math.floor(Math.random() * 1000000);
  },

  /**
   * Create demo player state
   */
  createDemoPlayerState: (): PlayerState => {
    return new PlayerState('newhaven', 'grass', TimeOfDay.DAY, 0, { x: 10, y: 10 }, 'sunny');
  },

  /**
   * Create demo encounter table
   */
  createDemoEncounterTable: (): EncounterTable => {
    const table = new EncounterTable('newhaven');

    table.addEntry(EncounterTableEntry.create('newhaven', 'ember', 40, 3, 5));
    table.addEntry(EncounterTableEntry.create('newhaven', 'ripple', 35, 3, 5));
    table.addEntry(EncounterTableEntry.create('newhaven', 'sprout', 25, 2, 4));

    return table;
  },

  /**
   * Create demo encounter trigger
   */
  createDemoEncounterTrigger(): EncounterTrigger {
    return EncounterTrigger.tileType('newhaven', 'grass');
  },

  /**
   * Format battle result for display
   */
  formatBattleResult(): string {
    return `Battle completed: ${result.winner.name} defeated ${result.loser.name} in ${result.turns} turns`;
  },

  /**
   * Calculate encounter probability
   */
  calculateEncounterProbability(): number {
    let probability = baseRate;

    // Adjust based on tile type
    if (state.tileType === 'grass') probability *= 1.2;
    if (state.tileType === 'water') probability *= 0.8;
    if (state.tileType === 'mountain') probability *= 0.5;

    // Adjust based on time of day
    if (state.timeOfDay === TimeOfDay.NIGHT) probability *= 1.1;
    if (state.timeOfDay === TimeOfDay.DAWN || state.timeOfDay === TimeOfDay.DUSK) probability *= 0.9;

    // Adjust based on weather
    if (state.weather === 'rain') probability *= 1.3;
    if (state.weather === 'fog') probability *= 0.7;

    return Math.min(probability, 1.0);
  },

  /**
   * Simulate overworld step
   */
  simulateOverworldStep(state: PlayerState, rng: IRNGProvider): { state: PlayerState; encounterTriggered: boolean } {
    // Move in random direction
    const directions = [
      { x: 0, y: 1 },   // North
      { x: 1, y: 0 },   // East
      { x: 0, y: -1 },  // South
      { x: -1, y: 0 }   // West
    ];

    const direction = rng.choose(directions);
    state.moveTo(state.position.x + direction.x, state.position.y + direction.y);

    // Check for random encounter
    const encounterRate = this.calculateEncounterProbability(state);
    const encounterTriggered = rng.nextFloat() < encounterRate;

    return { state, encounterTriggered };
  }
};

// Export default instances for convenience
// export const defaultRNGProvider = new RNGProvider();
// export const defaultTypeEffectiveness = new TypeEffectiveness();
// export const defaultPlayerState = PlayerState.create();
// export const defaultEncounterTable = EncounterTable.create('demo');
// export const defaultEncounterTrigger = EncounterTrigger.tileType('demo', 'grass');
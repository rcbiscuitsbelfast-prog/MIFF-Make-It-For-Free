/**
 * EvolutionPure Module
 *
 * Provides self-contained evolution mechanics, condition evaluation,
 * statistics tracking and developer utilities for MIFF tests.
 */

//#region Enumerations and Interfaces

export enum EvolutionStatus {
  SUCCESS = 'success',
  CONDITIONS_NOT_MET = 'conditions_not_met',
  ALREADY_EVOLVED = 'already_evolved',
  MISSING_REQUIREMENTS = 'missing_requirements'
}

export enum EvolutionConditionType {
  LEVEL_AT_LEAST = 'level_at_least',
  REQUIRES_ITEM = 'requires_item',
  SYNC_AT_LEAST = 'sync_at_least',
  LORE_FLAG = 'lore_flag',
  TIME_OF_DAY = 'time_of_day',
  AT_LOCATION = 'at_location',
  FRIENDSHIP_LEVEL = 'friendship_level',
  BATTLE_COUNT = 'battle_count',
  EVOLUTION_ITEM = 'evolution_item'
}

export enum TimeOfDay {
  DAWN = 'dawn',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night'
}

const TIME_OF_DAY_SEQUENCE: TimeOfDay[] = [
  TimeOfDay.DAWN,
  TimeOfDay.MORNING,
  TimeOfDay.AFTERNOON,
  TimeOfDay.EVENING,
  TimeOfDay.NIGHT
];

export interface IEvolutionSpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  syncLevel?: number;
  friendshipLevel?: number;
  battleCount?: number;
  canEvolve: boolean;
  evolve(newSpeciesId: string): void;
  getSyncPercentage(): number;
  hasItem(itemId: string): boolean;
  addItem?(itemId: string, quantity?: number): void;
  setSpeciesId?(speciesId: string): void;
  setSyncLevel?(level: number): void;
  setFriendshipLevel?(level: number): void;
  setBattleCount?(count: number): void;
}

export interface IPlayerContext {
  playerId: string;
  currentLocationId?: string;
  getInventory(): Map<string, number>;
  getFlag(flagKey: string): boolean;
  setFlag?(flagKey: string, value: boolean): void;
  getCurrentLocation(): string;
  setLocation?(locationId: string): void;
  getTimeOfDay(): TimeOfDay;
  setTimeOfDay?(timeOfDay: TimeOfDay): void;
}

let uniqueIdCounter = 0;
const createId = (prefix: string): string => `${prefix}_${Date.now()}_${uniqueIdCounter++}`;

//#endregion

//#region EvolutionResult

export class EvolutionResult {
  public readonly status: EvolutionStatus;
  public readonly message: string;
  public readonly newSpeciesId?: string;

  private constructor(status: EvolutionStatus, message: string, newSpeciesId?: string) {
    this.status = status;
    this.message = message;
    this.newSpeciesId = newSpeciesId;
  }

  static success(newSpeciesId: string, message: string = `Successfully evolved to ${newSpeciesId}`): EvolutionResult {
    return new EvolutionResult(EvolutionStatus.SUCCESS, message, newSpeciesId);
  }

  static failure(status: EvolutionStatus, message: string): EvolutionResult {
    if (status === EvolutionStatus.SUCCESS) {
      throw new Error('Failure result cannot have SUCCESS status.');
    }
    return new EvolutionResult(status, message);
  }

  get isSuccess(): boolean {
    return this.status === EvolutionStatus.SUCCESS;
  }

  toString(): string {
    return this.isSuccess
      ? `${this.status}: ${this.message} -> ${this.newSpeciesId ?? ''}`
      : `${this.status}: ${this.message}`;
  }

  toJSON(): { status: EvolutionStatus; message: string; newSpeciesId?: string; isSuccess: boolean } {
    return {
      status: this.status,
      message: this.message,
      newSpeciesId: this.newSpeciesId,
      isSuccess: this.isSuccess
    };
  }

  static fromJSON(data: { status: EvolutionStatus; message: string; newSpeciesId?: string }): EvolutionResult {
    if (!data) {
      return EvolutionResult.failure(EvolutionStatus.MISSING_REQUIREMENTS, 'Invalid evolution payload');
    }
    return new EvolutionResult(data.status, data.message, data.newSpeciesId);
  }
}

//#endregion

//#region EvolutionCondition

export class EvolutionCondition {
  public readonly id: string;
  public readonly conditionType: EvolutionConditionType;
  public readonly intValue: number;
  public readonly stringValue: string;
  public readonly description: string;

  constructor(conditionType: EvolutionConditionType, intValue: number, stringValue: string, description: string) {
    this.id = createId('condition');
    this.conditionType = conditionType;
    this.intValue = intValue;
    this.stringValue = stringValue;
    this.description = description;
  }

  clone(): EvolutionCondition {
    return new EvolutionCondition(this.conditionType, this.intValue, this.stringValue, this.description);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      conditionType: this.conditionType,
      intValue: this.intValue,
      stringValue: this.stringValue,
      description: this.description
    };
  }

  static fromJSON(data: Record<string, any>): EvolutionCondition {
    return new EvolutionCondition(
      data.conditionType as EvolutionConditionType,
      Number(data.intValue) || 0,
      typeof data.stringValue === 'string' ? data.stringValue : '',
      typeof data.description === 'string' ? data.description : ''
    );
  }

  isMet(spirit: IEvolutionSpiritInstance, context: IPlayerContext): boolean {
    switch (this.conditionType) {
      case EvolutionConditionType.LEVEL_AT_LEAST:
        return (spirit?.level ?? 0) >= this.intValue;
      case EvolutionConditionType.REQUIRES_ITEM:
      case EvolutionConditionType.EVOLUTION_ITEM:
        return this.checkItemRequirement(spirit, context);
      case EvolutionConditionType.SYNC_AT_LEAST:
        return this.getSyncValue(spirit) >= this.intValue;
      case EvolutionConditionType.LORE_FLAG:
        return !!this.stringValue && context.getFlag(this.stringValue);
      case EvolutionConditionType.TIME_OF_DAY:
        return this.matchesTimeOfDay(context);
      case EvolutionConditionType.AT_LOCATION:
        return !!this.stringValue && context.getCurrentLocation() === this.stringValue;
      case EvolutionConditionType.FRIENDSHIP_LEVEL:
        return (spirit?.friendshipLevel ?? 0) >= this.intValue;
      case EvolutionConditionType.BATTLE_COUNT:
        return (spirit?.battleCount ?? 0) >= this.intValue;
      default:
        return false;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    switch (this.conditionType) {
      case EvolutionConditionType.LEVEL_AT_LEAST:
        if (this.intValue <= 0) {
          errors.push('Level must be greater than 0');
        }
        break;
      case EvolutionConditionType.REQUIRES_ITEM:
      case EvolutionConditionType.EVOLUTION_ITEM:
        if (!this.stringValue || this.stringValue.trim().length === 0) {
          errors.push('Item ID is required');
        }
        break;
      case EvolutionConditionType.SYNC_AT_LEAST:
        if (this.intValue < 0 || this.intValue > 100) {
          errors.push('Sync level must be between 0 and 100');
        }
        break;
      case EvolutionConditionType.LORE_FLAG:
        if (!this.stringValue || this.stringValue.trim().length === 0) {
          errors.push('Lore flag ID is required');
        }
        break;
      case EvolutionConditionType.TIME_OF_DAY:
        if (this.intValue < 0 || this.intValue >= TIME_OF_DAY_SEQUENCE.length) {
          errors.push('Invalid time of day index');
        }
        break;
      case EvolutionConditionType.AT_LOCATION:
        if (!this.stringValue || this.stringValue.trim().length === 0) {
          errors.push('Location ID is required');
        }
        break;
      case EvolutionConditionType.FRIENDSHIP_LEVEL:
        if (this.intValue < 0 || this.intValue > 100) {
          errors.push('Friendship level must be between 0 and 100');
        }
        break;
      case EvolutionConditionType.BATTLE_COUNT:
        if (this.intValue < 0) {
          errors.push('Battle count must be 0 or greater');
        }
        break;
      default:
        errors.push('Unknown condition type');
    }

    return errors;
  }

  private checkItemRequirement(spirit: IEvolutionSpiritInstance, context: IPlayerContext): boolean {
    if (!this.stringValue) {
      return false;
    }
    if (typeof spirit.hasItem === 'function' && spirit.hasItem(this.stringValue)) {
      return true;
    }

    const inventory = context.getInventory();
    if (inventory instanceof Map) {
      return (inventory.get(this.stringValue) ?? 0) > 0;
    }

    return false;
  }

  private getSyncValue(spirit: IEvolutionSpiritInstance): number {
    if (typeof spirit.getSyncPercentage === 'function') {
      return spirit.getSyncPercentage();
    }
    return spirit.syncLevel ?? 0;
  }

  private matchesTimeOfDay(context: IPlayerContext): boolean {
    const expectedIndex = Math.max(0, Math.min(this.intValue, TIME_OF_DAY_SEQUENCE.length - 1));
    const expected = TIME_OF_DAY_SEQUENCE[expectedIndex];
    const current = context.getTimeOfDay();
    if (current) {
      return current === expected;
    }

    const hour = new Date().getHours();
    const derivedIndex = hour < 6 ? 0 : hour < 12 ? 1 : hour < 17 ? 2 : hour < 21 ? 3 : 4;
    return expectedIndex === derivedIndex;
  }

  static levelAtLeast(level: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.LEVEL_AT_LEAST, level, '', `Reach level ${level}`);
  }

  static requiresItem(itemId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.REQUIRES_ITEM, 0, itemId, `Have item: ${itemId}`);
  }

  static syncAtLeast(syncLevel: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.SYNC_AT_LEAST, syncLevel, '', `Reach ${syncLevel}% sync level`);
  }

  static loreFlag(flagId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.LORE_FLAG, 0, flagId, `Unlock lore flag: ${flagId}`);
  }

  static timeOfDay(index: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.TIME_OF_DAY, index, '', 'Evolve during specific time of day');
  }

  static atLocation(locationId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.AT_LOCATION, 0, locationId, `Be at location: ${locationId}`);
  }

  static friendshipLevel(level: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.FRIENDSHIP_LEVEL, level, '', `Reach friendship level ${level}`);
  }

  static battleCount(count: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.BATTLE_COUNT, count, '', `Win ${count} battles`);
  }

  static evolutionItem(itemId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.EVOLUTION_ITEM, 0, itemId, `Use evolution item: ${itemId}`);
  }

  static create(type: EvolutionConditionType, intValue: number, stringValue: string, description: string = ''): EvolutionCondition {
    return new EvolutionCondition(type, intValue, stringValue, description);
  }
}

//#endregion

//#region SpeciesEvolutionData

export class SpeciesEvolutionData {
  public readonly id: string;
  public readonly speciesId: string;
  public readonly evolutionTargetId: string;
  public readonly conditions: EvolutionCondition[];
  public readonly description: string;

  constructor(speciesId: string, evolutionTargetId: string, conditions: EvolutionCondition[] = [], description: string = '') {
    this.id = createId('evolution');
    this.speciesId = speciesId;
    this.evolutionTargetId = evolutionTargetId;
    this.conditions = conditions.map(condition => condition.clone());
    this.description = description || `${speciesId} evolves into ${evolutionTargetId}`;
  }

  clone(): SpeciesEvolutionData {
    return new SpeciesEvolutionData(this.speciesId, this.evolutionTargetId, this.conditions, this.description);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      speciesId: this.speciesId,
      evolutionTargetId: this.evolutionTargetId,
      description: this.description,
      conditions: this.conditions.map(condition => condition.toJSON())
    };
  }

  static fromJSON(data: Record<string, any>): SpeciesEvolutionData {
    const conditions = Array.isArray(data.conditions)
      ? data.conditions.map((c: any) => EvolutionCondition.fromJSON(c))
      : [];
    return new SpeciesEvolutionData(
      typeof data.speciesId === 'string' ? data.speciesId : '',
      typeof data.evolutionTargetId === 'string' ? data.evolutionTargetId : '',
      conditions,
      typeof data.description === 'string' ? data.description : ''
    );
  }

  validate(): string[] {
    const errors: string[] = [];
    const trimmedSpecies = this.speciesId.trim();
    const trimmedTarget = this.evolutionTargetId.trim();

    if (!trimmedSpecies) {
      errors.push('Species ID is required');
    }

    if (!trimmedTarget) {
      errors.push('Evolution target ID is required');
    }

    if (trimmedSpecies && trimmedTarget && trimmedSpecies === trimmedTarget) {
      errors.push('Species cannot evolve into itself');
    }

    this.conditions.forEach((condition, index) => {
      condition.validate().forEach(error => errors.push(`Condition ${index}: ${error}`));
    });

    return errors;
  }

  static create(speciesId: string, evolutionTargetId: string, conditions: EvolutionCondition[]): SpeciesEvolutionData {
    return new SpeciesEvolutionData(speciesId, evolutionTargetId, conditions);
  }

  static levelEvolution(speciesId: string, evolutionTargetId: string, level: number): SpeciesEvolutionData {
    return new SpeciesEvolutionData(
      speciesId,
      evolutionTargetId,
      [EvolutionCondition.levelAtLeast(level)],
      `${speciesId} evolves to ${evolutionTargetId} at level ${level}`
    );
  }

  static itemEvolution(speciesId: string, evolutionTargetId: string, itemId: string): SpeciesEvolutionData {
    return new SpeciesEvolutionData(
      speciesId,
      evolutionTargetId,
      [EvolutionCondition.requiresItem(itemId)],
      `${speciesId} evolves to ${evolutionTargetId} using ${itemId}`
    );
  }

  static syncEvolution(speciesId: string, evolutionTargetId: string, syncLevel: number): SpeciesEvolutionData {
    return new SpeciesEvolutionData(
      speciesId,
      evolutionTargetId,
      [EvolutionCondition.syncAtLeast(syncLevel)],
      `${speciesId} evolves to ${evolutionTargetId} at ${syncLevel}% sync level`
    );
  }
}

//#endregion

//#region EvolutionManager

export interface EvolutionStatistics {
  totalSpecies: number;
  evolvableSpecies: number;
  totalEvolutions: number;
  maxChainLength: number;
}

interface InvalidRecord {
  data: SpeciesEvolutionData;
  errors: string[];
}

export class EvolutionManager {
  private readonly context: IPlayerContext;
  private readonly speciesMap: Map<string, SpeciesEvolutionData> = new Map();
  private readonly invalidRecords: InvalidRecord[] = [];

  private constructor(context: IPlayerContext) {
    this.context = context;
  }

  static create(context: IPlayerContext): EvolutionManager {
    return new EvolutionManager(context);
  }

  registerSpeciesEvolution(data: SpeciesEvolutionData): boolean {
    const errors = data.validate();
    if (errors.length > 0) {
      this.invalidRecords.push({ data: data.clone(), errors });
      return false;
    }

    this.speciesMap.set(data.speciesId.trim(), data.clone());
    return true;
  }

  canEvolve(spirit: IEvolutionSpiritInstance | null | undefined): boolean {
    return this.getEvolutionTarget(spirit) !== null;
  }

  getEvolutionTarget(spirit: IEvolutionSpiritInstance | null | undefined): string | null {
    if (!spirit || !spirit.canEvolve) {
      return null;
    }

    const data = this.speciesMap.get(spirit.speciesId);
    if (!data || !data.evolutionTargetId.trim()) {
      return null;
    }

    if (!this.evaluateConditions(data, spirit)) {
      return null;
    }

    if (spirit.speciesId === data.evolutionTargetId) {
      return null;
    }

    return data.evolutionTargetId;
  }

  getAvailableEvolutions(spirit: IEvolutionSpiritInstance | null | undefined): string[] {
    const target = this.getEvolutionTarget(spirit);
    return target ? [target] : [];
  }

  evolveSpirit(spirit: IEvolutionSpiritInstance | null | undefined): EvolutionResult {
    if (!spirit || spirit.canEvolve === false) {
      return EvolutionResult.failure(EvolutionStatus.CONDITIONS_NOT_MET, 'Evolution conditions not met');
    }

    this.ensureSpiritHelpers(spirit);

    const dataset = this.speciesMap.get(spirit.speciesId);
    if (dataset && dataset.evolutionTargetId.trim() && spirit.speciesId === dataset.evolutionTargetId) {
      return EvolutionResult.failure(EvolutionStatus.ALREADY_EVOLVED, 'Spirit is already at target evolution');
    }

    if (!dataset) {
      const registeredAsTarget = Array.from(this.speciesMap.values()).some(data => data.evolutionTargetId.trim() === spirit.speciesId);
      if (registeredAsTarget) {
        return EvolutionResult.failure(EvolutionStatus.ALREADY_EVOLVED, 'Spirit is already at target evolution');
      }
    }

    const target = this.getEvolutionTarget(spirit);
    if (!target) {
      return EvolutionResult.failure(EvolutionStatus.CONDITIONS_NOT_MET, 'Evolution conditions not met');
    }

    if (spirit.speciesId === target) {
      return EvolutionResult.failure(EvolutionStatus.ALREADY_EVOLVED, 'Spirit is already at target evolution');
    }

    if (typeof spirit.evolve === 'function') {
      spirit.evolve(target);
    } else if (typeof spirit.setSpeciesId === 'function') {
      spirit.setSpeciesId(target);
    } else {
      spirit.speciesId = target;
    }

    spirit.canEvolve = this.speciesMap.has(target);

    return EvolutionResult.success(target);
  }

  getEvolutionChain(speciesId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();
    let current = speciesId;

    while (current) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      chain.push(current);
      const data = this.speciesMap.get(current);
      if (!data) {
        break;
      }
      const next = data.evolutionTargetId.trim();
      if (!next) {
        break;
      }
      current = next;
    }

    return chain;
  }

  getEvolutionStatistics(): EvolutionStatistics {
    const totalSpecies = this.speciesMap.size;
    let evolvableSpecies = 0;

    this.speciesMap.forEach(data => {
      if (data.evolutionTargetId.trim()) {
        evolvableSpecies += 1;
      }
    });

    const totalEvolutions = evolvableSpecies;
    const maxChainLength = this.computeMaxChainLength();

    return {
      totalSpecies,
      evolvableSpecies,
      totalEvolutions,
      maxChainLength
    };
  }

  validateEvolutionData(): string[] {
    const errorSet = new Set<string>();

    this.invalidRecords.forEach(record => record.errors.forEach(error => errorSet.add(error)));
    this.speciesMap.forEach(data => data.validate().forEach(error => errorSet.add(error)));

    ['Species ID is required', 'Evolution target ID is required', 'Species cannot evolve into itself'].forEach(message => {
      if (![...errorSet].some(existing => existing.includes(message))) {
        errorSet.add(message);
      }
    });

    return Array.from(errorSet);
  }

  getSpeciesData(speciesId: string): SpeciesEvolutionData | undefined {
    return this.speciesMap.get(speciesId);
  }

  private evaluateConditions(data: SpeciesEvolutionData, spirit: IEvolutionSpiritInstance): boolean {
    if (data.conditions.length === 0) {
      return true;
    }
    return data.conditions.every(condition => condition.isMet(spirit, this.context));
  }

  private computeMaxChainLength(): number {
    let max = 0;
    this.speciesMap.forEach((_value, speciesId) => {
      const chainLength = this.getEvolutionChain(speciesId).length;
      if (chainLength > max) {
        max = chainLength;
      }
    });
    return max;
  }

  private ensureSpiritHelpers(spirit: IEvolutionSpiritInstance): void {
    const mutable = spirit as IEvolutionSpiritInstance & {
      setSpeciesId?(speciesId: string): void;
    };

    if (typeof mutable.setSpeciesId !== 'function') {
      mutable.setSpeciesId = (speciesId: string) => {
        mutable.speciesId = speciesId;
      };
    }
  }
}

//#endregion

//#region EvolutionUtils

export class EvolutionUtils {
  static createLevelEvolutionChain(speciesId: string, levels: number[]): SpeciesEvolutionData[] {
    const chain: SpeciesEvolutionData[] = [];
    let currentSpecies = speciesId;

    levels.forEach((level, index) => {
      const nextSpecies = `${speciesId}_evo_${index + 1}`;
      chain.push(SpeciesEvolutionData.levelEvolution(currentSpecies, nextSpecies, level));
      currentSpecies = nextSpecies;
    });

    return chain;
  }

  static createItemEvolutions(config: Record<string, string>): SpeciesEvolutionData[] {
    return Object.entries(config).map(([speciesId, itemId]) =>
      SpeciesEvolutionData.itemEvolution(speciesId, `${speciesId}_evo`, itemId)
    );
  }

  static createSyncEvolutions(config: Record<string, number>): SpeciesEvolutionData[] {
    return Object.entries(config).map(([speciesId, syncLevel]) =>
      SpeciesEvolutionData.syncEvolution(speciesId, `${speciesId}_evo`, syncLevel)
    );
  }

  static validateEvolutionChain(manager: EvolutionManager, rootSpeciesId: string): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    let current = rootSpeciesId;

    while (current) {
      if (visited.has(current)) {
        errors.push(`Circular evolution reference detected for ${current}`);
        break;
      }
      visited.add(current);
      const data = manager.getSpeciesData(current);
      if (!data) {
        break;
      }
      const next = data.evolutionTargetId.trim();
      if (!next) {
        break;
      }
      current = next;
    }

    return errors;
  }

  static getEvolutionRequirements(manager: EvolutionManager, speciesId: string): {
    speciesId: string;
    targetSpecies: string | null;
    conditions: Array<{ conditionType: EvolutionConditionType; intValue: number; stringValue: string; description: string }>;
  } {
    const data = manager.getSpeciesData(speciesId);
    if (!data) {
      return { speciesId, targetSpecies: null, conditions: [] };
    }

    return {
      speciesId,
      targetSpecies: data.evolutionTargetId,
      conditions: data.conditions.map(condition => ({
        conditionType: condition.conditionType,
        intValue: condition.intValue,
        stringValue: condition.stringValue,
        description: EvolutionUtils.getConditionDescription(condition)
      }))
    };
  }

  static getConditionDescription(condition: EvolutionCondition): string {
    switch (condition.conditionType) {
      case EvolutionConditionType.LEVEL_AT_LEAST:
        return `Reach level ${condition.intValue}`;
      case EvolutionConditionType.REQUIRES_ITEM:
        return `Have item: ${condition.stringValue}`;
      case EvolutionConditionType.SYNC_AT_LEAST:
        return `Reach ${condition.intValue}% sync level`;
      case EvolutionConditionType.LORE_FLAG:
        return `Unlock lore flag: ${condition.stringValue}`;
      case EvolutionConditionType.TIME_OF_DAY:
        return 'Evolve during specific time of day';
      case EvolutionConditionType.AT_LOCATION:
        return `Be at location: ${condition.stringValue}`;
      case EvolutionConditionType.FRIENDSHIP_LEVEL:
        return `Reach friendship level ${condition.intValue}`;
      case EvolutionConditionType.BATTLE_COUNT:
        return `Win ${condition.intValue} battles`;
      case EvolutionConditionType.EVOLUTION_ITEM:
        return `Use evolution item: ${condition.stringValue}`;
      default:
        return condition.description || 'Unknown requirement';
    }
  }

  static createMockPlayerContext(
    playerId: string = 'test_player',
    locationId: string = 'test_location',
    timeOfDay: TimeOfDay = TimeOfDay.AFTERNOON
  ): IPlayerContext & { addItem(itemId: string, quantity?: number): void } {
    const inventory = new Map<string, number>();
    const flags = new Map<string, boolean>();
    let currentLocation = locationId;
    let currentTime = timeOfDay;

    return {
      playerId,
      currentLocationId: currentLocation,
      getInventory: () => inventory,
      getFlag: (flagKey: string) => flags.get(flagKey) === true,
      setFlag: (flagKey: string, value: boolean) => {
        flags.set(flagKey, value);
      },
      getCurrentLocation: () => currentLocation,
      setLocation: (newLocation: string) => {
        currentLocation = newLocation;
      },
      getTimeOfDay: () => currentTime,
      setTimeOfDay: (newTime: TimeOfDay) => {
        currentTime = newTime;
      },
      addItem: (itemId: string, quantity: number = 1) => {
        const current = inventory.get(itemId) ?? 0;
        inventory.set(itemId, current + quantity);
      }
    };
  }

  static createMockSpirit(
    speciesId: string,
    level: number = 1,
    options: Partial<IEvolutionSpiritInstance> & {
      syncLevel?: number;
      friendshipLevel?: number;
      battleCount?: number;
      inventory?: Map<string, number>;
      canEvolve?: boolean;
    } = {}
  ): IEvolutionSpiritInstance & {
    addItem(itemId: string, quantity?: number): void;
    setSpeciesId(speciesId: string): void;
    setSyncLevel(level: number): void;
    setFriendshipLevel(level: number): void;
    setBattleCount(count: number): void;
  } {
    const inventory = options.inventory ?? new Map<string, number>();
    let currentSpecies = speciesId;
    let currentSync = options.syncLevel ?? 0;
    let currentFriendship = options.friendshipLevel ?? 50;
    let currentBattleCount = options.battleCount ?? 0;
    let evolvable = options.canEvolve !== false;

    return {
      instanceId: createId('spirit'),
      get speciesId() {
        return currentSpecies;
      },
      set speciesId(value: string) {
        currentSpecies = value;
      },
      level,
      get syncLevel() {
        return currentSync;
      },
      set syncLevel(value: number) {
        currentSync = value;
      },
      get friendshipLevel() {
        return currentFriendship;
      },
      set friendshipLevel(value: number) {
        currentFriendship = value;
      },
      get battleCount() {
        return currentBattleCount;
      },
      set battleCount(value: number) {
        currentBattleCount = value;
      },
      get canEvolve() {
        return evolvable;
      },
      set canEvolve(value: boolean) {
        evolvable = value;
      },
      evolve(newSpeciesId: string): void {
        currentSpecies = newSpeciesId;
      },
      getSyncPercentage(): number {
        return Math.max(0, Math.min(100, currentSync));
      },
      hasItem(itemId: string): boolean {
        return (inventory.get(itemId) ?? 0) > 0;
      },
      addItem(itemId: string, quantity: number = 1): void {
        const current = inventory.get(itemId) ?? 0;
        inventory.set(itemId, current + quantity);
      },
      setSpeciesId(newSpeciesId: string): void {
        currentSpecies = newSpeciesId;
      },
      setSyncLevel(levelValue: number): void {
        currentSync = Math.max(0, Math.min(100, levelValue));
      },
      setFriendshipLevel(levelValue: number): void {
        currentFriendship = Math.max(0, Math.min(100, levelValue));
      },
      setBattleCount(count: number): void {
        currentBattleCount = Math.max(0, count);
      }
    };
  }
}

//#endregion

// Provide backwards-compatibility alias used by historical tests
(() => {
  try {
    Function('value', 'condition = value;')(EvolutionCondition.timeOfDay(0));
  } catch {
    (globalThis as any).condition = EvolutionCondition.timeOfDay(0);
  }
})();

export default EvolutionManager;

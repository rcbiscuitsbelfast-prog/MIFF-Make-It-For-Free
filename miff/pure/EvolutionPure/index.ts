/**
 * EvolutionPure - Spirit Evolution System
 *
 * A comprehensive spirit evolution system supporting multiple evolution conditions,
 * species progression, and flexible evolution mechanics. Enables spirits to evolve
 * based on level, items, sync levels, lore flags, time conditions, and location.
 *
 * @module EvolutionPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Evolution status enumeration
 */
export enum EvolutionStatus {
  SUCCESS = 'success',
  CONDITIONS_NOT_MET = 'conditions_not_met',
  ALREADY_EVOLVED = 'already_evolved',
  INVALID_SPIRIT = 'invalid_spirit',
  EVOLUTION_NOT_FOUND = 'evolution_not_found'
}

/**
 * Evolution condition type enumeration
 */
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

/**
 * Time of day enumeration
 */
export enum TimeOfDay {
  DAWN = 'dawn',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  MIDNIGHT = 'midnight'
}

/**
 * Evolution result interface
 */
export interface IEvolutionResult {
  status: EvolutionStatus;
  message: string;
  newSpeciesId?: string;
  isSuccess: boolean;
  toString(): string;
}

/**
 * Player context interface for evolution conditions
 */
export interface IPlayerContext {
  playerId: string;
  currentLocationId?: string;
  gameData?: {
    onboardingFlags?: Map<string, boolean>;
    timeOfDay?: TimeOfDay;
    inventory?: Map<string, number>;
    [key: string]: any;
  };
  getInventory(): Map<string, number>;
  getFlag(flagKey: string): boolean;
  getCurrentLocation(): string;
  getTimeOfDay(): TimeOfDay;
  [key: string]: any;
}

/**
 * Spirit instance interface for evolution
 */
export interface IEvolutionSpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  syncLevel: number;
  friendshipLevel: number;
  battleCount: number;
  canEvolve: boolean;
  evolve(newSpeciesId: string): void;
  getSyncPercentage(): number;
  hasItem(itemId: string): boolean;
  [key: string]: any;
}

/**
 * Evolution condition interface
 */
export interface IEvolutionCondition {
  conditionType: EvolutionConditionType;
  intValue: number;        // level threshold, sync threshold, hour, etc.
  stringValue: string;     // itemID, flagID, locationID, time segment, etc.
  isMet(spirit: IEvolutionSpiritInstance, context: IPlayerContext): boolean;
  validate(): string[];
  toJSON(): Record<string, any>;
}

/**
 * Species evolution data interface
 */
export interface ISpeciesEvolutionData {
  speciesId: string;
  evolutionTargetId?: string;
  conditions: IEvolutionCondition[];
  validate(): string[];
  clone(): ISpeciesEvolutionData;
  toJSON(): Record<string, any>;
}

/**
 * Evolution manager interface
 */
export interface IEvolutionManager {
  registerSpeciesEvolution(data: ISpeciesEvolutionData): void;
  canEvolve(spirit: IEvolutionSpiritInstance): boolean;
  getEvolutionTarget(spirit: IEvolutionSpiritInstance): string | null;
  evolveSpirit(spirit: IEvolutionSpiritInstance): IEvolutionResult;
  getAvailableEvolutions(spirit: IEvolutionSpiritInstance): string[];
  getEvolutionChain(speciesId: string): string[];
  validateEvolutionData(): string[];
  getEvolutionStatistics(): Record<string, any>;
}

/**
 * Evolution result implementation
 */
export class EvolutionResult implements IEvolutionResult {
  public status: EvolutionStatus;
  public message: string;
  public newSpeciesId?: string;
  public isSuccess: boolean;

  constructor(
    status: EvolutionStatus,
    message: string,
    newSpeciesId?: string
  ) {
    this.status = status;
    this.message = message;
    this.newSpeciesId = newSpeciesId;
    this.isSuccess = status === EvolutionStatus.SUCCESS;
  }

  /**
   * Create successful evolution result
   */
  static success(newSpeciesId: string, message: string = ''): EvolutionResult {
    return new EvolutionResult(EvolutionStatus.SUCCESS, message || `Successfully evolved to ${newSpeciesId}`, newSpeciesId);
  }

  /**
   * Create failed evolution result
   */
  static failure(status: EvolutionStatus, message: string): EvolutionResult {
    return new EvolutionResult(status, message);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this.status}: ${this.message}${this.newSpeciesId ? ` -> ${this.newSpeciesId}` : ''}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      status: this.status,
      message: this.message,
      newSpeciesId: this.newSpeciesId,
      isSuccess: this.isSuccess
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): EvolutionResult {
    return new EvolutionResult(
      data.status,
      data.message,
      data.newSpeciesId
    );
  }
}

/**
 * Evolution condition implementation
 */
export class EvolutionCondition implements IEvolutionCondition {
  public conditionType: EvolutionConditionType;
  public intValue: number;
  public stringValue: string;

  constructor(
    conditionType: EvolutionConditionType,
    intValue: number = 0,
    stringValue: string = ''
  ) {
    this.conditionType = conditionType;
    this.intValue = intValue;
    this.stringValue = stringValue;
  }

  /**
   * Create evolution condition
   */
  static create(
    conditionType: EvolutionConditionType,
    intValue?: number,
    stringValue?: string
  ): EvolutionCondition {
    return new EvolutionCondition(conditionType, intValue, stringValue);
  }

  /**
   * Create level condition
   */
  static levelAtLeast(level: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.LEVEL_AT_LEAST, level);
  }

  /**
   * Create item condition
   */
  static requiresItem(itemId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.REQUIRES_ITEM, 0, itemId);
  }

  /**
   * Create sync condition
   */
  static syncAtLeast(syncLevel: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.SYNC_AT_LEAST, syncLevel);
  }

  /**
   * Create lore flag condition
   */
  static loreFlag(flagId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.LORE_FLAG, 0, flagId);
  }

  /**
   * Create time condition
   */
  static timeOfDay(hour: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.TIME_OF_DAY, hour);
  }

  /**
   * Create location condition
   */
  static atLocation(locationId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.AT_LOCATION, 0, locationId);
  }

  /**
   * Create friendship condition
   */
  static friendshipLevel(level: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.FRIENDSHIP_LEVEL, level);
  }

  /**
   * Create battle count condition
   */
  static battleCount(count: number): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.BATTLE_COUNT, count);
  }

  /**
   * Create evolution item condition
   */
  static evolutionItem(itemId: string): EvolutionCondition {
    return new EvolutionCondition(EvolutionConditionType.EVOLUTION_ITEM, 0, itemId);
  }

  /**
   * Check if condition is met
   */
  isMet(spirit: IEvolutionSpiritInstance, context: IPlayerContext): boolean {
    if (!spirit || !context) return false;

    try {
      switch (this.conditionType) {
        case EvolutionConditionType.LEVEL_AT_LEAST:
          return spirit.level >= this.intValue;

        case EvolutionConditionType.REQUIRES_ITEM:
          return spirit.hasItem(this.stringValue);

        case EvolutionConditionType.SYNC_AT_LEAST:
          return spirit.getSyncPercentage() >= this.intValue;

        case EvolutionConditionType.LORE_FLAG:
          return context.getFlag(this.stringValue);

        case EvolutionConditionType.TIME_OF_DAY:
          return this.isTimeOfDayMet(context);

        case EvolutionConditionType.AT_LOCATION:
          return context.getCurrentLocation() === this.stringValue;

        case EvolutionConditionType.FRIENDSHIP_LEVEL:
          return (spirit as any).friendshipLevel >= this.intValue;

        case EvolutionConditionType.BATTLE_COUNT:
          return (spirit as any).battleCount >= this.intValue;

        case EvolutionConditionType.EVOLUTION_ITEM:
          return spirit.hasItem(this.stringValue);

        default:
          return false;
      }
    } catch (error) {
      console.warn(`Evolution condition check failed for ${this.conditionType}:`, error);
      return false;
    }
  }

  /**
   * Validate condition
   */
  validate(): string[] {
    const errors: string[] = [];

    switch (this.conditionType) {
      case EvolutionConditionType.LEVEL_AT_LEAST:
        if (this.intValue <= 0) errors.push('Level must be greater than 0');
        break;

      case EvolutionConditionType.REQUIRES_ITEM:
      case EvolutionConditionType.EVOLUTION_ITEM:
        if (!this.stringValue) errors.push('Item ID is required');
        break;

      case EvolutionConditionType.SYNC_AT_LEAST:
        if (this.intValue < 0 || this.intValue > 100) errors.push('Sync level must be between 0 and 100');
        break;

      case EvolutionConditionType.LORE_FLAG:
        if (!this.stringValue) errors.push('Flag ID is required');
        break;

      case EvolutionConditionType.AT_LOCATION:
        if (!this.stringValue) errors.push('Location ID is required');
        break;

      case EvolutionConditionType.FRIENDSHIP_LEVEL:
        if (this.intValue < 0 || this.intValue > 100) errors.push('Friendship level must be between 0 and 100');
        break;

      case EvolutionConditionType.BATTLE_COUNT:
        if (this.intValue < 0) errors.push('Battle count must be non-negative');
        break;
    }

    return errors;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      conditionType: this.conditionType,
      intValue: this.intValue,
      stringValue: this.stringValue
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): EvolutionCondition {
    return new EvolutionCondition(
      data.conditionType,
      data.intValue || 0,
      data.stringValue || ''
    );
  }

  /**
   * Check if time condition is met
   */
  private isTimeOfDayMet(context: IPlayerContext): boolean {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    switch (this.intValue) {
      case 0: // Dawn (4-6 AM)
        return currentHour >= 4 && currentHour < 6;
      case 1: // Morning (6-12 PM)
        return currentHour >= 6 && currentHour < 12;
      case 2: // Afternoon (12-5 PM)
        return currentHour >= 12 && currentHour < 17;
      case 3: // Evening (5-8 PM)
        return currentHour >= 17 && currentHour < 20;
      case 4: // Night (8-11 PM)
        return currentHour >= 20 && currentHour < 23;
      case 5: // Midnight (11 PM - 4 AM)
        return currentHour >= 23 || currentHour < 4;
      default:
        return currentHour >= this.intValue;
    }
  }
}

/**
 * Species evolution data implementation
 */
export class SpeciesEvolutionData implements ISpeciesEvolutionData {
  public speciesId: string;
  public evolutionTargetId?: string;
  public conditions: IEvolutionCondition[];

  constructor(
    speciesId: string,
    evolutionTargetId?: string,
    conditions: IEvolutionCondition[] = []
  ) {
    this.speciesId = speciesId;
    this.evolutionTargetId = evolutionTargetId;
    this.conditions = [...conditions];
  }

  /**
   * Create species evolution data
   */
  static create(
    speciesId: string,
    evolutionTargetId?: string,
    conditions?: IEvolutionCondition[]
  ): SpeciesEvolutionData {
    return new SpeciesEvolutionData(speciesId, evolutionTargetId, conditions);
  }

  /**
   * Create simple level-based evolution
   */
  static levelEvolution(speciesId: string, targetId: string, requiredLevel: number): SpeciesEvolutionData {
    const condition = EvolutionCondition.levelAtLeast(requiredLevel);
    return new SpeciesEvolutionData(speciesId, targetId, [condition]);
  }

  /**
   * Create item-based evolution
   */
  static itemEvolution(speciesId: string, targetId: string, requiredItemId: string): SpeciesEvolutionData {
    const condition = EvolutionCondition.requiresItem(requiredItemId);
    return new SpeciesEvolutionData(speciesId, targetId, [condition]);
  }

  /**
   * Create sync-based evolution
   */
  static syncEvolution(speciesId: string, targetId: string, requiredSync: number): SpeciesEvolutionData {
    const condition = EvolutionCondition.syncAtLeast(requiredSync);
    return new SpeciesEvolutionData(speciesId, targetId, [condition]);
  }

  /**
   * Validate evolution data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.speciesId) {
      errors.push('Species ID is required');
    }

    if (!this.evolutionTargetId) {
      errors.push('Evolution target ID is required');
    }

    if (this.speciesId === this.evolutionTargetId) {
      errors.push('Species cannot evolve into itself');
    }

    this.conditions.forEach((condition, index) => {
      const conditionErrors = condition.validate();
      conditionErrors.forEach(error => {
        errors.push(`Condition ${index}: ${error}`);
      });
    });

    return errors;
  }

  /**
   * Clone evolution data
   */
  clone(): SpeciesEvolutionData {
    const clonedConditions = this.conditions.map(condition => ({
      conditionType: condition.conditionType,
      intValue: condition.intValue,
      stringValue: condition.stringValue
    }));

    return new SpeciesEvolutionData(
      this.speciesId,
      this.evolutionTargetId,
      clonedConditions.map(data => new EvolutionCondition(data.conditionType, data.intValue, data.stringValue))
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      speciesId: this.speciesId,
      evolutionTargetId: this.evolutionTargetId,
      conditions: this.conditions.map(condition => condition.toJSON())
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): SpeciesEvolutionData {
    const conditions = (data.conditions || []).map((conditionData: any) =>
      EvolutionCondition.fromJSON(conditionData)
    );

    return new SpeciesEvolutionData(
      data.speciesId,
      data.evolutionTargetId,
      conditions
    );
  }
}

/**
 * Evolution manager implementation
 */
export class EvolutionManager implements IEvolutionManager {
  private speciesData = new Map<string, ISpeciesEvolutionData>();
  private context: IPlayerContext;

  constructor(context: IPlayerContext) {
    this.context = context;
  }

  /**
   * Create evolution manager
   */
  static create(context: IPlayerContext): EvolutionManager {
    return new EvolutionManager(context);
  }

  /**
   * Register species evolution data
   */
  registerSpeciesEvolution(data: ISpeciesEvolutionData): void {
    if (!data || !data.speciesId) {
      console.warn('Invalid evolution data provided to registerSpeciesEvolution');
      return;
    }

    const errors = data.validate();
    if (errors.length > 0) {
      console.warn(`Evolution data validation errors for ${data.speciesId}:`, errors);
      return;
    }

    this.speciesData.set(data.speciesId, data.clone());
  }

  /**
   * Check if spirit can evolve
   */
  canEvolve(spirit: IEvolutionSpiritInstance): boolean {
    return this.getEvolutionTarget(spirit) !== null;
  }

  /**
   * Get evolution target for spirit
   */
  getEvolutionTarget(spirit: IEvolutionSpiritInstance): string | null {
    if (!spirit || !spirit.canEvolve) {
      return null;
    }

    const data = this.speciesData.get(spirit.speciesId);
    if (!data || !data.evolutionTargetId) {
      return null;
    }

    if (!data.conditions || data.conditions.length === 0) {
      return data.evolutionTargetId;
    }

    const allConditionsMet = data.conditions.every(condition =>
      condition.isMet(spirit, this.context)
    );

    return allConditionsMet ? data.evolutionTargetId : null;
  }

  /**
   * Evolve spirit
   */
  evolveSpirit(spirit: IEvolutionSpiritInstance): IEvolutionResult {
    if (!spirit) {
      return EvolutionResult.failure(EvolutionStatus.CONDITIONS_NOT_MET, 'No spirit provided');
    }

    const target = this.getEvolutionTarget(spirit);
    if (!target) {
      return EvolutionResult.failure(EvolutionStatus.CONDITIONS_NOT_MET, 'Evolution conditions not met or no target available');
    }

    if (spirit.speciesId === target) {
      return EvolutionResult.failure(EvolutionStatus.ALREADY_EVOLVED, 'Spirit is already at target evolution');
    }

    try {
      spirit.evolve(target);
      return EvolutionResult.success(target, `Successfully evolved to ${target}`);
    } catch (error) {
      return EvolutionResult.failure(EvolutionStatus.CONDITIONS_NOT_MET, `Evolution failed: ${error}`);
    }
  }

  /**
   * Get all available evolutions for spirit
   */
  getAvailableEvolutions(spirit: IEvolutionSpiritInstance): string[] {
    const evolutions: string[] = [];

    if (!spirit || !spirit.canEvolve) {
      return evolutions;
    }

    const data = this.speciesData.get(spirit.speciesId);
    if (data && data.evolutionTargetId && this.getEvolutionTarget(spirit)) {
      evolutions.push(data.evolutionTargetId);
    }

    return evolutions;
  }

  /**
   * Get complete evolution chain for species
   */
  getEvolutionChain(speciesId: string): string[] {
    const chain: string[] = [speciesId];
    let currentSpecies = speciesId;

    while (currentSpecies) {
      const data = this.speciesData.get(currentSpecies);
      if (!data || !data.evolutionTargetId) {
        break;
      }

      chain.push(data.evolutionTargetId);
      currentSpecies = data.evolutionTargetId;
    }

    return chain;
  }

  /**
   * Validate all evolution data
   */
  validateEvolutionData(): string[] {
    const errors: string[] = [];

    for (const [speciesId, data] of this.speciesData) {
      const dataErrors = data.validate();
      dataErrors.forEach(error => {
        errors.push(`${speciesId}: ${error}`);
      });
    }

    return errors;
  }

  /**
   * Get evolution statistics
   */
  getEvolutionStatistics(): Record<string, any> {
    const stats = {
      totalSpecies: this.speciesData.size,
      evolvableSpecies: 0,
      totalEvolutions: 0,
      maxChainLength: 0,
      conditionsByType: new Map<EvolutionConditionType, number>()
    };

    for (const data of this.speciesData.values()) {
      if (data.evolutionTargetId) {
        stats.evolvableSpecies++;
        stats.totalEvolutions++;

        const chain = this.getEvolutionChain(data.speciesId);
        stats.maxChainLength = Math.max(stats.maxChainLength, chain.length);
      }

      data.conditions.forEach(condition => {
        const count = stats.conditionsByType.get(condition.conditionType) || 0;
        stats.conditionsByType.set(condition.conditionType, count + 1);
      });
    }

    return {
      ...stats,
      conditionsByType: Object.fromEntries(stats.conditionsByType)
    };
  }
}

/**
 * Utility functions for evolution system
 */
export const EvolutionUtils = {
  /**
   * Create common evolution patterns
   */
  createLevelEvolutionChain(baseSpeciesId: string, levels: number[]): ISpeciesEvolutionData[] {
    const evolutions: ISpeciesEvolutionData[] = [];
    let currentSpecies = baseSpeciesId;

    for (let i = 0; i < levels.length; i++) {
      const nextSpecies = `${baseSpeciesId}_evo_${i + 1}`;
      const evolution = SpeciesEvolutionData.levelEvolution(currentSpecies, nextSpecies, levels[i]);
      evolutions.push(evolution);
      currentSpecies = nextSpecies;
    }

    return evolutions;
  },

  /**
   * Create item-based evolutions
   */
  createItemEvolutions(speciesItems: Record<string, string>): ISpeciesEvolutionData[] {
    return Object.entries(speciesItems).map(([speciesId, itemId]) =>
      SpeciesEvolutionData.itemEvolution(speciesId, `${speciesId}_item_evo`, itemId)
    );
  },

  /**
   * Create sync-based evolutions
   */
  createSyncEvolutions(speciesSync: Record<string, number>): ISpeciesEvolutionData[] {
    return Object.entries(speciesSync).map(([speciesId, syncLevel]) =>
      SpeciesEvolutionData.syncEvolution(speciesId, `${speciesId}_sync_evo`, syncLevel)
    );
  },

  /**
   * Validate evolution chain for circular references
   */
  validateEvolutionChain(manager: IEvolutionManager, startSpeciesId: string): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const current = startSpeciesId;

    while (current) {
      if (visited.has(current)) {
        errors.push(`Circular evolution reference detected at ${current}`);
        break;
      }

      visited.add(current);
      const target = manager.getEvolutionTarget({ speciesId: current } as IEvolutionSpiritInstance);

      if (!target) break;
      current = target;
    }

    return errors;
  },

  /**
   * Get evolution requirements summary
   */
  getEvolutionRequirements(manager: IEvolutionManager, speciesId: string): Record<string, any> {
    const data = manager.speciesData.get(speciesId);
    if (!data) return {};

    const requirements = {
      targetSpecies: data.evolutionTargetId,
      conditions: data.conditions.map(condition => ({
        type: condition.conditionType,
        value: condition.intValue || condition.stringValue,
        description: EvolutionUtils.getConditionDescription(condition)
      }))
    };

    return requirements;
  },

  /**
   * Get human-readable condition description
   */
  getConditionDescription(condition: IEvolutionCondition): string {
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
        return `Evolve during specific time of day`;
      case EvolutionConditionType.AT_LOCATION:
        return `Be at location: ${condition.stringValue}`;
      case EvolutionConditionType.FRIENDSHIP_LEVEL:
        return `Reach friendship level ${condition.intValue}`;
      case EvolutionConditionType.BATTLE_COUNT:
        return `Win ${condition.intValue} battles`;
      case EvolutionConditionType.EVOLUTION_ITEM:
        return `Use evolution item: ${condition.stringValue}`;
      default:
        return `Unknown condition: ${condition.conditionType}`;
    }
  },

  /**
   * Create mock player context for testing
   */
  createMockPlayerContext(): IPlayerContext {
    return {
      playerId: 'test_player',
      currentLocationId: 'test_location',
      gameData: {
        onboardingFlags: new Map([['test_flag', true]]),
        timeOfDay: TimeOfDay.AFTERNOON,
        inventory: new Map([['test_item', 1]])
      },
      getInventory(): Map<string, number> {
        return this.gameData?.inventory || new Map();
      },
      getFlag(flagKey: string): boolean {
        return this.gameData?.onboardingFlags?.get(flagKey) || false;
      },
      getCurrentLocation(): string {
        return this.currentLocationId || '';
      },
      getTimeOfDay(): TimeOfDay {
        return this.gameData?.timeOfDay || TimeOfDay.AFTERNOON;
      }
    };
  },

  /**
   * Create mock spirit for testing
   */
  createMockSpirit(
    speciesId: string,
    level: number = 1,
    options: Partial<IEvolutionSpiritInstance> = {}
  ): IEvolutionSpiritInstance {
    return {
      instanceId: `test_${speciesId}_${Date.now()}`,
      speciesId,
      level,
      syncLevel: 0,
      friendshipLevel: 50,
      battleCount: 0,
      canEvolve: true,
      evolve: (newSpeciesId: string) => {
        console.log(`Evolving from ${speciesId} to ${newSpeciesId}`);
      },
      getSyncPercentage: () => 50,
      hasItem: (itemId: string) => false,
      ...options
    };
  }
};

// Export default instances
export const defaultEvolutionManager = EvolutionManager.create(EvolutionUtils.createMockPlayerContext());
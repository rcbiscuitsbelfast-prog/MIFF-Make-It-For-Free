/**
 * RewardsPure - Reward and Drop System
 *
 * A comprehensive reward and drop system for handling currency, XP, items,
 * and weighted random selection from drop tables. Supports deterministic
 * rewards based on encounter difficulty and player progression.
 *
 * @module RewardsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Basic reward data structure
 */
export interface IRewardStub {
  currency: number;
  xpGain: number;
  itemId?: string;
}

/**
 * Drop table entry with weight for weighted selection
 */
export interface IDropEntry {
  itemId: string;
  weight: number;
}

/**
 * Collection of drop entries for weighted random selection
 */
export interface IDropTable {
  entries: IDropEntry[];
}

/**
 * RNG provider interface (dependency)
 */
export interface IRNGProvider {
  nextInt(min: number, max: number): number;
  nextFloat(min: number, max: number): number;
}

/**
 * Basic reward implementation
 */
export class RewardStub implements IRewardStub {
  private _currency: number;
  private _xpGain: number;
  public itemId?: string;

  constructor(currency: number = 0, xpGain: number = 0, itemId?: string) {
    this._currency = currency;
    this._xpGain = xpGain;
    this.itemId = itemId;
  }

  get currency(): number {
    return Math.max(0, this._currency);
  }

  get xpGain(): number {
    return Math.max(0, this._xpGain);
  }

  /**
   * Create a string representation of the reward
   */
  toString(): string {
    let result = `+${this.currency}c, +${this.xpGain}xp`;
    if (this.itemId) {
      result += `, item:${this.itemId}`;
    }
    return result;
  }

  /**
   * Create a copy of this reward
   */
  clone(): RewardStub {
    return new RewardStub(this.currency, this.xpGain, this.itemId);
  }

  /**
   * Add another reward to this one
   */
  add(other: IRewardStub): void {
    this._currency += Math.max(0, other.currency);
    this._xpGain += Math.max(0, other.xpGain);
    if (other.itemId && !this.itemId) {
      this.itemId = other.itemId;
    }
  }

  /**
   * Multiply reward by a factor
   */
  multiply(factor: number): void {
    this._currency = Math.floor(this._currency * factor);
    this._xpGain = Math.floor(this._xpGain * factor);
  }

  /**
   * Validate reward data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this._currency < 0) {
      errors.push('Currency cannot be negative');
    }

    if (this._xpGain < 0) {
      errors.push('XP gain cannot be negative');
    }

    if (this.itemId !== undefined && this.itemId.trim() === '') {
      errors.push('Item ID cannot be empty string');
    }

    return errors;
  }

  /**
   * Check if reward has any meaningful content
   */
  isEmpty(): boolean {
    return this.currency === 0 && this.xpGain === 0 && !this.itemId;
  }

  /**
   * Get total value (currency + xp equivalent)
   */
  getTotalValue(xpValue: number = 1): number {
    return this.currency + (this.xpGain * xpValue);
  }
}

/**
 * Drop table entry implementation
 */
export class DropEntry implements IDropEntry {
  public itemId: string;
  public weight: number;

  constructor(itemId: string = '', weight: number = 1) {
    this.itemId = itemId;
    this.weight = Math.max(0, weight);
  }

  /**
   * Create a copy of this entry
   */
  clone(): DropEntry {
    return new DropEntry(this.itemId, this.weight);
  }

  /**
   * Validate the entry
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.itemId || this.itemId.trim() === '') {
      errors.push('Item ID cannot be empty');
    }

    if (this.weight < 0) {
      errors.push('Weight cannot be negative');
    }

    return errors;
  }
}

/**
 * Drop table implementation
 */
export class DropTable implements IDropTable {
  public entries: DropEntry[];

  constructor(entries: DropEntry[] = []) {
    this.entries = [...entries];
  }

  /**
   * Add an entry to the table
   */
  addEntry(entry: DropEntry): boolean {
    const errors = entry.validate({});
    if (errors.length > 0) {
      // logger.warn('Invalid drop entry', { errors });
      return false;
    }

    this.entries.push(entry);
    return true;
  }

  /**
   * Remove entries by item ID
   */
  removeEntriesByItem(itemId: string): number {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter((entry: any) => entry.itemId !== itemId);
    return initialLength - this.entries.length;
  }

  /**
   * Get total weight of all entries
   */
  getTotalWeight(): number {
    return this.entries.reduce((sum, entry) => sum + entry.weight, 0);
  }

  /**
   * Get entries sorted by weight (descending)
   */
  getEntriesByWeight(): DropEntry[] {
    return [...this.entries].sort((a: any, b: any) => b.weight - a.weight);
  }

  /**
   * Get drop rate for a specific item
   */
  getDropRate(itemId: string): number {
    const entry = this.entries.find(e => e.itemId === itemId);
    if (!entry) return 0;

    const totalWeight = this.getTotalWeight();
    return totalWeight > 0 ? entry.weight / totalWeight : 0;
  }

  /**
   * Validate the entire table
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.entries.length === 0) {
      errors.push('Drop table must have at least one entry');
    }

    this.entries.forEach((entry, index) => {
      const entryErrors = entry.validate({});
      entryErrors.forEach((error: any) => {
        errors.push(`Entry ${index}: ${error}`);
      });
    });

    return errors;
  }

  /**
   * Create a copy of this table
   */
  clone(): DropTable {
    return new DropTable(this.entries.map((entry: any) => entry.clone()));
  }
}

/**
 * Reward manager for generating rewards based on encounters
 */
export class RewardManager {
  private baseCurrency: number = 5;
  private levelCurrencyMultiplier: number = 1;
  private baseXP: number = 10;
  private levelXPMultiplier: number = 3;

  /**
   * Generate rewards for an encounter
   */
  generateRewards(encounterType: string, playerLevel: number, enemyLevel: number): RewardStub {
    const levelDifference = Math.max(0, enemyLevel - playerLevel);

    const currency = this.baseCurrency + (levelDifference * this.levelCurrencyMultiplier);
    const xp = this.baseXP + (levelDifference * this.levelXPMultiplier);

    return new RewardStub(currency, xp);
  }

  /**
   * Generate rewards with custom multipliers
   */
  generateRewardsCustom(
    encounterType: string,
    playerLevel: number,
    enemyLevel: number,
    currencyMultiplier: number = 1,
    xpMultiplier: number = 1
  ): RewardStub {
    const baseReward = this.generateRewards(encounterType, playerLevel, enemyLevel);

    baseReward.multiply(currencyMultiplier);

    if (xpMultiplier !== 1) {
      (baseReward as any)._xpGain = Math.floor((baseReward as any)._xpGain * xpMultiplier);
    }

    return baseReward;
  }

  /**
   * Generate bonus rewards for special encounters
   */
  generateBonusRewards(
    baseReward: IRewardStub,
    bonusType: 'rare' | 'epic' | 'legendary',
    multiplier: number = 1
  ): RewardStub {
    const bonusReward = new RewardStub(
      baseReward.currency,
      baseReward.xpGain,
      baseReward.itemId
    );

    const bonusMultipliers = {
      'rare': 1.5,
      'epic': 2.0,
      'legendary': 3.0
    };

    const bonusMultiplier = bonusMultipliers[bonusType] || 1.0;
    bonusReward.multiply(bonusMultiplier * multiplier);

    return bonusReward;
  }

  /**
   * Calculate expected reward value
   */
  calculateExpectedValue(
    encounterType: string,
    playerLevel: number,
    enemyLevel: number,
    attempts: number = 100
  ): number {
    const totalValue = Array.from({ length: attempts }, () => {
      const reward = this.generateRewards(encounterType, playerLevel, enemyLevel);
      return reward.getTotalValue();
    }).reduce((sum, value) => sum + value, 0);

    return totalValue / attempts;
  }

  /**
   * Configure reward scaling
   */
  configureScaling(baseCurrency: number, levelCurrencyMultiplier: number, baseXP: number, levelXPMultiplier: number): void {
    this.baseCurrency = Math.max(0, baseCurrency);
    this.levelCurrencyMultiplier = Math.max(0, levelCurrencyMultiplier);
    this.baseXP = Math.max(0, baseXP);
    this.levelXPMultiplier = Math.max(0, levelXPMultiplier);
  }

  /**
   * Get current scaling configuration
   */
  getScalingConfig(): {
    baseCurrency: number;
    levelCurrencyMultiplier: number;
    baseXP: number;
    levelXPMultiplier: number;
  } {
    return {
      baseCurrency: this.baseCurrency,
      levelCurrencyMultiplier: this.levelCurrencyMultiplier,
      baseXP: this.baseXP,
      levelXPMultiplier: this.levelXPMultiplier
    };
  }
}

/**
 * Drop resolver for weighted random selection
 */
export class DropResolver {
  private readonly rng: IRNGProvider;

  constructor(rng: IRNGProvider) {
    if (!rng) {
      throw new Error('RNG provider is required');
    }
    this.rng = rng;
  }

  /**
   * Resolve a single item from the drop table
   */
  resolve(table: IDropTable): string | null {
    if (!table || !table.entries || table.entries.length === 0) {
      return null;
    }

    const totalWeight = table.entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);

    if (totalWeight <= 0) {
      return null;
    }

    const roll = this.rng.nextFloat(0, totalWeight);
    let accumulatedWeight = 0;

    for (const entry of table.entries) {
      accumulatedWeight += Math.max(0, entry.weight);
      if (roll <= accumulatedWeight) {
        return entry.itemId;
      }
    }

    // Fallback to last entry (should not happen)
    return table.entries[table.entries.length - 1].itemId;
  }

  /**
   * Resolve multiple items from the drop table
   */
  resolveMultiple(table: IDropTable, count: number): string[] {
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.resolve(table);
      if (item) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Test drop rates by running multiple simulations
   */
  testDropRates(table: IDropTable, simulations: number = 1000): Map<string, number> {
    const results = new Map<string, number>();

    // Initialize results map
    table.entries.forEach((entry: any) => {
      results.set(entry.itemId, 0);
    });

    // Run simulations
    for (let i = 0; i < simulations; i++) {
      const item = this.resolve(table);
      if (item) {
        results.set(item, (results.get(item) || 0) + 1);
      }
    }

    // Convert to rates
    const totalDrops = Array.from(results.values()).reduce((sum, count) => sum + count, 0);
    if (totalDrops > 0) {
      results.forEach((count, itemId) => {
        results.set(itemId, count / totalDrops);
      });
    }

    return results;
  }

  /**
   * Check if a specific item would drop from the table
   */
  wouldDrop(table: IDropTable, itemId: string): boolean {
    if (!table || !table.entries || table.entries.length === 0) {
      return false;
    }

    return table.entries.some(entry => entry.itemId === itemId);
  }

  /**
   * Get the drop rate for a specific item
   */
  getDropRate(table: IDropTable, itemId: string): number {
    if (!table || !table.entries || table.entries.length === 0) {
      return 0;
    }

    const entry = table.entries.find(e => e.itemId === itemId);
    if (!entry) {
      return 0;
    }

    const totalWeight = table.entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
    return totalWeight > 0 ? entry.weight / totalWeight : 0;
  }
}

/**
 * Utility functions for common reward operations
 */
export const RewardUtils = {
  /**
   * Create a standard reward stub
   */
  createReward(currency: number = 0, xpGain: number = 0, itemId?: string): RewardStub {
    return new RewardStub(currency, xpGain, itemId);
  },

  /**
   * Create a drop table with common items
   */
  createStandardDropTable(items: Array<{ itemId: string; weight: number }>): DropTable {
    const table = new DropTable();
    items.forEach(itemData => {
      table.addEntry(new DropEntry(itemData.itemId, itemData.weight));
    });
    return table;
  },

  /**
   * Create a drop table with guaranteed rare items
   */
  createRareDropTable(
    commonItems: Array<{ itemId: string; weight: number }>,
    rareItems: Array<{ itemId: string; weight: number }>,
    rareChance: number = 0.1
  ): DropTable {
    const table = new DropTable();

    // Add common items with normal weight
    commonItems.forEach((item: any) => {
      table.addEntry(new DropEntry(item.itemId, item.weight));
    });

    // Add rare items with reduced weight
    rareItems.forEach((item: any) => {
      table.addEntry(new DropEntry(item.itemId, item.weight * rareChance));
    });

    return table;
  },

  /**
   * Calculate reward scaling based on level difference
   */
  calculateRewardScaling(playerLevel: number, enemyLevel: number): {
    currencyMultiplier: number;
    xpMultiplier: number;
  } {
    const levelDifference = Math.max(0, enemyLevel - playerLevel);

    return {
      currencyMultiplier: 1 + (levelDifference * 0.2),
      xpMultiplier: 1 + (levelDifference * 0.3)
    };
  },

  /**
   * Merge multiple rewards into one
   */
  mergeRewards(rewards: IRewardStub[]): RewardStub {
    const merged = new RewardStub();

    rewards.forEach((reward: any) => {
      merged.currency += reward.currency;
      merged.xpGain += reward.xpGain;
      if (reward.itemId && !merged.itemId) {
        merged.itemId = reward.itemId;
      }
    });

    return merged;
  },

  /**
   * Split rewards among multiple recipients
   */
  splitRewards(reward: IRewardStub, recipientCount: number): RewardStub[] {
    if (recipientCount <= 0) {
      return [];
    }

    const rewards: RewardStub[] = [];

    for (let i = 0; i < recipientCount; i++) {
      rewards.push(new RewardStub(
        Math.floor(reward.currency / recipientCount),
        Math.floor(reward.xpGain / recipientCount),
        i === 0 ? reward.itemId : undefined // First recipient gets the item
      ));
    }

    // Add remainder to first reward
    if (rewards.length > 0) {
      const remainder = new RewardStub(
        reward.currency % recipientCount,
        reward.xpGain % recipientCount
      );
      rewards[0!].add(remainder);
    }

    return rewards;
  },

  /**
   * Calculate the total value of multiple rewards
   */
  calculateTotalValue(rewards: IRewardStub[], xpValue: number = 1): number {
    return rewards.reduce((total, reward) => total + reward.getTotalValue(xpValue), 0);
  },

  /**
   * Validate reward data
   */
  validateReward(reward: IRewardStub): string[] {
    const errors: string[] = [];

    if (reward.currency < 0) {
      errors.push('Currency cannot be negative');
    }

    if (reward.xpGain < 0) {
      errors.push('XP gain cannot be negative');
    }

    if (reward.itemId !== undefined && reward.itemId.trim() === '') {
      errors.push('Item ID cannot be empty string');
    }

    return errors;
  },

  /**
   * Validate drop table
   */
  validateDropTable(table: IDropTable): string[] {
    const errors: string[] = [];

    if (!table.entries || table.entries.length === 0) {
      errors.push('Drop table must have at least one entry');
    }

    table.entries.forEach((entry, index) => {
      if (!entry.itemId || entry.itemId.trim() === '') {
        errors.push(`Entry ${index}: Item ID cannot be empty`);
      }

      if (entry.weight < 0) {
        errors.push(`Entry ${index}: Weight cannot be negative`);
      }
    });

    return errors;
  }
};

/**
 * Default instances
 */
export const defaultRewardManager = new RewardManager();
export const defaultDropResolver = (rng: IRNGProvider) => new DropResolver(rng);
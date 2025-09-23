/**
 * SyncPure - Spirit Synchronization System
 *
 * A comprehensive spirit synchronization system for tracking sync levels,
 * handling sync events, and managing rhythm challenges. Supports event-driven
 * sync progression with configurable thresholds and challenges.
 *
 * @module SyncPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Built-in triggers that may grant sync
 */
export enum SyncTrigger {
  BATTLE_WIN = 'battle_win',
  ITEM_USAGE = 'item_usage',
  DIALOGUE_CHOICE = 'dialogue_choice',
  RHYTHM_CHALLENGE_SUCCESS = 'rhythm_challenge_success'
}

/**
 * Optional payload for a sync event
 */
export interface ISyncEvent {
  trigger: SyncTrigger;
  magnitude: number;
  tag?: string;
  loreUnlockID?: string;
  evolutionHint?: string;
}

/**
 * Sync challenge configuration
 */
export interface ISyncChallenge {
  bpm: number;
  difficulty: number;
  stemID: string;
}

/**
 * Sync manager configuration
 */
export interface ISyncManagerConfig {
  defaultMaxLevel?: number;
  enableEvents?: boolean;
  autoSave?: boolean;
}

/**
 * Sync level change event callback
 */
export type SyncLevelChangedCallback = (spiritId: string, newLevel: number, oldLevel: number) => void;

/**
 * Sync event data structure
 */
export interface ISyncEventData {
  spiritId: string;
  event: ISyncEvent;
  timestamp: number;
  previousLevel: number;
  newLevel: number;
}

/**
 * Sync statistics
 */
export interface ISyncStatistics {
  totalSyncEvents: number;
  totalSyncGained: number;
  averageSyncPerEvent: number;
  highestSyncLevel: number;
  mostActiveSpirit: string;
}

/**
 * Spirit synchronization entry
 */
export interface ISpiritSyncEntry {
  spiritId: string;
  currentLevel: number;
  thresholds: number[];
  lastUpdate: number;
  totalEvents: number;
  totalSyncGained: number;
}

/**
 * Sync event implementation
 */
export class SyncEvent implements ISyncEvent {
  public trigger: SyncTrigger;
  public magnitude: number;
  public tag?: string;
  public loreUnlockID?: string;
  public evolutionHint?: string;

  constructor(
    trigger: SyncTrigger,
    magnitude: number = 1,
    tag?: string,
    loreUnlockID?: string,
    evolutionHint?: string
  ) {
    this.trigger = trigger;
    this.magnitude = Math.max(0, magnitude);
    this.tag = tag;
    this.loreUnlockID = loreUnlockID;
    this.evolutionHint = evolutionHint;
  }

  /**
   * Create a battle win sync event
   */
  static createBattleWin(battleDifficulty: number = 1): SyncEvent {
    return new SyncEvent(
      SyncTrigger.BATTLE_WIN,
      Math.floor(10 * battleDifficulty),
      `battle_diff_${battleDifficulty}`
    );
  }

  /**
   * Create an item usage sync event
   */
  static createItemUsage(itemId: string, rarityMultiplier: number = 1): SyncEvent {
    return new SyncEvent(
      SyncTrigger.ITEM_USAGE,
      Math.floor(5 * rarityMultiplier),
      itemId,
      undefined,
      `item_${itemId}`
    );
  }

  /**
   * Create a dialogue choice sync event
   */
  static createDialogueChoice(choiceId: string, emotionalWeight: number = 1): SyncEvent {
    return new SyncEvent(
      SyncTrigger.DIALOGUE_CHOICE,
      Math.floor(3 * emotionalWeight),
      choiceId,
      `dialogue_${choiceId}`,
      `choice_${choiceId}`
    );
  }

  /**
   * Create a rhythm challenge sync event
   */
  static createRhythmChallenge(accuracy: number, difficulty: number = 1): SyncEvent {
    return new SyncEvent(
      SyncTrigger.RHYTHM_CHALLENGE_SUCCESS,
      Math.floor(15 * accuracy * difficulty),
      `rhythm_${difficulty}`,
      undefined,
      'rhythm_mastery'
    );
  }

  /**
   * Create a copy of this event
   */
  clone(): SyncEvent {
    return new SyncEvent(
      this.trigger,
      this.magnitude,
      this.tag,
      this.loreUnlockID,
      this.evolutionHint
    );
  }

  /**
   * Validate the sync event
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.magnitude < 0) {
      errors.push('Sync event magnitude cannot be negative');
    }

    if (!this.trigger) {
      errors.push('Sync trigger is required');
    }

    return errors;
  }

  /**
   * Get event summary string
   */
  getSummary(): string {
    let summary = `${this.trigger} (+${this.magnitude} sync)`;
    if (this.tag) {
      summary += ` [${this.tag}]`;
    }
    if (this.evolutionHint) {
      summary += ` -> ${this.evolutionHint}`;
    }
    return summary;
  }
}

/**
 * Sync challenge implementation
 */
export class SyncChallenge implements ISyncChallenge {
  public bpm: number;
  public difficulty: number;
  public stemID: string;

  constructor(bpm: number = 120, difficulty: number = 1, stemID: string = '') {
    this.bpm = Math.max(60, bpm);
    this.difficulty = Math.max(1, Math.min(3, difficulty));
    this.stemID = stemID;
  }

  /**
   * Evaluate performance and return sync gain
   */
  evaluatePerformance(accuracy: number): number {
    // Clamp accuracy to valid range
    accuracy = Math.max(0, Math.min(1, accuracy));

    // Calculate base gain (0-10 points)
    const baseGain = 10.0 * accuracy;

    // Apply difficulty multiplier (1.0, 1.5, or 2.0)
    const difficultyMultiplier = 0.5 + (0.5 * this.difficulty);

    return Math.round(baseGain * difficultyMultiplier);
  }

  /**
   * Get challenge rating string
   */
  getDifficultyRating(): 'Easy' | 'Normal' | 'Hard' {
    switch (this.difficulty) {
      case 1: return 'Easy';
      case 2: return 'Normal';
      case 3: return 'Hard';
      default: return 'Normal';
    }
  }

  /**
   * Get estimated sync gain for perfect performance
   */
  getMaxPotentialSync(): number {
    return this.evaluatePerformance(1.0);
  }

  /**
   * Get estimated sync gain for specific accuracy
   */
  getEstimatedSync(accuracy: number): number {
    return this.evaluatePerformance(accuracy);
  }

  /**
   * Create a copy of this challenge
   */
  clone(): SyncChallenge {
    return new SyncChallenge(this.bpm, this.difficulty, this.stemID);
  }

  /**
   * Validate challenge configuration
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.bpm < 60 || this.bpm > 200) {
      errors.push('BPM must be between 60 and 200');
    }

    if (this.difficulty < 1 || this.difficulty > 3) {
      errors.push('Difficulty must be between 1 and 3');
    }

    if (!this.stemID || this.stemID.trim() === '') {
      errors.push('Stem ID cannot be empty');
    }

    return errors;
  }
}

/**
 * Spirit sync entry implementation
 */
export class SpiritSyncEntry implements ISpiritSyncEntry {
  public spiritId: string;
  public currentLevel: number;
  public thresholds: number[];
  public lastUpdate: number;
  public totalEvents: number;
  public totalSyncGained: number;

  constructor(
    spiritId: string,
    initialLevel: number = 0,
    thresholds: number[] = []
  ) {
    this.spiritId = spiritId;
    this.currentLevel = Math.max(0, initialLevel);
    this.thresholds = [...thresholds].sort((a, b) => a - b);
    this.lastUpdate = Date.now();
    this.totalEvents = 0;
    this.totalSyncGained = 0;
  }

  /**
   * Check if spirit can level up
   */
  get canLevelUp(): boolean {
    if (this.thresholds.length === 0) return false;
    return this.currentLevel < this.thresholds[this.thresholds.length - 1];
  }

  /**
   * Get next threshold level
   */
  get nextThreshold(): number | null {
    const nextIndex = this.thresholds.findIndex(t => t > this.currentLevel);
    return nextIndex !== -1 ? this.thresholds[nextIndex] : null;
  }

  /**
   * Get sync required for next level
   */
  get syncToNextLevel(): number | null {
    const next = this.nextThreshold;
    if (next === null) return null;
    return next - this.currentLevel;
  }

  /**
   * Get current level progress (0-1)
   */
  get levelProgress(): number {
    if (this.thresholds.length === 0) return 1.0;

    const currentThresholdIndex = this.thresholds.findIndex(t => t > this.currentLevel);
    if (currentThresholdIndex === -1) return 1.0; // At max level

    const previousThreshold = currentThresholdIndex > 0 ? this.thresholds[currentThresholdIndex - 1] : 0;
    const nextThreshold = this.thresholds[currentThresholdIndex];

    const progress = this.currentLevel - previousThreshold;
    const required = nextThreshold - previousThreshold;

    return required > 0 ? progress / required : 1.0;
  }

  /**
   * Add sync points
   */
  addSync(amount: number): number {
    if (amount <= 0) return 0;

    const oldLevel = this.currentLevel;
    this.currentLevel = Math.max(0, this.currentLevel + amount);
    this.totalSyncGained += amount;
    this.totalEvents++;
    this.lastUpdate = Date.now();

    return this.currentLevel - oldLevel;
  }

  /**
   * Set exact sync level
   */
  setSyncLevel(level: number): number {
    level = Math.max(0, level);
    const oldLevel = this.currentLevel;
    this.currentLevel = level;
    this.lastUpdate = Date.now();
    return this.currentLevel - oldLevel;
  }

  /**
   * Reset sync level to 0
   */
  resetSync(): number {
    const oldLevel = this.currentLevel;
    this.currentLevel = 0;
    this.lastUpdate = Date.now();
    return oldLevel;
  }

  /**
   * Add threshold
   */
  addThreshold(threshold: number): boolean {
    if (threshold <= 0) return false;
    if (this.thresholds.includes(threshold)) return false;

    this.thresholds.push(threshold);
    this.thresholds.sort((a, b) => a - b);
    return true;
  }

  /**
   * Remove threshold
   */
  removeThreshold(threshold: number): boolean {
    const index = this.thresholds.indexOf(threshold);
    if (index === -1) return false;

    this.thresholds.splice(index, 1);

    // Adjust current level if it exceeds remaining thresholds
    if (this.thresholds.length > 0) {
      const maxThreshold = Math.max(...this.thresholds);
      if (this.currentLevel > maxThreshold) {
        this.currentLevel = maxThreshold;
      }
    }

    return true;
  }

  /**
   * Create a copy of this entry
   */
  clone(): SpiritSyncEntry {
    return new SpiritSyncEntry(
      this.spiritId,
      this.currentLevel,
      [...this.thresholds]
    );
  }

  /**
   * Create snapshot for comparison
   */
  snapshot(): ISpiritSyncEntry {
    return {
      spiritId: this.spiritId,
      currentLevel: this.currentLevel,
      thresholds: [...this.thresholds],
      lastUpdate: this.lastUpdate,
      totalEvents: this.totalEvents,
      totalSyncGained: this.totalSyncGained
    };
  }

  /**
   * Validate entry data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.spiritId || this.spiritId.trim() === '') {
      errors.push('Spirit ID cannot be empty');
    }

    if (this.currentLevel < 0) {
      errors.push('Current level cannot be negative');
    }

    if (this.thresholds.some(t => t < 0)) {
      errors.push('Thresholds cannot contain negative values');
    }

    if (this.thresholds.length > 0 && this.thresholds.some((t, i, arr) => i > 0 && t <= arr[i - 1])) {
      errors.push('Thresholds must be in ascending order');
    }

    return errors;
  }
}

/**
 * Sync manager implementation
 */
export class SyncManager {
  private readonly spiritSync = new Map<string, SpiritSyncEntry>();
  private readonly eventCallbacks: SyncLevelChangedCallback[] = [];
  private readonly config: Required<ISyncManagerConfig>;
  private eventHistory: ISyncEventData[] = [];
  private maxHistorySize: number = 1000;

  constructor(config: ISyncManagerConfig = {}) {
    this.config = {
      defaultMaxLevel: config.defaultMaxLevel || 100,
      enableEvents: config.enableEvents !== false,
      autoSave: config.autoSave || false
    };
  }

  /**
   * Get sync level for a spirit
   */
  getSyncLevel(spiritId: string): number {
    if (!spiritId || spiritId.trim() === '') return 0;

    const entry = this.spiritSync.get(spiritId);
    return entry ? entry.currentLevel : 0;
  }

  /**
   * Get sync entry for a spirit
   */
  getSyncEntry(spiritId: string): SpiritSyncEntry | null {
    if (!spiritId || spiritId.trim() === '') return null;
    return this.spiritSync.get(spiritId) || null;
  }

  /**
   * Increase sync for a spirit
   */
  increaseSync(spiritId: string, amount: number): number {
    if (!spiritId || spiritId.trim() === '' || amount <= 0) return 0;

    let entry = this.spiritSync.get(spiritId);
    if (!entry) {
      entry = new SpiritSyncEntry(spiritId);
      this.spiritSync.set(spiritId, entry);
    }

    const oldLevel = entry.currentLevel;
    const levelIncrease = entry.addSync(amount);

    if (levelIncrease > 0 && this.config.enableEvents) {
      this.triggerSyncLevelChanged(spiritId, entry.currentLevel, oldLevel);
    }

    return levelIncrease;
  }

  /**
   * Process a sync event
   */
  processSyncEvent(spiritId: string, syncEvent: ISyncEvent): number {
    if (!spiritId || !syncEvent) return 0;

    const errors = syncEvent.validate();
    if (errors.length > 0) {
      console.warn('Invalid sync event:', errors);
      return 0;
    }

    const levelIncrease = this.increaseSync(spiritId, syncEvent.magnitude);

    if (levelIncrease > 0) {
      // Record event in history
      this.eventHistory.push({
        spiritId,
        event: syncEvent,
        timestamp: Date.now(),
        previousLevel: this.getSyncLevel(spiritId) - levelIncrease,
        newLevel: this.getSyncLevel(spiritId)
      });

      // Trim history if needed
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
      }
    }

    return levelIncrease;
  }

  /**
   * Process multiple sync events
   */
  processSyncEvents(spiritId: string, events: ISyncEvent[]): number {
    if (!spiritId || !events || events.length === 0) return 0;

    let totalIncrease = 0;
    events.forEach(event => {
      totalIncrease += this.processSyncEvent(spiritId, event);
    });

    return totalIncrease;
  }

  /**
   * Reset sync for a spirit
   */
  resetSync(spiritId: string): number {
    if (!spiritId || spiritId.trim() === '') return 0;

    const entry = this.spiritSync.get(spiritId);
    if (!entry) return 0;

    const oldLevel = entry.currentLevel;
    entry.resetSync();

    if (this.config.enableEvents) {
      this.triggerSyncLevelChanged(spiritId, 0, oldLevel);
    }

    return oldLevel;
  }

  /**
   * Set thresholds for a spirit
   */
  setThresholds(spiritId: string, thresholds: number[]): boolean {
    if (!spiritId || spiritId.trim() === '') return false;

    let entry = this.spiritSync.get(spiritId);
    if (!entry) {
      entry = new SpiritSyncEntry(spiritId);
      this.spiritSync.set(spiritId, entry);
    }

    // Validate thresholds
    if (thresholds.some(t => t < 0)) return false;

    thresholds.forEach(threshold => {
      entry.addThreshold(threshold);
    });

    return true;
  }

  /**
   * Get all spirits with sync data
   */
  getAllSpirits(): string[] {
    return Array.from(this.spiritSync.keys());
  }

  /**
   * Get spirits at specific sync level
   */
  getSpiritsAtLevel(level: number): string[] {
    return Array.from(this.spiritSync.entries())
      .filter(([_, entry]) => entry.currentLevel === level)
      .map(([spiritId, _]) => spiritId);
  }

  /**
   * Get spirits above threshold
   */
  getSpiritsAboveThreshold(threshold: number): string[] {
    return Array.from(this.spiritSync.entries())
      .filter(([_, entry]) => entry.currentLevel >= threshold)
      .map(([spiritId, _]) => spiritId);
  }

  /**
   * Get sync statistics
   */
  getStatistics(): ISyncStatistics {
    const entries = Array.from(this.spiritSync.values());

    if (entries.length === 0) {
      return {
        totalSyncEvents: 0,
        totalSyncGained: 0,
        averageSyncPerEvent: 0,
        highestSyncLevel: 0,
        mostActiveSpirit: ''
      };
    }

    const totalEvents = entries.reduce((sum, entry) => sum + entry.totalEvents, 0);
    const totalSync = entries.reduce((sum, entry) => sum + entry.totalSyncGained, 0);
    const highestLevel = Math.max(...entries.map(entry => entry.currentLevel));

    const mostActiveSpirit = entries.reduce((mostActive, current) => {
      return current.totalEvents > (this.spiritSync.get(mostActive)?.totalEvents || 0) ? current.spiritId : mostActive;
    }, '');

    return {
      totalSyncEvents: totalEvents,
      totalSyncGained: totalSync,
      averageSyncPerEvent: totalEvents > 0 ? totalSync / totalEvents : 0,
      highestSyncLevel: highestLevel,
      mostActiveSpirit
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): ISyncEventData[] {
    const history = [...this.eventHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Add sync level changed callback
   */
  addSyncLevelChangedCallback(callback: SyncLevelChangedCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Remove sync level changed callback
   */
  removeSyncLevelChangedCallback(callback: SyncLevelChangedCallback): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index !== -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }

  /**
   * Clear all sync data
   */
  clear(): void {
    this.spiritSync.clear();
    this.eventHistory.length = 0;
  }

  /**
   * Export sync data
   */
  exportData(): Record<string, ISpiritSyncEntry> {
    const data: Record<string, ISpiritSyncEntry> = {};
    this.spiritSync.forEach((entry, spiritId) => {
      data[spiritId] = entry.snapshot();
    });
    return data;
  }

  /**
   * Import sync data
   */
  importData(data: Record<string, ISpiritSyncEntry>): void {
    Object.entries(data).forEach(([spiritId, entryData]) => {
      const entry = new SpiritSyncEntry(
        entryData.spiritId,
        entryData.currentLevel,
        entryData.thresholds
      );
      this.spiritSync.set(spiritId, entry);
    });
  }

  /**
   * Get spirits ready to level up
   */
  getSpiritsReadyToLevelUp(): string[] {
    return Array.from(this.spiritSync.entries())
      .filter(([_, entry]) => entry.canLevelUp)
      .map(([spiritId, _]) => spiritId);
  }

  /**
   * Get level up candidates with required sync
   */
  getLevelUpCandidates(): Array<{ spiritId: string; syncNeeded: number }> {
    return Array.from(this.spiritSync.entries())
      .map(([spiritId, entry]) => ({
        spiritId,
        syncNeeded: entry.syncToNextLevel || 0
      }))
      .filter(candidate => candidate.syncNeeded > 0)
      .sort((a, b) => a.syncNeeded - b.syncNeeded);
  }

  /**
   * Trigger sync level changed event
   */
  private triggerSyncLevelChanged(spiritId: string, newLevel: number, oldLevel: number): void {
    if (newLevel === oldLevel) return;

    this.eventCallbacks.forEach(callback => {
      try {
        callback(spiritId, newLevel, oldLevel);
      } catch (error) {
        console.warn('Sync level changed callback error:', error);
      }
    });
  }
}

/**
 * Utility functions for sync operations
 */
export const SyncUtils = {
  /**
   * Create standard sync thresholds
   */
  createStandardThresholds(maxLevel: number = 100): number[] {
    const thresholds: number[] = [];
    for (let i = 10; i <= maxLevel; i += 10) {
      thresholds.push(i);
    }
    return thresholds;
  },

  /**
   * Create exponential sync thresholds
   */
  createExponentialThresholds(baseAmount: number = 10, maxLevel: number = 100): number[] {
    const thresholds: number[] = [];
    let current = baseAmount;

    while (current <= maxLevel) {
      thresholds.push(current);
      current = Math.floor(current * 1.5);
    }

    return thresholds;
  },

  /**
   * Calculate sync gain for battle
   */
  calculateBattleSyncGain(
    playerLevel: number,
    enemyLevel: number,
    victory: boolean = true,
    difficultyMultiplier: number = 1
  ): number {
    if (!victory) return 0;

    const levelDifference = Math.max(0, enemyLevel - playerLevel);
    return Math.floor((10 + levelDifference * 2) * difficultyMultiplier);
  },

  /**
   * Calculate sync gain for item usage
   */
  calculateItemSyncGain(itemRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): number {
    const rarityMultipliers = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'epic': 5,
      'legendary': 8
    };

    return rarityMultipliers[itemRarity] || 1;
  },

  /**
   * Calculate sync gain for rhythm challenge
   */
  calculateRhythmSyncGain(accuracy: number, difficulty: number = 1): number {
    accuracy = Math.max(0, Math.min(1, accuracy));
    const baseGain = 15 * accuracy;
    const difficultyMultiplier = 0.5 + (0.5 * difficulty);
    return Math.round(baseGain * difficultyMultiplier);
  },

  /**
   * Get sync level progress string
   */
  getSyncProgressString(entry: SpiritSyncEntry): string {
    if (!entry.canLevelUp) {
      return `Max Level (${entry.currentLevel})`;
    }

    const progress = Math.round(entry.levelProgress * 100);
    const syncNeeded = entry.syncToNextLevel || 0;

    return `${entry.currentLevel} → ${entry.nextThreshold} (${progress}% - ${syncNeeded} sync needed)`;
  },

  /**
   * Format sync event for display
   */
  formatSyncEvent(eventData: ISyncEventData): string {
    return `${eventData.spiritId}: ${eventData.event.getSummary()} (${eventData.previousLevel} → ${eventData.newLevel})`;
  },

  /**
   * Validate sync manager state
   */
  validateSyncManager(manager: SyncManager): string[] {
    const errors: string[] = [];

    try {
      const stats = manager.getStatistics();

      if (stats.totalSyncEvents < 0) {
        errors.push('Total sync events cannot be negative');
      }

      if (stats.totalSyncGained < 0) {
        errors.push('Total sync gained cannot be negative');
      }

      if (stats.highestSyncLevel < 0) {
        errors.push('Highest sync level cannot be negative');
      }

      // Check individual spirits
      manager.getAllSpirits().forEach(spiritId => {
        const entry = manager.getSyncEntry(spiritId);
        if (entry) {
          const entryErrors = entry.validate();
          entryErrors.forEach(error => {
            errors.push(`${spiritId}: ${error}`);
          });
        }
      });
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return errors;
  }
};

/**
 * Default sync manager instance
 */
export const defaultSyncManager = new SyncManager();
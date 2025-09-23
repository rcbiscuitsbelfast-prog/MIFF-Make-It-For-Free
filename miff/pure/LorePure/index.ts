/**
 * LorePure - Lore Management System
 *
 * A comprehensive lore management system for tracking story entries, unlock conditions,
 * and narrative progression. Supports quest flags, spirit capture, sync levels,
 * location visits, and manual unlocks with flexible condition combinations.
 *
 * @module LorePure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Lore condition type enumeration
 */
export enum LoreConditionType {
  QUEST_FLAG = 'quest_flag',
  SPIRIT_CAPTURED = 'spirit_captured',
  SYNC_LEVEL_REACHED = 'sync_level_reached',
  LOCATION_VISITED = 'location_visited',
  MANUAL_UNLOCK = 'manual_unlock',
  ALWAYS_TRUE = 'always_true'
}

/**
 * Lore category enumeration
 */
export enum LoreCategory {
  MAIN_STORY = 'main_story',
  SIDE_STORY = 'side_story',
  CHARACTER = 'character',
  WORLD = 'world',
  SPIRIT = 'spirit',
  LOCATION = 'location',
  QUEST = 'quest',
  MYSTERY = 'mystery'
}

/**
 * Lore unlock state enumeration
 */
export enum LoreUnlockState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  READ = 'read'
}

/**
 * Player context interface (dependency)
 */
export interface IPlayerContext {
  hasQuestFlag(flagId: string): boolean;
  hasCapturedSpirit(spiritId: string): boolean;
  getSpiritSyncLevel(spiritId: string): number;
  hasVisitedLocation(locationId: string): boolean;
  getPlayerLevel(): number;
  getCompletedQuests(): string[];
  getUnlockedLocations(): string[];
  getCapturedSpirits(): string[];
  [key: string]: any;
}

/**
 * Lore entry interface
 */
export interface ILoreEntry {
  loreId: string;
  title: string;
  text: string;
  unlockCondition: ILoreUnlockCondition;
  relatedSpiritId?: string;
  locationId?: string;
  questId?: string;
  syncThreshold: number;
  category: LoreCategory;
  unlockState: LoreUnlockState;
  unlockTime?: number;
  readTime?: number;
  priority: number;
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * Lore unlock condition interface
 */
export interface ILoreUnlockCondition {
  conditionType: LoreConditionType;
  stringValue?: string;
  intValue: number;
  isMet(playerContext: IPlayerContext, loreEntry: ILoreEntry): boolean;
  validate(): string[];
  getDescription(): string;
}

/**
 * Lore filter interface
 */
export interface ILoreFilter {
  category?: LoreCategory;
  unlockState?: LoreUnlockState;
  relatedSpiritId?: string;
  locationId?: string;
  questId?: string;
  tags?: string[];
  minPriority?: number;
  maxPriority?: number;
  unlockedBefore?: number;
  unlockedAfter?: number;
  searchText?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lore statistics interface
 */
export interface ILoreStatistics {
  totalEntries: number;
  unlockedEntries: number;
  readEntries: number;
  entriesByCategory: Record<LoreCategory, number>;
  entriesByUnlockState: Record<LoreUnlockState, number>;
  totalWords: number;
  averageEntryLength: number;
  mostRecentUnlock?: number;
  oldestEntry?: number;
}

/**
 * Lore entry implementation
 */
export class LoreEntry implements ILoreEntry {
  public loreId: string;
  public title: string;
  public text: string;
  public unlockCondition: LoreUnlockCondition;
  public relatedSpiritId?: string;
  public locationId?: string;
  public questId?: string;
  public syncThreshold: number;
  public category: LoreCategory;
  public unlockState: LoreUnlockState;
  public unlockTime?: number;
  public readTime?: number;
  public priority: number;
  public tags: string[];
  public metadata?: Record<string, any>;

  constructor(
    loreId: string,
    title: string,
    text: string,
    unlockCondition: LoreUnlockCondition,
    category: LoreCategory = LoreCategory.MAIN_STORY,
    priority: number = 1,
    tags: string[] = [],
    relatedSpiritId?: string,
    locationId?: string,
    questId?: string,
    syncThreshold: number = 0,
    metadata?: Record<string, any>
  ) {
    this.loreId = loreId;
    this.title = title;
    this.text = text;
    this.unlockCondition = unlockCondition;
    this.category = category;
    this.priority = priority;
    this.tags = [...tags];
    this.relatedSpiritId = relatedSpiritId;
    this.locationId = locationId;
    this.questId = questId;
    this.syncThreshold = syncThreshold;
    this.unlockState = LoreUnlockState.LOCKED;
    this.metadata = metadata;
  }

  /**
   * Create lore entry with specific parameters
   */
  static create(
    loreId: string,
    title: string,
    text: string,
    unlockCondition: LoreUnlockCondition,
    category: LoreCategory = LoreCategory.MAIN_STORY,
    priority: number = 1,
    tags: string[] = [],
    relatedSpiritId?: string,
    locationId?: string,
    questId?: string,
    syncThreshold: number = 0,
    metadata?: Record<string, any>
  ): LoreEntry {
    return new LoreEntry(
      loreId,
      title,
      text,
      unlockCondition,
      category,
      priority,
      tags,
      relatedSpiritId,
      locationId,
      questId,
      syncThreshold,
      metadata
    );
  }

  /**
   * Create main story entry
   */
  static mainStory(
    loreId: string,
    title: string,
    text: string,
    unlockCondition: LoreUnlockCondition,
    priority: number = 1,
    tags: string[] = []
  ): LoreEntry {
    return new LoreEntry(loreId, title, text, unlockCondition, LoreCategory.MAIN_STORY, priority, tags);
  }

  /**
   * Create character lore entry
   */
  static character(
    loreId: string,
    title: string,
    text: string,
    relatedSpiritId: string,
    unlockCondition: LoreUnlockCondition,
    priority: number = 1,
    tags: string[] = []
  ): LoreEntry {
    return new LoreEntry(
      loreId,
      title,
      text,
      unlockCondition,
      LoreCategory.CHARACTER,
      priority,
      tags,
      relatedSpiritId
    );
  }

  /**
   * Create world lore entry
   */
  static world(
    loreId: string,
    title: string,
    text: string,
    locationId: string,
    unlockCondition: LoreUnlockCondition,
    priority: number = 1,
    tags: string[] = []
  ): LoreEntry {
    return new LoreEntry(
      loreId,
      title,
      text,
      unlockCondition,
      LoreCategory.WORLD,
      priority,
      tags,
      undefined,
      locationId
    );
  }

  /**
   * Check if entry is unlocked
   */
  isUnlocked(playerContext: IPlayerContext): boolean {
    if (this.unlockState === LoreUnlockState.UNLOCKED) {
      return true;
    }

    const isMet = this.unlockCondition.isMet(playerContext, this);
    if (isMet) {
      this.unlockState = LoreUnlockState.UNLOCKED;
      this.unlockTime = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Mark entry as read
   */
  markAsRead(): void {
    if (this.unlockState === LoreUnlockState.UNLOCKED) {
      this.unlockState = LoreUnlockState.READ;
      this.readTime = Date.now();
    }
  }

  /**
   * Check if entry is read
   */
  isRead(): boolean {
    return this.unlockState === LoreUnlockState.READ;
  }

  /**
   * Get word count
   */
  getWordCount(): number {
    return this.text.split(/\s+/).length;
  }

  /**
   * Get character count
   */
  getCharacterCount(): number {
    return this.text.length;
  }

  /**
   * Get reading time estimate (words per minute)
   */
  getReadingTimeEstimate(wordsPerMinute: number = 200): number {
    return Math.ceil(this.getWordCount() / wordsPerMinute);
  }

  /**
   * Get entry summary
   */
  getSummary(): string {
    const previewLength = 100;
    const preview = this.text.length > previewLength
      ? this.text.substring(0, previewLength) + '...'
      : this.text;

    const unlockStatus = this.unlockState === LoreUnlockState.LOCKED ? '[Locked]' :
                        this.unlockState === LoreUnlockState.UNLOCKED ? '[Unlocked]' : '[Read]';

    return `${unlockStatus} ${this.title} - ${preview}`;
  }

  /**
   * Check if entry matches tags
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Check if entry matches all tags
   */
  hasAllTags(tags: string[]): boolean {
    return tags.every(tag => this.tags.includes(tag));
  }

  /**
   * Check if entry matches any tags
   */
  hasAnyTag(tags: string[]): boolean {
    return tags.some(tag => this.tags.includes(tag));
  }

  /**
   * Add tag to entry
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Remove tag from entry
   */
  removeTag(tag: string): boolean {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clone entry
   */
  clone(): LoreEntry {
    const cloned = new LoreEntry(
      this.loreId,
      this.title,
      this.text,
      this.unlockCondition.clone(),
      this.category,
      this.priority,
      [...this.tags],
      this.relatedSpiritId,
      this.locationId,
      this.questId,
      this.syncThreshold,
      this.metadata ? { ...this.metadata } : undefined
    );

    cloned.unlockState = this.unlockState;
    cloned.unlockTime = this.unlockTime;
    cloned.readTime = this.readTime;

    return cloned;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      loreId: this.loreId,
      title: this.title,
      text: this.text,
      unlockCondition: this.unlockCondition.toJSON(),
      category: this.category,
      priority: this.priority,
      tags: [...this.tags],
      relatedSpiritId: this.relatedSpiritId,
      locationId: this.locationId,
      questId: this.questId,
      syncThreshold: this.syncThreshold,
      unlockState: this.unlockState,
      unlockTime: this.unlockTime,
      readTime: this.readTime,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): LoreEntry {
    const condition = LoreUnlockCondition.fromJSON(data.unlockCondition);
    const entry = new LoreEntry(
      data.loreId,
      data.title,
      data.text,
      condition,
      data.category,
      data.priority,
      data.tags || [],
      data.relatedSpiritId,
      data.locationId,
      data.questId,
      data.syncThreshold,
      data.metadata
    );

    entry.unlockState = data.unlockState;
    entry.unlockTime = data.unlockTime;
    entry.readTime = data.readTime;

    return entry;
  }

  /**
   * Validate entry
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.loreId || this.loreId.trim() === '') {
      errors.push('Lore ID cannot be empty');
    }

    if (!this.title || this.title.trim() === '') {
      errors.push('Title cannot be empty');
    }

    if (!this.text || this.text.trim() === '') {
      errors.push('Text cannot be empty');
    }

    if (this.priority < 0 || this.priority > 10) {
      errors.push('Priority must be between 0 and 10');
    }

    const conditionErrors = this.unlockCondition.validate();
    errors.push(...conditionErrors.map(error => `Condition: ${error}`));

    return errors;
  }
}

/**
 * Lore unlock condition implementation
 */
export class LoreUnlockCondition implements ILoreUnlockCondition {
  public conditionType: LoreConditionType;
  public stringValue?: string;
  public intValue: number;

  constructor(
    conditionType: LoreConditionType = LoreConditionType.ALWAYS_TRUE,
    stringValue?: string,
    intValue: number = 0
  ) {
    this.conditionType = conditionType;
    this.stringValue = stringValue;
    this.intValue = intValue;
  }

  /**
   * Create condition with specific parameters
   */
  static create(
    conditionType: LoreConditionType,
    stringValue?: string,
    intValue: number = 0
  ): LoreUnlockCondition {
    return new LoreUnlockCondition(conditionType, stringValue, intValue);
  }

  /**
   * Create quest flag condition
   */
  static questFlag(flagId: string): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.QUEST_FLAG, flagId);
  }

  /**
   * Create spirit captured condition
   */
  static spiritCaptured(spiritId: string): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.SPIRIT_CAPTURED, spiritId);
  }

  /**
   * Create sync level condition
   */
  static syncLevel(spiritId: string, threshold: number): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.SYNC_LEVEL_REACHED, spiritId, threshold);
  }

  /**
   * Create location visited condition
   */
  static locationVisited(locationId: string): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.LOCATION_VISITED, locationId);
  }

  /**
   * Create manual unlock condition
   */
  static manualUnlock(): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.MANUAL_UNLOCK);
  }

  /**
   * Create always true condition
   */
  static alwaysTrue(): LoreUnlockCondition {
    return new LoreUnlockCondition(LoreConditionType.ALWAYS_TRUE);
  }

  /**
   * Check if condition is met
   */
  isMet(playerContext: IPlayerContext, loreEntry: ILoreEntry): boolean {
    switch (this.conditionType) {
      case LoreConditionType.QUEST_FLAG:
        return this.hasQuestFlag(playerContext, this.stringValue || loreEntry.questId || '');
      case LoreConditionType.SPIRIT_CAPTURED:
        return this.isSpiritCaptured(playerContext, this.stringValue || loreEntry.relatedSpiritId || '');
      case LoreConditionType.SYNC_LEVEL_REACHED:
        return this.isSyncReached(
          playerContext,
          this.stringValue || loreEntry.relatedSpiritId || '',
          this.intValue > 0 ? this.intValue : loreEntry.syncThreshold
        );
      case LoreConditionType.LOCATION_VISITED:
        return this.isLocationVisited(playerContext, this.stringValue || loreEntry.locationId || '');
      case LoreConditionType.MANUAL_UNLOCK:
        return false; // Manual unlock requires explicit action
      case LoreConditionType.ALWAYS_TRUE:
        return true;
      default:
        return false;
    }
  }

  /**
   * Check quest flag condition
   */
  private hasQuestFlag(playerContext: IPlayerContext, flagId: string): boolean {
    if (!flagId) return false;
    return playerContext.hasQuestFlag(flagId);
  }

  /**
   * Check spirit captured condition
   */
  private isSpiritCaptured(playerContext: IPlayerContext, spiritId: string): boolean {
    if (!spiritId) return false;
    return playerContext.hasCapturedSpirit(spiritId);
  }

  /**
   * Check sync level condition
   */
  private isSyncReached(playerContext: IPlayerContext, spiritId: string, threshold: number): boolean {
    if (!spiritId || threshold <= 0) return false;
    const currentLevel = playerContext.getSpiritSyncLevel(spiritId);
    return currentLevel >= threshold;
  }

  /**
   * Check location visited condition
   */
  private isLocationVisited(playerContext: IPlayerContext, locationId: string): boolean {
    if (!locationId) return false;
    return playerContext.hasVisitedLocation(locationId);
  }

  /**
   * Get condition description
   */
  getDescription(): string {
    switch (this.conditionType) {
      case LoreConditionType.QUEST_FLAG:
        return `Complete quest flag: ${this.stringValue}`;
      case LoreConditionType.SPIRIT_CAPTURED:
        return `Capture spirit: ${this.stringValue}`;
      case LoreConditionType.SYNC_LEVEL_REACHED:
        return `Reach sync level ${this.intValue} with spirit: ${this.stringValue}`;
      case LoreConditionType.LOCATION_VISITED:
        return `Visit location: ${this.stringValue}`;
      case LoreConditionType.MANUAL_UNLOCK:
        return 'Manual unlock required';
      case LoreConditionType.ALWAYS_TRUE:
        return 'Always available';
      default:
        return 'Unknown condition';
    }
  }

  /**
   * Validate condition
   */
  validate(): string[] {
    const errors: string[] = [];

    switch (this.conditionType) {
      case LoreConditionType.QUEST_FLAG:
      case LoreConditionType.SPIRIT_CAPTURED:
      case LoreConditionType.LOCATION_VISITED:
        if (!this.stringValue || this.stringValue.trim() === '') {
          errors.push('String value required for this condition type');
        }
        break;
      case LoreConditionType.SYNC_LEVEL_REACHED:
        if (this.intValue <= 0) {
          errors.push('Sync threshold must be positive');
        }
        break;
      case LoreConditionType.ALWAYS_TRUE:
      case LoreConditionType.MANUAL_UNLOCK:
        // No validation needed
        break;
      default:
        errors.push('Unknown condition type');
    }

    return errors;
  }

  /**
   * Clone condition
   */
  clone(): LoreUnlockCondition {
    return new LoreUnlockCondition(
      this.conditionType,
      this.stringValue,
      this.intValue
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      conditionType: this.conditionType,
      stringValue: this.stringValue,
      intValue: this.intValue
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): LoreUnlockCondition {
    return new LoreUnlockCondition(
      data.conditionType,
      data.stringValue,
      data.intValue
    );
  }
}

/**
 * Lore codex manager implementation
 */
export class LoreCodexManager {
  private readonly allEntries = new Map<string, LoreEntry>();
  private readonly unlockedEntries = new Set<string>();
  private readonly readEntries = new Set<string>();

  /**
   * Register lore entry
   */
  registerLore(entry: LoreEntry): boolean {
    if (!entry || !entry.loreId || entry.loreId.trim() === '') {
      console.warn('Invalid lore entry registration: missing or empty lore ID');
      return false;
    }

    const errors = entry.validate();
    if (errors.length > 0) {
      console.warn(`Invalid lore entry ${entry.loreId}:`, errors);
      return false;
    }

    this.allEntries.set(entry.loreId, entry);
    return true;
  }

  /**
   * Get lore entry by ID
   */
  getLoreEntry(loreId: string): LoreEntry | null {
    return this.allEntries.get(loreId) || null;
  }

  /**
   * Get all lore entries
   */
  getAllLoreEntries(): LoreEntry[] {
    return Array.from(this.allEntries.values());
  }

  /**
   * Unlock lore entry
   */
  unlockLore(loreId: string): boolean {
    if (!loreId || !this.allEntries.has(loreId)) {
      return false;
    }

    this.unlockedEntries.add(loreId);
    return true;
  }

  /**
   * Check if lore is unlocked
   */
  isLoreUnlocked(loreId: string): boolean {
    return this.unlockedEntries.has(loreId);
  }

  /**
   * Mark lore as read
   */
  markLoreAsRead(loreId: string): boolean {
    if (!this.isLoreUnlocked(loreId)) {
      return false;
    }

    this.readEntries.add(loreId);
    const entry = this.allEntries.get(loreId);
    if (entry) {
      entry.markAsRead();
    }

    return true;
  }

  /**
   * Check if lore is read
   */
  isLoreRead(loreId: string): boolean {
    return this.readEntries.has(loreId);
  }

  /**
   * Get unlocked lore entries
   */
  getUnlockedLoreEntries(): LoreEntry[] {
    return Array.from(this.unlockedEntries)
      .map(id => this.allEntries.get(id))
      .filter((entry): entry is LoreEntry => entry !== undefined);
  }

  /**
   * Get read lore entries
   */
  getReadLoreEntries(): LoreEntry[] {
    return Array.from(this.readEntries)
      .map(id => this.allEntries.get(id))
      .filter((entry): entry is LoreEntry => entry !== undefined && entry.isRead());
  }

  /**
   * Get filtered lore entries
   */
  getFilteredLoreEntries(filter: ILoreFilter): LoreEntry[] {
    let entries = this.getAllLoreEntries();

    // Apply filters
    if (filter.category) {
      entries = entries.filter(entry => entry.category === filter.category);
    }

    if (filter.unlockState) {
      entries = entries.filter(entry => entry.unlockState === filter.unlockState);
    }

    if (filter.relatedSpiritId) {
      entries = entries.filter(entry => entry.relatedSpiritId === filter.relatedSpiritId);
    }

    if (filter.locationId) {
      entries = entries.filter(entry => entry.locationId === filter.locationId);
    }

    if (filter.questId) {
      entries = entries.filter(entry => entry.questId === filter.questId);
    }

    if (filter.tags && filter.tags.length > 0) {
      entries = entries.filter(entry => entry.hasAnyTag(filter.tags!));
    }

    if (filter.minPriority !== undefined) {
      entries = entries.filter(entry => entry.priority >= filter.minPriority!);
    }

    if (filter.maxPriority !== undefined) {
      entries = entries.filter(entry => entry.priority <= filter.maxPriority!);
    }

    if (filter.unlockedBefore) {
      entries = entries.filter(entry => (entry.unlockTime || 0) < filter.unlockedBefore!);
    }

    if (filter.unlockedAfter) {
      entries = entries.filter(entry => (entry.unlockTime || 0) > filter.unlockedAfter!);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      entries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.text.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    if (filter.offset) {
      entries = entries.slice(filter.offset);
    }

    if (filter.limit) {
      entries = entries.slice(0, filter.limit);
    }

    return entries;
  }

  /**
   * Get lore statistics
   */
  getStatistics(): ILoreStatistics {
    const allEntries = this.getAllLoreEntries();
    const unlockedEntries = this.getUnlockedLoreEntries();
    const readEntries = this.getReadLoreEntries();

    const entriesByCategory: Record<LoreCategory, number> = {
      [LoreCategory.MAIN_STORY]: 0,
      [LoreCategory.SIDE_STORY]: 0,
      [LoreCategory.CHARACTER]: 0,
      [LoreCategory.WORLD]: 0,
      [LoreCategory.SPIRIT]: 0,
      [LoreCategory.LOCATION]: 0,
      [LoreCategory.QUEST]: 0,
      [LoreCategory.MYSTERY]: 0
    };

    const entriesByUnlockState: Record<LoreUnlockState, number> = {
      [LoreUnlockState.LOCKED]: 0,
      [LoreUnlockState.UNLOCKED]: 0,
      [LoreUnlockState.READ]: 0
    };

    let totalWords = 0;
    let mostRecentUnlock: number | undefined;
    let oldestEntry: number | undefined;

    allEntries.forEach(entry => {
      entriesByCategory[entry.category]++;
      entriesByUnlockState[entry.unlockState]++;

      totalWords += entry.getWordCount();

      if (entry.unlockTime && (!mostRecentUnlock || entry.unlockTime > mostRecentUnlock)) {
        mostRecentUnlock = entry.unlockTime;
      }

      // Assuming entries are ordered by creation, use array index as proxy for age
      if (oldestEntry === undefined) {
        oldestEntry = Date.now(); // Placeholder
      }
    });

    const averageEntryLength = allEntries.length > 0 ? totalWords / allEntries.length : 0;

    return {
      totalEntries: allEntries.length,
      unlockedEntries: unlockedEntries.length,
      readEntries: readEntries.length,
      entriesByCategory,
      entriesByUnlockState,
      totalWords,
      averageEntryLength,
      mostRecentUnlock,
      oldestEntry
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.allEntries.clear();
    this.unlockedEntries.clear();
    this.readEntries.clear();
  }

  /**
   * Get entry count
   */
  getEntryCount(): number {
    return this.allEntries.size;
  }

  /**
   * Get unlocked count
   */
  getUnlockedCount(): number {
    return this.unlockedEntries.size;
  }

  /**
   * Get read count
   */
  getReadCount(): number {
    return this.readEntries.size;
  }

  /**
   * Bulk unlock entries
   */
  bulkUnlockLore(loreIds: string[]): number {
    let unlockedCount = 0;
    loreIds.forEach(loreId => {
      if (this.unlockLore(loreId)) {
        unlockedCount++;
      }
    });
    return unlockedCount;
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    const entries = this.getAllLoreEntries().map(entry => entry.toJSON());
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Import from JSON
   */
  static importFromJSON(jsonData: string): LoreCodexManager {
    const manager = new LoreCodexManager();
    const entries: Record<string, any>[] = JSON.parse(jsonData);

    entries.forEach(entryData => {
      const entry = LoreEntry.fromJSON(entryData);
      manager.registerLore(entry);

      if (entry.unlockState === LoreUnlockState.UNLOCKED) {
        manager.unlockedEntries.add(entry.loreId);
      }

      if (entry.unlockState === LoreUnlockState.READ) {
        manager.readEntries.add(entry.loreId);
      }
    });

    return manager;
  }
}

/**
 * Utility functions for lore operations
 */
export const LoreUtils = {
  /**
   * Create default player context for testing
   */
  createDefaultPlayerContext(): IPlayerContext {
    const questFlags = new Set<string>();
    const capturedSpirits = new Set<string>();
    const visitedLocations = new Set<string>();

    return {
      hasQuestFlag: (flagId: string) => questFlags.has(flagId),
      hasCapturedSpirit: (spiritId: string) => capturedSpirits.has(spiritId),
      getSpiritSyncLevel: (spiritId: string) => 0,
      hasVisitedLocation: (locationId: string) => visitedLocations.has(locationId),
      getPlayerLevel: () => 1,
      getCompletedQuests: () => [],
      getUnlockedLocations: () => Array.from(visitedLocations),
      getCapturedSpirits: () => Array.from(capturedSpirits)
    };
  },

  /**
   * Create standard lore filters
   */
  createFilter: {
    byCategory: (category: LoreCategory): ILoreFilter => ({ category }),
    byUnlockState: (unlockState: LoreUnlockState): ILoreFilter => ({ unlockState }),
    bySpirit: (spiritId: string): ILoreFilter => ({ relatedSpiritId: spiritId }),
    byLocation: (locationId: string): ILoreFilter => ({ locationId }),
    byQuest: (questId: string): ILoreFilter => ({ questId }),
    byTag: (tag: string): ILoreFilter => ({ tags: [tag] }),
    unlockedOnly: (): ILoreFilter => ({ unlockState: LoreUnlockState.UNLOCKED }),
    lockedOnly: (): ILoreFilter => ({ unlockState: LoreUnlockState.LOCKED }),
    readOnly: (): ILoreFilter => ({ unlockState: LoreUnlockState.READ }),
    highPriority: (minPriority: number = 5): ILoreFilter => ({ minPriority }),
    search: (searchText: string): ILoreFilter => ({ searchText })
  },

  /**
   * Validate lore entry
   */
  validateLoreEntry(entry: ILoreEntry): string[] {
    const errors: string[] = [];

    if (!entry.loreId || entry.loreId.trim() === '') {
      errors.push('Lore ID cannot be empty');
    }

    if (!entry.title || entry.title.trim() === '') {
      errors.push('Title cannot be empty');
    }

    if (!entry.text || entry.text.trim() === '') {
      errors.push('Text cannot be empty');
    }

    if (entry.priority < 0 || entry.priority > 10) {
      errors.push('Priority must be between 0 and 10');
    }

    const conditionErrors = entry.unlockCondition.validate();
    errors.push(...conditionErrors.map(error => `Condition: ${error}`));

    return errors;
  },

  /**
   * Calculate lore reading progress
   */
  calculateReadingProgress(
    totalEntries: number,
    readEntries: number
  ): { percentage: number; remaining: number } {
    const percentage = totalEntries > 0 ? (readEntries / totalEntries) * 100 : 0;
    return {
      percentage: Math.round(percentage * 100) / 100,
      remaining: totalEntries - readEntries
    };
  },

  /**
   * Get lore category statistics
   */
  getCategoryStatistics(entries: ILoreEntry[]): Record<LoreCategory, number> {
    const stats: Record<LoreCategory, number> = {
      [LoreCategory.MAIN_STORY]: 0,
      [LoreCategory.SIDE_STORY]: 0,
      [LoreCategory.CHARACTER]: 0,
      [LoreCategory.WORLD]: 0,
      [LoreCategory.SPIRIT]: 0,
      [LoreCategory.LOCATION]: 0,
      [LoreCategory.QUEST]: 0,
      [LoreCategory.MYSTERY]: 0
    };

    entries.forEach(entry => {
      stats[entry.category]++;
    });

    return stats;
  },

  /**
   * Filter entries by multiple criteria
   */
  filterEntries(
    entries: ILoreEntry[],
    filters: {
      categories?: LoreCategory[];
      unlockStates?: LoreUnlockState[];
      minPriority?: number;
      maxPriority?: number;
      tags?: string[];
      searchText?: string;
    }
  ): ILoreEntry[] {
    return entries.filter(entry => {
      if (filters.categories && !filters.categories.includes(entry.category)) {
        return false;
      }

      if (filters.unlockStates && !filters.unlockStates.includes(entry.unlockState)) {
        return false;
      }

      if (filters.minPriority !== undefined && entry.priority < filters.minPriority) {
        return false;
      }

      if (filters.maxPriority !== undefined && entry.priority > filters.maxPriority) {
        return false;
      }

      if (filters.tags && !entry.hasAnyTag(filters.tags)) {
        return false;
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return entry.title.toLowerCase().includes(searchLower) ||
               entry.text.toLowerCase().includes(searchLower) ||
               entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
      }

      return true;
    });
  },

  /**
   * Sort entries by priority and title
   */
  sortEntries(entries: ILoreEntry[], sortBy: 'priority' | 'title' | 'unlockTime' = 'priority'): ILoreEntry[] {
    return [...entries].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority; // Higher priority first
        case 'title':
          return a.title.localeCompare(b.title);
        case 'unlockTime':
          const aTime = a.unlockTime || 0;
          const bTime = b.unlockTime || 0;
          return bTime - aTime; // More recent first
        default:
          return 0;
      }
    });
  },

  /**
   * Get lore completion percentage
   */
  getCompletionPercentage(
    totalEntries: number,
    unlockedEntries: number,
    readEntries: number
  ): { unlocked: number; read: number; overall: number } {
    const unlockedPercent = totalEntries > 0 ? (unlockedEntries / totalEntries) * 100 : 0;
    const readPercent = unlockedEntries > 0 ? (readEntries / unlockedEntries) * 100 : 0;
    const overallPercent = (unlockedPercent * 0.6) + (readPercent * 0.4); // Weighted average

    return {
      unlocked: Math.round(unlockedPercent * 100) / 100,
      read: Math.round(readPercent * 100) / 100,
      overall: Math.round(overallPercent * 100) / 100
    };
  }
};

/**
 * Default instances
 */
export const defaultLoreEntry = new LoreEntry('default', 'Default Lore', 'Default text', LoreUnlockCondition.alwaysTrue());
export const defaultLoreCodexManager = new LoreCodexManager();
export const defaultLoreUnlockCondition = LoreUnlockCondition.alwaysTrue();
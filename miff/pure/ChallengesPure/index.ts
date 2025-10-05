/**
 * ChallengesPure - Challenge Management System
 *
 * A comprehensive challenge management system for tracking battle challenges,
 * completion status, and reward distribution. Supports various challenge types
 * with configurable rules, unlock conditions, and completion tracking.
 *
 * @module ChallengesPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Challenge outcome enumeration
 */
export enum ChallengeOutcome {
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  TIMEOUT = 'timeout',
  FORFEIT = 'forfeit'
}

/**
 * Challenge rule type enumeration
 */
export enum ChallengeRuleType {
  SPIRIT_TYPE_RESTRICTION = 'spirit_type_restriction',
  TURN_LIMIT = 'turn_limit',
  ITEM_BAN = 'item_ban',
  ENVIRONMENTAL_EFFECT = 'environmental_effect'
}

/**
 * Challenge status enumeration
 */
export enum ChallengeStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Challenge category enumeration
 */
export enum ChallengeCategory {
  TUTORIAL = 'tutorial',
  MAIN_STORY = 'main_story',
  SIDE_QUEST = 'side_quest',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
  ACHIEVEMENT = 'achievement'
}

/**
 * Challenge difficulty enumeration
 */
export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
  LEGENDARY = 'legendary',
  VARIES = 'varies'
}

/**
 * Player context interface (dependency)
 */
export interface IPlayerContext {
  hasQuestFlag(flagId: string): boolean;
  hasLoreFlag(flagId: string): boolean;
  getCurrentLocationId(): string;
  getPlayerLevel(): number;
  getCompletedChallenges(): string[];
  getUnlockedLocations(): string[];
  getCapturedSpirits(): string[];
  hasVisitedLocation(locationId: string): boolean;
  [key: string]: any;
}

/**
 * Challenge ruleset interface
 */
export interface IChallengeRuleset {
  allowedSpiritTypes: string[];
  turnLimit: number;
  bannedItems: string[];
  environmentTag?: string;
  isCompliant(partySpiritTypes: string[], items: string[]): boolean;
  validate(): string[];
  getDescription(): string;
  clone(): IChallengeRuleset;
}

/**
 * Challenge result interface
 */
export interface IChallengeResult {
  outcome: ChallengeOutcome;
  itemRewards: Record<string, number>;
  loreFlags: string[];
  syncChanges: Record<string, number>;
  message?: string;
  completionTime?: number;
  turnsTaken?: number;
  metadata?: Record<string, any>;
}

/**
 * Challenge filter interface
 */
export interface IChallengeFilter {
  category?: ChallengeCategory;
  status?: ChallengeStatus;
  difficulty?: ChallengeDifficulty;
  minDifficulty?: ChallengeDifficulty;
  maxDifficulty?: ChallengeDifficulty;
  requiresSpirit?: string;
  locationId?: string;
  tags?: string[];
  completedBefore?: number;
  completedAfter?: number;
  searchText?: string;
  limit?: number;
  offset?: number;
  minPriority?: number;
}

/**
 * Challenge statistics interface
 */
export interface IChallengeStatistics {
  totalChallenges: number;
  completedChallenges: number;
  availableChallenges: number;
  lockedChallenges: number;
  inProgressChallenges: number;
  completionRate: number;
  averageCompletionTime: number;
  challengesByCategory: Record<ChallengeCategory, number>;
  challengesByDifficulty: Record<ChallengeDifficulty, number>;
  challengesByOutcome: Record<ChallengeOutcome, number>;
  totalRewardsEarned: Record<string, number>;
}

/**
 * Battle challenge interface
 */
export interface IBattleChallenge {
  challengeId: string;
  name: string;
  description: string;
  opponentTeam: string[];
  ruleset: IChallengeRuleset;
  rewards: Record<string, number>;
  loreFlagsToSet: string[];
  syncBoosts: Record<string, number>;
  requiredFlags: string[];
  requiredLocationId?: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  maxTurns: number;
  priority: number;
  tags: string[];
  isAvailable(playerContext: IPlayerContext): boolean;
  validate(): string[];
  getEstimatedDuration(): number;
  hasAnyTag(tags: string[]): boolean;
  getCompletionPercentage(): number;
  clone(): IBattleChallenge;
}

/**
 * Challenge manager interface
 */
export interface IChallengeManager {
  registerChallenge(challenge: IBattleChallenge): boolean;
  getChallenge(challengeId: string): IBattleChallenge | null;
  getAllChallenges(): IBattleChallenge[];
  getFilteredChallenges(filter: IChallengeFilter): IBattleChallenge[];
  startChallenge(challengeId: string): boolean;
  completeChallenge(challengeId: string, result: IChallengeResult): boolean;
  isChallengeCompleted(challengeId: string): boolean;
  getChallengeStatus(challengeId: string): ChallengeStatus;
  getStatistics(): IChallengeStatistics;
  clearCompletedChallenges(): void;
  onChallengeStarted?: (challenge: IBattleChallenge) => void;
  onChallengeCompleted?: (challenge: IBattleChallenge, result: IChallengeResult) => void;
}

/**
 * Battle challenge implementation
 */
export class BattleChallenge implements IBattleChallenge {
  public challengeId: string;
  public name: string;
  public description: string;
  public opponentTeam: string[];
  public ruleset: ChallengeRuleset;
  public rewards: Record<string, number>;
  public loreFlagsToSet: string[];
  public syncBoosts: Record<string, number>;
  public requiredFlags: string[];
  public requiredLocationId?: string;
  public category: ChallengeCategory;
  public difficulty: ChallengeDifficulty;
  public status: ChallengeStatus;
  public maxTurns: number;
  public priority: number;
  public tags: string[];

  constructor(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = [],
    ruleset: ChallengeRuleset = new ChallengeRuleset(),
    rewards: Record<string, number> = {},
    category: ChallengeCategory = ChallengeCategory.MAIN_STORY,
    difficulty: ChallengeDifficulty = ChallengeDifficulty.MEDIUM,
    maxTurns: number = 0,
    priority: number = 1,
    tags: string[] = [],
    requiredFlags: string[] = [],
    requiredLocationId?: string,
    loreFlagsToSet: string[] = [],
    syncBoosts: Record<string, number> = {}
  ) {
    this.challengeId = challengeId;
    this.name = name;
    this.description = description;
    this.opponentTeam = [...opponentTeam];
    this.ruleset = ruleset;
    this.rewards = { ...rewards };
    this.category = category;
    this.difficulty = difficulty;
    this.status = ChallengeStatus.LOCKED;
    this.maxTurns = maxTurns;
    this.priority = priority;
    this.tags = [...tags];
    this.requiredFlags = [...requiredFlags];
    this.requiredLocationId = requiredLocationId;
    this.loreFlagsToSet = [...loreFlagsToSet];
    this.syncBoosts = { ...syncBoosts };
  }

  /**
   * Create challenge with specific parameters
   */
  static create(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = [],
    ruleset: ChallengeRuleset = new ChallengeRuleset(),
    rewards: Record<string, number> = {},
    category: ChallengeCategory = ChallengeCategory.MAIN_STORY,
    difficulty: ChallengeDifficulty = ChallengeDifficulty.MEDIUM,
    maxTurns: number = 0,
    priority: number = 1,
    tags: string[] = [],
    requiredFlags: string[] = [],
    requiredLocationId?: string,
    loreFlagsToSet: string[] = [],
    syncBoosts: Record<string, number> = {}
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      opponentTeam,
      ruleset,
      rewards,
      category,
      difficulty,
      maxTurns,
      priority,
      tags,
      requiredFlags,
      requiredLocationId,
      loreFlagsToSet,
      syncBoosts
    );
  }

  /**
   * Create tutorial challenge
   */
  static tutorial(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = [],
    maxTurns: number = 10
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      opponentTeam,
      new ChallengeRuleset(),
      { experience: 100 },
      ChallengeCategory.TUTORIAL,
      ChallengeDifficulty.EASY,
      maxTurns,
      10
    );
  }

  /**
   * Create main story challenge
   */
  static mainStory(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = [],
    requiredFlags: string[] = []
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      opponentTeam,
      new ChallengeRuleset(),
      { experience: 500, gold: 100 },
      ChallengeCategory.MAIN_STORY,
      ChallengeDifficulty.MEDIUM,
      20,
      8,
      ['main_story'],
      requiredFlags
    );
  }

  /**
   * Create boss challenge
   */
  static boss(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = [],
    requiredFlags: string[] = []
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      opponentTeam,
      new ChallengeRuleset(),
      { experience: 1000, gold: 500, rare_item: 1 },
      ChallengeCategory.MAIN_STORY,
      ChallengeDifficulty.HARD,
      30,
      9,
      ['boss', 'main_story'],
      requiredFlags
    );
  }

  /**
   * Create daily challenge
   */
  static daily(
    challengeId: string,
    name: string,
    description: string,
    opponentTeam: string[] = []
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      opponentTeam,
      new ChallengeRuleset(),
      { experience: 200, gold: 50 },
      ChallengeCategory.DAILY,
      ChallengeDifficulty.MEDIUM,
      15,
      5,
      ['daily']
    );
  }

  /**
   * Create achievement challenge
   */
  static achievement(
    challengeId: string,
    name: string,
    description: string,
    requiredFlags: string[] = []
  ): BattleChallenge {
    return new BattleChallenge(
      challengeId,
      name,
      description,
      [],
      new ChallengeRuleset(),
      { achievement_points: 10 },
      ChallengeCategory.ACHIEVEMENT,
      ChallengeDifficulty.VARIES,
      0,
      3,
      ['achievement'],
      requiredFlags
    );
  }

  /**
   * Check if challenge is available
   */
  isAvailable(playerContext: IPlayerContext): boolean {
    // Check required flags
    for (const flag of this.requiredFlags) {
      if (!playerContext.hasQuestFlag(flag) && !playerContext.hasLoreFlag(flag)) {
        return false;
      }
    }

    // Check required location
    if (this.requiredLocationId) {
      if (playerContext.getCurrentLocationId() !== this.requiredLocationId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get estimated duration in minutes
   */
  getEstimatedDuration(): number {
    // Base duration based on difficulty
    const baseDuration = {
      [ChallengeDifficulty.EASY]: 5,
      [ChallengeDifficulty.MEDIUM]: 10,
      [ChallengeDifficulty.HARD]: 15,
      [ChallengeDifficulty.EXPERT]: 20,
      [ChallengeDifficulty.LEGENDARY]: 25,
      [ChallengeDifficulty.VARIES]: 10
    }[this.difficulty] || 10;

    // Adjust for opponent count
    const opponentMultiplier = Math.max(1, this.opponentTeam.length * 0.5);

    // Adjust for turn limit
    const turnLimit = this.maxTurns > 0 ? this.maxTurns / 10 : 1;

    return Math.round(baseDuration * opponentMultiplier * turnLimit);
  }

  /**
   * Get completion percentage (0-100)
   */
  getCompletionPercentage(): number {
    // This would be calculated based on actual progress
    // For now, return 0 for locked, 50 for available, 100 for completed
    switch (this.status) {
      case ChallengeStatus.LOCKED:
        return 0;
      case ChallengeStatus.AVAILABLE:
        return 50;
      case ChallengeStatus.IN_PROGRESS:
        return 75;
      case ChallengeStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Validate challenge
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.challengeId || this.challengeId.trim() === '') {
      errors.push('Challenge ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Challenge name cannot be empty');
    }

    if (!this.description || this.description.trim() === '') {
      errors.push('Challenge description cannot be empty');
    }

    if (this.opponentTeam.length === 0 && this.category !== ChallengeCategory.ACHIEVEMENT) {
      errors.push('Challenge must have at least one opponent');
    }

    if (this.priority < 0 || this.priority > 10) {
      errors.push('Priority must be between 0 and 10');
    }

    if (this.maxTurns < 0) {
      errors.push('Max turns cannot be negative');
    }

    const rulesetErrors = this.ruleset.validate();
    errors.push(...rulesetErrors.map(error => `Ruleset: ${error}`));

    return errors;
  }

  /**
   * Clone challenge
   */
  clone(): BattleChallenge {
    return new BattleChallenge(
      this.challengeId,
      this.name,
      this.description,
      [...this.opponentTeam],
      this.ruleset.clone(),
      { ...this.rewards },
      this.category,
      this.difficulty,
      this.maxTurns,
      this.priority,
      [...this.tags],
      [...this.requiredFlags],
      this.requiredLocationId,
      [...this.loreFlagsToSet],
      { ...this.syncBoosts }
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      challengeId: this.challengeId,
      name: this.name,
      description: this.description,
      opponentTeam: [...this.opponentTeam],
      ruleset: this.ruleset.toJSON(),
      rewards: { ...this.rewards },
      category: this.category,
      difficulty: this.difficulty,
      status: this.status,
      maxTurns: this.maxTurns,
      priority: this.priority,
      tags: [...this.tags],
      requiredFlags: [...this.requiredFlags],
      requiredLocationId: this.requiredLocationId,
      loreFlagsToSet: [...this.loreFlagsToSet],
      syncBoosts: { ...this.syncBoosts }
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): BattleChallenge {
    const ruleset = ChallengeRuleset.fromJSON(data.ruleset);
    const challenge = new BattleChallenge(
      data.challengeId,
      data.name,
      data.description,
      data.opponentTeam || [],
      ruleset,
      data.rewards || {},
      data.category || ChallengeCategory.MAIN_STORY,
      data.difficulty || ChallengeDifficulty.MEDIUM,
      data.maxTurns || 0,
      data.priority || 1,
      data.tags || [],
      data.requiredFlags || [],
      data.requiredLocationId,
      data.loreFlagsToSet || [],
      data.syncBoosts || {}
    );

    challenge.status = data.status || ChallengeStatus.LOCKED;
    return challenge;
  }

  /**
   * Get challenge summary
   */
  getSummary(): string {
    const opponentCount = this.opponentTeam.length;
    const turnLimit = this.maxTurns > 0 ? `${this.maxTurns} turns` : 'No limit';
    const rewardCount = Object.keys(this.rewards).length;

    return `${this.name} (${opponentCount} opponents, ${turnLimit}, ${rewardCount} rewards)`;
  }

  /**
   * Check if challenge has tag
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Check if challenge matches all tags
   */
  hasAllTags(tags: string[]): boolean {
    return tags.every(tag => this.tags.includes(tag));
  }

  /**
   * Check if challenge matches any tags
   */
  hasAnyTag(tags: string[]): boolean {
    return tags.some(tag => this.tags.includes(tag));
  }

  /**
   * Add tag to challenge
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Remove tag from challenge
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
   * Get total reward value
   */
  getTotalRewardValue(): number {
    return Object.values(this.rewards).reduce((sum, value) => sum + value, 0);
  }

  /**
   * Get reward description
   */
  getRewardDescription(): string {
    const rewards = Object.entries(this.rewards)
      .map(([item, amount]) => `${amount} ${item}`)
      .join(', ');

    return rewards || 'No rewards';
  }
}

/**
 * Challenge ruleset implementation
 */
export class ChallengeRuleset implements IChallengeRuleset {
  public allowedSpiritTypes: string[];
  public turnLimit: number;
  public bannedItems: string[];
  public environmentTag?: string;

  constructor(
    allowedSpiritTypes: string[] = [],
    turnLimit: number = 0,
    bannedItems: string[] = [],
    environmentTag?: string
  ) {
    this.allowedSpiritTypes = [...allowedSpiritTypes];
    this.turnLimit = turnLimit;
    this.bannedItems = [...bannedItems];
    this.environmentTag = environmentTag;
  }

  /**
   * Create ruleset with specific parameters
   */
  static create(
    allowedSpiritTypes: string[] = [],
    turnLimit: number = 0,
    bannedItems: string[] = [],
    environmentTag?: string
  ): ChallengeRuleset {
    return new ChallengeRuleset(allowedSpiritTypes, turnLimit, bannedItems, environmentTag);
  }

  /**
   * Create spirit restriction ruleset
   */
  static spiritRestriction(allowedTypes: string[]): ChallengeRuleset {
    return new ChallengeRuleset(allowedTypes, 0, []);
  }

  /**
   * Create turn limit ruleset
   */
  static turnLimit(maxTurns: number): ChallengeRuleset {
    return new ChallengeRuleset([], maxTurns, []);
  }

  /**
   * Create item ban ruleset
   */
  static itemBan(bannedItems: string[]): ChallengeRuleset {
    return new ChallengeRuleset([], 0, bannedItems);
  }

  /**
   * Create environmental ruleset
   */
  static environmental(environmentTag: string): ChallengeRuleset {
    return new ChallengeRuleset([], 0, [], environmentTag);
  }

  /**
   * Check if party complies with rules
   */
  isCompliant(partySpiritTypes: string[], items: string[]): boolean {
    // Check spirit type restrictions
    if (this.allowedSpiritTypes.length > 0) {
      for (const spiritType of partySpiritTypes) {
        if (!this.allowedSpiritTypes.includes(spiritType)) {
          return false;
        }
      }
    }

    // Check item bans
    for (const item of items) {
      if (this.bannedItems.includes(item)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get ruleset description
   */
  getDescription(): string {
    const rules: string[] = [];

    if (this.allowedSpiritTypes.length > 0) {
      rules.push(`Allowed spirits: ${this.allowedSpiritTypes.join(', ')}`);
    }

    if (this.turnLimit > 0) {
      rules.push(`Turn limit: ${this.turnLimit}`);
    }

    if (this.bannedItems.length > 0) {
      rules.push(`Banned items: ${this.bannedItems.join(', ')}`);
    }

    if (this.environmentTag) {
      rules.push(`Environment: ${this.environmentTag}`);
    }

    return rules.length > 0 ? rules.join('; ') : 'No special rules';
  }

  /**
   * Validate ruleset
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.turnLimit < 0) {
      errors.push('Turn limit cannot be negative');
    }

    if (this.allowedSpiritTypes.some(type => !type || type.trim() === '')) {
      errors.push('Allowed spirit types cannot contain empty strings');
    }

    if (this.bannedItems.some(item => !item || item.trim() === '')) {
      errors.push('Banned items cannot contain empty strings');
    }

    return errors;
  }

  /**
   * Clone ruleset
   */
  clone(): ChallengeRuleset {
    return new ChallengeRuleset(
      [...this.allowedSpiritTypes],
      this.turnLimit,
      [...this.bannedItems],
      this.environmentTag
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      allowedSpiritTypes: [...this.allowedSpiritTypes],
      turnLimit: this.turnLimit,
      bannedItems: [...this.bannedItems],
      environmentTag: this.environmentTag
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): ChallengeRuleset {
    return new ChallengeRuleset(
      data.allowedSpiritTypes || [],
      data.turnLimit || 0,
      data.bannedItems || [],
      data.environmentTag
    );
  }
}

/**
 * Challenge result implementation
 */
export class ChallengeResult implements IChallengeResult {
  public outcome: ChallengeOutcome;
  public itemRewards: Record<string, number>;
  public loreFlags: string[];
  public syncChanges: Record<string, number>;
  public message?: string;
  public completionTime?: number;
  public turnsTaken?: number;
  public metadata?: Record<string, any>;

  constructor(
    outcome: ChallengeOutcome = ChallengeOutcome.VICTORY,
    itemRewards: Record<string, number> = {},
    loreFlags: string[] = [],
    syncChanges: Record<string, number> = {},
    message?: string,
    completionTime?: number,
    turnsTaken?: number,
    metadata?: Record<string, any>
  ) {
    this.outcome = outcome;
    this.itemRewards = { ...itemRewards };
    this.loreFlags = [...loreFlags];
    this.syncChanges = { ...syncChanges };
    this.message = message;
    this.completionTime = completionTime;
    this.turnsTaken = turnsTaken;
    this.metadata = metadata;
  }

  /**
   * Create victory result
   */
  static victory(
    itemRewards: Record<string, number> = {},
    loreFlags: string[] = [],
    syncChanges: Record<string, number> = {},
    message?: string,
    turnsTaken?: number
  ): ChallengeResult {
    return new ChallengeResult(
      ChallengeOutcome.VICTORY,
      itemRewards,
      loreFlags,
      syncChanges,
      message,
      Date.now(),
      turnsTaken
    );
  }

  /**
   * Create defeat result
   */
  static defeat(
    message?: string,
    turnsTaken?: number
  ): ChallengeResult {
    return new ChallengeResult(
      ChallengeOutcome.DEFEAT,
      {},
      [],
      {},
      message,
      Date.now(),
      turnsTaken
    );
  }

  /**
   * Create timeout result
   */
  static timeout(
    turnsTaken: number,
    message?: string
  ): ChallengeResult {
    return new ChallengeResult(
      ChallengeOutcome.TIMEOUT,
      {},
      [],
      {},
      message,
      Date.now(),
      turnsTaken
    );
  }

  /**
   * Create forfeit result
   */
  static forfeit(
    message?: string,
    turnsTaken?: number
  ): ChallengeResult {
    return new ChallengeResult(
      ChallengeOutcome.FORFEIT,
      {},
      [],
      {},
      message,
      Date.now(),
      turnsTaken
    );
  }

  /**
   * Get result summary
   */
  toString(): string {
    const itemRewardsStr = Object.entries(this.itemRewards)
      .map(([item, amount]) => `${amount} ${item}`)
      .join(', ');

    const loreFlagsStr = this.loreFlags.length > 0 ? this.loreFlags.join(', ') : 'none';
    const syncChangesStr = Object.entries(this.syncChanges)
      .map(([spirit, change]) => `${spirit} ${change > 0 ? '+' : ''}${change}`)
      .join(', ');

    const timeStr = this.completionTime ? new Date(this.completionTime).toLocaleString() : 'unknown';
    const turnsStr = this.turnsTaken ? `${this.turnsTaken} turns` : 'unknown turns';

    return `${this.outcome} | items: [${itemRewardsStr}] | flags: [${loreFlagsStr}] | sync: [${syncChangesStr}] | ${turnsStr} | ${timeStr}`;
  }

  /**
   * Get total reward value
   */
  getTotalRewardValue(): number {
    return Object.values(this.itemRewards).reduce((sum, value) => sum + value, 0);
  }

  /**
   * Get result description
   */
  getDescription(): string {
    switch (this.outcome) {
      case ChallengeOutcome.VICTORY:
        return `Victory! ${this.message || 'Challenge completed successfully.'}`;
      case ChallengeOutcome.DEFEAT:
        return `Defeat! ${this.message || 'Challenge failed.'}`;
      case ChallengeOutcome.TIMEOUT:
        return `Timeout! ${this.message || 'Challenge timed out.'}`;
      case ChallengeOutcome.FORFEIT:
        return `Forfeit! ${this.message || 'Challenge forfeited.'}`;
      default:
        return `Unknown outcome: ${this.outcome}`;
    }
  }

  /**
   * Clone result
   */
  clone(): ChallengeResult {
    return new ChallengeResult(
      this.outcome,
      { ...this.itemRewards },
      [...this.loreFlags],
      { ...this.syncChanges },
      this.message,
      this.completionTime,
      this.turnsTaken,
      this.metadata ? { ...this.metadata } : undefined
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      outcome: this.outcome,
      itemRewards: { ...this.itemRewards },
      loreFlags: [...this.loreFlags],
      syncChanges: { ...this.syncChanges },
      message: this.message,
      completionTime: this.completionTime,
      turnsTaken: this.turnsTaken,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): ChallengeResult {
    return new ChallengeResult(
      data.outcome,
      data.itemRewards || {},
      data.loreFlags || [],
      data.syncChanges || {},
      data.message,
      data.completionTime,
      data.turnsTaken,
      data.metadata
    );
  }
}

/**
 * Challenge manager implementation
 */
export class ChallengeManager implements IChallengeManager {
  private readonly availableChallenges = new Map<string, BattleChallenge>();
  private readonly completedChallenges = new Set<string>();
  private readonly inProgressChallenges = new Set<string>();

  public onChallengeStarted?: (challenge: IBattleChallenge) => void;
  public onChallengeCompleted?: (challenge: IBattleChallenge, result: IChallengeResult) => void;

  /**
   * Register challenge
   */
  registerChallenge(challenge: IBattleChallenge): boolean {
    if (!challenge || !challenge.challengeId || challenge.challengeId.trim() === '') {
      console.warn('Invalid challenge registration: missing or empty challenge ID');
      return false;
    }

    const errors = challenge.validate();
    if (errors.length > 0) {
      console.warn(`Invalid challenge ${challenge.challengeId}:`, errors);
      return false;
    }

    this.availableChallenges.set(challenge.challengeId, challenge);
    return true;
  }

  /**
   * Get challenge by ID
   */
  getChallenge(challengeId: string): IBattleChallenge | null {
    return this.availableChallenges.get(challengeId) || null;
  }

  /**
   * Get all challenges
   */
  getAllChallenges(): IBattleChallenge[] {
    return Array.from(this.availableChallenges.values());
  }

  /**
   * Get filtered challenges
   */
  getFilteredChallenges(filter: IChallengeFilter): IBattleChallenge[] {
    let challenges = this.getAllChallenges();

    // Apply filters
    if (filter.category) {
      challenges = challenges.filter(challenge => challenge.category === filter.category);
    }

    if (filter.status) {
      challenges = challenges.filter(challenge => challenge.status === filter.status);
    }

    if (filter.difficulty) {
      challenges = challenges.filter(challenge => challenge.difficulty === filter.difficulty);
    }

    if (filter.minDifficulty) {
      const minLevel = this.getDifficultyLevel(filter.minDifficulty);
      challenges = challenges.filter(challenge => this.getDifficultyLevel(challenge.difficulty) >= minLevel);
    }

    if (filter.maxDifficulty) {
      const maxLevel = this.getDifficultyLevel(filter.maxDifficulty);
      challenges = challenges.filter(challenge => this.getDifficultyLevel(challenge.difficulty) <= maxLevel);
    }

    if (filter.requiresSpirit) {
      challenges = challenges.filter(challenge =>
        challenge.opponentTeam.includes(filter.requiresSpirit!) ||
        challenge.loreFlagsToSet.includes(filter.requiresSpirit!) ||
        challenge.syncBoosts.hasOwnProperty(filter.requiresSpirit!)
      );
    }

    if (filter.locationId) {
      challenges = challenges.filter(challenge =>
        challenge.requiredLocationId === filter.locationId
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      challenges = challenges.filter(challenge => challenge.hasAnyTag(filter.tags!));
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      challenges = challenges.filter(challenge =>
        challenge.name.toLowerCase().includes(searchLower) ||
        challenge.description.toLowerCase().includes(searchLower) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by completion status
    if (filter.completedBefore || filter.completedAfter) {
      challenges = challenges.filter(challenge => {
        const isCompleted = this.isChallengeCompleted(challenge.challengeId);
        if (!isCompleted) return false;

        // Note: In a real implementation, you'd check the completion timestamp
        // For now, we'll just check if it's completed
        return true;
      });
    }

    // Apply pagination
    if (filter.offset) {
      challenges = challenges.slice(filter.offset);
    }

    if (filter.limit) {
      challenges = challenges.slice(0, filter.limit);
    }

    return challenges;
  }

  /**
   * Start challenge
   */
  startChallenge(challengeId: string): boolean {
    const challenge = this.availableChallenges.get(challengeId);
    if (!challenge) {
      return false;
    }

    challenge.status = ChallengeStatus.IN_PROGRESS;
    this.inProgressChallenges.add(challengeId);
    this.onChallengeStarted?.(challenge);
    return true;
  }

  /**
   * Complete challenge
   */
  completeChallenge(challengeId: string, result: IChallengeResult): boolean {
    const challenge = this.availableChallenges.get(challengeId);
    if (!challenge || !this.inProgressChallenges.has(challengeId)) {
      return false;
    }

    challenge.status = ChallengeStatus.COMPLETED;
    this.completedChallenges.add(challengeId);
    this.inProgressChallenges.delete(challengeId);
    this.onChallengeCompleted?.(challenge, result);
    return true;
  }

  /**
   * Check if challenge is completed
   */
  isChallengeCompleted(challengeId: string): boolean {
    return this.completedChallenges.has(challengeId);
  }

  /**
   * Get challenge status
   */
  getChallengeStatus(challengeId: string): ChallengeStatus {
    const challenge = this.availableChallenges.get(challengeId);
    if (!challenge) {
      return ChallengeStatus.LOCKED;
    }

    if (this.completedChallenges.has(challengeId)) {
      return ChallengeStatus.COMPLETED;
    }

    if (this.inProgressChallenges.has(challengeId)) {
      return ChallengeStatus.IN_PROGRESS;
    }

    return ChallengeStatus.LOCKED;
  }

  /**
   * Get challenge statistics
   */
  getStatistics(): IChallengeStatistics {
    const allChallenges = this.getAllChallenges();
    const completedChallenges = allChallenges.filter(challenge =>
      this.isChallengeCompleted(challenge.challengeId)
    );

    const challengesByCategory: Record<ChallengeCategory, number> = {
      [ChallengeCategory.TUTORIAL]: 0,
      [ChallengeCategory.MAIN_STORY]: 0,
      [ChallengeCategory.SIDE_QUEST]: 0,
      [ChallengeCategory.DAILY]: 0,
      [ChallengeCategory.WEEKLY]: 0,
      [ChallengeCategory.SPECIAL]: 0,
      [ChallengeCategory.ACHIEVEMENT]: 0
    };

    const challengesByDifficulty: Record<ChallengeDifficulty, number> = {
      [ChallengeDifficulty.EASY]: 0,
      [ChallengeDifficulty.MEDIUM]: 0,
      [ChallengeDifficulty.HARD]: 0,
      [ChallengeDifficulty.EXPERT]: 0,
      [ChallengeDifficulty.LEGENDARY]: 0,
      [ChallengeDifficulty.VARIES]: 0
    };

    let totalRewardsEarned: Record<string, number> = {};

    allChallenges.forEach(challenge => {
      challengesByCategory[challenge.category]++;
      challengesByDifficulty[challenge.difficulty]++;

      if (this.isChallengeCompleted(challenge.challengeId)) {
        Object.entries(challenge.rewards).forEach(([item, amount]) => {
          totalRewardsEarned[item] = (totalRewardsEarned[item] || 0) + amount;
        });
      }
    });

    const completionRate = allChallenges.length > 0
      ? (completedChallenges.length / allChallenges.length) * 100
      : 0;

    return {
      totalChallenges: allChallenges.length,
      completedChallenges: completedChallenges.length,
      availableChallenges: allChallenges.filter(c =>
        c.status === ChallengeStatus.AVAILABLE ||
        c.status === ChallengeStatus.IN_PROGRESS
      ).length,
      lockedChallenges: allChallenges.filter(c => c.status === ChallengeStatus.LOCKED).length,
      inProgressChallenges: this.inProgressChallenges.size,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: 0, // Would need completion timestamps
      challengesByCategory,
      challengesByDifficulty,
      challengesByOutcome: {
        victory: 0,
        defeat: 0,
        timeout: 0,
        forfeit: 0
      }, // Would need completion results
      totalRewardsEarned
    };
  }

  /**
   * Clear completed challenges
   */
  clearCompletedChallenges(): void {
    this.completedChallenges.clear();
    this.availableChallenges.forEach(challenge => {
      if (challenge.status === ChallengeStatus.COMPLETED) {
        challenge.status = ChallengeStatus.LOCKED;
      }
    });
  }

  /**
   * Get difficulty level for comparison
   */
  private getDifficultyLevel(difficulty: ChallengeDifficulty): number {
    const levels = {
      [ChallengeDifficulty.EASY]: 1,
      [ChallengeDifficulty.MEDIUM]: 2,
      [ChallengeDifficulty.HARD]: 3,
      [ChallengeDifficulty.EXPERT]: 4,
      [ChallengeDifficulty.LEGENDARY]: 5
    };
    return levels[difficulty] || 2;
  }
}

/**
 * Utility functions for challenge operations
 */
export const ChallengeUtils = {
  /**
   * Create default player context for testing
   */
  createDefaultPlayerContext(): IPlayerContext {
    return {
      hasQuestFlag: (flagId: string) => false,
      hasLoreFlag: (flagId: string) => false,
      getCurrentLocationId: () => 'default',
      getPlayerLevel: () => 1,
      getCompletedChallenges: () => [],
      getUnlockedLocations: () => [],
      getCapturedSpirits: () => [],
      hasVisitedLocation: (locationId: string) => false
    };
  },

  /**
   * Validate challenge
   */
  validateChallenge(challenge: IBattleChallenge): string[] {
    const errors: string[] = [];

    if (!challenge.challengeId || challenge.challengeId.trim() === '') {
      errors.push('Challenge ID cannot be empty');
    }

    if (!challenge.name || challenge.name.trim() === '') {
      errors.push('Challenge name cannot be empty');
    }

    if (!challenge.description || challenge.description.trim() === '') {
      errors.push('Challenge description cannot be empty');
    }

    if (challenge.opponentTeam.length === 0 && challenge.category !== ChallengeCategory.ACHIEVEMENT) {
      errors.push('Challenge must have at least one opponent');
    }

    if (challenge.priority < 0 || challenge.priority > 10) {
      errors.push('Priority must be between 0 and 10');
    }

    if (challenge.maxTurns < 0) {
      errors.push('Max turns cannot be negative');
    }

    const rulesetErrors = challenge.ruleset.validate();
    errors.push(...rulesetErrors.map(error => `Ruleset: ${error}`));

    return errors;
  },

  /**
   * Filter challenges by multiple criteria
   */
  filterChallenges(
    challenges: IBattleChallenge[],
    filters: {
      categories?: ChallengeCategory[];
      difficulties?: ChallengeDifficulty[];
      minPriority?: number;
      maxPriority?: number;
      tags?: string[];
      searchText?: string;
      completed?: boolean;
    }
  ): IBattleChallenge[] {
    return challenges.filter(challenge => {
      if (filters.categories && !filters.categories.includes(challenge.category)) {
        return false;
      }

      if (filters.difficulties && !filters.difficulties.includes(challenge.difficulty)) {
        return false;
      }

      if (filters.minPriority !== undefined && challenge.priority < filters.minPriority) {
        return false;
      }

      if (filters.maxPriority !== undefined && challenge.priority > filters.maxPriority) {
        return false;
      }

      if (filters.tags && !challenge.hasAnyTag(filters.tags)) {
        return false;
      }

      if (filters.completed !== undefined) {
        const isCompleted = challenge.status === ChallengeStatus.COMPLETED;
        if (filters.completed !== isCompleted) {
          return false;
        }
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return challenge.name.toLowerCase().includes(searchLower) ||
               challenge.description.toLowerCase().includes(searchLower) ||
               challenge.tags.some(tag => tag.toLowerCase().includes(searchLower));
      }

      return true;
    });
  },

  /**
   * Sort challenges by priority and name
   */
  sortChallenges(challenges: IBattleChallenge[], sortBy: 'priority' | 'name' | 'difficulty' = 'priority'): IBattleChallenge[] {
    return [...challenges].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority; // Higher priority first
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const aLevel = this.getDifficultyLevel(a.difficulty);
          const bLevel = this.getDifficultyLevel(b.difficulty);
          return bLevel - aLevel; // Higher difficulty first
        default:
          return 0;
      }
    });
  },

  /**
   * Get difficulty level for comparison
   */
  getDifficultyLevel(difficulty: ChallengeDifficulty): number {
    const levels = {
      [ChallengeDifficulty.EASY]: 1,
      [ChallengeDifficulty.MEDIUM]: 2,
      [ChallengeDifficulty.HARD]: 3,
      [ChallengeDifficulty.EXPERT]: 4,
      [ChallengeDifficulty.LEGENDARY]: 5
    };
    return levels[difficulty] || 2;
  },

  /**
   * Get challenge completion percentage
   */
  getCompletionPercentage(
    totalChallenges: number,
    completedChallenges: number
  ): { percentage: number; remaining: number } {
    const percentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
    return {
      percentage: Math.round(percentage * 100) / 100,
      remaining: totalChallenges - completedChallenges
    };
  },

  /**
   * Create standard challenge filters
   */
  createFilter: {
    byCategory: (category: ChallengeCategory): IChallengeFilter => ({ category }),
    byDifficulty: (difficulty: ChallengeDifficulty): IChallengeFilter => ({ difficulty }),
    completedOnly: (): IChallengeFilter => ({ status: ChallengeStatus.COMPLETED }),
    availableOnly: (): IChallengeFilter => ({ status: ChallengeStatus.AVAILABLE }),
    inProgressOnly: (): IChallengeFilter => ({ status: ChallengeStatus.IN_PROGRESS }),
    highPriority: (minPriority: number = 7): IChallengeFilter => ({ minPriority }),
    easyOnly: (): IChallengeFilter => ({ difficulty: ChallengeDifficulty.EASY }),
    hardOrAbove: (): IChallengeFilter => ({ minDifficulty: ChallengeDifficulty.HARD }),
    search: (searchText: string): IChallengeFilter => ({ searchText })
  }
};

/**
 * Default instances
 */
export const defaultBattleChallenge = new BattleChallenge('default', 'Default Challenge', 'Default description');
export const defaultChallengeManager = new ChallengeManager();
export const defaultChallengeRuleset = new ChallengeRuleset();
export const defaultChallengeResult = ChallengeResult.victory();
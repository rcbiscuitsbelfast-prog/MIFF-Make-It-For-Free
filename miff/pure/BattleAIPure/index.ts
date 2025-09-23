/**
 * BattleAIPure - Battle AI Management System
 *
 * A comprehensive battle AI management system for handling battle-specific AI decisions,
 * decision profiles, and move selection based on spirit stats, type matchups, and status effects.
 * Supports configurable decision styles with weighted preferences for different move types.
 *
 * @module BattleAIPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * AI decision style enumeration
 */
export enum AIDecisionStyle {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  TRICKSTER = 'trickster'
}

/**
 * Move category enumeration
 */
export enum MoveCategory {
  DAMAGE = 'damage',
  HEALING = 'healing',
  SUPPORT = 'support',
  STATUS = 'status',
  UTILITY = 'utility'
}

/**
 * Threat level enumeration
 */
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * AI decision profile interface
 */
export interface IAIDecisionProfile {
  profileID: string;
  style: AIDecisionStyle;
  movePriorityWeights: Record<string, number>;
  preferredTypes: string[];
  validate(): string[];
  clone(): IAIDecisionProfile;
  getMoveWeight(moveCategory: string): number;
  setMoveWeight(moveCategory: string, weight: number): void;
  addPreferredType(type: string): void;
  removePreferredType(type: string): boolean;
}

/**
 * AI manager interface
 */
export interface IAIControllerManager {
  registerProfile(profile: IAIDecisionProfile): boolean;
  getAIController(profileID: string): IBattleAIController;
  getProfile(profileID: string): IAIDecisionProfile | null;
  getAllProfiles(): IAIDecisionProfile[];
  removeProfile(profileID: string): boolean;
  updateProfile(profileID: string, updates: Partial<IAIDecisionProfile>): boolean;
  clearProfiles(): void;
}

/**
 * Battle AI controller interface
 */
export interface IBattleAIController {
  selectMove(self: ISpiritInstance, opponent: ISpiritInstance): string | null;
  evaluateThreatLevel(opponent: ISpiritInstance): number;
  getDecisionProfile(): IAIDecisionProfile;
  setDecisionProfile(profile: IAIDecisionProfile): void;
  getPreferredMoveTypes(): string[];
  canUseMove(moveId: string): boolean;
}

/**
 * Spirit instance interface (dependency)
 */
export interface ISpiritInstance {
  id: string;
  name: string;
  level: number;
  typeTag: string;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  statusEffects?: string[];
  knownMoves?: string[];
  resourcePoints?: number;
  isFainted(): boolean;
  getEffectiveStats(): {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

/**
 * Move data interface (dependency)
 */
export interface IMoveData {
  moveId: string;
  name: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
  priority: number;
  effects?: string[];
}

/**
 * Battle state interface (dependency)
 */
export interface IBattleState {
  turnNumber: number;
  phase: string;
  activeSpiritId?: string;
  spirits: Record<string, ISpiritInstance>;
  availableMoves: IMoveData[];
  [key: string]: any;
}

/**
 * AI decision profile implementation
 */
export class AIDecisionProfile implements IAIDecisionProfile {
  public profileID: string;
  public style: AIDecisionStyle;
  public movePriorityWeights: Record<string, number>;
  public preferredTypes: string[];

  constructor(
    profileID: string = 'default',
    style: AIDecisionStyle = AIDecisionStyle.BALANCED,
    movePriorityWeights?: Record<string, number>,
    preferredTypes: string[] = []
  ) {
    this.profileID = profileID;
    this.style = style;
    this.movePriorityWeights = movePriorityWeights || {
      [MoveCategory.DAMAGE]: 1.0,
      [MoveCategory.HEALING]: 0.5,
      [MoveCategory.SUPPORT]: 0.6,
      [MoveCategory.STATUS]: 0.4,
      [MoveCategory.UTILITY]: 0.3
    };
    this.preferredTypes = [...preferredTypes];
    this.applyStyleDefaults();
  }

  /**
   * Apply default weights based on style
   */
  private applyStyleDefaults(): void {
    switch (this.style) {
      case AIDecisionStyle.AGGRESSIVE:
        this.movePriorityWeights[MoveCategory.DAMAGE] = 1.3;
        this.movePriorityWeights[MoveCategory.HEALING] = 0.3;
        this.movePriorityWeights[MoveCategory.SUPPORT] = 0.5;
        this.movePriorityWeights[MoveCategory.STATUS] = 0.7;
        this.movePriorityWeights[MoveCategory.UTILITY] = 0.4;
        break;
      case AIDecisionStyle.DEFENSIVE:
        this.movePriorityWeights[MoveCategory.DAMAGE] = 0.8;
        this.movePriorityWeights[MoveCategory.HEALING] = 1.2;
        this.movePriorityWeights[MoveCategory.SUPPORT] = 1.0;
        this.movePriorityWeights[MoveCategory.STATUS] = 1.1;
        this.movePriorityWeights[MoveCategory.UTILITY] = 0.8;
        break;
      case AIDecisionStyle.TRICKSTER:
        this.movePriorityWeights[MoveCategory.DAMAGE] = 0.9;
        this.movePriorityWeights[MoveCategory.HEALING] = 0.6;
        this.movePriorityWeights[MoveCategory.SUPPORT] = 1.3;
        this.movePriorityWeights[MoveCategory.STATUS] = 1.2;
        this.movePriorityWeights[MoveCategory.UTILITY] = 1.0;
        break;
      case AIDecisionStyle.BALANCED:
      default:
        // Keep default values
        break;
    }
  }

  /**
   * Create default profile with specific style
   */
  static createDefault(id: string, style: AIDecisionStyle): AIDecisionProfile {
    return new AIDecisionProfile(id, style);
  }

  /**
   * Create aggressive profile
   */
  static aggressive(id: string = 'aggressive'): AIDecisionProfile {
    return new AIDecisionProfile(id, AIDecisionStyle.AGGRESSIVE);
  }

  /**
   * Create defensive profile
   */
  static defensive(id: string = 'defensive'): AIDecisionProfile {
    return new AIDecisionProfile(id, AIDecisionStyle.DEFENSIVE);
  }

  /**
   * Create balanced profile
   */
  static balanced(id: string = 'balanced'): AIDecisionProfile {
    return new AIDecisionProfile(id, AIDecisionStyle.BALANCED);
  }

  /**
   * Create trickster profile
   */
  static trickster(id: string = 'trickster'): AIDecisionProfile {
    return new AIDecisionProfile(id, AIDecisionStyle.TRICKSTER);
  }

  /**
   * Get move weight for category
   */
  getMoveWeight(moveCategory: string): number {
    return this.movePriorityWeights[moveCategory] || 0.5;
  }

  /**
   * Set move weight for category
   */
  setMoveWeight(moveCategory: string, weight: number): void {
    this.movePriorityWeights[moveCategory] = Math.max(0, Math.min(2, weight));
  }

  /**
   * Add preferred type
   */
  addPreferredType(type: string): void {
    if (!this.preferredTypes.includes(type)) {
      this.preferredTypes.push(type);
    }
  }

  /**
   * Remove preferred type
   */
  removePreferredType(type: string): boolean {
    const index = this.preferredTypes.indexOf(type);
    if (index >= 0) {
      this.preferredTypes.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if type is preferred
   */
  isTypePreferred(type: string): boolean {
    return this.preferredTypes.includes(type);
  }

  /**
   * Get type advantage bonus
   */
  getTypeAdvantageBonus(moveType: string, opponentType: string): number {
    // Simple type effectiveness check (in real implementation, use TypeEffectiveness system)
    const typeAdvantages: Record<string, string[]> = {
      'fire': ['nature', 'ice', 'bug', 'steel'],
      'water': ['fire', 'ground', 'rock'],
      'electric': ['water', 'flying'],
      'grass': ['water', 'ground', 'rock'],
      'psychic': ['fighting', 'poison'],
      'ice': ['grass', 'ground', 'flying', 'dragon'],
      'dragon': ['dragon'],
      'dark': ['psychic', 'ghost'],
      'fairy': ['fighting', 'dragon', 'dark']
    };

    const advantages = typeAdvantages[moveType.toLowerCase()] || [];
    const isAdvantage = advantages.includes(opponentType.toLowerCase());

    if (this.isTypePreferred(moveType) && isAdvantage) {
      return 0.3; // Bonus for preferred type advantage
    } else if (isAdvantage) {
      return 0.2; // Standard type advantage bonus
    } else if (this.isTypePreferred(moveType)) {
      return 0.1; // Bonus for preferred type
    }

    return 0;
  }

  /**
   * Validate profile configuration
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.profileID || this.profileID.trim() === '') {
      errors.push('Profile ID cannot be empty');
    }

    // Validate weights are in reasonable range
    Object.entries(this.movePriorityWeights).forEach(([category, weight]) => {
      if (weight < 0 || weight > 2) {
        errors.push(`${category} weight must be between 0 and 2, got ${weight}`);
      }
    });

    // Check for negative preferred types
    if (this.preferredTypes.some(type => !type || type.trim() === '')) {
      errors.push('Preferred types cannot contain empty strings');
    }

    return errors;
  }

  /**
   * Clone this profile
   */
  clone(): AIDecisionProfile {
    return new AIDecisionProfile(
      this.profileID,
      this.style,
      { ...this.movePriorityWeights },
      [...this.preferredTypes]
    );
  }

  /**
   * Get profile summary
   */
  getSummary(): string {
    const typeCount = this.preferredTypes.length;
    const typeInfo = typeCount > 0 ? ` (${typeCount} preferred types)` : '';
    return `${this.profileID} (${this.style})${typeInfo}`;
  }

  /**
   * Check if profile is aggressive
   */
  get isAggressive(): boolean {
    return this.style === AIDecisionStyle.AGGRESSIVE;
  }

  /**
   * Check if profile is defensive
   */
  get isDefensive(): boolean {
    return this.style === AIDecisionStyle.DEFENSIVE;
  }

  /**
   * Check if profile is balanced
   */
  get isBalanced(): boolean {
    return this.style === AIDecisionStyle.BALANCED;
  }

  /**
   * Check if profile is trickster
   */
  get isTrickster(): boolean {
    return this.style === AIDecisionStyle.TRICKSTER;
  }

  /**
   * Get style description
   */
  getStyleDescription(): string {
    switch (this.style) {
      case AIDecisionStyle.AGGRESSIVE:
        return 'Focuses on high damage moves and type advantages';
      case AIDecisionStyle.DEFENSIVE:
        return 'Prioritizes healing and defensive moves';
      case AIDecisionStyle.BALANCED:
        return 'Balanced approach with moderate risk/reward';
      case AIDecisionStyle.TRICKSTER:
        return 'Prefers support and utility moves for control';
      default:
        return 'Unknown style';
    }
  }
}

/**
 * AI controller manager implementation
 */
export class AIControllerManager implements IAIControllerManager {
  private readonly profiles = new Map<string, AIDecisionProfile>();

  constructor() {
    // Register default profiles
    this.registerProfile(AIDecisionProfile.balanced('balanced'));
    this.registerProfile(AIDecisionProfile.aggressive('aggressive'));
    this.registerProfile(AIDecisionProfile.defensive('defensive'));
    this.registerProfile(AIDecisionProfile.trickster('trickster'));
  }

  /**
   * Register an AI profile
   */
  registerProfile(profile: AIDecisionProfile): boolean {
    if (!profile || !profile.profileID || profile.profileID.trim() === '') {
      console.warn('Invalid profile registration: missing or empty profile ID');
      return false;
    }

    const errors = profile.validate();
    if (errors.length > 0) {
      console.warn(`Invalid profile ${profile.profileID}:`, errors);
      return false;
    }

    this.profiles.set(profile.profileID, profile);
    return true;
  }

  /**
   * Get AI controller for profile
   */
  getAIController(profileID: string): IBattleAIController {
    const profileId = profileID || 'balanced';

    if (!this.profiles.has(profileId)) {
      // Create default balanced profile
      const defaultProfile = AIDecisionProfile.balanced(profileId);
      this.profiles.set(profileId, defaultProfile);
    }

    const profile = this.profiles.get(profileId)!;
    return new BattleAIController(profile);
  }

  /**
   * Get profile by ID
   */
  getProfile(profileID: string): AIDecisionProfile | null {
    return this.profiles.get(profileID) || null;
  }

  /**
   * Get all registered profiles
   */
  getAllProfiles(): AIDecisionProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get profile count
   */
  getProfileCount(): number {
    return this.profiles.size;
  }

  /**
   * Check if profile exists
   */
  hasProfile(profileID: string): boolean {
    return this.profiles.has(profileID);
  }

  /**
   * Remove profile
   */
  removeProfile(profileID: string): boolean {
    return this.profiles.delete(profileID);
  }

  /**
   * Update profile
   */
  updateProfile(profileID: string, updates: Partial<AIDecisionProfile>): boolean {
    const existingProfile = this.profiles.get(profileID);
    if (!existingProfile) {
      return false;
    }

    // Create updated profile
    const updatedProfile = new AIDecisionProfile(
      updates.profileID || existingProfile.profileID,
      updates.style ?? existingProfile.style,
      { ...existingProfile.movePriorityWeights, ...(updates.movePriorityWeights || {}) },
      updates.preferredTypes || [...existingProfile.preferredTypes]
    );

    const errors = updatedProfile.validate();
    if (errors.length > 0) {
      console.warn(`Invalid profile update for ${profileID}:`, errors);
      return false;
    }

    this.profiles.set(profileID, updatedProfile);
    return true;
  }

  /**
   * Clear all profiles
   */
  clearProfiles(): void {
    this.profiles.clear();
  }

  /**
   * Get profiles by style
   */
  getProfilesByStyle(style: AIDecisionStyle): AIDecisionProfile[] {
    return this.getAllProfiles().filter(profile => profile.style === style);
  }

  /**
   * Get profiles with type preferences
   */
  getProfilesWithTypePreferences(): AIDecisionProfile[] {
    return this.getAllProfiles().filter(profile => profile.preferredTypes.length > 0);
  }

  /**
   * Create standard profile set
   */
  createStandardProfiles(): void {
    const profiles = [
      AIDecisionProfile.balanced('balanced'),
      AIDecisionProfile.aggressive('aggressive'),
      AIDecisionProfile.defensive('defensive'),
      AIDecisionProfile.trickster('trickster')
    ];

    profiles.forEach(profile => this.registerProfile(profile));
  }
}

/**
 * Battle AI controller implementation
 */
export class BattleAIController implements IBattleAIController {
  private profile: AIDecisionProfile;

  constructor(profile: AIDecisionProfile) {
    this.profile = profile || AIDecisionProfile.balanced();
  }

  /**
   * Select best move based on profile
   */
  selectMove(self: ISpiritInstance, opponent: ISpiritInstance): string | null {
    if (!self || !opponent || !self.knownMoves || self.knownMoves.length === 0) {
      return null;
    }

    // Score all known moves
    const scoredMoves = self.knownMoves.map(moveID => ({
      moveID,
      score: this.scoreMove(self, opponent, moveID)
    }));

    // Sort by score (descending)
    scoredMoves.sort((a, b) => b.score - a.score);

    // Return best move
    return scoredMoves.length > 0 ? scoredMoves[0].moveID : null;
  }

  /**
   * Score a move based on profile
   */
  private scoreMove(self: ISpiritInstance, opponent: ISpiritInstance, moveID: string): number {
    let score = 0;

    // Base score from profile weights
    const categoryWeight = this.profile.getMoveWeight(MoveCategory.DAMAGE);
    score += categoryWeight * 10; // Base score for having a move

    // Threat level consideration
    const threatLevel = this.evaluateThreatLevel(opponent);
    if (threatLevel > 0.7) {
      // High threat: prefer defensive moves
      score += this.profile.getMoveWeight(MoveCategory.HEALING) * 5;
      score += this.profile.getMoveWeight(MoveCategory.SUPPORT) * 3;
    } else if (threatLevel < 0.3) {
      // Low threat: prefer aggressive moves
      score += this.profile.getMoveWeight(MoveCategory.DAMAGE) * 8;
    }

    // HP-based decision making
    const hpRatio = self.currentHP / self.maxHP;
    if (hpRatio < 0.3) {
      // Low HP: prefer healing moves
      score += this.profile.getMoveWeight(MoveCategory.HEALING) * 10;
    } else if (hpRatio > 0.8) {
      // High HP: can be more aggressive
      score += this.profile.getMoveWeight(MoveCategory.DAMAGE) * 5;
    }

    // Status effect consideration
    if (self.statusEffects && self.statusEffects.length > 0) {
      // Has status effects: prefer healing or utility moves
      score += this.profile.getMoveWeight(MoveCategory.HEALING) * 3;
      score += this.profile.getMoveWeight(MoveCategory.UTILITY) * 2;
    }

    // Type advantage bonus
    const typeBonus = this.profile.getTypeAdvantageBonus(self.typeTag, opponent.typeTag);
    score += typeBonus * 15;

    // Preferred type bonus
    if (this.profile.isTypePreferred(self.typeTag)) {
      score += 5;
    }

    return score;
  }

  /**
   * Evaluate threat level of opponent
   */
  evaluateThreatLevel(opponent: ISpiritInstance): number {
    if (!opponent) return 0;

    const hpRatio = opponent.maxHP > 0 ? opponent.currentHP / opponent.maxHP : 1;
    const levelDifference = opponent.level - (opponent.level || 10); // Assume level 10 if not set

    // Base threat from HP ratio (0.3 weight)
    const hpThreat = (1 - hpRatio) * 0.3;

    // Level difference threat (0.4 weight)
    const levelThreat = Math.max(0, levelDifference / 20) * 0.4;

    // Status effects threat (0.3 weight)
    const statusThreat = (opponent.statusEffects?.length || 0) * 0.1 * 0.3;

    return Math.min(1, hpThreat + levelThreat + statusThreat);
  }

  /**
   * Get decision profile
   */
  getDecisionProfile(): AIDecisionProfile {
    return this.profile;
  }

  /**
   * Set decision profile
   */
  setDecisionProfile(profile: AIDecisionProfile): void {
    this.profile = profile || AIDecisionProfile.balanced();
  }

  /**
   * Get preferred move types based on profile
   */
  getPreferredMoveTypes(): string[] {
    const weights = this.profile.movePriorityWeights;
    const sortedCategories = Object.entries(weights)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    return sortedCategories;
  }

  /**
   * Check if move can be used
   */
  canUseMove(moveId: string): boolean {
    // In a real implementation, this would check move requirements
    return moveId !== null && moveId !== undefined && moveId.trim() !== '';
  }

  /**
   * Get threat level description
   */
  getThreatLevelDescription(threatLevel: number): ThreatLevel {
    if (threatLevel >= 0.8) return ThreatLevel.CRITICAL;
    if (threatLevel >= 0.6) return ThreatLevel.HIGH;
    if (threatLevel >= 0.4) return ThreatLevel.MEDIUM;
    return ThreatLevel.LOW;
  }

  /**
   * Get profile summary
   */
  getProfileSummary(): string {
    return this.profile.getSummary();
  }

  /**
   * Check if AI is aggressive
   */
  get isAggressive(): boolean {
    return this.profile.isAggressive;
  }

  /**
   * Check if AI is defensive
   */
  get isDefensive(): boolean {
    return this.profile.isDefensive;
  }

  /**
   * Check if AI is balanced
   */
  get isBalanced(): boolean {
    return this.profile.isBalanced;
  }

  /**
   * Check if AI is trickster
   */
  get isTrickster(): boolean {
    return this.profile.isTrickster;
  }
}

/**
 * Utility functions for battle AI operations
 */
export const BattleAIUtils = {
  /**
   * Create standard AI profile set
   */
  createStandardProfiles(): AIDecisionProfile[] {
    return [
      AIDecisionProfile.balanced('balanced'),
      AIDecisionProfile.aggressive('aggressive'),
      AIDecisionProfile.defensive('defensive'),
      AIDecisionProfile.trickster('trickster')
    ];
  },

  /**
   * Create adaptive profile based on spirit stats
   */
  createAdaptiveProfile(spirit: ISpiritInstance): AIDecisionProfile {
    const hpRatio = spirit.currentHP / spirit.maxHP;
    const attackRatio = spirit.attack / (spirit.attack + spirit.specialAttack);
    const defenseRatio = spirit.defense / (spirit.defense + spirit.specialDefense);

    let style = AIDecisionStyle.BALANCED;
    let id = 'adaptive';

    // High HP and attack: aggressive
    if (hpRatio > 0.7 && attackRatio > 0.6) {
      style = AIDecisionStyle.AGGRESSIVE;
      id = 'adaptive_aggressive';
    }
    // Low HP: defensive
    else if (hpRatio < 0.3) {
      style = AIDecisionStyle.DEFENSIVE;
      id = 'adaptive_defensive';
    }
    // High defense: balanced with support focus
    else if (defenseRatio > 0.6) {
      style = AIDecisionStyle.BALANCED;
      id = 'adaptive_supportive';
    }

    const profile = AIDecisionProfile.createDefault(id, style);

    // Add type preferences
    profile.addPreferredType(spirit.typeTag);

    return profile;
  },

  /**
   * Create profile for boss battles
   */
  createBossProfile(bossLevel: number, playerLevel: number): AIDecisionProfile {
    const levelDifference = bossLevel - playerLevel;

    if (levelDifference > 5) {
      // Much stronger boss: defensive
      return AIDecisionProfile.defensive('boss_strong');
    } else if (levelDifference > 0) {
      // Slightly stronger boss: balanced
      return AIDecisionProfile.balanced('boss_challenging');
    } else {
      // Weaker or equal boss: aggressive
      return AIDecisionProfile.aggressive('boss_weak');
    }
  },

  /**
   * Create profile for specific battle scenarios
   */
  createScenarioProfile(scenario: 'early_game' | 'mid_game' | 'late_game' | 'boss' | 'pvp' | 'training'): AIDecisionProfile {
    switch (scenario) {
      case 'early_game':
        return AIDecisionProfile.balanced('early_game');
      case 'mid_game':
        return AIDecisionProfile.aggressive('mid_game');
      case 'late_game':
        return AIDecisionProfile.defensive('late_game');
      case 'boss':
        return AIDecisionProfile.balanced('boss_fight');
      case 'pvp':
        return AIDecisionProfile.trickster('pvp');
      case 'training':
        return AIDecisionProfile.defensive('training');
      default:
        return AIDecisionProfile.balanced('default_scenario');
    }
  },

  /**
   * Validate AI manager configuration
   */
  validateAIManger(manager: IAIControllerManager): string[] {
    const errors: string[] = [];

    if (!manager) {
      errors.push('AI manager is null or undefined');
      return errors;
    }

    const profiles = manager.getAllProfiles();
    if (profiles.length === 0) {
      errors.push('No AI profiles registered');
    }

    profiles.forEach((profile, index) => {
      const profileErrors = profile.validate();
      profileErrors.forEach(error => {
        errors.push(`Profile ${index} (${profile.profileID}): ${error}`);
      });
    });

    return errors;
  },

  /**
   * Compare AI profiles
   */
  compareProfiles(profile1: IAIDecisionProfile, profile2: IAIDecisionProfile): {
    styleMatch: boolean;
    weightDifference: number;
    typePreferencesMatch: boolean;
    totalDifference: number;
  } {
    const styleMatch = profile1.style === profile2.style;

    const weightDifference = Object.keys(profile1.movePriorityWeights).reduce((diff, category) => {
      const weight1 = profile1.movePriorityWeights[category] || 0;
      const weight2 = profile2.movePriorityWeights[category] || 0;
      return diff + Math.abs(weight1 - weight2);
    }, 0);

    const typePreferencesMatch = JSON.stringify(profile1.preferredTypes.sort()) ===
                                JSON.stringify(profile2.preferredTypes.sort());

    const totalDifference = (styleMatch ? 0 : 1) + weightDifference + (typePreferencesMatch ? 0 : 1);

    return {
      styleMatch,
      weightDifference,
      typePreferencesMatch,
      totalDifference
    };
  },

  /**
   * Get AI behavior description
   */
  getBehaviorDescription(profile: IAIDecisionProfile): string {
    const behaviors: string[] = [];

    switch (profile.style) {
      case AIDecisionStyle.AGGRESSIVE:
        behaviors.push('aggressive (prioritizes damage and advantages)');
        break;
      case AIDecisionStyle.DEFENSIVE:
        behaviors.push('defensive (focuses on healing and protection)');
        break;
      case AIDecisionStyle.BALANCED:
        behaviors.push('balanced (moderate risk/reward approach)');
        break;
      case AIDecisionStyle.TRICKSTER:
        behaviors.push('trickster (emphasizes support and control)');
        break;
    }

    if (profile.preferredTypes.length > 0) {
      behaviors.push(`prefers ${profile.preferredTypes.join(', ')} types`);
    }

    const topCategories = Object.entries(profile.movePriorityWeights)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    behaviors.push(`favors ${topCategories.join(' and ')} moves`);

    return behaviors.join(', ');
  },

  /**
   * Get threat level description
   */
  getThreatLevelDescription(threatLevel: number): string {
    if (threatLevel >= 0.8) return 'Critical threat - use defensive moves';
    if (threatLevel >= 0.6) return 'High threat - consider caution';
    if (threatLevel >= 0.4) return 'Medium threat - balanced approach';
    return 'Low threat - can be aggressive';
  },

  /**
   * Test AI decision making
   */
  testAIDecision(
    ai: IBattleAIController,
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    expectedMoveId: string
  ): boolean {
    const selectedMove = ai.selectMove(self, opponent);
    return selectedMove === expectedMoveId;
  }
};

/**
 * Default instances
 */
export const defaultAIDecisionProfile = AIDecisionProfile.balanced();
export const defaultAIControllerManager = new AIControllerManager();
export const defaultBattleAIController = new BattleAIController(defaultAIDecisionProfile);
/**
 * TeamsPure - Team Management System
 *
 * A comprehensive team management system for handling active teams and reserves,
 * with validation rules, synergy checks, and team composition constraints.
 * Supports multiplayer teams, party management, and flexible team configurations.
 *
 * @module TeamsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Team operation result enumeration
 */
export enum TeamOperationResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  INVALID_INPUT = 'invalid_input',
  TEAM_FULL = 'team_full',
  SPIRIT_NOT_FOUND = 'spirit_not_found',
  DUPLICATE_SPIRIT = 'duplicate_spirit',
  INVALID_TEAM_SIZE = 'invalid_team_size',
  INSUFFICIENT_DIVERSITY = 'insufficient_diversity',
  LOW_SYNERGY = 'low_synergy'
}

/**
 * Validation status enumeration
 */
export enum ValidationStatus {
  OK = 'ok',
  TOO_MANY_MEMBERS = 'too_many_members',
  DUPLICATE_SPECIES = 'duplicate_species',
  INVALID_SYNERGY = 'invalid_synergy',
  MISSING_REQUIREMENTS = 'missing_requirements',
  INCOMPATIBLE_MEMBERS = 'incompatible_members'
}

/**
 * Team position enumeration
 */
export enum TeamPosition {
  FRONT = 'front',
  MIDDLE = 'middle',
  BACK = 'back',
  SUPPORT = 'support',
  RESERVE = 'reserve'
}

/**
 * Team synergy type enumeration
 */
export enum SynergyType {
  TYPE_DIVERSITY = 'type_diversity',
  SYNC_LEVEL = 'sync_level',
  LEVEL_BALANCE = 'level_balance',
  STAT_DISTRIBUTION = 'stat_distribution',
  ROLE_COMPLEMENT = 'role_complement'
}

/**
 * Spirit instance interface
 */
export interface ISpiritInstance {
  instanceId: string;
  name: string;
  level: number;
  type: string;
  speciesId: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack?: number;
    specialDefense?: number;
  };
  statusEffects: string[];
  abilities: string[];
  position?: TeamPosition;
  isLeader?: boolean;
  teamId?: string;
  trainerId?: string;
  captureDate?: Date;
  experience: number;
  loyalty: number;
  [key: string]: any;
  validate(): string[];
  isAlive(): boolean;
  canAct(): boolean;
  getEffectiveStats(): Record<string, number>;
  getTypeEffectiveness(attackingType: string): number;
  clone(): ISpiritInstance;
  toJSON(): Record<string, any>;
}

/**
 * Team slot interface
 */
export interface ITeamSlot {
  position: TeamPosition;
  spirit?: ISpiritInstance;
  isLocked: boolean;
  requirements: string[];
  bonuses: string[];
  validate(spirit?: ISpiritInstance): string[];
  canAcceptSpirit(spirit: ISpiritInstance): boolean;
  getBonuses(): string[];
  lock(): void;
  unlock(): void;
  clone(): ITeamSlot;
  toJSON(): Record<string, any>;
}

/**
 * Team interface
 */
export interface ITeam {
  teamId: string;
  name: string;
  description: string;
  maxSize: number;
  slots: ITeamSlot[];
  spirits: ISpiritInstance[];
  reserves: ISpiritInstance[];
  rules: ITeamRules;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  validate(): IValidationResult;
  addSpirit(spirit: ISpiritInstance): TeamOperationResult;
  removeSpirit(spiritId: string): TeamOperationResult;
  swapSpirits(indexA: number, indexB: number): TeamOperationResult;
  moveSpiritToReserve(spiritId: string): TeamOperationResult;
  moveSpiritFromReserve(spiritId: string): TeamOperationResult;
  getSpirit(index: number): ISpiritInstance | null;
  getSpiritsByPosition(position: TeamPosition): ISpiritInstance[];
  getSpiritsByType(type: string): ISpiritInstance[];
  getTotalStats(): Record<string, number>;
  getAverageLevel(): number;
  getAverageSync(syncMap?: Map<string, number>): number;
  calculateSynergy(syncMap?: Map<string, number>): number;
  getDiversityScore(): number;
  exportTeam(): Record<string, any>;
  importTeam(data: Record<string, any>): void;
  clone(): ITeam;
  toJSON(): Record<string, any>;
}

/**
 * Team rules interface
 */
export interface ITeamRules {
  maxTeamSize: number;
  requireTypeDiversity: boolean;
  enableSyncSynergy: boolean;
  minAverageLevel?: number;
  maxLevelDifference?: number;
  requiredTypes?: string[];
  forbiddenTypes?: string[];
  minDiversityScore?: number;
  minSyncSynergy?: number;
  allowDuplicates: boolean;
  requireBalance: boolean;
  validateTeam(team: ITeam, spiritSync?: Map<string, number>): IValidationResult;
  getRuleDescription(): string;
  clone(): ITeamRules;
  toJSON(): Record<string, any>;
}

/**
 * Validation result interface
 */
export interface IValidationResult {
  status: ValidationStatus;
  message: string;
  warnings: string[];
  errors: string[];
  isValid: boolean;
  getSummary(): string;
}

/**
 * Team manager interface
 */
export interface ITeamManager {
  createTeam(teamName: string, maxSize?: number): ITeam;
  deleteTeam(teamId: string): boolean;
  getTeam(teamId: string): ITeam | null;
  getAllTeams(): ITeam[];
  addSpiritToTeam(teamId: string, spirit: ISpiritInstance): TeamOperationResult;
  removeSpiritFromTeam(teamId: string, spiritId: string): TeamOperationResult;
  swapTeamMembers(teamId: string, indexA: number, indexB: number): TeamOperationResult;
  moveSpiritToReserve(teamId: string, spiritId: string): TeamOperationResult;
  moveSpiritFromReserve(teamId: string, spiritId: string): TeamOperationResult;
  getActiveTeam(teamId: string): ISpiritInstance[];
  getReserves(teamId: string): ISpiritInstance[];
  setMaxTeamSize(teamId: string, maxSize: number): boolean;
  validateTeam(teamId: string): IValidationResult;
  getTeamStatistics(teamId: string): Record<string, number>;
  exportTeam(teamId: string): Record<string, any>;
  importTeam(teamId: string, data: Record<string, any>): TeamOperationResult;
}

/**
 * Team synergy calculator interface
 */
export interface ITeamSynergyCalculator {
  calculateSyncSynergy(team: ISpiritInstance[], syncMap: Map<string, number>): number;
  calculateTypeSynergy(team: ISpiritInstance[]): number;
  calculateLevelSynergy(team: ISpiritInstance[]): number;
  calculateOverallSynergy(team: ISpiritInstance[], syncMap: Map<string, number>): number;
  getSynergyDescription(synergy: number): string;
  getRecommendedTeamComposition(currentTeam: ISpiritInstance[]): ISpiritInstance[];
}

/**
 * Team template interface
 */
export interface ITeamTemplate {
  templateId: string;
  name: string;
  description: string;
  maxSize: number;
  requiredPositions: TeamPosition[];
  recommendedTypes: string[];
  requiredSpirits?: string[];
  bonuses: string[];
  restrictions: string[];
  isDefault: boolean;
  validate(): string[];
  createTeam(): ITeam;
  toJSON(): Record<string, any>;
}

/**
 * Validation result implementation
 */
export class ValidationResult implements IValidationResult {
  public status: ValidationStatus;
  public message: string;
  public warnings: string[];
  public errors: string[];
  public isValid: boolean;

  constructor(
    status: ValidationStatus,
    message: string,
    warnings: string[] = [],
    errors: string[] = []
  ) {
    this.status = status;
    this.message = message;
    this.warnings = [...warnings];
    this.errors = [...errors];
    this.isValid = this.errors.length === 0;
  }

  /**
   * Create successful validation result
   */
  static ok(message: string = 'Validation successful'): ValidationResult {
    return new ValidationResult(ValidationStatus.OK, message);
  }

  /**
   * Create failed validation result
   */
  static fail(status: ValidationStatus, message: string): ValidationResult {
    return new ValidationResult(status, message, [], [message]);
  }

  /**
   * Create validation result with warnings
   */
  static warn(message: string, warnings: string[]): ValidationResult {
    return new ValidationResult(ValidationStatus.OK, message, warnings, []);
  }

  /**
   * Get summary
   */
  getSummary(): string {
    if (this.isValid) {
      return `✅ Valid: ${this.message}`;
    } else {
      return `❌ Invalid: ${this.message}`;
    }
  }

  /**
   * Add warning
   */
  addWarning(warning: string): void {
    this.warnings.push(warning);
  }

  /**
   * Add error
   */
  addError(error: string): void {
    this.errors.push(error);
    this.isValid = false;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      status: this.status,
      message: this.message,
      warnings: this.warnings,
      errors: this.errors,
      isValid: this.isValid
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): ValidationResult {
    return new ValidationResult(
      data.status,
      data.message,
      data.warnings || [],
      data.errors || []
    );
  }
}

/**
 * Team slot implementation
 */
export class TeamSlot implements ITeamSlot {
  public position: TeamPosition;
  public spirit?: ISpiritInstance;
  public isLocked: boolean;
  public requirements: string[];
  public bonuses: string[];

  constructor(
    position: TeamPosition,
    requirements: string[] = [],
    bonuses: string[] = [],
    isLocked: boolean = false
  ) {
    this.position = position;
    this.requirements = [...requirements];
    this.bonuses = [...bonuses];
    this.isLocked = isLocked;
  }

  /**
   * Create team slot
   */
  static create(
    position: TeamPosition,
    requirements?: string[],
    bonuses?: string[],
    isLocked?: boolean
  ): TeamSlot {
    return new TeamSlot(position, requirements, bonuses, isLocked);
  }

  /**
   * Create front slot
   */
  static front(): TeamSlot {
    return new TeamSlot(TeamPosition.FRONT, ['high_attack'], ['front_bonus']);
  }

  /**
   * Create middle slot
   */
  static middle(): TeamSlot {
    return new TeamSlot(TeamPosition.MIDDLE, ['balanced_stats'], ['middle_bonus']);
  }

  /**
   * Create back slot
   */
  static back(): TeamSlot {
    return new TeamSlot(TeamPosition.BACK, ['high_defense'], ['back_bonus']);
  }

  /**
   * Create support slot
   */
  static support(): TeamSlot {
    return new TeamSlot(TeamPosition.SUPPORT, ['support_ability'], ['support_bonus']);
  }

  /**
   * Validate slot with spirit
   */
  validate(spirit?: ISpiritInstance): string[] {
    const errors: string[] = [];

    if (this.isLocked && !spirit) {
      errors.push('Slot is locked and requires a spirit');
    }

    if (spirit) {
      this.requirements.forEach(requirement => {
        if (!this.spiritMeetsRequirement(spirit, requirement)) {
          errors.push(`Spirit does not meet requirement: ${requirement}`);
        }
      });
    }

    return errors;
  }

  /**
   * Check if spirit can be accepted
   */
  canAcceptSpirit(spirit: ISpiritInstance): boolean {
    if (this.isLocked && !this.spirit) {
      return false;
    }

    if (this.spirit) {
      return false; // Slot already occupied
    }

    return this.requirements.every(requirement =>
      this.spiritMeetsRequirement(spirit, requirement)
    );
  }

  /**
   * Get bonuses for current spirit
   */
  getBonuses(): string[] {
    if (!this.spirit) {
      return [];
    }
    return [...this.bonuses];
  }

  /**
   * Lock slot
   */
  lock(): void {
    this.isLocked = true;
  }

  /**
   * Unlock slot
   */
  unlock(): void {
    this.isLocked = false;
  }

  /**
   * Clone slot
   */
  clone(): TeamSlot {
    const cloned = new TeamSlot(this.position, this.requirements, this.bonuses, this.isLocked);
    if (this.spirit) {
      cloned.spirit = this.spirit.clone();
    }
    return cloned;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      position: this.position,
      spirit: this.spirit?.toJSON(),
      isLocked: this.isLocked,
      requirements: this.requirements,
      bonuses: this.bonuses
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): TeamSlot {
    const slot = new TeamSlot(
      data.position,
      data.requirements || [],
      data.bonuses || [],
      data.isLocked || false
    );

    if (data.spirit) {
      slot.spirit = {} as ISpiritInstance; // Would need proper spirit deserialization
    }

    return slot;
  }

  /**
   * Check if spirit meets requirement
   */
  private spiritMeetsRequirement(spirit: ISpiritInstance, requirement: string): boolean {
    // This would be expanded with more complex requirement checking
    switch (requirement) {
      case 'high_attack':
        return spirit.stats.attack >= 80;
      case 'high_defense':
        return spirit.stats.defense >= 80;
      case 'balanced_stats':
        const stats = Object.values(spirit.stats);
        const avg = stats.reduce((sum, stat) => sum + stat, 0) / stats.length;
        const variance = stats.reduce((sum, stat) => sum + Math.pow(stat - avg, 2), 0) / stats.length;
        return variance < 500; // Low variance = balanced
      case 'support_ability':
        return spirit.abilities.some(ability => ability.toLowerCase().includes('support'));
      default:
        return true;
    }
  }
}

/**
 * Team rules implementation
 */
export class TeamRules implements ITeamRules {
  public maxTeamSize: number;
  public requireTypeDiversity: boolean;
  public enableSyncSynergy: boolean;
  public minAverageLevel?: number;
  public maxLevelDifference?: number;
  public requiredTypes?: string[];
  public forbiddenTypes?: string[];
  public minDiversityScore?: number;
  public minSyncSynergy?: number;
  public allowDuplicates: boolean;
  public requireBalance: boolean;

  constructor(
    maxTeamSize: number = 6,
    requireTypeDiversity: boolean = false,
    enableSyncSynergy: boolean = true,
    allowDuplicates: boolean = false,
    requireBalance: boolean = false,
    minAverageLevel?: number,
    maxLevelDifference?: number,
    requiredTypes?: string[],
    forbiddenTypes?: string[],
    minDiversityScore?: number,
    minSyncSynergy?: number
  ) {
    this.maxTeamSize = maxTeamSize;
    this.requireTypeDiversity = requireTypeDiversity;
    this.enableSyncSynergy = enableSyncSynergy;
    this.allowDuplicates = allowDuplicates;
    this.requireBalance = requireBalance;
    this.minAverageLevel = minAverageLevel;
    this.maxLevelDifference = maxLevelDifference;
    this.requiredTypes = requiredTypes ? [...requiredTypes] : [];
    this.forbiddenTypes = forbiddenTypes ? [...forbiddenTypes] : [];
    this.minDiversityScore = minDiversityScore;
    this.minSyncSynergy = minSyncSynergy;
  }

  /**
   * Create team rules
   */
  static create(
    maxTeamSize?: number,
    requireTypeDiversity?: boolean,
    enableSyncSynergy?: boolean,
    allowDuplicates?: boolean,
    requireBalance?: boolean,
    minAverageLevel?: number,
    maxLevelDifference?: number,
    requiredTypes?: string[],
    forbiddenTypes?: string[],
    minDiversityScore?: number,
    minSyncSynergy?: number
  ): TeamRules {
    return new TeamRules(
      maxTeamSize, requireTypeDiversity, enableSyncSynergy,
      allowDuplicates, requireBalance, minAverageLevel, maxLevelDifference,
      requiredTypes, forbiddenTypes, minDiversityScore, minSyncSynergy
    );
  }

  /**
   * Create balanced team rules
   */
  static balanced(): TeamRules {
    return new TeamRules(
      6,  // maxTeamSize
      true,  // requireTypeDiversity
      true,  // enableSyncSynergy
      false, // allowDuplicates
      true,  // requireBalance
      25,    // minAverageLevel
      20,    // maxLevelDifference
      ['fire', 'water', 'grass'], // requiredTypes
      [],    // forbiddenTypes
      0.7,   // minDiversityScore
      50     // minSyncSynergy
    );
  }

  /**
   * Create competitive team rules
   */
  static competitive(): TeamRules {
    return new TeamRules(
      6,  // maxTeamSize
      true,  // requireTypeDiversity
      true,  // enableSyncSynergy
      false, // allowDuplicates
      true,  // requireBalance
      50,    // minAverageLevel
      10,    // maxLevelDifference
      ['fire', 'water', 'electric', 'psychic'], // requiredTypes
      [],    // forbiddenTypes
      0.8,   // minDiversityScore
      75     // minSyncSynergy
    );
  }

  /**
   * Create casual team rules
   */
  static casual(): TeamRules {
    return new TeamRules(
      8,  // maxTeamSize
      false, // requireTypeDiversity
      false, // enableSyncSynergy
      true,  // allowDuplicates
      false, // requireBalance
      1,     // minAverageLevel
      50,    // maxLevelDifference
      [],    // requiredTypes
      [],    // forbiddenTypes
      0.3,   // minDiversityScore
      10     // minSyncSynergy
    );
  }

  /**
   * Validate team
   */
  validateTeam(team: ITeam, spiritSync?: Map<string, number>): IValidationResult {
    const spirits = team.spirits;
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check team size
    if (spirits.length > this.maxTeamSize) {
      errors.push(`Team has ${spirits.length} members, maximum is ${this.maxTeamSize}`);
      return new ValidationResult(ValidationStatus.TOO_MANY_MEMBERS, errors[0], [], errors);
    }

    // Check for duplicates
    if (!this.allowDuplicates) {
      const speciesIds = new Set(spirits.map(s => s.speciesId));
      if (speciesIds.size < spirits.length) {
        errors.push('Duplicate spirits are not allowed in this team');
        return new ValidationResult(ValidationStatus.DUPLICATE_SPECIES, errors[0], [], errors);
      }
    }

    // Check type diversity
    if (this.requireTypeDiversity && spirits.length >= 3) {
      const types = new Set(spirits.map(s => s.type));
      const minDiversity = Math.min(spirits.length, 3);
      if (types.size < minDiversity) {
        errors.push(`Team requires at least ${minDiversity} different types, has ${types.size}`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }
    }

    // Check required types
    if (this.requiredTypes && this.requiredTypes.length > 0) {
      const spiritTypes = new Set(spirits.map(s => s.type));
      const missingTypes = this.requiredTypes.filter(type => !spiritTypes.has(type));
      if (missingTypes.length > 0) {
        warnings.push(`Team missing recommended types: ${missingTypes.join(', ')}`);
      }
    }

    // Check forbidden types
    if (this.forbiddenTypes && this.forbiddenTypes.length > 0) {
      const forbiddenInTeam = spirits.filter(s => this.forbiddenTypes!.includes(s.type));
      if (forbiddenInTeam.length > 0) {
        errors.push(`Team contains forbidden types: ${forbiddenInTeam.map(s => s.type).join(', ')}`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }
    }

    // Check sync synergy
    if (this.enableSyncSynergy && spiritSync && spirits.length > 0) {
      const totalSync = spirits.reduce((sum, spirit) => {
        return sum + (spiritSync.get(spirit.instanceId) || 0);
      }, 0);
      const averageSync = totalSync / spirits.length;
      const minRequiredSync = this.minSyncSynergy || (spirits.length * 10);

      if (averageSync < minRequiredSync) {
        errors.push(`Team average sync (${averageSync.toFixed(1)}) is below minimum (${minRequiredSync})`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }
    }

    // Check balance requirements
    if (this.requireBalance && spirits.length >= 3) {
      const levels = spirits.map(s => s.level);
      const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      const maxDifference = Math.max(...levels) - Math.min(...levels);

      if (this.maxLevelDifference && maxDifference > this.maxLevelDifference) {
        errors.push(`Level difference (${maxDifference}) exceeds maximum (${this.maxLevelDifference})`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }

      if (this.minAverageLevel && avgLevel < this.minAverageLevel) {
        errors.push(`Average team level (${avgLevel.toFixed(1)}) is below minimum (${this.minAverageLevel})`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }
    }

    // Check diversity score
    if (this.minDiversityScore && spirits.length >= 2) {
      const diversityScore = this.calculateDiversityScore(spirits);
      if (diversityScore < this.minDiversityScore) {
        errors.push(`Team diversity score (${diversityScore.toFixed(2)}) is below minimum (${this.minDiversityScore})`);
        return new ValidationResult(ValidationStatus.INVALID_SYNERGY, errors[0], [], errors);
      }
    }

    return new ValidationResult(ValidationStatus.OK, 'Team validation passed', warnings, errors);
  }

  /**
   * Get rule description
   */
  getRuleDescription(): string {
    const rules: string[] = [];

    rules.push(`Max team size: ${this.maxTeamSize}`);
    rules.push(`Allow duplicates: ${this.allowDuplicates ? 'Yes' : 'No'}`);
    rules.push(`Require type diversity: ${this.requireTypeDiversity ? 'Yes' : 'No'}`);
    rules.push(`Enable sync synergy: ${this.enableSyncSynergy ? 'Yes' : 'No'}`);
    rules.push(`Require balance: ${this.requireBalance ? 'Yes' : 'No'}`);

    if (this.minAverageLevel) {
      rules.push(`Minimum average level: ${this.minAverageLevel}`);
    }

    if (this.maxLevelDifference) {
      rules.push(`Maximum level difference: ${this.maxLevelDifference}`);
    }

    if (this.requiredTypes && this.requiredTypes.length > 0) {
      rules.push(`Required types: ${this.requiredTypes.join(', ')}`);
    }

    if (this.forbiddenTypes && this.forbiddenTypes.length > 0) {
      rules.push(`Forbidden types: ${this.forbiddenTypes.join(', ')}`);
    }

    if (this.minDiversityScore) {
      rules.push(`Minimum diversity score: ${this.minDiversityScore}`);
    }

    if (this.minSyncSynergy) {
      rules.push(`Minimum sync synergy: ${this.minSyncSynergy}`);
    }

    return rules.join(', ');
  }

  /**
   * Clone rules
   */
  clone(): TeamRules {
    return TeamRules.create(
      this.maxTeamSize,
      this.requireTypeDiversity,
      this.enableSyncSynergy,
      this.allowDuplicates,
      this.requireBalance,
      this.minAverageLevel,
      this.maxLevelDifference,
      this.requiredTypes,
      this.forbiddenTypes,
      this.minDiversityScore,
      this.minSyncSynergy
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      maxTeamSize: this.maxTeamSize,
      requireTypeDiversity: this.requireTypeDiversity,
      enableSyncSynergy: this.enableSyncSynergy,
      allowDuplicates: this.allowDuplicates,
      requireBalance: this.requireBalance,
      minAverageLevel: this.minAverageLevel,
      maxLevelDifference: this.maxLevelDifference,
      requiredTypes: this.requiredTypes,
      forbiddenTypes: this.forbiddenTypes,
      minDiversityScore: this.minDiversityScore,
      minSyncSynergy: this.minSyncSynergy
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): TeamRules {
    return new TeamRules(
      data.maxTeamSize || 6,
      data.requireTypeDiversity || false,
      data.enableSyncSynergy !== false,
      data.allowDuplicates || false,
      data.requireBalance || false,
      data.minAverageLevel,
      data.maxLevelDifference,
      data.requiredTypes,
      data.forbiddenTypes,
      data.minDiversityScore,
      data.minSyncSynergy
    );
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(spirits: ISpiritInstance[]): number {
    if (spirits.length <= 1) return 1.0;

    // Type diversity
    const types = new Set(spirits.map(s => s.type));
    const typeDiversity = types.size / spirits.length;

    // Level diversity
    const levels = spirits.map(s => s.level);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const levelVariance = levels.reduce((sum, level) => sum + Math.pow(level - avgLevel, 2), 0) / levels.length;
    const levelDiversity = Math.min(1.0, levelVariance / 1000); // Normalize to 0-1

    // Role diversity (based on stats)
    const roles = spirits.map(s => this.classifyRole(s));
    const roleTypes = new Set(roles);
    const roleDiversity = roleTypes.size / spirits.length;

    // Combined diversity score
    return (typeDiversity * 0.4) + (levelDiversity * 0.3) + (roleDiversity * 0.3);
  }

  /**
   * Classify spirit role based on stats
   */
  private classifyRole(spirit: ISpiritInstance): string {
    const stats = spirit.stats;
    const totalStats = stats.attack + stats.defense + stats.speed + (stats.specialAttack || 0) + (stats.specialDefense || 0);

    if (stats.attack > totalStats * 0.3) return 'attacker';
    if (stats.defense > totalStats * 0.3) return 'defender';
    if ((stats.specialAttack || 0) > totalStats * 0.3) return 'special_attacker';
    if ((stats.specialDefense || 0) > totalStats * 0.3) return 'special_defender';
    if (stats.speed > totalStats * 0.3) return 'speedster';

    return 'balanced';
  }
}

/**
 * Team implementation
 */
export class Team implements ITeam {
  public teamId: string;
  public name: string;
  public description: string;
  public maxSize: number;
  public slots: ITeamSlot[];
  public spirits: ISpiritInstance[];
  public reserves: ISpiritInstance[];
  public rules: ITeamRules;
  public metadata: Record<string, any>;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    teamId: string,
    name: string,
    description: string = '',
    maxSize: number = 6,
    rules?: ITeamRules
  ) {
    this.teamId = teamId;
    this.name = name;
    this.description = description;
    this.maxSize = maxSize;
    this.slots = this.initializeSlots();
    this.spirits = [];
    this.reserves = [];
    this.rules = rules || TeamRules.balanced();
    this.metadata = {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Create team
   */
  static create(
    teamId: string,
    name: string,
    description?: string,
    maxSize?: number,
    rules?: ITeamRules
  ): Team {
    return new Team(teamId, name, description, maxSize, rules);
  }

  /**
   * Create team with template
   */
  static fromTemplate(template: ITeamTemplate): Team {
    const team = new Team(template.templateId, template.name, template.description, template.maxSize);
    team.rules = TeamRules.balanced(); // Default rules
    team.metadata['template'] = template.templateId;
    return team;
  }

  /**
   * Initialize slots
   */
  private initializeSlots(): ITeamSlot[] {
    const slots: ITeamSlot[] = [];

    // Create default slot configuration
    for (let i = 0; i < this.maxSize; i++) {
      let position: TeamPosition;
      switch (i) {
        case 0: position = TeamPosition.FRONT; break;
        case 1: position = TeamPosition.FRONT; break;
        case 2: position = TeamPosition.MIDDLE; break;
        case 3: position = TeamPosition.MIDDLE; break;
        case 4: position = TeamPosition.BACK; break;
        case 5: position = TeamPosition.SUPPORT; break;
        default: position = TeamPosition.RESERVE;
      }

      slots.push(TeamSlot.create(position));
    }

    return slots;
  }

  /**
   * Validate team
   */
  validate(): IValidationResult {
    return this.rules.validateTeam(this);
  }

  /**
   * Add spirit to team
   */
  addSpirit(spirit: ISpiritInstance): TeamOperationResult {
    // Check if spirit already exists
    if (this.spirits.some(s => s.instanceId === spirit.instanceId)) {
      return TeamOperationResult.DUPLICATE_SPIRIT;
    }

    // Validate against team rules
    const validation = this.rules.validateTeam(this);
    if (!validation.isValid) {
      return TeamOperationResult.INVALID_TEAM_SIZE;
    }

    // Try to add to active team
    if (this.spirits.length < this.maxSize) {
      this.spirits.push(spirit);
      this.updatedAt = new Date();
      return TeamOperationResult.SUCCESS;
    } else {
      // Add to reserves
      this.reserves.push(spirit);
      this.updatedAt = new Date();
      return TeamOperationResult.TEAM_FULL;
    }
  }

  /**
   * Remove spirit from team
   */
  removeSpirit(spiritId: string): TeamOperationResult {
    // Try to remove from active team
    const activeIndex = this.spirits.findIndex(s => s.instanceId === spiritId);
    if (activeIndex >= 0) {
      this.spirits.splice(activeIndex, 1);

      // Move spirit from reserves to active team if space available
      if (this.reserves.length > 0 && this.spirits.length < this.maxSize) {
        const reserveSpirit = this.reserves.shift()!;
        this.spirits.push(reserveSpirit);
      }

      this.updatedAt = new Date();
      return TeamOperationResult.SUCCESS;
    }

    // Try to remove from reserves
    const reserveIndex = this.reserves.findIndex(s => s.instanceId === spiritId);
    if (reserveIndex >= 0) {
      this.reserves.splice(reserveIndex, 1);
      this.updatedAt = new Date();
      return TeamOperationResult.SUCCESS;
    }

    return TeamOperationResult.SPIRIT_NOT_FOUND;
  }

  /**
   * Swap team members
   */
  swapSpirits(indexA: number, indexB: number): TeamOperationResult {
    if (indexA < 0 || indexA >= this.spirits.length ||
        indexB < 0 || indexB >= this.spirits.length) {
      return TeamOperationResult.INVALID_INPUT;
    }

    [this.spirits[indexA], this.spirits[indexB]] = [this.spirits[indexB], this.spirits[indexA]];
    this.updatedAt = new Date();
    return TeamOperationResult.SUCCESS;
  }

  /**
   * Move spirit to reserve
   */
  moveSpiritToReserve(spiritId: string): TeamOperationResult {
    const index = this.spirits.findIndex(s => s.instanceId === spiritId);
    if (index >= 0) {
      const spirit = this.spirits.splice(index, 1)[0];
      this.reserves.push(spirit);
      this.updatedAt = new Date();
      return TeamOperationResult.SUCCESS;
    }
    return TeamOperationResult.SPIRIT_NOT_FOUND;
  }

  /**
   * Move spirit from reserve to active team
   */
  moveSpiritFromReserve(spiritId: string): TeamOperationResult {
    const index = this.reserves.findIndex(s => s.instanceId === spiritId);
    if (index >= 0 && this.spirits.length < this.maxSize) {
      const spirit = this.reserves.splice(index, 1)[0];
      this.spirits.push(spirit);
      this.updatedAt = new Date();
      return TeamOperationResult.SUCCESS;
    }
    return TeamOperationResult.TEAM_FULL;
  }

  /**
   * Get spirit by index
   */
  getSpirit(index: number): ISpiritInstance | null {
    if (index < 0 || index >= this.spirits.length) {
      return null;
    }
    return this.spirits[index];
  }

  /**
   * Get spirits by position
   */
  getSpiritsByPosition(position: TeamPosition): ISpiritInstance[] {
    return this.spirits.filter(spirit => spirit.position === position);
  }

  /**
   * Get spirits by type
   */
  getSpiritsByType(type: string): ISpiritInstance[] {
    return this.spirits.filter(spirit => spirit.type === type);
  }

  /**
   * Get total stats
   */
  getTotalStats(): Record<string, number> {
    const total: Record<string, number> = {
      hp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      specialAttack: 0,
      specialDefense: 0
    };

    this.spirits.forEach(spirit => {
      total.hp += spirit.stats.hp;
      total.attack += spirit.stats.attack;
      total.defense += spirit.stats.defense;
      total.speed += spirit.stats.speed;
      if (spirit.stats.specialAttack) total.specialAttack += spirit.stats.specialAttack;
      if (spirit.stats.specialDefense) total.specialDefense += spirit.stats.specialDefense;
    });

    return total;
  }

  /**
   * Get average level
   */
  getAverageLevel(): number {
    if (this.spirits.length === 0) return 0;
    const totalLevel = this.spirits.reduce((sum, spirit) => sum + spirit.level, 0);
    return totalLevel / this.spirits.length;
  }

  /**
   * Get average sync
   */
  getAverageSync(syncMap?: Map<string, number>): number {
    if (this.spirits.length === 0) return 0;

    let totalSync = 0;
    this.spirits.forEach(spirit => {
      if (syncMap) {
        totalSync += syncMap.get(spirit.instanceId) || 0;
      } else {
        totalSync += 50; // Default sync level
      }
    });

    return totalSync / this.spirits.length;
  }

  /**
   * Calculate synergy
   */
  calculateSynergy(syncMap?: Map<string, number>): number {
    if (this.spirits.length <= 1) return 100; // Perfect synergy with 1 or 0 spirits

    // Type synergy (0-100)
    const typeSynergy = this.calculateTypeSynergy();

    // Sync synergy (0-100)
    const syncSynergy = this.calculateSyncSynergy(syncMap);

    // Level synergy (0-100)
    const levelSynergy = this.calculateLevelSynergy();

    // Overall synergy (weighted average)
    return (typeSynergy * 0.4) + (syncSynergy * 0.4) + (levelSynergy * 0.2);
  }

  /**
   * Get diversity score
   */
  getDiversityScore(): number {
    return this.calculateDiversityScore();
  }

  /**
   * Export team
   */
  exportTeam(): Record<string, any> {
    return {
      teamId: this.teamId,
      name: this.name,
      description: this.description,
      maxSize: this.maxSize,
      spirits: this.spirits.map(spirit => spirit.toJSON()),
      reserves: this.reserves.map(spirit => spirit.toJSON()),
      rules: this.rules.toJSON(),
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Import team
   */
  importTeam(data: Record<string, any>): void {
    this.teamId = data.teamId || this.teamId;
    this.name = data.name || this.name;
    this.description = data.description || this.description;
    this.maxSize = data.maxSize || this.maxSize;

    if (data.spirits && Array.isArray(data.spirits)) {
      this.spirits = data.spirits.map((spiritData: any) => ({ ...spiritData }) as ISpiritInstance);
    }

    if (data.reserves && Array.isArray(data.reserves)) {
      this.reserves = data.reserves.map((spiritData: any) => ({ ...spiritData }) as ISpiritInstance);
    }

    if (data.rules) {
      this.rules = TeamRules.fromJSON(data.rules);
    }

    this.metadata = data.metadata || {};
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }

  /**
   * Clone team
   */
  clone(): Team {
    const cloned = Team.create(this.teamId, this.name, this.description, this.maxSize, this.rules.clone());
    cloned.spirits = this.spirits.map(spirit => spirit.clone());
    cloned.reserves = this.reserves.map(spirit => spirit.clone());
    cloned.slots = this.slots.map(slot => slot.clone());
    cloned.metadata = { ...this.metadata };
    cloned.createdAt = new Date(this.createdAt);
    cloned.updatedAt = new Date(this.updatedAt);
    return cloned;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return this.exportTeam();
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): Team {
    const team = new Team(
      data.teamId,
      data.name,
      data.description,
      data.maxSize,
      data.rules ? TeamRules.fromJSON(data.rules) : undefined
    );

    team.importTeam(data);
    return team;
  }

  /**
   * Calculate type synergy
   */
  private calculateTypeSynergy(): number {
    if (this.spirits.length <= 1) return 100;

    const types = this.spirits.map(s => s.type);
    const uniqueTypes = new Set(types);
    const diversityRatio = uniqueTypes.size / this.spirits.length;

    // Calculate type effectiveness bonuses
    let effectivenessBonus = 0;
    for (let i = 0; i < this.spirits.length; i++) {
      for (let j = i + 1; j < this.spirits.length; j++) {
        // This would use the type effectiveness system
        effectivenessBonus += 10; // Placeholder
      }
    }

    return Math.min(100, (diversityRatio * 100) + effectivenessBonus);
  }

  /**
   * Calculate sync synergy
   */
  private calculateSyncSynergy(syncMap?: Map<string, number>): number {
    if (this.spirits.length === 0) return 100;

    let totalSync = 0;
    this.spirits.forEach(spirit => {
      if (syncMap) {
        totalSync += syncMap.get(spirit.instanceId) || 0;
      } else {
        totalSync += 50; // Default sync level
      }
    });

    const averageSync = totalSync / this.spirits.length;
    return Math.min(100, averageSync);
  }

  /**
   * Calculate level synergy
   */
  private calculateLevelSynergy(): number {
    if (this.spirits.length <= 1) return 100;

    const levels = this.spirits.map(s => s.level);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const maxDifference = Math.max(...levels) - Math.min(...levels);

    // Lower difference = higher synergy
    const differenceScore = Math.max(0, 100 - maxDifference);
    const levelScore = Math.min(100, avgLevel);

    return (differenceScore * 0.7) + (levelScore * 0.3);
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(): number {
    if (this.spirits.length <= 1) return 1.0;

    // Type diversity
    const types = new Set(this.spirits.map(s => s.type));
    const typeDiversity = types.size / this.spirits.length;

    // Role diversity
    const roles = new Set(this.spirits.map(s => this.getSpiritRole(s)));
    const roleDiversity = roles.size / this.spirits.length;

    // Level diversity
    const levels = this.spirits.map(s => s.level);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const levelVariance = levels.reduce((sum, level) => sum + Math.pow(level - avgLevel, 2), 0) / levels.length;
    const levelDiversity = Math.min(1.0, levelVariance / 1000);

    return (typeDiversity * 0.4) + (roleDiversity * 0.3) + (levelDiversity * 0.3);
  }

  /**
   * Get spirit role based on stats
   */
  private getSpiritRole(spirit: ISpiritInstance): string {
    const stats = spirit.stats;
    const totalStats = stats.attack + stats.defense + stats.speed + (stats.specialAttack || 0) + (stats.specialDefense || 0);

    if (stats.attack > totalStats * 0.3) return 'attacker';
    if (stats.defense > totalStats * 0.3) return 'defender';
    if ((stats.specialAttack || 0) > totalStats * 0.3) return 'special_attacker';
    if ((stats.specialDefense || 0) > totalStats * 0.3) return 'special_defender';
    if (stats.speed > totalStats * 0.3) return 'speedster';

    return 'balanced';
  }
}

/**
 * Team manager implementation
 */
export class TeamManager implements ITeamManager {
  private teams = new Map<string, ITeam>();
  private nextTeamId = 1;

  /**
   * Create team manager
   */
  static create(): TeamManager {
    return new TeamManager();
  }

  /**
   * Create team
   */
  createTeam(teamName: string, maxSize?: number): ITeam {
    const teamId = `team_${this.nextTeamId++}`;
    const team = Team.create(teamId, teamName, '', maxSize);
    this.teams.set(teamId, team);
    return team;
  }

  /**
   * Delete team
   */
  deleteTeam(teamId: string): boolean {
    return this.teams.delete(teamId);
  }

  /**
   * Get team
   */
  getTeam(teamId: string): ITeam | null {
    return this.teams.get(teamId) || null;
  }

  /**
   * Get all teams
   */
  getAllTeams(): ITeam[] {
    return Array.from(this.teams.values());
  }

  /**
   * Add spirit to team
   */
  addSpiritToTeam(teamId: string, spirit: ISpiritInstance): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    return team.addSpirit(spirit);
  }

  /**
   * Remove spirit from team
   */
  removeSpiritFromTeam(teamId: string, spiritId: string): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    return team.removeSpirit(spiritId);
  }

  /**
   * Swap team members
   */
  swapTeamMembers(teamId: string, indexA: number, indexB: number): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    return team.swapSpirits(indexA, indexB);
  }

  /**
   * Move spirit to reserve
   */
  moveSpiritToReserve(teamId: string, spiritId: string): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    return team.moveSpiritToReserve(spiritId);
  }

  /**
   * Move spirit from reserve
   */
  moveSpiritFromReserve(teamId: string, spiritId: string): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    return team.moveSpiritFromReserve(spiritId);
  }

  /**
   * Get active team
   */
  getActiveTeam(teamId: string): ISpiritInstance[] {
    const team = this.getTeam(teamId);
    return team ? team.spirits : [];
  }

  /**
   * Get reserves
   */
  getReserves(teamId: string): ISpiritInstance[] {
    const team = this.getTeam(teamId);
    return team ? team.reserves : [];
  }

  /**
   * Set max team size
   */
  setMaxTeamSize(teamId: string, maxSize: number): boolean {
    const team = this.getTeam(teamId);
    if (!team || maxSize <= 0 || maxSize > 10) {
      return false;
    }

    team.maxSize = maxSize;
    return true;
  }

  /**
   * Validate team
   */
  validateTeam(teamId: string): IValidationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return new ValidationResult(ValidationStatus.INVALID_SYNERGY, 'Team not found');
    }

    return team.validate();
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(teamId: string): Record<string, number> {
    const team = this.getTeam(teamId);
    if (!team) {
      return {};
    }

    return {
      totalSpirits: team.spirits.length + team.reserves.length,
      activeSpirits: team.spirits.length,
      reserveSpirits: team.reserves.length,
      averageLevel: team.getAverageLevel(),
      averageSync: team.getAverageSync(),
      synergy: team.calculateSynergy(),
      diversityScore: team.getDiversityScore(),
      totalHp: team.getTotalStats().hp,
      totalAttack: team.getTotalStats().attack,
      totalDefense: team.getTotalStats().defense,
      totalSpeed: team.getTotalStats().speed
    };
  }

  /**
   * Export team
   */
  exportTeam(teamId: string): Record<string, any> {
    const team = this.getTeam(teamId);
    return team ? team.exportTeam() : {};
  }

  /**
   * Import team
   */
  importTeam(teamId: string, data: Record<string, any>): TeamOperationResult {
    const team = this.getTeam(teamId);
    if (!team) {
      return TeamOperationResult.INVALID_INPUT;
    }

    try {
      team.importTeam(data);
      return TeamOperationResult.SUCCESS;
    } catch (error) {
      return TeamOperationResult.FAILURE;
    }
  }
}

/**
 * Utility functions for team operations
 */
export const TeamUtils = {
  /**
   * Generate unique team ID
   */
  generateTeamId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate unique spirit instance ID
   */
  generateSpiritInstanceId(): string {
    return `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create default spirit instance
   */
  createDefaultSpiritInstance(): ISpiritInstance {
    return {
      instanceId: this.generateSpiritInstanceId(),
      name: 'Default Spirit',
      level: 1,
      type: 'normal',
      speciesId: 'default',
      stats: {
        hp: 50,
        attack: 50,
        defense: 50,
        speed: 50
      },
      statusEffects: [],
      abilities: ['default'],
      experience: 0,
      loyalty: 50,

      validate: () => [],
      isAlive: () => true,
      canAct: () => true,
      getEffectiveStats: () => ({ hp: 50, attack: 50, defense: 50, speed: 50 }),
      getTypeEffectiveness: () => 1.0,
      clone: () => ({ ...this }),
      toJSON: () => ({})
    } as ISpiritInstance;
  },

  /**
   * Create team with balanced composition
   */
  createBalancedTeam(teamName: string): ITeam {
    return Team.create(teamName, 'Balanced team composition', 6, TeamRules.balanced());
  },

  /**
   * Create competitive team
   */
  createCompetitiveTeam(teamName: string): ITeam {
    return Team.create(teamName, 'Competitive team composition', 6, TeamRules.competitive());
  },

  /**
   * Create casual team
   */
  createCasualTeam(teamName: string): ITeam {
    return Team.create(teamName, 'Casual team composition', 8, TeamRules.casual());
  },

  /**
   * Calculate team power rating
   */
  calculateTeamPowerRating(team: ITeam, syncMap?: Map<string, number>): number {
    const spirits = team.spirits;
    if (spirits.length === 0) return 0;

    let totalPower = 0;
    spirits.forEach(spirit => {
      const stats = spirit.getEffectiveStats();
      const statPower = stats.attack + stats.defense + stats.speed +
                       (stats.specialAttack || 0) + (stats.specialDefense || 0);
      const levelBonus = spirit.level * 10;
      const syncBonus = (syncMap?.get(spirit.instanceId) || 0) * 2;
      totalPower += statPower + levelBonus + syncBonus;
    });

    return totalPower / spirits.length;
  },

  /**
   * Get recommended team for spirits
   */
  getRecommendedTeamForSpirits(spirits: ISpiritInstance[]): ITeam {
    const team = Team.create('recommended', 'Recommended team', 6, TeamRules.balanced());

    // Sort spirits by power rating (descending)
    const sortedSpirits = spirits.sort((a, b) => {
      const aStats = a.getEffectiveStats();
      const bStats = b.getEffectiveStats();
      const aPower = aStats.attack + aStats.defense + aStats.speed + (aStats.specialAttack || 0) + (aStats.specialDefense || 0);
      const bPower = bStats.attack + bStats.defense + bStats.speed + (bStats.specialAttack || 0) + (bStats.specialDefense || 0);
      return bPower - aPower;
    });

    // Add top spirits to team
    sortedSpirits.slice(0, 6).forEach(spirit => {
      team.addSpirit(spirit);
    });

    return team;
  },

  /**
   * Validate team composition
   */
  validateTeamComposition(team: ITeam): IValidationResult {
    return team.validate();
  },

  /**
   * Get team synergy analysis
   */
  getTeamSynergyAnalysis(team: ITeam, syncMap?: Map<string, number>): Record<string, any> {
    const spirits = team.spirits;
    if (spirits.length === 0) {
      return { overallSynergy: 0, analysis: 'No spirits in team' };
    }

    const typeSynergy = team.calculateSynergy(syncMap);
    const diversityScore = team.getDiversityScore();
    const averageLevel = team.getAverageLevel();
    const averageSync = team.getAverageSync(syncMap);

    return {
      overallSynergy: typeSynergy,
      diversityScore,
      averageLevel,
      averageSync,
      typeBreakdown: this.getTypeBreakdown(spirits),
      roleBreakdown: this.getRoleBreakdown(spirits),
      recommendations: this.getTeamRecommendations(team, syncMap)
    };
  },

  /**
   * Get type breakdown
   */
  private getTypeBreakdown(spirits: ISpiritInstance[]): Record<string, number> {
    const typeCount: Record<string, number> = {};

    spirits.forEach(spirit => {
      typeCount[spirit.type] = (typeCount[spirit.type] || 0) + 1;
    });

    return typeCount;
  },

  /**
   * Get role breakdown
   */
  private getRoleBreakdown(spirits: ISpiritInstance[]): Record<string, number> {
    const roleCount: Record<string, number> = {};

    spirits.forEach(spirit => {
      const role = this.getSpiritRole(spirit);
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    return roleCount;
  },

  /**
   * Get team recommendations
   */
  private getTeamRecommendations(team: ITeam, syncMap?: Map<string, number>): string[] {
    const recommendations: string[] = [];
    const spirits = team.spirits;

    if (spirits.length === 0) {
      recommendations.push('Add spirits to your team');
      return recommendations;
    }

    const averageSync = team.getAverageSync(syncMap);
    if (averageSync < 30) {
      recommendations.push('Improve sync levels with your spirits');
    }

    const diversityScore = team.getDiversityScore();
    if (diversityScore < 0.5) {
      recommendations.push('Add more type diversity to your team');
    }

    const averageLevel = team.getAverageLevel();
    if (averageLevel < 25) {
      recommendations.push('Train your spirits to higher levels');
    }

    return recommendations;
  },

  /**
   * Get spirit role
   */
  private getSpiritRole(spirit: ISpiritInstance): string {
    const stats = spirit.stats;
    const totalStats = stats.attack + stats.defense + stats.speed + (stats.specialAttack || 0) + (stats.specialDefense || 0);

    if (stats.attack > totalStats * 0.3) return 'attacker';
    if (stats.defense > totalStats * 0.3) return 'defender';
    if ((stats.specialAttack || 0) > totalStats * 0.3) return 'special_attacker';
    if ((stats.specialDefense || 0) > totalStats * 0.3) return 'special_defender';
    if (stats.speed > totalStats * 0.3) return 'speedster';

    return 'balanced';
  }
};

// Export default instances
export const defaultTeamManager = new TeamManager();
export const defaultTeamRules = TeamRules.balanced();
export const defaultTeam = Team.create('default', 'Default Team');
export const defaultTeamSlot = TeamSlot.front();
export const defaultValidationResult = ValidationResult.ok();
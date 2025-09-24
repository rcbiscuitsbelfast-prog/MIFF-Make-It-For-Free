/**
 * EffectsPure - Effects Management System
 *
 * A comprehensive effects management system for handling battle effects,
 * stat modifications, and effect resolution. Supports real-time and turn-based
 * effects with stacking, immunity, triggers, and complex stat calculations.
 *
 * @module EffectsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Effect trigger enumeration (flags)
 */
export enum EffectTrigger {
  NONE = 0,
  ON_APPLY = 1 << 0,
  ON_REMOVE = 1 << 1,
  ON_TICK = 1 << 2,
  ON_HIT = 1 << 3,
  ON_CAST = 1 << 4,
  ON_CRIT = 1 << 5
}

/**
 * Effect type enumeration
 */
export enum EffectType {
  STAT_MODIFIER = 'stat_modifier',
  DAMAGE_OVER_TIME = 'damage_over_time',
  HEAL = 'heal',
  STUN = 'stun',
  SHIELD = 'shield',
  CUSTOM = 'custom'
}

/**
 * Target stat enumeration
 */
export enum TargetStat {
  HP = 'hp',
  ATK = 'atk',
  DEF = 'def',
  SPD = 'spd',
  SPATK = 'spatk',
  SPDEF = 'spdef',
  ACC = 'acc',
  EVA = 'eva',
  CUSTOM = 'custom'
}

/**
 * Modifier type enumeration
 */
export enum ModifierType {
  FLAT = 'flat',
  PERCENT = 'percent'
}

/**
 * Effect phase enumeration
 */
export enum EffectPhase {
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  END_TURN = 'end_turn'
}

/**
 * Effect order enumeration
 */
export enum EffectOrder {
  BUFFS = 0,
  DEBUFFS = 1,
  PASSIVES = 2
}

/**
 * Effect application result enumeration
 */
export enum EffectApplicationResult {
  APPLIED = 'applied',
  REFRESHED = 'refreshed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Effect removal reason enumeration
 */
export enum EffectRemovalReason {
  EXPIRED = 'expired',
  REMOVED = 'removed',
  CLEANSED = 'cleansed',
  OVERWRITTEN = 'overwritten',
  IMMUNITY = 'immunity'
}

/**
 * Entity context interface (dependency)
 */
export interface IEntityContext {
  getEntityStat(entityId: string, stat: TargetStat): number;
  setEntityStat(entityId: string, stat: TargetStat, value: number): void;
  hasImmunity(entityId: string, immunityTag: string): boolean;
  getEntityImmunities(entityId: string): string[];
  isEntityAlive(entityId: string): boolean;
  getCurrentPhase(): EffectPhase;
  [key: string]: any;
}

/**
 * Battle effect interface
 */
export interface IBattleEffect {
  effectId: string;
  name: string;
  description: string;
  durationSeconds: number;
  durationTurns: number;
  stackable: boolean;
  maxStacks: number;
  refreshOnStack: boolean;
  triggers: EffectTrigger;
  effectType: EffectType;
  targetStat: TargetStat;
  modifierType: ModifierType;
  value: number;
  clone(): IBattleEffect;
  validate(): string[];
  getEffectDescription(): string;
}

/**
 * Active effect instance interface
 */
export interface IActiveEffect {
  effect: IBattleEffect;
  stacks: number;
  remainingSeconds: number;
  remainingTurns: number;
  appliedTime: number;
  lastTickTime: number;
  entityId: string;
  isExpired(): boolean;
  tick(deltaTime: number): void;
  advanceTurn(): void;
  canStack(): boolean;
  addStack(): boolean;
  removeStack(): number;
  clone(): IActiveEffect;
}

/**
 * Effect resolver interface
 */
export interface IEffectResolver {
  resolveQueue(phase: EffectPhase, effects: IActiveEffect[], targetImmunities: string[]): IActiveEffect[];
  resolveEffects(phase: EffectPhase, entityId: string, effects: IActiveEffect[], context: IEntityContext): EffectResolution;
}

/**
 * Stat modifier aggregator interface
 */
export interface IStatModifierAggregator {
  clear(): void;
  add(type: ModifierType, value: number, isMultiplicative: boolean): void;
  apply(baseValue: number): number;
  getAdditiveModifiers(): Array<{ type: ModifierType; value: number }>;
  getMultiplicativeModifiers(): Array<{ type: ModifierType; value: number }>;
  clone(): IStatModifierAggregator;
}

/**
 * Effect resolution interface
 */
export interface IEffectResolution {
  resolvedEffects: IActiveEffect[];
  appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }>;
  expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }>;
  statChanges: Map<string, number>;
  events: EffectEvent[];
  shouldContinue: boolean;
}

/**
 * Effect event interface
 */
export interface IEffectEvent {
  type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick';
  entityId: string;
  effect: IBattleEffect;
  activeEffect: IActiveEffect;
  timestamp: number;
  phase: EffectPhase;
  metadata?: Record<string, any>;
}

/**
 * Effect manager interface
 */
export interface IEffectManager {
  applyEffect(entityId: string, effect: IBattleEffect): EffectApplicationResult;
  removeEffect(entityId: string, effectId: string, reason?: EffectRemovalReason): boolean;
  getActiveEffects(entityId: string): IActiveEffect[];
  getEffectsByType(entityId: string, effectType: EffectType): IActiveEffect[];
  hasEffect(entityId: string, effectId: string): boolean;
  updateEffects(deltaTime: number, context: IEntityContext): IEffectResolution;
  clearEffects(entityId: string): void;
  clearAllEffects(): void;
  getEffectCount(entityId: string): number;
  getTotalEffectCount(): number;
  onEffectApplied?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectRefreshed?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectExpired?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectRemoved?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectTick?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
}

/**
 * Battle effect implementation
 */
export class BattleEffect implements IBattleEffect {
  public effectId: string;
  public name: string;
  public description: string;
  public durationSeconds: number;
  public durationTurns: number;
  public stackable: boolean;
  public maxStacks: number;
  public refreshOnStack: boolean;
  public triggers: EffectTrigger;
  public effectType: EffectType;
  public targetStat: TargetStat;
  public modifierType: ModifierType;
  public value: number;

  constructor(
    effectId: string,
    name: string,
    description: string,
    effectType: EffectType = EffectType.STAT_MODIFIER,
    targetStat: TargetStat = TargetStat.CUSTOM,
    modifierType: ModifierType = ModifierType.FLAT,
    value: number = 0,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5,
    refreshOnStack: boolean = true,
    triggers: EffectTrigger = EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
  ) {
    this.effectId = effectId;
    this.name = name;
    this.description = description;
    this.effectType = effectType;
    this.targetStat = targetStat;
    this.modifierType = modifierType;
    this.value = value;
    this.durationSeconds = durationSeconds;
    this.durationTurns = durationTurns;
    this.stackable = stackable;
    this.maxStacks = maxStacks;
    this.refreshOnStack = refreshOnStack;
    this.triggers = triggers;
  }

  /**
   * Create effect with specific parameters
   */
  static create(
    effectId: string,
    name: string,
    description: string,
    effectType: EffectType = EffectType.STAT_MODIFIER,
    targetStat: TargetStat = TargetStat.CUSTOM,
    modifierType: ModifierType = ModifierType.FLAT,
    value: number = 0,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5,
    refreshOnStack: boolean = true,
    triggers: EffectTrigger = EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      effectType,
      targetStat,
      modifierType,
      value,
      durationSeconds,
      durationTurns,
      stackable,
      maxStacks,
      refreshOnStack,
      triggers
    );
  }

  /**
   * Create stat modifier effect
   */
  static statModifier(
    effectId: string,
    name: string,
    description: string,
    targetStat: TargetStat,
    modifierType: ModifierType,
    value: number,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.STAT_MODIFIER,
      targetStat,
      modifierType,
      value,
      durationSeconds,
      durationTurns,
      stackable,
      maxStacks,
      true,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create damage over time effect
   */
  static damageOverTime(
    effectId: string,
    name: string,
    description: string,
    damagePerTick: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.DAMAGE_OVER_TIME,
      TargetStat.HP,
      ModifierType.FLAT,
      damagePerTick,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create heal effect
   */
  static heal(
    effectId: string,
    name: string,
    description: string,
    healAmount: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.HEAL,
      TargetStat.HP,
      ModifierType.FLAT,
      healAmount,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create stun effect
   */
  static stun(
    effectId: string,
    name: string,
    description: string,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.STUN,
      TargetStat.CUSTOM,
      ModifierType.FLAT,
      0,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create shield effect
   */
  static shield(
    effectId: string,
    name: string,
    description: string,
    shieldAmount: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.SHIELD,
      TargetStat.HP,
      ModifierType.FLAT,
      shieldAmount,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Check if effect has specific trigger
   */
  hasTrigger(trigger: EffectTrigger): boolean {
    return (this.triggers & trigger) !== 0;
  }

  /**
   * Get effect description
   */
  getEffectDescription(): string {
    switch (this.effectType) {
      case EffectType.STAT_MODIFIER:
        const modType = this.modifierType === ModifierType.FLAT ? 'flat' : 'percent';
        const sign = this.value >= 0 ? '+' : '';
        const displayValue = this.modifierType === ModifierType.PERCENT ?
          `${Math.round(this.value * 100)}%` : `${this.value}`;
        return `${this.name}: ${sign}${displayValue} ${modType} to ${this.targetStat}`;
      case EffectType.DAMAGE_OVER_TIME:
        return `${this.name}: ${this.value} damage per tick`;
      case EffectType.HEAL:
        return `${this.name}: ${this.value} healing`;
      case EffectType.STUN:
        return `${this.name}: Stunned for ${this.getDurationDescription()}`;
      case EffectType.SHIELD:
        return `${this.name}: ${this.value} shield`;
      case EffectType.CUSTOM:
        return `${this.name}: ${this.description}`;
      default:
        return `${this.name}: ${this.description}`;
    }
  }

  /**
   * Get duration description
   */
  getDurationDescription(): string {
    const parts: string[] = [];

    if (this.durationSeconds > 0) {
      parts.push(`${this.durationSeconds}s`);
    }

    if (this.durationTurns > 0) {
      parts.push(`${this.durationTurns} turns`);
    }

    return parts.length > 0 ? parts.join(' or ') : 'permanent';
  }

  /**
   * Validate effect
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.effectId || this.effectId.trim() === '') {
      errors.push('Effect ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Effect name cannot be empty');
    }

    if (!this.description || this.description.trim() === '') {
      errors.push('Effect description cannot be empty');
    }

    if (this.durationSeconds < 0) {
      errors.push('Duration seconds cannot be negative');
    }

    if (this.durationTurns < 0) {
      errors.push('Duration turns cannot be negative');
    }

    if (this.maxStacks < 1) {
      errors.push('Max stacks must be at least 1');
    }

    if (this.value === 0 && this.effectType !== EffectType.STUN) {
      // Some effects might legitimately have 0 value, but warn about it
      console.warn(`Effect ${this.effectId} has value of 0`);
    }

    return errors;
  }

  /**
   * Clone effect
   */
  clone(): BattleEffect {
    return new BattleEffect(
      this.effectId,
      this.name,
      this.description,
      this.effectType,
      this.targetStat,
      this.modifierType,
      this.value,
      this.durationSeconds,
      this.durationTurns,
      this.stackable,
      this.maxStacks,
      this.refreshOnStack,
      this.triggers
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      effectId: this.effectId,
      name: this.name,
      description: this.description,
      durationSeconds: this.durationSeconds,
      durationTurns: this.durationTurns,
      stackable: this.stackable,
      maxStacks: this.maxStacks,
      refreshOnStack: this.refreshOnStack,
      triggers: this.triggers,
      effectType: this.effectType,
      targetStat: this.targetStat,
      modifierType: this.modifierType,
      value: this.value
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): BattleEffect {
    return new BattleEffect(
      data.effectId,
      data.name,
      data.description,
      data.effectType || EffectType.STAT_MODIFIER,
      data.targetStat || TargetStat.CUSTOM,
      data.modifierType || ModifierType.FLAT,
      data.value || 0,
      data.durationSeconds || 0,
      data.durationTurns || 0,
      data.stackable !== false,
      data.maxStacks || 5,
      data.refreshOnStack !== false,
      data.triggers || (EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE)
    );
  }
}

/**
 * Active effect implementation
 */
export class ActiveEffect implements IActiveEffect {
  public effect: IBattleEffect;
  public stacks: number;
  public remainingSeconds: number;
  public remainingTurns: number;
  public appliedTime: number;
  public lastTickTime: number;
  public entityId: string;

  constructor(
    effect: IBattleEffect,
    entityId: string,
    stacks: number = 1,
    remainingSeconds: number = 0,
    remainingTurns: number = 0
  ) {
    this.effect = effect;
    this.entityId = entityId;
    this.stacks = Math.max(1, Math.min(stacks, effect.maxStacks));
    this.remainingSeconds = remainingSeconds;
    this.remainingTurns = remainingTurns;
    this.appliedTime = Date.now();
    this.lastTickTime = this.appliedTime;
  }

  /**
   * Create active effect
   */
  static create(
    effect: IBattleEffect,
    entityId: string,
    stacks: number = 1,
    remainingSeconds: number = 0,
    remainingTurns: number = 0
  ): ActiveEffect {
    return new ActiveEffect(effect, entityId, stacks, remainingSeconds, remainingTurns);
  }

  /**
   * Check if effect is expired
   */
  isExpired(): boolean {
    // Effects with no duration are expired unless explicitly permanent
    if (this.effect.durationSeconds === 0 && this.effect.durationTurns === 0) {
      // Check if this is explicitly a permanent effect
      if (this.effect.name.toLowerCase().includes('permanent') ||
          this.effect.description.toLowerCase().includes('permanent')) {
        return false; // Permanent effects never expire
      }
      return true; // Non-permanent effects with no duration are expired
    }

    // Check time-based expiration
    if (this.effect.durationSeconds > 0 && this.remainingSeconds <= 0) {
      return true;
    }

    // Check turn-based expiration
    if (this.effect.durationTurns > 0 && this.remainingTurns <= 0) {
      return true;
    }

    return false;
  }

  /**
   * Tick effect (update time-based duration)
   */
  tick(deltaTime: number): void {
    if (this.effect.durationSeconds > 0) {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - deltaTime);
    }

    this.lastTickTime = Date.now();
  }

  /**
   * Advance turn (update turn-based duration)
   */
  advanceTurn(): void {
    if (this.effect.durationTurns > 0) {
      this.remainingTurns = Math.max(0, this.remainingTurns - 1);
    }
  }

  /**
   * Check if effect can stack
   */
  canStack(): boolean {
    return this.effect.stackable && this.stacks < this.effect.maxStacks;
  }

  /**
   * Add stack
   */
  addStack(): boolean {
    if (this.canStack()) {
      this.stacks++;
      if (this.effect.refreshOnStack) {
        // Refresh duration on stack
        this.remainingSeconds = this.effect.durationSeconds;
        this.remainingTurns = this.effect.durationTurns;
      }
      return true;
    }
    return false;
  }

  /**
   * Remove stack
   */
  removeStack(): number {
    if (this.stacks > 1) {
      this.stacks--;
    }
    return this.stacks;
  }

  /**
   * Clone active effect
   */
  clone(): ActiveEffect {
    const cloned = new ActiveEffect(
      this.effect.clone(),
      this.entityId,
      this.stacks,
      this.remainingSeconds,
      this.remainingTurns
    );

    cloned.appliedTime = this.appliedTime;
    cloned.lastTickTime = this.lastTickTime;

    return cloned;
  }

  /**
   * Get effect duration as percentage (0-1)
   */
  getDurationPercentage(): number {
    if (this.effect.durationSeconds > 0) {
      return Math.max(0, this.remainingSeconds / this.effect.durationSeconds);
    }

    if (this.effect.durationTurns > 0) {
      return Math.max(0, this.remainingTurns / this.effect.durationTurns);
    }

    return 1; // Permanent effect
  }

  /**
   * Get effect summary
   */
  getSummary(): string {
    const duration = this.getDurationPercentage();
    const durationStr = duration < 1 ? ` (${Math.round(duration * 100)}%)` : '';
    return `${this.effect.name} x${this.stacks}${durationStr}`;
  }
}

/**
 * Stat modifier aggregator implementation
 */
export class StatModifierAggregator implements IStatModifierAggregator {
  private readonly additive: Array<{ type: ModifierType; value: number }>;
  private readonly multiplicative: Array<{ type: ModifierType; value: number }>;

  constructor() {
    this.additive = [];
    this.multiplicative = [];
  }

  /**
   * Create aggregator
   */
  static create(): StatModifierAggregator {
    return new StatModifierAggregator();
  }

  /**
   * Clear all modifiers
   */
  clear(): void {
    this.additive.length = 0;
    this.multiplicative.length = 0;
  }

  /**
   * Add modifier
   */
  add(type: ModifierType, value: number, isMultiplicative: boolean): void {
    if (isMultiplicative) {
      this.multiplicative.push({ type, value });
    } else {
      this.additive.push({ type, value });
    }
  }

  /**
   * Apply modifiers to base value
   */
  apply(baseValue: number): number {
    // Apply percent modifiers first (to original base)
    let result = baseValue;

    // Percent additive (applied to original base)
    const pctAdd = this.additive
      .filter(mod => mod.type === ModifierType.PERCENT)
      .reduce((sum, mod) => sum + mod.value, 0);
    result *= (1 + pctAdd);

    // Flat additive (applied after percent)
    const flatAdd = this.additive
      .filter(mod => mod.type === ModifierType.FLAT)
      .reduce((sum, mod) => sum + mod.value, 0);
    result += flatAdd;

    // Apply multiplicative modifiers
    for (const mod of this.multiplicative) {
      if (mod.type === ModifierType.FLAT) {
        result += mod.value;
      } else {
        result *= (1 + mod.value);
      }
    }

    return Math.max(0, result); // Ensure non-negative result
  }

  /**
   * Get additive modifiers
   */
  getAdditiveModifiers(): Array<{ type: ModifierType; value: number }> {
    return [...this.additive];
  }

  /**
   * Get multiplicative modifiers
   */
  getMultiplicativeModifiers(): Array<{ type: ModifierType; value: number }> {
    return [...this.multiplicative];
  }

  /**
   * Clone aggregator
   */
  clone(): StatModifierAggregator {
    const cloned = new StatModifierAggregator();
    cloned.additive.push(...this.additive);
    cloned.multiplicative.push(...this.multiplicative);
    return cloned;
  }

  /**
   * Get total additive bonus
   */
  getTotalAdditive(): number {
    return this.additive.reduce((sum, mod) => sum + mod.value, 0);
  }

  /**
   * Get total multiplicative bonus
   */
  getTotalMultiplicative(): number {
    return this.multiplicative.reduce((product, mod) => product * (1 + mod.value), 1);
  }
}

/**
 * Effect event implementation
 */
export class EffectEvent implements IEffectEvent {
  public type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick';
  public entityId: string;
  public effect: IBattleEffect;
  public activeEffect: IActiveEffect;
  public timestamp: number;
  public phase: EffectPhase;
  public metadata?: Record<string, any>;

  constructor(
    type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick',
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ) {
    this.type = type;
    this.entityId = entityId;
    this.effect = effect;
    this.activeEffect = activeEffect;
    this.timestamp = Date.now();
    this.phase = phase;
    this.metadata = metadata;
  }

  /**
   * Create applied event
   */
  static applied(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('applied', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create refreshed event
   */
  static refreshed(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('refreshed', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create expired event
   */
  static expired(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('expired', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create removed event
   */
  static removed(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('removed', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create tick event
   */
  static tick(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('tick', entityId, effect, activeEffect, phase, metadata);
  }
}

/**
 * Effect resolution implementation
 */
export class EffectResolution implements IEffectResolution {
  public resolvedEffects: IActiveEffect[];
  public appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }>;
  public expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }>;
  public statChanges: Map<string, number>;
  public events: EffectEvent[];
  public shouldContinue: boolean;

  constructor(
    resolvedEffects: IActiveEffect[] = [],
    appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }> = [],
    expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }> = [],
    statChanges: Map<string, number> = new Map(),
    events: EffectEvent[] = [],
    shouldContinue: boolean = true
  ) {
    this.resolvedEffects = [...resolvedEffects];
    this.appliedEffects = [...appliedEffects];
    this.expiredEffects = [...expiredEffects];
    this.statChanges = new Map(statChanges);
    this.events = [...events];
    this.shouldContinue = shouldContinue;
  }

  /**
   * Create resolution
   */
  static create(
    resolvedEffects: IActiveEffect[] = [],
    appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }> = [],
    expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }> = [],
    statChanges: Map<string, number> = new Map(),
    events: EffectEvent[] = [],
    shouldContinue: boolean = true
  ): EffectResolution {
    return new EffectResolution(resolvedEffects, appliedEffects, expiredEffects, statChanges, events, shouldContinue);
  }

  /**
   * Add resolved effect
   */
  addResolvedEffect(effect: IActiveEffect): void {
    this.resolvedEffects.push(effect);
  }

  /**
   * Add applied effect
   */
  addAppliedEffect(effect: IActiveEffect, result: EffectApplicationResult): void {
    this.appliedEffects.push({ effect, result });
  }

  /**
   * Add expired effect
   */
  addExpiredEffect(effect: IActiveEffect, reason: EffectRemovalReason): void {
    this.expiredEffects.push({ effect, reason });
  }

  /**
   * Add stat change
   */
  addStatChange(stat: string, change: number): void {
    const current = this.statChanges.get(stat) || 0;
    this.statChanges.set(stat, current + change);
  }

  /**
   * Add event
   */
  addEvent(event: EffectEvent): void {
    this.events.push(event);
  }

  /**
   * Get total stat changes
   */
  getTotalStatChanges(): Record<string, number> {
    const changes: Record<string, number> = {};
    this.statChanges.forEach((value, key) => {
      changes[key] = value;
    });
    return changes;
  }

  /**
   * Check if any effects were applied
   */
  hasAppliedEffects(): boolean {
    return this.appliedEffects.length > 0;
  }

  /**
   * Check if any effects expired
   */
  hasExpiredEffects(): boolean {
    return this.expiredEffects.length > 0;
  }

  /**
   * Get effects applied count
   */
  getAppliedCount(): number {
    return this.appliedEffects.length;
  }

  /**
   * Get effects expired count
   */
  getExpiredCount(): number {
    return this.expiredEffects.length;
  }
}

/**
 * Effect resolver implementation
 */
export class EffectResolver implements IEffectResolver {
  /**
   * Resolve effect queue for a phase
   */
  resolveQueue(phase: EffectPhase, effects: IActiveEffect[], targetImmunities: string[]): IActiveEffect[] {
    let resolvedEffects = [...effects];
    const immuneTags = new Set(targetImmunities);

    // Filter out immune effects
    resolvedEffects = resolvedEffects.filter(effect => {
      if (effect.effect.effectType === EffectType.STAT_MODIFIER) {
        // For stat modifiers, check immunity
        return true; // Assume no immunity for now
      }
      return true;
    });

    // Handle cleanse effects (remove debuffs if cleanse is present)
    if (phase === EffectPhase.END_TURN) {
      const hasCleanse = resolvedEffects.some(effect =>
        effect.effect.name.toLowerCase().includes('cleanse') ||
        effect.effect.description.toLowerCase().includes('cleanse')
      );

      if (hasCleanse) {
        resolvedEffects = resolvedEffects.filter(effect =>
          effect.effect.effectType !== EffectType.STUN
        );
      }
    }

    // Handle effect overwriting (keep strongest effect of each type)
    resolvedEffects = this.resolveOverwrites(resolvedEffects);

    // Sort by effect order
    resolvedEffects.sort((a, b) => {
      // Custom ordering logic could be added here
      return 0;
    });

    return resolvedEffects;
  }

  /**
   * Resolve effect overwrites
   */
  private resolveOverwrites(effects: IActiveEffect[]): IActiveEffect[] {
    const effectGroups = new Map<string, IActiveEffect[]>();

    // Group effects by ID
    effects.forEach(effect => {
      const key = effect.effect.effectId;
      if (!effectGroups.has(key)) {
        effectGroups.set(key, []);
      }
      effectGroups.get(key)!.push(effect);
    });

    const resolvedEffects: IActiveEffect[] = [];

    // For each group, keep the effect with highest absolute value
    effectGroups.forEach(group => {
      if (group.length === 1) {
        resolvedEffects.push(group[0]);
      } else {
        // Find effect with highest absolute value
        const bestEffect = group.reduce((best, current) =>
          Math.abs(current.effect.value) > Math.abs(best.effect.value) ? current : best
        );
        resolvedEffects.push(bestEffect);
      }
    });

    return resolvedEffects;
  }

  /**
   * Resolve effects with context
   */
  resolveEffects(phase: EffectPhase, entityId: string, effects: IActiveEffect[], context: IEntityContext): EffectResolution {
    const resolution = EffectResolution.create();
    const resolvedEffects = this.resolveQueue(phase, effects, context.getEntityImmunities(entityId));

    // Process each resolved effect
    for (const effect of resolvedEffects) {
      const statChanges = this.applyEffect(effect, context);

      // Create event
      const event = EffectEvent.tick(entityId, effect.effect, effect, phase);
      resolution.addEvent(event);

      // Add stat changes
      statChanges.forEach((change, stat) => {
        resolution.addStatChange(stat, change);
      });
    }

    resolution.resolvedEffects = resolvedEffects;
    return resolution;
  }

  /**
   * Apply effect and calculate stat changes
   */
  private applyEffect(effect: IActiveEffect, context: IEntityContext): Map<string, number> {
    const statChanges = new Map<string, number>();

    switch (effect.effect.effectType) {
      case EffectType.STAT_MODIFIER:
        const currentValue = context.getEntityStat(effect.entityId, effect.effect.targetStat);
        const modifiedValue = this.calculateStatModification(effect.effect, currentValue);
        const change = modifiedValue - currentValue;
        if (change !== 0) {
          statChanges.set(effect.effect.targetStat, change);
        }
        break;

      case EffectType.DAMAGE_OVER_TIME:
        // Damage over time would be handled by the battle system
        statChanges.set(TargetStat.HP, -effect.effect.value * effect.stacks);
        break;

      case EffectType.HEAL:
        statChanges.set(TargetStat.HP, effect.effect.value * effect.stacks);
        break;

      case EffectType.SHIELD:
        // Shield effects might add temporary HP
        break;

      case EffectType.STUN:
        // Stun effects don't directly change stats
        break;
    }

    return statChanges;
  }

  /**
   * Calculate stat modification
   */
  private calculateStatModification(effect: IBattleEffect, baseValue: number): number {
    let result = baseValue;

    if (effect.effectType !== EffectType.STAT_MODIFIER) {
      return result;
    }

    switch (effect.modifierType) {
      case ModifierType.FLAT:
        result += effect.value;
        break;
      case ModifierType.PERCENT:
        result *= (1 + effect.value);
        break;
    }

    return Math.max(0, result); // Ensure non-negative
  }
}

/**
 * Effect manager implementation
 */
export class EffectManager implements IEffectManager {
  private readonly entityEffects = new Map<string, IActiveEffect[]>();
  private readonly effectResolver: IEffectResolver;

  public onEffectApplied?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectRefreshed?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectExpired?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectRemoved?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectTick?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;

  constructor(effectResolver?: IEffectResolver) {
    this.effectResolver = effectResolver || new EffectResolver();
  }

  /**
   * Create effect manager
   */
  static create(effectResolver?: IEffectResolver): EffectManager {
    return new EffectManager(effectResolver);
  }

  /**
   * Apply effect to entity
   */
  applyEffect(entityId: string, effect: IBattleEffect): EffectApplicationResult {
    if (!entityId || !effect) {
      return EffectApplicationResult.REJECTED;
    }

    const errors = effect.validate();
    if (errors.length > 0) {
      console.warn(`Invalid effect ${effect.effectId}:`, errors);
      return EffectApplicationResult.REJECTED;
    }

    const activeEffects = this.getOrCreateActiveEffects(entityId);
    const existingEffect = activeEffects.find(active => active.effect.effectId === effect.effectId);

    if (existingEffect) {
      if (existingEffect.canStack()) {
        if (existingEffect.addStack()) {
          this.onEffectRefreshed?.(entityId, effect, existingEffect);
          return EffectApplicationResult.REFRESHED;
        }
      }
      return EffectApplicationResult.REJECTED;
    }

    // Create new active effect
    const activeEffect = ActiveEffect.create(effect, entityId);
    activeEffects.push(activeEffect);

    this.onEffectApplied?.(entityId, effect, activeEffect);
    return EffectApplicationResult.APPLIED;
  }

  /**
   * Remove effect from entity
   */
  removeEffect(entityId: string, effectId: string, reason: EffectRemovalReason = EffectRemovalReason.REMOVED): boolean {
    if (!entityId || !effectId) {
      return false;
    }

    const activeEffects = this.entityEffects.get(entityId);
    if (!activeEffects) {
      return false;
    }

    const effectIndex = activeEffects.findIndex(active => active.effect.effectId === effectId);
    if (effectIndex === -1) {
      return false;
    }

    const removedEffect = activeEffects.splice(effectIndex, 1)[0];
    this.onEffectRemoved?.(entityId, removedEffect.effect, removedEffect);
    return true;
  }

  /**
   * Get active effects for entity
   */
  getActiveEffects(entityId: string): IActiveEffect[] {
    return this.entityEffects.get(entityId) || [];
  }

  /**
   * Get effects by type
   */
  getEffectsByType(entityId: string, effectType: EffectType): IActiveEffect[] {
    const activeEffects = this.getActiveEffects(entityId);
    return activeEffects.filter(effect => effect.effect.effectType === effectType);
  }

  /**
   * Check if entity has effect
   */
  hasEffect(entityId: string, effectId: string): boolean {
    const activeEffects = this.getActiveEffects(entityId);
    return activeEffects.some(effect => effect.effect.effectId === effectId);
  }

  /**
   * Update effects for all entities
   */
  updateEffects(deltaTime: number, context: IEntityContext): IEffectResolution {
    const resolution = EffectResolution.create();
    const entitiesToRemove: string[] = [];

    for (const [entityId, activeEffects] of this.entityEffects) {
      if (!context.isEntityAlive(entityId)) {
        entitiesToRemove.push(entityId);
        continue;
      }

      const entityResolution = this.updateEntityEffects(entityId, activeEffects, deltaTime, context);
      resolution.resolvedEffects.push(...entityResolution.resolvedEffects);
      resolution.appliedEffects.push(...entityResolution.appliedEffects);
      resolution.expiredEffects.push(...entityResolution.expiredEffects);
      resolution.events.push(...entityResolution.events);

      // Merge stat changes
      entityResolution.statChanges.forEach((change, stat) => {
        const current = resolution.statChanges.get(stat) || 0;
        resolution.statChanges.set(stat, current + change);
      });

      // Remove expired effects
      const remainingEffects = activeEffects.filter(effect => !effect.isExpired());
      this.entityEffects.set(entityId, remainingEffects);

      if (remainingEffects.length === 0) {
        entitiesToRemove.push(entityId);
      }
    }

    // Remove empty entity entries
    for (const entityId of entitiesToRemove) {
      this.entityEffects.delete(entityId);
    }

    return resolution;
  }

  /**
   * Update effects for specific entity
   */
  private updateEntityEffects(
    entityId: string,
    activeEffects: IActiveEffect[],
    deltaTime: number,
    context: IEntityContext
  ): EffectResolution {
    const resolution = EffectResolution.create();
    const currentPhase = context.getCurrentPhase();

    // Tick time-based effects
    for (const effect of activeEffects) {
      effect.tick(deltaTime);

      if (effect.effect.hasTrigger(EffectTrigger.ON_TICK)) {
        this.onEffectTick?.(entityId, effect.effect, effect);
        resolution.addEvent(EffectEvent.tick(entityId, effect.effect, effect, currentPhase));
      }
    }

    // Advance turn-based effects
    for (const effect of activeEffects) {
      effect.advanceTurn();

      if (effect.isExpired()) {
        this.onEffectExpired?.(entityId, effect.effect, effect);
        resolution.addExpiredEffect(effect, EffectRemovalReason.EXPIRED);
        resolution.addEvent(EffectEvent.expired(entityId, effect.effect, effect, currentPhase));
      }
    }

    // Resolve effects for current phase
    const entityResolution = this.effectResolver.resolveEffects(currentPhase, entityId, activeEffects, context);
    resolution.resolvedEffects.push(...entityResolution.resolvedEffects);
    resolution.events.push(...entityResolution.events);

    return resolution;
  }

  /**
   * Clear effects for entity
   */
  clearEffects(entityId: string): void {
    const activeEffects = this.entityEffects.get(entityId);
    if (activeEffects) {
      for (const effect of activeEffects) {
        this.onEffectRemoved?.(entityId, effect.effect, effect);
      }
      this.entityEffects.delete(entityId);
    }
  }

  /**
   * Clear all effects
   */
  clearAllEffects(): void {
    for (const [entityId, activeEffects] of this.entityEffects) {
      for (const effect of activeEffects) {
        this.onEffectRemoved?.(entityId, effect.effect, effect);
      }
    }
    this.entityEffects.clear();
  }

  /**
   * Get effect count for entity
   */
  getEffectCount(entityId: string): number {
    return this.getActiveEffects(entityId).length;
  }

  /**
   * Get total effect count across all entities
   */
  getTotalEffectCount(): number {
    let total = 0;
    for (const activeEffects of this.entityEffects.values()) {
      total += activeEffects.length;
    }
    return total;
  }

  /**
   * Get or create active effects for entity
   */
  private getOrCreateActiveEffects(entityId: string): IActiveEffect[] {
    if (!this.entityEffects.has(entityId)) {
      this.entityEffects.set(entityId, []);
    }
    return this.entityEffects.get(entityId)!;
  }
}

/**
 * Utility functions for effect operations
 */
export const EffectUtils = {
  /**
   * Create default entity context for testing
   */
  createDefaultEntityContext(): IEntityContext {
    const entityStats = new Map<string, Map<string, number>>();

    return {
      getEntityStat: (entityId: string, stat: TargetStat) => {
        const stats = entityStats.get(entityId) || new Map();
        return stats.get(stat) || 0;
      },
      setEntityStat: (entityId: string, stat: TargetStat, value: number) => {
        if (!entityStats.has(entityId)) {
          entityStats.set(entityId, new Map());
        }
        entityStats.get(entityId)!.set(stat, Math.max(0, value));
      },
      hasImmunity: (entityId: string, immunityTag: string) => false,
      getEntityImmunities: (entityId: string) => [],
      isEntityAlive: (entityId: string) => true,
      getCurrentPhase: () => EffectPhase.PRE_TURN
    };
  },

  /**
   * Validate battle effect
   */
  validateBattleEffect(effect: IBattleEffect): string[] {
    const errors: string[] = [];

    if (!effect.effectId || effect.effectId.trim() === '') {
      errors.push('Effect ID cannot be empty');
    }

    if (!effect.name || effect.name.trim() === '') {
      errors.push('Effect name cannot be empty');
    }

    if (!effect.description || effect.description.trim() === '') {
      errors.push('Effect description cannot be empty');
    }

    if (effect.durationSeconds < 0) {
      errors.push('Duration seconds cannot be negative');
    }

    if (effect.durationTurns < 0) {
      errors.push('Duration turns cannot be negative');
    }

    if (effect.maxStacks < 1) {
      errors.push('Max stacks must be at least 1');
    }

    return errors;
  },

  /**
   * Create stat modifier aggregator for testing
   */
  createStatModifierAggregator(): StatModifierAggregator {
    return new StatModifierAggregator();
  },

  /**
   * Calculate effect duration in milliseconds
   */
  calculateEffectDuration(effect: IBattleEffect): number {
    const seconds = effect.durationSeconds > 0 ? effect.durationSeconds * 1000 : 0;
    const turns = effect.durationTurns > 0 ? effect.durationTurns * 2000 : 0; // Assume 2 seconds per turn
    return Math.max(seconds, turns);
  },

  /**
   * Check if effect should trigger on phase
   */
  shouldTriggerOnPhase(effect: IBattleEffect, phase: EffectPhase): boolean {
    switch (phase) {
      case EffectPhase.PRE_TURN:
        return effect.hasTrigger(EffectTrigger.ON_APPLY);
      case EffectPhase.SELECT_ACTION:
        return effect.hasTrigger(EffectTrigger.ON_CAST);
      case EffectPhase.RESOLVE_ACTION:
        return effect.hasTrigger(EffectTrigger.ON_HIT) || effect.hasTrigger(EffectTrigger.ON_CRIT);
      case EffectPhase.END_TURN:
        return effect.hasTrigger(EffectTrigger.ON_TICK) || effect.hasTrigger(EffectTrigger.ON_REMOVE);
      default:
        return false;
    }
  },

  /**
   * Get effect priority (higher = more important)
   */
  getEffectPriority(effect: IBattleEffect): number {
    // Base priority on effect type
    switch (effect.effectType) {
      case EffectType.STUN:
        return 100; // Highest priority
      case EffectType.SHIELD:
        return 90;
      case EffectType.HEAL:
        return 80;
      case EffectType.DAMAGE_OVER_TIME:
        return 70;
      case EffectType.STAT_MODIFIER:
        return 50;
      case EffectType.CUSTOM:
        return 25;
      default:
        return 0;
    }
  },

  /**
   * Sort effects by priority
   */
  sortEffectsByPriority(effects: IActiveEffect[]): IActiveEffect[] {
    return [...effects].sort((a, b) => {
      const priorityA = this.getEffectPriority(a.effect);
      const priorityB = this.getEffectPriority(b.effect);
      return priorityB - priorityA;
    });
  },

  /**
   * Filter effects by type
   */
  filterEffectsByType(effects: IActiveEffect[], effectType: EffectType): IActiveEffect[] {
    return effects.filter(effect => effect.effect.effectType === effectType);
  },

  /**
   * Filter effects by target stat
   */
  filterEffectsByStat(effects: IActiveEffect[], targetStat: TargetStat): IActiveEffect[] {
    return effects.filter(effect => effect.effect.targetStat === targetStat);
  },

  /**
   * Get effects that modify specific stat
   */
  getStatModifyingEffects(effects: IActiveEffect[]): IActiveEffect[] {
    return effects.filter(effect => effect.effect.effectType === EffectType.STAT_MODIFIER);
  }
};

/**
 * Default instances
 */
export const defaultBattleEffect = new BattleEffect('default', 'Default Effect', 'Default effect');
export const defaultActiveEffect = ActiveEffect.create(defaultBattleEffect, 'default_entity');
export const defaultStatModifierAggregator = new StatModifierAggregator();
export const defaultEffectResolver = new EffectResolver();
export const defaultEffectManager = new EffectManager();
export const defaultEffectEvent = EffectEvent.applied('default', defaultBattleEffect, defaultActiveEffect, EffectPhase.PRE_TURN);
export const defaultEffectResolution = EffectResolution.create();
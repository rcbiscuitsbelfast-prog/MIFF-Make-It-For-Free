/**
 * HUDPure - Battle HUD Management System
 *
 * A comprehensive battle HUD management system for displaying spirit states,
 * turn information, and battle progress. Supports real-time updates, status
 * effects visualization, and cross-platform rendering through adapters.
 *
 * @module HUDPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Status effect information for display
 */
export interface IStatusEffectDisplay {
  name: string;
  icon?: string;
  color?: string;
  priority: number;
}

/**
 * Spirit state for HUD display
 */
export interface ISpiritHUDState {
  spiritId: string;
  name: string;
  currentHP: number;
  maxHP: number;
  statusEffects: string[];
  isKO: boolean;
  level?: number;
  element?: string;
  position?: number;
}

/**
 * Turn state for HUD display
 */
export interface ITurnHUDState {
  phaseName: string;
  activeSpiritId?: string;
  actionPreview?: string;
  turnNumber?: number;
  roundNumber?: number;
}

/**
 * Complete battle HUD model
 */
export interface IBattleHUDModel {
  player: ISpiritHUDState[];
  opponent: ISpiritHUDState[];
  turn: ITurnHUDState;
  metadata?: Record<string, any>;
}

/**
 * HUD update event types
 */
export enum HUDUpdateType {
  SPIRIT_UPDATE = 'spirit_update',
  TURN_UPDATE = 'turn_update',
  PHASE_CHANGE = 'phase_change',
  BATTLE_END = 'battle_end'
}

/**
 * HUD update event
 */
export interface IHUDUpdateEvent {
  type: HUDUpdateType;
  spiritId?: string;
  data?: any;
  timestamp: number;
}

/**
 * Spirit HUD state implementation
 */
export class SpiritHUDState implements ISpiritHUDState {
  public spiritId: string;
  public name: string;
  public currentHP: number;
  public maxHP: number;
  public statusEffects: string[];
  public level?: number;
  public element?: string;
  public position?: number;

  constructor(
    spiritId: string = '',
    name: string = '',
    currentHP: number = 0,
    maxHP: number = 0,
    statusEffects: string[] = [],
    level?: number,
    element?: string,
    position?: number
  ) {
    this.spiritId = spiritId;
    this.name = name;
    this.currentHP = Math.max(0, currentHP);
    this.maxHP = Math.max(1, maxHP);
    this.statusEffects = [...statusEffects];
    this.level = level;
    this.element = element;
    this.position = position;
  }

  /**
   * Get HP percentage (0-100)
   */
  get hpPercentage(): number {
    return this.maxHP > 0 ? (this.currentHP / this.maxHP) * 100 : 0;
  }

  /**
   * Check if spirit is at full health
   */
  get isFullHealth(): boolean {
    return this.currentHP >= this.maxHP;
  }

  /**
   * Check if spirit is at critical health (25% or less)
   */
  get isCritical(): boolean {
    return this.hpPercentage <= 25;
  }

  /**
   * Check if spirit is at low health (50% or less)
   */
  get isLowHealth(): boolean {
    return this.hpPercentage <= 50;
  }

  /**
   * Get health status string
   */
  get healthStatus(): 'full' | 'high' | 'medium' | 'low' | 'critical' | 'ko' {
    if (this.isKO) return 'ko';
    if (this.isFullHealth) return 'full';
    if (this.isCritical) return 'critical';
    if (this.isLowHealth) return 'low';
    if (this.hpPercentage > 75) return 'high';
    return 'medium';
  }

  /**
   * Get health bar string representation
   */
  getHealthBar(width: number = 20): string {
    return HUDPureUtils.renderHealthBar(this.currentHP, this.maxHP, width);
  }

  /**
   * Get formatted status effects string
   */
  getStatusString(): string {
    return this.statusEffects.length > 0
      ? this.statusEffects.join(',')
      : '-';
  }

  /**
   * Get display name with level if available
   */
  getDisplayName(): string {
    let displayName = this.name;
    if (this.level !== undefined) {
      displayName += ` (Lv.${this.level})`;
    }
    if (this.element) {
      displayName += ` [${this.element}]`;
    }
    return displayName;
  }

  /**
   * Get KO status
   */
  get isKO(): boolean {
    return this.currentHP <= 0;
  }

  /**
   * Apply damage to this spirit
   */
  takeDamage(amount: number): number {
    const actualDamage = Math.min(amount, this.currentHP);
    this.currentHP = Math.max(0, this.currentHP - amount);
    return actualDamage;
  }

  /**
   * Heal this spirit
   */
  heal(amount: number): number {
    const oldHP = this.currentHP;
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    return this.currentHP - oldHP;
  }

  /**
   * Add status effect
   */
  addStatusEffect(effect: string): void {
    if (!this.statusEffects.includes(effect)) {
      this.statusEffects.push(effect);
    }
  }

  /**
   * Remove status effect
   */
  removeStatusEffect(effect: string): boolean {
    const index = this.statusEffects.indexOf(effect);
    if (index !== -1) {
      this.statusEffects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if spirit has specific status effect
   */
  hasStatusEffect(effect: string): boolean {
    return this.statusEffects.includes(effect);
  }

  /**
   * Create a copy of this spirit state
   */
  clone(): SpiritHUDState {
    return new SpiritHUDState(
      this.spiritId,
      this.name,
      this.currentHP,
      this.maxHP,
      [...this.statusEffects],
      this.level,
      this.element,
      this.position
    );
  }

  /**
   * Create snapshot for comparison
   */
  snapshot(): ISpiritHUDState {
    return {
      spiritId: this.spiritId,
      name: this.name,
      currentHP: this.currentHP,
      maxHP: this.maxHP,
      statusEffects: [...this.statusEffects],
      isKO: this.isKO,
      level: this.level,
      element: this.element,
      position: this.position
    };
  }

  /**
   * Validate spirit data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.spiritId || this.spiritId.trim() === '') {
      errors.push('Spirit ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Name cannot be empty');
    }

    if (this.maxHP <= 0) {
      errors.push('Max HP must be greater than 0');
    }

    if (this.currentHP < 0) {
      errors.push('Current HP cannot be negative');
    }

    if (this.currentHP > this.maxHP) {
      errors.push('Current HP cannot exceed max HP');
    }

    if (this.level !== undefined && this.level < 1) {
      errors.push('Level must be at least 1');
    }

    return errors;
  }
}

/**
 * Turn HUD state implementation
 */
export class TurnHUDState implements ITurnHUDState {
  public phaseName: string;
  public activeSpiritId?: string;
  public actionPreview?: string;
  public turnNumber?: number;
  public roundNumber?: number;

  constructor(
    phaseName: string = '',
    activeSpiritId?: string,
    actionPreview?: string,
    turnNumber?: number,
    roundNumber?: number
  ) {
    this.phaseName = phaseName;
    this.activeSpiritId = activeSpiritId;
    this.actionPreview = actionPreview;
    this.turnNumber = turnNumber;
    this.roundNumber = roundNumber;
  }

  /**
   * Get turn display string
   */
  getDisplayString(): string {
    let display = `Phase: ${this.phaseName}`;

    if (this.turnNumber !== undefined) {
      display += ` | Turn: ${this.turnNumber}`;
    }

    if (this.roundNumber !== undefined) {
      display += ` | Round: ${this.roundNumber}`;
    }

    if (this.activeSpiritId) {
      display += ` | Active: ${this.activeSpiritId}`;
    }

    if (this.actionPreview) {
      display += ` | Action: ${this.actionPreview}`;
    }

    return display;
  }

  /**
   * Check if turn is in specific phase
   */
  isPhase(phaseName: string): boolean {
    return this.phaseName.toLowerCase() === phaseName.toLowerCase();
  }

  /**
   * Check if turn is in action phase
   */
  get isActionPhase(): boolean {
    return this.isPhase('selectaction') || this.isPhase('action');
  }

  /**
   * Check if turn is in resolution phase
   */
  get isResolutionPhase(): boolean {
    return this.isPhase('resolve') || this.isPhase('resolveaction');
  }

  /**
   * Create a copy of this turn state
   */
  clone(): TurnHUDState {
    return new TurnHUDState(
      this.phaseName,
      this.activeSpiritId,
      this.actionPreview,
      this.turnNumber,
      this.roundNumber
    );
  }

  /**
   * Validate turn data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.phaseName || this.phaseName.trim() === '') {
      errors.push('Phase name cannot be empty');
    }

    if (this.turnNumber !== undefined && this.turnNumber < 0) {
      errors.push('Turn number cannot be negative');
    }

    if (this.roundNumber !== undefined && this.roundNumber < 0) {
      errors.push('Round number cannot be negative');
    }

    return errors;
  }
}

/**
 * Battle HUD model implementation
 */
export class BattleHUDModel implements IBattleHUDModel {
  public player: SpiritHUDState[];
  public opponent: SpiritHUDState[];
  public turn: TurnHUDState;
  public metadata?: Record<string, any>;

  constructor(
    player: SpiritHUDState[] = [],
    opponent: SpiritHUDState[] = [],
    turn: TurnHUDState = new TurnHUDState(),
    metadata?: Record<string, any>
  ) {
    this.player = [...player];
    this.opponent = [...opponent];
    this.turn = turn;
    this.metadata = metadata ? { ...metadata } : {};
  }

  /**
   * Get all spirits (player + opponent)
   */
  get allSpirits(): ISpiritHUDState[] {
    return [...this.player, ...this.opponent];
  }

  /**
   * Get all living spirits
   */
  get livingSpirits(): ISpiritHUDState[] {
    return this.allSpirits.filter(spirit => !spirit.isKO);
  }

  /**
   * Get all KO'd spirits
   */
  get koSpirits(): ISpiritHUDState[] {
    return this.allSpirits.filter(spirit => spirit.isKO);
  }

  /**
   * Get spirit by ID
   */
  getSpirit(spiritId: string): ISpiritHUDState | null {
    return this.allSpirits.find(spirit => spirit.spiritId === spiritId) || null;
  }

  /**
   * Get spirits by side
   */
  getSpiritsBySide(side: 'player' | 'opponent'): ISpiritHUDState[] {
    return side === 'player' ? this.player : this.opponent;
  }

  /**
   * Add spirit to specific side
   */
  addSpirit(spirit: SpiritHUDState, side: 'player' | 'opponent'): boolean {
    const errors = spirit.validate();
    if (errors.length > 0) {
      console.warn('Invalid spirit data:', errors);
      return false;
    }

    if (this.getSpirit(spirit.spiritId)) {
      console.warn(`Spirit ${spirit.spiritId} already exists`);
      return false;
    }

    if (side === 'player') {
      this.player.push(spirit);
    } else {
      this.opponent.push(spirit);
    }

    return true;
  }

  /**
   * Remove spirit by ID
   */
  removeSpirit(spiritId: string): boolean {
    const playerIndex = this.player.findIndex(s => s.spiritId === spiritId);
    if (playerIndex !== -1) {
      this.player.splice(playerIndex, 1);
      return true;
    }

    const opponentIndex = this.opponent.findIndex(s => s.spiritId === spiritId);
    if (opponentIndex !== -1) {
      this.opponent.splice(opponentIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Update spirit by ID
   */
  updateSpirit(spiritId: string, updates: Partial<ISpiritHUDState>): boolean {
    const spirit = this.getSpirit(spiritId);
    if (!spirit) {
      return false;
    }

    // Validate updates if they contain critical fields
    if (updates.maxHP !== undefined && updates.maxHP <= 0) {
      console.warn('Invalid max HP update');
      return false;
    }

    if (updates.currentHP !== undefined && updates.currentHP < 0) {
      console.warn('Invalid current HP update');
      return false;
    }

    // Apply updates
    Object.assign(spirit, updates);

    // Ensure HP constraints
    if (spirit.currentHP > spirit.maxHP) {
      spirit.currentHP = spirit.maxHP;
    }

    return true;
  }

  /**
   * Update turn state
   */
  updateTurn(updates: Partial<ITurnHUDState>): void {
    Object.assign(this.turn, updates);
  }

  /**
   * Get battle status summary
   */
  getBattleSummary(): {
    playerCount: number;
    opponentCount: number;
    playerLiving: number;
    opponentLiving: number;
    totalDamage: number;
    battlePhase: string;
  } {
    const playerLiving = this.player.filter(s => !s.isKO).length;
    const opponentLiving = this.opponent.filter(s => !s.isKO).length;

    const totalDamage = this.allSpirits.reduce((sum, spirit) => {
      return sum + (spirit.maxHP - spirit.currentHP);
    }, 0);

    return {
      playerCount: this.player.length,
      opponentCount: this.opponent.length,
      playerLiving,
      opponentLiving,
      totalDamage,
      battlePhase: this.turn.phaseName
    };
  }

  /**
   * Check if battle is over
   */
  get isBattleOver(): boolean {
    const playerLiving = this.player.filter(s => !s.isKO).length;
    const opponentLiving = this.opponent.filter(s => !s.isKO).length;

    return playerLiving === 0 || opponentLiving === 0;
  }

  /**
   * Get battle result
   */
  getBattleResult(): 'player_win' | 'opponent_win' | 'ongoing' {
    if (!this.isBattleOver) return 'ongoing';

    const playerLiving = this.player.filter(s => !s.isKO).length;
    return playerLiving > 0 ? 'player_win' : 'opponent_win';
  }

  /**
   * Create a copy of this HUD model
   */
  clone(): BattleHUDModel {
    return new BattleHUDModel(
      this.player.map(spirit => spirit.clone()),
      this.opponent.map(spirit => spirit.clone()),
      this.turn.clone(),
      this.metadata ? { ...this.metadata } : undefined
    );
  }

  /**
   * Create snapshot for comparison
   */
  snapshot(): IBattleHUDModel {
    return {
      player: this.player.map(spirit => spirit.snapshot()),
      opponent: this.opponent.map(spirit => spirit.snapshot()),
      turn: {
        phaseName: this.turn.phaseName,
        activeSpiritId: this.turn.activeSpiritId,
        actionPreview: this.turn.actionPreview,
        turnNumber: this.turn.turnNumber,
        roundNumber: this.turn.roundNumber
      },
      metadata: this.metadata ? { ...this.metadata } : undefined
    };
  }

  /**
   * Validate entire HUD model
   */
  validate(): string[] {
    const errors: string[] = [];

    // Validate turn state
    const turnErrors = this.turn.validate();
    turnErrors.forEach(error => errors.push(`Turn: ${error}`));

    // Validate all spirits
    this.player.forEach((spirit, index) => {
      const spiritErrors = spirit.validate();
      spiritErrors.forEach(error => {
        errors.push(`Player ${index} (${spirit.spiritId}): ${error}`);
      });
    });

    this.opponent.forEach((spirit, index) => {
      const spiritErrors = spirit.validate();
      spiritErrors.forEach(error => {
        errors.push(`Opponent ${index} (${spirit.spiritId}): ${error}`);
      });
    });

    // Check for duplicate spirit IDs
    const allIds = this.allSpirits.map(s => s.spiritId);
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      errors.push(`Duplicate spirit IDs found: ${duplicateIds.join(', ')}`);
    }

    return errors;
  }
}

/**
 * HUD renderer interface for different platforms
 */
export interface IHUDRenderer {
  render(model: IBattleHUDModel): string;
  renderSpirit(spirit: ISpiritHUDState): string;
  renderTurn(turn: ITurnHUDState): string;
  renderHealthBar(currentHP: number, maxHP: number, width: number): string;
}

/**
 * CLI HUD renderer implementation
 */
export class CLIHUDRenderer implements IHUDRenderer {
  render(model: IBattleHUDModel): string {
    if (!model) {
      return '(no HUD)';
    }

    let output = '';

    output += '=== Player Spirits ===\n';
    model.player.forEach(spirit => {
      output += this.renderSpirit(spirit) + '\n';
    });

    output += '\n=== Opponent Spirits ===\n';
    model.opponent.forEach(spirit => {
      output += this.renderSpirit(spirit) + '\n';
    });

    output += '\n' + this.renderTurn(model.turn);

    return output;
  }

  renderSpirit(spirit: ISpiritHUDState): string {
    const healthBar = this.renderHealthBar(spirit.currentHP, spirit.maxHP, 20);
    const status = spirit.statusEffects.length > 0
      ? spirit.statusEffects.join(',')
      : '-';

    return `${spirit.getDisplayName()} (${spirit.spiritId}) HP ${spirit.currentHP}/${spirit.maxHP} ${healthBar} status[${status}]`;
  }

  renderTurn(turn: ITurnHUDState): string {
    return turn.getDisplayString();
  }

  renderHealthBar(currentHP: number, maxHP: number, width: number): string {
    return HUDPureUtils.renderHealthBar(currentHP, maxHP, width);
  }
}

/**
 * HUD Manager for coordinating updates and rendering
 */
export class HUDManager {
  private model: BattleHUDModel;
  private renderer: IHUDRenderer;
  private updateCallbacks: Array<(event: IHUDUpdateEvent) => void> = [];

  constructor(
    model: BattleHUDModel = new BattleHUDModel(),
    renderer: IHUDRenderer = new CLIHUDRenderer()
  ) {
    this.model = model;
    this.renderer = renderer;
  }

  /**
   * Update the HUD model
   */
  updateModel(updates: Partial<IBattleHUDModel>): void {
    if (updates.player) {
      this.model.player.length = 0;
      updates.player.forEach(spirit => {
        if (spirit instanceof SpiritHUDState) {
          this.model.player.push(spirit);
        } else {
          this.model.player.push(new SpiritHUDState(
            spirit.spiritId,
            spirit.name,
            spirit.currentHP,
            spirit.maxHP,
            spirit.statusEffects,
            spirit.level,
            spirit.element,
            spirit.position
          ));
        }
      });
    }

    if (updates.opponent) {
      this.model.opponent.length = 0;
      updates.opponent.forEach(spirit => {
        if (spirit instanceof SpiritHUDState) {
          this.model.opponent.push(spirit);
        } else {
          this.model.opponent.push(new SpiritHUDState(
            spirit.spiritId,
            spirit.name,
            spirit.currentHP,
            spirit.maxHP,
            spirit.statusEffects,
            spirit.level,
            spirit.element,
            spirit.position
          ));
        }
      });
    }

    if (updates.turn) {
      this.model.turn = updates.turn instanceof TurnHUDState
        ? updates.turn
        : new TurnHUDState(
            updates.turn.phaseName,
            updates.turn.activeSpiritId,
            updates.turn.actionPreview,
            updates.turn.turnNumber,
            updates.turn.roundNumber
          );
    }

    if (updates.metadata) {
      this.model.metadata = { ...updates.metadata };
    }
  }

  /**
   * Render current HUD state
   */
  render(): string {
    return this.renderer.render(this.model);
  }

  /**
   * Add update callback
   */
  onUpdate(callback: (event: IHUDUpdateEvent) => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Remove update callback
   */
  removeUpdateCallback(callback: (event: IHUDUpdateEvent) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  /**
   * Trigger update event
   */
  private triggerUpdate(event: IHUDUpdateEvent): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.warn('HUD update callback error:', error);
      }
    });
  }

  /**
   * Update spirit in the model
   */
  updateSpirit(spiritId: string, updates: Partial<ISpiritHUDState>): void {
    const success = this.model.updateSpirit(spiritId, updates);
    if (success) {
      this.triggerUpdate({
        type: HUDUpdateType.SPIRIT_UPDATE,
        spiritId,
        data: updates,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update turn state
   */
  updateTurn(updates: Partial<ITurnHUDState>): void {
    this.model.updateTurn(updates);
    this.triggerUpdate({
      type: HUDUpdateType.TURN_UPDATE,
      data: updates,
      timestamp: Date.now()
    });
  }

  /**
   * Change battle phase
   */
  changePhase(phaseName: string, activeSpiritId?: string, actionPreview?: string): void {
    this.model.updateTurn({ phaseName, activeSpiritId, actionPreview });
    this.triggerUpdate({
      type: HUDUpdateType.PHASE_CHANGE,
      data: { phaseName, activeSpiritId, actionPreview },
      timestamp: Date.now()
    });
  }

  /**
   * Get current model
   */
  getModel(): IBattleHUDModel {
    return this.model.snapshot();
  }

  /**
   * Clear HUD
   */
  clear(): void {
    this.model = new BattleHUDModel();
    this.triggerUpdate({
      type: HUDUpdateType.BATTLE_END,
      timestamp: Date.now()
    });
  }
}

/**
 * Utility functions for HUD operations
 */
export const HUDPureUtils = {
  /**
   * Render health bar string
   */
  renderHealthBar(currentHP: number, maxHP: number, width: number): string {
    if (maxHP <= 0) maxHP = 1;
    currentHP = Math.max(0, Math.min(maxHP, currentHP));
    const filled = Math.round((currentHP / maxHP) * width);
    return '[' + '#'.repeat(filled) + '-'.repeat(width - filled) + ']';
  },

  /**
   * Create standard battle HUD model
   */
  createStandardHUD(
    playerSpirits: Array<{
      spiritId: string;
      name: string;
      currentHP: number;
      maxHP: number;
      statusEffects?: string[];
      level?: number;
      element?: string;
    }>,
    opponentSpirits: Array<{
      spiritId: string;
      name: string;
      currentHP: number;
      maxHP: number;
      statusEffects?: string[];
      level?: number;
      element?: string;
    }>,
    turnState?: Partial<ITurnHUDState>
  ): BattleHUDModel {
    const player = playerSpirits.map(spirit =>
      new SpiritHUDState(
        spirit.spiritId,
        spirit.name,
        spirit.currentHP,
        spirit.maxHP,
        spirit.statusEffects || [],
        spirit.level,
        spirit.element
      )
    );

    const opponent = opponentSpirits.map(spirit =>
      new SpiritHUDState(
        spirit.spiritId,
        spirit.name,
        spirit.currentHP,
        spirit.maxHP,
        spirit.statusEffects || [],
        spirit.level,
        spirit.element
      )
    );

    const turn = new TurnHUDState(
      turnState?.phaseName || '',
      turnState?.activeSpiritId,
      turnState?.actionPreview,
      turnState?.turnNumber,
      turnState?.roundNumber
    );

    return new BattleHUDModel(player, opponent, turn);
  },

  /**
   * Create spirit from minimal data
   */
  createSpirit(
    spiritId: string,
    name: string,
    currentHP: number,
    maxHP: number,
    options?: {
      statusEffects?: string[];
      level?: number;
      element?: string;
      position?: number;
    }
  ): SpiritHUDState {
    return new SpiritHUDState(
      spiritId,
      name,
      currentHP,
      maxHP,
      options?.statusEffects || [],
      options?.level,
      options?.element,
      options?.position
    );
  },

  /**
   * Calculate health percentages for all spirits
   */
  calculateHealthStats(model: IBattleHUDModel): {
    playerTotal: number;
    opponentTotal: number;
    playerAverage: number;
    opponentAverage: number;
  } {
    const playerPercentages = model.player.map(s => s.hpPercentage);
    const opponentPercentages = model.opponent.map(s => s.hpPercentage);

    return {
      playerTotal: playerPercentages.reduce((sum, hp) => sum + hp, 0),
      opponentTotal: opponentPercentages.reduce((sum, hp) => sum + hp, 0),
      playerAverage: playerPercentages.length > 0
        ? playerPercentages.reduce((sum, hp) => sum + hp, 0) / playerPercentages.length
        : 0,
      opponentAverage: opponentPercentages.length > 0
        ? opponentPercentages.reduce((sum, hp) => sum + hp, 0) / opponentPercentages.length
        : 0
    };
  },

  /**
   * Get spirits sorted by health status priority
   */
  getSpiritsByPriority(model: IBattleHUDModel): ISpiritHUDState[] {
    const allSpirits = [...model.player, ...model.opponent];

    return allSpirits.sort((a, b) => {
      // KO spirits first
      if (a.isKO && !b.isKO) return -1;
      if (!a.isKO && b.isKO) return 1;

      // Then by health percentage (lowest first)
      const aHP = a.hpPercentage;
      const bHP = b.hpPercentage;

      if (aHP !== bHP) {
        return aHP - bHP;
      }

      // Then by name for consistent ordering
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Validate HUD model data
   */
  validateHUDModel(model: IBattleHUDModel): string[] {
    const errors: string[] = [];

    if (!model) {
      errors.push('HUD model cannot be null or undefined');
      return errors;
    }

    // Validate turn state
    const turnErrors = model.turn.validate();
    turnErrors.forEach(error => errors.push(`Turn: ${error}`));

    // Validate all spirits
    model.player.forEach((spirit, index) => {
      if (spirit instanceof SpiritHUDState) {
        const spiritErrors = spirit.validate();
        spiritErrors.forEach(error => {
          errors.push(`Player ${index} (${spirit.spiritId}): ${error}`);
        });
      }
    });

    model.opponent.forEach((spirit, index) => {
      if (spirit instanceof SpiritHUDState) {
        const spiritErrors = spirit.validate();
        spiritErrors.forEach(error => {
          errors.push(`Opponent ${index} (${spirit.spiritId}): ${error}`);
        });
      }
    });

    return errors;
  }
};

/**
 * Default instances
 */
export const defaultHUDRenderer = new CLIHUDRenderer();
export const defaultHUDModel = new BattleHUDModel();
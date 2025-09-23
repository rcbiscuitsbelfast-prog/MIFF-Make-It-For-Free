/**
 * CombatPure - Battle System Core
 *
 * A comprehensive battle system for handling combat mechanics, damage calculation,
 * type effectiveness, and spirit interactions. Supports deterministic calculations
 * with configurable type charts and extensible move systems.
 *
 * @module CombatPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Move category enumeration
 */
export enum MoveCategory {
  STATUS = 'status',
  PHYSICAL = 'physical',
  SPECIAL = 'special'
}

/**
 * Action source enumeration
 */
export enum ActionSource {
  PLAYER = 'player',
  AI = 'ai',
  ENGINE = 'engine'
}

/**
 * Battle phase enumeration
 */
export enum BattlePhase {
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  TURN_END = 'turn_end',
  BATTLE_END = 'battle_end'
}

/**
 * Damage breakdown for analysis
 */
export interface IDamageBreakdown {
  baseDamage: number;
  criticalMultiplier: number;
  typeMultiplier: number;
  varianceMultiplier: number;
  finalDamage: number;
}

/**
 * Move data structure
 */
export interface IMoveData {
  moveId: string;
  name: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
  statusEffectId?: string;
  animationTag?: string;
}

/**
 * Spirit stats structure
 */
export interface ISpiritStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  specialAtk: number;
  specialDef: number;
  level: number;
}

/**
 * Spirit status effects
 */
export interface ISpiritStatus {
  defending?: boolean;
  ko?: boolean;
  fled?: boolean;
  [key: string]: any; // Allow for custom status effects
}

/**
 * Combatant data structure
 */
export interface ICombatant {
  id: string;
  name: string;
  team: string;
  stats: ISpiritStats;
  status?: ISpiritStatus;
  typeTag: string;
  spiritId?: string;
}

/**
 * Battle action structure
 */
export interface IBattleAction {
  actorId: string;
  targetId?: string;
  moveId: string;
  priority: number;
  speed: number;
  source: ActionSource;
  itemId?: string;
  type: 'attack' | 'defend' | 'item' | 'flee';
}

/**
 * Battle state structure
 */
export interface IBattleState {
  combatants: Record<string, ICombatant>;
  order: string[];
  queue: IBattleAction[];
  over?: boolean;
  winnerTeam?: string;
  turnNumber: number;
  phase: BattlePhase;
  metadata?: Record<string, any>;
}

/**
 * Combat result structure
 */
export interface ICombatResult {
  success: boolean;
  damage?: number;
  statusApplied?: string;
  summary: string;
}

/**
 * Battle effect structure
 */
export interface IBattleEffect {
  effectId: string;
  description?: string;
  sourceActorId?: string;
  targetActorId?: string;
  [key: string]: any;
}

/**
 * RNG provider interface (dependency)
 */
export interface IRNGProvider {
  nextFloat(min: number, max: number): number;
  nextBool(probability: number): boolean;
}

/**
 * Inventory hook interface
 */
export interface IInventoryHook {
  hasItem(itemId: string): boolean;
  consumeItem(itemId: string): void;
}

/**
 * AI hook interface
 */
export interface IAIHook {
  pickAction(state: IBattleState, combatantId: string): IBattleAction;
}

/**
 * Save hook interface
 */
export interface ISaveHook {
  onCheckpoint?(state: IBattleState): void;
}

/**
 * Type effectiveness implementation
 */
export class TypeEffectiveness {
  private readonly chart = new Map<string, Map<string, number>>();

  constructor(chart?: Record<string, Record<string, number>>) {
    if (chart) {
      this.loadChart(chart);
    } else {
      this.buildDefaultChart();
    }
  }

  /**
   * Get type effectiveness multiplier
   */
  getMultiplier(attackType: string, defenseType: string): number {
    if (!attackType || !defenseType) {
      return 1.0;
    }

    const attackLower = attackType.toLowerCase();
    const defenseLower = defenseType.toLowerCase();

    const attackChart = this.chart.get(attackLower);
    if (!attackChart) {
      return 1.0;
    }

    const multiplier = attackChart.get(defenseLower);
    return multiplier !== undefined ? multiplier : 1.0;
  }

  /**
   * Set type effectiveness
   */
  setMultiplier(attackType: string, defenseType: string, multiplier: number): void {
    const attackLower = attackType.toLowerCase();
    const defenseLower = defenseType.toLowerCase();

    if (!this.chart.has(attackLower)) {
      this.chart.set(attackLower, new Map());
    }

    this.chart.get(attackLower)!.set(defenseLower, multiplier);
  }

  /**
   * Load type chart from object
   */
  loadChart(chart: Record<string, Record<string, number>>): void {
    this.chart.clear();

    for (const [attackType, defenseMap] of Object.entries(chart)) {
      const attackLower = attackType.toLowerCase();
      const defenseChart = new Map<string, number>();

      for (const [defenseType, multiplier] of Object.entries(defenseMap)) {
        const defenseLower = defenseType.toLowerCase();
        defenseChart.set(defenseLower, multiplier);
      }

      this.chart.set(attackLower, defenseChart);
    }
  }

  /**
   * Build default type chart
   */
  private buildDefaultChart(): void {
    // Neutral baseline
    this.setMultiplier('neutral', 'neutral', 1.0);

    // Water > Fire > Nature > Water (rock-paper-scissors)
    this.setMultiplier('water', 'fire', 2.0);
    this.setMultiplier('fire', 'nature', 2.0);
    this.setMultiplier('nature', 'water', 2.0);

    // Resistances (0.5x)
    this.setMultiplier('fire', 'water', 0.5);
    this.setMultiplier('nature', 'fire', 0.5);
    this.setMultiplier('water', 'nature', 0.5);

    // Immunity example
    this.setMultiplier('ghost', 'normal', 0.0);
  }

  /**
   * Get all attack types
   */
  getAttackTypes(): string[] {
    return Array.from(this.chart.keys());
  }

  /**
   * Get all defense types for an attack type
   */
  getDefenseTypes(attackType: string): string[] {
    const attackLower = attackType.toLowerCase();
    const defenseChart = this.chart.get(attackLower);
    return defenseChart ? Array.from(defenseChart.keys()) : [];
  }

  /**
   * Export type chart
   */
  exportChart(): Record<string, Record<string, number>> {
    const chart: Record<string, Record<string, number>> = {};

    for (const [attackType, defenseChart] of this.chart.entries()) {
      chart[attackType] = {};
      for (const [defenseType, multiplier] of defenseChart.entries()) {
        chart[attackType][defenseType] = multiplier;
      }
    }

    return chart;
  }
}

/**
 * Move data implementation
 */
export class MoveData implements IMoveData {
  public moveId: string;
  public name: string;
  public category: MoveCategory;
  public power: number;
  public accuracy: number;
  public cost: number;
  public typeTag: string;
  public statusEffectId?: string;
  public animationTag?: string;

  constructor(
    moveId: string = '',
    name: string = '',
    category: MoveCategory = MoveCategory.STATUS,
    power: number = 0,
    accuracy: number = 1.0,
    cost: number = 0,
    typeTag: string = 'neutral',
    statusEffectId?: string,
    animationTag?: string
  ) {
    this.moveId = moveId;
    this.name = name;
    this.category = category;
    this.power = Math.max(0, power);
    this.accuracy = Math.max(0, Math.min(1, accuracy));
    this.cost = Math.max(0, cost);
    this.typeTag = typeTag;
    this.statusEffectId = statusEffectId;
    this.animationTag = animationTag;
  }

  /**
   * Check if move is a status move
   */
  get isStatusMove(): boolean {
    return this.category === MoveCategory.STATUS;
  }

  /**
   * Check if move is a physical attack
   */
  get isPhysicalAttack(): boolean {
    return this.category === MoveCategory.PHYSICAL;
  }

  /**
   * Check if move is a special attack
   */
  get isSpecialAttack(): boolean {
    return this.category === MoveCategory.SPECIAL;
  }

  /**
   * Check if move can deal damage
   */
  get canDealDamage(): boolean {
    return this.category !== MoveCategory.STATUS && this.power > 0;
  }

  /**
   * Get move summary
   */
  getSummary(): string {
    if (this.isStatusMove) {
      return `${this.name} (${this.category}, ${this.accuracy * 100}% accuracy)`;
    }
    return `${this.name} (${this.category}, ${this.power} power, ${this.accuracy * 100}% accuracy, ${this.cost} cost)`;
  }

  /**
   * Create a copy of this move
   */
  clone(): MoveData {
    return new MoveData(
      this.moveId,
      this.name,
      this.category,
      this.power,
      this.accuracy,
      this.cost,
      this.typeTag,
      this.statusEffectId,
      this.animationTag
    );
  }

  /**
   * Validate move data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.moveId || this.moveId.trim() === '') {
      errors.push('Move ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Move name cannot be empty');
    }

    if (this.power < 0) {
      errors.push('Move power cannot be negative');
    }

    if (this.accuracy < 0 || this.accuracy > 1) {
      errors.push('Move accuracy must be between 0 and 1');
    }

    if (this.cost < 0) {
      errors.push('Move cost cannot be negative');
    }

    return errors;
  }
}

/**
 * Spirit instance implementation
 */
export class SpiritInstance {
  public id: number;
  public spiritId?: string;
  public name: string;
  public typeTag: string;
  public level: number;
  public attack: number;
  public defense: number;
  public specialAttack: number;
  public specialDefense: number;
  public maxHP: number;
  public currentHP: number;
  public resourcePoints: number;
  public attackMultiplier: number;
  public defenseMultiplier: number;
  public specialAttackMultiplier: number;
  public specialDefenseMultiplier: number;
  public critChanceBonus: number;

  constructor(
    id: number = 0,
    spiritId?: string,
    name: string = '',
    typeTag: string = 'neutral',
    level: number = 1,
    attack: number = 10,
    defense: number = 10,
    specialAttack: number = 10,
    specialDefense: number = 10,
    maxHP: number = 50,
    currentHP: number = 50,
    resourcePoints: number = 10
  ) {
    this.id = id;
    this.spiritId = spiritId;
    this.name = name;
    this.typeTag = typeTag;
    this.level = Math.max(1, level);
    this.attack = Math.max(0, attack);
    this.defense = Math.max(0, defense);
    this.specialAttack = Math.max(0, specialAttack);
    this.specialDefense = Math.max(0, specialDefense);
    this.maxHP = Math.max(1, maxHP);
    this.currentHP = Math.max(0, Math.min(maxHP, currentHP));
    this.resourcePoints = Math.max(0, resourcePoints);
    this.attackMultiplier = 1.0;
    this.defenseMultiplier = 1.0;
    this.specialAttackMultiplier = 1.0;
    this.specialDefenseMultiplier = 1.0;
    this.critChanceBonus = 0.0;
  }

  /**
   * Get effective attack stat for physical moves
   */
  getEffectiveAttack(): number {
    return Math.floor(this.attack * this.attackMultiplier);
  }

  /**
   * Get effective defense stat for physical moves
   */
  getEffectiveDefense(): number {
    return Math.floor(this.defense * this.defenseMultiplier);
  }

  /**
   * Get effective special attack stat
   */
  getEffectiveSpecialAttack(): number {
    return Math.floor(this.specialAttack * this.specialAttackMultiplier);
  }

  /**
   * Get effective special defense stat
   */
  getEffectiveSpecialDefense(): number {
    return Math.floor(this.specialDefense * this.specialDefenseMultiplier);
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
    return this.currentHP <= Math.floor(this.maxHP * 0.25);
  }

  /**
   * Check if spirit is at low health (50% or less)
   */
  get isLowHealth(): boolean {
    return this.currentHP <= Math.floor(this.maxHP * 0.5);
  }

  /**
   * Check if spirit is knocked out
   */
  get isKO(): boolean {
    return this.currentHP <= 0;
  }

  /**
   * Get health percentage (0-100)
   */
  get healthPercentage(): number {
    return this.maxHP > 0 ? (this.currentHP / this.maxHP) * 100 : 0;
  }

  /**
   * Get health status string
   */
  get healthStatus(): 'full' | 'high' | 'medium' | 'low' | 'critical' | 'ko' {
    if (this.isKO) return 'ko';
    if (this.isFullHealth) return 'full';
    if (this.isCritical) return 'critical';
    if (this.isLowHealth) return 'low';
    if (this.healthPercentage > 75) return 'high';
    return 'medium';
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): number {
    const actualDamage = Math.min(amount, this.currentHP);
    this.currentHP = Math.max(0, this.currentHP - amount);
    return actualDamage;
  }

  /**
   * Heal damage
   */
  heal(amount: number): number {
    const oldHP = this.currentHP;
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    return this.currentHP - oldHP;
  }

  /**
   * Consume resource points
   */
  consumeResource(amount: number): boolean {
    if (this.resourcePoints >= amount) {
      this.resourcePoints -= amount;
      return true;
    }
    return false;
  }

  /**
   * Restore resource points
   */
  restoreResource(amount: number): number {
    const oldResources = this.resourcePoints;
    this.resourcePoints = Math.min(this.resourcePoints + amount, 999); // Cap at 999
    return this.resourcePoints - oldResources;
  }

  /**
   * Get combat stats summary
   */
  getCombatSummary(): string {
    return `${this.name} (HP: ${this.currentHP}/${this.maxHP}, ATK: ${this.getEffectiveAttack()}, DEF: ${this.getEffectiveDefense()})`;
  }

  /**
   * Create a copy of this spirit instance
   */
  clone(): SpiritInstance {
    return new SpiritInstance(
      this.id,
      this.spiritId,
      this.name,
      this.typeTag,
      this.level,
      this.attack,
      this.defense,
      this.specialAttack,
      this.specialDefense,
      this.maxHP,
      this.currentHP,
      this.resourcePoints
    );
  }

  /**
   * Create snapshot for comparison
   */
  snapshot(): SpiritInstance {
    return this.clone();
  }

  /**
   * Validate spirit data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Spirit name cannot be empty');
    }

    if (this.level < 1) {
      errors.push('Spirit level must be at least 1');
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

    if (this.resourcePoints < 0) {
      errors.push('Resource points cannot be negative');
    }

    if (this.attackMultiplier < 0) {
      errors.push('Attack multiplier cannot be negative');
    }

    if (this.defenseMultiplier < 0) {
      errors.push('Defense multiplier cannot be negative');
    }

    if (this.specialAttackMultiplier < 0) {
      errors.push('Special attack multiplier cannot be negative');
    }

    if (this.specialDefenseMultiplier < 0) {
      errors.push('Special defense multiplier cannot be negative');
    }

    if (this.critChanceBonus < 0 || this.critChanceBonus > 1) {
      errors.push('Critical chance bonus must be between 0 and 1');
    }

    return errors;
  }
}

/**
 * Damage calculator implementation
 */
export class DamageCalculator {
  private readonly typeEffectiveness: TypeEffectiveness;
  public onDamageComputed?: (attacker: SpiritInstance, defender: SpiritInstance, move: MoveData, breakdown: IDamageBreakdown) => void;

  constructor(typeEffectiveness: TypeEffectiveness) {
    this.typeEffectiveness = typeEffectiveness;
  }

  /**
   * Calculate damage for an attack
   */
  calculateDamage(attacker: SpiritInstance, defender: SpiritInstance, move: MoveData, rng: IRNGProvider): number {
    const breakdown: IDamageBreakdown = {
      baseDamage: 0,
      criticalMultiplier: 1.0,
      typeMultiplier: 1.0,
      varianceMultiplier: 1.0,
      finalDamage: 0
    };

    // Status moves deal no damage
    if (move.category === MoveCategory.STATUS || move.power <= 0) {
      breakdown.finalDamage = 0;
      this.onDamageComputed?.(attacker, defender, move, breakdown);
      return 0;
    }

    // Get attack and defense stats
    const attackStat = move.category === MoveCategory.PHYSICAL
      ? attacker.getEffectiveAttack()
      : attacker.getEffectiveSpecialAttack();

    let defenseStat = move.category === MoveCategory.PHYSICAL
      ? defender.getEffectiveDefense()
      : defender.getEffectiveSpecialDefense();

    defenseStat = Math.max(1, defenseStat);

    // Base damage calculation
    const levelFactor = (2 * attacker.level + 10) / 250;
    breakdown.baseDamage = Math.floor((levelFactor * move.power * attackStat / defenseStat) + 2);

    // Critical hit calculation
    const critChance = Math.min(1.0, 0.0625 + attacker.critChanceBonus);
    breakdown.criticalMultiplier = rng.nextBool(critChance) ? 1.5 : 1.0;

    // Type effectiveness
    breakdown.typeMultiplier = this.typeEffectiveness.getMultiplier(move.typeTag, defender.typeTag);

    // Random variance (90-100%)
    breakdown.varianceMultiplier = rng.nextFloat(0.9, 1.0);

    // Calculate final damage
    breakdown.finalDamage = Math.floor(
      breakdown.baseDamage *
      breakdown.criticalMultiplier *
      breakdown.typeMultiplier *
      breakdown.varianceMultiplier
    );

    // Ensure minimum damage
    breakdown.finalDamage = Math.max(1, breakdown.finalDamage);

    this.onDamageComputed?.(attacker, defender, move, breakdown);
    return breakdown.finalDamage;
  }

  /**
   * Check if a move can be executed
   */
  canExecuteMove(attacker: SpiritInstance, move: MoveData): boolean {
    if (move.category === MoveCategory.STATUS) {
      return true; // Status moves can always be attempted
    }

    return attacker.resourcePoints >= move.cost;
  }

  /**
   * Get move effectiveness against a defender
   */
  getMoveEffectiveness(move: MoveData, defender: SpiritInstance): number {
    return this.typeEffectiveness.getMultiplier(move.typeTag, defender.typeTag);
  }

  /**
   * Calculate expected damage (for AI decision making)
   */
  calculateExpectedDamage(attacker: SpiritInstance, defender: SpiritInstance, move: MoveData): number {
    if (move.category === MoveCategory.STATUS || move.power <= 0) {
      return 0;
    }

    const attackStat = move.category === MoveCategory.PHYSICAL
      ? attacker.getEffectiveAttack()
      : attacker.getEffectiveSpecialAttack();

    let defenseStat = move.category === MoveCategory.PHYSICAL
      ? defender.getEffectiveDefense()
      : defender.getEffectiveSpecialDefense();

    defenseStat = Math.max(1, defenseStat);

    // Use mean values for estimation
    const levelFactor = (2 * attacker.level + 10) / 250;
    const baseDamage = Math.floor((levelFactor * move.power * attackStat / defenseStat) + 2);
    const typeMultiplier = this.typeEffectiveness.getMultiplier(move.typeTag, defender.typeTag);
    const varianceMultiplier = 0.95; // Use mean variance

    return Math.floor(baseDamage * typeMultiplier * varianceMultiplier);
  }
}

/**
 * Battle engine implementation
 */
export class BattleEngine {
  public state: IBattleState;
  public inventory?: IInventoryHook;
  public ai?: IAIHook;
  public save?: ISaveHook;

  constructor() {
    this.state = {
      combatants: {},
      order: [],
      queue: [],
      turnNumber: 0,
      phase: BattlePhase.PRE_TURN
    };
  }

  /**
   * Add combatant to battle
   */
  addCombatant(combatant: ICombatant): void {
    if (this.state.combatants[combatant.id]) {
      console.warn(`Combatant ${combatant.id} already exists`);
      return;
    }

    this.state.combatants[combatant.id] = { ...combatant };
    this.rebuildOrder();
  }

  /**
   * Remove combatant from battle
   */
  removeCombatant(combatantId: string): boolean {
    if (!this.state.combatants[combatantId]) {
      return false;
    }

    delete this.state.combatants[combatantId];
    this.state.order = this.state.order.filter(id => id !== combatantId);
    return true;
  }

  /**
   * Get combatant by ID
   */
  getCombatant(combatantId: string): ICombatant | null {
    return this.state.combatants[combatantId] || null;
  }

  /**
   * Get all combatants
   */
  getAllCombatants(): ICombatant[] {
    return Object.values(this.state.combatants);
  }

  /**
   * Get combatants by team
   */
  getCombatantsByTeam(team: string): ICombatant[] {
    return Object.values(this.state.combatants).filter(c => c.team === team);
  }

  /**
   * Get living combatants by team
   */
  getLivingCombatantsByTeam(team: string): ICombatant[] {
    return this.getCombatantsByTeam(team).filter(c => !c.status?.ko);
  }

  /**
   * Rebuild turn order based on speed
   */
  rebuildOrder(): void {
    this.state.order = Object.values(this.state.combatants)
      .sort((a, b) => b.stats.spd - a.stats.spd)
      .map(c => c.id);
  }

  /**
   * Enqueue action
   */
  enqueueAction(action: IBattleAction): void {
    this.state.queue.push({ ...action });
  }

  /**
   * Process next action in queue
   */
  processNextAction(): void {
    if (this.state.over) return;

    const nextAction = this.state.queue.shift();
    if (!nextAction) return;

    this.resolveAction(nextAction);
    this.checkVictory();
    this.save?.onCheckpoint?.(this.state);
  }

  /**
   * Resolve a battle action
   */
  resolveAction(action: IBattleAction): void {
    const actor = this.state.combatants[action.actorId];
    if (!actor || actor.status?.ko || actor.status?.fled) {
      return;
    }

    switch (action.type) {
      case 'attack':
        this.resolveAttack(actor, action);
        break;
      case 'defend':
        this.resolveDefend(actor);
        break;
      case 'item':
        this.resolveItemUsage(actor, action);
        break;
      case 'flee':
        this.resolveFlee(actor);
        break;
    }
  }

  /**
   * Resolve attack action
   */
  private resolveAttack(actor: ICombatant, action: IBattleAction): void {
    const target = this.state.combatants[action.targetId!];
    if (!target || target.status?.ko || target.status?.fled) {
      return;
    }

    // Find move data (in a real implementation, this would come from a move database)
    const moveData = new MoveData(action.moveId, action.moveId, MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral');

    // Calculate damage
    const attackerInstance = this.combatantToSpiritInstance(actor);
    const defenderInstance = this.combatantToSpiritInstance(target);
    const typeEffectiveness = new TypeEffectiveness();
    const damageCalculator = new DamageCalculator(typeEffectiveness);

    // Mock RNG provider (in real implementation, inject this)
    const mockRNG: IRNGProvider = {
      nextFloat: (min, max) => (min + max) / 2,
      nextBool: (probability) => Math.random() < probability
    };

    const damage = damageCalculator.calculateDamage(attackerInstance, defenderInstance, moveData, mockRNG);

    // Apply damage
    const actualDamage = target.stats.hp - Math.max(0, target.stats.hp - damage);
    target.stats.hp = Math.max(0, target.stats.hp - damage);
    target.status = { ...(target.status || {}), ko: target.stats.hp <= 0 };
  }

  /**
   * Resolve defend action
   */
  private resolveDefend(actor: ICombatant): void {
    actor.status = { ...(actor.status || {}), defending: true };
  }

  /**
   * Resolve item usage
   */
  private resolveItemUsage(actor: ICombatant, action: IBattleAction): void {
    const itemId = action.itemId || '';
    if (!this.inventory || !this.inventory.hasItem(itemId)) {
      return;
    }

    // Simple item effects
    if (itemId === 'potion') {
      const healAmount = 20;
      actor.stats.hp = Math.min(actor.stats.maxHp, actor.stats.hp + healAmount);
    }

    this.inventory.consumeItem(itemId);
  }

  /**
   * Resolve flee action
   */
  private resolveFlee(actor: ICombatant): void {
    actor.status = { ...(actor.status || {}), fled: true };
  }

  /**
   * Check for battle victory conditions
   */
  private checkVictory(): void {
    const teams = new Map<string, { alive: number; fled: number }>();

    for (const combatant of Object.values(this.state.combatants)) {
      const team = teams.get(combatant.team) || { alive: 0, fled: 0 };
      if (!combatant.status?.ko && !combatant.status?.fled) {
        team.alive++;
      }
      if (combatant.status?.fled) {
        team.fled++;
      }
      teams.set(combatant.team, team);
    }

    const aliveTeams = Array.from(teams.entries()).filter(([_, stats]) => stats.alive > 0);

    if (aliveTeams.length <= 1) {
      this.state.over = true;
      this.state.winnerTeam = aliveTeams[0]?.[0];
    }
  }

  /**
   * Start battle
   */
  startBattle(): void {
    this.state.phase = BattlePhase.SELECT_ACTION;
    this.state.turnNumber = 1;
  }

  /**
   * End battle
   */
  endBattle(): void {
    this.state.phase = BattlePhase.BATTLE_END;
    this.state.over = true;
  }

  /**
   * Get battle winner
   */
  getWinner(): string | null {
    if (!this.state.over || !this.state.winnerTeam) {
      return null;
    }
    return this.state.winnerTeam;
  }

  /**
   * Check if battle is over
   */
  get isBattleOver(): boolean {
    return this.state.over || false;
  }

  /**
   * Convert combatant to spirit instance
   */
  private combatantToSpiritInstance(combatant: ICombatant): SpiritInstance {
    return new SpiritInstance(
      parseInt(combatant.id),
      combatant.spiritId,
      combatant.name,
      combatant.typeTag,
      combatant.stats.level,
      combatant.stats.atk,
      combatant.stats.def,
      combatant.stats.specialAtk,
      combatant.stats.specialDef,
      combatant.stats.maxHp,
      combatant.stats.hp
    );
  }
}

/**
 * Utility functions for combat operations
 */
export const CombatUtils = {
  /**
   * Create standard move data
   */
  createStandardMove(
    moveId: string,
    name: string,
    category: MoveCategory,
    power: number,
    typeTag: string = 'neutral'
  ): MoveData {
    return new MoveData(moveId, name, category, power, 1.0, 0, typeTag);
  },

  /**
   * Create standard spirit instance
   */
  createStandardSpirit(
    id: string,
    name: string,
    level: number = 1,
    hp: number = 50,
    atk: number = 10,
    def: number = 10,
    spd: number = 10
  ): SpiritInstance {
    return new SpiritInstance(
      parseInt(id),
      undefined,
      name,
      'neutral',
      level,
      atk,
      def,
      atk, // Special attack same as physical
      def, // Special defense same as physical
      hp,
      hp,
      10
    );
  },

  /**
   * Calculate level difference modifier
   */
  calculateLevelModifier(attackerLevel: number, defenderLevel: number): number {
    const difference = defenderLevel - attackerLevel;
    if (difference >= 5) return 0.5; // Much weaker
    if (difference >= 2) return 0.75; // Weaker
    if (difference <= -5) return 1.5; // Much stronger
    if (difference <= -2) return 1.25; // Stronger
    return 1.0; // Even match
  },

  /**
   * Calculate critical hit chance
   */
  calculateCritChance(baseCrit: number = 0.0625, bonuses: number = 0): number {
    return Math.min(1.0, baseCrit + bonuses);
  },

  /**
   * Calculate hit chance with accuracy and evasion
   */
  calculateHitChance(moveAccuracy: number, attackerAccuracy: number = 1.0, defenderEvasion: number = 1.0): number {
    return Math.min(1.0, moveAccuracy * attackerAccuracy * defenderEvasion);
  },

  /**
   * Get damage category name
   */
  getDamageCategoryName(category: MoveCategory): string {
    switch (category) {
      case MoveCategory.STATUS: return 'Status';
      case MoveCategory.PHYSICAL: return 'Physical';
      case MoveCategory.SPECIAL: return 'Special';
      default: return 'Unknown';
    }
  },

  /**
   * Get action source name
   */
  getActionSourceName(source: ActionSource): string {
    switch (source) {
      case ActionSource.PLAYER: return 'Player';
      case ActionSource.AI: return 'AI';
      case ActionSource.ENGINE: return 'Engine';
      default: return 'Unknown';
    }
  },

  /**
   * Get battle phase name
   */
  getBattlePhaseName(phase: BattlePhase): string {
    switch (phase) {
      case BattlePhase.PRE_TURN: return 'Pre Turn';
      case BattlePhase.SELECT_ACTION: return 'Select Action';
      case BattlePhase.RESOLVE_ACTION: return 'Resolve Action';
      case BattlePhase.TURN_END: return 'Turn End';
      case BattlePhase.BATTLE_END: return 'Battle End';
      default: return 'Unknown';
    }
  },

  /**
   * Validate combatant data
   */
  validateCombatant(combatant: ICombatant): string[] {
    const errors: string[] = [];

    if (!combatant.id || combatant.id.trim() === '') {
      errors.push('Combatant ID cannot be empty');
    }

    if (!combatant.name || combatant.name.trim() === '') {
      errors.push('Combatant name cannot be empty');
    }

    if (!combatant.team || combatant.team.trim() === '') {
      errors.push('Combatant team cannot be empty');
    }

    if (combatant.stats.maxHp <= 0) {
      errors.push('Max HP must be greater than 0');
    }

    if (combatant.stats.hp < 0) {
      errors.push('Current HP cannot be negative');
    }

    if (combatant.stats.hp > combatant.stats.maxHp) {
      errors.push('Current HP cannot exceed max HP');
    }

    if (combatant.stats.level < 1) {
      errors.push('Level must be at least 1');
    }

    return errors;
  },

  /**
   * Validate move data
   */
  validateMoveData(move: IMoveData): string[] {
    const errors: string[] = [];

    if (!move.moveId || move.moveId.trim() === '') {
      errors.push('Move ID cannot be empty');
    }

    if (!move.name || move.name.trim() === '') {
      errors.push('Move name cannot be empty');
    }

    if (move.power < 0) {
      errors.push('Move power cannot be negative');
    }

    if (move.accuracy < 0 || move.accuracy > 1) {
      errors.push('Move accuracy must be between 0 and 1');
    }

    if (move.cost < 0) {
      errors.push('Move cost cannot be negative');
    }

    return errors;
  }
};

/**
 * Default instances
 */
export const defaultTypeEffectiveness = new TypeEffectiveness();
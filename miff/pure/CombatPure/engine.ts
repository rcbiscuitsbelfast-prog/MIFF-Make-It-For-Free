// Enums
export enum MoveCategory {
  PHYSICAL = 'physical',
  SPECIAL = 'special',
  STATUS = 'status'
}

export enum ActionSource {
  PLAYER = 'player',
  AI = 'ai',
  AUTOMATIC = 'automatic'
}

export enum CombatResult {
  ONGOING = 'ongoing',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  DRAW = 'draw'
}

// Interfaces
export interface ICombatant {
  id: string;
  name: string;
  team: string;
  stats: Stats;
  moves: string[];
  status?: {
    defending?: boolean;
    ko?: boolean;
    fled?: boolean;
    [key: string]: any;
  };
}

export interface IBattleAction {
  actorId: string;
  type: 'attack' | 'defend' | 'item' | 'flee';
  targetId?: string;
  itemId?: string;
  moveId?: string;
  source: ActionSource;
}

export interface IRNGProvider {
  nextFloat(min: number, max: number): number;
  nextBool(probability: number): boolean;
  reset(): void;
}

export interface InventoryHook {
  hasItem(id: string): boolean;
  consumeItem(id: string): void;
}

export interface AIHook {
  pickAction(state: CombatState, combatantId: string): Action;
}

export interface SaveHook {
  onCheckpoint?(state: CombatState): void;
}

// Types
export type Stats = {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  specialAtk?: number;
  specialDef?: number;
};

export type Combatant = {
  id: string;
  name: string;
  team: string;
  stats: Stats;
  status?: { defending?: boolean; ko?: boolean; fled?: boolean };
};

export type Action = {
  actorId: string;
  type: 'attack' | 'defend' | 'item' | 'flee';
  targetId?: string;
  itemId?: string;
};

export type CombatState = {
  combatants: Record<string, Combatant>;
  order: string[];
  queue: Action[];
  over?: boolean;
  winnerTeam?: string;
};

// Classes
export class TypeEffectiveness {
  private chart: Record<string, Record<string, number>>;

  constructor(chart?: Record<string, Record<string, number>>) {
    this.chart = chart || {
      'water': { 'fire': 2.0, 'nature': 0.5, 'neutral': 1.0 },
      'fire': { 'water': 0.5, 'nature': 2.0, 'neutral': 1.0 },
      'nature': { 'water': 2.0, 'fire': 0.5, 'neutral': 1.0 },
      'electric': { 'water': 2.0, 'nature': 0.5, 'neutral': 1.0 },
      'neutral': { 'water': 1.0, 'fire': 1.0, 'nature': 1.0, 'electric': 1.0 }
    };
  }

  getMultiplier(attackerType: string, defenderType: string): number {
    const attacker = this.chart[attackerType.toLowerCase()];
    if (!attacker) return 1.0;

    const multiplier = attacker[defenderType.toLowerCase()];
    return multiplier !== undefined ? multiplier : 1.0;
  }

  setMultiplier(attackerType: string, defenderType: string, multiplier: number): void {
    if (!this.chart[attackerType]) {
      this.chart[attackerType] = {};
    }
    this.chart[attackerType][defenderType] = multiplier;
  }

  exportChart(): Record<string, Record<string, number>> {
    return JSON.parse(JSON.stringify(this.chart));
  }

  getAttackTypes(): string[] {
    return Object.keys(this.chart);
  }

  getDefenseTypes(attackerType?: string): string[] {
    if (attackerType) {
      const attacker = this.chart[attackerType.toLowerCase()];
      return attacker ? Object.keys(attacker) : [];
    }
    return Array.from(new Set(Object.values(this.chart).flatMap(types => Object.keys(types))));
  }
}

export class MoveData {
  moveId: string;
  name: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
  statusEffectId?: string;
  animationTag?: string;
  effects?: string[];
  priority?: number;

  constructor(
    moveId: string = '',
    name: string = '',
    category: MoveCategory = MoveCategory.STATUS,
    power: number = 0,
    accuracy: number = 1.0,
    cost: number = 0,
    typeTag: string = 'neutral',
    statusEffectId?: string,
    animationTag?: string,
    effects?: string[],
    priority: number = 0
  ) {
    this.moveId = moveId;
    this.name = name;
    this.category = category;
    this.power = Math.max(0, power);
    this.accuracy = Math.max(0, Math.min(1.0, accuracy));
    this.cost = Math.max(0, cost);
    this.typeTag = typeTag;
    this.statusEffectId = statusEffectId;
    this.animationTag = animationTag;
    this.effects = effects || [];
    this.priority = priority;
  }

  getSummary(): string {
    const categoryName = this.category.toLowerCase();
    let summary = `${this.name} (${categoryName}, ${Math.round(this.accuracy * 100)}% accuracy`;
    if (this.power > 0) summary += `, ${this.power} power`;
    if (this.cost > 0) summary += `, ${this.cost} cost`;
    summary += ')';
    return summary;
  }

  // Computed properties for backward compatibility
  get isPhysicalAttack(): boolean {
    return this.category === MoveCategory.PHYSICAL;
  }

  get isSpecialAttack(): boolean {
    return this.category === MoveCategory.SPECIAL;
  }

  get isStatusMove(): boolean {
    return this.category === MoveCategory.STATUS;
  }

  get canDealDamage(): boolean {
    return this.category === MoveCategory.PHYSICAL || this.category === MoveCategory.SPECIAL;
  }

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
      this.animationTag,
      [...this.effects || []],
      this.priority
    );
  }

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

export class SpiritInstance {
  id: number;
  spiritId: string;
  name: string;
  typeTag: string;
  level: number;
  experience: number;
  stats: Stats;
  statusEffects: string[];
  moves: string[];
  abilities: string[];
  isLeader?: boolean;
  loyalty?: number;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  specialAttackMultiplier?: number;
  specialDefenseMultiplier?: number;
  resourcePoints?: number;
  maxResourcePoints?: number;
  currentHP: number;
  maxHP: number;

  constructor(
    id: number = 0,
    spiritId: string = '',
    name: string = '',
    typeTag: string = 'neutral',
    level: number = 1,
    experience: number = 0,
    attack: number = 10,
    defense: number = 10,
    speed: number = 10,
    maxHP: number = 100,
    currentHP?: number,
    resourcePoints?: number
  ) {
    this.id = Math.max(0, id);
    this.spiritId = spiritId;
    this.name = name;
    this.typeTag = typeTag;
    this.level = Math.max(1, level);
    this.experience = Math.max(0, experience);

    // Set HP values
    this.maxHP = Math.max(1, maxHP);
    this.currentHP = Math.max(0, Math.min(this.maxHP, currentHP ?? maxHP));

    this.stats = {
      hp: this.currentHP,
      maxHp: this.maxHP,
      atk: Math.max(0, attack),
      def: Math.max(0, defense),
      spd: Math.max(0, speed)
    };
    this.statusEffects = [];
    this.moves = [];
    this.abilities = [];
    this.attackMultiplier = 1.0;
    this.defenseMultiplier = 1.0;
    this.specialAttackMultiplier = 1.0;
    this.specialDefenseMultiplier = 1.0;
    this.resourcePoints = resourcePoints;
    this.maxResourcePoints = resourcePoints;
  }

  get healthPercentage(): number {
    return Math.round((this.stats.hp / Math.max(1, this.stats.maxHp)) * 100);
  }

  get isFainted(): boolean {
    return this.stats.hp <= 0;
  }

  // Add computed properties for backward compatibility
  get isFullHealth(): boolean {
    return this.stats.hp >= this.stats.maxHp;
  }

  get isLowHealth(): boolean {
    return this.stats.hp <= this.stats.maxHp * 0.25;
  }

  get isCritical(): boolean {
    return this.stats.hp <= this.stats.maxHp * 0.1;
  }

  get isKO(): boolean {
    return this.isFainted;
  }

  // Add missing methods
  getEffectiveAttack(): number {
    return Math.floor(this.stats.atk * (this.attackMultiplier || 1.0));
  }

  getEffectiveDefense(): number {
    return Math.floor(this.stats.def * (this.defenseMultiplier || 1.0));
  }

  getEffectiveSpecialAttack(): number {
    return Math.floor((this.stats.specialAtk || this.stats.atk) * (this.specialAttackMultiplier || 1.0));
  }

  getEffectiveSpecialDefense(): number {
    return Math.floor((this.stats.specialDef || this.stats.def) * (this.specialDefenseMultiplier || 1.0));
  }

  takeDamage(amount: number): number {
    const actualDamage = Math.min(this.stats.hp, Math.max(0, Math.floor(amount)));
    this.stats.hp -= actualDamage;
    return actualDamage;
  }

  heal(amount: number): number {
    const actualHeal = Math.min(this.stats.maxHp - this.stats.hp, Math.max(0, Math.floor(amount)));
    this.stats.hp += actualHeal;
    return actualHeal;
  }

  restoreResource(amount: number): number {
    if (!this.resourcePoints || !this.maxResourcePoints) return 0;
    const actualRestore = Math.min(this.maxResourcePoints - this.resourcePoints, Math.max(0, Math.floor(amount)));
    this.resourcePoints += actualRestore;
    return actualRestore;
  }

  getCombatSummary(): string {
    const atk = this.getEffectiveAttack();
    const def = this.getEffectiveDefense();
    return `${this.name} (Lv.${this.level}) - HP: ${this.stats.hp}/${this.stats.maxHp} [${this.typeTag}] - ATK: ${atk} DEF: ${def}`;
  }

  consumeResource(amount: number): boolean {
    if (!this.resourcePoints || this.resourcePoints < amount) {
      return false;
    }
    this.resourcePoints -= amount;
    return true;
  }

  getCombatSummary(): string {
    return `${this.name} (Lv.${this.level}) - HP: ${this.stats.hp}/${this.stats.maxHp} [${this.type}]`;
  }

  clone(): SpiritInstance {
    const cloned = new SpiritInstance(
      this.id,
      this.spiritId,
      this.name,
      this.type,
      this.level,
      this.experience,
      this.stats.atk,
      this.stats.def,
      this.stats.spd,
      this.stats.maxHp,
      this.stats.hp,
      this.resourcePoints
    );

    cloned.statusEffects = [...this.statusEffects];
    cloned.moves = [...this.moves];
    cloned.abilities = [...this.abilities];
    cloned.isLeader = this.isLeader;
    cloned.loyalty = this.loyalty;
    cloned.attackMultiplier = this.attackMultiplier;
    cloned.defenseMultiplier = this.defenseMultiplier;
    cloned.specialAttackMultiplier = this.specialAttackMultiplier;
    cloned.specialDefenseMultiplier = this.specialDefenseMultiplier;
    cloned.maxResourcePoints = this.maxResourcePoints;

    return cloned;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (this.id < 0) {
      errors.push('Spirit ID must be non-negative');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Spirit name cannot be empty');
    }

    if (this.level < 1) {
      errors.push('Spirit level must be at least 1');
    }

    if (this.stats.maxHp <= 0) {
      errors.push('Max HP must be greater than 0');
    }

    if (this.stats.hp > this.stats.maxHp) {
      errors.push('Current HP cannot exceed max HP');
    }

    return errors;
  }
}

export class CombatEngine {
  state: CombatState;
  inventory?: InventoryHook;
  ai?: AIHook;
  save?: SaveHook;
  constructor(){ this.state={combatants:{}, order:[], queue:[]}; }
  addCombatant(c:Combatant){ this.state.combatants[c.id]=c; this.rebuildOrder(); }
  rebuildOrder(){ this.state.order = Object.values(this.state.combatants).sort((a,b)=>b.stats.spd-a.stats.spd).map(c=>c.id); }
  enqueue(a:Action){ this.state.queue.push(a); }
  stepTurn(){ if(this.state.over) return; const next = this.state.queue.shift(); if(!next){ return; } this.resolve(next); this.checkVictory(); this.save?.onCheckpoint?.(this.state); }
  resolve(a:Action){ const actor = this.state.combatants[a.actorId]; if(!actor||actor.status?.ko) return;
    switch(a.type){
      case 'attack': this.attack(actor, a.targetId!); break;
      case 'defend': actor.status={...(actor.status||{}), defending:true}; break;
      case 'item': this.useItem(actor, a); break;
      case 'flee': actor.status={...(actor.status||{}), fled:true}; break;
    }
  }
  attack(actor:Combatant, targetId:string){ const tgt = this.state.combatants[targetId]; if(!tgt||tgt.status?.ko) return; const base = Math.max(1, actor.stats.atk - tgt.stats.def); const defendMod = (tgt.status?.defending? 0.5 : 1.0); const dmg = Math.max(1, Math.floor(base*defendMod)); tgt.stats.hp = Math.max(0, tgt.stats.hp - dmg); tgt.status={...(tgt.status||{}), defending:false, ko:(tgt.stats.hp<=0)}; }
  useItem(actor:Combatant, a:Action){ const item = a.itemId || ''; if(this.inventory && !this.inventory.hasItem(item)){ return; }
    if(item==='potion'){ actor.stats.hp = Math.min(actor.stats.maxHp, actor.stats.hp + 20); }
    if(this.inventory) this.inventory.consumeItem(item);
  }
  checkVictory(){ const teams = new Map<string,{alive:number,fled:number}>();
    for(const c of Object.values(this.state.combatants)){
      const t = teams.get(c.team)||{alive:0,fled:0}; if(!c.status?.ko) t.alive++; if(c.status?.fled) t.fled++; teams.set(c.team,t);
    }
    const aliveTeams = Array.from(teams.entries()).filter(([_,v])=>v.alive>0);
    if(aliveTeams.length<=1){ this.state.over=true; this.state.winnerTeam = aliveTeams[0]?.[0]||undefined; }
  }
}

export class DamageCalculator {
  private typeChart: TypeEffectiveness;
  private rng: IRNGProvider;

  constructor(typeChart: TypeEffectiveness, rng?: IRNGProvider) {
    this.typeChart = typeChart;
    this.rng = rng || {
      nextFloat: (min: number, max: number) => (min + max) / 2,
      nextBool: (probability: number) => Math.random() < probability,
      reset: () => {}
    };
  }

  calculateDamage(
    move: MoveData,
    attacker: ICombatant,
    defender: ICombatant,
    isCritical?: boolean
  ): { damage: number; isCritical: boolean; effectiveness: number; messages: string[] } {
    const messages: string[] = [];

    // Base damage calculation
    let baseDamage = move.power;
    if (move.category === MoveCategory.PHYSICAL) {
      baseDamage *= attacker.stats.atk;
    } else if (move.category === MoveCategory.SPECIAL) {
      baseDamage *= (attacker.stats.specialAtk || attacker.stats.atk);
    }

    // Type effectiveness
    const effectiveness = this.typeChart.getMultiplier(move.typeTag, defender.stats.spd > 50 ? 'fast' : 'normal');
    baseDamage *= effectiveness;

    // Critical hit
    const actualIsCritical = isCritical ?? this.rng.nextBool(0.0625); // 6.25% base crit rate
    if (actualIsCritical) {
      baseDamage *= 1.5;
      messages.push('Critical hit!');
    }

    // Random variance (85-100%)
    const variance = this.rng.nextFloat(0.85, 1.0);
    baseDamage *= variance;

    // Defense calculation
    const defense = move.category === MoveCategory.PHYSICAL
      ? defender.stats.def
      : (defender.stats.specialDef || defender.stats.def);
    const defenseModifier = 1 - (defense / (defense + 100));
    baseDamage *= defenseModifier;

    // Status modifiers
    if (defender.status?.defending) {
      baseDamage *= 0.5;
      messages.push('Defending!');
    }

    const finalDamage = Math.max(1, Math.floor(baseDamage));

    if (effectiveness > 1.0) {
      messages.push('Super effective!');
    } else if (effectiveness < 1.0) {
      messages.push('Not very effective...');
    }

    return {
      damage: finalDamage,
      isCritical: actualIsCritical,
      effectiveness,
      messages
    };
  }

  canExecuteMove(move: MoveData, user: ICombatant): { canExecute: boolean; reason?: string } {
    if (move.cost > 0) {
      const resourcePoints = user.resourcePoints || 0;
      if (resourcePoints < move.cost) {
        return { canExecute: false, reason: 'Insufficient resources' };
      }
    }

    if (move.accuracy < 1.0) {
      const hitChance = this.rng.nextFloat(0, 1.0);
      if (hitChance > move.accuracy) {
        return { canExecute: false, reason: 'Missed!' };
      }
    }

    return { canExecute: true };
  }

  getMoveEffectiveness(move: MoveData, defender: ICombatant): number {
    return this.typeChart.getMultiplier(move.typeTag, defender.stats.spd > 50 ? 'fast' : 'normal');
  }

  calculateExpectedDamage(move: MoveData, attacker: ICombatant, defender: ICombatant): number {
    const baseDamage = move.power * (move.category === MoveCategory.PHYSICAL ? attacker.stats.atk : (attacker.stats.specialAtk || attacker.stats.atk));
    const effectiveness = this.typeChart.getMultiplier(move.typeTag, defender.stats.spd > 50 ? 'fast' : 'normal');
    const defense = move.category === MoveCategory.PHYSICAL ? defender.stats.def : (defender.stats.specialDef || defender.stats.def);
    const defenseModifier = 1 - (defense / (defense + 100));

    return baseDamage * effectiveness * defenseModifier * 0.925; // Average variance factor
  }

  setRNGProvider(rng: IRNGProvider): void {
    this.rng = rng;
  }
}

export class BattleEngine {
  private state: CombatState;
  private inventory?: InventoryHook;
  private ai?: AIHook;
  private save?: SaveHook;
  private damageCalculator: DamageCalculator;
  private typeChart: TypeEffectiveness;

  constructor(typeChart?: TypeEffectiveness) {
    this.typeChart = typeChart || new TypeEffectiveness();
    this.damageCalculator = new DamageCalculator(this.typeChart);
    this.state = {
      combatants: {},
      order: [],
      queue: []
    };
  }

  addCombatant(combatant: ICombatant): void {
    this.state.combatants[combatant.id] = combatant;
    this.rebuildOrder();
  }

  removeCombatant(combatantId: string): void {
    delete this.state.combatants[combatantId];
    this.rebuildOrder();
  }

  rebuildOrder(): void {
    this.state.order = Object.values(this.state.combatants)
      .filter(c => !c.status?.ko && !c.status?.fled)
      .sort((a, b) => b.stats.spd - a.stats.spd)
      .map(c => c.id);
  }

  enqueueAction(action: IBattleAction): void {
    this.state.queue.push(action as Action);
  }

  processTurn(): { completed: boolean; results: string[] } {
    if (this.state.over) {
      return { completed: false, results: ['Battle is already over'] };
    }

    const nextAction = this.state.queue.shift();
    if (!nextAction) {
      return { completed: false, results: ['No actions in queue'] };
    }

    const results: string[] = [];
    this.resolveAction(nextAction, results);
    this.checkVictory();
    this.save?.onCheckpoint?.(this.state);

    return { completed: true, results };
  }

  resolveAction(action: IBattleAction, results: string[]): void {
    const actor = this.state.combatants[action.actorId];
    if (!actor || actor.status?.ko || actor.status?.fled) {
      results.push(`${actor?.name || action.actorId} cannot act`);
      return;
    }

    switch (action.type) {
      case 'attack':
        this.resolveAttack(action, results);
        break;
      case 'defend':
        actor.status = { ...(actor.status || {}), defending: true };
        results.push(`${actor.name} is defending`);
        break;
      case 'item':
        this.resolveItemUse(action, results);
        break;
      case 'flee':
        actor.status = { ...(actor.status || {}), fled: true };
        results.push(`${actor.name} fled from battle`);
        break;
    }
  }

  private resolveAttack(action: IBattleAction, results: string[]): void {
    const target = this.state.combatants[action.targetId!];
    if (!target || target.status?.ko) {
      results.push('Invalid target');
      return;
    }

    const damageResult = this.damageCalculator.calculateDamage(
      new MoveData('basic_attack', 'Basic Attack', MoveCategory.PHYSICAL, 40, 1.0, 0, 'normal'),
      this.state.combatants[action.actorId],
      target
    );

    target.stats.hp = Math.max(0, target.stats.hp - damageResult.damage);
    target.status = { ...(target.status || {}), ko: target.stats.hp <= 0 };

    results.push(
      `${this.state.combatants[action.actorId].name} attacks ${target.name} for ${damageResult.damage} damage!`,
      ...damageResult.messages
    );

    if (target.status?.ko) {
      results.push(`${target.name} fainted!`);
    }
  }

  private resolveItemUse(action: IBattleAction, results: string[]): void {
    if (!this.inventory?.hasItem(action.itemId!)) {
      results.push('Item not available');
      return;
    }

    const actor = this.state.combatants[action.actorId];
    if (action.itemId === 'potion') {
      const healAmount = Math.min(50, actor.stats.maxHp - actor.stats.hp);
      actor.stats.hp += healAmount;
      this.inventory.consumeItem(action.itemId!);
      results.push(`${actor.name} used a potion and recovered ${healAmount} HP`);
    } else {
      results.push(`Unknown item: ${action.itemId}`);
    }
  }

  checkVictory(): CombatResult {
    const teams = new Map<string, { alive: number; fled: number }>();

    for (const combatant of Object.values(this.state.combatants)) {
      const team = teams.get(combatant.team) || { alive: 0, fled: 0 };
      if (!combatant.status?.ko) team.alive++;
      if (combatant.status?.fled) team.fled++;
      teams.set(combatant.team, team);
    }

    const aliveTeams = Array.from(teams.entries()).filter(([_, stats]) => stats.alive > 0);

    if (aliveTeams.length === 0) {
      return CombatResult.DRAW;
    } else if (aliveTeams.length === 1) {
      this.state.over = true;
      this.state.winnerTeam = aliveTeams[0][0];
      return this.state.winnerTeam ? CombatResult.VICTORY : CombatResult.DEFEAT;
    }

    return CombatResult.ONGOING;
  }

  getBattleStatus(): CombatResult {
    return this.checkVictory();
  }

  getWinner(): string | null {
    return this.state.winnerTeam || null;
  }

  setInventoryHook(hook: InventoryHook): void {
    this.inventory = hook;
  }

  setAIHook(hook: AIHook): void {
    this.ai = hook;
  }

  setSaveHook(hook: SaveHook): void {
    this.save = hook;
  }

  getState(): CombatState {
    return { ...this.state };
  }
}

export class CombatUtils {
  static createStandardMove(moveId: string, name: string, category: MoveCategory, power: number, typeTag: string): MoveData {
    return new MoveData(moveId, name, category, power, 0.95, 0, typeTag);
  }

  static createStandardSpirit(id: number, name: string, level: number, maxHP: number, attack: number, defense: number, speed?: number): SpiritInstance {
    return new SpiritInstance(id, `spirit_${id}`, name, 'neutral', level, 0, attack, defense, speed || 10, maxHP);
  }

  static calculateLevelModifier(attackerLevel: number, defenderLevel: number): number {
    const levelDifference = attackerLevel - defenderLevel;
    if (levelDifference >= 5) return 1.5;
    if (levelDifference >= 2) return 1.25;
    if (levelDifference <= -5) return 0.75;
    if (levelDifference <= -2) return 0.85;
    return 1.0;
  }

  static calculateCritChance(baseCritRate: number, critBonus: number): number {
    return Math.min(1.0, baseCritRate + critBonus);
  }

  static calculateHitChance(moveAccuracy: number, attackerAccuracy: number, defenderEvasion: number): number {
    return moveAccuracy * attackerAccuracy * (1 - defenderEvasion);
  }

  static getDamageCategoryName(category: MoveCategory): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  static validateCombatant(combatant: Partial<ICombatant>): string[] {
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

    if (!combatant.stats) {
      errors.push('Combatant stats are required');
    } else {
      if (combatant.stats.maxHp <= 0) {
        errors.push('Max HP must be greater than 0');
      }
      if (combatant.stats.hp > combatant.stats.maxHp) {
        errors.push('Current HP cannot exceed max HP');
      }
    }

    if (!Array.isArray(combatant.moves)) {
      errors.push('Moves must be an array');
    }

    return errors;
  }

  static validateMoveData(move: Partial<MoveData>): string[] {
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

  static generateCombatSummary(state: CombatState): string {
    const livingCombatants = Object.values(state.combatants).filter(c => !c.status?.ko && !c.status?.fled);
    const koCombatants = Object.values(state.combatants).filter(c => c.status?.ko);

    let summary = `Battle Status: ${livingCombatants.length} combatants remaining`;
    if (koCombatants.length > 0) {
      summary += `, ${koCombatants.length} KO'd`;
    }
    if (state.over) {
      summary += ` - ${state.winnerTeam ? 'VICTORY for ' + state.winnerTeam : 'DRAW'}`;
    }

    return summary;
  }
}
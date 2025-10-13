/**
 * Advanced Combat System
 * 
 * Enhanced combat mechanics with advanced features like
 * combo systems, environmental effects, and tactical positioning.
 */

import { Combatant, MoveData } from './engine';

export interface ComboSystem {
  id: string;
  name: string;
  moves: string[];
  requirements: ComboRequirement[];
  effects: ComboEffect[];
  maxUses: number;
  currentUses: number;
}

export interface ComboRequirement {
  type: 'move_sequence' | 'type_match' | 'stat_threshold' | 'status_effect' | 'custom';
  value: any;
  check: (context: ComboContext) => boolean;
}

export interface ComboEffect {
  type: 'damage_multiplier' | 'stat_boost' | 'status_effect' | 'special_ability' | 'custom';
  magnitude: number;
  duration?: number;
  apply: (context: ComboContext) => void;
}

export interface ComboContext {
  combatant: Combatant;
  move: MoveData;
  previousMoves: MoveData[];
  battleState: any;
  timestamp: number;
}

export interface EnvironmentalEffect {
  id: string;
  name: string;
  type: 'weather' | 'terrain' | 'hazard' | 'benefit' | 'neutral';
  effects: EnvironmentalModifier[];
  duration: number;
  radius?: number;
  position?: { x: number; y: number; z: number };
}

export interface EnvironmentalModifier {
  type: 'damage' | 'accuracy' | 'speed' | 'defense' | 'special' | 'custom';
  magnitude: number;
  targetTypes?: string[];
  condition?: (combatant: Combatant) => boolean;
}

export interface TacticalPosition {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  advantages: TacticalAdvantage[];
  disadvantages: TacticalDisadvantage[];
  movementCost: number;
}

export interface TacticalAdvantage {
  type: 'damage_bonus' | 'accuracy_bonus' | 'defense_bonus' | 'special_ability' | 'custom';
  magnitude: number;
  condition?: (combatant: Combatant) => boolean;
}

export interface TacticalDisadvantage {
  type: 'damage_penalty' | 'accuracy_penalty' | 'defense_penalty' | 'vulnerability' | 'custom';
  magnitude: number;
  condition?: (combatant: Combatant) => boolean;
}

export interface BattlePhase {
  id: string;
  name: string;
  duration: number;
  effects: BattlePhaseEffect[];
  transitions: BattlePhaseTransition[];
}

export interface BattlePhaseEffect {
  type: 'stat_modifier' | 'move_restriction' | 'special_rule' | 'custom';
  magnitude: number;
  target: 'all' | 'player' | 'enemy' | 'specific';
  condition?: (combatant: Combatant) => boolean;
}

export interface BattlePhaseTransition {
  condition: (battleState: any) => boolean;
  nextPhase: string;
  trigger: 'automatic' | 'manual' | 'conditional';
}

export class AdvancedCombat {
  private combos: Map<string, ComboSystem> = new Map();
  private environmentalEffects: Map<string, EnvironmentalEffect> = new Map();
  private tacticalPositions: Map<string, TacticalPosition> = new Map();
  private battlePhases: Map<string, BattlePhase> = new Map();
  private activePhase: string | null = null;
  private phaseStartTime: number = 0;

  constructor() {
    this.initializeDefaultCombos();
    this.initializeDefaultEnvironmentalEffects();
    this.initializeDefaultTacticalPositions();
    this.initializeDefaultBattlePhases();
  }

  /**
   * Create a new combo system
   */
  createCombo(combo: ComboSystem): void {
    this.combos.set(combo.id, combo);
  }

  /**
   * Check if a combo can be executed
   */
  canExecuteCombo(comboId: string, context: ComboContext): boolean {
    const combo = this.combos.get(comboId);
    if (!combo) return false;

    if (combo.currentUses >= combo.maxUses) return false;

    // Check all requirements
    return combo.requirements.every(req => req.check(context));
  }

  /**
   * Execute a combo
   */
  executeCombo(comboId: string, context: ComboContext): ComboEffect[] {
    const combo = this.combos.get(comboId);
    if (!combo) {
      throw new Error(`Combo ${comboId} not found`);
    }

    if (!this.canExecuteCombo(comboId, context)) {
      throw new Error(`Combo ${comboId} cannot be executed`);
    }

    // Apply all combo effects
    const appliedEffects: ComboEffect[] = [];
    for (const effect of combo.effects) {
      effect.apply(context);
      appliedEffects.push(effect);
    }

    // Increment usage count
    combo.currentUses++;

    return appliedEffects;
  }

  /**
   * Create an environmental effect
   */
  createEnvironmentalEffect(effect: EnvironmentalEffect): void {
    this.environmentalEffects.set(effect.id, effect);
  }

  /**
   * Apply environmental effects to combatants
   */
  applyEnvironmentalEffects(combatants: Combatant[]): void {
    for (const [effectId, effect] of this.environmentalEffects) {
      for (const combatant of combatants) {
        if (this.isCombatantInRange(combatant, effect)) {
          for (const modifier of effect.effects) {
            if (!modifier.condition || modifier.condition(combatant)) {
              this.applyEnvironmentalModifier(combatant, modifier);
            }
          }
        }
      }
    }
  }

  /**
   * Create a tactical position
   */
  createTacticalPosition(position: TacticalPosition): void {
    this.tacticalPositions.set(position.id, position);
  }

  /**
   * Move combatant to tactical position
   */
  moveToTacticalPosition(combatant: Combatant, positionId: string): boolean {
    const position = this.tacticalPositions.get(positionId);
    if (!position) return false;

    // Check if combatant can afford the movement cost
    if (combatant.stats.hp < position.movementCost) return false;

    // Deduct movement cost
    combatant.stats.hp -= position.movementCost;

    // Update combatant position
    combatant.position = position.position;

    // Apply position advantages
    for (const advantage of position.advantages) {
      if (!advantage.condition || advantage.condition(combatant)) {
        this.applyTacticalAdvantage(combatant, advantage);
      }
    }

    // Apply position disadvantages
    for (const disadvantage of position.disadvantages) {
      if (!disadvantage.condition || disadvantage.condition(combatant)) {
        this.applyTacticalDisadvantage(combatant, disadvantage);
      }
    }

    return true;
  }

  /**
   * Create a battle phase
   */
  createBattlePhase(phase: BattlePhase): void {
    this.battlePhases.set(phase.id, phase);
  }

  /**
   * Start a battle phase
   */
  startBattlePhase(phaseId: string): void {
    const phase = this.battlePhases.get(phaseId);
    if (!phase) {
      throw new Error(`Battle phase ${phaseId} not found`);
    }

    this.activePhase = phaseId;
    this.phaseStartTime = Date.now();
  }

  /**
   * Update battle phase
   */
  updateBattlePhase(combatants: Combatant[]): string | null {
    if (!this.activePhase) return null;

    const phase = this.battlePhases.get(this.activePhase);
    if (!phase) return null;

    // Check for phase transitions
    for (const transition of phase.transitions) {
      if (transition.condition({ combatants, phase: this.activePhase, time: Date.now() - this.phaseStartTime })) {
        if (transition.trigger === 'automatic') {
          this.startBattlePhase(transition.nextPhase);
          return transition.nextPhase;
        }
      }
    }

    // Check if phase duration has expired
    if (Date.now() - this.phaseStartTime >= phase.duration) {
      // Find next phase or end battle
      const nextPhase = this.findNextPhase();
      if (nextPhase) {
        this.startBattlePhase(nextPhase);
        return nextPhase;
      } else {
        this.activePhase = null;
        return null;
      }
    }

    return this.activePhase;
  }

  /**
   * Apply battle phase effects
   */
  applyBattlePhaseEffects(combatants: Combatant[]): void {
    if (!this.activePhase) return;

    const phase = this.battlePhases.get(this.activePhase);
    if (!phase) return;

    for (const effect of phase.effects) {
      for (const combatant of combatants) {
        if (this.shouldApplyPhaseEffect(combatant, effect)) {
          this.applyPhaseEffect(combatant, effect);
        }
      }
    }
  }

  /**
   * Check if combatant is in range of environmental effect
   */
  private isCombatantInRange(combatant: Combatant, effect: EnvironmentalEffect): boolean {
    if (!effect.radius || !effect.position || !combatant.position) return true;

    const distance = Math.sqrt(
      Math.pow(combatant.position.x - effect.position.x, 2) +
      Math.pow(combatant.position.y - effect.position.y, 2) +
      Math.pow((combatant.position.z || 0) - (effect.position.z || 0), 2)
    );

    return distance <= effect.radius;
  }

  /**
   * Apply environmental modifier to combatant
   */
  private applyEnvironmentalModifier(combatant: Combatant, modifier: EnvironmentalModifier): void {
    switch (modifier.type) {
      case 'damage':
        combatant.stats.atk += modifier.magnitude;
        break;
      case 'accuracy':
        combatant.stats.spd += modifier.magnitude;
        break;
      case 'speed':
        combatant.stats.spd += modifier.magnitude;
        break;
      case 'defense':
        combatant.stats.def += modifier.magnitude;
        break;
      case 'special':
        if (combatant.stats.specialAtk !== undefined) {
          combatant.stats.specialAtk += modifier.magnitude;
        }
        if (combatant.stats.specialDef !== undefined) {
          combatant.stats.specialDef += modifier.magnitude;
        }
        break;
    }
  }

  /**
   * Apply tactical advantage to combatant
   */
  private applyTacticalAdvantage(combatant: Combatant, advantage: TacticalAdvantage): void {
    switch (advantage.type) {
      case 'damage_bonus':
        combatant.stats.atk += advantage.magnitude;
        break;
      case 'accuracy_bonus':
        combatant.stats.spd += advantage.magnitude;
        break;
      case 'defense_bonus':
        combatant.stats.def += advantage.magnitude;
        break;
    }
  }

  /**
   * Apply tactical disadvantage to combatant
   */
  private applyTacticalDisadvantage(combatant: Combatant, disadvantage: TacticalDisadvantage): void {
    switch (disadvantage.type) {
      case 'damage_penalty':
        combatant.stats.atk -= disadvantage.magnitude;
        break;
      case 'accuracy_penalty':
        combatant.stats.spd -= disadvantage.magnitude;
        break;
      case 'defense_penalty':
        combatant.stats.def -= disadvantage.magnitude;
        break;
    }
  }

  /**
   * Check if phase effect should be applied
   */
  private shouldApplyPhaseEffect(combatant: Combatant, effect: BattlePhaseEffect): boolean {
    switch (effect.target) {
      case 'all':
        return true;
      case 'player':
        return combatant.metadata?.type === 'player';
      case 'enemy':
        return combatant.metadata?.type === 'enemy';
      case 'specific':
        return effect.condition ? effect.condition(combatant) : false;
      default:
        return false;
    }
  }

  /**
   * Apply phase effect to combatant
   */
  private applyPhaseEffect(combatant: Combatant, effect: BattlePhaseEffect): void {
    switch (effect.type) {
      case 'stat_modifier':
        combatant.stats.atk += effect.magnitude;
        combatant.stats.def += effect.magnitude;
        combatant.stats.spd += effect.magnitude;
        break;
      case 'move_restriction':
        // This would restrict certain moves
        break;
      case 'special_rule':
        // This would apply special battle rules
        break;
    }
  }

  /**
   * Find next battle phase
   */
  private findNextPhase(): string | null {
    // Simple implementation - find the next phase alphabetically
    const phases = Array.from(this.battlePhases.keys()).sort();
    const currentIndex = phases.indexOf(this.activePhase || '');
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }

  /**
   * Initialize default combos
   */
  private initializeDefaultCombos(): void {
    // Fire combo
    this.createCombo({
      id: 'fire_combo',
      name: 'Fire Combo',
      moves: ['ember', 'flame_thrower', 'fire_blast'],
      requirements: [
        {
          type: 'move_sequence',
          value: ['ember', 'flame_thrower', 'fire_blast'],
          check: (context) => {
            const moveSequence = context.previousMoves.map(m => m.moveId);
            return moveSequence.length >= 3 && 
                   moveSequence[0] === 'ember' && 
                   moveSequence[1] === 'flame_thrower' && 
                   moveSequence[2] === 'fire_blast';
          }
        }
      ],
      effects: [
        {
          type: 'damage_multiplier',
          magnitude: 2.0,
          apply: (context) => {
            context.combatant.stats.atk *= 2.0;
          }
        }
      ],
      maxUses: 3,
      currentUses: 0
    });

    // Water combo
    this.createCombo({
      id: 'water_combo',
      name: 'Water Combo',
      moves: ['bubble', 'water_gun', 'hydro_pump'],
      requirements: [
        {
          type: 'move_sequence',
          value: ['bubble', 'water_gun', 'hydro_pump'],
          check: (context) => {
            const moveSequence = context.previousMoves.map(m => m.moveId);
            return moveSequence.length >= 3 && 
                   moveSequence[0] === 'bubble' && 
                   moveSequence[1] === 'water_gun' && 
                   moveSequence[2] === 'hydro_pump';
          }
        }
      ],
      effects: [
        {
          type: 'stat_boost',
          magnitude: 1.5,
          apply: (context) => {
            if (context.combatant.stats.specialAtk !== undefined) {
              context.combatant.stats.specialAtk *= 1.5;
            }
          }
        }
      ],
      maxUses: 2,
      currentUses: 0
    });
  }

  /**
   * Initialize default environmental effects
   */
  private initializeDefaultEnvironmentalEffects(): void {
    // Rain effect
    this.createEnvironmentalEffect({
      id: 'rain',
      name: 'Rain',
      type: 'weather',
      effects: [
        {
          type: 'damage',
          magnitude: 1.2,
          targetTypes: ['water']
        },
        {
          type: 'damage',
          magnitude: 0.8,
          targetTypes: ['fire']
        }
      ],
      duration: 300000, // 5 minutes
      radius: 50
    });

    // Sandstorm effect
    this.createEnvironmentalEffect({
      id: 'sandstorm',
      name: 'Sandstorm',
      type: 'weather',
      effects: [
        {
          type: 'accuracy',
          magnitude: -0.1,
          condition: (combatant) => combatant.type !== 'ground' && combatant.type !== 'rock'
        }
      ],
      duration: 300000,
      radius: 30
    });
  }

  /**
   * Initialize default tactical positions
   */
  private initializeDefaultTacticalPositions(): void {
    // High ground position
    this.createTacticalPosition({
      id: 'high_ground',
      name: 'High Ground',
      position: { x: 0, y: 10, z: 0 },
      advantages: [
        {
          type: 'damage_bonus',
          magnitude: 1.2
        },
        {
          type: 'accuracy_bonus',
          magnitude: 1.1
        }
      ],
      disadvantages: [
        {
          type: 'vulnerability',
          magnitude: 1.1
        }
      ],
      movementCost: 20
    });

    // Cover position
    this.createTacticalPosition({
      id: 'cover',
      name: 'Cover',
      position: { x: -5, y: 0, z: 0 },
      advantages: [
        {
          type: 'defense_bonus',
          magnitude: 1.3
        }
      ],
      disadvantages: [
        {
          type: 'accuracy_penalty',
          magnitude: 0.9
        }
      ],
      movementCost: 15
    });
  }

  /**
   * Initialize default battle phases
   */
  private initializeDefaultBattlePhases(): void {
    // Opening phase
    this.createBattlePhase({
      id: 'opening',
      name: 'Opening Phase',
      duration: 30000, // 30 seconds
      effects: [
        {
          type: 'stat_modifier',
          magnitude: 1.1,
          target: 'all'
        }
      ],
      transitions: [
        {
          condition: (battleState) => battleState.time >= 30000,
          nextPhase: 'main',
          trigger: 'automatic'
        }
      ]
    });

    // Main phase
    this.createBattlePhase({
      id: 'main',
      name: 'Main Phase',
      duration: 120000, // 2 minutes
      effects: [],
      transitions: [
        {
          condition: (battleState) => battleState.time >= 120000,
          nextPhase: 'climax',
          trigger: 'automatic'
        }
      ]
    });

    // Climax phase
    this.createBattlePhase({
      id: 'climax',
      name: 'Climax Phase',
      duration: 60000, // 1 minute
      effects: [
        {
          type: 'stat_modifier',
          magnitude: 1.5,
          target: 'all'
        }
      ],
      transitions: []
    });
  }

  /**
   * Get combo system
   */
  getCombo(comboId: string): ComboSystem | null {
    return this.combos.get(comboId) || null;
  }

  /**
   * Get all combos
   */
  getAllCombos(): ComboSystem[] {
    return Array.from(this.combos.values());
  }

  /**
   * Get environmental effect
   */
  getEnvironmentalEffect(effectId: string): EnvironmentalEffect | null {
    return this.environmentalEffects.get(effectId) || null;
  }

  /**
   * Get tactical position
   */
  getTacticalPosition(positionId: string): TacticalPosition | null {
    return this.tacticalPositions.get(positionId) || null;
  }

  /**
   * Get battle phase
   */
  getBattlePhase(phaseId: string): BattlePhase | null {
    return this.battlePhases.get(phaseId) || null;
  }

  /**
   * Get current battle phase
   */
  getCurrentBattlePhase(): string | null {
    return this.activePhase;
  }

  /**
   * Get advanced combat statistics
   */
  getAdvancedCombatStatistics(): any {
    return {
      combos: this.combos.size,
      environmentalEffects: this.environmentalEffects.size,
      tacticalPositions: this.tacticalPositions.size,
      battlePhases: this.battlePhases.size,
      activePhase: this.activePhase,
      phaseTime: this.activePhase ? Date.now() - this.phaseStartTime : 0
    };
  }
}
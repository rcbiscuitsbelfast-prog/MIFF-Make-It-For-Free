/**
 * RhythmBattleSystemPure - Rhythm Boss Battle System for K-Pop Monster Hunter
 * 
 * Manages rhythm-based boss battles with win meter, spirit solos, tone mechanics,
 * and phase transitions. Integrates with RhythmInputPure for input handling.
 * 
 * Features:
 * - Win meter system with decay and fill mechanics
 * - Spirit solo activation and effects
 * - Light vs Shadow tone mechanics
 * - Multi-phase boss battles
 * - Crowd morale system
 * - Boss attack pattern integration
 * 
 * @module RhythmBattleSystemPure
 * @version 1.0.0
 * @license MIT
 */

import { RhythmAccuracy, IRhythmInputResult } from '../RhythmInputPure/index';

/**
 * Battle tone types
 */
export enum BattleTone {
  LIGHT = 'light',
  SHADOW = 'shadow',
  NEUTRAL = 'neutral'
}

/**
 * Boss phase state
 */
export enum BossPhaseState {
  IDLE = 'idle',
  ATTACKING = 'attacking',
  VULNERABLE = 'vulnerable',
  TRANSITIONING = 'transitioning',
  DEFEATED = 'defeated'
}

/**
 * Spirit solo effect types
 */
export enum SoloEffectType {
  BOOST_WIN_METER = 'boost_win_meter',
  INTERRUPT_BOSS = 'interrupt_boss',
  FLIP_TONE = 'flip_tone',
  HEAL_SPIRIT = 'heal_spirit',
  DAMAGE_BOSS = 'damage_boss'
}

/**
 * Boss attack pattern
 */
export interface IBossAttackPattern {
  id: string;
  name: string;
  tone: BattleTone;
  damage: number;
  duration: number; // ms
  vulnerabilityWindow: number; // ms window for counter
  interruptible: boolean;
}

/**
 * Spirit solo configuration
 */
export interface ISpiritSolo {
  spiritId: string;
  spiritName: string;
  soloType: 'drum' | 'rap' | 'synth' | 'vocal';
  duration: number; // ms
  effects: Array<{
    type: SoloEffectType;
    value: number;
  }>;
  cooldown: number; // ms
}

/**
 * Boss phase configuration
 */
export interface IBossPhase {
  phaseNumber: number;
  maxHP: number;
  currentHP: number;
  attackPattern: IBossAttackPattern[];
  tone: BattleTone;
  rhythmDifficulty: 'casual' | 'standard' | 'expert';
  winMeterDecayRate: number; // points per second
  requiredWinMeter: number; // to defeat phase
}

/**
 * Rhythm battle configuration
 */
export interface IRhythmBattleConfig {
  bossId: string;
  bossName: string;
  phases: IBossPhase[];
  playerVoice: 'male' | 'female';
  availableSolos: ISpiritSolo[];
  crowdMoraleEnabled: boolean;
  beatMapId: string;
}

/**
 * Rhythm Battle State
 */
export interface IRhythmBattleState {
  currentPhase: number;
  winMeter: number;
  maxWinMeter: number;
  combo: number;
  totalScore: number;
  crowdMorale: number; // 0-100
  activeTone: BattleTone;
  bossState: BossPhaseState;
  timeElapsed: number; // ms
  spiritSoloCooldowns: Map<string, number>;
}

/**
 * Battle result
 */
export interface IRhythmBattleResult {
  victory: boolean;
  finalScore: number;
  accuracy: number;
  maxCombo: number;
  phasesCompleted: number;
  solosUsed: number;
  timeElapsed: number;
}

/**
 * Rhythm Battle Manager
 */
export class RhythmBattleManager {
  private config: IRhythmBattleConfig;
  private state: IRhythmBattleState;
  private isActive: boolean = false;
  private startTime: number = 0;

  // Win meter settings
  private readonly PERFECT_WIN_METER_GAIN = 10;
  private readonly GOOD_WIN_METER_GAIN = 5;
  private readonly MISS_WIN_METER_LOSS = 5;
  private readonly COMBO_MULTIPLIER_THRESHOLD = 10;
  private readonly COMBO_MULTIPLIER = 1.5;

  // Crowd morale settings
  private readonly CROWD_MORALE_PERFECT_GAIN = 2;
  private readonly CROWD_MORALE_MISS_LOSS = 5;
  private readonly CROWD_MORALE_BOOST_THRESHOLD = 75;
  private readonly CROWD_MORALE_WIN_METER_BOOST = 1.2;

  constructor(config: IRhythmBattleConfig) {
    this.config = config;
    this.state = this.initializeState();
  }

  /**
   * Initialize battle state
   */
  private initializeState(): IRhythmBattleState {
    return {
      currentPhase: 0,
      winMeter: 0,
      maxWinMeter: 100,
      combo: 0,
      totalScore: 0,
      crowdMorale: 50,
      activeTone: this.config.phases[0]?.tone || BattleTone.NEUTRAL,
      bossState: BossPhaseState.IDLE,
      timeElapsed: 0,
      spiritSoloCooldowns: new Map()
    };
  }

  /**
   * Start rhythm battle
   */
  start(): void {
    this.isActive = true;
    this.startTime = Date.now();
    this.state = this.initializeState();
    this.state.bossState = BossPhaseState.ATTACKING;
  }

  /**
   * Stop rhythm battle
   */
  stop(): void {
    this.isActive = false;
  }

  /**
   * Update battle state (call each frame)
   */
  update(deltaTime: number): void {
    if (!this.isActive) return;

    this.state.timeElapsed += deltaTime;

    // Apply win meter decay
    const currentPhase = this.getCurrentPhase();
    if (currentPhase) {
      const decayAmount = (currentPhase.winMeterDecayRate * deltaTime) / 1000;
      this.state.winMeter = Math.max(0, this.state.winMeter - decayAmount);
    }

    // Update spirit solo cooldowns
    const cooldownEntries = Array.from(this.state.spiritSoloCooldowns.entries());
    for (const [spiritId, cooldown] of cooldownEntries) {
      const newCooldown = cooldown - deltaTime;
      if (newCooldown <= 0) {
        this.state.spiritSoloCooldowns.delete(spiritId);
      } else {
        this.state.spiritSoloCooldowns.set(spiritId, newCooldown);
      }
    }

    // Check for phase transition
    if (this.state.winMeter >= currentPhase.requiredWinMeter) {
      this.transitionToNextPhase();
    }
  }

  /**
   * Process rhythm input result
   */
  processInput(inputResult: IRhythmInputResult): void {
    if (!this.isActive) return;

    let winMeterGain = 0;
    let crowdMoraleChange = 0;

    switch (inputResult.accuracy) {
      case RhythmAccuracy.PERFECT:
        winMeterGain = this.PERFECT_WIN_METER_GAIN;
        crowdMoraleChange = this.CROWD_MORALE_PERFECT_GAIN;
        this.state.combo++;
        break;
      
      case RhythmAccuracy.GOOD:
        winMeterGain = this.GOOD_WIN_METER_GAIN;
        crowdMoraleChange = 1;
        this.state.combo++;
        break;
      
      case RhythmAccuracy.MISS:
        winMeterGain = -this.MISS_WIN_METER_LOSS;
        crowdMoraleChange = -this.CROWD_MORALE_MISS_LOSS;
        this.state.combo = 0;
        break;
    }

    // Apply combo multiplier
    if (this.state.combo >= this.COMBO_MULTIPLIER_THRESHOLD) {
      winMeterGain = Math.floor(winMeterGain * this.COMBO_MULTIPLIER);
    }

    // Apply crowd morale boost
    if (this.config.crowdMoraleEnabled && this.state.crowdMorale >= this.CROWD_MORALE_BOOST_THRESHOLD) {
      winMeterGain = Math.floor(winMeterGain * this.CROWD_MORALE_WIN_METER_BOOST);
    }

    // Update win meter
    this.state.winMeter = Math.max(0, Math.min(this.state.maxWinMeter, this.state.winMeter + winMeterGain));

    // Update crowd morale
    this.state.crowdMorale = Math.max(0, Math.min(100, this.state.crowdMorale + crowdMoraleChange));

    // Update score
    this.state.totalScore += inputResult.score;
  }

  /**
   * Activate spirit solo
   */
  activateSpiritSolo(spiritId: string): boolean {
    if (!this.isActive) return false;

    // Check cooldown
    if (this.state.spiritSoloCooldowns.has(spiritId)) {
      return false;
    }

    // Find solo configuration
    const solo = this.config.availableSolos.find(s => s.spiritId === spiritId);
    if (!solo) return false;

    // Apply solo effects
    for (const effect of solo.effects) {
      this.applySoloEffect(effect.type, effect.value);
    }

    // Set cooldown
    this.state.spiritSoloCooldowns.set(spiritId, solo.cooldown);

    return true;
  }

  /**
   * Apply spirit solo effect
   */
  private applySoloEffect(type: SoloEffectType, value: number): void {
    switch (type) {
      case SoloEffectType.BOOST_WIN_METER:
        this.state.winMeter = Math.min(this.state.maxWinMeter, this.state.winMeter + value);
        break;
      
      case SoloEffectType.INTERRUPT_BOSS:
        this.state.bossState = BossPhaseState.VULNERABLE;
        setTimeout(() => {
          if (this.state.bossState === BossPhaseState.VULNERABLE) {
            this.state.bossState = BossPhaseState.ATTACKING;
          }
        }, value);
        break;
      
      case SoloEffectType.FLIP_TONE:
        this.state.activeTone = this.state.activeTone === BattleTone.LIGHT 
          ? BattleTone.SHADOW 
          : BattleTone.LIGHT;
        break;
      
      case SoloEffectType.DAMAGE_BOSS:
        const currentPhase = this.getCurrentPhase();
        if (currentPhase) {
          currentPhase.currentHP = Math.max(0, currentPhase.currentHP - value);
        }
        break;
      
      case SoloEffectType.HEAL_SPIRIT:
        // Would integrate with spirit HP system
        break;
    }
  }

  /**
   * Transition to next phase
   */
  private transitionToNextPhase(): void {
    if (this.state.currentPhase >= this.config.phases.length - 1) {
      // Battle won!
      this.state.bossState = BossPhaseState.DEFEATED;
      this.isActive = false;
      return;
    }

    this.state.currentPhase++;
    this.state.winMeter = 0; // Reset win meter for new phase
    this.state.bossState = BossPhaseState.TRANSITIONING;
    this.state.activeTone = this.config.phases[this.state.currentPhase].tone;

    // Transition animation delay
    setTimeout(() => {
      this.state.bossState = BossPhaseState.ATTACKING;
    }, 2000);
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): IBossPhase {
    return this.config.phases[this.state.currentPhase];
  }

  /**
   * Get battle state
   */
  getState(): IRhythmBattleState {
    return { ...this.state };
  }

  /**
   * Get battle config
   */
  getConfig(): IRhythmBattleConfig {
    return this.config;
  }

  /**
   * Check if battle is active
   */
  isActiveBattle(): boolean {
    return this.isActive;
  }

  /**
   * Check if battle is won
   */
  isVictory(): boolean {
    return this.state.bossState === BossPhaseState.DEFEATED;
  }

  /**
   * Get battle result
   */
  getBattleResult(): IRhythmBattleResult {
    return {
      victory: this.isVictory(),
      finalScore: this.state.totalScore,
      accuracy: 0, // Would calculate from input results
      maxCombo: this.state.combo,
      phasesCompleted: this.state.currentPhase + (this.isVictory() ? 1 : 0),
      solosUsed: this.config.availableSolos.length - this.state.spiritSoloCooldowns.size,
      timeElapsed: this.state.timeElapsed
    };
  }

  /**
   * Get spirit solo cooldown remaining
   */
  getSoloCooldown(spiritId: string): number {
    return this.state.spiritSoloCooldowns.get(spiritId) || 0;
  }

  /**
   * Check if spirit solo is available
   */
  isSoloAvailable(spiritId: string): boolean {
    return !this.state.spiritSoloCooldowns.has(spiritId);
  }
}

/**
 * Battle Configuration Builder
 */
export class RhythmBattleConfigBuilder {
  private config: Partial<IRhythmBattleConfig> = {
    phases: [],
    availableSolos: [],
    crowdMoraleEnabled: true
  };

  setBoss(id: string, name: string): this {
    this.config.bossId = id;
    this.config.bossName = name;
    return this;
  }

  setPlayerVoice(voice: 'male' | 'female'): this {
    this.config.playerVoice = voice;
    return this;
  }

  setBeatMap(beatMapId: string): this {
    this.config.beatMapId = beatMapId;
    return this;
  }

  addPhase(phase: IBossPhase): this {
    this.config.phases!.push(phase);
    return this;
  }

  addSpiritSolo(solo: ISpiritSolo): this {
    this.config.availableSolos!.push(solo);
    return this;
  }

  enableCrowdMorale(enabled: boolean): this {
    this.config.crowdMoraleEnabled = enabled;
    return this;
  }

  build(): IRhythmBattleConfig {
    if (!this.config.bossId || !this.config.bossName || !this.config.playerVoice || 
        !this.config.beatMapId || this.config.phases!.length === 0) {
      throw new Error('Invalid battle configuration: missing required fields');
    }

    return this.config as IRhythmBattleConfig;
  }
}

/**
 * Utility functions
 */
export const RhythmBattleUtils = {
  /**
   * Create simple 1-phase boss battle
   */
  createSimpleBoss(bossId: string, bossName: string, playerVoice: 'male' | 'female'): IRhythmBattleConfig {
    return new RhythmBattleConfigBuilder()
      .setBoss(bossId, bossName)
      .setPlayerVoice(playerVoice)
      .setBeatMap('simple_boss')
      .addPhase({
        phaseNumber: 1,
        maxHP: 100,
        currentHP: 100,
        attackPattern: [],
        tone: BattleTone.SHADOW,
        rhythmDifficulty: 'standard',
        winMeterDecayRate: 2,
        requiredWinMeter: 100
      })
      .build();
  },

  /**
   * Create 3-phase boss battle
   */
  createThreePhaseBoss(bossId: string, bossName: string, playerVoice: 'male' | 'female'): IRhythmBattleConfig {
    const builder = new RhythmBattleConfigBuilder()
      .setBoss(bossId, bossName)
      .setPlayerVoice(playerVoice)
      .setBeatMap('three_phase_boss')
      .enableCrowdMorale(true);

    // Phase 1: Warm-up
    builder.addPhase({
      phaseNumber: 1,
      maxHP: 100,
      currentHP: 100,
      attackPattern: [],
      tone: BattleTone.SHADOW,
      rhythmDifficulty: 'standard',
      winMeterDecayRate: 2,
      requiredWinMeter: 100
    });

    // Phase 2: Intensity increase
    builder.addPhase({
      phaseNumber: 2,
      maxHP: 150,
      currentHP: 150,
      attackPattern: [],
      tone: BattleTone.LIGHT,
      rhythmDifficulty: 'standard',
      winMeterDecayRate: 3,
      requiredWinMeter: 100
    });

    // Phase 3: Final showdown
    builder.addPhase({
      phaseNumber: 3,
      maxHP: 200,
      currentHP: 200,
      attackPattern: [],
      tone: BattleTone.SHADOW,
      rhythmDifficulty: 'expert',
      winMeterDecayRate: 4,
      requiredWinMeter: 100
    });

    return builder.build();
  },

  /**
   * Create spirit solo configuration
   */
  createDrumSolo(spiritId: string, spiritName: string): ISpiritSolo {
    return {
      spiritId,
      spiritName,
      soloType: 'drum',
      duration: 3000,
      effects: [
        { type: SoloEffectType.BOOST_WIN_METER, value: 20 },
        { type: SoloEffectType.INTERRUPT_BOSS, value: 2000 }
      ],
      cooldown: 30000 // 30 seconds
    };
  },

  createRapSolo(spiritId: string, spiritName: string): ISpiritSolo {
    return {
      spiritId,
      spiritName,
      soloType: 'rap',
      duration: 4000,
      effects: [
        { type: SoloEffectType.BOOST_WIN_METER, value: 25 },
        { type: SoloEffectType.DAMAGE_BOSS, value: 50 }
      ],
      cooldown: 35000
    };
  },

  createSynthSolo(spiritId: string, spiritName: string): ISpiritSolo {
    return {
      spiritId,
      spiritName,
      soloType: 'synth',
      duration: 3500,
      effects: [
        { type: SoloEffectType.FLIP_TONE, value: 0 },
        { type: SoloEffectType.BOOST_WIN_METER, value: 15 }
      ],
      cooldown: 40000
    };
  }
};

export default RhythmBattleManager;

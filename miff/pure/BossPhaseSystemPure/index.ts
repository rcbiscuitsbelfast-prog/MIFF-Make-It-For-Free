/**
 * BossPhaseSystemPure - Boss Phase Management for K-Pop Monster Hunter
 * 
 * Manages multi-phase boss battles including HP bars, attack patterns,
 * phase transitions, vulnerability windows, and rhythm integration.
 * 
 * Features:
 * - Multi-phase boss battles (3 health bars)
 * - Attack pattern management
 * - Rhythm vulnerability windows
 * - Phase-triggered behavior changes
 * - Boss enrage mechanics
 * - Defeat/capture logic
 * 
 * @module BossPhaseSystemPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Boss phase status
 */
export enum BossPhaseStatus {
  IDLE = 'idle',
  ATTACKING = 'attacking',
  VULNERABLE = 'vulnerable',
  ENRAGED = 'enraged',
  TRANSITIONING = 'transitioning',
  DEFEATED = 'defeated'
}

/**
 * Attack type
 */
export enum AttackType {
  PHYSICAL = 'physical',
  RHYTHM = 'rhythm',
  SPECIAL = 'special',
  AREA = 'area'
}

/**
 * Boss attack interface
 */
export interface IBossAttack {
  id: string;
  name: string;
  type: AttackType;
  damage: number;
  telegraph: number; // ms warning time
  execution: number; // ms attack duration
  cooldown: number; // ms between uses
  vulnerabilityWindow: number; // ms window after attack where boss is vulnerable
  interruptible: boolean;
  rhythmPattern?: string; // beat map ID for rhythm attacks
}

/**
 * Boss phase configuration
 */
export interface IBossPhase {
  phaseNumber: number;
  name: string;
  maxHP: number;
  currentHP: number;
  attacks: IBossAttack[];
  attackFrequency: number; // attacks per minute
  enrageThreshold: number; // HP% where boss enrages
  enraged: boolean;
  rhythmDifficulty: 'casual' | 'standard' | 'expert';
  phaseTransitionTrigger: number; // HP at which phase ends
  phaseTransitionAnimation: string;
}

/**
 * Boss configuration
 */
export interface IBossConfig {
  id: string;
  name: string;
  description: string;
  element: string;
  level: number;
  phases: IBossPhase[];
  capturable: boolean;
  captureRequirement: {
    rhythmAccuracy: number;
    maxPhasesCompleted: number;
  };
  defeatedRewards: {
    experience: number;
    spirits: string[];
    items: string[];
    unlockRegion?: string;
  };
}

/**
 * Boss state
 */
export interface IBossState {
  currentPhase: number;
  currentHP: number;
  maxHP: number;
  totalDamageTaken: number;
  status: BossPhaseStatus;
  activeAttack: IBossAttack | null;
  attackCooldowns: Map<string, number>;
  vulnerabilityTimer: number;
  phaseTransitionTimer: number;
  enraged: boolean;
  timeInBattle: number;
}

/**
 * Boss Phase Manager
 */
export class BossPhaseManager {
  private config: IBossConfig;
  private state: IBossState;
  private isActive: boolean = false;
  private attackQueue: IBossAttack[] = [];

  constructor(config: IBossConfig) {
    this.config = config;
    this.state = this.initializeState();
  }

  /**
   * Initialize boss state
   */
  private initializeState(): IBossState {
    const firstPhase = this.config.phases[0];
    
    return {
      currentPhase: 0,
      currentHP: firstPhase.maxHP,
      maxHP: firstPhase.maxHP,
      totalDamageTaken: 0,
      status: BossPhaseStatus.IDLE,
      activeAttack: null,
      attackCooldowns: new Map(),
      vulnerabilityTimer: 0,
      phaseTransitionTimer: 0,
      enraged: false,
      timeInBattle: 0
    };
  }

  /**
   * Start boss battle
   */
  start(): void {
    this.isActive = true;
    this.state = this.initializeState();
    this.state.status = BossPhaseStatus.ATTACKING;
  }

  /**
   * Stop boss battle
   */
  stop(): void {
    this.isActive = false;
  }

  /**
   * Update boss state (call each frame)
   */
  update(deltaTime: number): void {
    if (!this.isActive) return;

    this.state.timeInBattle += deltaTime;

    // Update vulnerability timer
    if (this.state.vulnerabilityTimer > 0) {
      this.state.vulnerabilityTimer -= deltaTime;
      if (this.state.vulnerabilityTimer <= 0) {
        this.state.status = BossPhaseStatus.ATTACKING;
      }
    }

    // Update phase transition timer
    if (this.state.phaseTransitionTimer > 0) {
      this.state.phaseTransitionTimer -= deltaTime;
      if (this.state.phaseTransitionTimer <= 0) {
        this.completePhaseTransition();
      }
    }

    // Update attack cooldowns
    const cooldownEntries = Array.from(this.state.attackCooldowns.entries());
    for (const [attackId, cooldown] of cooldownEntries) {
      const newCooldown = cooldown - deltaTime;
      if (newCooldown <= 0) {
        this.state.attackCooldowns.delete(attackId);
      } else {
        this.state.attackCooldowns.set(attackId, newCooldown);
      }
    }

    // Check for enrage
    this.checkEnrage();

    // Execute attacks
    if (this.state.status === BossPhaseStatus.ATTACKING && !this.state.activeAttack) {
      this.selectAndExecuteAttack();
    }
  }

  /**
   * Deal damage to boss
   */
  dealDamage(amount: number): { phaseTransition: boolean; defeated: boolean } {
    if (!this.isActive) {
      return { phaseTransition: false, defeated: false };
    }

    this.state.currentHP = Math.max(0, this.state.currentHP - amount);
    this.state.totalDamageTaken += amount;

    const currentPhase = this.getCurrentPhase();

    // Check for defeat
    if (this.state.currentHP === 0 && this.state.currentPhase >= this.config.phases.length - 1) {
      this.state.status = BossPhaseStatus.DEFEATED;
      this.isActive = false;
      return { phaseTransition: false, defeated: true };
    }

    // Check for phase transition
    if (this.state.currentHP <= currentPhase.phaseTransitionTrigger) {
      this.triggerPhaseTransition();
      return { phaseTransition: true, defeated: false };
    }

    return { phaseTransition: false, defeated: false };
  }

  /**
   * Trigger phase transition
   */
  private triggerPhaseTransition(): void {
    if (this.state.currentPhase >= this.config.phases.length - 1) {
      return; // Already at final phase
    }

    this.state.status = BossPhaseStatus.TRANSITIONING;
    this.state.phaseTransitionTimer = 3000; // 3 second transition
    this.state.activeAttack = null;
  }

  /**
   * Complete phase transition
   */
  private completePhaseTransition(): void {
    this.state.currentPhase++;
    const nextPhase = this.getCurrentPhase();
    
    this.state.currentHP = nextPhase.maxHP;
    this.state.maxHP = nextPhase.maxHP;
    this.state.status = BossPhaseStatus.ATTACKING;
    this.state.attackCooldowns.clear();
    this.state.enraged = false;
  }

  /**
   * Check for enrage condition
   */
  private checkEnrage(): void {
    if (this.state.enraged) return;

    const currentPhase = this.getCurrentPhase();
    const hpPercentage = (this.state.currentHP / this.state.maxHP) * 100;

    if (hpPercentage <= currentPhase.enrageThreshold) {
      this.state.enraged = true;
      this.state.status = BossPhaseStatus.ENRAGED;
      currentPhase.enraged = true;
      
      // Increase attack frequency when enraged
      currentPhase.attackFrequency *= 1.5;
    }
  }

  /**
   * Select and execute attack
   */
  private selectAndExecuteAttack(): void {
    const currentPhase = this.getCurrentPhase();
    const availableAttacks = currentPhase.attacks.filter(
      attack => !this.state.attackCooldowns.has(attack.id)
    );

    if (availableAttacks.length === 0) return;

    // Randomly select attack (weighted by enrage state)
    const attack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
    
    this.executeAttack(attack);
  }

  /**
   * Execute attack
   */
  private executeAttack(attack: IBossAttack): void {
    this.state.activeAttack = attack;
    this.state.attackCooldowns.set(attack.id, attack.cooldown);

    // After attack execution, enter vulnerability window
    setTimeout(() => {
      this.state.activeAttack = null;
      if (attack.vulnerabilityWindow > 0) {
        this.state.status = BossPhaseStatus.VULNERABLE;
        this.state.vulnerabilityTimer = attack.vulnerabilityWindow;
      }
    }, attack.telegraph + attack.execution);
  }

  /**
   * Interrupt current attack
   */
  interruptAttack(): boolean {
    if (!this.state.activeAttack) return false;
    if (!this.state.activeAttack.interruptible) return false;

    this.state.activeAttack = null;
    this.state.status = BossPhaseStatus.VULNERABLE;
    this.state.vulnerabilityTimer = 2000; // 2 second vulnerability
    
    return true;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): IBossPhase {
    return this.config.phases[this.state.currentPhase];
  }

  /**
   * Get boss state
   */
  getState(): IBossState {
    return { ...this.state };
  }

  /**
   * Get boss config
   */
  getConfig(): IBossConfig {
    return this.config;
  }

  /**
   * Check if boss is defeated
   */
  isDefeated(): boolean {
    return this.state.status === BossPhaseStatus.DEFEATED;
  }

  /**
   * Check if boss is vulnerable
   */
  isVulnerable(): boolean {
    return this.state.status === BossPhaseStatus.VULNERABLE;
  }

  /**
   * Check if boss is enraged
   */
  isEnraged(): boolean {
    return this.state.enraged;
  }

  /**
   * Get HP percentage
   */
  getHPPercentage(): number {
    return (this.state.currentHP / this.state.maxHP) * 100;
  }

  /**
   * Get phase count
   */
  getPhaseCount(): number {
    return this.config.phases.length;
  }

  /**
   * Get current phase number
   */
  getCurrentPhaseNumber(): number {
    return this.state.currentPhase + 1;
  }

  /**
   * Check if boss can be captured
   */
  canCapture(rhythmAccuracy: number): boolean {
    if (!this.config.capturable) return false;
    if (this.state.currentPhase + 1 > this.config.captureRequirement.maxPhasesCompleted) return false;
    if (rhythmAccuracy < this.config.captureRequirement.rhythmAccuracy) return false;

    return true;
  }
}

/**
 * Boss Builder
 */
export class BossBuilder {
  private config: Partial<IBossConfig> = {
    phases: [],
    capturable: false
  };

  setId(id: string): this {
    this.config.id = id;
    return this;
  }

  setName(name: string): this {
    this.config.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  setElement(element: string): this {
    this.config.element = element;
    return this;
  }

  setLevel(level: number): this {
    this.config.level = level;
    return this;
  }

  addPhase(phase: IBossPhase): this {
    this.config.phases!.push(phase);
    return this;
  }

  setCapturable(capturable: boolean, requirement?: { rhythmAccuracy: number; maxPhasesCompleted: number }): this {
    this.config.capturable = capturable;
    if (requirement) {
      this.config.captureRequirement = requirement;
    }
    return this;
  }

  setRewards(rewards: IBossConfig['defeatedRewards']): this {
    this.config.defeatedRewards = rewards;
    return this;
  }

  build(): IBossConfig {
    if (!this.config.id || !this.config.name || !this.config.description || 
        !this.config.element || this.config.level === undefined || 
        this.config.phases!.length === 0 || !this.config.defeatedRewards) {
      throw new Error('Invalid boss configuration: missing required fields');
    }

    return this.config as IBossConfig;
  }
}

/**
 * Utility functions
 */
export const BossPhaseUtils = {
  /**
   * Create simple single-phase boss
   */
  createSimpleBoss(id: string, name: string, element: string, level: number): IBossConfig {
    return new BossBuilder()
      .setId(id)
      .setName(name)
      .setDescription(`A simple ${element} boss`)
      .setElement(element)
      .setLevel(level)
      .addPhase({
        phaseNumber: 1,
        name: 'Phase 1',
        maxHP: 100,
        currentHP: 100,
        attacks: [
          {
            id: 'basic_attack',
            name: 'Basic Attack',
            type: AttackType.PHYSICAL,
            damage: 20,
            telegraph: 500,
            execution: 1000,
            cooldown: 3000,
            vulnerabilityWindow: 1000,
            interruptible: false
          }
        ],
        attackFrequency: 20,
        enrageThreshold: 25,
        enraged: false,
        rhythmDifficulty: 'standard',
        phaseTransitionTrigger: 0,
        phaseTransitionAnimation: 'none'
      })
      .setCapturable(false)
      .setRewards({
        experience: 500,
        spirits: [],
        items: ['potion']
      })
      .build();
  },

  /**
   * Create three-phase boss
   */
  createThreePhaseBoss(id: string, name: string, element: string, level: number): IBossConfig {
    const builder = new BossBuilder()
      .setId(id)
      .setName(name)
      .setDescription(`A powerful three-phase ${element} boss`)
      .setElement(element)
      .setLevel(level);

    // Phase 1
    builder.addPhase({
      phaseNumber: 1,
      name: 'Awakening',
      maxHP: 100,
      currentHP: 100,
      attacks: [
        {
          id: 'phase1_attack1',
          name: 'Basic Strike',
          type: AttackType.PHYSICAL,
          damage: 25,
          telegraph: 500,
          execution: 1000,
          cooldown: 3000,
          vulnerabilityWindow: 1500,
          interruptible: false
        }
      ],
      attackFrequency: 20,
      enrageThreshold: 30,
      enraged: false,
      rhythmDifficulty: 'standard',
      phaseTransitionTrigger: 0,
      phaseTransitionAnimation: 'phase1_to_2'
    });

    // Phase 2
    builder.addPhase({
      phaseNumber: 2,
      name: 'Empowered',
      maxHP: 150,
      currentHP: 150,
      attacks: [
        {
          id: 'phase2_attack1',
          name: 'Empowered Strike',
          type: AttackType.PHYSICAL,
          damage: 35,
          telegraph: 750,
          execution: 1200,
          cooldown: 3500,
          vulnerabilityWindow: 1200,
          interruptible: true
        },
        {
          id: 'phase2_rhythm',
          name: 'Rhythm Barrage',
          type: AttackType.RHYTHM,
          damage: 40,
          telegraph: 1000,
          execution: 3000,
          cooldown: 8000,
          vulnerabilityWindow: 2000,
          interruptible: true,
          rhythmPattern: 'boss_phase2_pattern'
        }
      ],
      attackFrequency: 25,
      enrageThreshold: 25,
      enraged: false,
      rhythmDifficulty: 'standard',
      phaseTransitionTrigger: 0,
      phaseTransitionAnimation: 'phase2_to_3'
    });

    // Phase 3 (Final)
    builder.addPhase({
      phaseNumber: 3,
      name: 'Final Form',
      maxHP: 200,
      currentHP: 200,
      attacks: [
        {
          id: 'phase3_attack1',
          name: 'Ultimate Strike',
          type: AttackType.SPECIAL,
          damage: 50,
          telegraph: 1000,
          execution: 1500,
          cooldown: 4000,
          vulnerabilityWindow: 1000,
          interruptible: false
        },
        {
          id: 'phase3_area',
          name: 'Area Devastation',
          type: AttackType.AREA,
          damage: 60,
          telegraph: 1500,
          execution: 2000,
          cooldown: 10000,
          vulnerabilityWindow: 2500,
          interruptible: true,
          rhythmPattern: 'boss_phase3_ultimate'
        }
      ],
      attackFrequency: 30,
      enrageThreshold: 20,
      enraged: false,
      rhythmDifficulty: 'expert',
      phaseTransitionTrigger: 0,
      phaseTransitionAnimation: 'none'
    });

    builder.setCapturable(true, { rhythmAccuracy: 80, maxPhasesCompleted: 2 })
      .setRewards({
        experience: 2000,
        spirits: [id + '_spirit'],
        items: ['rare_item', 'boss_trophy'],
        unlockRegion: 'next_zone'
      });

    return builder.build();
  },

  /**
   * Create tutorial boss
   */
  createTutorialBoss(): IBossConfig {
    return new BossBuilder()
      .setId('tutorial_boss')
      .setName('Tutorial Boss')
      .setDescription('A simple boss for learning mechanics')
      .setElement('shadow')
      .setLevel(5)
      .addPhase({
        phaseNumber: 1,
        name: 'Tutorial Phase',
        maxHP: 50,
        currentHP: 50,
        attacks: [
          {
            id: 'tutorial_attack',
            name: 'Gentle Strike',
            type: AttackType.PHYSICAL,
            damage: 10,
            telegraph: 1000,
            execution: 1000,
            cooldown: 5000,
            vulnerabilityWindow: 2000,
            interruptible: true
          }
        ],
        attackFrequency: 15,
        enrageThreshold: 50,
        enraged: false,
        rhythmDifficulty: 'casual',
        phaseTransitionTrigger: 0,
        phaseTransitionAnimation: 'none'
      })
      .setCapturable(true, { rhythmAccuracy: 60, maxPhasesCompleted: 1 })
      .setRewards({
        experience: 100,
        spirits: ['tutorial_spirit'],
        items: ['healing_item']
      })
      .build();
  }
};

export default BossPhaseManager;

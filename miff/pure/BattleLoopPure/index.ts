/**
 * BattleLoopPure - Battle Loop Management System
 * 
 * Manages the main battle loop, turn processing, and battle state transitions.
 * Provides a clean interface for battle flow control and event handling.
 */

export interface BattleLoopConfig {
  maxTurns: number;
  timeoutMs: number;
  enableAutoResolve: boolean;
  enableReplay: boolean;
}

export interface BattleState {
  currentTurn: number;
  isActive: boolean;
  isPaused: boolean;
  winner?: string;
  reason?: 'victory' | 'timeout' | 'forfeit';
}

export interface BattleAction {
  actorId: number;
  targetId: number;
  moveId: string;
  priority: number;
  type: 'player' | 'ai' | 'system';
  data?: Record<string, any>;
}

export class BattleAction {
  actorId: number;
  targetId: number;
  moveId: string;
  priority: number;
  type: 'player' | 'ai' | 'system';
  data?: Record<string, any>;

  constructor(options: Partial<BattleAction> = {}) {
    this.actorId = options.actorId || 0;
    this.targetId = options.targetId || 0;
    this.moveId = options.moveId || '';
    this.priority = options.priority || 0;
    this.type = options.type || 'player';
    this.data = options.data || {};
  }

  static player(actorId: number, targetId: number, moveId: string, priority: number = 0): BattleAction {
    return new BattleAction({ actorId, targetId, moveId, priority, type: 'player' });
  }

  static ai(actorId: number, targetId: number, moveId: string, priority: number = 0): BattleAction {
    return new BattleAction({ actorId, targetId, moveId, priority, type: 'ai' });
  }

  static system(actorId: number, targetId: number, moveId: string, priority: number = 0): BattleAction {
    return new BattleAction({ actorId, targetId, moveId, priority, type: 'system' });
  }

  generateSummary(): string {
    return `${this.type} action: ${this.actorId} -> ${this.targetId} (${this.moveId})`;
  }

  clone(): BattleAction {
    return new BattleAction({
      actorId: this.actorId,
      targetId: this.targetId,
      moveId: this.moveId,
      priority: this.priority,
      type: this.type,
      data: { ...this.data }
    });
  }

  toJSON(): Record<string, any> {
    return {
      actorId: this.actorId,
      targetId: this.targetId,
      moveId: this.moveId,
      priority: this.priority,
      type: this.type,
      data: this.data
    };
  }

  static fromJSON(data: Record<string, any>): BattleAction {
    return new BattleAction(data);
  }

  calculateScore(): number {
    return this.priority + (this.data?.damage || 0) + (this.data?.healing || 0);
  }

  compare(other: BattleAction): number {
    if (this.priority !== other.priority) {
      return other.priority - this.priority; // Higher priority first
    }
    return this.actorId - other.actorId; // Lower actor ID first
  }

  validate(): string[] {
    const errors: string[] = [];
    
    if (this.actorId < 0) {
      errors.push('Actor ID must be non-negative');
    }
    
    if (this.targetId < 0) {
      errors.push('Target ID must be non-negative');
    }
    
    if (!this.moveId) {
      errors.push('Move ID is required');
    }
    
    if (this.priority < 0) {
      errors.push('Priority must be non-negative');
    }
    
    if (!['player', 'ai', 'system'].includes(this.type)) {
      errors.push('Invalid action type');
    }
    
    return errors;
  }
}

export interface BattlePhase {
  name: string;
  duration: number;
  order: number;
}

export class BattlePhaseManager {
  private phases: BattlePhase[] = [];
  private currentPhaseIndex: number = 0;

  constructor() {
    this.initializeDefaultPhases();
  }

  private initializeDefaultPhases(): void {
    this.phases = [
      { name: 'preparation', duration: 5000, order: 0 },
      { name: 'action_selection', duration: 10000, order: 1 },
      { name: 'execution', duration: 15000, order: 2 },
      { name: 'resolution', duration: 5000, order: 3 }
    ];
  }

  getCurrentPhase(): BattlePhase {
    return this.phases[this.currentPhaseIndex] || this.phases[0];
  }

  advancePhase(): BattlePhase | null {
    if (this.currentPhaseIndex < this.phases.length - 1) {
      this.currentPhaseIndex++;
      return this.getCurrentPhase();
    }
    return null;
  }

  reset(): void {
    this.currentPhaseIndex = 0;
  }

  addPhase(phase: BattlePhase): void {
    this.phases.push(phase);
    this.phases.sort((a: any, b: any) => a.order - b.order);
  }

  removePhase(phaseName: string): boolean {
    const index = this.phases.findIndex(p => p.name === phaseName);
    if (index !== -1) {
      this.phases.splice(index, 1);
      if (this.currentPhaseIndex >= index) {
        this.currentPhaseIndex = Math.max(0, this.currentPhaseIndex - 1);
      }
      return true;
    }
    return false;
  }

  getPhase(phaseName: string): BattlePhase | undefined {
    return this.phases.find(p => p.name === phaseName);
  }

  getAllPhases(): BattlePhase[] {
    return [...this.phases];
  }
}

export class BattleLoopManager {
  private config: BattleLoopConfig;
  private state: BattleState;
  private startTime: number = 0;

  constructor(config: Partial<BattleLoopConfig> = {}) {
    this.config = {
      maxTurns: 100,
      timeoutMs: 300000, // 5 minutes
      enableAutoResolve: false,
      enableReplay: true,
      ...config
    };
    this.state = {
      currentTurn: 0,
      isActive: false,
      isPaused: false
    };
  }

  /**
   * Start the battle loop
   */
  start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.currentTurn = 0;
    this.startTime = Date.now();
  }

  /**
   * Pause the battle loop
   */
  pause(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume the battle loop
   */
  resume(): void {
    this.state.isPaused = false;
  }

  /**
   * Stop the battle loop
   */
  stop(winner?: string, reason?: 'victory' | 'timeout' | 'forfeit'): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.winner = winner;
    this.state.reason = reason;
  }

  /**
   * Advance to next turn
   */
  nextTurn(): void {
    if (!this.state.isActive || this.state.isPaused) return;
    
    this.state.currentTurn++;
    
    // Check for turn limit
    if (this.state.currentTurn >= this.config.maxTurns) {
      this.stop(undefined, 'timeout');
    }
  }

  /**
   * Check if battle is over
   */
  isOver(): boolean {
    return !this.state.isActive || !!this.state.winner;
  }

  /**
   * Get current battle state
   */
  getState(): BattleState {
    return { ...this.state };
  }

  /**
   * Get battle configuration
   */
  getConfig(): BattleLoopConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BattleLoopConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export default instance
export const defaultBattleLoopManager = new BattleLoopManager();
export { BattleLoopManager as default };

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

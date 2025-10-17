/**
 * TopplerDemo - Demo Game Manager
 * Medieval toppler game demo showcasing MIFF framework capabilities
 */

export interface TopplerDemoConfig {
  difficulty?: 'easy' | 'medium' | 'hard';
  theme?: 'medieval' | 'modern' | 'fantasy';
  enablePhysics?: boolean;
  enableAudio?: boolean;
}

export interface TopplerDemoState {
  score: number;
  level: number;
  lives: number;
  highScore: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export class TopplerDemo {
  private config: TopplerDemoConfig;
  private state: TopplerDemoState;
  private initialized: boolean = false;

  constructor(config: TopplerDemoConfig = {}) {
    this.config = {
      difficulty: config.difficulty || 'medium',
      theme: config.theme || 'medieval',
      enablePhysics: config.enablePhysics !== false,
      enableAudio: config.enableAudio !== false
    };

    this.state = {
      score: 0,
      level: 1,
      lives: 3,
      highScore: 0,
      isPlaying: false,
      isPaused: false
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize game systems
    this.loadAssets();
    this.setupPhysics();
    this.setupAudio();

    this.initialized = true;
  }

  private loadAssets(): void {
    // Asset loading would happen here
    // In a real implementation, this would load sprites, sounds, etc.
  }

  private setupPhysics(): void {
    if (this.config.enablePhysics) {
      // Physics setup would happen here
    }
  }

  private setupAudio(): void {
    if (this.config.enableAudio) {
      // Audio setup would happen here
    }
  }

  start(): void {
    if (!this.initialized) {
      throw new Error('TopplerDemo must be initialized before starting');
    }

    this.state.isPlaying = true;
    this.state.isPaused = false;
  }

  pause(): void {
    this.state.isPaused = true;
  }

  resume(): void {
    this.state.isPaused = false;
  }

  stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
  }

  reset(): void {
    this.state = {
      score: 0,
      level: 1,
      lives: 3,
      highScore: Math.max(this.state.highScore, this.state.score),
      isPlaying: false,
      isPaused: false
    };
  }

  addScore(points: number): void {
    this.state.score += points;
    this.state.highScore = Math.max(this.state.highScore, this.state.score);
  }

  loseLife(): boolean {
    this.state.lives--;
    return this.state.lives > 0;
  }

  nextLevel(): void {
    this.state.level++;
    this.state.lives = Math.min(this.state.lives + 1, 5); // Bonus life, max 5
  }

  getState(): TopplerDemoState {
    return { ...this.state };
  }

  getConfig(): TopplerDemoConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  dispose(): void {
    this.stop();
    this.initialized = false;
  }
}

// Export default for backward compatibility
export default TopplerDemo;

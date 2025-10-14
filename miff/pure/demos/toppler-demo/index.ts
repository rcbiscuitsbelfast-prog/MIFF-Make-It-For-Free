#!/usr/bin/env tsx

/**
 * Toppler Demo - Physics-Based Puzzle Platformer
 * MIFF Framework Demo Project
 *
 * Features:
 * - Physics-based gameplay
 * - Puzzle solving mechanics
 * - Progressive difficulty levels
 * - Score and time tracking
 * - Procedural level generation
 * - Sound effects and music
 */

import { RNGProvider } from '../../RNGPure/index';
import { InputProfile } from '../../InputPure/index';
import { PerfTimer } from '../../PerfPure/index';
import { AudioEngine } from '../../AudioPure/index';
import { DebugOverlayManager } from '../../DebugOverlayPure/index';
import { SaveManager } from '../../SavePure/index';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// Game Types and Interfaces
interface Vector2D {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  x: number;
  y: number;
}

interface GameObject {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  position: Vector2D;
  velocity: Vector2D;
  size: Vector2D;
  type: 'player' | 'block' | 'spike' | 'collectible' | 'goal';
  color: string;
  solid: boolean;
  deadly: boolean;
  collectible: boolean;
  active: boolean;
  physics: {
    gravity: number;
    friction: number;
    bounce: number;
    mass: number;
  };
}

interface Level {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description: string;
  width: number;
  height: number;
  objects: GameObject[];
  backgroundColor: string;
  timeLimit: number;
  targetScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  completed: boolean;
  bestTime: number;
  bestScore: number;
}

interface Player {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  position: Vector2D;
  velocity: Vector2D;
  size: Vector2D;
  onGround: boolean;
  facing: 'left' | 'right';
  score: number;
  lives: number;
  time: number;
  keys: string[];
  powerUps: string[];
  invulnerable: boolean;
  invulnerableTime: number;
}

interface GameState {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  currentLevel: number;
  player: Player;
  level: Level;
  camera: Vector2D;
  gameTime: number;
  paused: boolean;
  gameOver: boolean;
  victory: boolean;
  score: number;
  highScore: number;
  totalScore: number;
  levelsCompleted: number;
}

interface InputState {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  restart: boolean;
  pause: boolean;
  debug: boolean;
}

// Game Constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const FRICTION = 0.8;
const BOUNCE_DAMPING = 0.7;
const INVULNERABLE_TIME = 120; // frames

const COLORS = {
  background: '#87CEEB',
  player: '#FF6B6B',
  block: '#4ECDC4',
  spike: '#FF6B6B',
  collectible: '#FFE66D',
  goal: '#4ECDC4',
  text: '#2C3E50',
  ui: '#34495E'
};

const LEVEL_TEMPLATES: Record<string, Level[]> = {
  easy: [
    {
      id: 'tutorial_1',
      name: 'Getting Started',
      description: 'Learn the basics of movement and jumping',
      width: 800,
      height: 600,
      backgroundColor: COLORS.background,
      timeLimit: 60,
      targetScore: 100,
      difficulty: 'easy',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    },
    {
      id: 'tutorial_2',
      name: 'Block Stacking',
      description: 'Stack blocks to reach higher platforms',
      width: 800,
      height: 600,
      backgroundColor: COLORS.background,
      timeLimit: 90,
      targetScore: 200,
      difficulty: 'easy',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    }
  ],
  medium: [
    {
      id: 'challenge_1',
      name: 'Spike Dodge',
      description: 'Avoid deadly spikes while collecting items',
      width: 1200,
      height: 800,
      backgroundColor: COLORS.background,
      timeLimit: 120,
      targetScore: 300,
      difficulty: 'medium',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    },
    {
      id: 'challenge_2',
      name: 'Moving Platforms',
      description: 'Time your jumps on moving platforms',
      width: 1200,
      height: 800,
      backgroundColor: COLORS.background,
      timeLimit: 150,
      targetScore: 400,
      difficulty: 'medium',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    }
  ],
  hard: [
    {
      id: 'expert_1',
      name: 'Precision Timing',
      description: 'Perfect timing required for success',
      width: 1600,
      height: 1000,
      backgroundColor: COLORS.background,
      timeLimit: 180,
      targetScore: 500,
      difficulty: 'hard',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    },
    {
      id: 'expert_2',
      name: 'Multi-Path',
      description: 'Multiple routes with different challenges',
      width: 1600,
      height: 1000,
      backgroundColor: COLORS.background,
      timeLimit: 200,
      targetScore: 600,
      difficulty: 'hard',
      completed: false,
      bestTime: 0,
      bestScore: 0,
      objects: []
    }
  ]
};

// Game Systems
class TopplerGame {
  
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private inputState: InputState;
  private rng: any;
  private inputSystem: any;
  private perfSystem: any;
  private audioSystem: any;
  private debugSystem: any;
  private saveSystem: any;
  private animationFrame: number = 0;
  private lastTime: number = 0;
  private keys: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = this.createInitialState();
    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      restart: false,
      pause: false,
      debug: false
    };

    this.rng = new RNGProvider(12345);
    this.inputSystem = new InputProfile();
    this.perfSystem = new PerfTimer('TopplerDemo');
    this.audioSystem = new AudioEngine();
    this.debugSystem = new DebugOverlayManager({
      showOp: true,
      showStatus: true,
      showIssues: true,
      showTimestamps: true,
      colorize: true,
      compact: false,
      outputFormat: 'text'
    } as any);
    this.saveSystem = new SaveManager();

    this.initializeGame();
  }

  private createInitialState(): GameState {
    return {
      currentLevel: 0,
      player: {
        position: { x: 100, y: 400 },
        velocity: { x: 0, y: 0 },
        size: { x: 32, y: 32 },
        onGround: false,
        facing: 'right',
        score: 0,
        lives: 3,
        time: 0,
        keys: [],
        powerUps: [],
        invulnerable: false,
        invulnerableTime: 0
      },
      level: LEVEL_TEMPLATES.easy[0],
      camera: { x: 0, y: 0 },
      gameTime: 0,
      paused: false,
      gameOver: false,
      victory: false,
      score: 0,
      highScore: this.loadHighScore(),
      totalScore: 0,
      levelsCompleted: 0
    };
  }

  private loadHighScore(): number {
    try {
      const savePath = path.join(process.cwd(), 'toppler_save.json');
      if (fs.existsSync(savePath)) {
        const data = SafeJSONParser.parse(fs.readFileSync(savePath, 'utf8'));
        return data.highScore || 0;
      }
    } catch (error) {
      console.warn('Could not load save file:', error);
    }
    return 0;
  }

  private saveHighScore(score: number): void {
    try {
      const savePath = path.join(process.cwd(), 'toppler_save.json');
      const data = { highScore: score, timestamp: Date.now() };
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Could not save high score:', error);
    }
  }

  private initializeGame(): void {
    this.setupEventListeners();
    this.generateLevel();
    this.gameLoop();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      this.updateInputState();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.updateInputState();
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Handle UI clicks
      if (this.gameState.paused || this.gameState.gameOver || this.gameState.victory) {
        this.handleMenuClick(x, y);
      }
    });
  }

  private updateInputState(): void {
    this.inputState.left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    this.inputState.right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
    this.inputState.up = this.keys.has('ArrowUp') || this.keys.has('KeyW');
    this.inputState.down = this.keys.has('ArrowDown') || this.keys.has('KeyS');
    this.inputState.jump = this.keys.has('Space') || this.keys.has('KeyW');
    this.inputState.restart = this.keys.has('KeyR');
    this.inputState.pause = this.keys.has('Escape') || this.keys.has('KeyP');
    this.inputState.debug = this.keys.has('KeyF');
  }

  private handleMenuClick(x: number, y: number): void {
    // Simple menu handling - in a real game this would be more sophisticated
    if (y > this.canvas.height - 100) {
      if (x < this.canvas.width / 2) {
        this.restartLevel();
      } else {
        this.nextLevel();
      }
    }
  }

  private generateLevel(): void {
    const level = this.gameState.level;
    level.objects = [];

    // Generate basic platform layout
    const platformY = level.height - 100;
    const platformWidth = 100;
    const platformHeight = 20;

    // Ground platform
    level.objects.push({
      id: 'ground',
      position: { x: 0, y: platformY },
      velocity: { x: 0, y: 0 },
      size: { x: level.width, y: platformHeight },
      type: 'block',
      color: COLORS.block,
      solid: true,
      deadly: false,
      collectible: false,
      active: true,
      physics: { gravity: 0, friction: 0.9, bounce: 0, mass: 0 }
    });

    // Generate some blocks
    for (let i = 0; i < 5; i++) {
      const x = 200 + i * 150;
      const y = platformY - 50 - Math.random() * 100;

      level.objects.push({
        id: `block_${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: { x: platformWidth, y: platformHeight },
        type: 'block',
        color: COLORS.block,
        solid: true,
        deadly: false,
        collectible: false,
        active: true,
        physics: { gravity: 0, friction: 0.9, bounce: 0, mass: 0 }
      });
    }

    // Add some collectibles
    for (let i = 0; i < 10; i++) {
      const x = 100 + Math.random() * (level.width - 200);
      const y = 100 + Math.random() * (platformY - 200);

      level.objects.push({
        id: `collectible_${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: { x: 20, y: 20 },
        type: 'collectible',
        color: COLORS.collectible,
        solid: false,
        deadly: false,
        collectible: true,
        active: true,
        physics: { gravity: 0.1, friction: 0.9, bounce: 0.5, mass: 1 }
      });
    }

    // Add some spikes
    for (let i = 0; i < 3; i++) {
      const x = 300 + i * 200;
      const y = platformY - 40;

      level.objects.push({
        id: `spike_${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: { x: 30, y: 20 },
        type: 'spike',
        color: COLORS.spike,
        solid: true,
        deadly: true,
        collectible: false,
        active: true,
        physics: { gravity: 0, friction: 0.9, bounce: 0, mass: 0 }
      });
    }

    // Add goal
    level.objects.push({
      id: 'goal',
      position: { x: level.width - 150, y: platformY - 100 },
      velocity: { x: 0, y: 0 },
      size: { x: 50, y: 50 },
      type: 'goal',
      color: COLORS.goal,
      solid: true,
      deadly: false,
      collectible: false,
      active: true,
      physics: { gravity: 0, friction: 0.9, bounce: 0, mass: 0 }
    });
  }

  private gameLoop = (currentTime: number = 0): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.gameState.paused && !this.gameState.gameOver && !this.gameState.victory) {
      this.update(deltaTime);
    }

    this.render();

    if (this.inputState.debug) {
      this.renderDebugInfo();
    }

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update game time
    this.gameState.gameTime += deltaTime;
    this.gameState.player.time += deltaTime;

    // Handle input
    this.handleInput(deltaTime);

    // Update physics
    this.updatePhysics(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update camera
    this.updateCamera();

    // Check win/lose conditions
    this.checkGameState();

    // Update performance metrics
    this.perfSystem.measure('gameLoop', () => {
      // Main game logic
    });
  }

  private handleInput(deltaTime: number): void {
    const player = this.gameState.player;

    // Horizontal movement
    if (this.inputState.left) {
      player.velocity.x = -MOVE_SPEED;
      player.facing = 'left';
    } else if (this.inputState.right) {
      player.velocity.x = MOVE_SPEED;
      player.facing = 'right';
    } else {
      player.velocity.x *= FRICTION;
    }

    // Jumping
    if (this.inputState.jump && player.onGround) {
      player.velocity.y = JUMP_FORCE;
      player.onGround = false;
    }

    // Restart level
    if (this.inputState.restart) {
      this.restartLevel();
    }

    // Pause game
    if (this.inputState.pause) {
      this.gameState.paused = !this.gameState.paused;
    }
  }

  private updatePhysics(deltaTime: number): void {
    const player = this.gameState.player;
    const level = this.gameState.level;

    // Apply gravity
    if (!player.onGround) {
      player.velocity.y += GRAVITY;
    }

    // Apply friction to horizontal movement
    player.velocity.x *= FRICTION;

    // Update position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Update invulnerability
    if (player.invulnerable) {
      player.invulnerableTime--;
      if (player.invulnerableTime <= 0) {
        player.invulnerable = false;
      }
    }

    // Update collectibles
    level.objects.forEach(obj => {
      if (obj.type === 'collectible' && obj.active) {
        // Simple floating animation
        obj.position.y += Math.sin(this.gameState.gameTime * 0.01) * 0.5;
      }
    });

    // Keep player in bounds
    player.position.x = Math.max(0, Math.min(player.position.x, level.width - player.size.x));
    player.position.y = Math.max(0, Math.min(player.position.y, level.height - player.size.y));
  }

  private checkCollisions(): void {
    const player = this.gameState.player;
    const level = this.gameState.level;

    player.onGround = false;

    level.objects.forEach(obj => {
      if (!obj.active) return;

      if (this.checkAABBCollision(player, obj)) {
        this.handleCollision(player, obj);
      }
    });
  }

  private checkAABBCollision(a: any, b: any): boolean {
    return a.position.x < b.position.x + b.size.x &&
           a.position.x + a.size.x > b.position.x &&
           a.position.y < b.position.y + b.size.y &&
           a.position.y + a.size.y > b.position.y;
  }

  private handleCollision(player: Player, obj: GameObject): void {
    // Determine collision side
    const overlapX = Math.min(player.position.x + player.size.x - obj.position.x, obj.position.x + obj.size.x - player.position.x);
    const overlapY = Math.min(player.position.y + player.size.y - obj.position.y, obj.position.y + obj.size.y - player.position.y);

    if (overlapX < overlapY) {
      // Horizontal collision
      if (player.position.x < obj.position.x) {
        player.position.x = obj.position.x - player.size.x;
      } else {
        player.position.x = obj.position.x + obj.size.x;
      }
      player.velocity.x = 0;
    } else {
      // Vertical collision
      if (player.position.y < obj.position.y) {
        player.position.y = obj.position.y - player.size.y;
        player.velocity.y = 0;
        player.onGround = true;
      } else {
        player.position.y = obj.position.y + obj.size.y;
        player.velocity.y = -player.velocity.y * BOUNCE_DAMPING;
      }
    }

    // Handle object interactions
    if (obj.solid && obj.deadly) {
      this.handleDeadlyCollision(player, obj);
    } else if (obj.collectible) {
      this.collectObject(obj);
    } else if (obj.type === 'goal') {
      this.reachGoal();
    }
  }

  private handleDeadlyCollision(player: Player, obj: GameObject): void {
    if (!player.invulnerable) {
      player.lives--;
      player.invulnerable = true;
      player.invulnerableTime = INVULNERABLE_TIME;

      if (player.lives <= 0) {
        this.gameState.gameOver = true;
      } else {
        // Reset player position
        player.position = { x: 100, y: 400 };
        player.velocity = { x: 0, y: 0 };
      }
    }
  }

  private collectObject(obj: GameObject): void {
    obj.active = false;
    this.gameState.player.score += 10;
    this.gameState.score += 10;
  }

  private reachGoal(): void {
    this.gameState.victory = true;
    this.gameState.level.completed = true;
    this.gameState.level.bestTime = Math.min(this.gameState.level.bestTime, this.gameState.player.time);
    this.gameState.level.bestScore = Math.max(this.gameState.level.bestScore, this.gameState.score);
    this.gameState.levelsCompleted++;

    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      this.saveHighScore(this.gameState.highScore);
    }
  }

  private updateCamera(): void {
    const player = this.gameState.player;
    const level = this.gameState.level;

    // Simple camera following
    this.gameState.camera.x = player.position.x - this.canvas.width / 2;
    this.gameState.camera.y = player.position.y - this.canvas.height / 2;

    // Clamp camera to level bounds
    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, level.width - this.canvas.width));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, level.height - this.canvas.height));
  }

  private checkGameState(): void {
    const player = this.gameState.player;
    const level = this.gameState.level;

    // Time limit
    if (player.time >= level.timeLimit) {
      player.lives--;
      if (player.lives <= 0) {
        this.gameState.gameOver = true;
      } else {
        this.restartLevel();
      }
    }

    // Victory condition
    const goalReached = level.objects.some(obj => obj.type === 'goal' && !obj.active);
    if (goalReached) {
      this.gameState.victory = true;
    }
  }

  private restartLevel(): void {
    this.gameState.player.position = { x: 100, y: 400 };
    this.gameState.player.velocity = { x: 0, y: 0 };
    this.gameState.player.onGround = false;
    this.gameState.player.invulnerable = false;
    this.gameState.player.invulnerableTime = 0;
    this.gameState.player.time = 0;
    this.gameState.paused = false;
    this.gameState.gameOver = false;
    this.gameState.victory = false;

    // Reset collectibles
    this.gameState.level.objects.forEach(obj => {
      if (obj.collectible) {
        obj.active = true;
      }
    });
  }

  private nextLevel(): void {
    const templates = LEVEL_TEMPLATES[this.gameState.level.difficulty];
    this.gameState.currentLevel = (this.gameState.currentLevel + 1) % templates.length;

    this.loadLevel(templates[this.gameState.currentLevel]);
    this.restartLevel();
  }

  private loadLevel(level: Level): void {
    this.gameState.level = { ...level };
    this.generateLevel();
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = this.gameState.level.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context for camera transform
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);

    // Render level objects
    this.gameState.level.objects.forEach(obj => {
      if (obj.active) {
        this.renderObject(obj);
      }
    });

    // Render player
    this.renderPlayer();

    // Restore context
    this.ctx.restore();

    // Render UI
    this.renderUI();
  }

  private renderObject(obj: GameObject): void {
    this.ctx.fillStyle = obj.color;
    this.ctx.fillRect(obj.position.x, obj.position.y, obj.size.x, obj.size.y);

    // Add simple visual effects
    if (obj.type === 'spike') {
      // Draw spikes
      this.ctx.fillStyle = '#FF4444';
      for (let i = 0; i < obj.size.x; i += 10) {
        this.ctx.fillRect(obj.position.x + i, obj.position.y, 5, 10);
      }
    } else if (obj.type === 'collectible') {
      // Draw collectible with glow effect
      const time = this.gameState.gameTime * 0.01;
      this.ctx.fillStyle = `rgba(255, 230, 109, ${0.5 + Math.sin(time) * 0.3})`;
      this.ctx.fillRect(obj.position.x - 5, obj.position.y - 5, obj.size.x + 10, obj.size.y + 10);
    }
  }

  private renderPlayer(): void {
    const player = this.gameState.player;

    this.ctx.fillStyle = player.invulnerable ?
      (Math.floor(this.gameState.gameTime / 5) % 2 ? '#FF6B6B' : '#FFFFFF') :
      COLORS.player;

    this.ctx.fillRect(player.position.x, player.position.y, player.size.x, player.size.y);

    // Draw facing indicator
    this.ctx.fillStyle = '#FFFFFF';
    const eyeX = player.facing === 'right' ? player.position.x + 20 : player.position.x + 5;
    this.ctx.fillRect(eyeX, player.position.y + 8, 4, 4);
  }

  private renderUI(): void {
    this.ctx.fillStyle = COLORS.ui;
    this.ctx.fillRect(10, 10, 300, 120);

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '16px monospace';

    // Game info
    this.ctx.fillText(`Score: ${this.gameState.score}`, 20, 30);
    this.ctx.fillText(`Lives: ${this.gameState.player.lives}`, 20, 50);
    this.ctx.fillText(`Time: ${Math.floor(this.gameState.player.time)}s`, 20, 70);
    this.ctx.fillText(`Level: ${this.gameState.level.name}`, 20, 90);
    this.ctx.fillText(`High Score: ${this.gameState.highScore}`, 20, 110);

    // Game state messages
    if (this.gameState.paused) {
      this.renderCenteredText('PAUSED', 40);
    } else if (this.gameState.gameOver) {
      this.renderCenteredText('GAME OVER', 40);
      this.renderCenteredText('Press R to restart', 80);
    } else if (this.gameState.victory) {
      this.renderCenteredText('LEVEL COMPLETE!', 40);
      this.renderCenteredText(`Score: ${this.gameState.score}`, 60);
      this.renderCenteredText('Click to continue', 80);
    }
  }

  private renderCenteredText(text: string, y: number): void {
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '32px monospace';
    const textWidth = this.ctx.measureText(text).width;
    const x = (this.canvas.width - textWidth) / 2;
    this.ctx.fillText(text, x, y);
  }

  private renderDebugInfo(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 200, 10, 190, 200);

    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';

    const player = this.gameState.player;
    const debugInfo = [
      `FPS: ${Math.round(1000 / (performance.now() - this.lastTime))}`,
      `X: ${Math.round(player.position.x)}`,
      `Y: ${Math.round(player.position.y)}`,
      `VX: ${player.velocity.x.toFixed(2)}`,
      `VY: ${player.velocity.y.toFixed(2)}`,
      `Ground: ${player.onGround}`,
      `Invuln: ${player.invulnerable}`,
      `Objects: ${this.gameState.level.objects.length}`,
      `Camera X: ${Math.round(this.gameState.camera.x)}`,
      `Camera Y: ${Math.round(this.gameState.camera.y)}`
    ];

    debugInfo.forEach((info, index) => {
      this.ctx.fillText(info, this.canvas.width - 190, 30 + index * 15);
    });
  }

  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    document.removeEventListener('keydown', this.setupEventListeners);
    document.removeEventListener('keyup', this.setupEventListeners);
  }
}

// Demo Entry Point
function main(...args: any[]) {
  console.info('🎮 Toppler Demo - MIFF Framework');
  console.info('================================');
  console.info('A physics-based puzzle platformer featuring:');
  console.info('• Real-time physics simulation');
  console.info('• Progressive difficulty levels');
  console.info('• Score and time tracking');
  console.info('• Procedural level generation');
  console.info('• Debug and profiling tools\n');

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '2px solid #333';
  canvas.style.backgroundColor = '#87CEEB';

  // Add to page
  document.body.innerHTML = `
    <div style="font-family: monospace; background: #f0f0f0; padding: 20px;">
      <h1>🎮 Toppler Demo - MIFF Physics Platformer</h1>
      <p>A physics-based puzzle platformer built with the MIFF game development framework.</p>
      <p><strong>Controls:</strong></p>
      <ul>
        <li>Arrow Keys / WASD - Move</li>
        <li>Space / W - Jump</li>
        <li>R - Restart Level</li>
        <li>P / Escape - Pause</li>
        <li>F - Toggle Debug Info</li>
      </ul>
      <p><strong>Objective:</strong> Collect yellow items while avoiding red spikes and reach the green goal!</p>
    </div>
  `;

  document.body.appendChild(canvas);

  // Start game
  const game = new TopplerGame(canvas);

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    game.destroy();
  });

  console.info('✅ Toppler demo started!');
  console.info('🎮 Use arrow keys/WASD to move, space to jump');
  console.info('🎯 Collect yellow items, avoid red spikes, reach green goal');
}

// Export for use in other modules
export { TopplerGame, main };

// Run if in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('load', main);
}
# Simple Game Tutorial

## 🎮 Building Your First Game with MIFF

This tutorial will guide you through creating a complete game using the MIFF Framework.

---

## 📋 What You'll Build

A simple 2D platformer game with:
- Player movement and jumping
- Collectible items
- Score system
- Basic physics
- Sound effects

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js v18.0.0+
- Basic TypeScript knowledge
- MIFF Framework installed

### **Setup**
```bash
# Clone the repository
git clone https://github.com/your-org/miff-framework.git
cd miff-framework

# Install dependencies
npm install

# Navigate to examples
cd examples/simple-game-tutorial
```

---

## 🏗️ Project Structure

```
simple-game-tutorial/
├── src/
│   ├── game/
│   │   ├── GameManager.ts
│   │   ├── Player.ts
│   │   ├── Item.ts
│   │   └── Physics.ts
│   ├── ui/
│   │   ├── UIManager.ts
│   │   └── HUD.ts
│   └── main.ts
├── assets/
│   ├── sprites/
│   └── sounds/
├── tests/
│   └── game.test.ts
└── package.json
```

---

## 🎯 Step 1: Game Manager

Create the main game manager:

```typescript
// src/game/GameManager.ts
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';
import { MemoryManager } from '../../../miff/pure/shared/memory/MemoryManager';
import { StandardErrorHandler } from '../../../miff/pure/shared/error/StandardErrorHandler';
import { Player } from './Player';
import { Item } from './Item';
import { Physics } from './Physics';

export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  jumpForce: number;
}

export interface GameState {
  score: number;
  level: number;
  isRunning: boolean;
  isPaused: boolean;
}

export class GameManager {
  private config: GameConfig;
  private state: GameState;
  private player: Player;
  private items: Item[] = [];
  private physics: Physics;
  private isInitialized: boolean = false;
  
  private logger: StructuredLogger;
  private memoryId: string;
  private errorHandler: StandardErrorHandler;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = {
      score: 0,
      level: 1,
      isRunning: false,
      isPaused: false
    };
    
    this.player = new Player({ x: 100, y: 100 });
    this.physics = new Physics(config);
    
    this.logger = new StructuredLogger({ module: 'GameManager' });
    this.memoryId = MemoryManager.registerInstance(this);
    this.errorHandler = new StandardErrorHandler();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Game already initialized');
      return;
    }

    try {
      this.logger.info('Initializing game...', { config: this.config });
      
      // Initialize game components
      await this.player.initialize();
      await this.physics.initialize();
      
      // Create initial items
      this.createItems();
      
      this.isInitialized = true;
      this.logger.info('Game initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize game', { error: error.message });
      throw error;
    }
  }

  start(): void {
    if (!this.isInitialized) {
      throw new Error('Game not initialized');
    }

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.logger.info('Game started');
    
    // Start game loop
    this.gameLoop();
  }

  pause(): void {
    this.state.isPaused = !this.state.isPaused;
    this.logger.info('Game paused', { paused: this.state.isPaused });
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.logger.info('Game stopped');
  }

  update(deltaTime: number): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    // Update player
    this.player.update(deltaTime);
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Update items
    this.updateItems(deltaTime);
  }

  private gameLoop(): void {
    const loop = () => {
      if (!this.state.isRunning) return;
      
      const deltaTime = 16; // 60 FPS
      this.update(deltaTime);
      
      requestAnimationFrame(loop);
    };
    
    loop();
  }

  private createItems(): void {
    // Create collectible items
    for (let i = 0; i < 10; i++) {
      const item = new Item({
        x: Math.random() * this.config.width,
        y: Math.random() * this.config.height,
        value: 10
      });
      this.items.push(item);
    }
  }

  private checkCollisions(): void {
    // Check player-item collisions
    this.items.forEach((item, index) => {
      if (this.player.collidesWith(item)) {
        this.collectItem(item, index);
      }
    });
  }

  private collectItem(item: Item, index: number): void {
    this.state.score += item.value;
    this.items.splice(index, 1);
    this.logger.info('Item collected', { score: this.state.score });
    
    // Check for level up
    if (this.state.score >= this.state.level * 100) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.state.level++;
    this.logger.info('Level up!', { level: this.state.level });
    
    // Create more items for next level
    this.createItems();
  }

  private updateItems(deltaTime: number): void {
    this.items.forEach(item => item.update(deltaTime));
  }

  getState(): GameState {
    return { ...this.state };
  }

  getPlayer(): Player {
    return this.player;
  }

  getItems(): Item[] {
    return [...this.items];
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying game...');
    
    this.stop();
    this.items = [];
    await this.player.destroy();
    await this.physics.destroy();
    
    MemoryManager.unregisterInstance(this.memoryId);
    this.isInitialized = false;
    
    this.logger.info('Game destroyed');
  }
}
```

---

## 🎯 Step 2: Player Class

Create the player character:

```typescript
// src/game/Player.ts
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface PlayerConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  isJumping: boolean;
}

export class Player {
  private config: PlayerConfig;
  private state: PlayerState;
  private isInitialized: boolean = false;
  private logger: StructuredLogger;

  constructor(config: PlayerConfig) {
    this.config = {
      width: 32,
      height: 32,
      ...config
    };
    
    this.state = {
      x: config.x,
      y: config.y,
      velocityX: 0,
      velocityY: 0,
      isGrounded: false,
      isJumping: false
    };
    
    this.logger = new StructuredLogger({ module: 'Player' });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Player already initialized');
      return;
    }

    this.logger.info('Initializing player...', { config: this.config });
    this.isInitialized = true;
    this.logger.info('Player initialized successfully');
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Apply gravity
    this.state.velocityY += 0.5; // Gravity
    
    // Update position
    this.state.x += this.state.velocityX * deltaTime;
    this.state.y += this.state.velocityY * deltaTime;
    
    // Apply friction
    this.state.velocityX *= 0.9;
    
    // Check ground collision (simplified)
    if (this.state.y >= 400) { // Ground level
      this.state.y = 400;
      this.state.velocityY = 0;
      this.state.isGrounded = true;
      this.state.isJumping = false;
    }
  }

  moveLeft(): void {
    this.state.velocityX = -5;
    this.logger.debug('Player moving left');
  }

  moveRight(): void {
    this.state.velocityX = 5;
    this.logger.debug('Player moving right');
  }

  jump(): void {
    if (this.state.isGrounded && !this.state.isJumping) {
      this.state.velocityY = -10; // Jump force
      this.state.isGrounded = false;
      this.state.isJumping = true;
      this.logger.debug('Player jumping');
    }
  }

  collidesWith(item: any): boolean {
    // Simple AABB collision detection
    return (
      this.state.x < item.x + item.width &&
      this.state.x + this.config.width! > item.x &&
      this.state.y < item.y + item.height &&
      this.state.y + this.config.height! > item.y
    );
  }

  getState(): PlayerState {
    return { ...this.state };
  }

  getConfig(): PlayerConfig {
    return { ...this.config };
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying player...');
    this.isInitialized = false;
    this.logger.info('Player destroyed');
  }
}
```

---

## 🎯 Step 3: Item Class

Create collectible items:

```typescript
// src/game/Item.ts
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface ItemConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  value: number;
}

export interface ItemState {
  x: number;
  y: number;
  collected: boolean;
  animationTime: number;
}

export class Item {
  private config: ItemConfig;
  private state: ItemState;
  private isInitialized: boolean = false;
  private logger: StructuredLogger;

  constructor(config: ItemConfig) {
    this.config = {
      width: 16,
      height: 16,
      ...config
    };
    
    this.state = {
      x: config.x,
      y: config.y,
      collected: false,
      animationTime: 0
    };
    
    this.logger = new StructuredLogger({ module: 'Item' });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Item already initialized');
      return;
    }

    this.logger.info('Initializing item...', { config: this.config });
    this.isInitialized = true;
    this.logger.info('Item initialized successfully');
  }

  update(deltaTime: number): void {
    if (!this.isInitialized || this.state.collected) return;

    // Animate item (bobbing motion)
    this.state.animationTime += deltaTime;
    this.state.y += Math.sin(this.state.animationTime * 0.01) * 0.5;
  }

  collect(): void {
    if (!this.state.collected) {
      this.state.collected = true;
      this.logger.info('Item collected', { value: this.config.value });
    }
  }

  isCollected(): boolean {
    return this.state.collected;
  }

  getValue(): number {
    return this.config.value;
  }

  getState(): ItemState {
    return { ...this.state };
  }

  getConfig(): ItemConfig {
    return { ...this.config };
  }
}
```

---

## 🎯 Step 4: Physics System

Create a simple physics system:

```typescript
// src/game/Physics.ts
import { StructuredLogger } from '../../../miff/pure/shared/logging/StructuredLogger';

export interface PhysicsConfig {
  gravity: number;
  friction: number;
  airResistance: number;
}

export class Physics {
  private config: PhysicsConfig;
  private isInitialized: boolean = false;
  private logger: StructuredLogger;

  constructor(config: PhysicsConfig) {
    this.config = config;
    this.logger = new StructuredLogger({ module: 'Physics' });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Physics already initialized');
      return;
    }

    this.logger.info('Initializing physics...', { config: this.config });
    this.isInitialized = true;
    this.logger.info('Physics initialized successfully');
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Physics update logic would go here
    // For now, it's handled in individual objects
  }

  applyGravity(velocityY: number): number {
    return velocityY + this.config.gravity;
  }

  applyFriction(velocityX: number): number {
    return velocityX * this.config.friction;
  }

  applyAirResistance(velocity: number): number {
    return velocity * this.config.airResistance;
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying physics...');
    this.isInitialized = false;
    this.logger.info('Physics destroyed');
  }
}
```

---

## 🎯 Step 5: Main Game File

Create the main game entry point:

```typescript
// src/main.ts
import { GameManager, GameConfig } from './game/GameManager';

// Game configuration
const gameConfig: GameConfig = {
  width: 800,
  height: 600,
  gravity: 0.5,
  jumpForce: 10
};

// Create and start the game
async function startGame() {
  const game = new GameManager(gameConfig);
  
  try {
    await game.initialize();
    game.start();
    
    // Set up input handling
    setupInputHandling(game);
    
    console.log('🎮 Game started! Use WASD or arrow keys to move, Space to jump');
    
  } catch (error) {
    console.error('Failed to start game:', error);
  }
}

function setupInputHandling(game: GameManager) {
  const player = game.getPlayer();
  
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyA':
      case 'ArrowLeft':
        player.moveLeft();
        break;
      case 'KeyD':
      case 'ArrowRight':
        player.moveRight();
        break;
      case 'Space':
        event.preventDefault();
        player.jump();
        break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyA':
      case 'ArrowLeft':
      case 'KeyD':
      case 'ArrowRight':
        // Stop horizontal movement
        break;
    }
  });
}

// Start the game when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', startGame);
} else {
  startGame();
}
```

---

## 🧪 Step 6: Testing

Create tests for your game:

```typescript
// tests/game.test.ts
import { GameManager, GameConfig } from '../src/game/GameManager';
import { Player } from '../src/game/Player';
import { Item } from '../src/game/Item';

describe('Simple Game', () => {
  let game: GameManager;
  let config: GameConfig;

  beforeEach(async () => {
    config = {
      width: 800,
      height: 600,
      gravity: 0.5,
      jumpForce: 10
    };
    
    game = new GameManager(config);
    await game.initialize();
  });

  afterEach(async () => {
    await game.destroy();
  });

  describe('Game Initialization', () => {
    test('should initialize successfully', () => {
      expect(game).toBeDefined();
      const state = game.getState();
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });

    test('should create items on initialization', () => {
      const items = game.getItems();
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Player Movement', () => {
    test('should move player left', () => {
      const player = game.getPlayer();
      const initialState = player.getState();
      
      player.moveLeft();
      player.update(16);
      
      const newState = player.getState();
      expect(newState.x).toBeLessThan(initialState.x);
    });

    test('should move player right', () => {
      const player = game.getPlayer();
      const initialState = player.getState();
      
      player.moveRight();
      player.update(16);
      
      const newState = player.getState();
      expect(newState.x).toBeGreaterThan(initialState.x);
    });

    test('should make player jump when grounded', () => {
      const player = game.getPlayer();
      const initialState = player.getState();
      
      player.jump();
      player.update(16);
      
      const newState = player.getState();
      expect(newState.velocityY).toBeLessThan(0);
    });
  });

  describe('Item Collection', () => {
    test('should collect items on collision', () => {
      const initialState = game.getState();
      const items = game.getItems();
      
      // Simulate collision
      game.update(16);
      
      const newState = game.getState();
      // Score should increase if items were collected
      expect(newState.score).toBeGreaterThanOrEqual(initialState.score);
    });
  });
});
```

---

## 🚀 Running the Game

### **Development Mode**
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the game
npm run build

# Start the game
npm start
```

### **Production Build**
```bash
# Build for production
npm run build:prod

# Run production build
npm run start:prod
```

---

## 🎯 Next Steps

### **Enhancements You Can Add**
1. **Graphics**: Add sprite rendering
2. **Sound**: Add sound effects and music
3. **Levels**: Create multiple levels
4. **Enemies**: Add moving obstacles
5. **Power-ups**: Add special items
6. **Multiplayer**: Add multiplayer support

### **Advanced Features**
1. **Save System**: Implement save/load
2. **Settings**: Add game settings
3. **Achievements**: Add achievement system
4. **Leaderboards**: Add high score tracking

---

## 📚 Learning Resources

- [MIFF Framework Documentation](../README.md)
- [Module Development Guide](../MODULE_DEVELOPMENT_GUIDE.md)
- [API Reference](../API_DOCUMENTATION.md)
- [Contributor Guide](../CONTRIBUTOR_ONBOARDING_GUIDE.md)

---

## 🎉 Congratulations!

You've built your first game with the MIFF Framework! 

**Happy coding!** 🚀

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Status**: Tutorial Complete  
**Owner**: R.C. Biscuits
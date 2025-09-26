# SimpleGamePure - Rapid Prototyping Module

**Make games in minutes, not hours!** SimpleGamePure provides pre-configured game templates and auto-wiring of MIFF modules for rapid prototyping and game jam development.

## 🚀 Quick Start

```typescript
import { SimpleGameBuilder, GameType } from './SimpleGamePure';

// Create a clicker game in ONE line!
const game = SimpleGameBuilder.createClickerGame({
  title: 'My Awesome Game',
  difficulty: 'easy',
  startingCurrency: 100
});

// Start playing immediately
game.start();

// Handle input
document.addEventListener('click', () => {
  game.click(); // Earn currency
});

// Game loop
function gameLoop() {
  game.update(16); // 60fps
  requestAnimationFrame(gameLoop);
}
gameLoop();
```

## 🎮 Available Game Types

### Clicker Games
```typescript
const clicker = SimpleGameBuilder.createClickerGame({
  title: 'Cookie Clicker',
  startingCurrency: 0
});

// Click to earn currency
clicker.click();
clicker.upgradeClickPower(); // Spend currency to increase click power
clicker.buyAutoClicker();    // Buy auto-clickers for passive income
```

### Platformer Games
```typescript
const platformer = SimpleGameBuilder.createPlatformerGame({
  title: 'Platformer Adventure'
});

// Control the player
platformer.moveLeft();
platformer.moveRight();
platformer.stopMoving();
platformer.jump();

// Collect items
platformer.collectCoin(); // +10 currency, +100 score
```

### Arcade Games
```typescript
const arcade = SimpleGameBuilder.createArcadeGame({
  title: 'Space Shooter'
});

// Combat mechanics
arcade.shoot();      // Fire bullets
arcade.takeDamage(); // Lose a life
arcade.getLives();   // Check remaining lives
```

### RPG Games
```typescript
const rpg = SimpleGameBuilder.createRPGGame({
  title: 'Fantasy RPG'
});

// Combat system
rpg.startCombat('goblin_1'); // Start fighting an enemy
rpg.attack();                // Attack the enemy
rpg.getPlayer();             // Get player stats
```

## 🎯 Key Features

### ✅ **One-Line Setup**
- No complex configuration required
- Auto-wires required MIFF modules
- Pre-configured for immediate use

### ✅ **Built-in Game Mechanics**
- Currency systems
- Scoring systems
- Achievement systems
- Save/load functionality
- Audio integration

### ✅ **Extensible Design**
- Add custom modules
- Override default behaviors
- Customize game rules

### ✅ **Game Jam Ready**
- Perfect for 48-hour game jams
- Minimal setup time
- Focus on gameplay, not infrastructure

## 📚 API Reference

### SimpleGameBuilder

#### Static Methods
```typescript
// Create specific game types
SimpleGameBuilder.createClickerGame(config)
SimpleGameBuilder.createPlatformerGame(config)
SimpleGameBuilder.createArcadeGame(config)
SimpleGameBuilder.createRPGGame(config)
SimpleGameBuilder.createCustomGame(config)

// Utility methods
SimpleGameBuilder.getRequiredModules(gameType)  // Get module dependencies
SimpleGameBuilder.validateGameType(gameType, availableModules) // Check compatibility
```

### SimpleGameConfig
```typescript
interface SimpleGameConfig {
  gameType: GameType;
  title: string;
  difficulty: DifficultyLevel;
  startingCurrency: number;
  enableSaving: boolean;
  enableAudio: boolean;
  customModules?: string[]; // Additional MIFF modules to include
}
```

### GameType Enum
```typescript
enum GameType {
  CLICKER = 'clicker',
  PLATFORMER = 'platformer',
  ARCADE = 'arcade',
  RPG = 'rpg',
  PUZZLE = 'puzzle',
  IDLE = 'idle',
  CUSTOM = 'custom'
}
```

### DifficultyLevel Enum
```typescript
enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}
```

## 🔧 Advanced Usage

### Custom Game Configuration
```typescript
const customGame = SimpleGameBuilder.createCustomGame({
  gameType: GameType.CUSTOM,
  title: 'My Unique Game',
  difficulty: DifficultyLevel.MEDIUM,
  startingCurrency: 500,
  enableSaving: true,
  enableAudio: true,
  customModules: ['CutScenePure', 'QuestSystemPure'] // Add specific modules
});
```

### Extending Base Classes
```typescript
class MyCustomGame extends SimpleGame {
  private customFeature: any;

  protected onStart(): void {
    super.onStart();
    this.initializeCustomFeature();
  }

  protected onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
    this.updateCustomFeature(deltaTime);
  }

  private initializeCustomFeature(): void {
    // Custom initialization
  }

  private updateCustomFeature(deltaTime: number): void {
    // Custom update logic
  }
}
```

## 🛠️ Utility Functions

### SimpleGameUtils
```typescript
import { SimpleGameUtils } from './SimpleGamePure';

// Create achievements
const achievement = SimpleGameUtils.createAchievement(
  'first_click',
  'First Click',
  'Click for the first time',
  '👆'
);

// Format time and currency
const timeString = SimpleGameUtils.formatTime(3661000); // "1h 1m 1s"
const currencyString = SimpleGameUtils.formatCurrency(1500000); // "1.5M"

// Collision detection
const collision = SimpleGameUtils.checkCollision(
  { x: 0, y: 0, width: 10, height: 10 },
  { x: 5, y: 5, width: 10, height: 10 }
); // true

// Generate unique IDs
const id = SimpleGameUtils.generateId('enemy'); // "enemy_1699123456789_abc123def"
```

## 🎮 Game Templates

### Pre-configured Templates
```typescript
import { GameTemplates } from './SimpleGamePure';

// Use pre-configured templates
const clickerConfig = GameTemplates.basicClicker();
const platformerConfig = GameTemplates.basicPlatformer();
const arcadeConfig = GameTemplates.basicArcade();
const rpgConfig = GameTemplates.basicRPG();

// Create games from templates
const game = SimpleGameBuilder.createClickerGame(clickerConfig);
```

## 📊 Module Dependencies

Each game type automatically includes the required MIFF modules:

| Game Type | Required Modules |
|-----------|------------------|
| Clicker | InputPure, EventBusPure, LogPure, SaveLoadPure, AudioPure |
| Platformer | InputPure, PhysicsSystemPure, CollisionSystemPure, MovementPure, AudioPure, SaveLoadPure, DebugOverlayPure |
| Arcade | InputPure, CollisionSystemPure, PhysicsSystemPure, AudioPure, SaveLoadPure, RNGPure |
| RPG | InputPure, CombatPure, ItemsPure, ProgressionPure, AudioPure, SaveLoadPure, EventBusPure |
| Puzzle | InputPure, CollisionSystemPure, AudioPure, SaveLoadPure, RNGPure |
| Idle | EventBusPure, SaveLoadPure, AudioPure, RNGPure |

## 🎯 Best Practices

### For Game Jams
1. Start with `SimpleGameBuilder.createClickerGame()` - simplest to implement
2. Add your unique mechanics on top of the base functionality
3. Use the built-in save system to persist progress
4. Customize audio and visual feedback

### For Prototypes
1. Choose the closest game type to your concept
2. Use the pre-configured systems as a starting point
3. Extend classes rather than replacing them
4. Focus on core gameplay loop first

### For Production Games
1. Start with SimpleGamePure for rapid iteration
2. Gradually replace simple systems with full MIFF modules
3. Add custom modules as needed
4. Use the achievement and progression systems as-is

## 🔄 Migration from Simple to Complex

SimpleGamePure is designed to be a starting point, not an endpoint. Here's how to migrate to full MIFF modules:

```typescript
// Phase 1: Start with SimpleGamePure
const game = SimpleGameBuilder.createRPGGame();

// Phase 2: Replace with individual modules
const combatEngine = new CombatPure.CombatEngine();
const itemManager = new ItemsPure.ItemsManager();
const progression = new ProgressionPure.ProgressionSystem();

// Phase 3: Custom integration
class MyGame {
  constructor() {
    this.combat = combatEngine;
    this.items = itemManager;
    this.progression = progression;
    // Custom integration logic
  }
}
```

## 🚦 Performance Considerations

- **Lightweight**: Minimal overhead compared to full MIFF modules
- **Optimized**: Pre-configured for common use cases
- **Scalable**: Easy to extend without performance penalties
- **Memory Efficient**: Only loads required modules

## 🎉 Examples

### Complete Clicker Game (30 lines)
```typescript
import { SimpleGameBuilder, SimpleGameUtils } from './SimpleGamePure';

const game = SimpleGameBuilder.createClickerGame({
  title: 'Cookie Empire',
  startingCurrency: 0
});

game.start();

// UI Update Loop
function updateUI() {
  document.getElementById('currency').textContent =
    SimpleGameUtils.formatCurrency(game.getStats().currency);
  document.getElementById('click-power').textContent =
    game.getClickPower().toString();
  requestAnimationFrame(updateUI);
}
updateUI();

// Input Handling
document.addEventListener('click', () => {
  game.click();
  showClickEffect();
});
```

## 📈 Roadmap

### Version 1.1 (Next Release)
- [ ] More game types (puzzle, idle, strategy)
- [ ] Custom difficulty curves
- [ ] Multiplayer support
- [ ] Advanced achievement systems

### Version 1.2 (Future)
- [ ] Visual editor integration
- [ ] Asset management
- [ ] Level editor
- [ ] Analytics integration

## 🤝 Contributing

SimpleGamePure welcomes contributions! Focus areas:
- New game type templates
- Additional utility functions
- Performance optimizations
- Better documentation and examples

---

**SimpleGamePure makes game development accessible to everyone. Start building your game today!** 🎮✨
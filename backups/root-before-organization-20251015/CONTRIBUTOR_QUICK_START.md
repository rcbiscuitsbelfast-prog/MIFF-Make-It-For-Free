# MIFF Framework - Contributor Quick Start Guide

## 🚀 Get Started in 5 Minutes!

Welcome to the MIFF Framework! This guide will get you up and running as a contributor in just 5 minutes.

---

## 📋 Prerequisites

### **System Requirements**
- **Node.js**: v18.0.0 or higher
- **NPM**: v8.0.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### **Quick Check**
```bash
node --version  # Should be v18.0.0+
npm --version   # Should be v8.0.0+
git --version   # Any recent version
```

---

## ⚡ Quick Setup

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/your-org/miff-framework.git
cd miff-framework
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Verify Installation**
```bash
npm run health-check
```

### **Step 4: Run Your First Test**
```bash
npm test
```

**🎉 Congratulations! You're ready to contribute!**

---

## 🎮 Your First Contribution

### **Create a Simple Game Module**

Let's create a basic game module to get familiar with the framework:

#### **1. Create Module Directory**
```bash
mkdir miff/pure/MyFirstGamePure
cd miff/pure/MyFirstGamePure
```

#### **2. Create Manager.ts**
```typescript
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';

export interface GameConfig {
  name: string;
  maxPlayers: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Player {
  id: string;
  name: string;
  score: number;
  level: number;
}

export class MyFirstGameManager {
  private config: GameConfig;
  private players: Map<string, Player> = new Map();
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;
  private errorHandler: StandardErrorHandler;

  constructor(config: GameConfig) {
    this.config = config;
    this.logger = new StructuredLogger({ module: 'MyFirstGameManager' });
    this.memoryId = MemoryManager.registerInstance(this);
    this.errorHandler = new StandardErrorHandler();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Game manager already initialized');
      return;
    }

    try {
      this.logger.info('Initializing MyFirstGame...', { config: this.config });
      
      // Initialize game state
      this.players.clear();
      
      this.isInitialized = true;
      this.logger.info('MyFirstGame initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize MyFirstGame', { error: error.message });
      throw error;
    }
  }

  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    this.logger.info('Player added', { playerId: player.id, playerName: player.name });
  }

  removePlayer(playerId: string): void {
    if (this.players.delete(playerId)) {
      this.logger.info('Player removed', { playerId });
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  updateScore(playerId: string, score: number): void {
    const player = this.players.get(playerId);
    if (player) {
      player.score = score;
      this.logger.info('Score updated', { playerId, score });
    }
  }

  getGameStats(): { totalPlayers: number; averageScore: number } {
    const players = this.getAllPlayers();
    const totalPlayers = players.length;
    const averageScore = totalPlayers > 0 
      ? players.reduce((sum, player) => sum + player.score, 0) / totalPlayers 
      : 0;

    return { totalPlayers, averageScore };
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying MyFirstGame...');
    
    this.players.clear();
    MemoryManager.unregisterInstance(this.memoryId);
    this.isInitialized = false;
    
    this.logger.info('MyFirstGame destroyed');
  }
}

// Export default instance
export const defaultGameManager = new MyFirstGameManager({
  name: 'My First Game',
  maxPlayers: 4,
  difficulty: 'easy'
});
```

#### **3. Create index.ts**
```typescript
// Re-export all public APIs
export * from './Manager';
export { defaultGameManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'MyFirstGamePure',
    version: '1.0.0',
    type: 'GameModule'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['game', 'players', 'scoring', 'multiplayer'];
}
```

#### **4. Create capabilities.ts**
```typescript
export const myfirstgameCapability = {
  "id": "myfirstgame",
  "name": "MyFirstGamePure",
  "description": "My First Game module providing basic game functionality",
  "version": "1.0.0",
  "type": "feature",
  "category": "game",
  "tags": ["miff", "module", "exported", "game", "myfirstgame"],
  "dependencies": ["core-manager", "core-logging"],
  "interfaces": [],
  "methods": [
    {
      "name": "initialize",
      "description": "Initialize the module manager",
      "parameters": [],
      "returnType": "Promise<void>",
      "isAsync": true,
      "isPublic": true,
      "examples": ["await manager.initialize();"]
    },
    {
      "name": "addPlayer",
      "description": "Add a player to the game",
      "parameters": [
        {
          "name": "player",
          "type": "Player",
          "required": true,
          "description": "Player object to add"
        }
      ],
      "returnType": "void",
      "isAsync": false,
      "isPublic": true,
      "examples": ["manager.addPlayer({ id: '1', name: 'Player1', score: 0, level: 1 });"]
    }
  ],
  "properties": [
    {
      "name": "isInitialized",
      "type": "boolean",
      "description": "Whether the module is initialized",
      "readOnly": true,
      "defaultValue": false
    }
  ],
  "events": [
    {
      "name": "moduleReady",
      "description": "Module is ready for use",
      "payload": "ModuleInfo",
      "isAsync": true
    }
  ],
  "metadata": {
    "hasManager": true,
    "hasCLI": false,
    "hasIndex": true
  },
  "status": "active",
  "createdAt": "2025-01-27T00:00:00.000Z",
  "updatedAt": "2025-01-27T00:00:00.000Z"
};

export default myfirstgameCapability;
```

#### **5. Create Test File**
```typescript
import { MyFirstGameManager, Player } from './Manager';

describe('MyFirstGameManager', () => {
  let gameManager: MyFirstGameManager;

  beforeEach(async () => {
    gameManager = new MyFirstGameManager({
      name: 'Test Game',
      maxPlayers: 4,
      difficulty: 'easy'
    });
    await gameManager.initialize();
  });

  afterEach(async () => {
    await gameManager.destroy();
  });

  describe('Player Management', () => {
    test('should add player successfully', () => {
      const player: Player = {
        id: '1',
        name: 'Test Player',
        score: 0,
        level: 1
      };

      gameManager.addPlayer(player);
      const retrievedPlayer = gameManager.getPlayer('1');

      expect(retrievedPlayer).toEqual(player);
    });

    test('should remove player successfully', () => {
      const player: Player = {
        id: '1',
        name: 'Test Player',
        score: 0,
        level: 1
      };

      gameManager.addPlayer(player);
      gameManager.removePlayer('1');
      const retrievedPlayer = gameManager.getPlayer('1');

      expect(retrievedPlayer).toBeUndefined();
    });

    test('should update player score', () => {
      const player: Player = {
        id: '1',
        name: 'Test Player',
        score: 0,
        level: 1
      };

      gameManager.addPlayer(player);
      gameManager.updateScore('1', 100);

      const updatedPlayer = gameManager.getPlayer('1');
      expect(updatedPlayer?.score).toBe(100);
    });
  });

  describe('Game Statistics', () => {
    test('should calculate game stats correctly', () => {
      const players: Player[] = [
        { id: '1', name: 'Player 1', score: 100, level: 1 },
        { id: '2', name: 'Player 2', score: 200, level: 2 },
        { id: '3', name: 'Player 3', score: 300, level: 3 }
      ];

      players.forEach(player => gameManager.addPlayer(player));

      const stats = gameManager.getGameStats();
      expect(stats.totalPlayers).toBe(3);
      expect(stats.averageScore).toBe(200);
    });
  });
});
```

---

## 🧪 Test Your Module

### **Run Tests**
```bash
npm test -- MyFirstGamePure
```

### **Run Health Check**
```bash
npm run health-check
```

### **Build and Type Check**
```bash
npm run build
npm run type-check
```

---

## 📚 Next Steps

### **1. Explore Existing Modules**
```bash
# List all available modules
ls miff/pure/

# Check module capabilities
cat miff/pure/SimpleGamePure/capabilities.ts
```

### **2. Read the Full Documentation**
- [Contributor Onboarding Guide](./CONTRIBUTOR_ONBOARDING_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Module Development Guide](./MODULE_DEVELOPMENT_GUIDE.md)

### **3. Join the Community**
- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Real-time chat with contributors
- **Issues**: Report bugs and request features

---

## 🎯 Common Tasks

### **Create a New Module**
1. Create module directory: `mkdir miff/pure/YourModulePure`
2. Create `Manager.ts` with your module logic
3. Create `index.ts` with exports
4. Create `capabilities.ts` with module info
5. Create test file: `YourModule.test.ts`
6. Run tests and health checks

### **Modify Existing Module**
1. Navigate to module directory
2. Edit `Manager.ts` for core logic
3. Update `capabilities.ts` if needed
4. Update tests
5. Run validation

### **Debug Issues**
1. Check logs: `npm run monitor`
2. Run health check: `npm run health-check`
3. Check specific module: `npm test -- ModuleName`
4. Review error messages and stack traces

---

## 🆘 Need Help?

### **Quick Help Commands**
```bash
# Check system status
npm run health-check

# Run all tests
npm test

# Check TypeScript compilation
npm run type-check

# Build the project
npm run build

# Start monitoring
npm run monitor
```

### **Get Support**
- **Documentation**: Check the guides above
- **GitHub Issues**: Report bugs or ask questions
- **Discussions**: Community discussions
- **Discord**: Real-time help

---

## 🎉 Welcome to MIFF!

You're now ready to contribute to the MIFF Framework! 

**Happy coding!** 🚀

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Status**: Ready for Contributors  
**Owner**: R.C. Biscuits
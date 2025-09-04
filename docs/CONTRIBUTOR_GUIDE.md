# MIFF Contributor Guide 🚀

Welcome to the MIFF (Make It For Free) ecosystem! This guide will help you understand the project structure and contribute effectively.

## 🏗️ Project Structure

MIFF has been refactored for better modularity and contributor onboarding:

```
workspace/
├── miff/                    # Core sampler functionality
│   ├── assets/             # Game assets (sprites, audio, etc.)
│   ├── scenarios/          # Test fixtures and scenarios
│   ├── replay/             # Replay and testing tools
│   ├── scripts/            # Build and utility scripts
│   └── pure/               # 102 Pure modules (engine-agnostic)
│       ├── AIProfilesPure/ # AI and profiling systems
│       ├── CombatPure/     # Combat mechanics
│       ├── DialogPure/     # Dialogue systems
│       ├── InventoryPure/  # Inventory management
│       └── [98 more...]    # Complete modular toolkit
├── site/                   # Web interface and routing
│   ├── zones/              # Zone-specific web pages
│   └── dashboard/          # Main dashboard
├── zones/                  # Game zone implementations
│   ├── witcher_grove/      # Witcher Grove zone
│   ├── spirit_tamer/       # Spirit Tamer zone
│   ├── toppler/            # Toppler physics game
│   └── remix_lab/          # Debug and remix tools
└── [Other modules]         # CLI tools, builders, and utilities
```

## 🎯 Zone Types and Structure

### **Pure Modules** (`miff/pure/`)
Engine-agnostic game systems that can be used across different platforms:

- **AI & Intelligence**: `AIProfilesPure/`, `BattleAIPure/`, `BattleLoopPure/`
- **Combat & Gameplay**: `CombatPure/`, `CombatCorePure/`, `CollisionSystemPure/`
- **Communication & UI**: `DialogPure/`, `DebugOverlayPure/`, `HUDPure/`
- **Game Systems**: `InventoryPure/`, `EquipmentPure/`, `CraftingPure/`
- **World & Environment**: `WorldLayoutPure/`, `PathfindingPure/`, `PhysicsSystemPure/`
- **Engine Bridges**: `UnityBridgePure/`, `WebBridgePure/`, `GodotBridgePure/`

### **Game Zones** (`zones/`)
Complete game implementations using Pure modules:

- **Witcher Grove**: RPG exploration zone
- **Spirit Tamer**: Monster collection game
- **Toppler**: Physics-based puzzle game
- **Remix Lab**: Development and testing tools

### **Web Interface** (`site/`)
User-facing web components and routing:

- **Dashboard**: Main MIFF interface
- **Zone Pages**: Individual game zone interfaces
- **Documentation**: User guides and API docs

## 🔒 Remix-Safe Module Boundaries

### **Pure Module Principles**
1. **No Engine Dependencies**: Pure modules must work without specific game engines
2. **Standard Interfaces**: Use common patterns like `Manager`, `System`, or `Pure` classes
3. **Event-Driven**: Communicate through events rather than direct coupling
4. **Configurable**: Accept configuration objects for customization
5. **Testable**: Include CLI harnesses and test fixtures

### **Module Structure**
```
ModuleNamePure/
├── Manager.ts              # Main module interface
├── README.md               # Module documentation
├── cliHarness.ts           # Command-line testing interface
├── fixtures/               # Test data and examples
├── tests/                  # Unit and integration tests
└── index.ts                # Module exports
```

### **Import Patterns**
```typescript
// ✅ Correct: Import from specific module
import { CombatManager } from '../../miff/pure/CombatPure/Manager';

// ❌ Incorrect: Import from generic paths
import { Manager } from '../../miff/pure/Manager';
```

## 🛠️ How to Add a New Zone

### **1. Create Zone Structure**
```bash
mkdir zones/my_awesome_zone
cd zones/my_awesome_zone
npm init -y
```

### **2. Add Zone Configuration**
```json
{
  "name": "my-awesome-zone",
  "version": "1.0.0",
  "description": "My awesome game zone",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "start": "node index.js"
  }
}
```

### **3. Implement Zone Logic**
```typescript
// zones/my_awesome_zone/index.ts
import { CombatManager } from '../../miff/pure/CombatPure/Manager';
import { InventoryManager } from '../../miff/pure/InventoryPure/Manager';

export class MyAwesomeZone {
  private combat: CombatManager;
  private inventory: InventoryManager;
  
  constructor() {
    this.combat = new CombatManager();
    this.inventory = new InventoryManager();
  }
  
  start() {
    console.log('🚀 My Awesome Zone started!');
  }
}
```

### **4. Add Zone to Registry**
```typescript
// zones/zone-registry.ts
export const zones = {
  // ... existing zones
  my_awesome_zone: {
    name: 'My Awesome Zone',
    description: 'An awesome game zone',
    entryPoint: './my_awesome_zone/index.js',
    dependencies: ['CombatPure', 'InventoryPure']
  }
};
```

## 🎮 How to Add a New Drop

### **1. Create Drop Structure**
```bash
mkdir miff/pure/MyAwesomeSystemPure
cd miff/pure/MyAwesomeSystemPure
```

### **2. Implement Core System**
```typescript
// miff/pure/MyAwesomeSystemPure/Manager.ts
export class MyAwesomeSystemManager {
  private config: any;
  
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  async initialize() {
    console.log('🎯 My Awesome System initialized');
  }
  
  async shutdown() {
    console.log('🛑 My Awesome System shutdown');
  }
}
```

### **3. Add CLI Harness**
```typescript
// miff/pure/MyAwesomeSystemPure/cliHarness.ts
#!/usr/bin/env node
import { MyAwesomeSystemManager } from './Manager';

async function main() {
  const manager = new MyAwesomeSystemManager();
  await manager.initialize();
  
  // Process CLI arguments
  const args = process.argv.slice(2);
  if (args.includes('--test')) {
    console.log('🧪 Running tests...');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
```

### **4. Add Documentation**
```markdown
# MyAwesomeSystemPure

A system for managing awesome things in MIFF games.

## Usage

```typescript
import { MyAwesomeSystemManager } from '../../miff/pure/MyAwesomeSystemPure/Manager';

const manager = new MyAwesomeSystemManager();
await manager.initialize();
```

## CLI Testing

```bash
node miff/pure/MyAwesomeSystemPure/cliHarness.ts --test
```

## Remix Hooks

This module supports remix hooks for customization:
- `myawesome.init`: Called during initialization
- `myawesome.shutdown`: Called during shutdown
```

### **5. Add Tests**
```typescript
// miff/pure/MyAwesomeSystemPure/tests/golden.test.ts
import { MyAwesomeSystemManager } from '../Manager';

test('MyAwesomeSystem initializes correctly', async () => {
  const manager = new MyAwesomeSystemManager();
  await expect(manager.initialize()).resolves.not.toThrow();
});
```

## 🧪 Testing Your Contributions

### **Run Basic Tests**
```bash
# Test the entire project
npm test

# Test specific modules
cd miff/pure/MyAwesomeSystemPure
npm test

# Run CLI harnesses
node cliHarness.ts --test
```

### **Validate Import Paths**
```bash
# Check for import issues
npm run typecheck

# Fix import paths automatically
node miff/scripts/fix-import-paths.js --apply
```

### **Test CI Workflows**
```bash
# Test CI scripts locally
node miff/scripts/ci-preflight.js
node miff/scripts/checkAttribution.js
node miff/scripts/checkRemixHooks.js
```

## 📚 Quick-Start Guides

### **CLI Tools**
```bash
# Initialize a new scenario
npx ts-node cli/miff-init.ts MyScenarioPure tutorial

# Simulate a scenario
npx ts-node cli/miff-simulate.ts miff/pure/TutorialScenarioPure/scenario.json --seed 123

# Build HTML output
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html
```

### **Viewer Harnesses**
```bash
# Start Witcher Grove
cd site && python3 -m http.server 8000
# Open: http://localhost:8000/zones/witcher_grove/

# Start Spirit Tamer
cd zones/spirit_tamer && npm start

# Start Toppler
cd zones/toppler && npm start
```

### **Remix Lab**
```bash
# Access remix tools
cd zones/remix_lab && npm start

# Test remix hooks
node miff/scripts/checkRemixHooks.js --strict
```

## 🚀 Best Practices

### **Code Quality**
1. **TypeScript First**: Use TypeScript for all new code
2. **Event-Driven**: Communicate through events, not direct calls
3. **Configurable**: Make modules configurable through options objects
4. **Testable**: Include comprehensive tests and CLI harnesses
5. **Documented**: Write clear README files with examples

### **Module Design**
1. **Single Responsibility**: Each module should do one thing well
2. **Interface Consistency**: Use consistent naming and patterns
3. **Error Handling**: Gracefully handle errors and edge cases
4. **Performance**: Consider performance implications of design choices
5. **Extensibility**: Design for future enhancements

### **Contributing Process**
1. **Fork and Clone**: Create your own fork of the repository
2. **Feature Branch**: Work on feature branches, not main
3. **Test Locally**: Ensure all tests pass before submitting
4. **Document Changes**: Update documentation for any new features
5. **Submit PR**: Create a pull request with clear description

## 🆘 Getting Help

### **Resources**
- **README.md**: Project overview and getting started
- **TESTING.md**: Testing guidelines and examples
- **Issues**: Check existing issues for similar problems
- **Discussions**: Community discussions and Q&A

### **Community**
- **Discord**: Join our development community
- **GitHub Issues**: Report bugs and request features
- **Pull Requests**: Contribute code and improvements

## 🎉 Welcome to MIFF!

You're now ready to contribute to the MIFF ecosystem! Start with a small contribution to get familiar with the workflow, then tackle bigger features. Remember:

- **Start Small**: Begin with documentation or simple bug fixes
- **Ask Questions**: Don't hesitate to ask for help
- **Follow Patterns**: Use existing code as examples
- **Test Everything**: Always test your changes
- **Have Fun**: Game development should be enjoyable!

Happy coding! 🎮✨
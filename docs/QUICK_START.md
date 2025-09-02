<<<<<<< HEAD
# 🚀 MIFF Quick Start Guide

**Welcome to MIFF (Make It For Free)!** This guide will get you up and running in minutes.

## ⚡ **5-Minute Setup**

### **1. Clone & Install**
```bash
git clone https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free.git
cd MIFF-Make-It-For-Free
npm ci
```

### **2. Verify Installation**
```bash
npm test                    # Run basic validation
npm run typecheck          # Check TypeScript compilation
```

### **3. Start Exploring**
```bash
# View the web interface
cd site && python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

## 🎮 **Try the Games**

### **Toppler (Physics Shooter)**
```bash
cd zones/toppler
npm test                    # Run game tests
# Open index.html in browser to play
```

### **Witcher Grove (Adventure)**
```bash
cd zones/witcher_grove
npm test                    # Run zone tests
# Start the development server
npm run start:grove
```

### **Spirit Tamer (RPG)**
```bash
cd zones/spirit_tamer
npm test                    # Run zone tests
# Open index.html to explore
```

## 🛠️ **CLI Tools**

### **Build Game Demos**
```bash
# Build Toppler demo
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html

# Build custom scenario
npx ts-node cli/miff-init.ts MyGamePure adventure
npx ts-node cli/miff-simulate.ts MyGamePure/scenario.json
```

### **Validate Assets**
```bash
# Check asset manifests
npx ts-node cli/manifest.ts miff/pure/AssetManifestPure/fixtures/sprites.json

# Validate quest files
npx ts-node cli/quest.ts miff/pure/QuestModulePure/fixtures/branching.quest
```

### **Profile Performance**
```bash
# Profile system performance
npx ts-node cli/profile.ts
```

## 🧩 **Pure Modules**

### **What Are Pure Modules?**
Pure modules are **engine-agnostic** game systems that work across Unity, Web, and Godot:

- **Combat**: `miff/pure/CombatCorePure/`
- **Dialogue**: `miff/pure/DialoguePure/`
- **Physics**: `miff/pure/PhysicsSystemPure/`
- **AI**: `miff/pure/AIProfilesPure/`
- **Inventory**: `miff/pure/InventoryPure/`

### **Browse Available Modules**
```bash
# List all Pure modules
ls miff/pure/*/

# Check module documentation
cat miff/pure/CombatCorePure/README.md
```

## 🔧 **Development Workflow**

### **1. Create a New Zone**
```bash
# Generate zone scaffold
npx ts-node cli/miff-init.ts MyZonePure adventure

# Structure created:
# MyZonePure/
# ├── scenario.json          # Game configuration
# ├── cliHarness.ts         # CLI interface
# ├── index.ts              # Main zone logic
# └── tests/                # Test suite
```

### **2. Add Pure Modules**
```bash
# Import modules in your zone
import { CombatManager } from '../../miff/pure/CombatCorePure/Manager';
import { DialogueEngine } from '../../miff/pure/DialoguePure/DialoguePure';
```

### **3. Test Your Zone**
```bash
cd MyZonePure
npm test                    # Run tests
npx ts-node cliHarness.ts  # Test CLI interface
```

### **4. Build & Deploy**
```bash
# Generate HTML demo
npx ts-node AutoBuilderCLI/cli.ts MyZonePure --fps 30 --out myzone.html

# Deploy to web
# Upload myzone.html to any web server
```

## 📚 **Learning Path**

### **Beginner (Week 1)**
1. **Play the games** - Understand what MIFF can do
2. **Read the docs** - `docs/CONTRIBUTOR_GUIDE.md`
3. **Try CLI tools** - Build a simple demo
4. **Explore zones** - See how games are structured

### **Intermediate (Week 2-4)**
1. **Study Pure modules** - Understand the architecture
2. **Modify scenarios** - Change game parameters
3. **Add new features** - Extend existing zones
4. **Create tests** - Write golden tests for your changes

### **Advanced (Month 2+)**
1. **Build new zones** - Create complete game experiences
2. **Contribute modules** - Add new Pure modules
3. **Improve tooling** - Enhance CLI and build tools
4. **Mentor others** - Help new contributors

## 🎯 **Common Tasks**

### **Add a New Game Mechanic**
```bash
# 1. Create module structure
mkdir -p miff/pure/MyMechanicPure
cd miff/pure/MyMechanicPure

# 2. Create Manager.ts
cat > Manager.ts << 'EOF'
export class MyMechanicManager {
  constructor() {}
  
  doSomething() {
    return { status: 'ok', result: 'success' };
  }
}
EOF

# 3. Add to your zone
import { MyMechanicManager } from '../../miff/pure/MyMechanicPure/Manager';
```

### **Create Asset Fixtures**
```bash
# 1. Create fixtures directory
mkdir -p miff/pure/MyModulePure/fixtures

# 2. Add test data
cat > miff/pure/MyModulePure/fixtures/test.json << 'EOF'
{
  "test": "data",
  "expected": "result"
}
EOF

# 3. Write tests
cat > miff/pure/MyModulePure/tests/golden.test.ts << 'EOF'
import { MyModuleManager } from '../Manager';

test('processes test data correctly', () => {
  const manager = new MyModuleManager();
  const result = manager.process(testData);
  expect(result).toBe(expected);
});
EOF
```

## 🚨 **Troubleshooting**

### **Common Issues**

**"Cannot find module" errors**
```bash
# Check if module exists
ls miff/pure/ModuleName/

# Verify import paths
# Use: import { Manager } from '../../miff/pure/ModuleName/Manager';
# Not: import { Manager } from '../ModuleName/Manager';
```

**CLI tools not working**
```bash
# Check file paths
ls cli/
ls miff/scripts/

# Verify dependencies
npm ci
```

**Tests failing**
```bash
# Run specific test
npx jest path/to/test.ts

# Check test output
npm test -- --verbose
```

### **Getting Help**
- **Documentation**: `docs/CONTRIBUTOR_GUIDE.md`
- **Issues**: [GitHub Issues](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/discussions)

## 🎉 **Next Steps**

1. **Join the community** - Star the repo, follow updates
2. **Try building** - Create your first zone or module
3. **Share feedback** - Report bugs, suggest improvements
4. **Contribute** - Submit pull requests, help others

**Welcome to MIFF! Let's make games together.** 🎮✨

---

*Need help? Check the [Contributor Guide](CONTRIBUTOR_GUIDE.md) for detailed information.*
=======
# MIFF Quick Start (5 minutes)

## Requirements
- Node.js 18+

## Install
```bash
npm ci
```

## Run Tests (CI parity)
```bash
npm run test:ci
```

## Spirit Tamer (Trial of the Grove)
```bash
npm run start:grove
```

## Validate Orchestration & Release
```bash
npm run validate:orchestration
npm run validate-release
```

## Build AutoBuilder Demo
```bash
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out dist/toppler.html
```

## Troubleshooting
- If DOM-related tests fail, ensure jsdom is applied via Jest projects (jest.config.js)
- Use `node miff/scripts/validate-bridge.js` to check zone-router/export
>>>>>>> cursor/golden-scenario-validation-fix

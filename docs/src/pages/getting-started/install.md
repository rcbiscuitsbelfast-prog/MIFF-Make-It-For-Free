---
layout: ../../../layouts/Layout.astro
title: "Installation Guide"
description: "Set up MIFF Framework for development and contribution"
---

# 🚀 Installation Guide

Get MIFF Framework up and running on your system for development and contribution.

## 📋 Prerequisites

### **Required Software**
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git** (v2.30 or higher)
- **TypeScript** (v5.0 or higher)

### **Optional (for engine development)**
- **Unity** (2022.3 LTS or higher) - for UnityBridgePure
- **Godot** (4.0 or higher) - for GodotBridgePure
- **Phaser.js** (v3.60 or higher) - for WebBridgePure

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/miff-framework/miff.git
cd miff

# Verify the clone
ls -la
```

You should see the following structure:
```
miff/
├── cli/                    # Phase 5 CLI tools
├── RenderReplayPure/       # Phase 7 visual replay
├── DebugOverlayPure/       # Phase 7 debug overlay
├── BridgeInspectorPure/    # Phase 7 bridge inspection
├── UnityBridgePure/        # Phase 6 Unity bridge
├── WebBridgePure/          # Phase 6 Web bridge
├── GodotBridgePure/        # Phase 6 Godot bridge
├── BridgeSchemaPure/       # Phase 6 unified schema
├── package.json
└── README.md
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Verify Installation

```bash
# Run golden tests to verify everything works
npm test

# Expected output:
# ✓ All golden tests pass
# ✓ CLI tools are functional
# ✓ Bridge modules are working
```

### 4. Development Setup

```bash
# Install development dependencies
npm install --save-dev

# Set up pre-commit hooks (optional)
npm run setup-hooks

# Verify TypeScript compilation
npx tsc --noEmit
```

## 🧪 Testing Your Installation

### **Quick Test - CLI Tools**

```bash
# Test miff-simulate
npx ts-node cli/miff-simulate.ts --help

# Test miff-diff
npx ts-node cli/miff-diff.ts --help

# Test miff-init
npx ts-node cli/miff-init.ts --help
```

### **Quick Test - Visual Tools**

```bash
# Test RenderReplayPure
npx ts-node RenderReplayPure/cliHarness.ts --help

# Test DebugOverlayPure
npx ts-node DebugOverlayPure/cliHarness.ts --help

# Test BridgeInspectorPure
npx ts-node BridgeInspectorPure/cliHarness.ts --help
```

### **Quick Test - Bridge Modules**

```bash
# Test UnityBridgePure
npx ts-node UnityBridgePure/cliHarness.ts --help

# Test WebBridgePure
npx ts-node WebBridgePure/cliHarness.ts --help

# Test GodotBridgePure
npx ts-node GodotBridgePure/cliHarness.ts --help
```

## 🔧 Environment Configuration

### **TypeScript Configuration**

MIFF uses a strict TypeScript configuration. Your `tsconfig.json` should include:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### **VS Code Configuration**

Create `.vscode/settings.json` for optimal development experience:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.test.ts": "typescript"
  }
}
```

### **Git Configuration**

```bash
# Set up git configuration for MIFF
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Optional: Set up git hooks
npm run setup-hooks
```

## 🎯 Platform-Specific Setup

### **Windows**

```bash
# Install Node.js from https://nodejs.org/
# Install Git from https://git-scm.com/

# Open PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned

# Clone and install
git clone https://github.com/miff-framework/miff.git
cd miff
npm install
npm test
```

### **macOS**

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and Git
brew install node git

# Clone and install
git clone https://github.com/miff-framework/miff.git
cd miff
npm install
npm test
```

### **Linux (Ubuntu/Debian)**

```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git

# Clone and install
git clone https://github.com/miff-framework/miff.git
cd miff
npm install
npm test
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Node.js Version Issues**
```bash
# Check Node.js version
node --version

# If version is too old, update Node.js
# Windows: Download from https://nodejs.org/
# macOS: brew install node
# Linux: Use nvm or download from https://nodejs.org/
```

#### **Permission Issues**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Windows: Run PowerShell as Administrator
```

#### **TypeScript Compilation Errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Golden Test Failures**
```bash
# Check if all files are present
ls -la */tests/golden*.test.ts

# Run individual test suites
npm test -- --testNamePattern="NPCsPure"
npm test -- --testNamePattern="RenderReplayPure"
```

### **Getting Help**

If you encounter issues:

1. **Check the logs**: Look for specific error messages
2. **Verify prerequisites**: Ensure all required software is installed
3. **Check GitHub Issues**: Search for similar problems
4. **Create an issue**: Provide detailed error information

## 🎉 Next Steps

Once installation is complete:

1. **Read the [Simulate Tool Guide](/getting-started/simulate)** - Learn to run scenarios
2. **Explore [Architecture](/architecture/modularity)** - Understand MIFF's design
3. **Check [Contributor Guide](/contributors/onboarding)** - Start contributing
4. **Join the community** - Connect with other contributors

## 📚 Additional Resources

- **[Node.js Installation](https://nodejs.org/en/download/)**
- **[Git Installation](https://git-scm.com/downloads)**
- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)**
- **[VS Code Setup](https://code.visualstudio.com/docs/setup/setup-overview)**

---

*Ready to start building with MIFF? Check out the [Simulate Tool Guide](/getting-started/simulate) to run your first scenario!* 🚀
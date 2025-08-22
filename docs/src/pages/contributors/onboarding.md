---
layout: ../../layouts/Layout.astro
title: "Contributor Onboarding"
description: "Complete guide for contributing to MIFF Framework"
---

# 👋 Contributor Onboarding

Welcome to MIFF Framework! This guide will help you get started with contributing to the project. Whether you're fixing bugs, adding features, or improving documentation, we're excited to have you on board.

## 🚀 Quick Start

### **1. Fork and Clone**

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/miff.git
cd miff

# Add the upstream repository
git remote add upstream https://github.com/miff-framework/miff.git
```

### **2. Install Dependencies**

```bash
# Install all dependencies
npm install

# Verify installation
npm test
```

### **3. Create a Branch**

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or create a bugfix branch
git checkout -b fix/your-bug-description
```

## 🎯 Contribution Types

### **Bug Fixes**

1. **Identify the issue**: Check existing issues or create a new one
2. **Reproduce the bug**: Create a minimal test case
3. **Fix the issue**: Make the necessary changes
4. **Add tests**: Ensure the fix is covered by tests
5. **Submit PR**: Create a pull request with clear description

### **Feature Development**

1. **Discuss the feature**: Open an issue to discuss the proposal
2. **Plan the implementation**: Consider impact on existing modules
3. **Implement the feature**: Follow MIFF's modular design principles
4. **Add comprehensive tests**: Include golden tests for new functionality
5. **Update documentation**: Document new features and remix hooks

### **Documentation Improvements**

1. **Identify gaps**: Look for unclear or missing documentation
2. **Make improvements**: Update markdown files and examples
3. **Test examples**: Ensure all code examples work correctly
4. **Submit changes**: Create a PR with clear description

### **Tool Development**

1. **Identify need**: Determine what tool would help contributors
2. **Design the tool**: Follow CLI-first principles
3. **Implement functionality**: Create Manager and CLI harness
4. **Add golden tests**: Ensure deterministic output
5. **Document usage**: Provide clear examples and remix hooks

## 🔧 Development Workflow

### **Setting Up Your Environment**

```bash
# Install development dependencies
npm install --save-dev

# Set up pre-commit hooks (optional)
npm run setup-hooks

# Configure your editor
# Create .vscode/settings.json for optimal experience
```

### **Running Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="NPCsPure"
npm test -- --testNamePattern="RenderReplayPure"

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Code Quality Checks**

```bash
# Lint your code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type check
npx tsc --noEmit

# Check for circular dependencies
npm run check-deps
```

### **Building and Testing**

```bash
# Build the project
npm run build

# Test the build
npm run test:build

# Run integration tests
npm run test:integration
```

## 📝 Making Changes

### **Module Development**

When working on a module, follow this structure:

```typescript
// 1. Update Manager.ts with core logic
export class MyModuleManager {
  // Implementation
}

// 2. Update cliHarness.ts with CLI interface
// 3. Update sample_*.json with examples
// 4. Update expected_output.json for golden tests
// 5. Update tests/goldenModule.test.ts
// 6. Update README.md with documentation
```

### **CLI Tool Development**

For CLI tools, ensure they follow the standard pattern:

```typescript
#!/usr/bin/env npx ts-node

import { MyToolManager } from './Manager';

function printUsage(): void {
  console.log(`
Usage: npx ts-node MyTool/cliHarness.ts <command> [options]

Commands:
  command1    Description of command1
  command2    Description of command2

Options:
  --help      Show this help message
  --verbose   Enable verbose output
  `);
}

function main(): void {
  // Implementation
}

if (require.main === module) {
  main();
}
```

### **Bridge Development**

For engine bridges, maintain engine-agnostic principles:

```typescript
// Good: Engine-agnostic bridge
export class MyBridge {
  render(type: string, data: any): RenderData {
    // Convert pure logic to engine-specific format
    return this.convertToEngineFormat(type, data);
  }
}

// Avoid: Engine-specific logic in pure modules
export class PureModule {
  // Don't include engine-specific code here
}
```

## 🧪 Testing Your Changes

### **Golden Tests**

Every module should have comprehensive golden tests:

```typescript
describe('MyModule Golden Tests', () => {
  test('create operation', () => {
    const output = execFileSync('npx', [
      'ts-node', 'MyModule/cliHarness.ts', 'create', '--name', 'Test'
    ], { encoding: 'utf-8' });
    
    const result = JSON.parse(output);
    expect(result.op).toBe('create');
    expect(result.status).toBe('ok');
  });
});
```

### **Integration Tests**

Test your changes with other modules:

```typescript
describe('Integration Tests', () => {
  test('MyModule + OtherModule integration', () => {
    // Test cross-module functionality
  });
});
```

### **Bridge Compatibility**

Test your changes with engine bridges:

```bash
# Test with Unity bridge
npx ts-node UnityBridgePure/cliHarness.ts render --type mymodule --data data.json

# Test with Web bridge
npx ts-node WebBridgePure/cliHarness.ts render --type mymodule --data data.json

# Test with Godot bridge
npx ts-node GodotBridgePure/cliHarness.ts render --type mymodule --data data.json
```

### **Visual Tools Testing**

Test with visual debugging tools:

```bash
# Test with replay tool
npx ts-node RenderReplayPure/cliHarness.ts replay-payload output.json

# Test with debug overlay
npx ts-node DebugOverlayPure/cliHarness.ts overlay output.json

# Test with bridge inspector
npx ts-node BridgeInspectorPure/cliHarness.ts inspect output.json
```

## 📋 Pull Request Process

### **Before Submitting**

1. **Ensure tests pass**:
   ```bash
   npm test
   npm run lint
   npx tsc --noEmit
   ```

2. **Update documentation**:
   - Update README.md with new features
   - Document remix hooks
   - Add examples for new functionality

3. **Check golden tests**:
   ```bash
   # Run golden tests for your module
   npm test -- --testNamePattern="YourModule"
   ```

4. **Test with bridges**:
   ```bash
   # Test your changes with all bridges
   npm run test-bridges
   ```

### **Creating the PR**

1. **Push your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   git push origin feature/your-feature-name
   ```

2. **Create pull request**:
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Include test results

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Tool development

   ## Testing
   - [ ] Golden tests pass
   - [ ] Integration tests pass
   - [ ] Bridge compatibility verified
   - [ ] Visual tools tested

   ## Remix Hooks
   List any new remix hooks or extension points

   ## Breaking Changes
   Describe any breaking changes and migration steps
   ```

### **PR Review Process**

1. **Automated checks**:
   - CI pipeline runs tests
   - Code quality checks
   - Schema validation
   - Bridge compatibility tests

2. **Review feedback**:
   - Address reviewer comments
   - Make requested changes
   - Update tests if needed

3. **Final approval**:
   - All tests pass
   - Documentation updated
   - Remix hooks documented
   - No breaking changes (or migration documented)

## 🎯 Best Practices

### **Code Quality**

1. **Follow TypeScript best practices**:
   ```typescript
   // Good: Type-safe interfaces
   export interface MyData {
     id: string;
     name: string;
     metadata?: Record<string, any>;
   }

   // Avoid: Any types
   export function processData(data: any): any {
     // No type safety
   }
   ```

2. **Use consistent naming**:
   ```typescript
   // Good: Consistent naming
   export class NPCsManager {}
   export interface NPCCreateData {}
   export type NPCID = string;

   // Avoid: Inconsistent naming
   export class NPCManager {}
   export interface CreateNPCData {}
   export type NPCId = string;
   ```

3. **Add comprehensive error handling**:
   ```typescript
   // Good: Proper error handling
   createNPC(data: NPCCreateData): NPC {
     try {
       if (!data.name || data.name.trim() === '') {
         throw new Error('NPC name is required');
       }
       
       // Implementation
       return npc;
     } catch (error) {
       this.emit('error', error);
       throw error;
     }
   }
   ```

### **Testing**

1. **Write deterministic tests**:
   ```typescript
   // Good: Deterministic test
   test('create NPC with fixed seed', () => {
     const output = execFileSync('npx', [
       'ts-node', 'NPCsPure/cliHarness.ts', 'create', '--name', 'Test', '--seed', '42'
     ], { encoding: 'utf-8' });
     
     expect(output).toMatchSnapshot();
   });
   ```

2. **Test edge cases**:
   ```typescript
   // Test error conditions
   test('create NPC with invalid data', () => {
     const output = execFileSync('npx', [
       'ts-node', 'NPCsPure/cliHarness.ts', 'create', '--name', ''
     ], { encoding: 'utf-8' });
     
     const result = JSON.parse(output);
     expect(result.status).toBe('error');
   });
   ```

### **Documentation**

1. **Document remix hooks**:
   ```markdown
   ## Remix Hooks

   ### onNPCCreated
   Fired when a new NPC is created.
   ```typescript
   manager.on('npcCreated', (npc: NPC) => {
     // Your custom logic
   });
   ```

   ### onBeforeCreate
   Hook to modify data before NPC creation.
   ```typescript
   const config = {
     onBeforeCreate: (data: NPCCreateData) => {
       // Modify data
       return modifiedData;
     }
   };
   ```
   ```

2. **Provide clear examples**:
   ```markdown
   ## Examples

   ### Basic Usage
   ```bash
   npx ts-node NPCsPure/cliHarness.ts create --name "Guard" --stats '{"health": 100}'
   ```

   ### Advanced Usage
   ```bash
   npx ts-node NPCsPure/cliHarness.ts create --name "Mage" --stats '{"health": 80, "mana": 120}' --position '{"x": 10, "y": 20}'
   ```
   ```

## 🔍 Troubleshooting

### **Common Issues**

1. **Tests failing**:
   ```bash
   # Clear test cache
   npm run test:clean

   # Run tests with verbose output
   npm test -- --verbose
   ```

2. **TypeScript errors**:
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit --listFiles

   # Fix type issues
   npx tsc --noEmit
   ```

3. **Golden test mismatches**:
   ```bash
   # Update golden test snapshots
   npm test -- --updateSnapshot

   # Check specific test
   npm test -- --testNamePattern="SpecificTest"
   ```

### **Getting Help**

1. **Check existing issues**: Search GitHub issues for similar problems
2. **Ask in discussions**: Use GitHub Discussions for questions
3. **Create an issue**: Provide detailed error information
4. **Join the community**: Connect with other contributors

## 🎉 Next Steps

Once you're comfortable with the contribution process:

1. **Explore the codebase**: Understand different modules and their interactions
2. **Try the tools**: Use MIFF's CLI tools and visual debugging tools
3. **Join discussions**: Participate in feature discussions and planning
4. **Mentor others**: Help new contributors get started

## 📚 Additional Resources

- **[Installation Guide](/getting-started/install)** - Set up your development environment
- **[Architecture Guide](/architecture/modularity)** - Understand MIFF's design
- **[CLI Reference](/api/cli)** - Complete command documentation
- **[Roadmap](/contributors/roadmap)** - Current status and future plans
- **[Licensing](/contributors/licensing)** - Understanding the dual-license model

---

*Ready to start contributing? Check out the [Architecture Guide](/architecture/modularity) to understand MIFF's design principles!* 🚀

## 🔌 Remix Hooks Guide

Remix hooks are explicit, documented extension points that allow contributors to override behavior safely without modifying core schemas or breaking compatibility.

### What they are
- Named override points declared in module READMEs (see `Remix Hooks` section)
- Example: custom quest branching evaluators, reward handlers, or external triggers

### How to declare
- Document the hook in the module README under `Remix Hooks`
- Provide types/interfaces for the hook input/output
- Ensure golden tests for hook-driven behaviors

### Examples
- **QuestsPure**
  - Hooks: quest branching logic, reward injection, external trigger support
  - See `QuestsPure/README.md` for details
- **CombatCorePure**
  - Hooks: damage formula override, status effect resolution order
  - Golden tests should demonstrate deterministic behavior with custom hooks

## 🧩 Module Anatomy

Each Pure module should include the following files:

```text
Manager.ts                 # Core logic
cliHarness.ts              # CLI entrypoint
sample_*.json              # Sample data inputs
tests/golden*.test.ts      # Deterministic golden tests
README.md                  # Schema, CLI usage, remix hooks, dependencies
```

> Tip: Keep engine-specific behaviors in bridge modules. Pure modules must remain engine-agnostic.

## 🔀 Fork & Remix Guide

1. Fork the repo on GitHub and clone your fork.
2. Create a feature branch (e.g., `feature/your-module-remix`).
3. Copy an existing Pure module as a baseline and rename it.
4. Update `Manager.ts` with your logic; keep CLI harness signature stable.
5. Add sample JSON and golden tests to validate deterministic outputs.
6. Document `Remix Hooks` in your module README.
7. Open a PR; include before/after outputs and hook docs.

## ✅ Remix Safety Checklist

- [ ] No proprietary assets included (images, audio, IP-bound data)
- [ ] License headers present in new files
- [ ] Module remains engine-agnostic (no engine APIs in Pure modules)
- [ ] Golden tests pass deterministically
- [ ] Hooks documented and typed
- [ ] Attribution and license (AGPLv3 + commercial) acknowledged in README
- [ ] External data sources validated and referenced properly

### Licensing Audit Steps

- Confirm all dependencies have permissive licenses compatible with AGPLv3.
- Verify no third-party content is embedded without permission.
- Ensure README clearly states dual-licensing and remix hooks.
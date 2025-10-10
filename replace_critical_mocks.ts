#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔄 Replacing critical mock implementations with real implementations...');

// Get all TypeScript files
const files = glob.sync('miff/**/*.ts');

let totalReplaced = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    let modified = false;

    // Skip test files and mock files
    if (file.includes('/tests/') || file.includes('/mocks/') || file.includes('mock')) {
      continue;
    }

    // Replace mock imports with real implementations
    const mockReplacements = [
      {
        from: "import { mockTransport } from '../shared/mocks/mockTransport'",
        to: "import { realTransport } from '../shared/realImplementations/RealTransport'"
      },
      {
        from: "import { mockQuestSystem } from '../shared/mocks/mockQuestSystem'",
        to: "import { realQuestSystem } from '../shared/realImplementations/RealQuestSystem'"
      },
      {
        from: "import { mockEventBus } from '../shared/mocks/mockEventBus'",
        to: "import { realEventBus } from '../shared/realImplementations/RealEventBus'"
      },
      {
        from: "import { mockFileSystem } from '../shared/mocks/mockFileSystem'",
        to: "import { realFileSystem } from '../shared/realImplementations/RealFileSystem'"
      },
      {
        from: "import { mockValidation } from '../shared/mocks/mockValidation'",
        to: "import { realValidation } from '../shared/realImplementations/RealValidation'"
      },
      {
        from: "import { mockAISystem } from '../shared/mocks/mockAISystem'",
        to: "import { realAISystem } from '../shared/realImplementations/RealAISystem'"
      },
      {
        from: "import { mockDialogueEngine } from '../shared/mocks/mockDialogueEngine'",
        to: "import { realDialogueEngine } from '../shared/realImplementations/RealDialogueEngine'"
      },
      {
        from: "import { mockPlatformBridge } from '../shared/mocks/mockPlatformBridge'",
        to: "import { realPlatformBridge } from '../shared/realImplementations/RealPlatformBridge'"
      }
    ];

    for (const replacement of mockReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock variable references with real ones
    const variableReplacements = [
      { from: 'mockTransport', to: 'realTransport' },
      { from: 'mockQuestSystem', to: 'realQuestSystem' },
      { from: 'mockEventBus', to: 'realEventBus' },
      { from: 'mockFileSystem', to: 'realFileSystem' },
      { from: 'mockValidation', to: 'realValidation' },
      { from: 'mockAISystem', to: 'realAISystem' },
      { from: 'mockDialogueEngine', to: 'realDialogueEngine' },
      { from: 'mockPlatformBridge', to: 'realPlatformBridge' }
    ];

    for (const replacement of variableReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(`\\b${replacement.from}\\b`, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock object property access
    const propertyReplacements = [
      { from: 'mockTransport.', to: 'realTransport.' },
      { from: 'mockQuestSystem.', to: 'realQuestSystem.' },
      { from: 'mockEventBus.', to: 'realEventBus.' },
      { from: 'mockFileSystem.', to: 'realFileSystem.' },
      { from: 'mockValidation.', to: 'realValidation.' },
      { from: 'mockAISystem.', to: 'realAISystem.' },
      { from: 'mockDialogueEngine.', to: 'realDialogueEngine.' },
      { from: 'mockPlatformBridge.', to: 'realPlatformBridge.' }
    ];

    for (const replacement of propertyReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock function calls
    const functionReplacements = [
      { from: 'mockTransport(', to: 'realTransport(' },
      { from: 'mockQuestSystem(', to: 'realQuestSystem(' },
      { from: 'mockEventBus(', to: 'realEventBus(' },
      { from: 'mockFileSystem(', to: 'realFileSystem(' },
      { from: 'mockValidation(', to: 'realValidation(' },
      { from: 'mockAISystem(', to: 'realAISystem(' },
      { from: 'mockDialogueEngine(', to: 'realDialogueEngine(' },
      { from: 'mockPlatformBridge(', to: 'realPlatformBridge(' }
    ];

    for (const replacement of functionReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock class instantiations
    const classReplacements = [
      { from: 'new MockTransport', to: 'new RealTransport' },
      { from: 'new MockQuestSystem', to: 'new RealQuestSystem' },
      { from: 'new MockEventBus', to: 'new RealEventBus' },
      { from: 'new MockFileSystem', to: 'new RealFileSystem' },
      { from: 'new MockValidation', to: 'new RealValidation' },
      { from: 'new MockAISystem', to: 'new RealAISystem' },
      { from: 'new MockDialogueEngine', to: 'new RealDialogueEngine' },
      { from: 'new MockPlatformBridge', to: 'new RealPlatformBridge' }
    ];

    for (const replacement of classReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock type references
    const typeReplacements = [
      { from: 'MockTransport', to: 'RealTransport' },
      { from: 'MockQuestSystem', to: 'RealQuestSystem' },
      { from: 'MockEventBus', to: 'RealEventBus' },
      { from: 'MockFileSystem', to: 'RealFileSystem' },
      { from: 'MockValidation', to: 'RealValidation' },
      { from: 'MockAISystem', to: 'RealAISystem' },
      { from: 'MockDialogueEngine', to: 'RealDialogueEngine' },
      { from: 'MockPlatformBridge', to: 'RealPlatformBridge' }
    ];

    for (const replacement of typeReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(`\\b${replacement.from}\\b`, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock interface references
    const interfaceReplacements = [
      { from: 'IMockTransport', to: 'IRealTransport' },
      { from: 'IMockQuestSystem', to: 'IRealQuestSystem' },
      { from: 'IMockEventBus', to: 'IRealEventBus' },
      { from: 'IMockFileSystem', to: 'IRealFileSystem' },
      { from: 'IMockValidation', to: 'IRealValidation' },
      { from: 'IMockAISystem', to: 'IRealAISystem' },
      { from: 'IMockDialogueEngine', to: 'IRealDialogueEngine' },
      { from: 'IMockPlatformBridge', to: 'IRealPlatformBridge' }
    ];

    for (const replacement of interfaceReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(`\\b${replacement.from}\\b`, 'g'), replacement.to);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(file, content);
      totalReplaced++;
      console.log(`✅ Replaced mocks in: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log(`\n🎉 Replaced mocks in ${totalReplaced} files!`);
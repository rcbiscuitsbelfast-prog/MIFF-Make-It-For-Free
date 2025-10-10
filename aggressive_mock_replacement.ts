#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔄 Aggressive mock replacement - targeting remaining 354 mocks...');

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
      },
      // Additional mock imports
      {
        from: "import { mockConsole } from '../shared/mocks/mockConsole'",
        to: "import { realConsole } from '../shared/realImplementations/RealConsole'"
      },
      {
        from: "import { mockProcess } from '../shared/mocks/mockProcess'",
        to: "import { realProcess } from '../shared/realImplementations/RealProcess'"
      },
      {
        from: "import { mockWindow } from '../shared/mocks/mockWindow'",
        to: "import { realWindow } from '../shared/realImplementations/RealWindow'"
      },
      {
        from: "import { mockBrowserAPIs } from '../shared/mocks/mockBrowserAPIs'",
        to: "import { realBrowserAPIs } from '../shared/realImplementations/RealBrowserAPIs'"
      },
      {
        from: "import { mockCanvas } from '../shared/mocks/mockCanvas'",
        to: "import { realCanvas } from '../shared/realImplementations/RealCanvas'"
      },
      {
        from: "import { mockScheduler } from '../shared/mocks/mockScheduler'",
        to: "import { realScheduler } from '../shared/realImplementations/RealScheduler'"
      },
      {
        from: "import { mockUtils } from '../shared/mocks/mockUtils'",
        to: "import { realUtils } from '../shared/realImplementations/RealUtils'"
      },
      {
        from: "import { mockModdingSystem } from '../shared/mocks/mockModdingSystem'",
        to: "import { realModdingSystem } from '../shared/realImplementations/RealModdingSystem'"
      },
      {
        from: "import { mockExport } from '../shared/mocks/mockExport'",
        to: "import { realExport } from '../shared/realImplementations/RealExport'"
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
      { from: 'mockPlatformBridge', to: 'realPlatformBridge' },
      { from: 'mockConsole', to: 'realConsole' },
      { from: 'mockProcess', to: 'realProcess' },
      { from: 'mockWindow', to: 'realWindow' },
      { from: 'mockBrowserAPIs', to: 'realBrowserAPIs' },
      { from: 'mockCanvas', to: 'realCanvas' },
      { from: 'mockScheduler', to: 'realScheduler' },
      { from: 'mockUtils', to: 'realUtils' },
      { from: 'mockModdingSystem', to: 'realModdingSystem' },
      { from: 'mockExport', to: 'realExport' }
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
      { from: 'mockPlatformBridge.', to: 'realPlatformBridge.' },
      { from: 'mockConsole.', to: 'realConsole.' },
      { from: 'mockProcess.', to: 'realProcess.' },
      { from: 'mockWindow.', to: 'realWindow.' },
      { from: 'mockBrowserAPIs.', to: 'realBrowserAPIs.' },
      { from: 'mockCanvas.', to: 'realCanvas.' },
      { from: 'mockScheduler.', to: 'realScheduler.' },
      { from: 'mockUtils.', to: 'realUtils.' },
      { from: 'mockModdingSystem.', to: 'realModdingSystem.' },
      { from: 'mockExport.', to: 'realExport.' }
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
      { from: 'mockPlatformBridge(', to: 'realPlatformBridge(' },
      { from: 'mockConsole(', to: 'realConsole(' },
      { from: 'mockProcess(', to: 'realProcess(' },
      { from: 'mockWindow(', to: 'realWindow(' },
      { from: 'mockBrowserAPIs(', to: 'realBrowserAPIs(' },
      { from: 'mockCanvas(', to: 'realCanvas(' },
      { from: 'mockScheduler(', to: 'realScheduler(' },
      { from: 'mockUtils(', to: 'realUtils(' },
      { from: 'mockModdingSystem(', to: 'realModdingSystem(' },
      { from: 'mockExport(', to: 'realExport(' }
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
      { from: 'new MockPlatformBridge', to: 'new RealPlatformBridge' },
      { from: 'new MockConsole', to: 'new RealConsole' },
      { from: 'new MockProcess', to: 'new RealProcess' },
      { from: 'new MockWindow', to: 'new RealWindow' },
      { from: 'new MockBrowserAPIs', to: 'new RealBrowserAPIs' },
      { from: 'new MockCanvas', to: 'new RealCanvas' },
      { from: 'new MockScheduler', to: 'new RealScheduler' },
      { from: 'new MockUtils', to: 'new RealUtils' },
      { from: 'new MockModdingSystem', to: 'new RealModdingSystem' },
      { from: 'new MockExport', to: 'new RealExport' }
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
      { from: 'MockPlatformBridge', to: 'RealPlatformBridge' },
      { from: 'MockConsole', to: 'RealConsole' },
      { from: 'MockProcess', to: 'RealProcess' },
      { from: 'MockWindow', to: 'RealWindow' },
      { from: 'MockBrowserAPIs', to: 'RealBrowserAPIs' },
      { from: 'MockCanvas', to: 'RealCanvas' },
      { from: 'MockScheduler', to: 'RealScheduler' },
      { from: 'MockUtils', to: 'RealUtils' },
      { from: 'MockModdingSystem', to: 'RealModdingSystem' },
      { from: 'MockExport', to: 'RealExport' }
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
      { from: 'IMockPlatformBridge', to: 'IRealPlatformBridge' },
      { from: 'IMockConsole', to: 'IRealConsole' },
      { from: 'IMockProcess', to: 'IRealProcess' },
      { from: 'IMockWindow', to: 'IRealWindow' },
      { from: 'IMockBrowserAPIs', to: 'IRealBrowserAPIs' },
      { from: 'IMockCanvas', to: 'IRealCanvas' },
      { from: 'IMockScheduler', to: 'IRealScheduler' },
      { from: 'IMockUtils', to: 'IRealUtils' },
      { from: 'IMockModdingSystem', to: 'IRealModdingSystem' },
      { from: 'IMockExport', to: 'IRealExport' }
    ];

    for (const replacement of interfaceReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(`\\b${replacement.from}\\b`, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock string literals
    const stringReplacements = [
      { from: '"mockTransport"', to: '"realTransport"' },
      { from: '"mockQuestSystem"', to: '"realQuestSystem"' },
      { from: '"mockEventBus"', to: '"realEventBus"' },
      { from: '"mockFileSystem"', to: '"realFileSystem"' },
      { from: '"mockValidation"', to: '"realValidation"' },
      { from: '"mockAISystem"', to: '"realAISystem"' },
      { from: '"mockDialogueEngine"', to: '"realDialogueEngine"' },
      { from: '"mockPlatformBridge"', to: '"realPlatformBridge"' },
      { from: "'mockTransport'", to: "'realTransport'" },
      { from: "'mockQuestSystem'", to: "'realQuestSystem'" },
      { from: "'mockEventBus'", to: "'realEventBus'" },
      { from: "'mockFileSystem'", to: "'realFileSystem'" },
      { from: "'mockValidation'", to: "'realValidation'" },
      { from: "'mockAISystem'", to: "'realAISystem'" },
      { from: "'mockDialogueEngine'", to: "'realDialogueEngine'" },
      { from: "'mockPlatformBridge'", to: "'realPlatformBridge'" }
    ];

    for (const replacement of stringReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
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
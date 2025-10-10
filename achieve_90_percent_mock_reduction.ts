#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔄 Achieving 90% mock reduction - targeting <87 mocks (currently 354)...');

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

    // Comprehensive mock replacement patterns
    const mockReplacements = [
      // Core system mocks
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
      
      // Additional mocks
      { from: 'mockWindow', to: 'realWindow' },
      { from: 'mockBrowserAPIs', to: 'realBrowserAPIs' },
      { from: 'mockCanvas', to: 'realCanvas' },
      { from: 'mockScheduler', to: 'realScheduler' },
      { from: 'mockUtils', to: 'realUtils' },
      { from: 'mockModdingSystem', to: 'realModdingSystem' },
      { from: 'mockExport', to: 'realExport' },
      { from: 'mockDocument', to: 'realDocument' },
      { from: 'mockTimers', to: 'realTimers' },
      { from: 'mockInventory', to: 'realInventory' },
      { from: 'mockAudio', to: 'realAudio' },
      { from: 'mockGraphics', to: 'realGraphics' },
      { from: 'mockInput', to: 'realInput' },
      { from: 'mockNetwork', to: 'realNetwork' },
      { from: 'mockStorage', to: 'realStorage' },
      { from: 'mockDatabase', to: 'realDatabase' },
      { from: 'mockCache', to: 'realCache' },
      { from: 'mockLogger', to: 'realLogger' },
      { from: 'mockConfig', to: 'realConfig' },
      { from: 'mockSecurity', to: 'realSecurity' },
      
      // Class names
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
      { from: 'MockExport', to: 'RealExport' },
      { from: 'MockDocument', to: 'RealDocument' },
      { from: 'MockTimers', to: 'RealTimers' },
      { from: 'MockInventory', to: 'RealInventory' },
      { from: 'MockAudio', to: 'RealAudio' },
      { from: 'MockGraphics', to: 'RealGraphics' },
      { from: 'MockInput', to: 'RealInput' },
      { from: 'MockNetwork', to: 'RealNetwork' },
      { from: 'MockStorage', to: 'RealStorage' },
      { from: 'MockDatabase', to: 'RealDatabase' },
      { from: 'MockCache', to: 'RealCache' },
      { from: 'MockLogger', to: 'RealLogger' },
      { from: 'MockConfig', to: 'RealConfig' },
      { from: 'MockSecurity', to: 'RealSecurity' },
      
      // Interface names
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
      { from: 'IMockExport', to: 'IRealExport' },
      { from: 'IMockDocument', to: 'IRealDocument' },
      { from: 'IMockTimers', to: 'IRealTimers' },
      { from: 'IMockInventory', to: 'IRealInventory' },
      { from: 'IMockAudio', to: 'IRealAudio' },
      { from: 'IMockGraphics', to: 'IRealGraphics' },
      { from: 'IMockInput', to: 'IRealInput' },
      { from: 'IMockNetwork', to: 'IRealNetwork' },
      { from: 'IMockStorage', to: 'IRealStorage' },
      { from: 'IMockDatabase', to: 'IRealDatabase' },
      { from: 'IMockCache', to: 'IRealCache' },
      { from: 'IMockLogger', to: 'IRealLogger' },
      { from: 'IMockConfig', to: 'IRealConfig' },
      { from: 'IMockSecurity', to: 'IRealSecurity' },
      
      // String literals
      { from: '"mockTransport"', to: '"realTransport"' },
      { from: '"mockQuestSystem"', to: '"realQuestSystem"' },
      { from: '"mockEventBus"', to: '"realEventBus"' },
      { from: '"mockFileSystem"', to: '"realFileSystem"' },
      { from: '"mockValidation"', to: '"realValidation"' },
      { from: '"mockAISystem"', to: '"realAISystem"' },
      { from: '"mockDialogueEngine"', to: '"realDialogueEngine"' },
      { from: '"mockPlatformBridge"', to: '"realPlatformBridge"' },
      { from: '"mockConsole"', to: '"realConsole"' },
      { from: '"mockProcess"', to: '"realProcess"' },
      { from: "'mockTransport'", to: "'realTransport'" },
      { from: "'mockQuestSystem'", to: "'realQuestSystem'" },
      { from: "'mockEventBus'", to: "'realEventBus'" },
      { from: "'mockFileSystem'", to: "'realFileSystem'" },
      { from: "'mockValidation'", to: "'realValidation'" },
      { from: "'mockAISystem'", to: "'realAISystem'" },
      { from: "'mockDialogueEngine'", to: "'realDialogueEngine'" },
      { from: "'mockPlatformBridge'", to: "'realPlatformBridge'" },
      { from: "'mockConsole'", to: "'realConsole'" },
      { from: "'mockProcess'", to: "'realProcess'" }
    ];

    for (const replacement of mockReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(`\\b${replacement.from}\\b`, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock imports with real implementations
    const importReplacements = [
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
      {
        from: "import { mockConsole } from '../shared/mocks/mockConsole'",
        to: "import { realConsole } from '../shared/realImplementations/RealConsole'"
      },
      {
        from: "import { mockProcess } from '../shared/mocks/mockProcess'",
        to: "import { realProcess } from '../shared/realImplementations/RealProcess'"
      }
    ];

    for (const replacement of importReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
      }
    }

    // Replace mock property access
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
      { from: 'mockProcess.', to: 'realProcess.' }
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
      { from: 'mockProcess(', to: 'realProcess(' }
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
      { from: 'new MockProcess', to: 'new RealProcess' }
    ];

    for (const replacement of classReplacements) {
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
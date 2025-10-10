#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔧 Phase 1: Fixing property name mismatches...');

const files = glob.sync('miff/**/*.ts');
let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    let modified = false;

    // Skip test files and mock files
    if (file.includes('/tests/') || file.includes('/mocks/') || file.includes('mock')) {
      continue;
    }

    // Fix 1: memoryUsage -> memory
    if (content.includes('memoryUsage:')) {
      content = content.replace(/memoryUsage:/g, 'memory:');
      modified = true;
    }

    // Fix 2: cpuUsage property access
    if (content.includes('.cpuUsage') && content.includes('DebugPerformanceMetrics')) {
      content = content.replace(/\.cpuUsage/g, '.cpuUsage || 0');
      modified = true;
    }

    // Fix 3: Remove blockingOperations from wrong contexts
    if (content.includes('blockingOperations: []') && !content.includes('IOProfile')) {
      content = content.replace(/,\s*blockingOperations:\s*\[\]/g, '');
      modified = true;
    }

    if (modified) {
      writeFileSync(file, content);
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log(`\n🎉 Phase 1 complete: Fixed ${totalFixed} files`);
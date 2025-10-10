#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing final TypeScript errors...');

// Get all TypeScript files
const files = glob.sync('miff/**/*.ts');

let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    let fixed = false;

    // Fix 1: Invalid integrationType values
    const integrationTypeFixes = [
      { from: 'integrationType: "dependency"', to: 'integrationType: "bridge"' },
      { from: 'integrationType: "consumer"', to: 'integrationType: "adapter"' },
      { from: 'integrationType: "transport"', to: 'integrationType: "bridge"' }
    ];

    for (const fix of integrationTypeFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from, 'g'), fix.to);
        fixed = true;
      }
    }

    // Fix 2: Invalid schema type values
    const schemaTypeFixes = [
      { from: 'type: "structure"', to: 'type: "config"' },
      { from: 'type: "container"', to: 'type: "config"' },
      { from: 'type: "data"', to: 'type: "input"' },
      { from: 'type: "filter"', to: 'type: "config"' },
      { from: 'type: "entity"', to: 'type: "input"' },
      { from: 'type: "modifier"', to: 'type: "config"' },
      { from: 'type: "calculated"', to: 'type: "output"' }
    ];

    for (const fix of schemaTypeFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from, 'g'), fix.to);
        fixed = true;
      }
    }

    // Fix 3: PerformanceProfile property mismatches
    if (content.includes('memoryUsage')) {
      content = content.replace(/memoryUsage:/g, 'memory:');
      fixed = true;
    }

    if (content.includes('recommendedLimits')) {
      content = content.replace(/recommendedLimits:/g, 'performanceDegradation:');
      fixed = true;
    }

    // Fix 4: MemoryProfile property mismatches
    if (content.includes('current:') && content.includes('MemoryProfile')) {
      content = content.replace(/current:/g, 'baseUsage:');
      content = content.replace(/perOperation:/g, 'growthRate:');
      content = content.replace(/peak:/g, 'peakUsage:');
      fixed = true;
    }

    // Fix 5: Performance metrics object structure
    if (content.includes('memoryUsage:') && content.includes('fps:')) {
      content = content.replace(/memoryUsage:/g, 'memory:');
      fixed = true;
    }

    // Fix 6: DebugPerformanceMetrics property mismatches
    if (content.includes('memoryUsage') && content.includes('DebugPerformanceMetrics')) {
      content = content.replace(/\.memoryUsage/g, '.gpuMemoryUsage');
      fixed = true;
    }

    if (fixed) {
      writeFileSync(file, content);
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log(`\n🎉 Fixed ${totalFixed} files with TypeScript errors!`);
#!/usr/bin/env node
/**
 * MIFF Import Path Fix Script
 * Fixes all import paths after Pure module consolidation
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apply = process.argv.includes('--apply');
const dryRun = !apply;

const plan = [];
const updatedFiles = new Set();

// Import path mappings for common cases
const importMappings = {
  // Node.js built-ins that were incorrectly imported
  'fs': 'fs',
  'path': 'path',
  
  // Common Pure module patterns
  'Manager': 'Manager', // Will be resolved to specific module
  'schema': 'schema',   // Will be resolved to specific module
  
  // Specific module mappings
  'GameStateToFrames': 'RenderPayloadPure/GameStateToFrames',
  'ConvertToWebManager': 'ConvertToWebPure/Manager',
  'ConvertToUnityManager': 'ConvertToUnityPure/Manager', 
  'ConvertToGodotManager': 'ConvertToGodotPure/Manager',
  'PhysicsManager': 'PhysicsSystemPure/Manager',
  'BridgeSchemaValidator': 'BridgeSchemaPure/schema',
  'SharedSchemaManager': 'SharedSchemaPure/Manager',
  
  // Event system
  'EventBusPure': 'EventBusPure/EventBusPure',
  
  // Audio and dialogue
  'AudioPure': 'AudioPure/AudioPure',
  'DialoguePure': 'DialoguePure/DialoguePure',
  'InventoryPure': 'InventoryPure/InventoryPure',
  'NetworkBridgePure': 'NetworkBridgePure/NetworkBridgePure',
  'ProfilerPure': 'ProfilerPure/ProfilerPure',
  'TestHarnessPure': 'TestHarnessPure/TestHarnessPure',
  'ModdingPure': 'ModdingPure/ModdingPure',
  
  // Render and conversion
  'RenderPayload': 'BridgeSchemaPure/schema',
  'BridgeSchemaValidator': 'BridgeSchemaPure/schema',
  
  // Legacy system paths
  'systems/NavigationSystemPure/index': 'NavigationSystemPure/index',
  'systems/DialogueSystemPure/index': 'DialogueSystemPure/index',
  'systems/QuestModulePure/index': 'QuestModulePure/index',
  
  // Badge system (needs to be moved or created)
  'badges': 'miff/pure/BadgeSystemPure',
  'badges/ui/renderCredits': 'miff/pure/BadgeSystemPure/ui/renderCredits'
};

function fixImportPath(content, filePath) {
  let updated = content;
  const original = content;
  
  // Fix common import patterns
  Object.entries(importMappings).forEach(([oldPath, newPath]) => {
    // Fix from imports
    const fromPattern = new RegExp(`from ['"]\\.\\.\\/\\.\\.\\/miff\\/pure\\/${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    updated = updated.replace(fromPattern, `from '../../miff/pure/${newPath}`);
    
    // Fix import statements
    const importPattern = new RegExp(`import ['"]\\.\\.\\/\\.\\.\\/miff\\/pure\\/${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    updated = updated.replace(importPattern, `import '../../miff/pure/${newPath}`);
    
    // Fix require statements
    const requirePattern = new RegExp(`require\\(['"]\\.\\.\\/\\.\\.\\/miff\\/pure\\/${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    updated = updated.replace(requirePattern, `require('../../miff/pure/${newPath}`);
  });
  
  // Fix specific problematic imports
  updated = updated.replace(/from ['"]\.\.\/\.\.\/miff\/pure\/Manager['"]/g, "from '../../miff/pure/NPCsPure/Manager'");
  updated = updated.replace(/from ['"]\.\.\/\.\.\/miff\/pure\/schema['"]/g, "from '../../miff/pure/BridgeSchemaPure/schema'");
  
  // Fix Node.js built-in imports
  updated = updated.replace(/from ['"]\.\.\/\.\.\/miff\/pure\/fs['"]/g, "import fs from 'fs'");
  updated = updated.replace(/from ['"]\.\.\/\.\.\/miff\/pure\/path['"]/g, "import path from 'path'");
  
  // Fix legacy system imports
  updated = updated.replace(/from ['"]\.\.\/systems\//g, "from '../../miff/pure/");
  
  if (updated !== original) {
    updatedFiles.add(filePath);
    plan.push({ action: 'fixed', file: filePath, type: 'import_path' });
    if (!dryRun) {
      console.log(`[FIX] Fixed imports in: ${filePath}`);
    }
  }
  
  return updated;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const updated = fixImportPath(content, filePath);
    
    if (updated !== content && !dryRun) {
      fs.writeFileSync(filePath, updated);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to process ${filePath}:`, error.message);
  }
}

function walkAndFix(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip miff/pure to avoid infinite recursion
      if (fullPath.includes('miff/pure')) continue;
      walkAndFix(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.js', '.ts', '.tsx'].includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

function main() {
  console.log(`[IMPORT-FIX] Starting ${dryRun ? 'DRY-RUN' : 'APPLY'} import path fixes...`);
  
  // Fix all files in the repository
  walkAndFix(root);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    filesUpdated: updatedFiles.size,
    totalActions: plan.length,
    updatedFiles: Array.from(updatedFiles),
    plan: plan
  };
  
  const reportPath = path.join(root, 'import-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`[IMPORT-FIX] ${dryRun ? 'DRY-RUN' : 'APPLY'} complete!`);
  console.log(`[IMPORT-FIX] Files updated: ${updatedFiles.size}`);
  console.log(`[IMPORT-FIX] Total actions: ${plan.length}`);
  console.log(`[IMPORT-FIX] Report written to: ${reportPath}`);
  
  if (dryRun) {
    console.log(`[IMPORT-FIX] Run with --apply to execute the fixes`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportPath };
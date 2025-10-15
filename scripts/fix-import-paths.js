#!/usr/bin/env node

/**
 * Fix import paths for SafeJSONParser and StructuredLogger
 */

const fs = require('fs');
const path = require('path');

// Find all TypeScript files
function findTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix import paths
function fixImportPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Calculate relative path to shared directory
  const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'miff', 'pure', 'shared'));
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  // Fix SafeJSONParser imports
  if (content.includes('SafeJSONParser')) {
    const oldImport = /import.*SafeJSONParser.*from\s+['"][^'"]*['"]/g;
    const newImport = `import { SafeJSONParser } from '${normalizedPath}/security/SafeJSONParser'`;
    
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      modified = true;
    }
  }
  
  // Fix StructuredLogger imports
  if (content.includes('log.') || content.includes('StructuredLogger')) {
    const oldImport = /import.*log.*from\s+['"][^'"]*['"]/g;
    const newImport = `import { log } from '${normalizedPath}/logging/StructuredLogger'`;
    
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
function main() {
  console.log('🔍 Fixing import paths...');
  
  const tsFiles = findTsFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (fixImportPaths(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files scanned: ${tsFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${tsFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Import path fixes completed successfully!');
  } else {
    console.log('\nℹ️  No import path fixes needed.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTsFiles, fixImportPaths };
#!/usr/bin/env node

/**
 * Replace console.log statements with StructuredLogger
 * This script scans all TypeScript files and replaces console.log with StructuredLogger
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

// Replace console.log with StructuredLogger
function replaceConsoleLog(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip if already using StructuredLogger
  if (content.includes('StructuredLogger') || content.includes('log.')) {
    return false;
  }
  
  // Replace console.log with log.info
  const consoleLogRegex = /console\.log\s*\(/g;
  if (consoleLogRegex.test(content)) {
    content = content.replace(consoleLogRegex, 'log.info(');
    modified = true;
  }
  
  // Replace console.error with log.error
  const consoleErrorRegex = /console\.error\s*\(/g;
  if (consoleErrorRegex.test(content)) {
    content = content.replace(consoleErrorRegex, 'log.error(');
    modified = true;
  }
  
  // Replace console.warn with log.warn
  const consoleWarnRegex = /console\.warn\s*\(/g;
  if (consoleWarnRegex.test(content)) {
    content = content.replace(consoleWarnRegex, 'log.warn(');
    modified = true;
  }
  
  // Replace console.debug with log.debug
  const consoleDebugRegex = /console\.debug\s*\(/g;
  if (consoleDebugRegex.test(content)) {
    content = content.replace(consoleDebugRegex, 'log.debug(');
    modified = true;
  }
  
  // Add import if needed
  if (modified && !content.includes('import.*log')) {
    const importStatement = "import { log } from '../shared/logging/StructuredLogger';\n";
    
    // Find the best place to add the import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Look for existing imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    content = lines.join('\n');
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
  console.log('🔍 Scanning for console.log statements...');
  
  const tsFiles = findTsFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (replaceConsoleLog(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files scanned: ${tsFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${tsFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Console.log replacement completed successfully!');
  } else {
    console.log('\nℹ️  No console.log statements found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTsFiles, replaceConsoleLog };
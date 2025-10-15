#!/usr/bin/env node

/**
 * Fix import issues in test files
 */

const fs = require('fs');
const path = require('path');

// Find all test files
function findTestFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTestFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix import issues in test file
function fixTestImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix duplicate import lines
  const lines = content.split('\n');
  const newLines = [];
  let inImportBlock = false;
  let importBlock = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('import ')) {
      if (!inImportBlock) {
        inImportBlock = true;
        importBlock = [line];
      } else {
        importBlock.push(line);
      }
    } else if (inImportBlock && line.trim() === '') {
      // End of import block
      inImportBlock = false;
      
      // Process import block
      const processedImports = processImportBlock(importBlock);
      newLines.push(...processedImports);
      newLines.push('');
      importBlock = [];
    } else if (inImportBlock && !line.trim().startsWith('import ')) {
      // End of import block
      inImportBlock = false;
      
      // Process import block
      const processedImports = processImportBlock(importBlock);
      newLines.push(...processedImports);
      newLines.push(line);
      importBlock = [];
    } else {
      newLines.push(line);
    }
  }
  
  // Process any remaining import block
  if (inImportBlock && importBlock.length > 0) {
    const processedImports = processImportBlock(importBlock);
    newLines.push(...processedImports);
  }
  
  const newContent = newLines.join('\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modified = true;
  }
  
  return modified;
}

// Process import block to remove duplicates and fix syntax
function processImportBlock(imports) {
  const processed = [];
  const seen = new Set();
  
  for (const importLine of imports) {
    // Skip malformed imports
    if (!importLine.includes('from') || importLine.includes('import { log } from') && importLine.includes('import {')) {
      continue;
    }
    
    // Extract the module path
    const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      const modulePath = match[1];
      if (seen.has(modulePath)) {
        continue; // Skip duplicate
      }
      seen.add(modulePath);
    }
    
    processed.push(importLine);
  }
  
  return processed;
}

// Main execution
function main() {
  console.log('🔍 Fixing test import issues...');
  
  const testFiles = findTestFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of testFiles) {
    if (fixTestImports(file)) {
      updatedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Test files scanned: ${testFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${testFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Test import fixes completed successfully!');
  } else {
    console.log('\nℹ️  No test import fixes needed.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTestFiles, fixTestImports };
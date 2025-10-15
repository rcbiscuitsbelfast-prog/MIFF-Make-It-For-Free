#!/usr/bin/env node

/**
 * Replace unsafe JSON.parse instances with SafeJSONParser
 * This script scans all TypeScript files and replaces JSON.parse with SafeJSONParser.parse
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Replace JSON.parse with SafeJSONParser.parse
function replaceJsonParse(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip if already using SafeJSONParser
  if (content.includes('SafeJSONParser')) {
    return false;
  }
  
  // Replace JSON.parse with SafeJSONParser.parse
  const jsonParseRegex = /JSON\.parse\s*\(/g;
  if (jsonParseRegex.test(content)) {
    content = content.replace(jsonParseRegex, 'SafeJSONParser.parse(');
    modified = true;
  }
  
  // Add import if needed
  if (modified && !content.includes('import.*SafeJSONParser')) {
    const importStatement = "import { SafeJSONParser } from '../shared/security/SafeJSONParser';\n";
    
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
  console.log('🔍 Scanning for unsafe JSON.parse instances...');
  
  const tsFiles = findTsFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (replaceJsonParse(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files scanned: ${tsFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${tsFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ JSON.parse replacement completed successfully!');
  } else {
    console.log('\nℹ️  No unsafe JSON.parse instances found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTsFiles, replaceJsonParse };
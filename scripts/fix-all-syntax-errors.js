#!/usr/bin/env node

/**
 * Fix all remaining syntax errors in TypeScript files
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

// Fix syntax errors in a file
function fixSyntaxErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix double semicolons
  if (content.includes(';;')) {
    content = content.replace(/;;/g, ';');
    modified = true;
  }

  // Fix missing commas in object literals
  const missingCommaPattern = /(\w+):\s*([^,;]+);\s*\n\s*(\w+):\s*([^,;]+);/g;
  if (missingCommaPattern.test(content)) {
    content = content.replace(missingCommaPattern, '$1: $2,\n  $3: $4;');
    modified = true;
  }

  // Fix missing commas in array literals
  const missingArrayCommaPattern = /(\w+)\s*\n\s*(\w+)\s*\]/g;
  if (missingArrayCommaPattern.test(content)) {
    content = content.replace(missingArrayCommaPattern, '$1,\n  $2]');
    modified = true;
  }

  // Fix malformed interface properties
  const malformedInterfacePattern = /(\s+)([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)/g;
  if (malformedInterfacePattern.test(content)) {
    content = content.replace(malformedInterfacePattern, '$1$2\n$1$3');
    modified = true;
  }

  // Fix missing semicolons after statements
  const missingSemicolonPattern = /(\w+)\s*\n\s*(\w+)/g;
  if (missingSemicolonPattern.test(content)) {
    content = content.replace(missingSemicolonPattern, '$1;\n  $2');
    modified = true;
  }

  // Fix object literal syntax
  const objectLiteralPattern = /(\w+):\s*([^;]+);\s*\n\s*(\w+):\s*([^;]+);/g;
  if (objectLiteralPattern.test(content)) {
    content = content.replace(objectLiteralPattern, '$1: $2,\n  $3: $4;');
    modified = true;
  }

  // Fix interface closing braces
  const interfaceBracePattern = /\s+};\s*\n\s*}/g;
  if (interfaceBracePattern.test(content)) {
    content = content.replace(interfaceBracePattern, '\n  };\n}');
    modified = true;
  }

  // Fix function parameter syntax
  const functionParamPattern = /(\w+)\s*:\s*([^,)]+)\s*\)/g;
  if (functionParamPattern.test(content)) {
    content = content.replace(functionParamPattern, '$1: $2)');
    modified = true;
  }

  // Fix array type syntax
  const arrayTypePattern = /(\w+)\s*\[\]\s*;/g;
  if (arrayTypePattern.test(content)) {
    content = content.replace(arrayTypePattern, '$1[];');
    modified = true;
  }

  // Fix generic type syntax
  const genericTypePattern = /(\w+)\s*<\s*([^>]+)\s*>/g;
  if (genericTypePattern.test(content)) {
    content = content.replace(genericTypePattern, '$1<$2>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed syntax errors: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
function main() {
  console.log('🔍 Fixing all remaining syntax errors...');
  
  const tsFiles = findTsFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (fixSyntaxErrors(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files scanned: ${tsFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${tsFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Syntax error fixes completed successfully!');
  } else {
    console.log('\nℹ️  No syntax errors found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTsFiles, fixSyntaxErrors };
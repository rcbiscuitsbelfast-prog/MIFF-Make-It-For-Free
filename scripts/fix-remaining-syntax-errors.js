#!/usr/bin/env node

/**
 * Fix remaining syntax errors in TypeScript files
 */

const fs = require('fs');
const path = require('path');

// Files with known syntax errors
const filesToFix = [
  'miff/pure/AudioPure/index.ts',
  'miff/pure/BridgeSchemaPure/schema.ts',
  'miff/pure/CombatPure/engine.ts',
  'miff/pure/ConvertToGodotPure/index.ts',
  'miff/pure/RenderPayloadPure/Manager.ts',
  'miff/pure/WorldManifestPure/index.ts',
  'miff/pure/shared/ConsolidatedSchema.ts'
];

// Fix syntax errors in a file
function fixSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix common syntax issues
  const fixes = [
    // Fix malformed interface properties
    {
      pattern: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)/g,
      replacement: '$1$2\n$1$3'
    },
    // Fix missing semicolons
    {
      pattern: /(\w+)\s*\n\s*(\w+)/g,
      replacement: '$1;\n  $2'
    },
    // Fix malformed object literals
    {
      pattern: /(\w+):\s*([^;]+);\s*\n\s*(\w+):\s*([^;]+);/g,
      replacement: '$1: $2;\n  $3: $4;'
    },
    // Fix interface closing braces
    {
      pattern: /\s+};\s*\n\s*}/g,
      replacement: '\n  };\n}'
    }
  ];

  for (const fix of fixes) {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  }

  // Specific fixes for known issues
  if (filePath.includes('AudioPure/index.ts')) {
    // Fix the specific issue in AudioPure
    content = content.replace(
      /(\s+)([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)/g,
      '$1$2\n$1$3'
    );
    modified = true;
  }

  if (filePath.includes('BridgeSchemaPure/schema.ts')) {
    // Fix the specific issue in BridgeSchemaPure
    content = content.replace(
      /(\s+)([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;]+;)/g,
      '$1$2\n$1$3'
    );
    modified = true;
  }

  if (filePath.includes('ConsolidatedSchema.ts')) {
    // Fix property or signature expected error
    content = content.replace(
      /(\w+)\s*:\s*([^;]+)\s*,\s*$/gm,
      '$1: $2;'
    );
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
  console.log('🔍 Fixing remaining syntax errors...');
  
  let updatedCount = 0;
  
  for (const file of filesToFix) {
    if (fixSyntaxErrors(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files processed: ${filesToFix.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${filesToFix.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Syntax error fixes completed successfully!');
  } else {
    console.log('\nℹ️  No syntax errors found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSyntaxErrors };
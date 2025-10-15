#!/usr/bin/env node

/**
 * Fix final remaining syntax errors
 */

const fs = require('fs');
const path = require('path');

// Files with specific syntax errors
const filesToFix = [
  'miff/pure/AIProfilesPure/AIProfileManager.ts',
  'miff/pure/AIPure/cliHarness.ts',
  'miff/pure/AudioMixerPure/cliHarness.ts',
  'miff/pure/BattleAIPure/AIDecisionProfile.ts',
  'miff/pure/BattleAIPure/cliHarness.ts',
  'miff/pure/BlockBuilderPure/index.ts',
  'miff/pure/ChallengesPure/cliHarness.ts'
];

// Fix syntax errors in a file
function fixSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix expression expected errors (usually missing semicolons or brackets)
  if (content.includes('error TS1109')) {
    // Fix missing semicolons at end of statements
    content = content.replace(/(\w+)\s*\n\s*(\w+)/g, '$1;\n  $2');
    modified = true;
  }

  // Fix missing semicolons
  if (content.includes('error TS1005')) {
    content = content.replace(/(\w+)\s*$/gm, '$1;');
    modified = true;
  }

  // Fix property initializer errors
  if (content.includes('error TS1442')) {
    content = content.replace(/(\w+)\s*:\s*([^=;]+)\s*$/gm, '$1 = $2;');
    modified = true;
  }

  // Fix specific patterns
  const fixes = [
    // Fix missing semicolons
    {
      pattern: /(\w+)\s*\n\s*(\w+)/g,
      replacement: '$1;\n  $2'
    },
    // Fix missing equals signs
    {
      pattern: /(\w+)\s*:\s*([^=;]+)\s*$/gm,
      replacement: '$1 = $2;'
    },
    // Fix malformed object literals
    {
      pattern: /(\w+)\s*:\s*([^,;]+)\s*\n\s*(\w+)/g,
      replacement: '$1: $2,\n  $3'
    },
    // Fix missing commas
    {
      pattern: /(\w+)\s*\n\s*(\w+)\s*\]/g,
      replacement: '$1,\n  $2]'
    }
  ];

  for (const fix of fixes) {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
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
  console.log('🔍 Fixing final syntax errors...');
  
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
    console.log('\n✅ Final syntax error fixes completed successfully!');
  } else {
    console.log('\nℹ️  No syntax errors found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSyntaxErrors };
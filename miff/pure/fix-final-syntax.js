#!/usr/bin/env node

const fs = require('fs');

const filesToFix = [
  'BridgeSchemaPure/schema.ts',
  'CombatPure/engine.ts', 
  'ConvertToGodotPure/index.ts',
  'RenderPayloadPure/Manager.ts',
  'WorldManifestPure/index.ts'
];

function fixSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix indentation issues - convert 4 spaces to 2 spaces for property declarations
  const indentationFixes = [
    {
      pattern: /^    (\w+.*?;)$/gm,
      replacement: '  $1'
    },
    {
      pattern: /^\t\t(\w+.*?;)$/gm,
      replacement: '  $1'
    }
  ];

  for (const fix of indentationFixes) {
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

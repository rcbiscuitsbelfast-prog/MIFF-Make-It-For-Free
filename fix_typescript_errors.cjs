#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript syntax errors in Manager files...\n');

// Common syntax error patterns to fix
const fixes = [
  {
    pattern: /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
    replacement: '$1$2: {\n$1  $3: $4,\n$1  $5: $6,\n$1  $7: $8,\n$1  $9: $10\n$1},'
  },
  {
    pattern: /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
    replacement: '$1$2: {\n$1  $3: $4,\n$1  $5: $6\n$1},'
  },
  {
    pattern: /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
    replacement: '$1$2: {\n$1  $3: $4\n$1},'
  },
  {
    pattern: /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
    replacement: '$1$2: {\n$1  $3: $4,\n$1  $5: $6,\n$1  $7: $8,\n$1  $9: $10,\n$1  $11: $12\n$1},'
  },
  {
    pattern: /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
    replacement: '$1$2: {\n$1  $3: $4,\n$1  $5: $6,\n$1  $7: $8,\n$1  $9: $10,\n$1  $11: $12,\n$1  $13: $14\n$1},'
  }
];

// Find all Manager.ts files
const managerFiles = [];
function findManagerFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findManagerFiles(filePath);
    } else if (file === 'Manager.ts') {
      managerFiles.push(filePath);
    }
  }
}

findManagerFiles('./miff/pure');

console.log(`Found ${managerFiles.length} Manager files to check...\n`);

let fixed = 0;
let errors = 0;

// Process each Manager file
for (const filePath of managerFiles) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply fixes
    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    // Additional specific fixes for common issues
    content = content.replace(/(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm, 
      '$1$2: {\n$1  $3: $4,\n$1  $5: $6,\n$1  $7: $8,\n$1  $9: $10,\n$1  $11: $12,\n$1  $13: $14,\n$1  $15: $16\n$1},');
    
    // Fix malformed object literals with missing commas
    content = content.replace(/(\w+):\s*(\w+)\s*(\w+):\s*(\w+)/g, '$1: $2,\n    $3: $4');
    
    // Fix missing commas in object literals
    content = content.replace(/(\w+):\s*(\w+)\s*}/g, '$1: $2\n    }');
    
    // Fix missing semicolons
    content = content.replace(/(\w+):\s*(\w+)\s*$/gm, '$1: $2;');
    
    // Fix interface definitions
    content = content.replace(/interface\s+(\w+)\s*{\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*}/g, 
      'interface $1 {\n  $2: $3;\n  $4: $5;\n  $6: $7;\n  $8: $9;\n}');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${path.basename(path.dirname(filePath))}/Manager.ts`);
      fixed++;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    errors++;
  }
}

console.log(`\n✅ TypeScript syntax fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / managerFiles.length) * 100).toFixed(1)}%`);
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive TypeScript syntax fixes...\n');

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

console.log(`Found ${managerFiles.length} Manager files to fix...\n`);

let fixed = 0;
let errors = 0;

// Process each Manager file
for (const filePath of managerFiles) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix 1: Malformed object literals in constructor
    content = content.replace(
      /(\s+)(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
      '$1$2: {\n$1  $3: $4,\n$1  $5: $6,\n$1  $7: $8,\n$1  $9: $10,\n$1  $11: $12,\n$1  $13: $14\n$1},'
    );
    
    // Fix 2: Missing commas in object properties
    content = content.replace(
      /(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*}/g,
      '$1: $2,\n    $3: $4,\n    $5: $6,\n    $7: $8,\n    $9: $10,\n    $11: $12\n  }'
    );
    
    // Fix 3: Fix malformed logger initialization
    content = content.replace(
      /this\.logger\s*=\s*new\s*StructuredLogger\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*{\s*(\w+):\s*(\w+)\s*}\s*}\s*\);/g,
      'this.logger = new StructuredLogger({\n      $1: $2,\n      $3: $4,\n      $5: $6,\n      $7: {\n        $8: $9\n      }\n    });'
    );
    
    // Fix 4: Fix missing semicolons after object literals
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*$/gm,
      '$1: {\n      $2: $3,\n      $4: $5,\n      $6: $7,\n      $8: $9,\n      $10: $11,\n      $12: $13\n    };'
    );
    
    // Fix 5: Fix malformed interface definitions
    content = content.replace(
      /interface\s+(\w+)\s*{\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*(\w+):\s*(\w+);\s*}/g,
      'interface $1 {\n  $2: $3;\n  $4: $5;\n  $6: $7;\n  $8: $9;\n  $10: $11;\n  $12: $13;\n}'
    );
    
    // Fix 6: Fix constructor syntax errors
    content = content.replace(
      /constructor\([^)]*\)\s*{\s*(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*},?\s*$/gm,
      'constructor($1) {\n    this.$2 = {\n      $3: $4,\n      $5: $6,\n      $7: $8,\n      $9: $10,\n      $11: $12,\n      $13: $14\n    };'
    );
    
    // Fix 7: Fix malformed method calls
    content = content.replace(
      /(\w+)\.(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)/g,
      '$1.$2({\n      $3: $4,\n      $5: $6,\n      $7: $8,\n      $9: $10,\n      $11: $12,\n      $13: $14\n    })'
    );
    
    // Fix 8: Fix missing commas in array literals
    content = content.replace(
      /\[\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*\]/g,
      '[\n      $1,\n      $2,\n      $3,\n      $4,\n      $5,\n      $6\n    ]'
    );
    
    // Fix 9: Fix malformed object property assignments
    content = content.replace(
      /this\.(\w+)\s*=\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*};/g,
      'this.$1 = {\n      $2: $3,\n      $4: $5,\n      $6: $7,\n      $8: $9,\n      $10: $11,\n      $12: $13\n    };'
    );
    
    // Fix 10: Fix malformed return statements
    content = content.replace(
      /return\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*};/g,
      'return {\n      $1: $2,\n      $3: $4,\n      $5: $6,\n      $7: $8,\n      $9: $10,\n      $11: $12\n    };'
    );
    
    // Fix 11: Fix malformed function parameters
    content = content.replace(
      /function\s+(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)/g,
      'function $1({\n    $2: $3,\n    $4: $5,\n    $6: $7,\n    $8: $9,\n    $10: $11,\n    $12: $13\n  })'
    );
    
    // Fix 12: Fix malformed arrow function parameters
    content = content.replace(
      /\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)\s*=>/g,
      '({\n    $1: $2,\n    $3: $4,\n    $5: $6,\n    $7: $8,\n    $9: $10,\n    $11: $12\n  }) =>'
    );
    
    // Fix 13: Fix malformed class property declarations
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*=\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*};/g,
      '$1: {\n      $2: $3,\n      $4: $5,\n      $6: $7,\n      $8: $9,\n      $10: $11,\n      $12: $13\n    } = {\n      $14: $15,\n      $16: $17,\n      $18: $19,\n      $20: $21,\n      $22: $23,\n      $24: $25\n    };'
    );
    
    // Fix 14: Fix malformed method definitions
    content = content.replace(
      /(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)\s*:\s*(\w+)\s*{/g,
      '$1({\n    $2: $3,\n    $4: $5,\n    $6: $7,\n    $8: $9,\n    $10: $11,\n    $12: $13\n  }): $14 {'
    );
    
    // Fix 15: Fix malformed async method definitions
    content = content.replace(
      /async\s+(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)\s*:\s*Promise<(\w+)>\s*{/g,
      'async $1({\n    $2: $3,\n    $4: $5,\n    $6: $7,\n    $8: $9,\n    $10: $11,\n    $12: $13\n  }): Promise<$14> {'
    );
    
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

console.log(`\n✅ Comprehensive TypeScript fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / managerFiles.length) * 100).toFixed(1)}%`);
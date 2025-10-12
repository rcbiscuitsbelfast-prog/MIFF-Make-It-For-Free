#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing constructor syntax errors...\n');

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
    
    // Fix 1: Missing closing brace and semicolon in constructor
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*}\s*$/gm,
      '$1$2: {\n$1  $3\n$1};'
    );
    
    // Fix 2: Missing closing brace before logger initialization
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*}\s*\n\s*\/\/ Initialize structured logging/gm,
      '$1$2: {\n$1  $3\n$1};\n\n$1// Initialize structured logging'
    );
    
    // Fix 3: Fix malformed constructor ending
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*}\s*\n\s*\/\/ Initialize structured logging\n\s*this\.logger/gm,
      '$1$2: {\n$1  $3\n$1};\n\n$1// Initialize structured logging\n$1this.logger'
    );
    
    // Fix 4: Fix missing semicolon after object literal
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*}\s*\n\s*\/\/ Register with memory manager/gm,
      '$1$2: {\n$1  $3\n$1};\n\n$1// Register with memory manager'
    );
    
    // Fix 5: Fix malformed constructor with extra semicolon
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*}\s*;\s*$/gm,
      '$1$2: {\n$1  $3\n$1};'
    );
    
    // Fix 6: Fix missing closing brace in object literal
    content = content.replace(
      /(\s+)(\w+):\s*{\s*([^}]+)\s*$/gm,
      '$1$2: {\n$1  $3\n$1}'
    );
    
    // Fix 7: Fix malformed object property with missing comma
    content = content.replace(
      /(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*$/gm,
      '$1: $2,\n    $3: $4,\n    $5: $6,\n    $7: $8,\n    $9: $10,\n    $11: $12'
    );
    
    // Fix 8: Fix malformed interface with missing semicolons
    content = content.replace(
      /interface\s+(\w+)\s*{\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*(\w+):\s*(\w+)\s*}/g,
      'interface $1 {\n  $2: $3;\n  $4: $5;\n  $6: $7;\n  $8: $9;\n  $10: $11;\n  $12: $13;\n}'
    );
    
    // Fix 9: Fix malformed method with missing return type
    content = content.replace(
      /(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)\s*{/g,
      '$1({\n    $2: $3,\n    $4: $5,\n    $6: $7,\n    $8: $9,\n    $10: $11,\n    $12: $13\n  }): any {'
    );
    
    // Fix 10: Fix malformed async method
    content = content.replace(
      /async\s+(\w+)\(\s*{\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+),\s*(\w+):\s*(\w+)\s*}\s*\)\s*{/g,
      'async $1({\n    $2: $3,\n    $4: $5,\n    $6: $7,\n    $8: $9,\n    $10: $11,\n    $12: $13\n  }): Promise<any> {'
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

console.log(`\n✅ Constructor syntax fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / managerFiles.length) * 100).toFixed(1)}%`);
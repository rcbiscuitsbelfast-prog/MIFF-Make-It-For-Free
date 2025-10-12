#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing malformed object literals...\n');

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
    
    // Fix 1: Malformed object literals with missing commas
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 2: Malformed object literals with missing closing braces
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 3: Fix malformed nested objects
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*$/gm,
      '$1: {\n        $2: {\n          $3: $4,\n          $5: $6,\n          $7: $8,\n          $9: $10\n        }\n      }'
    );
    
    // Fix 4: Fix malformed object with extra braces
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*}\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 5: Fix malformed object with missing commas between properties
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*}\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 6: Fix malformed object with extra semicolons
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*;\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 7: Fix malformed object with missing closing brace and semicolon
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*}\s*;\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 8: Fix malformed object with extra braces and semicolons
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+)\s*}\s*}\s*;\s*;\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 9: Fix malformed object with missing commas and extra braces
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*}\s*}\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
    );
    
    // Fix 10: Fix malformed object with missing commas and extra braces and semicolons
    content = content.replace(
      /(\w+):\s*{\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*(\w+):\s*([^,}]+)\s*}\s*}\s*;\s*$/gm,
      '$1: {\n        $2: $3,\n        $4: $5,\n        $6: $7,\n        $8: $9\n      }'
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

console.log(`\n✅ Malformed object fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / managerFiles.length) * 100).toFixed(1)}%`);
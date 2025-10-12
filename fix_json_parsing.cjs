#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Fixing unsafe JSON.parse instances...\n');

// Find all TypeScript files
const tsFiles = [];
function findTsFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTsFiles(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
      tsFiles.push(filePath);
    }
  }
}

findTsFiles('./miff/pure');

console.log(`Found ${tsFiles.length} TypeScript files to check...\n`);

let fixed = 0;
let errors = 0;

// Process each file
for (const filePath of tsFiles) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Skip if it's a SafeJSONParser file itself
    if (filePath.includes('SafeJSONParser')) {
      continue;
    }
    
    // Skip if it's a test file
    if (filePath.includes('.test.ts')) {
      continue;
    }
    
    // Add SafeJSONParser import if not present
    if (content.includes('JSON.parse(') && !content.includes('SafeJSONParser')) {
      // Find the best place to add the import
      const lines = content.split('\n');
      let importIndex = -1;
      
      // Look for existing imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') && lines[i].includes('from')) {
          importIndex = i;
        }
      }
      
      if (importIndex >= 0) {
        // Add after the last import
        lines.splice(importIndex + 1, 0, "import { SafeJSONParser } from '../shared/security/SafeJSONParser';");
        content = lines.join('\n');
      } else {
        // Add at the top
        content = "import { SafeJSONParser } from '../shared/security/SafeJSONParser';\n" + content;
      }
    }
    
    // Replace JSON.parse with SafeJSONParser.parse
    content = content.replace(/JSON\.parse\(/g, 'SafeJSONParser.parse(');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
      fixed++;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    errors++;
  }
}

console.log(`\n✅ JSON parsing fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / tsFiles.length) * 100).toFixed(1)}%`);
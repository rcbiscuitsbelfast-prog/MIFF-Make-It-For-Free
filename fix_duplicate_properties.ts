#!/usr/bin/env tsx

/**
 * Script to fix duplicate properties in object literals
 */

import * as fs from 'fs';
import * as path from 'path';

const MIFF_PURE_DIR = 'miff/pure';

function findCapableFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('Capable.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixDuplicateProperties(content: string): string {
  // Fix duplicate compatibility properties
  content = content.replace(
    /compatibility:\s*\{[^}]*\},\s*compatibility:\s*\{[^}]*\},\s*compatibility:\s*\{[^}]*\}/g,
    'compatibility: {\n        minVersion: \'1.0.0\',\n        testedVersions: [\'1.0.0\'],\n        knownIssues: []\n      }'
  );
  
  // Fix double duplicate compatibility properties
  content = content.replace(
    /compatibility:\s*\{[^}]*\},\s*compatibility:\s*\{[^}]*\}/g,
    'compatibility: {\n        minVersion: \'1.0.0\',\n        testedVersions: [\'1.0.0\'],\n        knownIssues: []\n      }'
  );
  
  // Fix other common duplicate properties
  content = content.replace(
    /(\w+):\s*([^,}]+),\s*\1:\s*([^,}]+),\s*\1:\s*([^,}]+)/g,
    '$1: $2'
  );
  
  content = content.replace(
    /(\w+):\s*([^,}]+),\s*\1:\s*([^,}]+)/g,
    '$1: $2'
  );
  
  return content;
}

function applyFixes(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const beforeContent = content;
    
    content = fixDuplicateProperties(content);
    
    if (content !== beforeContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing duplicate properties...\n');
  
  const capableFiles = findCapableFiles(MIFF_PURE_DIR);
  console.log(`Found ${capableFiles.length} MIFFCapable files to check:`);
  capableFiles.forEach(file => console.log(`  - ${file}`));
  console.log();
  
  let fixedCount = 0;
  
  for (const file of capableFiles) {
    console.log(`Processing: ${file}`);
    
    if (applyFixes(file)) {
      console.log(`  ✅ Fixed successfully\n`);
      fixedCount++;
    } else {
      console.log(`  ⏭️  No changes needed\n`);
    }
  }
  
  console.log(`🎉 Fixed ${fixedCount} out of ${capableFiles.length} files`);
}

main();
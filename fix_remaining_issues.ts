#!/usr/bin/env tsx

/**
 * Script to fix remaining TypeScript issues after initial fixes
 */

import * as fs from 'fs';
import * as path from 'path';

const MIFF_PURE_DIR = 'miff/pure';

interface FixPattern {
  search: string | RegExp;
  replace: string;
  description: string;
}

const fixes: FixPattern[] = [
  // Fix choices arrays that have objects instead of strings
  {
    search: /choices: \[\{\s*command: '([^']+)',\s*description: '([^']+)'\s*\}\]/g,
    replace: "choices: ['$1', '$2']",
    description: 'Fix choices array structure'
  },
  
  // Fix CLI examples that are still objects instead of strings
  {
    search: /\{\s*command: '([^']+)',\s*description: '([^']+)'\s*\}/g,
    replace: "'$1'",
    description: 'Fix CLI examples to strings'
  },
  
  // Fix duplicate properties in object literals
  {
    search: /(\w+):\s*([^,}]+),\s*\1:\s*([^,}]+)/g,
    replace: '$1: $2',
    description: 'Remove duplicate properties'
  },
  
  // Fix troubleshooting arrays that have objects instead of strings
  {
    search: /symptoms: \[\{\s*command: '([^']+)',\s*description: '([^']+)'\s*\}\]/g,
    replace: "symptoms: ['$1', '$2']",
    description: 'Fix symptoms array structure'
  }
];

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

function applyFixes(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of fixes) {
      const beforeContent = content;
      content = content.replace(fix.search, fix.replace);
      
      if (content !== beforeContent) {
        console.log(`  ✓ Applied: ${fix.description}`);
        modified = true;
      }
    }
    
    if (modified) {
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
  console.log('🔧 Fixing remaining TypeScript issues...\n');
  
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
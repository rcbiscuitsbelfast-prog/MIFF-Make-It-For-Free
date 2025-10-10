#!/usr/bin/env tsx

/**
 * Comprehensive script to fix all remaining TypeScript issues
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
  // Fix CLI examples that are strings but should be CLIExample objects
  {
    search: /examples: \[\s*'([^']+)',\s*'([^']+)'\s*\]/g,
    replace: `examples: [
          {
            command: '$1',
            description: 'Example command 1'
          },
          {
            command: '$2',
            description: 'Example command 2'
          }
        ]`,
    description: 'Fix CLI examples to proper CLIExample objects'
  },
  
  // Fix single CLI example strings
  {
    search: /examples: \[\s*'([^']+)'\s*\]/g,
    replace: `examples: [
          {
            command: '$1',
            description: 'Example command'
          }
        ]`,
    description: 'Fix single CLI example to proper CLIExample object'
  },
  
  // Fix duplicate properties in object literals - more specific patterns
  {
    search: /dataProcessing: \[\],\s*formats: \[\],\s*realtime: \[\],\s*dataProcessing: \[\],\s*formats: \[\],\s*realtime: \[/g,
    replace: 'dataProcessing: [],\n      formats: [],\n      realtime: [',
    description: 'Remove duplicate ModuleCapabilities properties'
  },
  
  // Fix duplicate properties in other contexts
  {
    search: /(\w+):\s*([^,}]+),\s*\1:\s*([^,}]+),\s*\1:\s*([^,}]+)/g,
    replace: '$1: $2',
    description: 'Remove triple duplicate properties'
  },
  
  // Fix duplicate properties in other contexts (double)
  {
    search: /(\w+):\s*([^,}]+),\s*\1:\s*([^,}]+)/g,
    replace: '$1: $2',
    description: 'Remove double duplicate properties'
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
  console.log('🔧 Fixing all remaining TypeScript issues...\n');
  
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
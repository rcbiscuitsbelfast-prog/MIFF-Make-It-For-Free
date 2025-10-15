#!/usr/bin/env node

/**
 * Fix interface duplications and type conflicts
 * Resolves TS2300, TS2687, TS2717 errors
 */

const fs = require('fs');
const path = require('path');

// Find all TypeScript files
function findTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix interface duplications in a file
function fixInterfaceDuplications(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix duplicate property declarations in interfaces
  const interfaceRegex = /export interface \w+ \{[\s\S]*?\}/g;
  const interfaces = content.match(interfaceRegex) || [];
  
  for (const interfaceMatch of interfaces) {
    const lines = interfaceMatch.split('\n');
    const propertyMap = new Map();
    const newLines = [];
    let inInterface = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('export interface')) {
        inInterface = true;
        newLines.push(line);
        continue;
      }
      
      if (inInterface && line.trim() === '}') {
        inInterface = false;
        newLines.push(line);
        continue;
      }
      
      if (inInterface) {
        // Extract property name and type
        const propertyMatch = line.match(/^\s*(\w+)(\??):\s*(.+);?\s*$/);
        if (propertyMatch) {
          const [, propName, optional, propType] = propertyMatch;
          const key = propName;
          
          if (propertyMap.has(key)) {
            // Duplicate property - keep the more specific one
            const existing = propertyMap.get(key);
            const existingOptional = existing.includes('?');
            const currentOptional = optional === '?';
            
            // Prefer non-optional over optional
            if (!currentOptional && existingOptional) {
              propertyMap.set(key, propType);
              // Remove the previous line
              newLines.pop();
            }
            // If both are optional or both are required, keep the first one
            continue;
          } else {
            propertyMap.set(key, propType);
          }
        }
        
        newLines.push(line);
      } else {
        newLines.push(line);
      }
    }
    
    const newInterface = newLines.join('\n');
    if (newInterface !== interfaceMatch) {
      content = content.replace(interfaceMatch, newInterface);
      modified = true;
    }
  }
  
  // Fix specific common duplications
  const commonDuplications = [
    {
      pattern: /status\?\?: string;\s*\n\s*status: \w+;/g,
      replacement: 'status: ProfileStatus;'
    },
    {
      pattern: /createdAt\?\?: number;\s*\n\s*createdAt: Date;/g,
      replacement: 'createdAt: Date;'
    },
    {
      pattern: /updatedAt\?\?: number;\s*\n\s*updatedAt: Date;/g,
      replacement: 'updatedAt: Date;'
    },
    {
      pattern: /metadata\?\?: Record<string, any>;\s*\n\s*metadata\?\?: Record<string, any>;/g,
      replacement: 'metadata?: Record<string, any>;'
    },
    {
      pattern: /result\?\?: any;\s*\n\s*result\?\?: \w+;/g,
      replacement: 'result?: any;'
    }
  ];
  
  for (const dup of commonDuplications) {
    if (dup.pattern.test(content)) {
      content = content.replace(dup.pattern, dup.replacement);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed interface duplications: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
function main() {
  console.log('🔍 Fixing interface duplications...');
  
  const tsFiles = findTsFiles('./miff/pure');
  let updatedCount = 0;
  
  for (const file of tsFiles) {
    if (fixInterfaceDuplications(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files scanned: ${tsFiles.length}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files skipped: ${tsFiles.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Interface duplication fixes completed successfully!');
  } else {
    console.log('\nℹ️  No interface duplications found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTsFiles, fixInterfaceDuplications };
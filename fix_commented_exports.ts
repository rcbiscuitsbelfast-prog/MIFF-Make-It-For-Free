#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixCommentedExportsInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix commented out exports that leave orphaned code
    const patterns = [
      // Fix commented out exports with orphaned code
      {
        pattern: /\/\*\s*export\s+const\s+(\w+)\s*=\s*\{[^*]*\*\/\s*\n\s*(\w+)\s*\(/g,
        replacement: 'export const $1 = {\n  $2('
      },
      // Fix orphaned function definitions after commented exports
      {
        pattern: /\/\*\s*export\s+const\s+(\w+)\s*=\s*\{[^*]*\*\/\s*\n\s*(\w+)\s*\([^)]*\)\s*:\s*(\w+)\s*\{/g,
        replacement: 'export const $1 = {\n  $2($3): $4 {'
      }
    ];
    
    for (const pattern of patterns) {
      const before = newContent;
      newContent = newContent.replace(pattern.pattern, pattern.replacement);
      if (before !== newContent) {
        modified = true;
      }
    }
    
    // Fix specific syntax issues line by line
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Fix orphaned function definitions
      if (line.trim().match(/^\w+\s*\([^)]*\)\s*:\s*\w+\s*\{/) && i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine.endsWith('*/') || prevLine.endsWith('{')) {
          // This is an orphaned function, we need to create a proper export
          const indent = line.match(/^(\s*)/)?.[1] || '';
          const functionMatch = line.match(/^\s*(\w+)\s*\([^)]*\)\s*:\s*(\w+)\s*\{/);
          if (functionMatch) {
            const [, funcName, returnType] = functionMatch;
            line = `${indent}${funcName}(): ${returnType} {`;
            modified = true;
          }
        }
      }
      
      if (line !== originalLine) {
        console.log(`Fixed line ${i + 1} in ${filePath}: ${originalLine.trim()} -> ${line.trim()}`);
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed commented exports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findTypeScriptFiles(fullPath));
      } else if (entry.endsWith('.ts') && !entry.includes('test') && !entry.includes('spec')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

async function main() {
  console.log('🔧 Starting commented exports fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixCommentedExportsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed commented exports in ${fixedCount} files`);
  console.log('🎯 Commented exports fixes complete!');
}

main().catch(console.error);
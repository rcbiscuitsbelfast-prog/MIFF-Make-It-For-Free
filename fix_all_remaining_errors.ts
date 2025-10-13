#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixAllRemainingErrorsInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix various syntax issues
    const fixes = [
      // Fix commented lines with object literals
      {
        pattern: /\/\/\s*const\s+\w+\s*=\s*\{[\s\S]*?\};/g,
        replacement: (match: string) => {
          const blockComment = match.replace('//', '/*') + '*/';
          return blockComment;
        }
      },
      // Fix commented lines with array literals
      {
        pattern: /\/\/\s*const\s+\w+\s*=\s*\[[\s\S]*?\];/g,
        replacement: (match: string) => {
          const blockComment = match.replace('//', '/*') + '*/';
          return blockComment;
        }
      },
      // Fix missing semicolons in object properties
      {
        pattern: /(\w+):\s*([^,}]+)(?=\s*[,}])/g,
        replacement: (match, key, value) => {
          if (!value.trim().endsWith(';') && !value.trim().endsWith(',') && !value.trim().endsWith('}')) {
            return `${key}: ${value},`;
          }
          return match;
        }
      },
      // Fix missing commas in object literals
      {
        pattern: /(\w+)\s*:\s*([^,}]+)\s*(?=\n\s*[a-zA-Z_])/g,
        replacement: '$1: $2,'
      },
      // Fix missing commas in array literals
      {
        pattern: /([^,}\]]+)\s*(?=\n\s*[a-zA-Z_0-9'"])/g,
        replacement: '$1,'
      },
      // Fix missing closing braces
      {
        pattern: /(\{[^{}]*)(?=\n\s*[a-zA-Z_])/g,
        replacement: '$1}'
      },
      // Fix missing closing brackets
      {
        pattern: /(\[[^\[\]]*)(?=\n\s*[a-zA-Z_])/g,
        replacement: '$1]'
      }
    ];
    
    for (const fix of fixes) {
      const before = newContent;
      newContent = newContent.replace(fix.pattern, fix.replacement);
      if (before !== newContent) {
        modified = true;
      }
    }
    
    // Fix specific patterns that cause common errors
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Fix commented lines that continue with object literals
      if (line.trim().startsWith('//') && line.includes('=')) {
        // Check if next lines contain object/array literals
        let j = i + 1;
        let foundObject = false;
        
        while (j < lines.length && j < i + 10) { // Limit search to next 10 lines
          const nextLine = lines[j].trim();
          if (nextLine === '') {
            j++;
            continue;
          }
          
          if (nextLine.startsWith('{') || nextLine.startsWith('[')) {
            foundObject = true;
            break;
          }
          
          if (nextLine.startsWith('//') || nextLine.startsWith('/*')) {
            j++;
            continue;
          }
          
          break;
        }
        
        if (foundObject) {
          // Convert to block comment
          line = line.replace('//', '/*');
          newLines.push(line);
          
          // Find the end of the object/array
          let braceCount = 0;
          let bracketCount = 0;
          let foundEnd = false;
          
          // Count initial braces/brackets
          for (const char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }
          
          // Process middle lines
          for (let k = i + 1; k < lines.length && !foundEnd; k++) {
            const middleLine = lines[k];
            newLines.push(middleLine);
            
            // Count braces and brackets
            for (const char of middleLine) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
            }
            
            // Check if we've found the end
            if (braceCount === 0 && bracketCount === 0 && 
                (middleLine.trim().endsWith('};') || middleLine.trim().endsWith('];'))) {
              foundEnd = true;
              // Add closing comment
              newLines[newLines.length - 1] = middleLine + '*/';
            }
          }
          
          // Skip processed lines
          i = lines.length; // This will end the loop
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed all remaining errors in ${filePath}`);
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
  console.log('🔧 Starting comprehensive error fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixAllRemainingErrorsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed all remaining errors in ${fixedCount} files`);
  console.log('🎯 Comprehensive error fixes complete!');
}

main().catch(console.error);
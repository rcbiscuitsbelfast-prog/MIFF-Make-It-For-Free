#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixSyntaxErrorsInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    let inCommentedBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      const trimmedLine = line.trim();
      
      // Check for commented lines that start object/array literals
      if (trimmedLine.startsWith('//') && 
          (trimmedLine.includes('= {') || trimmedLine.includes('= ['))) {
        
        // Check if the next lines continue the object/array
        let j = i + 1;
        let foundEnd = false;
        let braceCount = 0;
        let bracketCount = 0;
        
        // Count braces and brackets in the commented line
        for (const char of trimmedLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }
        
        // Look for the end of the object/array
        while (j < lines.length && !foundEnd) {
          const nextLine = lines[j].trim();
          if (nextLine === '') {
            j++;
            continue;
          }
          
          // Count braces and brackets in this line
          for (const char of nextLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }
          
          // Check if we've found the end
          if ((braceCount === 0 && bracketCount === 0) && 
              (nextLine.endsWith('};') || nextLine.endsWith('];') || nextLine.endsWith(');'))) {
            foundEnd = true;
          }
          
          j++;
        }
        
        if (foundEnd) {
          // Convert to block comment
          line = line.replace('//', '/*');
          newLines.push(line);
          
          // Process the middle lines
          for (let k = i + 1; k < j; k++) {
            newLines.push(lines[k]);
          }
          
          // Add closing comment to the last line
          const lastLine = lines[j - 1];
          newLines.push(lastLine + '*/');
          
          // Skip the processed lines
          i = j - 1;
          modified = true;
          continue;
        }
      }
      
      // Check for standalone commented lines that should be block comments
      if (trimmedLine.startsWith('//') && 
          (trimmedLine.includes('export const') || 
           trimmedLine.includes('export let') || 
           trimmedLine.includes('export var') ||
           trimmedLine.includes('const ') ||
           trimmedLine.includes('let ') ||
           trimmedLine.includes('var '))) {
        
        // Check if this is followed by an object/array literal
        let j = i + 1;
        let foundObject = false;
        
        while (j < lines.length && !foundObject) {
          const nextLine = lines[j].trim();
          if (nextLine === '') {
            j++;
            continue;
          }
          
          if (nextLine.startsWith('{') || nextLine.startsWith('[')) {
            foundObject = true;
          } else if (nextLine.startsWith('//') || nextLine.startsWith('/*')) {
            j++;
            continue;
          } else {
            break;
          }
          
          j++;
        }
        
        if (foundObject) {
          // Convert to block comment
          line = line.replace('//', '/*');
          newLines.push(line);
          
          // Process the middle lines
          for (let k = i + 1; k < j; k++) {
            newLines.push(lines[k]);
          }
          
          // Add closing comment to the last line
          const lastLine = lines[j - 1];
          newLines.push(lastLine + '*/');
          
          // Skip the processed lines
          i = j - 1;
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed syntax errors in ${filePath}`);
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
  console.log('🔧 Starting syntax error fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixSyntaxErrorsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed syntax errors in ${fixedCount} files`);
  console.log('🎯 Syntax error fixes complete!');
}

main().catch(console.error);
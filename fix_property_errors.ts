#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixPropertyErrorsInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix commented out exports that leave orphaned code
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for commented out exports followed by orphaned code
      if (trimmedLine.startsWith('/*') && 
          (trimmedLine.includes('export const') || 
           trimmedLine.includes('export let') || 
           trimmedLine.includes('export var'))) {
        
        // Find the end of the comment
        let j = i + 1;
        let foundEnd = false;
        
        while (j < lines.length && !foundEnd) {
          const nextLine = lines[j].trim();
          if (nextLine.endsWith('*/')) {
            foundEnd = true;
          }
          j++;
        }
        
        if (foundEnd) {
          // Add the comment
          newLines.push(line);
          
          // Add middle lines
          for (let k = i + 1; k < j; k++) {
            newLines.push(lines[k]);
          }
          
          // Check if there's orphaned code after the comment
          if (j < lines.length) {
            const nextLine = lines[j].trim();
            if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('/*') && !nextLine.startsWith('import') && !nextLine.startsWith('export')) {
              // There's orphaned code, we need to create a proper export
              newLines.push('');
              newLines.push('export const ' + trimmedLine.match(/export\s+(const|let|var)\s+(\w+)/)?.[2] + ' = {');
              
              // Add the orphaned code
              for (let k = j; k < lines.length; k++) {
                const orphanLine = lines[k];
                if (orphanLine.trim() === '};') {
                  newLines.push(orphanLine);
                  break;
                } else if (orphanLine.trim()) {
                  newLines.push(orphanLine);
                }
              }
              
              // Skip the processed lines
              i = lines.length;
              modified = true;
              continue;
            }
          }
          
          // Skip the processed lines
          i = j;
          continue;
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed property errors in ${filePath}`);
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
  console.log('🔧 Starting property error fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixPropertyErrorsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed property errors in ${fixedCount} files`);
  console.log('🎯 Property error fixes complete!');
}

main().catch(console.error);
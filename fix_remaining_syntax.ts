#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixRemainingSyntaxInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix patterns where commented lines are followed by object literals
    const patterns = [
      // Pattern: // const/let/var = { ... }
      {
        regex: /(\/\/\s*(?:const|let|var|export\s+(?:const|let|var))\s+\w+\s*=\s*\{[^}]*\})/g,
        replacement: (match: string) => match.replace('//', '/*') + '*/'
      },
      // Pattern: // const/let/var = [ ... ]
      {
        regex: /(\/\/\s*(?:const|let|var|export\s+(?:const|let|var))\s+\w+\s*=\s*\[[^\]]*\])/g,
        replacement: (match: string) => match.replace('//', '/*') + '*/'
      }
    ];
    
    for (const pattern of patterns) {
      const before = newContent;
      newContent = newContent.replace(pattern.regex, pattern.replacement);
      if (before !== newContent) {
        modified = true;
      }
    }
    
    // Fix multi-line commented blocks
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for commented lines that start object/array literals
      if (trimmedLine.startsWith('//') && 
          (trimmedLine.includes('= {') || trimmedLine.includes('= ['))) {
        
        // Find the end of the object/array
        let j = i + 1;
        let braceCount = 0;
        let bracketCount = 0;
        let foundEnd = false;
        
        // Count initial braces/brackets
        for (const char of trimmedLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }
        
        // Look for the end
        while (j < lines.length && !foundEnd) {
          const nextLine = lines[j].trim();
          if (nextLine === '') {
            j++;
            continue;
          }
          
          // Count braces and brackets
          for (const char of nextLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }
          
          // Check if we've found the end
          if (braceCount === 0 && bracketCount === 0 && 
              (nextLine.endsWith('};') || nextLine.endsWith('];') || nextLine.endsWith(');'))) {
            foundEnd = true;
          }
          
          j++;
        }
        
        if (foundEnd) {
          // Convert to block comment
          newLines.push(line.replace('//', '/*'));
          
          // Add middle lines
          for (let k = i + 1; k < j; k++) {
            newLines.push(lines[k]);
          }
          
          // Add closing comment
          const lastLine = lines[j - 1];
          newLines.push(lastLine + '*/');
          
          i = j;
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed remaining syntax in ${filePath}`);
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
  console.log('🔧 Starting remaining syntax fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixRemainingSyntaxInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed remaining syntax in ${fixedCount} files`);
  console.log('🎯 Remaining syntax fixes complete!');
}

main().catch(console.error);
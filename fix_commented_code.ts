#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixCommentedCodeInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix specific patterns that are safe to fix
    const patterns = [
      // Fix commented out switch statements with orphaned case statements
      {
        pattern: /\/\*[^*]*switch\s*\([^)]*\)\s*\{[^*]*\*\/\s*\n\s*case\s+/g,
        replacement: (match: string) => {
          // Extract the switch condition from the comment
          const switchMatch = match.match(/switch\s*\(([^)]*)\)/);
          if (switchMatch) {
            const condition = switchMatch[1];
            return `switch (${condition}) {\n      case `;
          }
          return match;
        }
      },
      // Fix commented out if statements with orphaned else statements
      {
        pattern: /\/\*[^*]*if\s*\([^)]*\)\s*\{[^*]*\*\/\s*\n\s*else\s+/g,
        replacement: (match: string) => {
          // Extract the if condition from the comment
          const ifMatch = match.match(/if\s*\(([^)]*)\)/);
          if (ifMatch) {
            const condition = ifMatch[1];
            return `if (${condition}) {\n      // if body\n    } else `;
          }
          return match;
        }
      },
      // Fix commented out function calls with orphaned parameters
      {
        pattern: /\/\*[^*]*(\w+)\s*\([^*]*\*\/\s*\n\s*([^;]+);/g,
        replacement: (match: string) => {
          // Extract the function name from the comment
          const funcMatch = match.match(/(\w+)\s*\(/);
          if (funcMatch) {
            const funcName = funcMatch[1];
            return `${funcName}($2);`;
          }
          return match;
        }
      }
    ];
    
    for (const pattern of patterns) {
      const before = newContent;
      if (typeof pattern.replacement === 'function') {
        newContent = newContent.replace(pattern.pattern, pattern.replacement);
      } else {
        newContent = newContent.replace(pattern.pattern, pattern.replacement);
      }
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
      
      // Fix orphaned case statements
      if (line.trim().startsWith('case ') && i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine.endsWith('*/')) {
          // This is an orphaned case, we need to create a proper switch
          const indent = line.match(/^(\s*)/)?.[1] || '';
          line = `${indent}// TODO: Add switch statement\n${line}`;
          modified = true;
        }
      }
      
      // Fix orphaned else statements
      if (line.trim().startsWith('else ') && i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine.endsWith('*/')) {
          // This is an orphaned else, we need to create a proper if
          const indent = line.match(/^(\s*)/)?.[1] || '';
          line = `${indent}// TODO: Add if statement\n${line}`;
          modified = true;
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
      console.log(`Fixed commented code in ${filePath}`);
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
  console.log('🔧 Starting commented code fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixCommentedCodeInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed commented code in ${fixedCount} files`);
  console.log('🎯 Commented code fixes complete!');
}

main().catch(console.error);